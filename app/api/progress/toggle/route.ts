import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCounselorPanel } from "@/lib/permissions";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  if (!canAccessCounselorPanel(session.user)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  try {
    const body = await request.json();

    const pathfinderId = String(body?.pathfinderId || "");
    const requirementId = String(body?.requirementId || "");
    const completed = Boolean(body?.completed);

    if (!pathfinderId || !requirementId) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes." },
        { status: 400 }
      );
    }

    const existing = await prisma.pathfinderProgress.findUnique({
      where: {
        pathfinderId_requirementId: {
          pathfinderId,
          requirementId
        }
      }
    });

    if (existing) {
      const updated = await prisma.pathfinderProgress.update({
        where: {
          pathfinderId_requirementId: {
            pathfinderId,
            requirementId
          }
        },
        data: {
          completed,
          completedAt: completed ? new Date() : null
        }
      });

      return NextResponse.json({ item: updated });
    }

    const created = await prisma.pathfinderProgress.create({
      data: {
        pathfinderId,
        requirementId,
        completed,
        completedAt: completed ? new Date() : null
      }
    });

    return NextResponse.json({ item: created });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao atualizar progresso." },
      { status: 500 }
    );
  }
}