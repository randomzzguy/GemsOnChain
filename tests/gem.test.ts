import { test } from "node:test";
import assert from "node:assert/strict";
import { brilliantVertices } from "../src/lib/gem-geometry";
test("brilliant cut is a closed solid with outward-facing nondegenerate facets", () => {
  const v = brilliantVertices(),
    edges = new Map<string, number>();
  assert.equal(v.length % 9, 0);
  assert.ok(v.length / 9 >= 80);
  const key = (p: number[]) => p.map((n) => n.toFixed(6)).join(",");
  for (let i = 0; i < v.length; i += 9) {
    const a = v.slice(i, i + 3),
      b = v.slice(i + 3, i + 6),
      c = v.slice(i + 6, i + 9),
      u = b.map((n, j) => n - a[j]),
      w = c.map((n, j) => n - a[j]);
    const normal = [
      u[1] * w[2] - u[2] * w[1],
      u[2] * w[0] - u[0] * w[2],
      u[0] * w[1] - u[1] * w[0],
    ];
    assert.ok(Math.hypot(...normal) > 1e-6);
    const center = a.map((n, j) => (n + b[j] + c[j]) / 3 + (j === 1 ? 0.1 : 0));
    assert.ok(normal.reduce((s, n, j) => s + n * center[j], 0) > 0);
    for (const [p, q] of [
      [a, b],
      [b, c],
      [c, a],
    ]) {
      const edge = [key(p), key(q)].sort().join("|");
      edges.set(edge, (edges.get(edge) || 0) + 1);
    }
  }
  for (const count of edges.values())
    assert.equal(count, 2, "Each edge must be shared by exactly two faces");
});
