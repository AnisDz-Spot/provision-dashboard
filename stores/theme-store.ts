import { create } from "zustand";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

// Default to light theme for SSR to avoid hydration mismatch
const getInitialTheme = (): { theme: Theme; resolvedTheme: "light" | "dark" } => {
  if (typeof window === "undefined") {
    return { theme: "system", resolvedTheme: "light" };
  }

  const stored = localStorage.getItem("theme-storage");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const storedTheme = parsed.state?.theme || "system";
      const storedResolved = parsed.state?.resolvedTheme || getSystemTheme();
      return { theme: storedTheme, resolvedTheme: storedResolved };
    } catch {
      // Ignore parse errors
    }
  }

  return { theme: "system", resolvedTheme: getSystemTheme() };
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const { theme: initialTheme, resolvedTheme: initialResolved } = getInitialTheme();

  return {
    theme: initialTheme,
    resolvedTheme: initialResolved,
    setTheme: (theme: Theme) => {
      const resolved = theme === "system" ? getSystemTheme() : theme;
      set({ theme, resolvedTheme: resolved });

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "theme-storage",
          JSON.stringify({ state: { theme, resolvedTheme: resolved } })
        );
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(resolved);
      }
    },
  };
});
