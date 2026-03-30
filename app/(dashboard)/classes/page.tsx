import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClassesBrowser } from "@/components/dashboard/classes-browser";

export default async function ClassesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const classes = await prisma.pathfinderClass.findMany({
    orderBy: { order: "asc" },
    include: {
      groups: {
        orderBy: { order: "asc" },
        include: {
          requirements: {
            orderBy: { order: "asc" }
          }
        }
      },
      requirements: {
        where: {
          groupId: null
        },
        orderBy: { order: "asc" }
      }
    }
  });

  const normalized = classes.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    category: item.category ?? "",
    order: item.order,
    groups: item.groups.map((group) => ({
      id: group.id,
      title: group.title,
      roman: group.roman,
      order: group.order,
      requirements: group.requirements.map((req) => ({
        id: req.id,
        title: req.title,
        details: req.details,
        marker: req.marker ?? "",
        level: req.level,
        order: req.order
      }))
    })),
    looseRequirements: item.requirements.map((req) => ({
      id: req.id,
      title: req.title,
      details: req.details,
      marker: req.marker ?? "",
      level: req.level,
      order: req.order
    }))
  }));

  return <ClassesBrowser items={normalized} />;
}