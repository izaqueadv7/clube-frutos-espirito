import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getVerseOfDay } from "@/lib/content";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { ProgressBar } from "@/components/dashboard/progress-bar";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const verseOfDay = getVerseOfDay();

  if (session.user.role === "LEADER") {
    const [pathfinders, events, announcements] = await Promise.all([
      prisma.pathfinder.count(),
      prisma.event.count(),
      prisma.announcement.count()
    ]);

    return (
      <>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Pathfinders" value={String(pathfinders)} subtitle="cadastros ativos" />
          <StatCard title="Eventos" value={String(events)} subtitle="total no calendario" />
          <StatCard title="Avisos" value={String(announcements)} subtitle="historico publicado" />
        </div>

        <Card className="p-5">
          <h2 className="section-title">Painel de liderança</h2>
          <p className="mt-2 text-sm text-slate-600">
            Use a área "Painel Lider" para cadastrar desbravadores, atualizar progresso,
            eventos, avisos e presença.
          </p>

          <div className="mt-4 space-y-2 rounded-xl bg-red-50 p-4 text-sm text-slate-700">
            <p>
              <strong>Função principal:</strong>{" "}
              {session.user.primaryFunction ?? "Não definida"}
            </p>
            <p>
              <strong>Função secundária:</strong>{" "}
              {session.user.secondaryFunction ?? "Nenhuma"}
            </p>
            <p>
              <strong>Administrador geral:</strong>{" "}
              {session.user.isAdmin ? "Sim" : "Não"}
            </p>
            <p>
              <strong>Responsável por mídia:</strong>{" "}
              {session.user.isMedia ? "Sim" : "Não"}
            </p>
            <p>
              <strong>Gerencia usuários:</strong>{" "}
              {session.user.canManageUsers ? "Sim" : "Não"}
            </p>
            <p>
              <strong>Gerencia conteúdo:</strong>{" "}
              {session.user.canManageContent ? "Sim" : "Não"}
            </p>
          </div>

          <p className="mt-4 rounded-xl bg-yellow-50 p-3 text-sm text-slate-700">
            Verso do dia: {verseOfDay}
          </p>
        </Card>
      </>
    );
  }

  if (session.user.role === "PARENT") {
    const parent = await prisma.parent.findUnique({
      where: { userId: session.user.id },
      include: {
        children: {
          include: {
            pathfinder: {
              include: {
                user: true,
                progress: true,
                specialties: true,
                currentClass: true
              }
            }
          }
        }
      }
    });

    const child = parent?.children[0]?.pathfinder;
    const total = child?.progress.length ?? 0;
    const completed = child?.progress.filter((item: any) => item.completed).length ?? 0;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

    return (
      <>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Filho(a)" value={child?.user.name ?? "-"} subtitle="perfil vinculado" />
          <StatCard title="Classe atual" value={child?.currentClass?.name ?? "-"} subtitle="nivel em andamento" />
          <StatCard title="Especialidades" value={String(child?.specialties.length ?? 0)} subtitle="total atribuido" />
        </div>

        <Card className="space-y-4 p-5">
          <h2 className="section-title">Acompanhamento do responsável</h2>
          <ProgressBar label="Progresso da classe" value={pct} />
          <p className="rounded-xl bg-yellow-50 p-3 text-sm text-slate-700">
            Verso do dia: {verseOfDay}
          </p>
        </Card>
      </>
    );
  }

  const pathfinder = await prisma.pathfinder.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      currentClass: true,
      specialties: { include: { specialty: true } },
      progress: {
        include: {
          requirement: {
            include: { class: true }
          }
        }
      }
    }
  });

  const completedReqs = pathfinder?.progress.filter((item: any) => item.completed).length ?? 0;
  const totalReqs = pathfinder?.progress.length ?? 0;
  const classProgress = totalReqs ? Math.round((completedReqs / totalReqs) * 100) : 0;

  const specialtyDone =
    pathfinder?.specialties.filter((item: any) => item.status === "COMPLETED").length ?? 0;
  const specialtyTotal = pathfinder?.specialties.length ?? 0;
  const specialtyProgress = specialtyTotal
    ? Math.round((specialtyDone / specialtyTotal) * 100)
    : 0;

  const nextEvent = await prisma.event.findFirst({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" }
  });

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Classe Atual" value={pathfinder?.currentClass?.name ?? "Nao definida"} subtitle="nivel" />
        <StatCard title="Requisitos" value={`${completedReqs}/${totalReqs}`} subtitle="concluidos" />
        <StatCard title="Especialidades" value={`${specialtyDone}/${specialtyTotal}`} subtitle="completas" />
      </div>

      <Card className="space-y-4 p-5">
        <h2 className="section-title">Meu progresso</h2>
        <ProgressBar label="Classe" value={classProgress} />
        <ProgressBar label="Especialidades" value={specialtyProgress} />
      </Card>

      <Card className="p-5">
        <h2 className="section-title">Próximo encontro</h2>
        {nextEvent ? (
          <>
            <p className="mt-2 text-lg font-semibold">{nextEvent.title}</p>
            <p className="text-sm text-slate-600">{nextEvent.location}</p>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-600">Nenhum evento agendado.</p>
        )}
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-slate-700">
          Verso do dia: {verseOfDay}
        </p>
      </Card>
    </>
  );
}
