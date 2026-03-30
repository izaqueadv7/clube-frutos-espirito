import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { canAccessSecretaryPanel } from "@/lib/permissions";
import { SecretaryEventsPanel } from "@/components/forms/secretary-events-panel";

export default async function SecretariaEventosPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!canAccessSecretaryPanel(session.user)) redirect("/dashboard");

  const events = await prisma.event.findMany({
    orderBy: { date: "asc" }
  });

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Gerenciar Eventos</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Crie, edite e exclua eventos do clube.
        </p>
      </Card>

      <SecretaryEventsPanel events={events} />
    </div>
  );
}