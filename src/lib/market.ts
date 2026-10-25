import { z } from "zod";
import {
  pairSchema,
  representativePairs,
  defaultRules,
  type Pair,
  type Rules,
} from "./domain";
type Entry = { value: unknown; at: number };
const cache = new Map<string, Entry>();
const pending = new Map<string, Promise<Entry>>();
let cooldown = 0;
export type MarketResult = {
  pairs: Pair[];
  updatedAt: number | null;
  stale: boolean;
  error: string | null;
};
async function request(path: string): Promise<Entry> {
  const prev = cache.get(path);
  if (prev && Date.now() - prev.at < 60000) return prev;
  if (pending.has(path)) return pending.get(path)!;
  const promise = (async () => {
    if (Date.now() < cooldown)
      throw new Error("Provider rate limit; please try again shortly.");
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(`https://api.dexscreener.com${path}`, {
          signal: AbortSignal.timeout(8000),
          next: { revalidate: 60 },
        });
        if (response.status === 429) {
          cooldown =
            Date.now() +
            Math.min(120, Number(response.headers.get("retry-after")) || 60) *
              1000;
          throw new Error("Provider rate limit; please try again shortly.");
        }
        if (!response.ok)
          throw new Error(`Market provider returned ${response.status}.`);
        const entry = { value: await response.json(), at: Date.now() };
        if (cache.size >= 200) cache.delete(cache.keys().next().value!);
        cache.set(path, entry);
        return entry;
      } catch (error) {
        if (attempt || Date.now() < cooldown) throw error;
        await new Promise((r) => setTimeout(r, 350));
      }
    }
    throw new Error("Market provider unavailable.");
  })()
    .catch((error) => {
      if (prev && Date.now() - prev.at < 900000) return prev;
      throw error;
    })
    .finally(() => pending.delete(path));
  pending.set(path, promise);
  return promise;
}
function parsePairs(value: unknown): Pair[] {
  const list = Array.isArray(value)
    ? value
    : value && typeof value === "object" && "pairs" in value
      ? value.pairs
      : null;
  if (list === null) return [];
  if (!Array.isArray(list)) throw new Error("Unexpected market response.");
  const pairs = list.flatMap((item) => {
    const p = pairSchema.safeParse(item);
    return p.success ? [p.data] : [];
  });
  if (list.length && !pairs.length)
    throw new Error("Market data could not be validated.");
  return pairs;
}
async function collect(paths: string[]): Promise<MarketResult> {
  const results = await Promise.allSettled(
    paths.map(async (path) => {
      const e = await request(path);
      return { pairs: parsePairs(e.value), at: e.at };
    }),
  );
  const valid = results.flatMap((r) =>
    r.status === "fulfilled" ? [r.value] : [],
  );
  const at = valid.length ? Math.min(...valid.map((v) => v.at)) : null;
  return {
    pairs: representativePairs(valid.flatMap((v) => v.pairs)),
    updatedAt: at,
    stale: !!at && Date.now() - at > 90000,
    error: results.some((r) => r.status === "rejected")
      ? "Some market sources are unavailable. Available results may be incomplete."
      : null,
  };
}
export function rules(): Rules {
  const positive = (v: string | undefined, fallback: number) =>
    Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : fallback;
  return {
    minLiquidity: positive(
      process.env.DISCOVERY_MIN_LIQUIDITY,
      defaultRules.minLiquidity,
    ),
    minVolume: positive(
      process.env.DISCOVERY_MIN_VOLUME,
      defaultRules.minVolume,
    ),
    maxAgeDays: positive(
      process.env.DISCOVERY_MAX_AGE_DAYS,
      defaultRules.maxAgeDays,
    ),
  };
}
// Verified chain + address anchors broaden the profile-based discovery sample.
const anchors: Record<string, string[]> = {
  solana: [
    "So11111111111111111111111111111111111111112",
    "DezXAZ8z7PnrnRJjz3wXBoRgixCaZWZ4b7bXM4L8pK1",
    "EKpQGSJtjMFqKZ9KQanSqYXRcF8faB97p9aJkVhHhQZ",
  ],
  ethereum: [
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
    "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
  ],
};
export async function discovery(
  extra: { chain: string; address: string }[] = [],
): Promise<MarketResult> {
  const addresses = {
    solana: new Set(anchors.solana),
    ethereum: new Set(anchors.ethereum),
  };
  let profileError = false;
  let profileStale = false;
  try {
    const e = await request("/token-profiles/latest/v1");
    profileStale = Date.now() - e.at > 90000;
    const profiles = z
      .array(z.object({ chainId: z.string(), tokenAddress: z.string() }))
      .parse(e.value);
    for (const p of profiles)
      if (p.chainId === "solana" || p.chainId === "ethereum")
        addresses[p.chainId].add(p.tokenAddress);
  } catch {
    profileError = true;
  }
  for (const p of extra)
    if (p.chain === "solana" || p.chain === "ethereum")
      addresses[p.chain].add(p.address);
  const paths = Object.entries(addresses).flatMap(([chain, set]) => {
    const a = [...set];
    return Array.from(
      { length: Math.ceil(a.length / 30) },
      (_, i) =>
        `/tokens/v1/${chain}/${a
          .slice(i * 30, i * 30 + 30)
          .map(encodeURIComponent)
          .join(",")}`,
    );
  });
  const result = await collect(paths);
  return {
    ...result,
    stale: result.stale || profileStale,
    error:
      result.error ||
      (profileError
        ? "Latest token profiles are unavailable. Showing the available discovery sample."
        : null),
  };
}
export const searchMarket = (query: string) =>
  collect([`/latest/dex/search?q=${encodeURIComponent(query)}`]);
export const tokenMarket = (chain: string, address: string) =>
  collect([`/token-pairs/v1/${chain}/${encodeURIComponent(address)}`]);
