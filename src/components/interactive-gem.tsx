"use client";
import { useEffect, useRef, useState } from "react";
import { Gem, RotateCcw, MoveHorizontal } from "lucide-react";
import { useExperience } from "./experience";
import { useTheme } from "./theme-provider";
import type { mountGem } from "./gem-engine";

export function InteractiveGem() {
  const host = useRef<HTMLDivElement>(null),
    engine = useRef<ReturnType<typeof mountGem> | null>(null);
  const { quiet } = useExperience(),
    { theme } = useTheme();
  const [finish, setFinish] = useState<"rose" | "ice">("rose"),
    [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const current = useRef({ dark: theme === "dark", quiet, finish });
  current.current = { dark: theme === "dark", quiet, finish };
  useEffect(() => {
    let cancelled = false;
    const element = host.current!;
    import("./gem-engine")
      .then(({ mountGem }) => {
        if (cancelled) return;
        try {
          engine.current = mountGem(element, current.current, () =>
            setStatus("fallback"),
          );
          setStatus("ready");
        } catch {
          setStatus("fallback");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("fallback");
      });
    return () => {
      cancelled = true;
      engine.current?.dispose();
      engine.current = null;
    };
  }, []);
  useEffect(() => {
    engine.current?.update({ dark: theme === "dark", quiet, finish });
  }, [theme, quiet, finish]);
  return (
    <>
      <div className="gem-contact-shadow" aria-hidden="true" />
      <div
        ref={host}
        className="gem-viewport"
        tabIndex={status === "ready" ? 0 : -1}
        role="group"
        aria-label="Interactive brilliant-cut gemstone. Drag horizontally to rotate. Use arrow keys to rotate and Home to reset."
        data-status={status}
      >
        {status !== "ready" && (
          <div className="gem-fallback">
            <Gem size={100} strokeWidth={0.7} />
            <span>
              {status === "loading"
                ? "Polishing the facets…"
                : "Brilliant-cut crystal"}
            </span>
          </div>
        )}
      </div>
      <div className="gem-controls">
        <span className="gem-instruction">
          <MoveHorizontal size={12} />
          {status === "ready" ? "Drag to explore" : "Crystal study"}
        </span>
        <div className="gem-finishes" aria-label="Gemstone finish">
          <button
            aria-label="Rose gemstone"
            aria-pressed={finish === "rose"}
            className="finish-rose"
            onClick={() => setFinish("rose")}
          />
          <button
            aria-label="Ice gemstone"
            aria-pressed={finish === "ice"}
            className="finish-ice"
            onClick={() => setFinish("ice")}
          />
        </div>
        <button
          className="gem-reset"
          aria-label="Reset gemstone rotation"
          onClick={() => engine.current?.reset()}
          disabled={status !== "ready"}
        >
          <RotateCcw size={13} />
        </button>
      </div>
    </>
  );
}
