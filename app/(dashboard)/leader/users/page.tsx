import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { UserEditForm } from "@/components/forms/user-edit-form";

export default async function LeaderUsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "LEADER") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      primaryFunction: true,
      secondaryFunction: true,
      isAdmin: true,
      isMedia: true,
      canManageUsers: true,
      canManageContent: true,
      createdAt: true
    }
  });

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Gerenciar usuários</h1>
        <p className="mt-2 text-sm text-slate-600">
          Edite dados, funções e permissões dos usuários do sistema.
        </p>
      </Card>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="p-5">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-primary">{user.name}</h2>
              <p className="text-sm text-slate-600">{user.email}</p>
            </div>

            <UserEditForm
              user={{
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                primaryFunction: user.primaryFunction ?? "",
                secondaryFunction: user.secondaryFunction ?? "",
                isAdmin: user.isAdmin,
                isMedia: user.isMedia,
                canManageUsers: user.canManageUsers,
                canManageContent: user.canManageContent
              }}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}