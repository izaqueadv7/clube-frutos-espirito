"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as ThemeMode | null;
    const current = saved === "dark" ? "dark" : "light";

    setTheme(current);
    document.documentElement.classList.toggle("dark", current === "dark");
    setMounted(true);
  }, []);

  function toggleTheme() {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  if (!mounted) {
    return (
      <button
        type="button"
        className="rounded-lg border px-3 py-2 text-[rgb(var(--ink))]"
      >
        ☾
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-lg border px-3 py-2 text-[rgb(var(--ink))] hover:opacity-80"
      title={theme === "dark" ? "Modo claro" : "Modo escuro"}
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}