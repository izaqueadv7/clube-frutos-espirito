import { PrismaClient } from "@prisma/client";

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

async function main() {
  console.log("Limpando áreas de especialidades inválidas...");

  const validSlugs = OFFICIAL_AREAS.map(slugify);

  const existingAreas = await prisma.specialtyArea.findMany({
    include: {
      specialties: true
    }
  });

  for (const area of existingAreas) {
    const isValid = validSlugs.includes(area.slug);

    if (!isValid) {
      console.log(`Removendo área inválida: ${area.name}`);

      await prisma.specialty.updateMany({
        where: { areaId: area.id },
        data: { areaId: null }
      });

      await prisma.specialtyArea.delete({
        where: { id: area.id }
      });
    }
  }

  console.log("Recriando áreas oficiais...");

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

  console.log("Áreas corrigidas com sucesso.");
}

main()
  .catch((error) => {
    console.error("Erro ao corrigir áreas:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });