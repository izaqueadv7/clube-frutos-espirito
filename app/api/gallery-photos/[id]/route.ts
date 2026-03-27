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
    const item = await prisma.galleryPhoto.update({
      where: { id },
      data: {
        title: body?.title,
        imageUrl: body?.imageUrl,
        imagePublicId: body?.imagePublicId,
        order: typeof body?.order === "number" ? body.order : undefined,
        isActive: typeof body?.isActive === "boolean" ? body.isActive : undefined
      }
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao atualizar foto." },
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
    const item = await prisma.galleryPhoto.findUnique({
      where: { id }
    });

    if (!item) {
      return NextResponse.json({ error: "Foto não encontrada." }, { status: 404 });
    }

    if (item.imagePublicId) {
      await cloudinary.uploader.destroy(item.imagePublicId);
    }

    await prisma.galleryPhoto.delete({
      where: { id }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao excluir foto." },
      { status: 500 }
    );
  }
}