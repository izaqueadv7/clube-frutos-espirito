import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/forms/logout-button";
import { SubscribeNotifications } from "@/components/pwa/subscribe-notifications";
import { translateRole } from "@/lib/translate";
import { MobileMenu } from "@/components/ui/mobile-menu";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
import { MobileTopBar } from "@/components/ui/mobile-topbar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.id) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      isActive: true,
      status: true,
      role: true,
      name: true,
      image: true
    }
  });

  if (!dbUser) {
    redirect("/login");
  }

  if (!dbUser.isActive) {
    redirect("/login");
  }

  if (dbUser.status !== "APPROVED") {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-hero-gradient pb-28 lg:px-8">
      <MobileTopBar name={dbUser.name} image={dbUser.image} user={session.user} />

      <div
        className="mx-auto hidden max-w-7xl items-center justify-between rounded-2xl p-4 shadow-card lg:mt-4 lg:flex"
        style={{ backgroundColor: "rgb(var(--accent))" }}
      >
        <div className="flex items-center gap-3">
          <MobileMenu user={session.user} />

          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-clube.png"
              alt="Logo Clube Frutos do Espírito"
              width={42}
              height={42}
              className="h-10 w-10 object-contain"
            />
            <span className="text-lg font-extrabold text-primary">
              Clube Frutos do Espírito
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <SubscribeNotifications />

          <div className="hidden md:block">
            <span className="rounded-full bg-[rgba(46,125,50,0.08)] px-3 py-1 text-xs font-semibold text-primary">
              {translateRole(dbUser.role)}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            {dbUser.image ? (
              <img
                src={dbUser.image}
                alt="Foto do usuário"
                className="h-10 w-10 rounded-full border object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-slate-100 text-slate-500">
                {dbUser.name?.[0] ?? "U"}
              </div>
            )}

            <div className="hidden md:block">
              <p className="text-sm font-semibold" style={{ color: "rgb(var(--ink))" }}>
                {dbUser.name}
              </p>
              <p className="text-xs text-slate-500">
                {translateRole(dbUser.role)}
              </p>
            </div>
          </div>

          <LogoutButton />
        </div>
      </div>

      <div className="mx-auto mt-3 max-w-7xl">
        <section className="space-y-4 px-3 lg:px-0">{children}</section>
      </div>

      <MobileBottomNav />
    </main>
  );
}