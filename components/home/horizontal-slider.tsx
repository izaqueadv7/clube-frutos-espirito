"use client";

import { useRef } from "react";

export function HorizontalSlider({
  children
}: {
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  function scrollLeft() {
    containerRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  }

  function scrollRight() {
    containerRef.current?.scrollBy({ left: 320, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-bold shadow hover:bg-white"
      >
        ‹
      </button>

      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 pl-10 pr-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      <button
        type="button"
        onClick={scrollRight}
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-bold shadow hover:bg-white dark:bg-zinc-950"
      >
        ›
      </button>
    </div>
  );
}