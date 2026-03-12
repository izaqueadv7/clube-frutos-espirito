import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/validators/schemas";
import { requireLeader, requireUser } from "@/lib/api-auth";

export async function GET() {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  const now = new Date();
  const events = await prisma.event.findMany({
    where: { date: { gte: now } },
    orderBy: { date: "asc" },
    take: 20
  });

  return NextResponse.json({ items: events });
}

export async function POST(request: Request) {
  const authResult = await requireLeader();
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados do evento invalidos" }, { status: 400 });
  }

  const payload = parsed.data;

  const event = await prisma.event.create({
    data: {
      title: payload.title,
      description: payload.description,
      date: new Date(payload.date),
      location: payload.location
    }
  });

  return NextResponse.json({ message: "Evento criado", event });
}
