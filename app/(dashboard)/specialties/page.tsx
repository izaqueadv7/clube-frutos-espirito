import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SpecialtiesBrowser } from "@/components/dashboard/specialties-browser";

export default async function SpecialtiesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const areas = await prisma.specialtyArea.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: {
      specialties: {
        orderBy: [{ name: "asc" }],
        include: {
          items: {
            orderBy: { order: "asc" }
          }
        }
      }
    }
  });

  const normalized = areas
    .map((area) => ({
      id: area.id,
      name: area.name,
      slug: area.slug,
      order: area.order,
      specialties: area.specialties.map((specialty) => ({
        id: specialty.id,
        name: specialty.name,
        slug: specialty.slug ?? "",
        code: specialty.code ?? "",
        category: specialty.category,
        description: specialty.description,
        order: specialty.order,
        requirements: specialty.items.map((req) => ({
          id: req.id,
          text: req.text,
          marker: req.marker ?? "",
          level: req.level,
          order: req.order
        }))
      }))
    }))
    .filter((area) => area.specialties.length > 0);

  return <SpecialtiesBrowser items={normalized} />;
}