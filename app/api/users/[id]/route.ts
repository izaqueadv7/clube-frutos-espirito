import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: Params) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  if (session.user.role !== "LEADER") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const role = body?.role as "PATHFINDER" | "LEADER" | "PARENT";
  const primaryFunction = String(body?.primaryFunction || "").trim();
  const secondaryFunction = String(body?.secondaryFunction || "").trim();

  const isAdmin = Boolean(body?.isAdmin);
  const isMedia = Boolean(body?.isMedia);
  const canManageUsers = Boolean(body?.canManageUsers);
  const canManageContent = Boolean(body?.canManageContent);

  if (!name || !email || !role) {
    return NextResponse.json({ error: "Nome, email e perfil são obrigatórios." }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({
    where: {
      email,
      NOT: { id }
    }
  });

  if (existing) {
    return NextResponse.json({ error: "Já existe outro usuário com esse email." }, { status: 409 });
  }

  const data: {
    name: string;
    email: string;
    role: "PATHFINDER" | "LEADER" | "PARENT";
    primaryFunction: string | null;
    secondaryFunction: string | null;
    isAdmin: boolean;
    isMedia: boolean;
    canManageUsers: boolean;
    canManageContent: boolean;
    passwordHash?: string;
  } = {
    name,
    email,
    role,
    primaryFunction: primaryFunction || null,
    secondaryFunction: secondaryFunction || null,
    isAdmin,
    isMedia,
    canManageUsers,
    canManageContent
  };

  if (password) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
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
      canManageContent: true
    }
  });

  return NextResponse.json({ user });
}