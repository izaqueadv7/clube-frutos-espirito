import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireLeader, requireUser } from "@/lib/api-auth";

export async function GET() {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  const classes = await prisma.pathfinderClass.findMany({
    include: {
      requirements: {
        orderBy: { title: "asc" }
      }
    },
    orderBy: { order: "asc" }
  });

  return NextResponse.json({ items: classes });
}

export async function POST(request: Request) {
  const authResult = await requireLeader();
  if ("error" in authResult) return authResult.error;

  const body = await request.json();

  if (body.mode === "class") {
    const item = await prisma.pathfinderClass.create({
      data: {
        name: String(body.name ?? ""),
        description: String(body.description ?? ""),
        order: Number(body.order ?? 99)
      }
    });

    return NextResponse.json({ message: "Classe criada", item });
  }

  const classId = String(body.classId ?? "");
  const title = String(body.title ?? "");
  const details = String(body.details ?? "");
  const points = Number(body.points ?? 1);

  if (!classId || !title || !details) {
    return NextResponse.json({ error: "classId, title e details sao obrigatorios" }, { status: 400 });
  }

  const item = await prisma.classRequirement.create({
    data: {
      classId,
      title,
      details,
      points
    }
  });

  return NextResponse.json({ message: "Requisito criado", item });
}
