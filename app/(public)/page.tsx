import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { getVerseOfWeek } from "@/lib/content";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { NotificationPermission } from "@/components/pwa/notification-permission";

export default async function HomePage() {
  const verse = getVerseOfWeek();

  let events: Array<{ id: string; title: string; date: Date; location: string }> = [];
  let announcements: Array<{ id: string; title: string; content: string; createdAt: Date }> = [];

  try {
    events = await prisma.event.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 3,
      select: { id: true, title: true, date: true, location: true }
    });

    announcements = await prisma.announcement.findMany({
      where: { audience: "ALL" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, title: true, content: true, createdAt: true }
    });
  } catch {
    events = [
      { id: "tmp1", title: "Reuniao Semanal", date: new Date(), location: "Igreja Central" }
    ];
    announcements = [
      {
        id: "tmp2",
        title: "Portal em construcao",
        content: "Conecte o banco PostgreSQL para exibir dados reais.",
        createdAt: new Date()
      }
    ];
  }

  return (
    <main>
      <NotificationPermission />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-16">
        <div className="space-y-6">
          <Badge className="bg-primary text-white">Portal Oficial</Badge>
          <h1 className="text-4xl font-extrabold leading-tight text-primary sm:text-5xl">
            Portal Frutos do Espirito
          </h1>
          <p className="max-w-xl text-lg text-slate-700">
            A plataforma digital do Clube de Desbravadores para acompanhar classes, especialidades,
            eventos e crescimento espiritual em um unico lugar.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/login">
              <Button>Entrar no Portal</Button>
            </Link>
            <InstallPrompt />
          </div>
          <Card className="p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Verso da semana</p>
            <p className="mt-2 text-lg font-semibold text-ink">{verse}</p>
          </Card>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="bg-primary px-6 py-5 text-white">
            <h2 className="text-xl font-bold">Sobre o Clube</h2>
            <p className="mt-2 text-sm text-red-50">
              Desenvolvimento fisico, mental e espiritual para criancas e adolescentes com base em servico,
              lideranca e discipulado.
            </p>
          </div>
          <div className="space-y-4 p-6">
            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-sm font-semibold text-primary">Identidade</p>
              <p className="text-sm text-slate-700">
                Cores oficiais: vermelho, amarelo e branco. Nosso lema e refletir o carater de Cristo em cada acao.
              </p>
            </div>
            <div className="rounded-xl bg-yellow-50 p-4">
              <p className="text-sm font-semibold text-amber-700">Acesso para familias</p>
              <p className="text-sm text-slate-700">
                Pais acompanham progresso e recebem comunicados em tempo real.
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Card className="p-5">
          <h3 className="section-title">Proximos eventos</h3>
          <div className="mt-4 space-y-3">
            {events.map((event) => (
              <div key={event.id} className="rounded-xl border border-red-100 p-3">
                <p className="font-semibold">{event.title}</p>
                <p className="text-sm text-slate-600">{format(new Date(event.date), "dd MMM yyyy, HH:mm", { locale: ptBR })}</p>
                <p className="text-sm text-slate-600">{event.location}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="section-title">Avisos recentes</h3>
          <div className="mt-4 space-y-3">
            {announcements.map((item) => (
              <div key={item.id} className="rounded-xl border border-red-100 p-3">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-slate-700">{item.content}</p>
                <p className="mt-1 text-xs text-slate-500">{format(new Date(item.createdAt), "dd/MM/yyyy")}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}
