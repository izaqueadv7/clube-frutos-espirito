import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { canAccessCounselorPanel } from "@/lib/permissions";
import { CounselorProgressPanel } from "@/components/forms/counselor-progress-panel";
import { translateClassName } from "@/lib/translate";

export default async function ConselheiroProgressPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!canAccessCounselorPanel(session.user)) redirect("/dashboard");

  const pathfinders = await prisma.pathfinder.findMany({
    include: {
      user: true,
      currentClass: {
        include: {
          requirements: true
        }
      },
      progress: true
    },
    orderBy: {
      user: {
        name: "asc"
      }
    }
  });

  const normalized = pathfinders.map((pathfinder) => ({
    id: pathfinder.id,
    name: pathfinder.user.name,
    email: pathfinder.user.email,
    currentClass: pathfinder.currentClass
      ? {
          id: pathfinder.currentClass.id,
          name: translateClassName(pathfinder.currentClass.name),
          requirements: pathfinder.currentClass.requirements.map((req) => ({
            id: req.id,
            title: req.title,
            details: req.details
          }))
        }
      : null,
    progress: pathfinder.progress.map((item) => ({
      requirementId: item.requirementId,
      completed: item.completed
    }))
  }));

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Progresso das Classes</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Marque ou desmarque os requisitos concluídos dos desbravadores.
        </p>
      </Card>

      <CounselorProgressPanel pathfinders={normalized} />
    </div>
  );
}