import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { ProfileForm } from "@/components/forms/profile-form";
import { translateRole } from "@/lib/translate";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!session.user.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      primaryFunction: true,
      secondaryFunction: true,
      birthDate: true
    }
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Meu Perfil</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Atualize suas informações, sua foto e sua senha.
        </p>
      </Card>

      <Card className="p-5">
        <div className="mb-4">
          <p className="font-bold text-primary">{user.name}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{user.email}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {translateRole(user.role)}
          </p>
        </div>

        <ProfileForm
          user={{
            ...user,
            birthDate: user.birthDate
              ? new Date(user.birthDate).toISOString().split("T")[0]
              : ""
          }}
        />
      </Card>
    </div>
  );
}