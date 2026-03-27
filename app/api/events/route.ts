import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessSecretaryPanel } from "@/lib/permissions";

export const runtime = "nodejs";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: "asc" }
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Erro ao listar eventos:", error);
    return NextResponse.json(
      { error: "Erro ao listar eventos." },
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

    const title = String(body?.title || "").trim();
    const description = String(body?.description || "").trim();
    const location = String(body?.location || "").trim();
    const rawDate = String(body?.date || "").trim();

    if (!title || !location || !rawDate) {
      return NextResponse.json(
        { error: "Título, local e data são obrigatórios." },
        { status: 400 }
      );
    }

    const parsedDate = new Date(rawDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Data inválida." },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description: description || "",
        location,
        date: parsedDate
      }
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    return NextResponse.json(
      { error: "Erro ao criar evento." },
      { status: 500 }
    );
  }
}