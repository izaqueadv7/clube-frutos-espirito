import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessSecretaryPanel } from "@/lib/permissions";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();

  if (!session?.user || !canAccessSecretaryPanel(session.user)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();

    const item = await prisma.pathfinderClass.update({
      where: { id },
      data: {
        name: body?.name,
        description: body?.description,
        order: typeof body?.order === "number" ? body.order : undefined
      }
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Erro ao atualizar classe:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar classe." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();

  if (!session?.user || !canAccessSecretaryPanel(session.user)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { id } = await params;

  try {
    await prisma.classRequirement.deleteMany({
      where: { classId: id }
    });

    await prisma.pathfinderClass.delete({
      where: { id }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao excluir classe:", error);
    return NextResponse.json(
      { error: "Erro ao excluir classe." },
      { status: 500 }
    );
  }
}