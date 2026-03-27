import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { canAccessSecretaryPanel } from "@/lib/permissions";
import { GlobalClassesPanel } from "@/components/forms/global-classes-panel";
import { translateClassName } from "@/lib/translate";

export default async function LeaderClassesPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!canAccessSecretaryPanel(session.user)) redirect("/dashboard");

  const classes = await prisma.pathfinderClass.findMany({
    include: {
      requirements: true
    },
    orderBy: { order: "asc" }
  });

  const normalized = classes.map((item) => ({
    id: item.id,
    name: translateClassName(item.name),
    originalName: item.name,
    description: item.description,
    order: item.order,
    requirementsCount: item.requirements.length
  }));

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Gerenciar Classes</h1>
        <p className="mt-2 text-sm text-slate-600">
          Cadastre, edite e exclua classes globais do sistema.
        </p>
      </Card>

      <GlobalClassesPanel items={normalized} />
    </div>
  );
}