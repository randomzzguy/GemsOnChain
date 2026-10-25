"use client";
import Link from "next/link";
import { Search, ArrowUpRight, X, Loader2, Gem } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MotionToggle } from "./experience";
import { ThemeToggle } from "./theme-provider";
import { Compass, Users, BookOpen } from "lucide-react";
import { Brand } from "./brand";
import { chainName, tokenHref, type Pair } from "@/lib/domain";
import { money } from "@/lib/utils";
import { TokenAvatar } from "./token-avatar";
export function Header({
  chain = "all",
  onChain,
}: {
  chain?: string;
  onChain?: (c: string) => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),
    [pairs, setPairs] = useState<Pair[]>([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (query.trim().length < 2) {
      setPairs([]);
      setError("");
      setLoading(false);
      return;
    }
    setLoading(true);
    setPairs([]);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const r = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal },
        );
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        setPairs(data.pairs);
        setError(
          data.error ||
            (data.stale
              ? "Showing a cached market snapshot; live prices may have changed."
              : ""),
        );
      } catch (e) {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : "Search unavailable.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  const filtered = pairs.filter((p) => chain === "all" || p.chainId === chain);
  return (
    <>
      <header className="header">
        <Brand />
        <nav aria-label="Main navigation">
          <Link className={pathname === "/" ? "nav-active" : ""} href="/">
            Discover
          </Link>
          <Link
            href="/?section=cult#discovery"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("gems:category", { detail: "cult" }),
              )
            }
          >
            Cult collection
          </Link>
          <Link
            className={pathname === "/methodology" ? "nav-active" : ""}
            href="/methodology"
          >
            Our approach <ArrowUpRight size={12} />
          </Link>
        </nav>
        <div className="header-tools">
          <ThemeToggle />
          <MotionToggle />
          {onChain && (
            <select
              aria-label="Filter by network"
              value={chain}
              onChange={(e) => onChain(e.target.value)}
            >
              <option value="all">All networks</option>
              <option value="solana">Solana</option>
              <option value="ethereum">Ethereum</option>
              <option value="robinhood">Robinhood Chain</option>
            </select>
          )}
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger
              className="search-trigger"
              aria-label="Search tokens"
            >
              <Search size={17} />
              <span>Search tokens</span>
              <kbd>⌘ K</kbd>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="dialog-overlay" />
              <Dialog.Content className="search-dialog">
                <Dialog.Title>Find your next discovery</Dialog.Title>
                <Dialog.Description>
                  Search a name, ticker, or contract address. Always verify the
                  network and address.
                </Dialog.Description>
                <Dialog.Close
                  className="dialog-close"
                  aria-label="Close search"
                >
                  <X size={20} />
                </Dialog.Close>
                <div className="search-input">
                  <Search size={20} />
                  <input
                    autoFocus
                    maxLength={100}
                    placeholder="Search tokens or paste an address…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Token search"
                  />
                  {loading && <Loader2 className="spin" size={20} />}
                </div>
                <div
                  className="search-results"
                  aria-live="polite"
                  aria-busy={loading}
                >
                  {loading && (
                    <div className="search-loading">
                      <span className="search-loading-line" />
                      <span className="search-loading-line" />
                      <span className="search-loading-line" />
                      <p>Looking for the signal…</p>
                    </div>
                  )}
                  {error && <p className="notice">{error}</p>}
                  {!loading &&
                    query.length >= 2 &&
                    !filtered.length &&
                    !error && (
                      <div className="empty">
                        <Gem />
                        <h3>No matching tokens</h3>
                        <p>Try the full contract address or another network.</p>
                      </div>
                    )}
                  {query.length < 2 && (
                    <p className="muted">
                      Enter at least two characters to explore live markets.
                    </p>
                  )}
                  {filtered.map((p) => (
                    <Link
                      onClick={() => setOpen(false)}
                      className="search-result"
                      key={p.chainId + p.baseToken.address}
                      href={tokenHref(p)}
                    >
                      <TokenAvatar
                        src={p.info?.imageUrl}
                        symbol={p.baseToken.symbol}
                      />
                      <div>
                        <strong>
                          {p.baseToken.name} <small>{p.baseToken.symbol}</small>
                        </strong>
                        <span>
                          {chainName(p.chainId)} ·{" "}
                          {p.baseToken.address.slice(0, 6)}…
                          {p.baseToken.address.slice(-4)}
                        </span>
                      </div>
                      <b>{money(p.priceUsd)}</b>
                      <ArrowUpRight size={16} />
                    </Link>
                  ))}
                </div>
                <div className="search-dialog-footer">
                  <span>REAL MARKETS. VERIFIED IDENTITIES MATTER.</span>
                  <span>
                    <kbd>esc</kbd> to close
                  </span>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </header>
      <nav className="mobile-dock" aria-label="Mobile navigation">
        <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
          <Compass size={18} />
          <span>Discover</span>
        </Link>
        <Link
          href="/?section=cult#discovery"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("gems:category", { detail: "cult" }),
            )
          }
        >
          <Users size={18} />
          <span>Cult coins</span>
        </Link>
        <button onClick={() => setOpen(true)}>
          <Search size={18} />
          <span>Search</span>
        </button>
        <Link
          href="/methodology"
          aria-current={pathname === "/methodology" ? "page" : undefined}
        >
          <BookOpen size={18} />
          <span>Our approach</span>
        </Link>
      </nav>
    </>
  );
}
