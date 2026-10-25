"use client";
import { InteractiveGem } from "./interactive-gem";
import Link from "next/link";

import { ArrowUpRight, ScanLine, Sparkles } from "lucide-react";

import { TokenAvatar } from "./token-avatar";
import { chainName, tokenHref, type Pair } from "@/lib/domain";
import { money, percent } from "@/lib/utils";

export function CrystalStage({ pair }: { pair?: Pair }) {
  return (
    <div className="crystal-stage gem-stage-3d">
      <div className="stage-grid" aria-hidden="true" />
      <div className="stage-label">
        <span className="stage-cross">+</span> THE DISCOVERY OBSERVATORY{" "}
        <span>001</span>
      </div>
      <div className="stage-aura" aria-hidden="true" />
      <div className="orbital orbital-a" aria-hidden="true" />
      <div className="orbital orbital-b" aria-hidden="true" />
      <span className="stage-coordinate" aria-hidden="true">
        A NEW POINT OF VIEW / ∞
      </span>
      <InteractiveGem />
      <span className="stage-star star-a" aria-hidden="true">
        ✧
      </span>
      <span className="stage-star star-b" aria-hidden="true">
        ✦
      </span>
      <div className="stage-insight">
        <span className="insight-icon">
          <ScanLine size={17} />
        </span>
        <div>
          <strong>Look beneath the surface.</strong>
          <span>Every signal has a source.</span>
        </div>
      </div>
      {pair ? (
        <Link className="spotlight-token" href={tokenHref(pair)}>
          <span className="spotlight-kicker">
            <span /> IN THE DISCOVERY SAMPLE <ArrowUpRight size={13} />
          </span>
          <div className="spotlight-body">
            <TokenAvatar
              src={pair.info?.imageUrl}
              symbol={pair.baseToken.symbol}
            />
            <div>
              <strong>{pair.baseToken.symbol}</strong>
              <span>{chainName(pair.chainId)}</span>
            </div>
            <div className="spotlight-price">
              <strong>{money(pair.priceUsd)}</strong>
              <span
                className={
                  (pair.priceChange?.h24 ?? 0) < 0 ? "negative" : "positive"
                }
              >
                {percent(pair.priceChange?.h24)} <small>24h</small>
              </span>
            </div>
          </div>
        </Link>
      ) : (
        <div className="spotlight-token spotlight-empty">
          <Sparkles size={18} />
          <span>Curiosity is where it begins.</span>
        </div>
      )}
      <div className="stage-foot">
        <span>REAL DATA. HUMAN PERSPECTIVE.</span>
        <span className="stage-cross">+</span>
      </div>
    </div>
  );
}
