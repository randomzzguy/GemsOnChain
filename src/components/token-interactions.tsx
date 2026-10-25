"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { Pair } from "@/lib/domain";
import { number } from "@/lib/utils";
import { motion } from "motion/react";
import { useExperience } from "./experience";
export function CopyAddress({ address }: { address: string }) {
  const [status, setStatus] = useState("");
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(address);
          setStatus("Copied");
          setTimeout(() => setStatus(""), 2000);
        } catch {
          setStatus("Copy unavailable");
        }
      }}
      aria-label="Copy contract address"
    >
      {status === "Copied" ? <Check size={14} /> : <Copy size={14} />}
      <span aria-live="polite">{status || "Copy"}</span>
    </button>
  );
}
export function Pressure({ pair }: { pair: Pair }) {
  const { quiet } = useExperience();
  const [period, setPeriod] = useState("h24");
  const tx = pair.txns?.[period],
    total = tx ? tx.buys + tx.sells : 0,
    buy = tx && total ? (tx.buys / total) * 100 : null;
  return (
    <section className="panel detail-card pressure-card">
      <div className="card-heading">
        <div>
          <h2>The balance of activity</h2>
          <p>Buy & sell transaction counts</p>
        </div>
        <select
          aria-label="Transaction period"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="m5">5 minutes</option>
          <option value="h1">1 hour</option>
          <option value="h6">6 hours</option>
          <option value="h24">24 hours</option>
        </select>
      </div>
      <div className="pressure-labels">
        <div className="positive">
          <span>Buy transactions</span>
          <strong>{number(tx?.buys)}</strong>
        </div>
        <div className="negative">
          <span>Sell transactions</span>
          <strong>{number(tx?.sells)}</strong>
        </div>
      </div>
      {buy !== null ? (
        <>
          <div
            className="pressure-bar"
            role="img"
            aria-label={`${buy.toFixed(1)} percent buy transactions`}
          >
            <motion.span
              initial={false}
              animate={{ width: `${buy}%` }}
              transition={{ duration: quiet ? 0 : 0.45 }}
            />
            <motion.span
              initial={false}
              animate={{ width: `${100 - buy}%` }}
              transition={{ duration: quiet ? 0 : 0.45 }}
            />
          </div>
          <div className="pressure-summary">
            <span>{buy.toFixed(1)}% buys</span>
            <span>{(100 - buy).toFixed(1)}% sells</span>
          </div>
        </>
      ) : (
        <p>
          {tx
            ? "No transactions in this period."
            : "Transaction data is unavailable for this period."}
        </p>
      )}
      <p className="fine-print">
        Counts are not volume. DexScreener does not provide separate buy and
        sell USD volumes here. Activity does not predict future returns.
      </p>
    </section>
  );
}
