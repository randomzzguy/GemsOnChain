import { Header } from "@/components/header";
import { Footer } from "@/components/brand";
import { AdminEditor, LoginForm } from "@/components/admin-editor";
import { configured, requireAdmin } from "@/lib/supabase";
import { logout } from "./actions";
import { Button } from "@/components/ui/button";
import type { CuratedCoin, CuratedPost } from "@/lib/domain";
export const dynamic = "force-dynamic";
export default async function Admin() {
  let db = null;
  try {
    db = await requireAdmin();
  } catch {}
  if (!configured())
    return (
      <>
        <Header />
        <main className="main prose-page">
          <div className="eyebrow">CURATOR STUDIO</div>
          <h1>Your perspective belongs here.</h1>
          <p className="intro">
            Connect your Supabase project to start building a human-curated
            collection.
          </p>
          <section className="panel">
            <h2>One-time setup</h2>
            <p>
              Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in
              your local environment. Apply the SQL migration, create an
              administrator in Supabase Auth, then add that user’s ID to the
              admin_users table. Restart the app to sign in.
            </p>
            <p>
              The project README contains the complete setup and deployment
              instructions. Public discovery already works without an account.
            </p>
          </section>
        </main>
        <Footer />
      </>
    );
  if (!db)
    return (
      <>
        <Header />
        <main className="main">
          <div className="auth-heading">
            <div className="eyebrow" style={{ justifyContent: "center" }}>
              CURATOR STUDIO
            </div>
            <h1 style={{ marginTop: 18 }}>A human point of view.</h1>
            <p>Sign in with your administrator account.</p>
          </div>
          <LoginForm />
        </main>
        <Footer />
      </>
    );
  const [c, p] = await Promise.all([
    db.from("curated_coins").select("*").order("priority"),
    db
      .from("curated_posts")
      .select("*,post_tokens(token_id)")
      .order("created_at", { ascending: false }),
  ]);
  const posts = (p.data || []).map((p) => ({
    ...p,
    token_ids: (p.post_tokens as { token_id: string }[]).map((t) => t.token_id),
  })) as CuratedPost[];
  return (
    <>
      <Header />
      <main className="main admin-main">
        <div className="admin-top">
          <div>
            <div className="eyebrow">CURATOR STUDIO</div>
            <h1 style={{ fontSize: 32, marginTop: 10 }}>
              Give discovery some context.
            </h1>
          </div>
          <form action={logout}>
            <Button variant="outline">Sign out</Button>
          </form>
        </div>
        {(c.error || p.error) && (
          <div className="notice">
            Could not load curated content. Verify the migration and database
            permissions before editing.
          </div>
        )}
        <AdminEditor coins={(c.data || []) as CuratedCoin[]} posts={posts} />
      </main>
      <Footer />
    </>
  );
}
