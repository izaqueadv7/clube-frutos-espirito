import { PrismaClient } from "@prisma/client";
import * as cheerio from "cheerio";

const prisma = new PrismaClient();

type AdraPage = {
  code: string;
  name: string;
  url: string;
};

const ADRA_PAGES: AdraPage[] = [
  {
    code: "AD001",
    name: "Alívio da Fome",
    url: "https://www.adventistas.org/pt/desbravadores/especialidades/alivio-da-fome-ad001-2/"
  },
  {
    code: "AD004",
    name: "Resposta a emergências e desastres",
    url: "https://www.adventistas.org/pt/desbravadores/especialidades/resposta-a-emergencias-e-desastres-ad004/"
  },
  {
    code: "AD005",
    name: "Resposta a emergências e desastres - avançado",
    url: "https://www.adventistas.org/pt/desbravadores/especialidades/resposta-a-emergencias-e-desastres-avancado-ad005/"
  },
  {
    code: "AD008",
    name: "Reassentamento de Refugiados",
    url: "https://www.adventistas.org/pt/desbravadores/especialidades/reassentamento-de-refugiados-ad008/"
  },
  {
    code: "AD009",
    name: "Desenvolvimento Comunitário",
    url: "https://www.adventistas.org/pt/desbravadores/especialidades/desenvolvimento-comunitario-ad009/"
  }
];

function normalizeText(text: string) {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 Clube Frutos do Espirito Importer"
    }
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar ${url} (${response.status})`);
  }

  return response.text();
}

function extractBodyText(html: string) {
  const $ = cheerio.load(html);
  return normalizeText($("body").text());
}

function extractRequirementsBlock(bodyText: string) {
  const startMatch = bodyText.match(/####\s*Requisitos/i);
  if (!startMatch || startMatch.index == null) return "";

  const afterStart = bodyText.slice(startMatch.index + startMatch[0].length);

  const stopPatterns = [
    /\n\s*Image:/i,
    /\n\s*Compartilhar:/i,
    /\n\s*Divisão Sul-Americana/i,
    /\n\s*##\s*Sobre Nós/i,
    /\n\s*##\s*Departamentos/i,
    /\n\s*##\s*Sedes Regionais/i,
    /\n\s*Igreja Adventista do Sétimo Dia Copyright/i
  ];

  let endIndex = afterStart.length;

  for (const pattern of stopPatterns) {
    const match = afterStart.match(pattern);
    if (match && match.index != null) {
      endIndex = Math.min(endIndex, match.index);
    }
  }

  return normalizeText(afterStart.slice(0, endIndex));
}

function parseRequirements(block: string) {
  if (!block) return [];

  const parts = block
    .split(/(?=\b\d+\.\s)/g)
    .map((item) => normalizeText(item))
    .filter(Boolean);

  const requirements: {
    marker: string;
    text: string;
    level: number;
    order: number;
  }[] = [];

  let order = 1;

  for (const part of parts) {
    const main = part.match(/^(\d+\.)\s*([\s\S]+)$/);
    if (!main) continue;

    const marker = main[1];
    const content = normalizeText(main[2]);

    // detecta subitens a), b), c)
    const subParts = content.split(/(?=\b[a-z]\)\s)/gi).filter(Boolean);

    if (subParts.length <= 1) {
      requirements.push({
        marker,
        text: content,
        level: 0,
        order: order++
      });
      continue;
    }

    const first = normalizeText(subParts[0]);
    if (first && !/^[a-z]\)\s/i.test(first)) {
      requirements.push({
        marker,
        text: first,
        level: 0,
        order: order++
      });
    } else {
      requirements.push({
        marker,
        text: "",
        level: 0,
        order: order++
      });
    }

    for (const sub of subParts.slice(first && !/^[a-z]\)\s/i.test(first) ? 1 : 0)) {
      const subMatch = sub.match(/^([a-z]\))\s*([\s\S]+)$/i);
      if (!subMatch) continue;

      requirements.push({
        marker: subMatch[1],
        text: normalizeText(subMatch[2]),
        level: 1,
        order: order++
      });
    }
  }

  return requirements.filter((item) => item.text);
}

async function importOneSpecialty(page: AdraPage) {
  console.log(`Importando ${page.code} - ${page.name}`);

  const html = await fetchHtml(page.url);
  const bodyText = extractBodyText(html);
  const block = extractRequirementsBlock(bodyText);
  const requirements = parseRequirements(block);

  if (requirements.length === 0) {
    console.warn(`Nenhum requisito encontrado para ${page.code}`);
    return;
  }

  const specialty = await prisma.specialty.findFirst({
    where: {
      OR: [{ code: page.code }, { name: page.name }]
    }
  });

  if (!specialty) {
    console.warn(`Especialidade não encontrada no banco: ${page.code} - ${page.name}`);
    return;
  }

  await prisma.specialty.update({
    where: { id: specialty.id },
    data: {
      sourceUrl: page.url,
      requirements: requirements.map((r) => `${r.marker} ${r.text}`).join("\n")
    }
  });

  await prisma.specialtyRequirement.deleteMany({
    where: { specialtyId: specialty.id }
  });

  for (const req of requirements) {
    await prisma.specialtyRequirement.create({
      data: {
        specialtyId: specialty.id,
        text: req.text,
        marker: req.marker,
        level: req.level,
        order: req.order
      }
    });
  }

  console.log(`✔ ${page.code} importada com ${requirements.length} requisito(s).`);
}

async function main() {
  for (const page of ADRA_PAGES) {
    await importOneSpecialty(page);
  }

  console.log("Importação dos requisitos ADRA concluída.");
}

main()
  .catch((error) => {
    console.error("Erro ao importar requisitos ADRA:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });