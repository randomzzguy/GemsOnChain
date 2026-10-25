import Link from "next/link";
import { Gem, ArrowUpRight } from "lucide-react";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="GemsOnChain home">
      <span className="brand-mark">
        <Gem size={22} />
      </span>
      Gems<span className="brand-light">OnChain</span>
    </Link>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <Brand />
      <p>A little signal. A lot of possibility.</p>
      <div>
        <Link href="/methodology">How we discover</Link>
        <Link href="/admin">
          Curator studio <ArrowUpRight size={13} />
        </Link>
      </div>
      <small>Research, not recommendations. Crypto assets carry risk.</small>
    </footer>
  );
}
export function GemArt() {
  return (
    <div className="gem-scene" aria-hidden="true">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <span className="spark spark-one">✦</span>
      <span className="spark spark-two">+</span>
      <div className="gem-shadow" />
      <div className="gem-object">
        <i className="facet f1" />
        <i className="facet f2" />
        <i className="facet f3" />
        <i className="facet f4" />
        <i className="facet f5" />
        <i className="facet f6" />
        <i className="facet f7" />
      </div>
      <span className="gem-caption">SIGNAL BENEATH THE SURFACE</span>
    </div>
  );
}
