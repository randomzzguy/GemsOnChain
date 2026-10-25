import { test } from "node:test";
import assert from "node:assert/strict";
import { requireAdmin } from "../src/lib/supabase";
test("admin guard fails closed when credentials are unavailable", async () => {
  const oldUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
    oldKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  try {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    await assert.rejects(requireAdmin, /not configured/);
  } finally {
    if (oldUrl !== undefined) process.env.NEXT_PUBLIC_SUPABASE_URL = oldUrl;
    if (oldKey !== undefined)
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = oldKey;
  }
});
