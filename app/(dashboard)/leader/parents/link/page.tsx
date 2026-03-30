import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { canAccessSecretaryPanel } from "@/lib/permissions";
import { ParentLinkForm } from "@/components/forms/parent-link-form";

export default async function ParentLinkPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!canAccessSecretaryPanel(session.user)) redirect("/dashboard");

  const parents = await prisma.user.findMany({
    where: { role: "PARENT" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true
    }
  });

  const pathfinders = await prisma.pathfinder.findMany({
    include: {
      user: true
    },
    orderBy: {
      user: {
        name: "asc"
      }
    }
  });

  const normalizedPathfinders = pathfinders.map((item) => ({
    id: item.id,
    name: item.user.name,
    email: item.user.email
  }));

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Vincular Responsável ao Desbravador</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Escolha um responsável já cadastrado e vincule ao desbravador.
        </p>
      </Card>

      <ParentLinkForm parents={parents} pathfinders={normalizedPathfinders} />
    </div>
  );
}