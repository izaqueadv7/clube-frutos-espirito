import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { UserManagementPanel } from "@/components/forms/user-management-panel";
import { canAccessSecretaryPanel } from "@/lib/permissions";

export default async function LeaderUsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!canAccessSecretaryPanel(session.user)) {
  redirect("/dashboard");
}

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      primaryFunction: true,
      secondaryFunction: true,
      isAdmin: true,
      isMedia: true,
      canManageUsers: true,
      canManageContent: true,
      isActive: true
    }
  });

  const normalizedUsers = users.map((user) => ({
    ...user,
    primaryFunction: user.primaryFunction ?? "",
    secondaryFunction: user.secondaryFunction ?? ""
  }));

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Gerenciar usuários</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-800">
          Edite dados, funções e permissões dos usuários do sistema.
        </p>
      </Card>

      <UserManagementPanel users={normalizedUsers} />
    </div>
  );
}