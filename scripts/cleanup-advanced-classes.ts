import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ADVANCED_STANDALONE_CLASS_NAMES = [
  "Amigo da Natureza",
  "Companheiro de Excursão",
  "Pesquisador de Campo e Bosque",
  "Pioneiro de Novas Fronteiras",
  "Excursionista na Mata",
  "Guia de Exploração"
];

async function main() {
  console.log("Removendo classes avançadas soltas...");

  for (const name of ADVANCED_STANDALONE_CLASS_NAMES) {
    const cls = await prisma.pathfinderClass.findFirst({
      where: { name }
    });

    if (!cls) {
      console.log(`- Não encontrada: ${name}`);
      continue;
    }

    await prisma.classRequirement.deleteMany({
      where: { classId: cls.id }
    });

    await prisma.pathfinderProgress.deleteMany({
      where: {
        requirement: {
          classId: cls.id
        }
      }
    });

    await prisma.pathfinder.updateMany({
      where: { currentClassId: cls.id },
      data: { currentClassId: null }
    });

    await prisma.pathfinderClass.delete({
      where: { id: cls.id }
    });

    console.log(`✅ Removida: ${name}`);
  }

  console.log("\n🔥 Limpeza concluída.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });