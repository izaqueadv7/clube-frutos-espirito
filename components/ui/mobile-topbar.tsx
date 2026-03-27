"use client";

import { Bell } from "lucide-react";
import Image from "next/image";
import { MobileMenu } from "@/components/ui/mobile-menu";

export function MobileTopBar({
  name,
  image,
  user
}: {
  name?: string | null;
  image?: string | null;
  user?: any;
}) {
  return (
    <div className="sticky top-0 z-40 flex items-center justify-between bg-white px-4 py-3 shadow-sm dark:bg-zinc-900 lg:hidden">
      <div className="flex items-center gap-2">
        <MobileMenu user={user} />
      </div>

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