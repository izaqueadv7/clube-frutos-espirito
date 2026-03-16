import Link from "next/link";
import { auth } from "@/lib/auth";

const links = [
  { href: "/dashboard", label: "Resumo" },
  { href: "/classes", label: "Classes" },
  { href: "/specialties", label: "Especialidades" },
  { href: "/calendar", label: "Calendario" },
  { href: "/announcements", label: "Avisos" },
  { href: "/bible", label: "Biblia" }
];

export async function Sidebar() {
  const session = await auth();
  const role = session?.user?.role;

  return (
    <aside className="card h-fit p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">Acesso</p>
      <p className="mb-4 text-lg font-bold text-primary">{session?.user?.name ?? "Visitante"}</p>
      <div className="space-y-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href as any} className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-red-50">
            {link.label}
          </Link>
        ))}
        {role === "LEADER" ? (
          <Link href="/leader" className="block rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white">
            Painel Lider
          </Link>
        ) : null}
        {role === "PARENT" ? (
          <Link href="/parent" className="block rounded-lg bg-accent px-3 py-2 text-sm font-bold text-ink">
            Portal Pais
          </Link>
        ) : null}
      </div>
    </aside>
  );
}
