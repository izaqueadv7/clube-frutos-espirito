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

    const name = String(body?.name || "").trim();
    const description = String(body?.description || "").trim();
    const order = Number(body?.order || 0);
    const groups = Array.isArray(body?.groups) ? body.groups : [];

    if (!name || !description) {
      return NextResponse.json(
        { error: "Título e descrição são obrigatórios." },
        { status: 400 }
      );
    }

    const existing = await prisma.pathfinderClass.findUnique({
      where: { name }
    });

    if (existing) {
      return NextResponse.json(
        { error: "Já existe uma classe com esse título." },
        { status: 409 }
      );
    }

    const createdClass = await prisma.pathfinderClass.create({
      data: {
        name,
        description,
        order
      }
    });

    for (const group of groups) {
      const groupTitle = String(group?.title || "").trim();
      const requirements = Array.isArray(group?.requirements)
        ? group.requirements
            .map((item: unknown) => String(item || "").trim())
            .filter((item: string) => item.length > 0)
        : [];

      if (!groupTitle || requirements.length === 0) continue;

      await prisma.classRequirement.create({
        data: {
          classId: createdClass.id,
          title: groupTitle,
          details: requirements.join("\n\n||ITEM||\n\n")
        }
      });
    }

    return NextResponse.json({ ok: true, item: createdClass }, { status: 201 });
  } catch (error) {
    console.error("Erro ao cadastrar classe:", error);
    return NextResponse.json(
      { error: "Erro ao cadastrar classe." },
      { status: 500 }
    );
  }
}