import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { canAccessSecretaryPanel } from "@/lib/permissions";

export default async function SecretariaPanelPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!canAccessSecretaryPanel(session.user)) redirect("/dashboard");

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Painel da Secretária</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-800">
          Área para acompanhar cadastros, aprovações, usuários, presença e organização dos eventos do clube.
        </p>
      </Card>

      <Card className="p-5">
        <div className="space-y-3">
          <Link
            href="/leader/approvals"
            className="block rounded-lg bg-amber-500 px-4 py-3 font-semibold text-white"
          >
            Aprovar Cadastros
          </Link>

          <Link
            href="/leader/users"
            className="block rounded-lg bg-green-600 px-4 py-3 font-semibold text-white"
          >
            Gerenciar Usuários
          </Link>

          <Link
            href="/leader/secretaria/presenca"
            className="block rounded-lg bg-primary px-4 py-3 font-semibold text-white"
          >
            Registrar Presença
          </Link>

          <Link
            href="/leader/secretaria/eventos"
            className="block rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white"
          >
            Gerenciar Eventos
          </Link>

          <Link
  href="/leader/membros/registros"
  className="block rounded-lg bg-red-600 px-4 py-3 font-semibold text-white"
>
  Registros dos Membros
</Link>
        </div>
      </Card>
    </div>
  );
}