"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, supabase } from "@/lib/supabase";
import { coinInput, postInput } from "@/lib/admin-validation";
export type ActionState = { message: string; success?: boolean };
function errorMessage(error: unknown) {
  return error instanceof z.ZodError
    ? error.issues[0].message
    : error instanceof Error
      ? error.message
      : "The operation could not be completed.";
}
export async function login(
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  const db = await supabase();
  if (!db) return { message: "Set the Supabase environment variables first." };
  const email = String(form.get("email") || ""),
    password = String(form.get("password") || "");
  if (email.length > 254 || password.length > 256)
    return { message: "Invalid credentials." };
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error)
    return { message: "Unable to sign in. Check your email and password." };
  try {
    await requireAdmin();
  } catch {
    await db.auth.signOut();
    return { message: "This account does not have administrator access." };
  }
  redirect("/admin");
}
export async function logout() {
  const db = await supabase();
  await db?.auth.signOut();
  redirect("/admin");
}
export async function saveCoin(
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  try {
    const db = await requireAdmin();
    const value = coinInput.parse({
      ...Object.fromEntries(form),
      featured: form.get("featured") === "on",
      active: form.get("active") === "on",
    });
    const { id, ...rest } = value;
    const payload = { ...rest, logo_url: rest.logo_url || null };
    const result = id
      ? await db
          .from("curated_coins")
          .update(payload)
          .eq("id", id)
          .select("id")
          .single()
      : await db.from("curated_coins").insert(payload).select("id").single();
    if (result.error)
      throw new Error(
        "Could not save this coin. Check for a duplicate chain and address, or database setup.",
      );
    revalidatePath("/");
    revalidatePath("/admin");
    return {
      message: "Coin saved. Public pages will reflect this change.",
      success: true,
    };
  } catch (e) {
    return { message: errorMessage(e) };
  }
}
export async function savePost(
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  try {
    const db = await requireAdmin();
    const v = postInput.parse({
      ...Object.fromEntries(form),
      token_ids: form.getAll("token_ids"),
    });
    const { error } = await db.rpc("save_curated_post", {
      p_id: v.id || null,
      p_kol_name: v.kol_name,
      p_handle: v.handle,
      p_url: v.url,
      p_summary: v.summary,
      p_published_at: v.published_at
        ? new Date(v.published_at + "Z").toISOString()
        : null,
      p_token_ids: v.token_ids,
    });
    if (error)
      throw new Error(
        "Could not save the post and its token associations. Check database setup.",
      );
    revalidatePath("/", "layout");
    return { message: "Post and token associations saved.", success: true };
  } catch (e) {
    return { message: errorMessage(e) };
  }
}
export async function deleteRecord(
  kind: "coin" | "post",
  id: string,
): Promise<ActionState> {
  try {
    const db = await requireAdmin();
    z.enum(["coin", "post"]).parse(kind);
    z.string().uuid().parse(id);
    const { error } = await db
      .from(kind === "coin" ? "curated_coins" : "curated_posts")
      .delete()
      .eq("id", id);
    if (error) throw new Error("Deletion failed. Please try again.");
    revalidatePath("/", "layout");
    return { message: "Entry deleted.", success: true };
  } catch (e) {
    return { message: errorMessage(e) };
  }
}
