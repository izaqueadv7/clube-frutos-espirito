import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators/schemas";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email ja cadastrado" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        role
      }
    });

    if (role === "PATHFINDER") {
      await tx.pathfinder.create({ data: { userId: user.id } });
    }

    if (role === "PARENT") {
      await tx.parent.create({ data: { userId: user.id } });
    }

    return user;
  });

  return NextResponse.json({
    message: "Conta criada",
    user: { id: result.id, name: result.name, email: result.email, role: result.role }
  });
}
