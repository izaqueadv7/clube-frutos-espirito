import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  canAccessFullLeaderPanel,
  canAccessSecretaryPanel,
  canAccessMediaPanel,
  canAccessDirectorPanel,
  canAccessCounselorPanel,
  canManageAssignments
} from "@/lib/permissions";

export async function Sidebar() {
  const session = await auth();
  const user = session?.user;

  if (!user) return null;

  return (
    <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 lg:flex">
      <h2 className="mb-4 text-lg font-bold text-primary">Painel</h2>

      <div className="space-y-2">

        {/* Dashboard */}
        <Link href="/dashboard" className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-zinc-900">
          Dashboard
        </Link>

        {/* Liderança Geral */}
        {canAccessFullLeaderPanel(user) && (
          <Link href="/leader" className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-zinc-900">
            Painel Geral
          </Link>
        )}

        {/* Secretária */}
        {canAccessSecretaryPanel(user) && (
          <>
            <p className="mt-3 text-xs font-bold text-gray-400">SECRETARIA</p>

            <Link href="/leader/secretaria" className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-900">
              Painel Secretaria
            </Link>

            <Link href="/leader/secretaria/eventos" className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-900">
              Eventos
            </Link>

            <Link href="/leader/users" className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-900">
              Usuários
            </Link>
          </>
        )}

        {/* Mídia */}
        {canAccessMediaPanel(user) && (
          <>
            <p className="mt-3 text-xs font-bold text-gray-400">MÍDIA</p>

            <Link href="/leader/highlights" className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-900">
              Avisos Principais
            </Link>

            <Link href="/leader/gallery" className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-900">
              Galeria
            </Link>
          </>
        )}

        {/* Diretor */}
        {canAccessDirectorPanel(user) && (
          <>
            <p className="mt-3 text-xs font-bold text-gray-400">DIREÇÃO</p>

            <Link href="/leader/classes" className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-900">
              Gerenciar Classes
            </Link>

            <Link href="/leader/classes/register" className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-900">
              Registro de Classes
            </Link>

            <Link href="/leader/specialties" className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-900">
              Gerenciar Especialidades
            </Link>

            <Link href="/leader/specialties/registre" className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-900">
              Registro de Especialidades
            </Link>
          </>
        )}

        {/* Conselheiros */}
        {canAccessCounselorPanel(user) && (
          <>
            <p className="mt-3 text-xs font-bold text-gray-400">CONSELHEIRO</p>

            <Link href="/leader/progress" className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-900">
              Progresso
            </Link>
          </>
        )}

        {/* Vínculos */}
        {canManageAssignments(user) && (
          <>
            <p className="mt-3 text-xs font-bold text-gray-400">GERENCIAMENTO</p>

            <Link href="/leader/assignments" className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-900">
              Vincular Classes / Especialidades
            </Link>

            <Link href="/leader/parents/link" className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-900">
              Vincular Responsáveis
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}