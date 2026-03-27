"use client";

import { useEffect, useRef, useState } from "react";

type ProSliderProps = {
  children: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
};

export function ProSlider({
  children,
  autoPlay = true,
  interval = 4000
}: ProSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const total = children.length;

  function goTo(index: number) {
    if (!containerRef.current) return;

    const safeIndex = Math.max(0, Math.min(index, total - 1));
    const container = containerRef.current;
    const child = container.children[safeIndex] as HTMLElement | undefined;

    if (!child) return;

    container.scrollTo({
      left: child.offsetLeft - container.offsetLeft,
      behavior: "smooth"
    });

    setActiveIndex(safeIndex);
  }

  function next() {
    const nextIndex = activeIndex + 1 >= total ? 0 : activeIndex + 1;
    goTo(nextIndex);
  }

  function prev() {
    const prevIndex = activeIndex - 1 < 0 ? total - 1 : activeIndex - 1;
    goTo(prevIndex);
  }

  useEffect(() => {
    if (!autoPlay || total <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((current) => {
        const nextIndex = current + 1 >= total ? 0 : current + 1;

        if (containerRef.current) {
          const child = containerRef.current.children[nextIndex] as HTMLElement | undefined;

          if (child) {
            containerRef.current.scrollTo({
              left: child.offsetLeft - containerRef.current.offsetLeft,
              behavior: "smooth"
            });
          }
        }

        return nextIndex;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, total]);

  if (total === 0) return null;

  return (
    <div className="space-y-4">
      <div className="relative">
        <button
          type="button"
          onClick={prev}
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-lg font-bold shadow hover:bg-white"
        >
          ‹
        </button>

        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {children.map((child, index) => (
            <div key={index} className="min-w-full md:min-w-[340px]">
              {child}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-lg font-bold shadow hover:bg-white"
        >
          ›
        </button>
      </div>

      {total > 1 ? (
        <div className="flex justify-center gap-2">
          {children.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                index === activeIndex ? "bg-primary" : "bg-slate-300"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}