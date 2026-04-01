import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function isWrongMaster(name: string) {
  return !name.trim().toLowerCase().startsWith("mestrado em ");
}

async function main() {
  console.log("Limpando mestrados errados...");

  const wrongMasters = await prisma.specialty.findMany({
    where: {
      category: "Mestrados"
    },
    orderBy: {
      name: "asc"
    }
  });

  const toDelete = wrongMasters.filter((item) => isWrongMaster(item.name));

  console.log(`Encontrados ${toDelete.length} mestrados incorretos.`);

  for (const item of toDelete) {
    await prisma.specialtyRequirement.deleteMany({
      where: { specialtyId: item.id }
    });

    await prisma.pathfinderSpecialty.deleteMany({
      where: { specialtyId: item.id }
    });

    await prisma.specialty.delete({
      where: { id: item.id }
    });

    console.log(`✅ Removido: ${item.name}`);
  }

  console.log("🔥 Limpeza concluída.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });