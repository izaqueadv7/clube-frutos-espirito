import { PrismaClient } from "@prisma/client";
import * as cheerio from "cheerio";

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

type ParsedRequirement = {
  marker: string;
  text: string;
  level: number;
  order: number;
};

type ParsedGroup = {
  roman: string;
  title: string;
  order: number;
  requirements: ParsedRequirement[];
};

type ParsedClassSection = {
  groups: ParsedGroup[];
};

const CLASS_SOURCES = [
  {
    pageUrl: "https://www.adventistas.org/pt/desbravadores/classes/amigo-e-amigo-da-natureza/",
    sections: [
      { className: "Amigo", start: /^I\.\s+GERAIS$/i, end: /^CLASSE AVANÇADA\s+[–-]\s+AMIGO DA NATUREZA$/i },
      { className: "Amigo da Natureza", start: /^CLASSE AVANÇADA\s+[–-]\s+AMIGO DA NATUREZA$/i, end: /^$/ }
    ]
  },
  {
    pageUrl: "https://www.adventistas.org/pt/desbravadores/classes/companheiro-e-companheiro-de-excursionismo/",
    sections: [
      { className: "Companheiro", start: /^I\.\s+GERAIS$/i, end: /^CLASSE AVANÇADA\s+[–-]\s+COMPANHEIRO DE EXCURSIONISMO$/i },
      { className: "Companheiro de Excursão", start: /^CLASSE AVANÇADA\s+[–-]\s+COMPANHEIRO DE EXCURSIONISMO$/i, end: /^$/ }
    ]
  },
  {
    pageUrl: "https://www.adventistas.org/pt/desbravadores/classes/pesquisador-e-pesquisador-de-campo-e-bosque/",
    sections: [
      { className: "Pesquisador", start: /^I\.\s+GERAIS$/i, end: /^CLASSE AVANÇADA\s+[–-]\s+PESQUISADOR DE CAMPO E BOSQUE$/i },
      { className: "Pesquisador de Campo e Bosque", start: /^CLASSE AVANÇADA\s+[–-]\s+PESQUISADOR DE CAMPO E BOSQUE$/i, end: /^$/ }
    ]
  },
  {
    pageUrl: "https://www.adventistas.org/pt/desbravadores/classes/pioneiro-e-pioneiro-de-novas-fronteiras/",
    sections: [
      { className: "Pioneiro", start: /^I\.\s+GERAIS$/i, end: /^CLASSE AVANÇADA\s+[–-]\s+PIONEIRO DE NOVAS FRONTEIRAS$/i },
      { className: "Pioneiro de Novas Fronteiras", start: /^CLASSE AVANÇADA\s+[–-]\s+PIONEIRO DE NOVAS FRONTEIRAS$/i, end: /^$/ }
    ]
  },
  {
    pageUrl: "https://www.adventistas.org/pt/desbravadores/classes/excursionista-e-excursionista-na-mata/",
    sections: [
      { className: "Excursionista", start: /^I\.\s+GERAIS$/i, end: /^CLASSE AVANÇADA\s+[–-]\s+EXCURSIONISTA NA MATA$/i },
      { className: "Excursionista na Mata", start: /^CLASSE AVANÇADA\s+[–-]\s+EXCURSIONISTA NA MATA$/i, end: /^$/ }
    ]
  },
  {
    pageUrl: "https://www.adventistas.org/pt/desbravadores/classes/guia-e-guia-de-exploracao/",
    sections: [
      { className: "Guia", start: /^I\.\s+GERAIS$/i, end: /^CLASSE AVANÇADA\s+[–-]\s+GUIA DE EXPLORAÇÃO$/i },
      { className: "Guia de Exploração", start: /^CLASSE AVANÇADA\s+[–-]\s+GUIA DE EXPLORAÇÃO$/i, end: /^$/ }
    ]
  }
];

const LEADERSHIP_SOURCE = {
  pageUrl: "https://www.adventistas.org/pt/desbravadores/classes/classes-de-lideranca-requisitos/",
  classes: ["Líder", "Líder Master", "Líder Master Avançado"]
};

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 Pathfinder Catalog Importer"
    }
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar ${url} (${response.status})`);
  }

  return response.text();
}

function extractTextLines(html: string) {
  const $ = cheerio.load(html);
  const raw = $("body").text();

  return raw
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function normalizeRomanHeading(line: string) {
  const match = line.match(/^([IVXLCDM]+)\.\s+(.+)$/i);
  if (!match) return null;

  return {
    roman: match[1].toUpperCase(),
    title: match[2].trim()
  };
}

function parseRequirementsFromLines(lines: string[]): ParsedGroup[] {
  const groups: ParsedGroup[] = [];
  let currentGroup: ParsedGroup | null = null;
  let order = 1;

  for (const line of lines) {
    const roman = normalizeRomanHeading(line);

    if (roman) {
      currentGroup = {
        roman: roman.roman,
        title: roman.title,
        order: groups.length + 1,
        requirements: []
      };
      groups.push(currentGroup);
      continue;
    }

    if (!currentGroup) continue;

    const mainReq = line.match(/^(\d+\.)\s*(.+)$/);
    if (mainReq) {
      currentGroup.requirements.push({
        marker: mainReq[1],
        text: mainReq[2].trim(),
        level: 0,
        order: order++
      });
      continue;
    }

    const subReq = line.match(/^([a-z]\))\s*(.+)$/i);
    if (subReq) {
      currentGroup.requirements.push({
        marker: subReq[1],
        text: subReq[2].trim(),
        level: 1,
        order: order++
      });
      continue;
    }

    const subSubReq = line.match(/^([ivxlcdm]+\))\s*(.+)$/i);
    if (subSubReq) {
      currentGroup.requirements.push({
        marker: subSubReq[1],
        text: subSubReq[2].trim(),
        level: 2,
        order: order++
      });
    }
  }

  return groups;
}

function sliceSection(lines: string[], startPattern: RegExp, endPattern?: RegExp) {
  const startIndex = lines.findIndex((line) => startPattern.test(line));
  if (startIndex === -1) return [];

  let endIndex = lines.length;

  if (endPattern) {
    const foundEnd = lines.findIndex((line, idx) => idx > startIndex && endPattern.test(line));
    if (foundEnd !== -1) endIndex = foundEnd;
  }

  return lines.slice(startIndex, endIndex);
}

async function upsertClassRequirements(className: string, groups: ParsedGroup[], sourceUrl: string) {
  const dbClass = await prisma.pathfinderClass.findFirst({
    where: { name: className }
  });

  if (!dbClass) {
    console.warn(`Classe não encontrada no banco: ${className}`);
    return;
  }

  await prisma.pathfinderClass.update({
    where: { id: dbClass.id },
    data: {
      sourceUrl
    }
  });

  await prisma.classRequirement.deleteMany({
    where: { classId: dbClass.id }
  });

  await prisma.pathfinderClassGroup.deleteMany({
    where: { classId: dbClass.id }
  });

  for (const group of groups) {
    const createdGroup = await prisma.pathfinderClassGroup.create({
      data: {
        classId: dbClass.id,
        roman: group.roman,
        title: group.title,
        order: group.order
      }
    });

    for (const req of group.requirements) {
      await prisma.classRequirement.create({
        data: {
          classId: dbClass.id,
          groupId: createdGroup.id,
          title: req.text,
          details: "",
          marker: req.marker,
          level: req.level,
          order: req.order
        }
      });
    }
  }
}

async function importClassesOfficial() {
  for (const source of CLASS_SOURCES) {
    console.log(`Importando classes da página: ${source.pageUrl}`);
    const html = await fetchHtml(source.pageUrl);
    const lines = extractTextLines(html);

    for (const section of source.sections) {
      const sectionLines = sliceSection(lines, section.start, section.end);
      const parsed = parseRequirementsFromLines(sectionLines);

      if (parsed.length === 0) {
        console.warn(`Nenhum grupo encontrado para ${section.className}`);
        continue;
      }

      await upsertClassRequirements(section.className, parsed, source.pageUrl);
      console.log(`✔ Classe importada: ${section.className}`);
    }
  }
}

function findLeadershipClassStart(lines: string[], className: string) {
  const patterns = [
    new RegExp(`^${className}$`, "i"),
    new RegExp(`^####\\s+${className}$`, "i")
  ];

  return lines.findIndex((line) => patterns.some((rx) => rx.test(line)));
}

async function importLeadershipClasses() {
  console.log(`Importando liderança da página: ${LEADERSHIP_SOURCE.pageUrl}`);
  const html = await fetchHtml(LEADERSHIP_SOURCE.pageUrl);
  const lines = extractTextLines(html);

  for (let i = 0; i < LEADERSHIP_SOURCE.classes.length; i++) {
    const className = LEADERSHIP_SOURCE.classes[i];
    const nextClass = LEADERSHIP_SOURCE.classes[i + 1];

    const startIndex = findLeadershipClassStart(lines, className);
    if (startIndex === -1) {
      console.warn(`Classe de liderança não encontrada na página: ${className}`);
      continue;
    }

    let endIndex = lines.length;
    if (nextClass) {
      const nextIndex = findLeadershipClassStart(lines, nextClass);
      if (nextIndex !== -1 && nextIndex > startIndex) endIndex = nextIndex;
    }

    const sectionLines = lines.slice(startIndex, endIndex);
    const groups = parseRequirementsFromLines(sectionLines);

    if (groups.length === 0) {
      console.warn(`Nenhum grupo encontrado para ${className}`);
      continue;
    }

    await upsertClassRequirements(className, groups, LEADERSHIP_SOURCE.pageUrl);
    console.log(`✔ Classe importada: ${className}`);
  }
}

function extractCodeFromText(text: string) {
  const match = text.match(/\b([A-Z]{2,4}\d{3})\b/);
  return match ? match[1] : "";
}

async function importSpecialtiesCatalog() {
  console.log("Importando catálogo base de áreas oficiais de especialidades...");

  const OFFICIAL_AREAS = [
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

  for (let i = 0; i < OFFICIAL_AREAS.length; i++) {
    const areaName = OFFICIAL_AREAS[i];

    await prisma.specialtyArea.upsert({
      where: { slug: slugify(areaName) },
      update: {
        name: areaName,
        order: i + 1
      },
      create: {
        name: areaName,
        slug: slugify(areaName),
        order: i + 1
      }
    });
  }

  console.log("✔ Áreas oficiais de especialidades organizadas.");
}

async function main() {
  await importClassesOfficial();
  await importLeadershipClasses();
  await importSpecialtiesCatalog();

  console.log("Importação oficial concluída.");
}

main()
  .catch((error) => {
    console.error("Erro na importação oficial:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });