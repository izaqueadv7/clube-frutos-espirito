import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    take: 30
  });

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Calendario do Clube</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-800">
          Reunioes, acampamentos, investiduras e atividades especiais.
        </p>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {events.map((event: any) => (
          <Card key={event.id} className="space-y-2 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Evento</p>
            <h2 className="text-lg font-bold text-primary">{event.title}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-800">{event.description}</p>
            <p className="text-sm font-semibold text-ink">{format(new Date(event.date), "dd MMM yyyy - HH:mm", { locale: ptBR })}</p>
            <p className="text-sm text-slate-600 dark:text-slate-800">{event.location}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
