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
      <div className="flex items-center gap-2">
        <MobileMenu user={user} />
      </div>

      <Link href="/profile" className="flex min-w-0 items-center gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            Olá, {name?.split(" ")[0] ?? "Usuário"}
          </p>
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
      </Link>

      <button
        type="button"
        className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-zinc-800"
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5" />
      </button>
    </div>
  );
}