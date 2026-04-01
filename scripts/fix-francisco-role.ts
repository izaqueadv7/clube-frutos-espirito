import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "franciscoedsonsouza96@gmail.com".toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      pathfinderProfile: true
    }
  });

  if (!user) {
    console.log("Usuário não encontrado.");
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: "LEADER"
    }
  });

  if (user.pathfinderProfile) {
    await prisma.pathfinderProgress.deleteMany({
      where: { pathfinderId: user.pathfinderProfile.id }
    });

    await prisma.pathfinderSpecialty.deleteMany({
      where: { pathfinderId: user.pathfinderProfile.id }
    });

    await prisma.parentPathfinder.deleteMany({
      where: { pathfinderId: user.pathfinderProfile.id }
    });

    await prisma.pathfinder.delete({
      where: { id: user.pathfinderProfile.id }
    });

    console.log("Perfil de desbravador removido.");
  }

  console.log("Usuário atualizado para LEADER com sucesso.");
}

main()
  .catch((error) => {
    console.error("Erro ao corrigir usuário:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });