import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireLeader } from "@/lib/api-auth";

export async function GET(request: Request) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  const { searchParams } = new URL(request.url);
  const pathfinderId = searchParams.get("pathfinderId");

  const role = authResult.session.user.role;
  const userId = authResult.session.user.id;
  let resolvedPathfinderId = pathfinderId;

  if (role === "PATHFINDER") {
    const record = await prisma.pathfinder.findUnique({ where: { userId } });
    resolvedPathfinderId = record?.id ?? null;
  }

  if (role === "PARENT") {
    const parent = await prisma.parent.findUnique({
      where: { userId },
      include: { children: true }
    });
    resolvedPathfinderId = parent?.children[0]?.pathfinderId ?? null;
  }

  if (!resolvedPathfinderId && role !== "LEADER") {
    return NextResponse.json({ items: [] });
  }

  const catalog = await prisma.specialty.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });

  const assignments = resolvedPathfinderId
    ? await prisma.pathfinderSpecialty.findMany({
        where: { pathfinderId: resolvedPathfinderId },
        include: { specialty: true }
      })
    : [];

  return NextResponse.json({ catalog, assignments });
}

export async function POST(request: Request) {
  const authResult = await requireLeader();
  if ("error" in authResult) return authResult.error;

  const body = await request.json();

  const name = String(body.name ?? "").trim();
  const category = String(body.category ?? "").trim();
  const description = String(body.description ?? "").trim();
  const requirements = String(body.requirements ?? "").trim();

  if (!name || !category || !description || !requirements) {
    return NextResponse.json({ error: "Todos os campos da especialidade sao obrigatorios" }, { status: 400 });
  }

  const specialty = await prisma.specialty.create({
    data: {
      name,
      category,
      description,
      requirements
    }
  });

  return NextResponse.json({ message: "Especialidade criada", specialty });
}

export async function PATCH(request: Request) {
  const authResult = await requireLeader();
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const assignmentId = String(body.assignmentId ?? "");
  const status = body.status as "PENDING" | "IN_PROGRESS" | "COMPLETED";

  if (!assignmentId || !status) {
    return NextResponse.json({ error: "assignmentId e status sao obrigatorios" }, { status: 400 });
  }

  const updated = await prisma.pathfinderSpecialty.update({
    where: { id: assignmentId },
    data: {
      status,
      startedAt: status === "IN_PROGRESS" ? new Date() : undefined,
      completedAt: status === "COMPLETED" ? new Date() : null
    }
  });

  return NextResponse.json({ message: "Status atualizado", assignment: updated });
}
