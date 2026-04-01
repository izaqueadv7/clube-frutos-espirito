import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { FeaturedSlideForm } from "@/components/forms/featured-slide-form";
import { FeaturedSlideItemForm } from "@/components/forms/featured-slide-item-form";
import { canAccessMediaPanel } from "@/lib/permissions";

export default async function HighlightsPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!canAccessMediaPanel(session.user)) redirect("/dashboard");

  const items = await prisma.featuredSlide.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }]
  });

  return (
    <div className="space-y-4">
      <Card className="card-premium hover-lift">
        <h1 className="section-title">Avisos principais</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-800">
          Cadastre os cards que aparecerão em destaque na página inicial.
        </p>
      </Card>

      <Card className="p-5">
        <FeaturedSlideForm />
      </Card>

      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className="p-5">
            <FeaturedSlideItemForm item={item} />
          </Card>
        ))}
      </div>
    </div>
  );
}