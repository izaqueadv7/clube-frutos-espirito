import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SpecialtiesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let pathfinderId: string | null = null;

  if (session.user.role === "PATHFINDER") {
    pathfinderId =
      (await prisma.pathfinder.findUnique({
        where: { userId: session.user.id }
      }))?.id ?? null;
  }

  if (session.user.role === "PARENT") {
    const parent = await prisma.parent.findUnique({
      where: { userId: session.user.id },
      include: { children: true }
    });
    pathfinderId = parent?.children[0]?.pathfinderId ?? null;
  }

  const assignments =
    session.user.role === "LEADER"
      ? await prisma.pathfinderSpecialty.findMany({
          include: {
            specialty: true,
            pathfinder: { include: { user: true } }
          },
          orderBy: { specialty: { name: "asc" } }
        })
      : await prisma.pathfinderSpecialty.findMany({
          where: { pathfinderId: pathfinderId ?? "" },
          include: { specialty: true },
          orderBy: { specialty: { name: "asc" } }
        });

  const grouped = {
    PENDING: assignments.filter((item: any) => item.status === "PENDING"),
    IN_PROGRESS: assignments.filter((item: any) => item.status === "IN_PROGRESS"),
    COMPLETED: assignments.filter((item: any) => item.status === "COMPLETED")
  };

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Módulo de Especialidades</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Visualize o progresso por status: pendente, em andamento e concluída.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4">
          <h2 className="mb-3 font-bold text-slate-700">Pendentes</h2>
          <div className="space-y-2">
            {grouped.PENDING.map((item: any) => (
              <div key={item.id} className="rounded-xl border border-red-100 p-3">
                <p className="font-semibold">{item.specialty.name}</p>
                <p className="text-xs text-slate-500">{item.specialty.category}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 font-bold text-slate-700">Em andamento</h2>
          <div className="space-y-2">
            {grouped.IN_PROGRESS.map((item: any) => (
              <div
                key={item.id}
                className="rounded-xl border border-yellow-200 bg-yellow-50 p-3"
              >
                <p className="font-semibold">{item.specialty.name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">{item.specialty.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 font-bold text-slate-700">Concluídas</h2>
          <div className="space-y-2">
            {grouped.COMPLETED.map((item: any) => (
              <div
                key={item.id}
                className="rounded-xl border border-green-200 bg-green-50 p-3"
              >
                <p className="font-semibold">{item.specialty.name}</p>
                <Badge className="bg-green-600 text-white">Concluída</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}