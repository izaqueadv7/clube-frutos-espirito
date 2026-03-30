"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as ThemeMode | null) ?? "light";
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
        className="rounded-xl border px-3 py-2 text-slate-800 dark:text-white"
      >
        ☾
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-xl border border-[rgba(46,125,50,0.15)] bg-white dark:bg-zinc-950 px-3 py-2 text-slate-800 transition hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
      title={theme === "dark" ? "Modo claro" : "Modo escuro"}
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}