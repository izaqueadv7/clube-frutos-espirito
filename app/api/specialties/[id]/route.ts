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

    const item = await prisma.specialty.update({
      where: { id },
      data: {
        name: title,
        description: code,
        category,
        requirements: requirements.join("\n\n||REQ||\n\n")
      }
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Erro ao atualizar especialidade:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar especialidade." },
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
    await prisma.pathfinderSpecialty.deleteMany({
      where: { specialtyId: id }
    });

    await prisma.specialty.delete({
      where: { id }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao excluir especialidade:", error);
    return NextResponse.json(
      { error: "Erro ao excluir especialidade." },
      { status: 500 }
    );
  }
}