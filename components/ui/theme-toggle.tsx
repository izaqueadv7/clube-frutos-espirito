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
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-sm"
      >
        ☾
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-sm transition hover:bg-primary-dark"
      title={theme === "dark" ? "Modo claro" : "Modo escuro"}
    >
      <span className="text-lg leading-none">
        {theme === "dark" ? "☀" : "☾"}
      </span>
    </button>
  );
}