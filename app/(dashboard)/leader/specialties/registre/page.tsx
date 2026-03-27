import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { canAccessSecretaryPanel } from "@/lib/permissions";
import { SpecialtyRegisterForm } from "@/components/forms/specialty-register-form";

export default async function SpecialtyRegisterPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!canAccessSecretaryPanel(session.user)) redirect("/dashboard");

  const items = await prisma.specialty.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Registro de Especialidades</h1>
        <p className="mt-2 text-sm text-slate-600">
          Cadastre especialidades com título, código, categoria e vários requisitos.
        </p>
      </Card>

      <SpecialtyRegisterForm items={items} />
    </div>
  );
}