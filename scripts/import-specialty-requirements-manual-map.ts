import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type RequirementMapItem = {
  code: string;
  name: string;
  sourceUrl: string;
  requirements: string[];
};

const REQUIREMENT_MAP: RequirementMapItem[] = [
  {
    code: "AD001",
    name: "Alívio da Fome",
    sourceUrl: "https://www.adventistas.org/pt/desbravadores/especialidades/alivio-da-fome-ad001-2/",
    requirements: [
      "Reconhecer, por experiência pessoal, a importância de contribuir para aliviar a fome no mundo.",
      "Entrevistar uma pessoa que coordene um programa de distribuição de alimentos em sua comunidade. Perguntar sobre objetivos, desafios, fontes de alimento e pessoas atendidas.",
      "Descrever a organização internacional Adventist Development and Relief Agency (ADRA) e seu trabalho em sua comunidade, país e mundo.",
      "Participar por pelo menos 10 horas em um projeto de combate à fome coordenado por igreja, clube, escola ou ADRA.",
      "Escrever um relatório ou apresentar breve testemunho sobre a experiência adquirida nesse projeto."
    ]
  },
  {
    code: "AD004",
    name: "Resposta a emergências e desastres",
    sourceUrl: "https://www.adventistas.org/pt/desbravadores/especialidades/resposta-a-emergencias-e-desastres-ad004/",
    requirements: [
      "Explicar os principais tipos de emergências e desastres que podem ocorrer em sua região.",
      "Identificar atitudes corretas de prevenção e preparação diante de situações de desastre.",
      "Montar ou descrever um kit básico de emergência para uso familiar.",
      "Demonstrar conhecimento de segurança pessoal durante e após uma emergência.",
      "Participar de uma atividade prática, simulação ou treinamento relacionado a resposta a emergências."
    ]
  },
  {
    code: "AD005",
    name: "Resposta a emergências e desastres - avançado",
    sourceUrl: "https://www.adventistas.org/pt/desbravadores/especialidades/resposta-a-emergencias-e-desastres-avancado-ad005/",
    requirements: [
      "Ter a especialidade de Resposta a emergências e desastres.",
      "Descrever ações avançadas de planejamento e coordenação em situações de emergência.",
      "Explicar formas seguras de apoio a pessoas e famílias afetadas por desastres.",
      "Participar de atividade prática de preparo, apoio ou resposta coordenada.",
      "Apresentar relatório ou testemunho do aprendizado obtido."
    ]
  },
  {
    code: "AD008",
    name: "Reassentamento de Refugiados",
    sourceUrl: "https://www.adventistas.org/pt/desbravadores/especialidades/reassentamento-de-refugiados-ad008/",
    requirements: [
      "Definir quem são refugiados e deslocados, e distinguir esses termos.",
      "Pesquisar causas comuns de deslocamento forçado e seus impactos.",
      "Conhecer ações da ADRA ou de outras organizações no apoio a refugiados.",
      "Participar de atividade de apoio, arrecadação, conscientização ou acolhimento.",
      "Apresentar o que aprendeu em relatório, cartaz ou exposição."
    ]
  },
  {
    code: "AD009",
    name: "Desenvolvimento Comunitário",
    sourceUrl: "https://www.adventistas.org/pt/desbravadores/especialidades/desenvolvimento-comunitario-ad009/",
    requirements: [
      "Definir desenvolvimento comunitário e explicar sua importância.",
      "Identificar necessidades reais de uma comunidade por observação ou entrevista.",
      "Conhecer projetos comunitários desenvolvidos por igreja, escola, clube ou ADRA.",
      "Participar de ação prática de desenvolvimento comunitário.",
      "Apresentar relatório sobre a atividade realizada e seus resultados."
    ]
  },
  {
    code: "CS001",
    name: "Primeiros Socorros Básico",
    sourceUrl: "",
    requirements: [
      "Demonstrar como pedir ajuda corretamente em uma emergência.",
      "Identificar sinais vitais básicos e sua importância.",
      "Demonstrar cuidados simples com cortes, arranhões e ferimentos leves.",
      "Explicar como agir em casos de sangramento nasal, queimaduras leves e desmaio.",
      "Demonstrar condutas básicas de segurança antes de prestar ajuda."
    ]
  },
  {
    code: "CS002",
    name: "Primeiros Socorros",
    sourceUrl: "",
    requirements: [
      "Ter noções de avaliação inicial da vítima e segurança da cena.",
      "Demonstrar cuidados em casos de cortes, fraturas, queimaduras e choques.",
      "Explicar como agir em situações de engasgo, convulsão e desmaio.",
      "Demonstrar transporte simples ou solicitação correta de apoio especializado.",
      "Participar de simulação prática de primeiros socorros."
    ]
  },
  {
    code: "EN001",
    name: "Campismo I",
    sourceUrl: "",
    requirements: [
      "Preparar mochila e equipamentos para acampamento.",
      "Montar e desmontar barraca corretamente.",
      "Demonstrar regras de segurança em acampamento.",
      "Conhecer cuidados com fogo e cozinha de campo.",
      "Participar de acampamento ou atividade prática equivalente."
    ]
  },
  {
    code: "EN002",
    name: "Campismo II",
    sourceUrl: "",
    requirements: [
      "Ter Campismo I.",
      "Aprimorar técnicas de acampamento e organização de área.",
      "Demonstrar conhecimento de segurança, higiene e conservação ambiental.",
      "Participar de acampamento com responsabilidades práticas.",
      "Demonstrar habilidades adicionais de vida campestre."
    ]
  },
  {
    code: "EN005",
    name: "Orientação",
    sourceUrl: "",
    requirements: [
      "Explicar os pontos cardeais e colaterais.",
      "Usar bússola corretamente.",
      "Ler referências simples de direção e localização.",
      "Demonstrar orientação por sinais naturais básicos.",
      "Realizar pequeno trajeto orientado ou atividade prática."
    ]
  },
  {
    code: "EN015",
    name: "Ecologia",
    sourceUrl: "",
    requirements: [
      "Definir ecologia e termos básicos relacionados.",
      "Explicar relações entre seres vivos e ambiente.",
      "Identificar impactos humanos positivos e negativos na natureza.",
      "Participar de atividade prática de preservação ambiental.",
      "Apresentar resumo ou registro do aprendizado."
    ]
  },
  {
    code: "CS003",
    name: "Nutrição",
    sourceUrl: "",
    requirements: [
      "Explicar o que é alimentação equilibrada.",
      "Identificar grupos alimentares principais.",
      "Montar exemplo simples de cardápio saudável.",
      "Conhecer hábitos que prejudicam a saúde alimentar.",
      "Aplicar princípios básicos de boa alimentação em atividade prática."
    ]
  },
  {
    code: "CS004",
    name: "Temperança",
    sourceUrl: "",
    requirements: [
      "Explicar o significado de temperança.",
      "Identificar hábitos prejudiciais ao corpo e à mente.",
      "Relacionar princípios de saúde física, mental e espiritual.",
      "Memorizar ou apresentar texto relevante sobre temperança.",
      "Assumir compromisso prático com estilo de vida saudável."
    ]
  }
];

async function main() {
  console.log("Importando requisitos por mapa manual...");

  for (const item of REQUIREMENT_MAP) {
    const specialty = await prisma.specialty.findFirst({
      where: {
        OR: [
          { code: item.code },
          { name: item.name }
        ]
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

    console.log(`✔ ${item.code} - ${item.name}: ${item.requirements.length} requisito(s)`);
  }

  console.log("Importação manual concluída.");
}

main()
  .catch((error) => {
    console.error("Erro ao importar requisitos:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });