import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
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
      secondaryFunction: true
    }
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-4">
      <ProfileForm
        user={user}
        roleLabel={translateRole(user.role)}
      />
    </div>
  );
}