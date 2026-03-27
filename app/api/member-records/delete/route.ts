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
    const type = String(body?.type || "");
    const id = String(body?.id || "");

    if (!type || !id) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes." },
        { status: 400 }
      );
    }

    if (type === "specialty") {
      await prisma.pathfinderSpecialty.delete({
        where: { id }
      });

      return NextResponse.json({ ok: true });
    }

    if (type === "progress") {
      await prisma.pathfinderProgress.delete({
        where: { id }
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { error: "Tipo inválido." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erro ao excluir registro do membro:", error);
    return NextResponse.json(
      { error: "Erro ao excluir registro do membro." },
      { status: 500 }
    );
  }
}