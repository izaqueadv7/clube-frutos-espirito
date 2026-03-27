import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessSecretaryPanel } from "@/lib/permissions";

export const runtime = "nodejs";

export async function GET() {
  try {
    const items = await prisma.pathfinderClass.findMany({
      include: {
        requirements: true
      },
      orderBy: { order: "asc" }
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Erro ao listar classes:", error);
    return NextResponse.json(
      { error: "Erro ao listar classes." },
      { status: 500 }
    );
  }
}

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

    if (!name || !description) {
      return NextResponse.json(
        { error: "Nome e descrição são obrigatórios." },
        { status: 400 }
      );
    }

    const item = await prisma.pathfinderClass.create({
      data: {
        name,
        description,
        order
      }
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar classe:", error);
    return NextResponse.json(
      { error: "Erro ao criar classe." },
      { status: 500 }
    );
  }
}