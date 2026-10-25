"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Gem,
  Flame,
  Users,
  BarChart3,
  SlidersHorizontal,
  Radio,
  Info,
  RefreshCw,
} from "lucide-react";
import { Header } from "./header";
import { Footer } from "./brand";
import { CrystalStage } from "./crystal-stage";
import { DiscoveryPanel } from "./discovery-panel";
import { Hint, useExperience } from "./experience";
import { motion } from "motion/react";
import { TokenAvatar } from "./token-avatar";
import { Button } from "./ui/button";
import {
  chainName,
  eligible,
  identity,
  isGem,
  score,
  tokenHref,
  type Pair,
  type CuratedCoin,
  type Rules,
} from "@/lib/domain";
import { money, percent, number } from "@/lib/utils";
import type { MarketResult } from "@/lib/market";
const sections = [
  {
    id: "cult",
    title: "Top Cult Coins",
    sub: "Communities with a story to tell.",
    icon: Users,
    color: "purple",
    tag: "CURATOR PICKS",
  },
  {
    id: "trending",
    title: "Trending Coins",
    sub: "Where the market is paying attention.",
    icon: Flame,
    color: "orange",
    tag: "ON THE RADAR",
  },
  {
    id: "gems",
    title: "Potential Gems",
    sub: "Early signals. Worth a closer look.",
    icon: Gem,
    color: "pink",
    tag: "EARLY DISCOVERY",
  },
  {
    id: "volume",
    title: "Highest Volume",
    sub: "Follow the activity, not the noise.",
    icon: BarChart3,
    color: "blue",
    tag: "24H VOLUME",
  },
];
export function Discovery({
  market,
  coins,
  curationStatus,
  rules,
}: {
  market: MarketResult;
  coins: CuratedCoin[];
  curationStatus: string;
  rules: Rules;
}) {
  const { quiet } = useExperience();
  const [chain, setChain] = useState("all"),
    [active, setActive] = useState("all"),
    [expanded, setExpanded] = useState<string[]>([]),
    [sort, setSort] = useState("rank"),
    [time, setTime] = useState("");
  useEffect(() => {
    const category = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (sections.some((s) => s.id === id)) setActive(id);
    };
    window.addEventListener("gems:category", category);
    return () => window.removeEventListener("gems:category", category);
  }, []);
  useEffect(() => {
    setTime(
      market.updatedAt
        ? new Date(market.updatedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
    );
    const s = new URLSearchParams(location.search).get("section");
    if (s && sections.some((x) => x.id === s)) setActive(s);
  }, [market.updatedAt]);
  const pairs = market.pairs.filter(
      (p) => chain === "all" || p.chainId === chain,
    ),
    quality = pairs.filter((p) => eligible(p, rules));
  const cult = coins
    .filter(
      (c) => c.category === "cult" && (chain === "all" || c.chain === chain),
    )
    .sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) || a.priority - b.priority,
    );
  const ranked: Record<string, Pair[]> = {
    trending: [...quality].sort((a, b) => score(b) - score(a)),
    gems: quality
      .filter((p) => isGem(p, rules, market.updatedAt ?? 0))
      .sort((a, b) => score(b) - score(a)),
    volume: [...quality].sort(
      (a, b) => (b.volume?.h24 ?? 0) - (a.volume?.h24 ?? 0),
    ),
  };
  const totalVolume = quality.reduce((n, p) => n + (p.volume?.h24 ?? 0), 0),
    totalTx = quality.reduce(
      (n, p) => n + (p.txns?.h24?.buys ?? 0) + (p.txns?.h24?.sells ?? 0),
      0,
    );
  const sorted = (list: Pair[]) =>
    sort === "rank"
      ? list
      : [...list].sort((a, b) =>
          sort === "liquidity"
            ? (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0)
            : sort === "change"
              ? (b.priceChange?.h24 ?? -Infinity) -
                (a.priceChange?.h24 ?? -Infinity)
              : (b.volume?.h24 ?? 0) - (a.volume?.h24 ?? 0),
        );
  return (
    <>
      <Header chain={chain} onChain={setChain} />
      <main className="main discovery-main">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span /> AN OPEN INVITATION TO DISCOVER
            </div>
            <h1>
              Find the signal.
              <br />
              <span>
                Discover
                <br className="hero-line" /> the gems.
              </span>
              <span className="hero-asterisk" aria-hidden="true">
                ✳
              </span>
            </h1>
            <p>
              Great discoveries start with a little curiosity.
              <br className="desktop-break" /> Explore real market activity,
              devoted communities,
              <br className="desktop-break" /> and the tokens worth a closer
              look.
            </p>
            <div className="hero-actions">
              <Button asChild>
                <a href="#discovery">
                  Start exploring <ArrowUpRight size={17} />
                </a>
              </Button>
              <Link href="/methodology">
                A more thoughtful way to discover <ArrowRight size={15} />
              </Link>
            </div>
            <div className="hero-note">
              <span className="mini-chain">≋</span>
              <span className="mini-chain eth">◆</span>
              <span>Across Solana & Ethereum</span>
              <i />
              No wallet needed
            </div>
          </div>
          <CrystalStage pair={ranked.trending[0]} />
        </section>
        <div className="hero-baseline">
          <span>FOR THE CURIOUS. THE EARLY. THE INDEPENDENT.</span>
          <a href="#discovery">
            SCROLL TO EXPLORE <ArrowRight size={14} />
          </a>
          <span>EST. 2026 / ONCHAIN & OPEN-MINDED</span>
        </div>
        <section
          className="market-strip"
          aria-label="Discovery sample overview"
        >
          <div className="market-label">
            <Radio size={18} />
            <div>
              <strong>Pulse of discovery</strong>
              <span>Our tracked sample · 24 hours</span>
            </div>
          </div>
          <div>
            <span>Eligible tokens</span>
            <strong>{quality.length ? number(quality.length) : "—"}</strong>
          </div>
          <div>
            <span>
              Sample volume{" "}
              <Hint label="24-hour USD volume across the eligible discovery sample. One selected pair per token; not a global market statistic.">
                <button aria-label="About sample volume">
                  <Info size={13} />
                </button>
              </Hint>
            </span>
            <strong>{quality.length ? money(totalVolume, true) : "—"}</strong>
          </div>
          <div>
            <span>Transactions</span>
            <strong>{quality.length ? number(totalTx) : "—"}</strong>
          </div>
          <div className="freshness">
            <span
              className={
                market.stale || market.error ? "status-dot amber" : "status-dot"
              }
            />
            <div>
              <strong>
                {market.stale
                  ? "Cached data"
                  : market.error
                    ? "Partial coverage"
                    : market.updatedAt
                      ? "Market connected"
                      : "Awaiting market data"}
              </strong>
              <span>
                {time
                  ? `Fetched ${time} · DexScreener`
                  : "DexScreener public API"}
              </span>
            </div>
          </div>
        </section>
        <section id="discovery" className="discovery-section">
          <div className="section-heading">
            <div className="eyebrow">
              <span className="section-index">01 —</span> YOUR NEXT DEEP DIVE
            </div>
            <h2>A world of possibilities.</h2>
            <p>Four perspectives. One place to explore.</p>
          </div>
          <div className="discovery-controls">
            <div className="tabs" aria-label="Discovery categories">
              {[
                { id: "all", title: "All discoveries" },
                ...sections.map((s) => ({
                  id: s.id,
                  title:
                    s.id === "cult"
                      ? "Cult coins"
                      : s.id === "trending"
                        ? "Trending"
                        : s.id === "gems"
                          ? "Potential gems"
                          : "High volume",
                })),
              ].map((s) => (
                <button
                  key={s.id}
                  aria-pressed={active === s.id}
                  className={active === s.id ? "active" : ""}
                  onClick={() => setActive(s.id)}
                >
                  {active === s.id && (
                    <motion.span
                      className="tab-indicator"
                      layoutId="discovery-tab"
                      transition={{ duration: quiet ? 0 : 0.3 }}
                    />
                  )}
                  <span className="tab-label">{s.title}</span>
                </button>
              ))}
            </div>
            <label className="sort">
              <SlidersHorizontal size={15} />
              <select
                aria-label="Sort discoveries"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="rank">Recommended order</option>
                <option value="volume">24h volume</option>
                <option value="liquidity">Liquidity</option>
                <option value="change">24h price change</option>
              </select>
            </label>
          </div>
          <div className="discovery-context" aria-live="polite">
            <span>
              <span className="context-dot" />
              {chain === "all"
                ? "Across connected networks"
                : chainName(chain)}{" "}
              <span className="context-separator">/</span> {quality.length}{" "}
              eligible tokens
            </span>
            <Link href="/methodology">
              Understand the signals <Info size={12} />
            </Link>
          </div>
          {market.error && (
            <div className="notice" role="status">
              <Info size={17} />
              {market.error}
              <button onClick={() => location.reload()}>
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          )}
          {market.stale && (
            <div className="notice">
              Cached snapshot: live data could not be refreshed. Check the
              source before relying on these values.
            </div>
          )}
          {chain === "robinhood" ? (
            <div className="panel unavailable">
              <Gem size={32} />
              <h2>A new frontier. Not connected yet.</h2>
              <p>
                Robinhood Chain market coverage has not been verified with our
                data provider.
                <br />
                Explore Solana or Ethereum while this integration is
                unavailable.
              </p>
              <Button variant="outline" onClick={() => setChain("all")}>
                Explore available networks <ArrowRight size={16} />
              </Button>
            </div>
          ) : (
            <div className="discovery-grid" data-focused={active !== "all"}>
              {sections
                .filter((s) => active === "all" || active === s.id)
                .map((s) => {
                  const list = sorted(ranked[s.id] || []),
                    limit = expanded.includes(s.id) ? 30 : 4;
                  return (
                    <DiscoveryPanel color={s.color} key={s.id}>
                      <div className="panel-top">
                        <span className="panel-icon">
                          <s.icon size={21} />
                        </span>
                        <span className="panel-tag">{s.tag}</span>
                        <span className="panel-number" aria-hidden="true">
                          0{sections.indexOf(s) + 1}
                        </span>
                      </div>
                      <div className="panel-title">
                        <div>
                          <h3>{s.title}</h3>
                          <p>{s.sub}</p>
                        </div>
                        <button
                          aria-label={`View all ${s.title}`}
                          onClick={() => {
                            setActive(s.id);
                            setExpanded((v) => [...v, s.id]);
                          }}
                        >
                          <ArrowUpRight size={20} />
                        </button>
                      </div>
                      <div className="table-labels">
                        <span>TOKEN / NETWORK</span>
                        <span>PRICE / 24H</span>
                      </div>
                      <div className="token-list">
                        {s.id === "cult" ? (
                          cult.length ? (
                            cult.slice(0, limit).map((c) => {
                              const p = pairs.find(
                                (p) =>
                                  identity(p.chainId, p.baseToken.address) ===
                                  identity(c.chain, c.address),
                              );
                              return (
                                <Link
                                  className="coin-row"
                                  key={c.id}
                                  href={`/coin/${c.chain}/${c.address}`}
                                >
                                  <TokenAvatar
                                    src={c.logo_url || p?.info?.imageUrl}
                                    symbol={c.symbol}
                                  />
                                  <div className="coin-name">
                                    <strong>
                                      {c.name}{" "}
                                      {c.featured && (
                                        <span className="featured-star">✦</span>
                                      )}
                                    </strong>
                                    <span>
                                      {c.symbol} <i /> {chainName(c.chain)}
                                    </span>
                                  </div>
                                  <div className="coin-value">
                                    <strong>{money(p?.priceUsd)}</strong>
                                    <span
                                      className={
                                        (p?.priceChange?.h24 ?? 0) < 0
                                          ? "negative"
                                          : "positive"
                                      }
                                    >
                                      {percent(p?.priceChange?.h24)}
                                    </span>
                                  </div>
                                </Link>
                              );
                            })
                          ) : (
                            <Empty
                              title="The collection starts here"
                              text={
                                curationStatus === "error"
                                  ? "Curated content is temporarily unavailable."
                                  : curationStatus === "unconfigured"
                                    ? "Connect Supabase to publish your first curator picks."
                                    : "Our curators haven’t added any coins for this network yet."
                              }
                              href="/admin"
                            />
                          )
                        ) : list.length ? (
                          list.slice(0, limit).map((p) => (
                            <Link
                              className="coin-row"
                              key={identity(p.chainId, p.baseToken.address)}
                              href={tokenHref(p)}
                            >
                              <TokenAvatar
                                src={p.info?.imageUrl}
                                symbol={p.baseToken.symbol}
                              />
                              <div className="coin-name">
                                <strong>{p.baseToken.name}</strong>
                                <span>
                                  {p.baseToken.symbol} <i />
                                  {chainName(p.chainId)}
                                  {s.id === "volume" &&
                                    ` · ${money(p.volume?.h24, true)} vol`}
                                </span>
                                {s.id === "gems" && (
                                  <small>
                                    {Math.max(
                                      0,
                                      Math.floor(
                                        ((market.updatedAt ?? 0) -
                                          (p.pairCreatedAt ??
                                            market.updatedAt ??
                                            0)) /
                                          86400000,
                                      ),
                                    )}
                                    d pair · {money(p.liquidity?.usd, true)}{" "}
                                    liquidity
                                  </small>
                                )}
                              </div>
                              <div className="coin-extra">
                                <span>
                                  LIQUIDITY
                                  <strong>
                                    {money(p.liquidity?.usd, true)}
                                  </strong>
                                </span>
                                <span>
                                  24H VOLUME
                                  <strong>{money(p.volume?.h24, true)}</strong>
                                </span>
                              </div>
                              <div className="coin-value">
                                <strong>{money(p.priceUsd)}</strong>
                                <span
                                  className={
                                    (p.priceChange?.h24 ?? 0) < 0
                                      ? "negative"
                                      : "positive"
                                  }
                                >
                                  {percent(p.priceChange?.h24)}
                                </span>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <Empty
                            title={
                              market.error
                                ? "Taking a moment to reconnect"
                                : "Nothing meets the criteria yet"
                            }
                            text={
                              market.error
                                ? "Refresh to try the market provider again."
                                : "Good discovery takes patience. Try another network or check back soon."
                            }
                          />
                        )}
                      </div>
                      <div className="panel-bottom">
                        <span>
                          {s.id === "cult"
                            ? "Handpicked. Human perspective."
                            : s.id === "gems"
                              ? `Pair age ≤ ${rules.maxAgeDays}d · Liquidity ≥ ${money(rules.minLiquidity, true)}`
                              : s.id === "volume"
                                ? "Highest-liquidity pair per token · 24h"
                                : "Ranked by volume, transactions & liquidity"}
                        </span>
                        <button
                          onClick={() =>
                            setExpanded((v) =>
                              v.includes(s.id)
                                ? v.filter((x) => x !== s.id)
                                : [...v, s.id],
                            )
                          }
                        >
                          {expanded.includes(s.id)
                            ? "Show less"
                            : "Explore more"}{" "}
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </DiscoveryPanel>
                  );
                })}
            </div>
          )}
        </section>
        <section className="approach-banner">
          <span className="approach-gem">
            <Gem size={30} />
          </span>
          <div>
            <h3>Curiosity is your edge. Context is your compass.</h3>
            <p>
              Every signal has a source. Every discovery deserves your own
              research.
            </p>
          </div>
          <Link href="/methodology">
            Behind the discoveries <ArrowUpRight size={17} />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
function Empty({
  title,
  text,
  href,
}: {
  title: string;
  text: string;
  href?: string;
}) {
  return (
    <div className="empty">
      <Gem size={25} />
      <h4>{title}</h4>
      <p>{text}</p>
      {href && (
        <Link href={href}>
          Open curator studio <ArrowUpRight size={13} />
        </Link>
      )}
    </div>
  );
}
