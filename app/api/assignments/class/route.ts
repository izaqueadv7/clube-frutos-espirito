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

    const action = String(body?.action || "assign").trim();
    const pathfinderId = String(body?.pathfinderId || "").trim();
    const classId = String(body?.classId || "").trim();
    const requirementId = String(body?.requirementId || "").trim();
    const completedAtRaw = String(body?.completedAt || "").trim();

    if (!pathfinderId) {
      return NextResponse.json(
        { error: "Desbravador é obrigatório." },
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

    if (action === "assign") {
      if (!classId) {
        return NextResponse.json(
          { error: "Classe é obrigatória." },
          { status: 400 }
        );
      }

      const selectedClass = await prisma.pathfinderClass.findUnique({
        where: { id: classId },
        include: {
          requirements: {
            orderBy: { order: "asc" }
          }
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

      for (const requirement of selectedClass.requirements) {
        await prisma.pathfinderProgress.upsert({
          where: {
            pathfinderId_requirementId: {
              pathfinderId,
              requirementId: requirement.id
            }
          },
          update: {},
          create: {
            pathfinderId,
            requirementId: requirement.id,
            completed: false
          }
        });
      }

      return NextResponse.json({ ok: true });
    }

    if (action === "toggleRequirement") {
      if (!requirementId) {
        return NextResponse.json(
          { error: "Requisito é obrigatório." },
          { status: 400 }
        );
      }

      const current = await prisma.pathfinderProgress.findUnique({
        where: {
          pathfinderId_requirementId: {
            pathfinderId,
            requirementId
          }
        }
      });

      const nextCompleted = !current?.completed;

      await prisma.pathfinderProgress.upsert({
        where: {
          pathfinderId_requirementId: {
            pathfinderId,
            requirementId
          }
        },
        update: {
          completed: nextCompleted,
          completedAt: nextCompleted
            ? completedAtRaw
              ? new Date(`${completedAtRaw}T00:00:00`)
              : new Date()
            : null
        },
        create: {
          pathfinderId,
          requirementId,
          completed: true,
          completedAt: completedAtRaw
            ? new Date(`${completedAtRaw}T00:00:00`)
            : new Date()
        }
      });

      return NextResponse.json({ ok: true });
    }

    if (action === "completeAll") {
      if (!classId) {
        return NextResponse.json(
          { error: "Classe é obrigatória." },
          { status: 400 }
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

      const completedAt = completedAtRaw
        ? new Date(`${completedAtRaw}T00:00:00`)
        : new Date();

      for (const requirement of selectedClass.requirements) {
        await prisma.pathfinderProgress.upsert({
          where: {
            pathfinderId_requirementId: {
              pathfinderId,
              requirementId: requirement.id
            }
          },
          update: {
            completed: true,
            completedAt
          },
          create: {
            pathfinderId,
            requirementId: requirement.id,
            completed: true,
            completedAt
          }
        });
      }

      await prisma.pathfinder.update({
        where: { id: pathfinderId },
        data: {
          currentClassId: classId
        }
      });

      return NextResponse.json({ ok: true });
    }

    if (action === "removeClass") {
      if (!classId) {
        return NextResponse.json(
          { error: "Classe é obrigatória." },
          { status: 400 }
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

      await prisma.pathfinderProgress.deleteMany({
        where: {
          pathfinderId,
          requirementId: {
            in: selectedClass.requirements.map((item) => item.id)
          }
        }
      });

      if (pathfinder.currentClassId === classId) {
        await prisma.pathfinder.update({
          where: { id: pathfinderId },
          data: {
            currentClassId: null
          }
        });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { error: "Ação inválida." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erro ao gerenciar classe:", error);
    return NextResponse.json(
      { error: "Erro ao processar classe do desbravador." },
      { status: 500 }
    );
  }
}