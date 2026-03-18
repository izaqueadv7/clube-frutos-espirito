import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  if (session.user.role !== "LEADER") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      primaryFunction: true,
      secondaryFunction: true,
      isAdmin: true,
      isMedia: true,
      canManageUsers: true,
      canManageContent: true,
      createdAt: true
    }
  });

  return NextResponse.json({ users });
}