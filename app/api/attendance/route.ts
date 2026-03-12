import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireLeader, requireUser } from "@/lib/api-auth";

export async function GET() {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  const session = authResult.session;

  if (session.user.role === "LEADER") {
    const items = await prisma.attendance.findMany({
      include: {
        event: true,
        pathfinder: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      orderBy: {
        event: {
          date: "desc"
        }
      }
    });

    return NextResponse.json({ items });
  }

  if (session.user.role === "PARENT") {
    const parent = await prisma.parent.findUnique({
      where: { userId: session.user.id },
      include: { children: true }
    });

    const ids = parent?.children.map((child) => child.pathfinderId) ?? [];

    const items = await prisma.attendance.findMany({
      where: { pathfinderId: { in: ids } },
      include: { event: true, pathfinder: { include: { user: true } } },
      orderBy: { event: { date: "desc" } }
    });

    return NextResponse.json({ items });
  }

  const pathfinder = await prisma.pathfinder.findUnique({
    where: { userId: session.user.id }
  });

  const items = await prisma.attendance.findMany({
    where: { pathfinderId: pathfinder?.id ?? "" },
    include: { event: true },
    orderBy: { event: { date: "desc" } }
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const authResult = await requireLeader();
  if ("error" in authResult) return authResult.error;

  const body = await request.json();

  const eventId = String(body.eventId ?? "");
  const pathfinderId = String(body.pathfinderId ?? "");
  const status = body.status as "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  const note = body.note ? String(body.note) : null;

  if (!eventId || !pathfinderId || !status) {
    return NextResponse.json({ error: "eventId, pathfinderId e status sao obrigatorios" }, { status: 400 });
  }

  const item = await prisma.attendance.upsert({
    where: {
      eventId_pathfinderId: {
        eventId,
        pathfinderId
      }
    },
    update: {
      status,
      note,
      checkInTime: new Date()
    },
    create: {
      eventId,
      pathfinderId,
      status,
      note,
      checkInTime: new Date()
    }
  });

  return NextResponse.json({ message: "Presenca registrada", item });
}
