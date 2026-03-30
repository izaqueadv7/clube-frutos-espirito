import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { canManageAssignments } from "@/lib/permissions";
import { AssignmentManagerForm } from "@/components/forms/assignment-manager-form";

export default async function AssignmentsPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!canManageAssignments(session.user)) redirect("/dashboard");

  const pathfinders = await prisma.pathfinder.findMany({
    include: {
      user: true,
      currentClass: true,
      specialties: true
    },
    orderBy: {
      user: {
        name: "asc"
      }
    }
  });

  const classes = await prisma.pathfinderClass.findMany({
    orderBy: { order: "asc" }
  });

  const specialties = await prisma.specialty.findMany({
    orderBy: { name: "asc" }
  });

  const normalizedPathfinders = pathfinders.map((item) => ({
    id: item.id,
    name: item.user.name,
    email: item.user.email,
    currentClassId: item.currentClassId ?? "",
    specialtyIds: item.specialties.map((spec) => spec.specialtyId)
  }));

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Vincular Classes e Especialidades</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-800">
          Selecione o desbravador e vincule de forma rápida a classe e as especialidades.
        </p>
      </Card>

      <AssignmentManagerForm
        pathfinders={normalizedPathfinders}
        classes={classes}
        specialties={specialties}
      />
    </div>
  );
}