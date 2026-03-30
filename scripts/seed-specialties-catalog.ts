import { PrismaClient } from "@prisma/client";
import catalog from "../data/specialties-catalog.json";

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
];

type SpecialtySeed = {
  area: string;
  code: string;
  name: string;
  description?: string;
};

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

async function seedSpecialties() {
  const specialties = catalog as SpecialtySeed[];

  for (let i = 0; i < specialties.length; i++) {
    const item = specialties[i];

    const area = await prisma.specialtyArea.findUnique({
      where: { slug: slugify(item.area) }
    });

    if (!area) {
      console.warn(`Área não encontrada: ${item.area}`);
      continue;
    }

    const slug = slugify(`${item.code}-${item.name}`);

    await prisma.specialty.upsert({
      where: { slug },
      update: {
        name: item.name,
        code: item.code,
        category: item.area,
        description: item.description || item.name,
        requirements: "",
        areaId: area.id,
        order: i + 1
      },
      create: {
        name: item.name,
        slug,
        code: item.code,
        category: item.area,
        description: item.description || item.name,
        requirements: "",
        areaId: area.id,
        order: i + 1
      }
    });
  }
}

async function main() {
  console.log("Criando áreas oficiais...");
  await ensureAreas();

  console.log("Populando catálogo inicial de especialidades...");
  await seedSpecialties();

  console.log("Catálogo de especialidades criado com sucesso.");
}

main()
  .catch((error) => {
    console.error("Erro ao criar catálogo de especialidades:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });