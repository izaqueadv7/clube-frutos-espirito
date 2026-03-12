import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireLeader } from "@/lib/api-auth";

export async function POST() {
  const authResult = await requireLeader();
  if ("error" in authResult) return authResult.error;

  const count = await prisma.pushSubscription.count();

  return NextResponse.json({
    message: "Rotina de envio pronta. Integre web-push ou FCM para envio real.",
    subscribers: count
  });
}
