import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessMediaPanel } from "@/lib/permissions";

export const runtime = "nodejs";

export async function GET() {
  const items = await prisma.galleryPhoto.findMany({
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
    const imageUrl = String(body?.imageUrl || "").trim();
    const imagePublicId = String(body?.imagePublicId || "").trim();
    const order = Number(body?.order || 0);

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Imagem é obrigatória." },
        { status: 400 }
      );
    }

    const item = await prisma.galleryPhoto.create({
      data: {
        title: title || null,
        imageUrl,
        imagePublicId: imagePublicId || null,
        order,
        createdById: session.user.id
      }
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar foto da galeria." },
      { status: 500 }
    );
  }
}