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

    const parentUserId = String(body?.parentUserId || "").trim();
    const pathfinderId = String(body?.pathfinderId || "").trim();
    const phone = String(body?.phone || "").trim();

    if (!parentUserId || !pathfinderId) {
      return NextResponse.json(
        { error: "Responsável e desbravador são obrigatórios." },
        { status: 400 }
      );
    }

    const parentUser = await prisma.user.findUnique({
      where: { id: parentUserId }
    });

    if (!parentUser || parentUser.role !== "PARENT") {
      return NextResponse.json(
        { error: "Usuário responsável inválido." },
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

    let parentProfile = await prisma.parent.findUnique({
      where: { userId: parentUserId }
    });

    if (!parentProfile) {
      parentProfile = await prisma.parent.create({
        data: {
          userId: parentUserId,
          phone: phone || null
        }
      });
    } else if (phone) {
      parentProfile = await prisma.parent.update({
        where: { id: parentProfile.id },
        data: {
          phone
        }
      });
    }

    const relation = await prisma.parentPathfinder.upsert({
      where: {
        parentId_pathfinderId: {
          parentId: parentProfile.id,
          pathfinderId
        }
      },
      update: {},
      create: {
        parentId: parentProfile.id,
        pathfinderId
      }
    });

    return NextResponse.json({ ok: true, relation });
  } catch (error) {
    console.error("Erro ao vincular responsável:", error);
    return NextResponse.json(
      { error: "Erro ao vincular responsável ao desbravador." },
      { status: 500 }
    );
  }
}