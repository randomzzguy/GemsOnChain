"use client";
import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { login, saveCoin, savePost, deleteRecord } from "@/app/admin/actions";
import { chainName, type CuratedCoin, type CuratedPost } from "@/lib/domain";
export function LoginForm() {
  const [state, action, pending] = useActionState(login, { message: "" });
  return (
    <form className="panel admin-form login-panel" action={action}>
      <label>
        Email
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={256}
        />
      </label>
      <p className="form-message" role="status">
        {state.message}
      </p>
      <Button disabled={pending}>
        {pending ? "Signing in…" : "Sign in to studio"}
      </Button>
    </form>
  );
}
export function AdminEditor({
  coins,
  posts,
}: {
  coins: CuratedCoin[];
  posts: CuratedPost[];
}) {
  const [coin, setCoin] = useState<CuratedCoin | null>(null),
    [post, setPost] = useState<CuratedPost | null>(null),
    [message, setMessage] = useState(""),
    [deleting, startDelete] = useTransition();
  function remove(kind: "coin" | "post", id: string) {
    if (
      !confirm(
        "Delete this curated entry? Coin deletion also removes its post associations.",
      )
    )
      return;
    startDelete(async () => {
      const result = await deleteRecord(kind, id);
      setMessage(result.message);
      if (result.success) {
        if (kind === "coin" && coin?.id === id) setCoin(null);
        if (kind === "post" && post?.id === id) setPost(null);
      }
    });
  }
  return (
    <>
      <p className="form-message" role="status">
        {message}
      </p>
      <div className="admin-layout">
        <div>
          <CoinForm
            key={coin?.id || "new"}
            coin={coin}
            cancel={() => setCoin(null)}
          />
          <section className="panel admin-records">
            <h2>Curated coins · {coins.length}</h2>
            {coins.map((c) => (
              <div className="admin-record" key={c.id}>
                <div>
                  <strong>
                    {c.name} · {c.symbol}
                  </strong>
                  <span>
                    {chainName(c.chain)} · {c.active ? "Published" : "Inactive"}{" "}
                    · {c.category}
                  </span>
                </div>
                <div className="admin-record-actions">
                  <Link href={`/coin/${c.chain}/${c.address}`}>Preview</Link>
                  <button onClick={() => setCoin(c)}>Edit</button>
                  <button
                    disabled={deleting}
                    onClick={() => remove("coin", c.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {!coins.length && (
              <div className="empty">
                <h3>Your first curator pick belongs here.</h3>
                <p>Add a verified contract address using the form above.</p>
              </div>
            )}
          </section>
        </div>
        <div>
          <PostForm
            key={post?.id || "new"}
            post={post}
            coins={coins}
            cancel={() => setPost(null)}
          />
          <section className="panel admin-records">
            <h2>Curated posts · {posts.length}</h2>
            {posts.map((p) => (
              <div className="admin-record" key={p.id}>
                <div>
                  <strong>{p.kol_name}</strong>
                  <span>
                    {p.summary.slice(0, 70)}
                    {p.summary.length > 70 ? "…" : ""}
                  </span>
                </div>
                <div className="admin-record-actions">
                  <button onClick={() => setPost(p)}>Edit</button>
                  <button
                    disabled={deleting}
                    onClick={() => remove("post", p.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {!posts.length && (
              <div className="empty">
                <h3>Add context to the conversation.</h3>
                <p>Link an original post to one or more curated tokens.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
function CoinForm({
  coin,
  cancel,
}: {
  coin: CuratedCoin | null;
  cancel: () => void;
}) {
  const [state, action, pending] = useActionState(saveCoin, { message: "" });
  return (
    <form action={action} className="panel admin-form">
      <h2>{coin ? "Edit curator pick" : "Add a curator pick"}</h2>
      <input type="hidden" name="id" value={coin?.id || ""} />
      <div className="form-grid">
        <label>
          Network
          <select name="chain" defaultValue={coin?.chain || "solana"}>
            <option value="solana">Solana</option>
            <option value="ethereum">Ethereum</option>
            <option value="robinhood">
              Robinhood Chain (market unavailable)
            </option>
          </select>
        </label>
        <label>
          Category
          <select name="category" defaultValue={coin?.category || "cult"}>
            <option value="cult">Cult coins</option>
            <option value="research">Research</option>
          </select>
        </label>
      </div>
      <label>
        Contract address
        <input
          name="address"
          required
          maxLength={100}
          defaultValue={coin?.address}
          placeholder="Verify the full address and network"
        />
      </label>
      <div className="form-grid">
        <label>
          Token name
          <input
            name="name"
            required
            maxLength={100}
            defaultValue={coin?.name}
          />
        </label>
        <label>
          Symbol
          <input
            name="symbol"
            required
            maxLength={30}
            defaultValue={coin?.symbol}
          />
        </label>
      </div>
      <label>
        Logo URL (optional, HTTPS)
        <input
          name="logo_url"
          type="url"
          defaultValue={coin?.logo_url || ""}
          placeholder="https://cdn.dexscreener.com/…"
        />
      </label>
      <p className="muted">
        <small>
          Only DexScreener CDN images are rendered; other hosts use a letter
          avatar.
        </small>
      </p>
      <label>
        Editorial description
        <textarea
          name="description"
          maxLength={1000}
          defaultValue={coin?.description}
        />
      </label>
      <label>
        Display priority (lower appears first)
        <input
          type="number"
          name="priority"
          min={0}
          max={10000}
          defaultValue={coin?.priority || 0}
        />
      </label>
      <label>
        <input
          type="checkbox"
          name="featured"
          defaultChecked={coin?.featured}
        />
        Featured pick
      </label>
      <label>
        <input
          type="checkbox"
          name="active"
          defaultChecked={coin?.active ?? true}
        />
        Published / active
      </label>
      <p className="form-message" role="status">
        {state.message}
      </p>
      <div className="form-actions">
        <Button disabled={pending}>{pending ? "Saving…" : "Save coin"}</Button>
        {coin && (
          <Button type="button" variant="outline" onClick={cancel}>
            New coin
          </Button>
        )}
      </div>
    </form>
  );
}
function PostForm({
  post,
  coins,
  cancel,
}: {
  post: CuratedPost | null;
  coins: CuratedCoin[];
  cancel: () => void;
}) {
  const [state, action, pending] = useActionState(savePost, { message: "" });
  return (
    <form action={action} className="panel admin-form">
      <h2>{post ? "Edit social context" : "Add social context"}</h2>
      <input type="hidden" name="id" value={post?.id || ""} />
      <div className="form-grid">
        <label>
          KOL display name
          <input
            name="kol_name"
            required
            maxLength={100}
            defaultValue={post?.kol_name}
          />
        </label>
        <label>
          Handle (optional)
          <input
            name="handle"
            maxLength={100}
            defaultValue={post?.handle}
            placeholder="@handle"
          />
        </label>
      </div>
      <label>
        Original post URL
        <input
          name="url"
          type="url"
          required
          defaultValue={post?.url}
          placeholder="https://x.com/…"
        />
      </label>
      <label>
        Post text or editorial summary
        <textarea
          name="summary"
          required
          maxLength={5000}
          defaultValue={post?.summary}
        />
      </label>
      <label>
        Publication date (UTC, optional)
        <input
          name="published_at"
          type="datetime-local"
          defaultValue={
            post?.published_at
              ? new Date(post.published_at).toISOString().slice(0, 16)
              : ""
          }
        />
      </label>
      <fieldset>
        <legend>Associated tokens · choose at least one</legend>
        {coins.map((c) => (
          <label key={c.id}>
            <input
              type="checkbox"
              name="token_ids"
              value={c.id}
              defaultChecked={post?.token_ids.includes(c.id)}
            />
            {c.name} · {chainName(c.chain)}
          </label>
        ))}
        {!coins.length && (
          <p className="muted">Add a coin before publishing a post.</p>
        )}
      </fieldset>
      <p className="form-message" role="status">
        {state.message}
      </p>
      <div className="form-actions">
        <Button disabled={pending || !coins.length}>
          {pending ? "Saving…" : "Save post"}
        </Button>
        {post && (
          <Button type="button" variant="outline" onClick={cancel}>
            New post
          </Button>
        )}
      </div>
    </form>
  );
}
