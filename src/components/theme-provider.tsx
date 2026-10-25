"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Moon, Sun } from "lucide-react";
import { Hint } from "./experience";
type Theme = "light" | "dark";
const ThemeContext = createContext({
  theme: "light" as Theme,
  toggleTheme: () => {},
});
export const useTheme = () => useContext(ThemeContext);
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem("gems-theme");
      } catch {}
      const next =
        saved === "dark" || saved === "light"
          ? saved
          : media.matches
            ? "dark"
            : "light";
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };
    apply();
    media.addEventListener("change", apply);
    window.addEventListener("storage", apply);
    return () => {
      media.removeEventListener("change", apply);
      window.removeEventListener("storage", apply);
    };
  }, []);
  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem("gems-theme", next);
    } catch {}
  };
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Hint
      label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label="Dark mode"
        aria-pressed={theme === "dark"}
      >
        <Moon className="theme-moon" size={16} />
        <Sun className="theme-sun" size={16} />
      </button>
    </Hint>
  );
}
