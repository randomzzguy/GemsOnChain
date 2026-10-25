/** A closed brilliant-cut solid, with separate face normals for crisp reflections. */
export function brilliantVertices(): number[] {
  type V = [number, number, number];
  const vertices: number[] = [];
  const ring = (n: number, r: number, y: number, offset = 0): V[] =>
    Array.from({ length: n }, (_, i) => [
      Math.cos((i / n) * Math.PI * 2 + offset) * r,
      y,
      Math.sin((i / n) * Math.PI * 2 + offset) * r,
    ]);
  const face = (a: V, b: V, c: V) => {
    const u = b.map((n, i) => n - a[i]),
      v = c.map((n, i) => n - a[i]);
    const normal = [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0],
    ];
    const center = a.map((n, i) => (n + b[i] + c[i]) / 3 + (i === 1 ? 0.1 : 0));
    if (normal.reduce((s, n, i) => s + n * center[i], 0) < 0)
      vertices.push(...a, ...c, ...b);
    else vertices.push(...a, ...b, ...c);
  };
  const table = ring(8, 0.53, 0.65),
    upper = ring(16, 1, 0.15),
    lower = ring(16, 0.99, 0.09),
    pavilion = ring(8, 0.48, -0.62);
  for (let i = 0; i < 8; i++) {
    const j = (i + 1) % 8,
      k = i * 2,
      l = (k + 1) % 16,
      m = (k + 2) % 16;
    face([0, 0.65, 0], table[i], table[j]);
    face(table[i], upper[k], upper[l]);
    face(table[i], upper[l], table[j]);
    face(table[j], upper[l], upper[m]);
    face(lower[k], pavilion[i], lower[l]);
    face(lower[l], pavilion[i], pavilion[j]);
    face(lower[l], pavilion[j], lower[m]);
    face(pavilion[i], [0, -1.22, 0], pavilion[j]);
  }
  for (let i = 0; i < 16; i++) {
    const j = (i + 1) % 16;
    face(upper[i], lower[i], upper[j]);
    face(upper[j], lower[i], lower[j]);
  }
  return vertices;
}
