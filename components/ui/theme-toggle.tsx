"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function setDomTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function readStoredTheme(): Theme | null {
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
  } catch {}
  return null;
}

function writeStoredTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {}
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "light";
    }
    const savedTheme = readStoredTheme();
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    setDomTheme(theme);
    writeStoredTheme(theme);
  }, [theme]);

  const nextTheme: Theme = theme === "dark" ? "light" : "dark";
  const buttonLabel = theme === "dark" ? "Light Mode" : "Dark Mode";

  return (
    <button
      type="button"
      onClick={() => {
        setTheme(nextTheme);
      }}
      className="ml-auto rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:border-zinc-600 dark:text-zinc-200"
      aria-label={`Switch to ${nextTheme} mode`}
    >
      {buttonLabel}
    </button>
  );
}
