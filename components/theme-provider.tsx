"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const root = window.document.documentElement;
    
    // Initialize theme from localStorage or system preference
    const stored = localStorage.getItem("theme-storage");
    let initialResolved: "light" | "dark" = resolvedTheme;

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const storedTheme = parsed.state?.theme || "system";
        if (storedTheme === "system") {
          initialResolved = window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
        } else {
          initialResolved = storedTheme;
        }
      } catch {
        // Use system preference if parse fails
        initialResolved = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
    } else {
      // No stored preference, use system
      initialResolved = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    // Apply theme to document
    root.classList.remove("light", "dark");
    root.classList.add(initialResolved);

    // Update store if different
    if (initialResolved !== resolvedTheme) {
      useThemeStore.setState({ resolvedTheme: initialResolved });
    }

    // Listen for system theme changes
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        const newTheme = mediaQuery.matches ? "dark" : "light";
        useThemeStore.setState({ resolvedTheme: newTheme });
        root.classList.remove("light", "dark");
        root.classList.add(newTheme);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]); // Only depend on theme, not resolvedTheme to avoid loops

  // Update DOM when resolvedTheme changes (but not on initial mount)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  return <>{children}</>;
}

