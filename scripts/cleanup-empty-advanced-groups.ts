import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TARGET_GROUPS = [
  "Amigo da Natureza",
  "Companheiro de Excursão",
  "Pesquisador de Campo e Bosque",
  "Pioneiro de Novas Fronteiras",
  "Excursionista na Mata",
  "Guia de Exploração"
];

async function main() {
  console.log("Removendo grupos avançados vazios...");

  const groups = await prisma.pathfinderClassGroup.findMany({
    where: {
      title: {
        in: TARGET_GROUPS
      }
    },
    include: {
      requirements: true,
      class: true
    }
  });

  for (const group of groups) {
    await prisma.classRequirement.deleteMany({
      where: { groupId: group.id }
    });

    await prisma.pathfinderClassGroup.delete({
      where: { id: group.id }
    });

    console.log(`✅ Removido grupo ${group.title} da classe ${group.class.name}`);
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