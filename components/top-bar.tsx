import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export async function TopBar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-red-100 dark:border-zinc-800 bg-white/90 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-extrabold text-primary">
          Clube Frutos do Espírito
        </Link>

        <nav className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            href="/calendar"
            className="text-sm font-semibold text-ink hover:text-primary dark:text-slate-300"
          >
            Calendário
          </Link>

          <Link
            href="/announcements"
            className="text-sm font-semibold text-ink hover:text-primary dark:text-slate-300"
          >
            Avisos
          </Link>

          {session ? (
            <Link href="/dashboard">
              <Button
                variant="secondary"
                className="text-sm dark:bg-white dark:text-black"
              >
                Minha Área
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button className="text-sm">Entrar</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}