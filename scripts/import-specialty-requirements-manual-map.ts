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
  },
  {
    code: "CS008",
    name: "Anatomia",
    sourceUrl: "",
    requirements: [
      "Definir anatomia e explicar sua importância para o estudo do corpo humano.",
      "Identificar os principais sistemas do corpo humano.",
      "Localizar órgãos principais em um esquema ou figura do corpo.",
      "Explicar a função básica de pelo menos cinco órgãos do corpo humano.",
      "Apresentar um resumo ou atividade prática sobre o funcionamento do corpo."
    ]
  },
  {
    code: "CS009",
    name: "Prevenção às Drogas",
    sourceUrl: "",
    requirements: [
      "Definir drogas lícitas e ilícitas.",
      "Explicar os prejuízos físicos, mentais, emocionais e sociais do uso de drogas.",
      "Identificar fatores de risco que levam ao uso de drogas.",
      "Apresentar formas cristãs e saudáveis de prevenção.",
      "Participar de ação educativa ou produzir material de conscientização."
    ]
  },
  {
    code: "CS010",
    name: "Dependência Química",
    sourceUrl: "",
    requirements: [
      "Definir dependência química e explicar como ela se desenvolve.",
      "Identificar sinais e consequências do vício no indivíduo e na família.",
      "Explicar a importância do apoio espiritual, familiar e profissional.",
      "Conhecer instituições ou programas que atuam na recuperação.",
      "Apresentar resumo, palestra ou cartaz educativo sobre o tema."
    ]
  },
  {
    code: "CS011",
    name: "Doenças Tropicais",
    sourceUrl: "",
    requirements: [
      "Definir o que são doenças tropicais.",
      "Citar exemplos comuns em sua região.",
      "Explicar formas de transmissão e prevenção.",
      "Conhecer medidas de higiene e cuidado comunitário.",
      "Apresentar atividade educativa sobre prevenção."
    ]
  },
  {
    code: "CS012",
    name: "Saúde Mental",
    sourceUrl: "",
    requirements: [
      "Definir saúde mental e sua importância.",
      "Identificar hábitos que ajudam a manter equilíbrio emocional.",
      "Reconhecer sinais de sofrimento emocional que exigem apoio.",
      "Explicar a importância do descanso, oração, amizade e ajuda profissional.",
      "Produzir reflexão, apresentação ou ação de conscientização."
    ]
  },
  {
    code: "CS013",
    name: "Segurança em Acampamento",
    sourceUrl: "",
    requirements: [
      "Identificar riscos comuns em acampamentos.",
      "Explicar regras básicas de segurança em barracas, fogueiras e trilhas.",
      "Demonstrar condutas corretas em caso de acidentes simples.",
      "Preparar lista de itens de segurança para acampamento.",
      "Participar de atividade prática de segurança em campo."
    ]
  },
  {
    code: "CS014",
    name: "Higiene",
    sourceUrl: "",
    requirements: [
      "Explicar a importância da higiene pessoal.",
      "Identificar hábitos diários de higiene corporal e bucal.",
      "Relacionar higiene com prevenção de doenças.",
      "Demonstrar cuidados básicos com limpeza pessoal e do ambiente.",
      "Montar um plano simples de hábitos saudáveis."
    ]
  },

  {
    code: "EN006",
    name: "Astronomia",
    sourceUrl: "",
    requirements: [
      "Definir astronomia.",
      "Identificar os principais corpos celestes observáveis.",
      "Explicar as fases da lua.",
      "Reconhecer algumas constelações visíveis em sua região.",
      "Realizar observação do céu e registrar o que foi visto."
    ]
  },
  {
    code: "EN008",
    name: "Aves",
    sourceUrl: "",
    requirements: [
      "Definir características básicas das aves.",
      "Identificar partes principais do corpo de uma ave.",
      "Reconhecer hábitos alimentares e ambientes de diferentes aves.",
      "Observar e identificar aves em campo ou por imagens.",
      "Registrar as observações em relatório ou caderno."
    ]
  },
  {
    code: "EN009",
    name: "Mamíferos",
    sourceUrl: "",
    requirements: [
      "Definir mamíferos e suas características principais.",
      "Citar exemplos de mamíferos da sua região.",
      "Explicar diferenças entre grupos de mamíferos.",
      "Identificar hábitos e habitats de alguns mamíferos.",
      "Apresentar trabalho simples sobre mamíferos observados ou pesquisados."
    ]
  },
  {
    code: "EN010",
    name: "Felinos",
    sourceUrl: "",
    requirements: [
      "Identificar características gerais dos felinos.",
      "Citar espécies de felinos domésticos e selvagens.",
      "Explicar hábitos, alimentação e habitat dos felinos.",
      "Comparar felinos com outros mamíferos carnívoros.",
      "Apresentar pesquisa ou painel sobre felinos."
    ]
  },
  {
    code: "EN011",
    name: "Cães",
    sourceUrl: "",
    requirements: [
      "Descrever características gerais dos cães.",
      "Explicar cuidados básicos com alimentação e higiene.",
      "Identificar diferentes funções desempenhadas por cães.",
      "Citar raças ou tipos e suas diferenças.",
      "Apresentar pesquisa ou observação prática sobre cães."
    ]
  },
  {
    code: "EN012",
    name: "Sementes",
    sourceUrl: "",
    requirements: [
      "Definir semente.",
      "Identificar partes principais de uma semente.",
      "Explicar o processo básico de germinação.",
      "Observar e comparar sementes diferentes.",
      "Realizar experiência simples de germinação."
    ]
  },
  {
    code: "EN013",
    name: "Árvores",
    sourceUrl: "",
    requirements: [
      "Definir árvore e suas partes principais.",
      "Identificar tipos de árvores da sua região.",
      "Explicar a importância das árvores para o meio ambiente.",
      "Observar e registrar características de árvores diferentes.",
      "Participar de ação de cuidado, plantio ou preservação."
    ]
  },
  {
    code: "EN014",
    name: "Flores",
    sourceUrl: "",
    requirements: [
      "Definir flor e identificar suas partes principais.",
      "Explicar a função das flores na reprodução das plantas.",
      "Identificar flores comuns da sua região.",
      "Observar diferenças entre tipos de flores.",
      "Registrar a observação em desenho, foto ou relatório."
    ]
  },
  {
    code: "EN016",
    name: "Insetos",
    sourceUrl: "",
    requirements: [
      "Definir insetos e suas características principais.",
      "Identificar partes do corpo de um inseto.",
      "Citar insetos úteis e prejudiciais.",
      "Explicar a importância dos insetos no equilíbrio ecológico.",
      "Observar insetos em campo ou por coleção/imagens."
    ]
  },
  {
    code: "EN017",
    name: "Répteis",
    sourceUrl: "",
    requirements: [
      "Definir répteis e citar características gerais.",
      "Identificar espécies comuns de répteis.",
      "Explicar hábitos e habitats de répteis.",
      "Distinguir répteis de anfíbios.",
      "Apresentar pesquisa ou observação registrada."
    ]
  },
  {
    code: "EN018",
    name: "Anfíbios",
    sourceUrl: "",
    requirements: [
      "Definir anfíbios e suas características principais.",
      "Citar exemplos de anfíbios.",
      "Explicar seu ciclo de vida básico.",
      "Distinguir anfíbios de répteis.",
      "Apresentar observação ou pesquisa simples."
    ]
  },
  {
    code: "EN019",
    name: "Clima",
    sourceUrl: "",
    requirements: [
      "Definir clima e tempo atmosférico.",
      "Explicar fatores que influenciam o clima.",
      "Identificar tipos de clima.",
      "Observar dados simples de temperatura, chuva ou vento.",
      "Montar pequeno relatório climático."
    ]
  },
  {
    code: "EN020",
    name: "Conservação Ambiental",
    sourceUrl: "",
    requirements: [
      "Definir conservação ambiental.",
      "Identificar ameaças ao meio ambiente em sua região.",
      "Apresentar atitudes práticas de preservação.",
      "Participar de ação ambiental.",
      "Produzir relatório ou apresentação sobre a atividade."
    ]
  },
  {
    code: "EN021",
    name: "Geologia",
    sourceUrl: "",
    requirements: [
      "Definir geologia.",
      "Explicar a diferença entre rochas, minerais e solos.",
      "Identificar tipos básicos de rochas.",
      "Observar amostras ou imagens e classificá-las simples.",
      "Apresentar pequeno resumo sobre a estrutura da Terra."
    ]
  },

  {
    code: "AH005",
    name: "Crochê",
    sourceUrl: "",
    requirements: [
      "Conhecer materiais básicos do crochê.",
      "Demonstrar pontos simples.",
      "Executar pequena peça ou amostra.",
      "Explicar cuidados com materiais e acabamento.",
      "Apresentar trabalho final."
    ]
  },
  {
    code: "AH006",
    name: "Tricô",
    sourceUrl: "",
    requirements: [
      "Identificar materiais usados no tricô.",
      "Demonstrar pontos básicos.",
      "Executar amostra simples.",
      "Explicar noções de acabamento.",
      "Apresentar peça ou amostra final."
    ]
  },
  {
    code: "AH007",
    name: "Macramê",
    sourceUrl: "",
    requirements: [
      "Identificar materiais usados no macramê.",
      "Demonstrar nós básicos.",
      "Executar pequena peça decorativa.",
      "Explicar combinações simples de nós.",
      "Apresentar trabalho final."
    ]
  },

  {
    code: "HD005",
    name: "Costura",
    sourceUrl: "",
    requirements: [
      "Identificar materiais e ferramentas de costura.",
      "Demonstrar pontos básicos à mão.",
      "Executar pequenos reparos simples.",
      "Explicar cuidados com tecidos e acabamento.",
      "Apresentar peça ou reparo concluído."
    ]
  },
  {
    code: "HD006",
    name: "Lavanderia",
    sourceUrl: "",
    requirements: [
      "Identificar tipos básicos de tecido.",
      "Explicar cuidados de lavagem, secagem e passagem.",
      "Interpretar símbolos simples de etiqueta.",
      "Demonstrar separação correta de roupas.",
      "Executar procedimento correto de lavagem simples."
    ]
  },
  {
    code: "HD007",
    name: "Limpeza e Conservação",
    sourceUrl: "",
    requirements: [
      "Explicar a importância da limpeza do ambiente.",
      "Identificar materiais e produtos básicos de limpeza.",
      "Demonstrar cuidados com higiene e segurança.",
      "Realizar limpeza e organização de um ambiente.",
      "Apresentar rotina simples de conservação."
    ]
  },
  {
    code: "HD008",
    name: "Hospitalidade Cristã",
    sourceUrl: "",
    requirements: [
      "Definir hospitalidade cristã.",
      "Identificar atitudes adequadas no receber pessoas.",
      "Planejar recepção simples para visita ou evento.",
      "Demonstrar cortesia e organização.",
      "Participar de atividade prática de acolhimento."
    ]
  },

  {
    code: "AP004",
    name: "Ordem Unida",
    sourceUrl: "",
    requirements: [
      "Explicar o objetivo da ordem unida.",
      "Conhecer comandos básicos.",
      "Demonstrar posições fundamentais.",
      "Executar movimentos simples em conjunto.",
      "Participar de apresentação prática."
    ]
  },
  {
    code: "AP005",
    name: "Pioneirias",
    sourceUrl: "",
    requirements: [
      "Definir pioneirias e sua utilidade em acampamentos.",
      "Identificar materiais apropriados.",
      "Demonstrar amarras e estruturas simples.",
      "Construir pelo menos uma pioneiria básica.",
      "Explicar cuidados de segurança durante a montagem."
    ]
  },

  {
    code: "AR005",
    name: "Nós e Amarras",
    sourceUrl: "",
    requirements: [
      "Identificar tipos básicos de corda.",
      "Demonstrar nós principais.",
      "Explicar a utilidade de cada nó aprendido.",
      "Demonstrar amarras básicas.",
      "Aplicar os nós em situação prática."
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