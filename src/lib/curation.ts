import { supabase } from "./supabase";
import type { CuratedCoin, CuratedPost } from "./domain";
export async function getCuration() {
  const db = await supabase();
  if (!db)
    return {
      coins: [] as CuratedCoin[],
      posts: [] as CuratedPost[],
      status: "unconfigured",
    };
  const [coins, posts] = await Promise.all([
    db.from("curated_coins").select("*").eq("active", true).order("priority"),
    db
      .from("curated_posts")
      .select("*, post_tokens(token_id)")
      .order("published_at", { ascending: false, nullsFirst: false }),
  ]);
  if (coins.error || posts.error)
    return {
      coins: [] as CuratedCoin[],
      posts: [] as CuratedPost[],
      status: "error",
    };
  return {
    coins: coins.data as CuratedCoin[],
    posts: posts.data.map((p) => ({
      ...p,
      token_ids: (p.post_tokens as { token_id: string }[]).map(
        (t) => t.token_id,
      ),
    })) as CuratedPost[],
    status: "ready",
  };
}
