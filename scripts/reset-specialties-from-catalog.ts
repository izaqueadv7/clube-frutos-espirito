import { PrismaClient } from "@prisma/client";
import catalogJson from "../data/specialties-catalog.json";

const prisma = new PrismaClient();

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

type CatalogItem = {
  area: string;
  code: string;
  name: string;
  description?: string;
};

const OFFICIAL_AREAS = [
  "ADRA",
  "Artes e habilidades manuais",
  "Atividades agrícolas",
  "Atividades missionárias",
  "Atividades profissionais",
  "Atividades recreativas",
  "Ciência e saúde",
  "Estudo da natureza",
  "Habilidades domésticas",
  "Mestrados"
] as const;

const items = catalogJson as CatalogItem[];

async function ensureAreas() {
  for (let i = 0; i < OFFICIAL_AREAS.length; i++) {
    const name = OFFICIAL_AREAS[i];

    await prisma.specialtyArea.upsert({
      where: { slug: slugify(name) },
      update: {
        name,
        order: i + 1
      },
      create: {
        name,
        slug: slugify(name),
        order: i + 1
      }
    });
  }
}

async function main() {
  const validSlugs = items.map((item) => slugify(`${item.code}-${item.name}`));

  console.log("Garantindo áreas oficiais...");
  await ensureAreas();

  console.log("Removendo progressos de requisitos de especialidades...");
  await prisma.pathfinderSpecialtyRequirementProgress.deleteMany();

  console.log("Removendo requisitos de especialidades...");
  await prisma.specialtyRequirement.deleteMany();

  console.log("Removendo vínculos de especialidades órfãs...");
  await prisma.pathfinderSpecialty.deleteMany({
    where: {
      specialty: {
        slug: {
          notIn: validSlugs
        }
      }
    }
  });

  console.log("Removendo especialidades inválidas...");
  await prisma.specialty.deleteMany({
    where: {
      slug: {
        notIn: validSlugs
      }
    }
  });

  console.log("Recriando catálogo limpo...");
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const slug = slugify(`${item.code}-${item.name}`);

    const area = await prisma.specialtyArea.findUnique({
      where: { slug: slugify(item.area) }
    });

    if (!area) {
      console.warn(`Área não encontrada: ${item.area}`);
      continue;
    }

    const existingBySlug = await prisma.specialty.findUnique({
      where: { slug }
    });

    if (existingBySlug) {
      await prisma.specialty.update({
        where: { id: existingBySlug.id },
        data: {
          name: item.name,
          code: item.code,
          category: item.area,
          description: item.description || item.name,
          requirements: "",
          areaId: area.id,
          order: i + 1,
          sourceUrl: null,
          slug
        }
      });
      continue;
    }

    const existingByName = await prisma.specialty.findUnique({
      where: { name: item.name }
    });

    if (existingByName) {
      await prisma.specialty.update({
        where: { id: existingByName.id },
        data: {
          name: item.name,
          code: item.code,
          category: item.area,
          description: item.description || item.name,
          requirements: "",
          areaId: area.id,
          order: i + 1,
          sourceUrl: null,
          slug
        }
      });
      continue;
    }

    await prisma.specialty.create({
      data: {
        name: item.name,
        slug,
        code: item.code,
        category: item.area,
        description: item.description || item.name,
        requirements: "",
        areaId: area.id,
        order: i + 1,
        sourceUrl: null
      }
    });
  }

  console.log("Catálogo resetado com sucesso.");
}

main()
  .catch((error) => {
    console.error("Erro ao resetar catálogo:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });