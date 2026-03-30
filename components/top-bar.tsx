import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export async function TopBar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-primary text-white shadow-md backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-extrabold text-white">
          Clube Frutos do Espírito
        </Link>

        <nav className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            href="/calendar"
            className="text-sm font-semibold text-white hover:text-white/90"
          >
            Calendário
          </Link>

          <Link
            href="/announcements"
            className="text-sm font-semibold text-white hover:text-white/90"
          >
            Avisos
          </Link>

          {session ? (
            <Link href="/dashboard">
              <span className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2 font-semibold text-primary shadow-sm transition hover:bg-slate-100">
                Minha Área
              </span>
            </Link>
          ) : (
            <Link href="/login">
              <span className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2 font-semibold text-primary shadow-sm transition hover:bg-slate-100">
                Entrar
              </span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}