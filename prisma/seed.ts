import bcrypt from "bcryptjs";
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

const classes = [
  { name: "Amigo", description: "Fundamentos espirituais e serviço", order: 1, category: "REGULAR" },
  { name: "Companheiro", description: "Crescimento em equipe", order: 2, category: "REGULAR" },
  { name: "Pesquisador", description: "Descobertas e habilidades", order: 3, category: "REGULAR" },
  { name: "Pioneiro", description: "Liderança em ação", order: 4, category: "REGULAR" },
  { name: "Excursionista", description: "Missão e perseverança", order: 5, category: "REGULAR" },
  { name: "Guia", description: "Preparação de líderes", order: 6, category: "REGULAR" },

  { name: "Amigo da Natureza", description: "Classe avançada", order: 7, category: "AVANCADA" },
  { name: "Companheiro de Excursão", description: "Classe avançada", order: 8, category: "AVANCADA" },
  { name: "Pesquisador de Campo e Bosque", description: "Classe avançada", order: 9, category: "AVANCADA" },
  { name: "Pioneiro de Novas Fronteiras", description: "Classe avançada", order: 10, category: "AVANCADA" },
  { name: "Excursionista na Mata", description: "Classe avançada", order: 11, category: "AVANCADA" },
  { name: "Guia de Exploração", description: "Classe avançada", order: 12, category: "AVANCADA" },

  { name: "Líder", description: "Capacitação de liderança", order: 13, category: "LIDERANCA" },
  { name: "Líder Master", description: "Capacitação de liderança", order: 14, category: "LIDERANCA" },
  { name: "Líder Master Avançado", description: "Capacitação de liderança", order: 15, category: "LIDERANCA" }
];

const specialtyAreas = [
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

const specialties = [
  {
    name: "Primeiros Socorros Básico",
    code: "CS001",
    area: "Ciência e saúde",
    category: "Saúde",
    description: "Atendimento inicial em situações de emergência.",
    requirements: "1) Conhecer sinais vitais. 2) Praticar curativos. 3) Simulação de atendimento."
  },
  {
    name: "Campismo I",
    code: "EN001",
    area: "Estudo da natureza",
    category: "Natureza",
    description: "Princípios de acampamento seguro e organizado.",
    requirements: "1) Montar barraca. 2) Planejar mochila. 3) Fogo seguro."
  },
  {
    name: "Culinária ao Ar Livre",
    code: "HD001",
    area: "Habilidades domésticas",
    category: "Serviço",
    description: "Preparo de refeições em ambiente de campo.",
    requirements: "1) Higiene. 2) Dois pratos. 3) Cardápio equilibrado."
  },
  {
    name: "Alívio da Fome",
    code: "AD001",
    area: "ADRA",
    category: "ADRA",
    description: "Noções de ação solidária e combate à fome.",
    requirements: "1) Entender fome e insegurança alimentar. 2) Participar de ação solidária. 3) Fazer relatório."
  }
];

async function seedClasses() {
  const classRecords: { id: string; name: string }[] = [];

  for (const item of classes) {
    const result = await prisma.pathfinderClass.upsert({
      where: { name: item.name },
      update: {
        description: item.description,
        order: item.order,
        category: item.category,
        slug: slugify(item.name)
      },
      create: {
        name: item.name,
        description: item.description,
        order: item.order,
        category: item.category,
        slug: slugify(item.name)
      }
    });

    classRecords.push({ id: result.id, name: result.name });
  }

  const regularGroupTemplate = [
    { roman: "I", title: "Gerais", order: 1 },
    { roman: "II", title: "Descoberta Espiritual", order: 2 },
    { roman: "III", title: "Servindo a Outros", order: 3 },
    { roman: "IV", title: "Desenvolvendo Amizade", order: 4 },
    { roman: "V", title: "Saúde e Aptidão Física", order: 5 },
    { roman: "VI", title: "Organização e Liderança", order: 6 },
    { roman: "VII", title: "Estudo da Natureza", order: 7 },
    { roman: "VIII", title: "Arte de Acampar", order: 8 }
  ];

  const leadershipGroupTemplate = [
    { roman: "I", title: "Desenvolvimento Espiritual", order: 1 },
    { roman: "II", title: "Capacitação e Liderança", order: 2 },
    { roman: "III", title: "Serviço", order: 3 }
  ];

  const allClasses = await prisma.pathfinderClass.findMany();

  for (const cls of allClasses) {
    const groups =
      cls.category === "LIDERANCA"
        ? leadershipGroupTemplate
        : regularGroupTemplate;

    for (const group of groups) {
      const existing = await prisma.pathfinderClassGroup.findFirst({
        where: {
          classId: cls.id,
          roman: group.roman,
          title: group.title
        }
      });

      if (!existing) {
        await prisma.pathfinderClassGroup.create({
          data: {
            classId: cls.id,
            roman: group.roman,
            title: group.title,
            order: group.order
          }
        });
      }
    }
  }

  return classRecords;
}

async function seedSpecialtyAreas() {
  for (let index = 0; index < specialtyAreas.length; index++) {
    const name = specialtyAreas[index];

    await prisma.specialtyArea.upsert({
      where: { slug: slugify(name) },
      update: {
        name,
        order: index + 1
      },
      create: {
        name,
        slug: slugify(name),
        order: index + 1
      }
    });
  }
}

async function seedSpecialties() {
  const specialtyRecords: { id: string; name: string }[] = [];

  for (let index = 0; index < specialties.length; index++) {
    const item = specialties[index];

    const area = await prisma.specialtyArea.findFirst({
      where: { slug: slugify(item.area) }
    });

    const result = await prisma.specialty.upsert({
      where: { name: item.name },
      update: {
        category: item.category,
        description: item.description,
        requirements: item.requirements,
        code: item.code,
        slug: slugify(`${item.code}-${item.name}`),
        areaId: area?.id,
        order: index + 1
      },
      create: {
        name: item.name,
        category: item.category,
        description: item.description,
        requirements: item.requirements,
        code: item.code,
        slug: slugify(`${item.code}-${item.name}`),
        areaId: area?.id,
        order: index + 1
      }
    });

    specialtyRecords.push({ id: result.id, name: result.name });
  }

  return specialtyRecords;
}

async function seedUsers() {
  const izaquePass = await bcrypt.hash("Izaque@dbv", 10);
  const edsonPass = await bcrypt.hash("Edson@dbv", 10);
  const laisaPass = await bcrypt.hash("Laisa@dbv", 10);

  const izaqueUser = await prisma.user.upsert({
    where: { email: "izaqueadv@gmail.com" },
    update: {
      name: "Izaque Natanael Dantas",
      passwordHash: izaquePass,
      role: "LEADER",
      primaryFunction: "Instrutor de Classe",
      secondaryFunction: "Mídia",
      isAdmin: true,
      isMedia: true,
      canManageUsers: true,
      canManageContent: true,
      isActive: true,
      status: "APPROVED"
    },
    create: {
      name: "Izaque Natanael Dantas",
      email: "izaqueadv@gmail.com",
      passwordHash: izaquePass,
      role: "LEADER",
      primaryFunction: "Instrutor de Classe",
      secondaryFunction: "Mídia",
      isAdmin: true,
      isMedia: true,
      canManageUsers: true,
      canManageContent: true,
      isActive: true,
      status: "APPROVED"
    }
  });

  const edsonUser = await prisma.user.upsert({
    where: { email: "franciscoedsonsouza96@gmail.com" },
    update: {
      name: "Francisco Edson de Souza Silva",
      passwordHash: edsonPass,
      role: "LEADER",
      primaryFunction: "Diretor",
      secondaryFunction: null,
      isAdmin: false,
      isMedia: false,
      canManageUsers: true,
      canManageContent: true,
      isActive: true,
      status: "APPROVED"
    },
    create: {
      name: "Francisco Edson de Souza Silva",
      email: "franciscoedsonsouza96@gmail.com",
      passwordHash: edsonPass,
      role: "LEADER",
      primaryFunction: "Diretor",
      secondaryFunction: null,
      isAdmin: false,
      isMedia: false,
      canManageUsers: true,
      canManageContent: true,
      isActive: true,
      status: "APPROVED"
    }
  });

  const laisaUser = await prisma.user.upsert({
    where: { email: "laisaestefany6@gmail.com" },
    update: {
      name: "Laisa Estefany Costa Vitorino",
      passwordHash: laisaPass,
      role: "LEADER",
      primaryFunction: "Secretária",
      secondaryFunction: "Conselheira associada",
      isAdmin: false,
      isMedia: true,
      canManageUsers: true,
      canManageContent: true,
      isActive: true,
      status: "APPROVED"
    },
    create: {
      name: "Laisa Estefany Costa Vitorino",
      email: "laisaestefany6@gmail.com",
      passwordHash: laisaPass,
      role: "LEADER",
      primaryFunction: "Secretária",
      secondaryFunction: "Conselheira associada",
      isAdmin: false,
      isMedia: true,
      canManageUsers: true,
      canManageContent: true,
      isActive: true,
      status: "APPROVED"
    }
  });

  return { izaqueUser, edsonUser, laisaUser };
}

async function seedPathfinderData(edsonUserId: string, laisaUserId: string, classRecords: { id: string; name: string }[], specialtyRecords: { id: string; name: string }[]) {
  const friendClass = classRecords.find((item) => item.name === "Amigo");

  if (!friendClass) return;

  const pathfinder = await prisma.pathfinder.upsert({
    where: { userId: edsonUserId },
    update: {
      currentClassId: friendClass.id
    },
    create: {
      userId: edsonUserId,
      currentClassId: friendClass.id
    }
  });

  const parent = await prisma.parent.upsert({
    where: { userId: laisaUserId },
    update: {
      phone: "(84) 99894-6754"
    },
    create: {
      userId: laisaUserId,
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
        status: specialty.name === "Primeiros Socorros Básico" ? "IN_PROGRESS" : "PENDING"
      }
    });
  }
}

async function seedEventsAndAnnouncements(authorId: string) {
  const existingEvents = await prisma.event.count();

  if (existingEvents === 0) {
    await prisma.event.createMany({
      data: [
        {
          title: "Reunião Semanal",
          description: "Atividades de ordem unida, classes e especialidades.",
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          location: "Igreja Central"
        },
        {
          title: "Acampamento de Outono",
          description: "Final de semana de campo e espiritualidade.",
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          location: "Sítio Esperança"
        }
      ]
    });
  }

  const existingAnnouncement = await prisma.announcement.findFirst({
    where: { title: "Bem-vindos ao Clube de Desbravadores!" }
  });

  if (!existingAnnouncement) {
    await prisma.announcement.create({
      data: {
        title: "Bem-vindos ao Clube de Desbravadores!",
        content: "Este é o novo site do clube. Confira seu progresso semanalmente.",
        audience: "ALL",
        authorId
      }
    });
  }
}

async function main() {
  const classRecords = await seedClasses();
  await seedSpecialtyAreas();
  const specialtyRecords = await seedSpecialties();

  const { izaqueUser, edsonUser, laisaUser } = await seedUsers();

  await seedPathfinderData(
    edsonUser.id,
    laisaUser.id,
    classRecords,
    specialtyRecords
  );

  await seedEventsAndAnnouncements(izaqueUser.id);

  console.log("Seed concluído com sucesso.");
}

main()
  .catch((error) => {
    console.error("Erro no seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });