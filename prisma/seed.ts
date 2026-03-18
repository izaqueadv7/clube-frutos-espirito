import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const classes = [
  { name: "Friend", description: "Fundamentos espirituais e servico", order: 1 },
  { name: "Companion", description: "Crescimento em equipe", order: 2 },
  { name: "Explorer", description: "Descobertas e habilidades", order: 3 },
  { name: "Ranger", description: "Lideranca em acao", order: 4 },
  { name: "Voyager", description: "Missao e perseveranca", order: 5 },
  { name: "Guide", description: "Preparacao de lideres", order: 6 }
];

const specialties = [
  {
    name: "Primeiros Socorros Basico",
    category: "Saude",
    description: "Atendimento inicial em situacoes de emergencia.",
    requirements: "1) Conhecer sinais vitais. 2) Praticar curativos. 3) Simulacao de atendimento."
  },
  {
    name: "Campismo I",
    category: "Natureza",
    description: "Principios de acampamento seguro e organizado.",
    requirements: "1) Montar barraca. 2) Planejar mochila. 3) Fogo seguro."
  },
  {
    name: "Culinaria ao Ar Livre",
    category: "Servico",
    description: "Preparo de refeicoes em ambiente de campo.",
    requirements: "1) Higiene. 2) Dois pratos. 3) Cardapio equilibrado."
  }
];

async function main() {
  const izaquePass = await bcrypt.hash("Izaque@dbv", 10);
  const edsonPass = await bcrypt.hash("Edson@dbv", 10);
  const laisaPass = await bcrypt.hash("Laisa@dbv", 10);

  const izaqueUser = await prisma.user.upsert({
    where: { email: "izaqueadv@gmail.com" },
    update: {
      name: "Izaque Natanael Dantas",
      passwordHash: izaquePass,
      role: "LEADER"
    },
    create: {
      name: "Izaque Natanael Dantas",
      email: "izaqueadv@gmail.com",
      passwordHash: izaquePass,
      role: "LEADER"
    }
  });

  const edsonUser = await prisma.user.upsert({
    where: { email: "franciscoedsonsouza96@gmail.com" },
    update: {
      name: "Francisco Edson de Souza Silva",
      passwordHash: edsonPass,
      role: "LEADER"
    },
    create: {
      name: "Francisco Edson de Souza Silva",
      email: "franciscoedsonsouza96@gmail.com",
      passwordHash: edsonPass,
      role: "LEADER"
    }
  });

  const laisaUser = await prisma.user.upsert({
    where: { email: "laisaestefany6@gmail.com" },
    update: {
      name: "Laisa Estefany Costa Vitorino",
      passwordHash: laisaPass,
      role: "LEADER"
    },
    create: {
      name: "Laisa Estefany Costa Vitorino",
      email: "laisaestefany6@gmail.com",
      passwordHash: laisaPass,
      role: "LEADER"
    }
  });

  const classRecords = [] as { id: string; name: string }[];
  for (const item of classes) {
    const result = await prisma.pathfinderClass.upsert({
      where: { name: item.name },
      update: { description: item.description, order: item.order },
      create: item
    });
    classRecords.push({ id: result.id, name: result.name });
  }

  const friendClass = classRecords.find((item) => item.name === "Friend");

  if (friendClass) {
    const friendRequirements = [
      { title: "Memorizar Joao 3:16", details: "Recitar o verso em reuniao" },
      { title: "Participar de acampamento", details: "Presenca em ao menos 1 acampamento" },
      { title: "Realizar atividade missionaria", details: "Participar de acao social do clube" }
    ];

    for (const req of friendRequirements) {
      await prisma.classRequirement.upsert({
        where: {
          id: `${friendClass.id}:${req.title}`
        },
        update: {},
        create: {
          id: `${friendClass.id}:${req.title}`,
          classId: friendClass.id,
          title: req.title,
          details: req.details
        }
      }).catch(async () => {
        await prisma.classRequirement.create({
          data: {
            classId: friendClass.id,
            title: req.title,
            details: req.details
          }
        });
      });
    }
  }

  const specialtyRecords = [] as { id: string; name: string }[];
  for (const item of specialties) {
    const result = await prisma.specialty.upsert({
      where: { name: item.name },
      update: {
        category: item.category,
        description: item.description,
        requirements: item.requirements
      },
      create: item
    });
    specialtyRecords.push({ id: result.id, name: result.name });
  }

  const pathfinder = await prisma.pathfinder.upsert({
    where: { userId: edsonUser.id },
    update: {
      currentClassId: friendClass?.id
    },
    create: {
      userId: edsonUser.id,
      currentClassId: friendClass?.id
    }
  });

  const parent = await prisma.parent.upsert({
    where: { userId: laisaUser.id },
    update: {
      phone: "(84) 99894-6754"
    },
    create: {
      userId: laisaUser.id,
      phone: "(84) 99894-6754"
    }
  });

  await prisma.parentPathfinder.upsert({
    where: {
      parentId_pathfinderId: {
        parentId: parent.id,
        pathfinderId: pathfinder.id
      }
    },
    update: {},
    create: {
      parentId: parent.id,
      pathfinderId: pathfinder.id
    }
  });

  for (const specialty of specialtyRecords) {
    await prisma.pathfinderSpecialty.upsert({
      where: {
        pathfinderId_specialtyId: {
          pathfinderId: pathfinder.id,
          specialtyId: specialty.id
        }
      },
      update: {},
      create: {
        pathfinderId: pathfinder.id,
        specialtyId: specialty.id,
        status: specialty.name === "Primeiros Socorros Basico" ? "IN_PROGRESS" : "PENDING"
      }
    });
  }

  const requirements = await prisma.classRequirement.findMany({
    where: { classId: friendClass?.id }
  });

  for (const req of requirements) {
    await prisma.pathfinderProgress.upsert({
      where: {
        pathfinderId_requirementId: {
          pathfinderId: pathfinder.id,
          requirementId: req.id
        }
      },
      update: {},
      create: {
        pathfinderId: pathfinder.id,
        requirementId: req.id,
        completed: req.title.includes("Joao")
      }
    });
  }

  await prisma.event.createMany({
    data: [
      {
        title: "Reuniao Semanal",
        description: "Atividades de ordem unida, classes e especialidades.",
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        location: "Igreja Central"
      },
      {
        title: "Acampamento de Outono",
        description: "Final de semana de campo e espiritualidade.",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        location: "Sitio Esperanca"
      }
    ],
    skipDuplicates: true
  });

  await prisma.announcement.create({
    data: {
      title: "Bem-vindos ao Portal",
      content: "Este e o novo portal digital do clube. Confira seu progresso semanalmente.",
      audience: "ALL",
      authorId: izaqueUser.id
    }
  }).catch(() => undefined);

  console.log("Seed concluido com sucesso.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });