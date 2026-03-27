import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessSecretaryPanel } from "@/lib/permissions";

export const runtime = "nodejs";

export async function GET() {
  try {
    const items = await prisma.specialty.findMany({
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Erro ao listar especialidades:", error);
    return NextResponse.json(
      { error: "Erro ao listar especialidades." },
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

    const title = String(body?.title || body?.name || "").trim();
    const code = String(body?.code || body?.description || "").trim();
    const category = String(body?.category || "").trim();
    const requirements = Array.isArray(body?.requirements)
      ? body.requirements
          .map((item: unknown) => String(item || "").trim())
          .filter((item: string) => item.length > 0)
      : String(body?.requirements || "")
          .split("||REQ||")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);

    if (!title || !code || !category) {
      return NextResponse.json(
        { error: "Título, código e categoria são obrigatórios." },
        { status: 400 }
      );
    }

    const existing = await prisma.specialty.findUnique({
      where: { name: title }
    });

    if (existing) {
      return NextResponse.json(
        { error: "Já existe uma especialidade com esse título." },
        { status: 409 }
      );
    }

    const item = await prisma.specialty.create({
      data: {
        name: title,
        description: code,
        category,
        requirements: requirements.join("\n\n||REQ||\n\n")
      }
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar especialidade:", error);
    return NextResponse.json(
      { error: "Erro ao criar especialidade." },
      { status: 500 }
    );
  }
}