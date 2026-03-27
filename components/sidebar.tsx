import Link from "next/link";
import { auth } from "@/lib/auth";
import { translateRole } from "@/lib/translate";
import {
  canAccessFullLeaderPanel,
  canAccessSecretaryPanel,
  canAccessMediaPanel,
  canAccessDirectorPanel,
  canAccessCounselorPanel
} from "@/lib/permissions";

const links = [
  { href: "/profile", label: "Usuário" },
  { href: "/dashboard", label: "Resumo" },
  { href: "/classes", label: "Classes" },
  { href: "/specialties", label: "Especialidades" },
  { href: "/calendar", label: "Calendário" },
  { href: "/announcements", label: "Avisos" },
  { href: "/bible", label: "Bíblia" }
];

export async function Sidebar() {
  const session = await auth();
  const role = session?.user?.role;

  return (
    <aside className="card h-fit p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">Acesso</p>

      <div className="mb-4">
        {session?.user?.image ? (
          <img
            src={session.user.image}
            alt="Foto do usuário"
            className="mb-3 h-16 w-16 rounded-full object-cover border"
          />
        ) : (
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border bg-slate-100 text-slate-500">
            {session?.user?.name?.[0] ?? "U"}
          </div>
        )}

        <p className="text-lg font-bold text-primary">
          {session?.user?.name ?? "Visitante"}
        </p>
        <p className="text-sm text-slate-600">
          {role ? translateRole(role) : "Visitante"}
        </p>
      </div>

      <div className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href as any}
            className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-red-50"
          >
            {link.label}
          </Link>
        ))}

        {role === "LEADER" ? (
          <>
            {canAccessFullLeaderPanel(session?.user) ? (
              <Link
                href="/leader"
                className="block rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white"
              >
                Painel Líder
              </Link>
            ) : null}

            {canAccessSecretaryPanel(session?.user) ? (
              <>
                <Link
                  href="/leader/users"
                  className="block rounded-lg bg-green-600 px-3 py-2 text-sm font-bold text-white hover:bg-green-700"
                >
                  Gerenciar Usuários
                </Link>

                <Link
                  href="/leader/approvals"
                  className="block rounded-lg bg-amber-500 px-3 py-2 text-sm font-bold text-white hover:bg-amber-600"
                >
                  Aprovar Cadastros
                </Link>

                <Link
                  href="/leader/secretaria"
                  className="block rounded-lg bg-pink-600 px-3 py-2 text-sm font-bold text-white hover:bg-pink-700"
                >
                  Painel da Secretária
                </Link>
              </>
            ) : null}

            {canAccessMediaPanel(session?.user) ? (
              <>
                <Link
                  href="/leader/highlights"
                  className="block rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Avisos Principais
                </Link>

                <Link
                  href="/leader/gallery"
                  className="block rounded-lg bg-purple-600 px-3 py-2 text-sm font-bold text-white hover:bg-purple-700"
                >
                  Galeria de Fotos
                </Link>

                <Link
                  href="/leader/media"
                  className="block rounded-lg bg-sky-600 px-3 py-2 text-sm font-bold text-white hover:bg-sky-700"
                >
                  Painel da Mídia
                </Link>
              </>
            ) : null}

             <Link
  href="/leader/parents/link"
  className="block rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700"
>
  Vincular Responsável
</Link>

            {canAccessDirectorPanel(session?.user) ? (
              <Link
                href="/leader/diretor"
                className="block rounded-lg bg-zinc-700 px-3 py-2 text-sm font-bold text-white hover:bg-zinc-800"
              >
                Painel do Diretor
              </Link>
            ) : null}

            {canAccessCounselorPanel(session?.user) ? (
              <Link
                href="/leader/conselheiro"
                className="block rounded-lg bg-orange-600 px-3 py-2 text-sm font-bold text-white hover:bg-orange-700"
              >
                Painel do Conselheiro
              </Link>
            ) : null}
            
            <Link
  href="/leader/specialties/register"
  className="block rounded-lg bg-teal-700 px-3 py-2 text-sm font-bold text-white hover:bg-teal-800"
>
  Registro de Especialidades
</Link>

<Link
  href="/leader/assignments"
  className="block rounded-lg bg-green-700 px-3 py-2 text-sm font-bold text-white hover:bg-green-800"
>
  Vincular Classes e Especialidades
</Link>

<Link
  href="/leader/classes/register"
  className="block rounded-lg bg-cyan-700 px-3 py-2 text-sm font-bold text-white hover:bg-cyan-800"
>
  Registro de Classes
</Link>

            <Link
          </>
        ) : null}

        {role === "PARENT" ? (
          <Link
            href="/parent"
            className="block rounded-lg bg-accent px-3 py-2 text-sm font-bold text-ink"
          >
            Portal dos Pais
          </Link>
        ) : null}
      </div>
    </aside>
  );
}