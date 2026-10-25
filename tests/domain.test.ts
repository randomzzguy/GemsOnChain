import { test } from "node:test";
import assert from "node:assert/strict";
import {
  identity,
  representativePairs,
  defaultRules,
  eligible,
  isGem,
  pairSchema,
  type Pair,
} from "../src/lib/domain";
import { money, safeUrl } from "../src/lib/utils";
import { coinInput, postInput } from "../src/lib/admin-validation";
const pair: Pair = {
  chainId: "ethereum",
  dexId: "uniswap",
  url: "https://dexscreener.com/ethereum/pair",
  pairAddress: "pair",
  baseToken: { address: "0xAbc", name: "Test", symbol: "T" },
  quoteToken: { address: "q", name: "USD", symbol: "USD" },
  priceUsd: "1",
  liquidity: { usd: 30000 },
  volume: { h24: 20000 },
  txns: { h24: { buys: 50, sells: 20 } },
  pairCreatedAt: Date.now() - 86400000,
};
test("token identities preserve Solana case and normalize EVM case", () => {
  assert.notEqual(identity("solana", "Abc"), identity("solana", "abc"));
  assert.equal(identity("ethereum", "0xAbc"), identity("ethereum", "0xabc"));
  assert.notEqual(identity("solana", "ABC"), identity("ethereum", "ABC"));
});
test("duplicate pairs select liquidity leader without summing volume", () => {
  const result = representativePairs([
    pair,
    {
      ...pair,
      pairAddress: "second",
      baseToken: { ...pair.baseToken, address: "0xabc" },
      liquidity: { usd: 60000 },
      volume: { h24: 5000 },
    },
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].volume?.h24, 5000);
  assert.equal(result[0].pairAddress, "second");
});
test("gems require known, nonfuture pair age and quality metrics", () => {
  assert.ok(isGem(pair, defaultRules));
  assert.ok(!isGem({ ...pair, pairCreatedAt: undefined }, defaultRules));
  assert.ok(
    !isGem({ ...pair, pairCreatedAt: Date.now() + 60000 }, defaultRules),
  );
  assert.ok(!eligible({ ...pair, liquidity: { usd: 0 } }, defaultRules));
  assert.ok(!eligible({ ...pair, priceUsd: undefined }, defaultRules));
});
test("external schema rejects invalid numeric data without inventing missing metrics", () => {
  assert.ok(!pairSchema.safeParse({ ...pair, priceUsd: "NaN" }).success);
  assert.ok(!pairSchema.safeParse({ ...pair, volume: { h24: -1 } }).success);
  assert.equal(pairSchema.parse({ ...pair, txns: undefined }).txns, undefined);
});
test("formatting distinguishes missing data and zero, preserves tiny prices", () => {
  assert.equal(money(undefined), "—");
  assert.equal(money(0), "$0.00");
  assert.match(money(0.0000000001), /e-10/);
});
test("unsafe URLs and invalid curated identities are rejected", () => {
  assert.equal(safeUrl("javascript:alert(1)"), undefined);
  assert.equal(safeUrl("http://example.com"), undefined);
  assert.ok(
    !coinInput.safeParse({
      id: "",
      chain: "solana",
      address: "0x123",
      name: "Test",
      symbol: "T",
      logo_url: "",
      description: "",
      category: "cult",
      featured: false,
      priority: 0,
      active: true,
    }).success,
  );
  assert.ok(
    !postInput.safeParse({
      id: "",
      kol_name: "K",
      handle: "",
      url: "javascript:alert(1)",
      summary: "S",
      published_at: "",
      token_ids: [],
    }).success,
  );
});
