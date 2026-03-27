import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (!session.user.id) {
    return NextResponse.json({ error: "Usuário inválido." }, { status: 401 });
  }

  try {
    const body = await request.json();

    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const birthDateRaw = String(body?.birthDate || "").trim();
    const image = String(body?.image || "").trim();
    const currentPassword = String(body?.currentPassword || "");
    const newPassword = String(body?.newPassword || "");

    if (!name) {
      return NextResponse.json(
        { error: "O nome é obrigatório." },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "O email é obrigatório." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    const emailInUse = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: user.id
        }
      }
    });

    if (emailInUse) {
      return NextResponse.json(
        { error: "Esse email já está em uso por outra conta." },
        { status: 409 }
      );
    }

    let passwordHash = user.passwordHash;

    if (newPassword) {
      const passwordMatches = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );

      if (!passwordMatches) {
        return NextResponse.json(
          { error: "A senha atual está incorreta." },
          { status: 400 }
        );
      }

      passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        email,
        image: image || null,
        birthDate: birthDateRaw ? new Date(`${birthDateRaw}T00:00:00`) : null,
        passwordHash
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        birthDate: true
      }
    });

    return NextResponse.json({
      ok: true,
      user: updatedUser
    });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);

    return NextResponse.json(
      { error: "Erro interno ao atualizar perfil." },
      { status: 500 }
    );
  }
}