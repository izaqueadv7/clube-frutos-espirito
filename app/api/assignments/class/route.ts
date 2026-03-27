import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageAssignments } from "@/lib/permissions";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || !canManageAssignments(session.user)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  try {
    const body = await request.json();

    const pathfinderId = String(body?.pathfinderId || "").trim();
    const classId = String(body?.classId || "").trim();

    if (!pathfinderId || !classId) {
      return NextResponse.json(
        { error: "Desbravador e classe são obrigatórios." },
        { status: 400 }
      );
    }

    const pathfinder = await prisma.pathfinder.findUnique({
      where: { id: pathfinderId }
    });

    if (!pathfinder) {
      return NextResponse.json(
        { error: "Desbravador não encontrado." },
        { status: 404 }
      );
    }

    const selectedClass = await prisma.pathfinderClass.findUnique({
      where: { id: classId },
      include: {
        requirements: true
      }
    });

    if (!selectedClass) {
      return NextResponse.json(
        { error: "Classe não encontrada." },
        { status: 404 }
      );
    }

    await prisma.pathfinder.update({
      where: { id: pathfinderId },
      data: {
        currentClassId: classId
      }
    });

    await prisma.pathfinderProgress.deleteMany({
      where: { pathfinderId }
    });

    for (const requirement of selectedClass.requirements) {
      await prisma.pathfinderProgress.create({
        data: {
          pathfinderId,
          requirementId: requirement.id,
          completed: false
        }
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao vincular classe:", error);
    return NextResponse.json(
      { error: "Erro ao vincular classe ao desbravador." },
      { status: 500 }
    );
  }
}