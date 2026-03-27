import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessSecretaryPanel } from "@/lib/permissions";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || !canAccessSecretaryPanel(session.user)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const eventId = String(body?.eventId || "");
    const presentIds = Array.isArray(body?.presentIds) ? body.presentIds : [];

    if (!eventId) {
      return NextResponse.json({ error: "Evento é obrigatório." }, { status: 400 });
    }

    const pathfinders = await prisma.pathfinder.findMany({
      select: { id: true }
    });

    for (const pathfinder of pathfinders) {
      const isPresent = presentIds.includes(pathfinder.id);

      await prisma.attendance.upsert({
        where: {
          eventId_pathfinderId: {
            eventId,
            pathfinderId: pathfinder.id
          }
        },
        update: {
          status: isPresent ? "PRESENT" : "ABSENT",
          checkInTime: isPresent ? new Date() : null
        },
        create: {
          eventId,
          pathfinderId: pathfinder.id,
          status: isPresent ? "PRESENT" : "ABSENT",
          checkInTime: isPresent ? new Date() : null
        }
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao registrar presença:", error);
    return NextResponse.json(
      { error: "Erro ao registrar presença." },
      { status: 500 }
    );
  }
}