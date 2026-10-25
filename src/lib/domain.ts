import { z } from "zod";
const nonnegative = z.number().finite().nonnegative();
const windows = z.object({
  m5: nonnegative.optional(),
  h1: nonnegative.optional(),
  h6: nonnegative.optional(),
  h24: nonnegative.optional(),
});
export const pairSchema = z.object({
  chainId: z.string(),
  dexId: z.string(),
  url: z.string(),
  pairAddress: z.string(),
  baseToken: z.object({
    address: z.string(),
    name: z.string(),
    symbol: z.string(),
  }),
  quoteToken: z.object({
    address: z.string(),
    name: z.string(),
    symbol: z.string(),
  }),
  priceUsd: z
    .string()
    .refine((v) => Number.isFinite(Number(v)) && Number(v) >= 0)
    .optional(),
  volume: windows.optional(),
  priceChange: z
    .object({
      m5: z.number().finite().optional(),
      h1: z.number().finite().optional(),
      h6: z.number().finite().optional(),
      h24: z.number().finite().optional(),
    })
    .optional(),
  txns: z
    .record(z.string(), z.object({ buys: nonnegative, sells: nonnegative }))
    .optional(),
  liquidity: z.object({ usd: nonnegative.optional() }).optional(),
  fdv: nonnegative.nullish(),
  marketCap: nonnegative.nullish(),
  pairCreatedAt: nonnegative.optional(),
  info: z.object({ imageUrl: z.string().optional() }).optional(),
});
export type Pair = z.infer<typeof pairSchema>;
export const chains = ["solana", "ethereum", "robinhood"] as const;
export type Chain = (typeof chains)[number];
export const chainName = (chain: string) =>
  ({ solana: "Solana", ethereum: "Ethereum", robinhood: "Robinhood Chain" })[
    chain
  ] || chain;
export const normalize = (chain: string, address: string) =>
  chain === "solana" ? address : address.toLowerCase();
export const identity = (chain: string, address: string) =>
  `${chain}:${normalize(chain, address)}`;
export const tokenHref = (p: Pair) =>
  `/coin/${p.chainId}/${encodeURIComponent(p.baseToken.address)}`;
export const validAddress = (chain: string, address: string) =>
  chain === "solana"
    ? /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
    : /^0x[0-9a-fA-F]{40}$/.test(address);
export function representativePairs(pairs: Pair[]) {
  const map = new Map<string, Pair>();
  for (const p of pairs) {
    if (!["solana", "ethereum"].includes(p.chainId)) continue;
    const key = identity(p.chainId, p.baseToken.address),
      prev = map.get(key);
    if (!prev || (p.liquidity?.usd ?? 0) > (prev.liquidity?.usd ?? 0))
      map.set(key, p);
  }
  return [...map.values()];
}
export type Rules = {
  minLiquidity: number;
  minVolume: number;
  maxAgeDays: number;
};
export const defaultRules: Rules = {
  minLiquidity: 25000,
  minVolume: 10000,
  maxAgeDays: 30,
};
export function eligible(p: Pair, r: Rules) {
  return (
    Number(p.priceUsd) > 0 &&
    (p.liquidity?.usd ?? 0) >= r.minLiquidity &&
    (p.volume?.h24 ?? 0) >= r.minVolume &&
    !!p.txns?.h24
  );
}
export function score(p: Pair) {
  return (
    Math.log10(1 + (p.volume?.h24 ?? 0)) * 0.45 +
    Math.log10(1 + (p.txns?.h24?.buys ?? 0) + (p.txns?.h24?.sells ?? 0)) *
      0.35 +
    Math.log10(1 + (p.liquidity?.usd ?? 0)) * 0.2
  );
}
export function isGem(p: Pair, r: Rules, now = Date.now()) {
  const age = p.pairCreatedAt == null ? -1 : now - p.pairCreatedAt;
  return eligible(p, r) && age >= 0 && age <= r.maxAgeDays * 86400000;
}
export type CuratedCoin = {
  id: string;
  chain: string;
  address: string;
  name: string;
  symbol: string;
  logo_url: string | null;
  description: string;
  category: string;
  featured: boolean;
  priority: number;
  active: boolean;
};
export type CuratedPost = {
  id: string;
  kol_name: string;
  handle: string;
  url: string;
  summary: string;
  published_at: string | null;
  token_ids: string[];
};
