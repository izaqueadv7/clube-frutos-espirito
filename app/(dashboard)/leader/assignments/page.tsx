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
      specialties: {
        include: {
          specialty: true
        }
      },
      progress: {
        include: {
          requirement: true
        }
      }
    },
    orderBy: {
      user: {
        name: "asc"
      }
    }
  });

  const classesRaw = await prisma.pathfinderClass.findMany({
    orderBy: { order: "asc" },
    include: {
      groups: {
        orderBy: { order: "asc" },
        include: {
          requirements: {
            orderBy: { order: "asc" }
          }
        }
      },
      requirements: {
        where: { groupId: null },
        orderBy: { order: "asc" }
      }
    }
  });

  const specialtiesRaw = await prisma.specialty.findMany({
    orderBy: { name: "asc" },
    include: {
      area: true,
      items: {
        orderBy: { order: "asc" }
      }
    }
  });

  const normalizedPathfinders = pathfinders.map((item) => ({
    id: item.id,
    name: item.user.name,
    email: item.user.email,
    image: item.user.image ?? "",
    currentClassId: item.currentClassId ?? "",
    specialtyIds: item.specialties.map((spec) => spec.specialtyId),
    completedRequirementIds: item.progress
      .filter((progress) => progress.completed)
      .map((progress) => progress.requirementId)
  }));

  const classes = classesRaw.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category ?? undefined,
    order: item.order,
    groups: item.groups.map((group) => ({
      id: group.id,
      title: group.title,
      roman: group.roman,
      order: group.order,
      requirements: group.requirements.map((req) => ({
        id: req.id,
        title: req.title,
        details: req.details,
        marker: req.marker ?? undefined,
        level: req.level ?? 0,
        order: req.order
      }))
    })),
    requirements: item.requirements.map((req) => ({
      id: req.id,
      title: req.title,
      details: req.details,
      marker: req.marker ?? undefined,
      level: req.level ?? 0,
      order: req.order
    }))
  }));

  const specialties = specialtiesRaw.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    code: item.code ?? undefined,
    description: item.description ?? undefined,
    area: item.area
      ? {
          id: item.area.id,
          name: item.area.name
        }
      : null,
    items: item.items.map((req) => ({
      id: req.id,
      text: req.text,
      marker: req.marker ?? undefined,
      level: req.level ?? 0,
      order: req.order
    }))
  }));

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Vínculos de Classes e Especialidades</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Selecione o desbravador e gerencie classes, requisitos e especialidades.
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