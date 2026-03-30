import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { canAccessSecretaryPanel } from "@/lib/permissions";
import { SecretaryAttendancePanel } from "@/components/forms/secretary-attendance-panel";

export default async function SecretariaPresencaPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!canAccessSecretaryPanel(session.user)) redirect("/dashboard");

  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    include: {
      attendance: true
    }
  });

  const pathfinders = await prisma.pathfinder.findMany({
    include: {
      user: true
    },
    orderBy: {
      user: {
        name: "asc"
      }
    }
  });

  const normalizedEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    date: event.date,
    location: event.location,
    attendance: event.attendance.map((item) => ({
      pathfinderId: item.pathfinderId,
      status: item.status
    }))
  }));

  const normalizedPathfinders = pathfinders.map((item) => ({
    id: item.id,
    name: item.user.name
  }));

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Registrar Presença</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-800">
          Selecione um evento, filtre os nomes e registre a presença dos desbravadores.
        </p>
      </Card>

      <SecretaryAttendancePanel
        events={normalizedEvents}
        pathfinders={normalizedPathfinders}
      />
    </div>
  );
}