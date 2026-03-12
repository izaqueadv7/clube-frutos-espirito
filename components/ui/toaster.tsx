"use client";

import { useState } from "react";

let listeners: ((text: string) => void)[] = [];

export function toast(text: string) {
  listeners.forEach((listener) => listener(text));
}

export function Toaster() {
  const [message, setMessage] = useState<string | null>(null);

  if (typeof window !== "undefined" && listeners.length === 0) {
    listeners.push((text) => {
      setMessage(text);
      setTimeout(() => setMessage(null), 2600);
    });
  }

  if (!message) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-ink px-4 py-2 text-sm text-white shadow-lg">
      {message}
    </div>
  );
}
