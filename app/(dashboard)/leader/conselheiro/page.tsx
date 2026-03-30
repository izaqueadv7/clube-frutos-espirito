import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { canAccessCounselorPanel } from "@/lib/permissions";

export default async function ConselheiroPanelPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!canAccessCounselorPanel(session.user)) redirect("/dashboard");

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Painel do Conselheiro</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-800">
          Área para acompanhamento e atualização do progresso das classes dos desbravadores.
        </p>
      </Card>

      <Card className="p-5">
        <div className="space-y-3">
          <Link
            href="/leader/conselheiro/progresso"
            className="block rounded-lg bg-primary px-4 py-3 font-semibold text-white"
          >
            Atualizar Progresso das Classes
          </Link>

          <Link
            href="/classes"
            className="block rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white"
          >
            Ver Classes
          </Link>
        </div>
      </Card>
    </div>
  );
}