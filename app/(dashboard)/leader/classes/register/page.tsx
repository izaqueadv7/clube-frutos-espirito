import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { canAccessSecretaryPanel } from "@/lib/permissions";
import { ClassRegisterForm } from "@/components/forms/class-register-form";

export default async function ClassRegisterPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!canAccessSecretaryPanel(session.user)) redirect("/dashboard");

  const items = await prisma.pathfinderClass.findMany({
    include: {
      requirements: {
        orderBy: { title: "asc" }
      }
    },
    orderBy: { order: "asc" }
  });

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Registro de Classes</h1>
        <p className="mt-2 text-sm text-slate-600">
          Cadastre classes com grupos e vários requisitos em cada grupo.
        </p>
      </Card>

      <ClassRegisterForm items={items} />
    </div>
  );
}