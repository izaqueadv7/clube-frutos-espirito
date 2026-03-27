"use client";

import Link from "next/link";
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
      
      {/* MENU ESQUERDA */}
      <MobileMenu user={user} />

      {/* DIREITA (nome + foto + sino) */}
      <div className="flex items-center gap-3">
        
        {/* NOTIFICAÇÃO */}
        <button
          type="button"
          className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-zinc-800"
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* PERFIL */}
        <Link
          href="/profile"
          className="flex items-center gap-2"
        >
          <span className="text-sm font-semibold text-ink">
            {name?.split(" ")[0] ?? "Usuário"}
          </span>

          {image ? (
            <Image
              src={image}
              alt="perfil"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
              {name?.[0] ?? "U"}
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}