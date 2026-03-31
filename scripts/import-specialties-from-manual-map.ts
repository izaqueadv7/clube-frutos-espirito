import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SpecialtyImportItem = {
  area: string;
  code: string;
  name: string;
  sourceUrl?: string;
  requirements: string[];
};

const IMPORT_ITEMS: SpecialtyImportItem[] = [
  {
    area: "Atividades Profissionais",
    code: "AP004",
    name: "Ordem Unida",
    sourceUrl: "https://mda.wiki.br/Especialidade_de_Ordem_unida",
    requirements: [
      "Definir ordem unida e explicar sua importância.",
      "Conhecer comandos básicos de formação e deslocamento.",
      "Demonstrar posições fundamentais corretamente.",
      "Executar movimentos simples em conjunto.",
      "Participar de apresentação prática de ordem unida."
    ]
  },
  {
    area: "Atividades Profissionais",
    code: "AP005",
    name: "Pioneirias",
    sourceUrl: "https://mda.wiki.br/Especialidade_de_Pioneirias",
    requirements: [
      "Definir pioneirias e explicar sua utilidade em acampamentos.",
      "Identificar materiais adequados para construções rústicas.",
      "Demonstrar amarras e amarrações básicas.",
      "Construir pelo menos uma pioneiria simples.",
      "Apresentar cuidados de segurança durante a montagem."
    ]
  },
  {
    area: "ADRA",
    code: "AD002",
    name: "Avaliação da Comunidade",
    sourceUrl: "https://mda.wiki.br/Especialidade_de_Avaliação_da_Comunidade",
    requirements: [
      "Definir avaliação da comunidade.",
      "Identificar necessidades e recursos presentes em uma comunidade.",
      "Explicar métodos simples de observação e entrevista.",
      "Participar de uma atividade de levantamento comunitário.",
      "Apresentar relatório com os dados coletados e conclusões."
    ]
  },
  {
    area: "Atividades Missionárias",
    code: "AM004",
    name: "Mordomia Cristã",
    sourceUrl: "https://mda.wiki.br/Especialidade_de_Mordomia",
    requirements: [
      "Definir mordomia cristã.",
      "Explicar a relação entre fidelidade e administração dos dons.",
      "Identificar áreas da vida que envolvem mordomia.",
      "Apresentar princípios bíblicos ligados à mordomia.",
      "Produzir reflexão ou relatório sobre aplicação prática."
    ]
  },
  {
    area: "Atividades Missionárias",
    code: "AM013",
    name: "Pioneiros Adventistas",
    sourceUrl: "https://mda.wiki.br/Especialidade_de_Pioneiros_Adventistas",
    requirements: [
      "Descobrir o que foi o Movimento Milerita e seu papel no início da Igreja Adventista do Sétimo Dia.",
      "Explicar o grande desapontamento com base na profecia de Daniel 8.",
      "Estudar sobre Ellen White e o papel de seus ensinos dentro da Igreja.",
      "Conhecer a estrutura organizacional da Igreja Adventista e preparar um organograma eclesiástico.",
      "Apresentar resumo biográfico de pioneiros adventistas.",
      "Pesquisar outro departamento da IASD e descobrir dados sobre sua fundação.",
      "Descobrir como se iniciou o movimento adventista em seu país.",
      "Conhecer as 28 Crenças Fundamentais da Igreja Adventista do Sétimo Dia."
    ]
  },
  {
    area: "Estudo da natureza",
    code: "EN006",
    name: "Astronomia",
    sourceUrl: "",
    requirements: [
      "Definir astronomia.",
      "Identificar os principais corpos celestes visíveis.",
      "Explicar as fases da Lua.",
      "Reconhecer constelações principais observáveis em sua região.",
      "Registrar uma observação do céu."
    ]
  },
  {
    area: "Estudo da natureza",
    code: "EN007",
    name: "Ecologia",
    sourceUrl: "",
    requirements: [
      "Definir ecologia.",
      "Explicar relações entre seres vivos e ambiente.",
      "Identificar impactos positivos e negativos da ação humana.",
      "Participar de atividade prática de preservação.",
      "Registrar o aprendizado."
    ]
  },
  {
    area: "Ciência e saúde",
    code: "CS001",
    name: "Primeiros Socorros Básico",
    sourceUrl: "",
    requirements: [
      "Saber como pedir ajuda corretamente em uma emergência.",
      "Identificar sinais vitais básicos.",
      "Demonstrar cuidados simples com pequenos ferimentos.",
      "Explicar como agir em casos de desmaio, queimadura leve e sangramento nasal.",
      "Demonstrar cuidados de segurança antes de ajudar alguém."
    ]
  },
  {
    area: "Ciência e saúde",
    code: "CS002",
    name: "Primeiros Socorros",
    sourceUrl: "",
    requirements: [
      "Avaliar a segurança da cena e da vítima.",
      "Demonstrar cuidados em cortes, queimaduras, fraturas e choques.",
      "Explicar como agir em casos de engasgo, convulsão e desmaio.",
      "Demonstrar solicitação correta de ajuda especializada.",
      "Participar de simulação prática."
    ]
  }
];

async function main() {
  console.log("Importando especialidades por mapa exato...");

  for (const item of IMPORT_ITEMS) {
    const specialty = await prisma.specialty.findFirst({
      where: {
        OR: [{ code: item.code }, { name: item.name }]
      }
    });

    if (!specialty) {
      console.warn(`Especialidade não encontrada: ${item.code} - ${item.name}`);
      continue;
    }

    await prisma.specialtyRequirement.deleteMany({
      where: { specialtyId: specialty.id }
    });

    for (let i = 0; i < item.requirements.length; i++) {
      await prisma.specialtyRequirement.create({
        data: {
          specialtyId: specialty.id,
          text: item.requirements[i],
          marker: `${i + 1}.`,
          level: 0,
          order: i + 1
        }
      });
    }

    await prisma.specialty.update({
      where: { id: specialty.id },
      data: {
        sourceUrl: item.sourceUrl || null,
        requirements: item.requirements
          .map((req, index) => `${index + 1}. ${req}`)
          .join("\n")
      }
    });

    console.log(`✔ ${item.code} - ${item.name}`);
  }

  console.log("Importação concluída.");
}

main()
  .catch((error) => {
    console.error("Erro ao importar especialidades:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });