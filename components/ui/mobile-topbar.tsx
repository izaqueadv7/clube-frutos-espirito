"use client";

import { Bell, Menu } from "lucide-react";
import Image from "next/image";

export function MobileTopBar({
  name,
  image
}: {
  name?: string | null;
  image?: string | null;
}) {
  return (
    <div className="sticky top-0 z-40 flex items-center justify-between bg-white px-4 py-3 shadow-sm dark:bg-zinc-900 lg:hidden">
      <button className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-zinc-800">
        <Menu className="h-5 w-5" />
      </button>

      <p className="text-sm font-semibold text-ink">
        Olá, {name?.split(" ")[0] ?? "Usuário"} 👋
      </p>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            3
          </span>
        </div>

        {image ? (
          <Image
            src={image}
            alt="perfil"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold">
            {name?.[0] ?? "U"}
          </div>
        )}
      </div>
    </div>
  );
}