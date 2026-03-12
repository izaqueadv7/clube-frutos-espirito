import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { announcementSchema } from "@/lib/validators/schemas";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();

  let where = {} as Record<string, unknown>;

  if (!session?.user) {
    where = { audience: "ALL" };
  } else if (session.user.role === "PATHFINDER") {
    where = { audience: { in: ["ALL", "PATHFINDER"] } };
  } else if (session.user.role === "PARENT") {
    where = { audience: { in: ["ALL", "PARENT"] } };
  }

  const items = await prisma.announcement.findMany({
    where,
    include: {
      author: {
        select: { name: true }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 15
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  if (session.user.role !== "LEADER") {
    return NextResponse.json({ error: "Apenas lideres podem publicar" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = announcementSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
  }

  const item = await prisma.announcement.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      audience: parsed.data.audience,
      authorId: session.user.id
    }
  });

  return NextResponse.json({ message: "Aviso publicado", item });
}
