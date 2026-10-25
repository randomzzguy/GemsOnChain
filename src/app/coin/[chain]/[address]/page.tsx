import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ChartNoAxesCombined,
  MessageCircle,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/brand";
import { TokenAvatar } from "@/components/token-avatar";
import { CopyAddress, Pressure } from "@/components/token-interactions";
import { tokenMarket } from "@/lib/market";
import { getCuration } from "@/lib/curation";
import {
  chainName,
  chains,
  identity,
  validAddress,
  type Chain,
} from "@/lib/domain";
import { money, percent, safeUrl } from "@/lib/utils";
export const dynamic = "force-dynamic";
export default async function CoinPage({
  params,
}: {
  params: Promise<{ chain: string; address: string }>;
}) {
  const { chain, address } = await params;
  if (!chains.includes(chain as Chain) || !validAddress(chain, address))
    notFound();
  const [market, curation] = await Promise.all([
    chain === "robinhood"
      ? Promise.resolve({
          pairs: [],
          updatedAt: null,
          stale: false,
          error: "Robinhood Chain market coverage is not connected.",
        })
      : tokenMarket(chain, address),
    getCuration(),
  ]);
  const p = market.pairs.find(
    (p) =>
      identity(p.chainId, p.baseToken.address) === identity(chain, address),
  );
  const curated = curation.coins.find(
    (c) => identity(c.chain, c.address) === identity(chain, address),
  );
  const posts = curated
    ? curation.posts.filter((p) => p.token_ids.includes(curated.id))
    : [];
  const symbol = p?.baseToken.symbol || curated?.symbol || "?",
    name = p?.baseToken.name || curated?.name || "Token market unavailable";
  return (
    <>
      <Header />
      <main className="main">
        <Link href="/" className="breadcrumb">
          <ArrowLeft size={13} /> Back to discoveries
        </Link>
        <div className="detail-header">
          <div className="token-heading">
            <TokenAvatar
              src={p?.info?.imageUrl || curated?.logo_url}
              symbol={symbol}
            />
            <div>
              <h1>
                {name} <small>{symbol !== "?" ? symbol : ""}</small>
              </h1>
              <p>
                {chainName(chain)}{" "}
                {p &&
                  `· ${p.dexId} · ${p.baseToken.symbol} / ${p.quoteToken.symbol}`}
              </p>
            </div>
          </div>
          <div className="detail-price">
            <strong>{money(p?.priceUsd)}</strong>
            <span
              className={
                (p?.priceChange?.h24 ?? 0) < 0 ? "negative" : "positive"
              }
            >
              {percent(p?.priceChange?.h24)}{" "}
              <span className="muted">past 24h</span>
            </span>
          </div>
        </div>
        <div className="address-bar">
          <span>Contract</span>
          <code>{address}</code>
          <CopyAddress address={address} />
          {safeUrl(p?.url) && (
            <a href={safeUrl(p?.url)} target="_blank" rel="noopener noreferrer">
              View market on DexScreener <ArrowUpRight size={13} />
            </a>
          )}
        </div>
        {market.error && <div className="notice">{market.error}</div>}
        {market.stale && (
          <div className="notice">
            This is a cached snapshot. Live data could not be refreshed.
          </div>
        )}
        {!p && (
          <div className="notice">
            No supported base-token market was found for this address. Verify
            the contract and network. Curated information, when available,
            appears below.
          </div>
        )}
        {curated?.description && <p className="muted">{curated.description}</p>}
        <div className="metrics-grid">
          {[
            {
              label: "Volume · 24h",
              value: money(p?.volume?.h24, true),
              note: "Selected pair · USD",
            },
            {
              label: "Liquidity",
              value: money(p?.liquidity?.usd, true),
              note: "Selected pair · USD",
            },
            {
              label: "Market capitalization",
              value: money(p?.marketCap, true),
              note: "Provider reported · USD",
            },
            {
              label: "Fully diluted valuation",
              value: money(p?.fdv, true),
              note: "Provider reported · USD",
            },
          ].map((m) => (
            <div className="panel metric" key={m.label}>
              <span>{m.label}</span>
              <strong>{m.value}</strong>
              <small>{m.note}</small>
            </div>
          ))}
        </div>
        <div className="detail-grid">
          <div>
            {p && <Pressure pair={p} />}
            <section className="panel detail-card">
              <h2>Price perspective</h2>
              <p>Changes reported for this market, in USD.</p>
              <div className="change-grid">
                {(["m5", "h1", "h6", "h24"] as const).map((w, i) => (
                  <div key={w}>
                    <span>
                      {["5 minutes", "1 hour", "6 hours", "24 hours"][i]}
                    </span>
                    <strong
                      className={
                        (p?.priceChange?.[w] ?? 0) < 0 ? "negative" : "positive"
                      }
                    >
                      {percent(p?.priceChange?.[w])}
                    </strong>
                  </div>
                ))}
              </div>
              <div className="chart-empty">
                <ChartNoAxesCombined size={25} />
                <h3>History needs a little more context.</h3>
                <p>
                  Historical candles are not available from our current API.
                  Open the original market to explore its chart.
                </p>
                {safeUrl(p?.url) && (
                  <a
                    className="button button-outline"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={safeUrl(p?.url)}
                  >
                    Open live market <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            </section>
            <section className="panel detail-card">
              <h2>Know what you’re looking at</h2>
              <p>Research signals, with their limitations in view.</p>
              <div className="insights">
                <div>
                  <span>Pair created</span>
                  <strong>
                    {p?.pairCreatedAt
                      ? new Date(p.pairCreatedAt).toISOString().slice(0, 10) +
                        " (UTC)"
                      : "Unavailable"}
                  </strong>
                </div>
                <div>
                  <span>Holder concentration</span>
                  <strong>Not provided</strong>
                </div>
                <div>
                  <span>Contract risk assessment</span>
                  <strong>Not integrated</strong>
                </div>
                <div>
                  <span>Liquidity signal</span>
                  <strong>
                    {p?.liquidity?.usd == null
                      ? "Unavailable"
                      : p.liquidity.usd < 25000
                        ? "Low liquidity — elevated execution risk"
                        : "Liquidity present; not a safety assessment"}
                  </strong>
                </div>
                <div>
                  <span>Pair address</span>
                  <strong style={{ overflowWrap: "anywhere", maxWidth: "65%" }}>
                    {p?.pairAddress || "Unavailable"}
                  </strong>
                </div>
              </div>
              <p className="fine-print" style={{ marginTop: 20 }}>
                The highest-liquidity available base-token pair is selected.
                Metrics describe that pair, not the whole token market. Holder
                analysis requires a separate indexer.
              </p>
            </section>
          </div>
          <aside>
            <section className="panel detail-card">
              <div className="card-heading">
                <div>
                  <h2>Voices & perspectives</h2>
                  <p>Human-curated social context.</p>
                </div>
                <MessageCircle size={20} color="#ba8fa6" />
              </div>
              <div className="social-timeline">
                {posts.length ? (
                  posts.map((post) => (
                    <article className="social-post" key={post.id}>
                      <strong>{post.kol_name}</strong>
                      <span>
                        {post.handle}{" "}
                        {post.published_at &&
                          `· ${new Date(post.published_at).toISOString().slice(0, 10)}`}
                      </span>
                      <p>{post.summary}</p>
                      {safeUrl(post.url) && (
                        <a
                          href={safeUrl(post.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Read original post <ArrowUpRight size={13} />
                        </a>
                      )}
                    </article>
                  ))
                ) : (
                  <div className="empty">
                    <MessageCircle size={25} />
                    <h3>Room for a new perspective.</h3>
                    <p>
                      {curation.status === "error"
                        ? "Curated posts are temporarily unavailable."
                        : "No curated posts for this token yet. Check back as our collection grows."}
                    </p>
                  </div>
                )}
              </div>
              <p className="fine-print">
                Selected for context, not endorsement. Social posts may contain
                opinions or paid promotions.
              </p>
            </section>
            <section className="panel detail-card">
              <h2>Source notes</h2>
              <p>
                Market data: DexScreener.
                <br />
                {market.updatedAt
                  ? `Fetched ${new Date(market.updatedAt).toISOString().replace("T", " ").slice(0, 19)} UTC.`
                  : "No market snapshot available."}
                <br />
                Data can lag and is not independently audited.
              </p>
              <Link href="/methodology" className="breadcrumb">
                Explore our methodology <ArrowUpRight size={13} />
              </Link>
            </section>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
