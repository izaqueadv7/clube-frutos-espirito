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
    const specialtyId = String(body?.specialtyId || "").trim();
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

    if (!specialtyId) {
      return NextResponse.json(
        { error: "Especialidade é obrigatória." },
        { status: 400 }
      );
    }

    const specialty = await prisma.specialty.findUnique({
      where: { id: specialtyId }
    });

    if (!specialty) {
      return NextResponse.json(
        { error: "Especialidade não encontrada." },
        { status: 404 }
      );
    }

    if (action === "assign") {
      await prisma.pathfinderSpecialty.upsert({
        where: {
          pathfinderId_specialtyId: {
            pathfinderId,
            specialtyId
          }
        },
        update: {
          status: "PENDING"
        },
        create: {
          pathfinderId,
          specialtyId,
          status: "PENDING"
        }
      });

      return NextResponse.json({ ok: true });
    }

    if (action === "complete") {
      await prisma.pathfinderSpecialty.upsert({
        where: {
          pathfinderId_specialtyId: {
            pathfinderId,
            specialtyId
          }
        },
        update: {
          status: "COMPLETED",
          completedAt: completedAtRaw
            ? new Date(`${completedAtRaw}T00:00:00`)
            : new Date()
        },
        create: {
          pathfinderId,
          specialtyId,
          status: "COMPLETED",
          completedAt: completedAtRaw
            ? new Date(`${completedAtRaw}T00:00:00`)
            : new Date()
        }
      });

      return NextResponse.json({ ok: true });
    }

    if (action === "remove") {
      await prisma.pathfinderSpecialty.deleteMany({
        where: {
          pathfinderId,
          specialtyId
        }
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { error: "Ação inválida." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erro ao gerenciar especialidade:", error);
    return NextResponse.json(
      { error: "Erro ao processar especialidade do desbravador." },
      { status: 500 }
    );
  }
}