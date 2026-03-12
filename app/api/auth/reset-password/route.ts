import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().min(20),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
  }

  const { token, password } = parsed.data;

  const resetRecord = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!resetRecord || resetRecord.expiresAt < new Date()) {
    return NextResponse.json({ error: "Token invalido ou expirado" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { email: resetRecord.email },
    data: { passwordHash }
  });

  await prisma.passwordResetToken.delete({ where: { token } });

  return NextResponse.json({ message: "Senha alterada com sucesso." });
}
