import { z } from "zod";
import { validAddress, normalize } from "./domain";
const https = z
  .string()
  .url()
  .refine((v) => v.startsWith("https://"), "Use an HTTPS URL.");
export const coinInput = z
  .object({
    id: z.union([z.literal(""), z.string().uuid()]),
    chain: z.enum(["solana", "ethereum", "robinhood"]),
    address: z.string().trim().max(100),
    name: z.string().trim().min(1).max(100),
    symbol: z.string().trim().min(1).max(30),
    logo_url: z.union([z.literal(""), https]),
    description: z.string().trim().max(1000),
    category: z.enum(["cult", "research"]),
    featured: z.boolean(),
    priority: z.coerce.number().int().min(0).max(10000),
    active: z.boolean(),
  })
  .refine((v) => validAddress(v.chain, v.address), {
    message: "Invalid contract address for the selected chain.",
    path: ["address"],
  })
  .transform((v) => ({ ...v, address: normalize(v.chain, v.address) }));
export const postInput = z.object({
  id: z.union([z.literal(""), z.string().uuid()]),
  kol_name: z.string().trim().min(1).max(100),
  handle: z.string().trim().max(100),
  url: https,
  summary: z.string().trim().min(1).max(5000),
  published_at: z
    .string()
    .refine(
      (v) => v === "" || !Number.isNaN(Date.parse(v)),
      "Invalid publication date.",
    ),
  token_ids: z.array(z.string().uuid()).min(1).max(50),
});
