"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { MotionConfig } from "motion/react";
import { Pause, Play } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

const ExperienceContext = createContext({
  quiet: false,
  deviceReduced: false,
  toggle: () => {},
});
export const useExperience = () => useContext(ExperienceContext);
export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [deviceReduced, setDeviceReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const quiet = paused || deviceReduced;
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setDeviceReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    try {
      setPaused(localStorage.getItem("gems-motion") === "paused");
    } catch {
      /* Storage may be disabled; system preference still applies. */
    }
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = quiet ? "quiet" : "full";
  }, [quiet]);
  const toggle = () =>
    setPaused((p) => {
      try {
        localStorage.setItem("gems-motion", p ? "full" : "paused");
      } catch {
        /* Keep the session preference when storage is unavailable. */
      }
      return !p;
    });
  return (
    <ExperienceContext.Provider value={{ quiet, deviceReduced, toggle }}>
      <MotionConfig
        reducedMotion={quiet ? "always" : "user"}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
      >
        <Tooltip.Provider delayDuration={250}>{children}</Tooltip.Provider>
      </MotionConfig>
    </ExperienceContext.Provider>
  );
}
export function Hint({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="gems-tooltip" sideOffset={8}>
          {label}
          <Tooltip.Arrow className="tooltip-arrow" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
export function MotionToggle() {
  const { quiet, deviceReduced, toggle } = useExperience();
  return (
    <Hint
      label={
        deviceReduced
          ? "Reduced motion is enabled in your device settings."
          : quiet
            ? "Motion paused (respects your device settings)"
            : "Pause ambient motion"
      }
    >
      <button
        className="motion-toggle"
        onClick={deviceReduced ? undefined : toggle}
        aria-disabled={deviceReduced}
        aria-label={
          deviceReduced
            ? "Device reduced-motion setting is active"
            : quiet
              ? "Enable ambient motion"
              : "Pause ambient motion"
        }
        aria-pressed={quiet}
      >
        {quiet ? <Play size={14} /> : <Pause size={14} />}
      </button>
    </Hint>
  );
}
