import { test } from "node:test";
import assert from "node:assert/strict";
import { searchMarket } from "../src/lib/market";
const fixture = {
  chainId: "ethereum",
  dexId: "test",
  url: "https://dexscreener.com/ethereum/test",
  pairAddress: "test",
  baseToken: { address: "0x123", name: "Test", symbol: "TEST" },
  quoteToken: { address: "0x456", name: "USD", symbol: "USD" },
  priceUsd: "1",
  volume: { h24: 12000 },
  liquidity: { usd: 30000 },
};
test("market requests deduplicate, retain bounded stale data, and degrade on malformed responses", async () => {
  const realFetch = globalThis.fetch,
    realNow = Date.now;
  let requests = 0;
  const start = realNow();
  try {
    globalThis.fetch = async () => {
      requests++;
      return new Response(JSON.stringify({ pairs: [fixture] }), {
        status: 200,
      });
    };
    const results = await Promise.all([
      searchMarket("dedup-test"),
      searchMarket("dedup-test"),
    ]);
    assert.equal(requests, 1);
    assert.equal(results[0].pairs.length, 1);
    assert.equal(results[1].error, null);
    Date.now = () => start + 120000;
    globalThis.fetch = async () => {
      throw new Error("offline");
    };
    const stale = await searchMarket("dedup-test");
    assert.equal(stale.pairs.length, 1);
    assert.equal(stale.stale, true);
    Date.now = () => start + 1000000;
    const expired = await searchMarket("dedup-test");
    assert.equal(expired.pairs.length, 0);
    assert.ok(expired.error);
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ pairs: "invalid" }), { status: 200 });
    const malformed = await searchMarket("invalid-schema");
    assert.equal(malformed.pairs.length, 0);
    assert.ok(malformed.error);
  } finally {
    globalThis.fetch = realFetch;
    Date.now = realNow;
  }
});
test("provider 429 activates cooldown without repeated upstream requests", async () => {
  const realFetch = globalThis.fetch;
  let requests = 0;
  try {
    globalThis.fetch = async () => {
      requests++;
      return new Response("", { status: 429, headers: { "retry-after": "1" } });
    };
    const a = await searchMarket("limited-a");
    const b = await searchMarket("limited-b");
    assert.ok(a.error);
    assert.ok(b.error);
    assert.equal(requests, 1);
  } finally {
    globalThis.fetch = realFetch;
  }
});
