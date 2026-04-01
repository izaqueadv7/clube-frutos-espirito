import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { ApprovalActions } from "@/components/forms/approval-actions";
import { translateRole } from "@/lib/translate";
import { canAccessSecretaryPanel } from "@/lib/permissions";

export default async function ApprovalsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!canAccessSecretaryPanel(session.user)) {
  redirect("/dashboard");
}

  const users = await prisma.user.findMany({
    where: {
      status: "PENDING"
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  return (
    <div className="space-y-4">
      <Card className="card-premium hover-lift">
        <h1 className="section-title">Aprovação de cadastros</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-800">
          Aprove ou rejeite novos usuários cadastrados no portal.
        </p>
      </Card>

      {users.length === 0 ? (
        <Card className="p-5">
          <p className="text-sm text-slate-600 dark:text-slate-800">Nenhum cadastro pendente no momento.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id} className="p-5">
              <h2 className="text-lg font-bold text-primary">{user.name}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-800">{user.email}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-800">
  Perfil: {translateRole(user.role)}
</p>

              <div className="mt-4">
                <ApprovalActions userId={user.id} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}