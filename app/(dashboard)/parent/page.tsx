import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/dashboard/progress-bar";

export default async function ParentPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "PARENT") redirect("/dashboard");

  const parent = await prisma.parent.findUnique({
    where: { userId: session.user.id },
    include: {
      children: {
        include: {
          pathfinder: {
            include: {
              user: true,
              currentClass: true,
              specialties: { include: { specialty: true } },
              progress: true,
              attendance: { include: { event: true } }
            }
          }
        }
      }
    }
  });

  const child = parent?.children[0]?.pathfinder;

  const totalReqs = child?.progress.length ?? 0;
  const completedReqs = child?.progress.filter((item) => item.completed).length ?? 0;
  const progressPct = totalReqs ? Math.round((completedReqs / totalReqs) * 100) : 0;

  const specialtyDone = child?.specialties.filter((item) => item.status === "COMPLETED").length ?? 0;
  const specialtyTotal = child?.specialties.length ?? 0;
  const specialtyPct = specialtyTotal ? Math.round((specialtyDone / specialtyTotal) * 100) : 0;

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Portal dos Pais</h1>
        <p className="mt-2 text-sm text-slate-600">Acompanhe o desenvolvimento espiritual e atividades do seu filho.</p>
      </Card>

      {!child ? (
        <Card className="p-5">
          <p className="text-sm text-slate-600">Nenhum filho vinculado ao seu cadastro.</p>
        </Card>
      ) : (
        <>
          <Card className="space-y-3 p-5">
            <h2 className="text-lg font-bold text-primary">{child.user.name}</h2>
            <p className="text-sm text-slate-600">Classe atual: {child.currentClass?.name ?? "Nao definida"}</p>
            <ProgressBar label="Progresso da classe" value={progressPct} />
            <ProgressBar label="Especialidades concluidas" value={specialtyPct} />
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 text-lg font-bold text-primary">Especialidades</h3>
            <div className="grid gap-2 md:grid-cols-2">
              {child.specialties.map((item) => (
                <div key={item.id} className="rounded-xl border border-red-100 p-3 text-sm">
                  <p className="font-semibold">{item.specialty.name}</p>
                  <p className="text-slate-600">Status: {item.status}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 text-lg font-bold text-primary">Frequencia</h3>
            <div className="space-y-2">
              {child.attendance.map((item) => (
                <div key={item.id} className="rounded-xl border border-red-100 p-3 text-sm">
                  <p className="font-semibold">{item.event.title}</p>
                  <p className="text-slate-600">Status: {item.status}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
