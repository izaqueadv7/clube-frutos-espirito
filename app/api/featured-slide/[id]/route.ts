import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessMediaPanel } from "@/lib/permissions";
import { cloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();

  if (!session?.user || !canAccessMediaPanel(session.user)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const item = await prisma.featuredSlide.update({
      where: { id },
      data: {
        title: body?.title,
        description: body?.description,
        imageUrl: body?.imageUrl,
        imagePublicId: body?.imagePublicId,
        linkUrl: body?.linkUrl,
        order: typeof body?.order === "number" ? body.order : undefined,
        isActive: typeof body?.isActive === "boolean" ? body.isActive : undefined
      }
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Erro ao atualizar aviso principal:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar aviso principal." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();

  if (!session?.user || !canAccessMediaPanel(session.user)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const item = await prisma.featuredSlide.findUnique({
      where: { id },
      select: {
        id: true,
        imagePublicId: true
      }
    });

    if (!item) {
      return NextResponse.json({ error: "Aviso não encontrado." }, { status: 404 });
    }

    if (item.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(item.imagePublicId);
      } catch (cloudinaryError) {
        console.error("Erro ao excluir imagem no Cloudinary:", cloudinaryError);
      }
    }

    await prisma.featuredSlide.delete({
      where: { id }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao excluir aviso principal:", error);
    return NextResponse.json(
      { error: "Erro ao excluir aviso principal." },
      { status: 500 }
    );
  }
}