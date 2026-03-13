import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/dashboard/progress-bar";

export default async function ClassesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const classes = await prisma.pathfinderClass.findMany({
    include: {
      requirements: true
    },
    orderBy: { order: "asc" }
  });

  let pathfinderId: string | null = null;

  if (session.user.role === "PATHFINDER") {
    pathfinderId = (await prisma.pathfinder.findUnique({ where: { userId: session.user.id } }))?.id ?? null;
  }

  if (session.user.role === "PARENT") {
    const parent = await prisma.parent.findUnique({ where: { userId: session.user.id }, include: { children: true } });
    pathfinderId = parent?.children[0]?.pathfinderId ?? null;
  }

  const progress = pathfinderId
    ? await prisma.pathfinderProgress.findMany({ where: { pathfinderId } })
    : [];

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Modulo de Classes</h1>
        <p className="mt-2 text-sm text-slate-600">
          Friend, Companion, Explorer, Ranger, Voyager e Guide com acompanhamento por requisito.
        </p>
      </Card>

      <div className="space-y-4">
        {classes.map((item: any) => {
          const reqs = item.requirements;
          const completed = reqs.filter((req: any) =>
            progress.some((p: any) => p.requirementId === req.id && p.completed)
          ).length;
          const pct = reqs.length ? Math.round((completed / reqs.length) * 100) : 0;

          return (
            <Card key={item.id} className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-primary">{item.name}</h2>
                <span className="text-xs text-slate-500">Ordem {item.order}</span>
              </div>
              <p className="text-sm text-slate-600">{item.description}</p>
              {session.user.role !== "LEADER" ? (
                <ProgressBar label="Progresso" value={pct} />
              ) : null}
              <div className="grid gap-2 md:grid-cols-2">
                {reqs.map((req: any) => (
                  <div key={req.id} className="rounded-xl border border-red-100 p-3 text-sm">
                    <p className="font-semibold">{req.title}</p>
                    <p className="text-slate-600">{req.details}</p>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
