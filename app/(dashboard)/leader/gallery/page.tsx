import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { GalleryPhotoForm } from "@/components/forms/gallery-photo-form";
import { GalleryPhotoItemForm } from "@/components/forms/gallery-photo-item-form";
import { canAccessMediaPanel } from "@/lib/permissions";

export default async function GalleryPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!canAccessMediaPanel(session.user)) redirect("/dashboard");

  const items = await prisma.galleryPhoto.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }]
  });

  return (
    <div className="space-y-4">
      <Card className="card-premium hover-lift">
        <h1 className="section-title">Galeria de fotos</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-800">
          Cadastre as fotos que aparecerão na página inicial do clube.
        </p>
      </Card>

      <Card className="p-5">
        <GalleryPhotoForm />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className="p-5">
            <GalleryPhotoItemForm item={item} />
          </Card>
        ))}
      </div>
    </div>
  );
}