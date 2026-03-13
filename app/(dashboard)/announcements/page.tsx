import { format } from "date-fns";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { AnnouncementForm } from "@/components/forms/announcement-form";

export default async function AnnouncementsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const where =
    session.user.role === "LEADER"
      ? {}
      : session.user.role === "PARENT"
        ? { audience: { in: ["ALL", "PARENT"] } }
        : { audience: { in: ["ALL", "PATHFINDER"] } };

  const announcements = await prisma.announcement.findMany({
    where,
    include: { author: true },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Sistema de Avisos</h1>
        <p className="mt-2 text-sm text-slate-600">Comunicados oficiais para pathfinders e pais.</p>
      </Card>

      {session.user.role === "LEADER" ? (
        <Card className="p-5">
          <h2 className="mb-3 text-lg font-bold text-primary">Novo aviso</h2>
          <AnnouncementForm />
        </Card>
      ) : null}

      <div className="space-y-3">
        {announcements.map((item: any) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-primary">{item.title}</h3>
              <span className="text-xs font-semibold text-slate-500">{item.audience}</span>
            </div>
            <p className="mt-2 text-sm text-slate-700">{item.content}</p>
            <p className="mt-2 text-xs text-slate-500">
              Por {item.author.name} em {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm")}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
