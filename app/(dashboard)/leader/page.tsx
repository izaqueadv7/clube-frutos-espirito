import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { EventCreateForm } from "@/components/forms/event-create-form";
import { AnnouncementForm } from "@/components/forms/announcement-form";
import { SpecialtyCreateForm } from "@/components/forms/specialty-create-form";
import { SpecialtyStatusForm } from "@/components/forms/specialty-status-form";
import { ProgressUpdateForm } from "@/components/forms/progress-update-form";
import { AttendanceForm } from "@/components/forms/attendance-form";
import { NotificationTestForm } from "@/components/forms/notification-test-form";
import { canAccessFullLeaderPanel } from "@/lib/permissions";
import { PathfinderRegisterForm } from "@/components/forms/pathfinder-register-form";

export default async function LeaderPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canAccessFullLeaderPanel(session.user)) redirect("/dashboard");

  const [pathfinders, events, requirements, assignments, classes] =
    await Promise.all([
      prisma.pathfinder.findMany({
        include: { user: true, currentClass: true },
        take: 10,
        orderBy: { createdAt: "desc" }
      }),
      prisma.event.findMany({
        take: 10,
        orderBy: { date: "asc" }
      }),
      prisma.classRequirement.findMany({
        include: { class: true },
        take: 20,
        orderBy: { title: "asc" }
      }),
      prisma.pathfinderSpecialty.findMany({
        include: {
          specialty: true,
          pathfinder: { include: { user: true } }
        },
        take: 20,
        orderBy: { id: "desc" }
      }),
      prisma.pathfinderClass.findMany({
        orderBy: { order: "asc" }
      })
    ]);

  const innerCardClass =
    "rounded-2xl border page-line bg-app-card px-5 py-4 text-sm shadow-[0_4px_12px_rgba(0,0,0,0.08)]";

  return (
    <div className="space-y-4">
      <Card className="card-premium hover-lift">
        <h1 className="section-title">Painel Administrativo do Líder</h1>
        <p className="mt-2 text-sm text-app-secondary">
          Cadastre membros, atualize progresso, gerencie eventos e publique comunicados.
        </p>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="card-premium hover-lift">
          <h2 className="mb-3 text-lg font-bold text-primary">
            Registrar Desbravador
          </h2>
          <PathfinderRegisterForm
            classes={classes.map((item) => ({
              id: item.id,
              name: item.name
            }))}
          />
        </Card>

        <Card className="card-premium hover-lift">
          <h2 className="mb-3 text-lg font-bold text-primary">
            Criar Evento
          </h2>
          <EventCreateForm />
        </Card>
      </div>

      <Card className="card-premium hover-lift">
        <h2 className="mb-3 text-lg font-bold text-primary">
          Publicar Aviso
        </h2>
        <AnnouncementForm />
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="card-premium hover-lift">
          <h2 className="mb-3 text-lg font-bold text-primary">
            Gerenciar Especialidades
          </h2>
          <div className="space-y-4">
            <SpecialtyCreateForm />
            <div className="h-px bg-app-soft" />
            <SpecialtyStatusForm />
          </div>
        </Card>

        <Card className="card-premium hover-lift space-y-4 p-5">
          <div>
            <h2 className="mb-3 text-lg font-bold text-primary">
              Atualizar Progresso
            </h2>
            <ProgressUpdateForm />
          </div>

          <div className="h-px bg-app-soft" />

          <div>
            <h2 className="mb-3 text-lg font-bold text-primary">
              Registrar Presença
            </h2>
            <AttendanceForm />
          </div>

          <NotificationTestForm />
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="card-premium hover-lift">
          <h2 className="mb-3 text-lg font-bold text-primary">
            Últimos Desbravadores
          </h2>

          <div className="space-y-3">
            {pathfinders.map((item: any) => (
              <div key={item.id} className={innerCardClass}>
                <p className="text-xs text-app-muted">ID: {item.id}</p>
                <p className="mt-1 font-semibold text-app-primary">
                  {item.user.name}
                </p>
                <p className="mt-1 text-app-secondary">{item.user.email}</p>
                <p className="mt-1 text-app-secondary">
                  Classe: {item.currentClass?.name ?? "Não definida"}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="card-premium hover-lift">
          <h2 className="mb-3 text-lg font-bold text-primary">
            Próximos Eventos
          </h2>

          <div className="space-y-3">
            {events.map((item: any) => (
              <div key={item.id} className={innerCardClass}>
                <p className="text-xs text-app-muted">ID: {item.id}</p>
                <p className="mt-1 font-semibold text-app-primary">
                  {item.title}
                </p>
                <p className="mt-1 text-app-secondary">
                  {new Date(item.date).toLocaleString("pt-BR")}
                </p>
                <p className="mt-1 text-app-secondary">{item.location}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="card-premium hover-lift">
          <h2 className="mb-3 text-lg font-bold text-primary">
            Requirements IDs
          </h2>

          <div className="space-y-3">
            {requirements.map((item: any) => (
              <div key={item.id} className={innerCardClass}>
                <p className="text-xs text-app-muted">ID: {item.id}</p>
                <p className="mt-1 font-semibold text-app-primary">
                  {item.title}
                </p>
                <p className="mt-1 text-app-secondary">
                  Classe: {item.class.name}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="card-premium hover-lift">
          <h2 className="mb-3 text-lg font-bold text-primary">
            Atribuições de Especialidade
          </h2>

          <div className="space-y-3">
            {assignments.map((item: any) => (
              <div key={item.id} className={innerCardClass}>
                <p className="text-xs text-app-muted">
                  Assignment ID: {item.id}
                </p>
                <p className="mt-1 font-semibold text-app-primary">
                  {item.specialty.name}
                </p>
                <p className="mt-1 text-app-secondary">
                  Pathfinder: {item.pathfinder.user.name}
                </p>
                <p className="mt-1 text-app-secondary">
                  Status: {item.status}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}