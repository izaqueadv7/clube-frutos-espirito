import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { canAccessDirectorPanel } from "@/lib/permissions";

export default async function DiretorPanelPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!canAccessDirectorPanel(session.user)) redirect("/dashboard");

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Painel do Diretor</h1>
        <p className="mt-2 text-sm text-slate-600">
          Área estratégica para acompanhar usuários, aprovações, eventos e comunicação do clube.
        </p>
      </Card>

      <Card className="p-5">
        <div className="space-y-3">
          <a href="/leader/users" className="block rounded-lg bg-green-600 px-4 py-3 font-semibold text-white">
            Gerenciar Usuários
          </a>
          <a href="/leader/approvals" className="block rounded-lg bg-amber-500 px-4 py-3 font-semibold text-white">
            Aprovar Cadastros
          </a>
          <a href="/leader" className="block rounded-lg bg-primary px-4 py-3 font-semibold text-white">
            Painel Líder
          </a>
        </div>
      </Card>
    </div>
  );
}