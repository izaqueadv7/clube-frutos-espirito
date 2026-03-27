import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessMediaPanel } from "@/lib/permissions";

export const runtime = "nodejs";

export async function GET() {
  const items = await prisma.featuredSlide.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }]
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || !canAccessMediaPanel(session.user)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  try {
    const body = await request.json();

    const title = String(body?.title || "").trim();
    const description = String(body?.description || "").trim();
    const imageUrl = String(body?.imageUrl || "").trim();
    const imagePublicId = String(body?.imagePublicId || "").trim();
    const linkUrl = String(body?.linkUrl || "").trim();
    const order = Number(body?.order || 0);

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: "Título e imagem são obrigatórios." },
        { status: 400 }
      );
    }

    const item = await prisma.featuredSlide.create({
      data: {
        title,
        description: description || null,
        imageUrl,
        imagePublicId: imagePublicId || null,
        linkUrl: linkUrl || null,
        order,
        createdById: session.user.id
      }
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar aviso principal:", error);
    return NextResponse.json(
      { error: "Erro ao criar aviso principal." },
      { status: 500 }
    );
  }
}