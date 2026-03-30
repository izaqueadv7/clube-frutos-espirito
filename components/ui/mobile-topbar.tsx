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
    <div className="sticky top-0 z-40 flex items-center justify-between bg-primary px-4 py-3 text-white shadow-md lg:hidden">
      <MobileMenu user={user} />

      <div className="flex items-center gap-3">
        <Link
  href="/announcements"
  className="relative rounded-xl p-2 transition hover:bg-white/10"
  aria-label="Avisos"
>
  <Bell className="h-5 w-5 text-white" />
  <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-primary" />
</Link>

        <Link href="/profile" className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">
            {name?.split(" ")[0] ?? "Usuário"}
          </span>

          {image ? (
            <Image
              src={image}
              alt="perfil"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full border border-white/60 object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/15 text-xs font-bold text-white">
              {name?.[0] ?? "U"}
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}