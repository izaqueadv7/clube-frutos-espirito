import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireLeader, requireUser } from "@/lib/api-auth";

async function resolvePathfinderId(userId: string, role: "PATHFINDER" | "LEADER" | "PARENT") {
  if (role === "PATHFINDER") {
    return (await prisma.pathfinder.findUnique({ where: { userId } }))?.id ?? null;
  }

  if (role === "PARENT") {
    const parent = await prisma.parent.findUnique({
      where: { userId },
      include: { children: true }
    });
    return parent?.children[0]?.pathfinderId ?? null;
  }

  return null;
}

export async function GET(request: Request) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  const session = authResult.session;
  const url = new URL(request.url);
  const requestedPathfinderId = url.searchParams.get("pathfinderId");

  let pathfinderId = requestedPathfinderId;
  if (session.user.role !== "LEADER") {
    pathfinderId = await resolvePathfinderId(session.user.id, session.user.role);
  }

  if (!pathfinderId) {
    return NextResponse.json({ summary: null, items: [] });
  }

  const items = await prisma.pathfinderProgress.findMany({
    where: { pathfinderId },
    include: {
      requirement: {
        include: {
          class: true
        }
      }
    }
  });

  const total = items.length;
  const completed = items.filter((item) => item.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return NextResponse.json({
    summary: {
      total,
      completed,
      percentage
    },
    items
  });
}

export async function POST(request: Request) {
  const authResult = await requireLeader();
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const pathfinderId = String(body.pathfinderId ?? "");
  const requirementId = String(body.requirementId ?? "");
  const completed = Boolean(body.completed);

  if (!pathfinderId || !requirementId) {
    return NextResponse.json({ error: "pathfinderId e requirementId sao obrigatorios" }, { status: 400 });
  }

  const item = await prisma.pathfinderProgress.upsert({
    where: {
      pathfinderId_requirementId: {
        pathfinderId,
        requirementId
      }
    },
    update: {
      completed,
      completedAt: completed ? new Date() : null
    },
    create: {
      pathfinderId,
      requirementId,
      completed,
      completedAt: completed ? new Date() : null
    }
  });

  return NextResponse.json({ message: "Progresso atualizado", item });
}
