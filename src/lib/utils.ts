import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export function money(
  value: number | string | null | undefined,
  compact = false,
) {
  if (value == null || value === "" || !Number.isFinite(Number(value)))
    return "—";
  const n = Number(value);
  if (n > 0 && n < 0.000001) return "$" + n.toExponential(3);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 2 : n < 1 ? 8 : 2,
  }).format(n);
}
export const number = (n?: number | null) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(n);
export const percent = (n?: number | null) =>
  n == null ? "—" : `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
export const safeUrl = (s?: string | null) => {
  try {
    const u = new URL(s || "");
    return u.protocol === "https:" ? u.href : undefined;
  } catch {
    return undefined;
  }
};
