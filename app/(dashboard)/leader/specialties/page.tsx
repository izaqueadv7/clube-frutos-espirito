import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { canAccessSecretaryPanel } from "@/lib/permissions";
import { GlobalSpecialtiesPanel } from "@/components/forms/global-specialties-panel";

export default async function LeaderSpecialtiesPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!canAccessSecretaryPanel(session.user)) redirect("/dashboard");

  const items = await prisma.specialty.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Gerenciar Especialidades</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Cadastre, edite e exclua especialidades globais do sistema.
        </p>
      </Card>

      <GlobalSpecialtiesPanel items={items} />
    </div>
  );
}