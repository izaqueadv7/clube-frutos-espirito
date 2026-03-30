"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  LibraryBig,
  Badge,
  House,
  CalendarDays,
  BookOpenText
} from "lucide-react";

const items: {
  href: Route;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { href: "/classes", label: "Classes", icon: LibraryBig },
  { href: "/specialties", label: "Especialidades", icon: Badge },
  { href: "/dashboard", label: "Início", icon: House },
  { href: "/calendar", label: "Calendário", icon: CalendarDays },
  { href: "/bible", label: "Bíblia", icon: BookOpenText }
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-primary shadow-lg backdrop-blur lg:hidden">
      <div className="grid grid-cols-5 gap-2 px-3 py-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex min-h-[74px] flex-col items-center justify-center rounded-3xl px-2 py-2 text-center transition-all duration-200",
                active
                  ? "bg-white text-primary shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
                  : "text-white/80 hover:bg-white/10"
              ].join(" ")}
            >
              <Icon className={["mb-1", active ? "h-6 w-6" : "h-5 w-5"].join(" ")} />
              <span
                className={[
                  "leading-tight",
                  active ? "text-[12px] font-bold" : "text-[11px] font-semibold"
                ].join(" ")}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}