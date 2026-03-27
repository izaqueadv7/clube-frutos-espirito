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
  if (!canAccessFullLeaderPanel(session.user)) {
  redirect("/dashboard");
}

  const [pathfinders, events, requirements, assignments, classes] = await Promise.all([
  prisma.pathfinder.findMany({ include: { user: true, currentClass: true }, take: 10, orderBy: { createdAt: "desc" } }),
  prisma.event.findMany({ take: 10, orderBy: { date: "asc" } }),
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

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Painel Administrativo do Lider</h1>
        <p className="mt-2 text-sm text-slate-600">
          Cadastre membros, atualize progresso, gerencie eventos e publique comunicados.
        </p>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-lg font-bold text-primary">Registrar Desbravador</h2>
          <PathfinderRegisterForm
  classes={classes.map((item) => ({
    id: item.id,
    name: item.name
  }))}
/>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-lg font-bold text-primary">Criar Evento</h2>
          <EventCreateForm />
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="mb-3 text-lg font-bold text-primary">Publicar Aviso</h2>
        <AnnouncementForm />
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-lg font-bold text-primary">Gerenciar Especialidades</h2>
          <div className="space-y-4">
            <SpecialtyCreateForm />
            <div className="h-px bg-red-100" />
            <SpecialtyStatusForm />
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <div>
            <h2 className="mb-3 text-lg font-bold text-primary">Atualizar Progresso</h2>
            <ProgressUpdateForm />
          </div>
          <div className="h-px bg-red-100" />
          <div>
            <h2 className="mb-3 text-lg font-bold text-primary">Registrar Presenca</h2>
            <AttendanceForm />
          </div>
          <NotificationTestForm />
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-lg font-bold text-primary">Ultimos Desbravadores</h2>
          <div className="space-y-2">
            {pathfinders.map((item: any) => (
              <div key={item.id} className="rounded-xl border border-red-100 p-3 text-sm">
                <p className="text-xs font-semibold text-slate-500">ID: {item.id}</p>
                <p className="font-semibold">{item.user.name}</p>
                <p className="text-slate-600">{item.user.email}</p>
                <p className="text-slate-600">Classe: {item.currentClass?.name ?? "Nao definida"}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-lg font-bold text-primary">Proximos Eventos</h2>
          <div className="space-y-2">
            {events.map((item: any) => (
              <div key={item.id} className="rounded-xl border border-red-100 p-3 text-sm">
                <p className="text-xs font-semibold text-slate-500">ID: {item.id}</p>
                <p className="font-semibold">{item.title}</p>
                <p className="text-slate-600">{new Date(item.date).toLocaleString("pt-BR")}</p>
                <p className="text-slate-600">{item.location}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-lg font-bold text-primary">Requirements IDs</h2>
          <div className="space-y-2">
            {requirements.map((item: any) => (
              <div key={item.id} className="rounded-xl border border-red-100 p-3 text-sm">
                <p className="text-xs font-semibold text-slate-500">ID: {item.id}</p>
                <p className="font-semibold">{item.title}</p>
                <p className="text-slate-600">Classe: {item.class.name}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-lg font-bold text-primary">Atribuicoes de Especialidade</h2>
          <div className="space-y-2">
            {assignments.map((item: any) => (
              <div key={item.id} className="rounded-xl border border-red-100 p-3 text-sm">
                <p className="text-xs font-semibold text-slate-500">Assignment ID: {item.id}</p>
                <p className="font-semibold">{item.specialty.name}</p>
                <p className="text-slate-600">Pathfinder: {item.pathfinder.user.name}</p>
                <p className="text-slate-600">Status: {item.status}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
