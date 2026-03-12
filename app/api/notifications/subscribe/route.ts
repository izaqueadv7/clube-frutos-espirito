import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";

export async function POST(request: Request) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  const body = await request.json();

  const endpoint = String(body.endpoint ?? "");
  const keys = body.keys ?? {};
  const p256dhKey = String(keys.p256dh ?? "");
  const authKey = String(keys.auth ?? "");

  if (!endpoint || !p256dhKey || !authKey) {
    return NextResponse.json({ error: "Assinatura invalida" }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: {
      p256dhKey,
      authKey,
      userId: authResult.session.user.id
    },
    create: {
      endpoint,
      p256dhKey,
      authKey,
      userId: authResult.session.user.id
    }
  });

  return NextResponse.json({ message: "Notificacoes ativadas" });
}
