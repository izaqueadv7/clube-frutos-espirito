import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { canAccessSecretaryPanel } from "@/lib/permissions";
import { MemberRecordsPanel } from "@/components/forms/member-records-panel";
import { translateClassName, translateSpecialtyStatus } from "@/lib/translate";

export default async function MemberRecordsPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!canAccessSecretaryPanel(session.user)) redirect("/dashboard");

  const pathfinders = await prisma.pathfinder.findMany({
    include: {
      user: true,
      currentClass: true,
      progress: {
        include: {
          requirement: true
        }
      },
      specialties: {
        include: {
          specialty: true
        }
      }
    },
    orderBy: {
      user: {
        name: "asc"
      }
    }
  });

  const normalized = pathfinders.map((item) => ({
    id: item.id,
    name: item.user.name,
    email: item.user.email,
    currentClass: item.currentClass
      ? translateClassName(item.currentClass.name)
      : null,
    progress: item.progress.map((p) => ({
      id: p.id,
      title: p.requirement.title,
      details: p.requirement.details,
      completed: p.completed
    })),
    specialties: item.specialties.map((s) => ({
      id: s.id,
      name: s.specialty.name,
      category: s.specialty.category,
      status: translateSpecialtyStatus(s.status)
    }))
  }));

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Registros dos Membros</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-800">
          Gerencie e exclua registros de progresso de classes e especialidades por membro.
        </p>
      </Card>

      <MemberRecordsPanel pathfinders={normalized} />
    </div>
  );
}