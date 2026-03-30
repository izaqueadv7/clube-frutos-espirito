import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getVerseOfDay } from "@/lib/content";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { translateClassName, translateRole, translateSpecialtyStatus } from "@/lib/translate";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const verseOfDay = getVerseOfDay();

  if (session.user.role === "LEADER") {
    const [
      totalPathfinders,
      totalLeaders,
      totalParents,
      pendingUsers,
      totalEvents,
      upcomingEvents,
      totalClasses,
      totalSpecialties,
      recentUsers
    ] = await Promise.all([
      prisma.pathfinder.count(),
      prisma.user.count({ where: { role: "LEADER" } }),
      prisma.user.count({ where: { role: "PARENT" } }),
      prisma.user.count({ where: { status: "PENDING" } }),
      prisma.event.count(),
      prisma.event.findMany({
        where: { date: { gte: new Date() } },
        orderBy: { date: "asc" },
        take: 5
      }),
      prisma.pathfinderClass.count(),
      prisma.specialty.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true
        }
      })
    ]);

    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Desbravadores" value={String(totalPathfinders)} subtitle="cadastros ativos" />
          <StatCard title="Líderes" value={String(totalLeaders)} subtitle="usuários líderes" />
          <StatCard title="Responsáveis" value={String(totalParents)} subtitle="pais vinculados" />
          <StatCard title="Pendentes" value={String(pendingUsers)} subtitle="aguardando aprovação" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Eventos" value={String(totalEvents)} subtitle="total cadastrado" />
          <StatCard title="Próximos eventos" value={String(upcomingEvents.length)} subtitle="eventos futuros" />
          <StatCard title="Classes" value={String(totalClasses)} subtitle="classes globais" />
          <StatCard title="Especialidades" value={String(totalSpecialties)} subtitle="especialidades globais" />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="p-5">
            <h2 className="section-title">Próximos eventos</h2>

            <div className="mt-4 space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">Nenhum evento agendado.</p>
              ) : (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="rounded-xl border p-3 text-sm">
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-slate-600 dark:text-slate-300">{event.location}</p>
                    <p className="text-slate-600 dark:text-slate-300">
                      {new Date(event.date).toLocaleString("pt-BR")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="section-title">Últimos usuários</h2>

            <div className="mt-4 space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="rounded-xl border p-3 text-sm">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-slate-600 dark:text-slate-300">{user.email}</p>
                  <p className="text-slate-600 dark:text-slate-300">
                    Perfil: {translateRole(user.role)}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    Status: {user.status}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <h2 className="section-title">Painel de liderança</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Use os menus de gerenciamento para usuários, aprovações, eventos, presença, galeria, avisos e progresso das classes.
          </p>
          <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-slate-700 dark:text-slate-300">
            Verso do dia: {verseOfDay}
          </p>
        </Card>
      </div>
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
                specialties: {
                  include: {
                    specialty: true
                  }
                },
                currentClass: true,
                attendance: {
                  include: {
                    event: true
                  },
                  orderBy: {
                    event: {
                      date: "desc"
                    }
                  },
                  take: 5
                }
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

    const specialtyDone =
      child?.specialties.filter((item: any) => item.status === "COMPLETED").length ?? 0;
    const specialtyTotal = child?.specialties.length ?? 0;
    const specialtyPct =
      specialtyTotal === 0 ? 0 : Math.round((specialtyDone / specialtyTotal) * 100);

    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Filho(a)" value={child?.user.name ?? "-"} subtitle="perfil vinculado" />
          <StatCard
            title="Classe atual"
            value={child?.currentClass ? translateClassName(child.currentClass.name) : "-"}
            subtitle="nível em andamento"
          />
          <StatCard
            title="Requisitos"
            value={`${completed}/${total}`}
            subtitle="concluídos"
          />
          <StatCard
            title="Especialidades"
            value={`${specialtyDone}/${specialtyTotal}`}
            subtitle="concluídas"
          />
        </div>

        <Card className="space-y-4 p-5">
          <h2 className="section-title">Acompanhamento do responsável</h2>
          <ProgressBar label="Progresso da classe" value={pct} />
          <ProgressBar label="Especialidades" value={specialtyPct} />
          <p className="rounded-xl bg-green-50 p-3 text-sm text-slate-700 dark:text-slate-300">
            Verso do dia: {verseOfDay}
          </p>
        </Card>

        <Card className="p-5">
          <h2 className="section-title">Últimas presenças</h2>

          <div className="mt-4 space-y-3">
            {child?.attendance.length ? (
              child.attendance.map((item: any) => (
                <div key={item.id} className="rounded-xl border p-3 text-sm">
                  <p className="font-semibold">{item.event.title}</p>
                  <p className="text-slate-600 dark:text-slate-300">{item.event.location}</p>
                  <p className="text-slate-600 dark:text-slate-300">
                    {new Date(item.event.date).toLocaleString("pt-BR")}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">Status: {item.status}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">Nenhum registro de presença.</p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  const pathfinder = await prisma.pathfinder.findUnique({
    where: { userId: session.user.id },
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
          requirement: {
            include: { class: true }
          }
        }
      },
      attendance: {
        include: {
          event: true
        },
        orderBy: {
          event: {
            date: "desc"
          }
        },
        take: 5
      }
    }
  });

  const completedReqs = pathfinder?.progress.filter((item: any) => item.completed).length ?? 0;
  const totalReqs = pathfinder?.progress.length ?? 0;
  const classProgress = totalReqs ? Math.round((completedReqs / totalReqs) * 100) : 0;

  const specialtyDone =
    pathfinder?.specialties.filter((item: any) => item.status === "COMPLETED").length ?? 0;
  const specialtyTotal = pathfinder?.specialties.length ?? 0;
  const specialtyProgress =
    specialtyTotal ? Math.round((specialtyDone / specialtyTotal) * 100) : 0;

  const nextEvent = await prisma.event.findFirst({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" }
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Classe Atual"
          value={pathfinder?.currentClass ? translateClassName(pathfinder.currentClass.name) : "Não definida"}
          subtitle="nível"
        />
        <StatCard
          title="Requisitos"
          value={`${completedReqs}/${totalReqs}`}
          subtitle="concluídos"
        />
        <StatCard
          title="Especialidades"
          value={`${specialtyDone}/${specialtyTotal}`}
          subtitle="completas"
        />
        <StatCard
          title="Próximo evento"
          value={nextEvent ? "Sim" : "Não"}
          subtitle={nextEvent ? nextEvent.title : "nenhum agendado"}
        />
      </div>

      <Card className="space-y-4 p-5">
        <h2 className="section-title">Meu progresso</h2>
        <ProgressBar label="Classe" value={classProgress} />
        <ProgressBar label="Especialidades" value={specialtyProgress} />
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="section-title">Próximo encontro</h2>
          {nextEvent ? (
            <>
              <p className="mt-2 text-lg font-semibold">{nextEvent.title}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{nextEvent.location}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {new Date(nextEvent.date).toLocaleString("pt-BR")}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Nenhum evento agendado.</p>
          )}
          <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-slate-700 dark:text-slate-300">
            Verso do dia: {verseOfDay}
          </p>
        </Card>

        <Card className="p-5">
          <h2 className="section-title">Minhas últimas presenças</h2>

          <div className="mt-4 space-y-3">
            {pathfinder?.attendance.length ? (
              pathfinder.attendance.map((item: any) => (
                <div key={item.id} className="rounded-xl border p-3 text-sm">
                  <p className="font-semibold">{item.event.title}</p>
                  <p className="text-slate-600 dark:text-slate-300">{item.event.location}</p>
                  <p className="text-slate-600 dark:text-slate-300">
                    {new Date(item.event.date).toLocaleString("pt-BR")}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">Status: {item.status}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">Nenhum registro de presença.</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="section-title">Minhas especialidades</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {pathfinder?.specialties.length ? (
            pathfinder.specialties.map((item: any) => (
              <div key={item.id} className="rounded-xl border p-3 text-sm">
                <p className="font-semibold">{item.specialty.name}</p>
                <p className="text-slate-600 dark:text-slate-300">{item.specialty.category}</p>
                <p className="text-slate-600 dark:text-slate-300">
                  Status: {translateSpecialtyStatus(item.status)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-300">Nenhuma especialidade atribuída.</p>
          )}
        </div>
      </Card>
    </div>
  );
}