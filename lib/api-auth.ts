import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Nao autenticado" }, { status: 401 }) };
  }
  return { session };
}

export async function requireLeader() {
  const response = await requireUser();
  if ("error" in response) return response;

  if (response.session.user.role !== "LEADER") {
    return { error: NextResponse.json({ error: "Apenas lideres" }, { status: 403 }) };
  }

  return response;
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}
