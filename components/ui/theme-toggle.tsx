"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const dark = document.documentElement.classList.contains("dark");
    setIsDark(dark);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const html = document.documentElement;
    const nextDark = !html.classList.contains("dark");

    if (nextDark) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    setIsDark(nextDark);
  }

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Alternar tema"
        className="theme-toggle"
      >
        <span className="theme-toggle-knob" />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label="Alternar tema"
      aria-pressed={isDark}
      onClick={toggleTheme}
      className={`theme-toggle ${isDark ? "is-dark" : ""}`}
    >
      <span className="theme-toggle-knob">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.5 3.5C11 4.2 8.5 7.3 8.5 11C8.5 15.2 11.8 18.5 16 18.5C17.1 18.5 18.2 18.3 19.1 17.8C17.8 20.1 15.3 21.5 12.5 21.5C8.1 21.5 4.5 17.9 4.5 13.5C4.5 9.1 8.1 5.5 12.5 5.5C13.2 5.5 13.9 5.6 14.5 5.8V3.5Z"
            fill="currentColor"
          />
          <path
            d="M17.6 7.1L18 8.1L19 8.5L18 8.9L17.6 9.9L17.2 8.9L16.2 8.5L17.2 8.1L17.6 7.1Z"
            fill="currentColor"
          />
          <path
            d="M20.2 10.4L20.5 11.1L21.2 11.4L20.5 11.7L20.2 12.4L19.9 11.7L19.2 11.4L19.9 11.1L20.2 10.4Z"
            fill="currentColor"
          />
        </svg>
      </span>
    </button>
  );
}