"use client";
import { useRef, type ReactNode } from "react";
import { motion } from "motion/react";
import { useExperience } from "./experience";

/** Original spotlight treatment inspired by Magic UI's pointer-following cards. */
export function DiscoveryPanel({
  children,
  color,
}: {
  children: ReactNode;
  color: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { quiet } = useExperience();
  return (
    <motion.article
      ref={ref}
      layout={!quiet ? "position" : false}
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      className={`panel discovery-panel ${color}`}
      onPointerMove={(e) => {
        if (quiet || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        ref.current?.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
        ref.current?.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
      }}
    >
      <div className="card-spotlight" aria-hidden="true" />
      {children}
    </motion.article>
  );
}
