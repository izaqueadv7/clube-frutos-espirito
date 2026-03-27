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
    const specialtyIds = Array.isArray(body?.specialtyIds) ? body.specialtyIds : [];

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

    await prisma.pathfinderSpecialty.deleteMany({
      where: { pathfinderId }
    });

    for (const specialtyId of specialtyIds) {
      const id = String(specialtyId || "").trim();
      if (!id) continue;

      await prisma.pathfinderSpecialty.create({
        data: {
          pathfinderId,
          specialtyId: id,
          status: "PENDING"
        }
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao vincular especialidades:", error);
    return NextResponse.json(
      { error: "Erro ao vincular especialidades ao desbravador." },
      { status: 500 }
    );
  }
}