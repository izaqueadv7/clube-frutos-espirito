import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Sincronizando usuários PATHFINDER sem perfil de pathfinder...");

  const users = await prisma.user.findMany({
    where: {
      role: "PATHFINDER"
    },
    include: {
      pathfinderProfile: true
    },
    orderBy: {
      name: "asc"
    }
  });

  let created = 0;
  let skipped = 0;

  for (const user of users) {
    if (user.pathfinderProfile) {
      console.log(`- Já possui perfil: ${user.name}`);
      skipped++;
      continue;
    }

    await prisma.pathfinder.create({
      data: {
        userId: user.id,
        birthDate: null,
        currentClassId: null,
        notes: null
      }
    });

    console.log(`✅ Perfil criado para: ${user.name}`);
    created++;
  }

  console.log("\nResumo:");
  console.log(`Criados: ${created}`);
  console.log(`Já existentes: ${skipped}`);
  console.log("🔥 Sincronização concluída.");
}

main()
  .catch((error) => {
    console.error("Erro ao sincronizar pathfinders:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });