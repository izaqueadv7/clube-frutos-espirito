import { PrismaClient } from "@prisma/client";
import * as cheerio from "cheerio";

const prisma = new PrismaClient();

type AreaSource = {
  area: string;
  url: string;
};

const AREA_SOURCES: AreaSource[] = [
  { area: "ADRA", url: "https://mda.wiki.br/especialidades" },
  { area: "Artes e habilidades manuais", url: "https://mda.wiki.br/Artes_e_habilidades_manuais" },
  { area: "Atividades agrícolas", url: "https://mda.wiki.br/Atividades_agr%C3%ADcolas" },
  { area: "Atividades missionárias e comunitárias", url: "https://mda.wiki.br/Atividades_Mission%C3%A1rias_e_Comunit%C3%A1rias" },
  { area: "Ensinos Bíblicos", url: "https://mda.wiki.br/Atividades_Mission%C3%A1rias_e_Comunit%C3%A1rias_-_Ensinos_Biblicos" },
  { area: "Atividades profissionais", url: "https://mda.wiki.br/Atividades_profissionais" },
  { area: "Atividades recreativas", url: "https://mda.wiki.br/Atividades_Recreativas" },
  { area: "Ciência e saúde", url: "https://mda.wiki.br/Ci%C3%AAncia_e_sa%C3%BAde" },
  { area: "Estudo da natureza", url: "https://mda.wiki.br/Estudos_da_Natureza" },
  { area: "Habilidades domésticas", url: "https://mda.wiki.br/Habilidades_dom%C3%A9sticas" },
  { area: "Mestrados", url: "https://mda.wiki.br/Mestrados" }
];

type RequirementItem = {
  marker: string;
  text: string;
  level: number;
  order: number;
};

function normalizeText(text: string) {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeName(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function cleanSpecialtyTitle(text: string) {
  return normalizeText(text)
    .replace(/^Especialidade de\s+/i, "")
    .replace(/^Especialidade da\s+/i, "")
    .replace(/^Especialidade do\s+/i, "")
    .replace(/\s+\|\s+.*$/g, "")
    .trim();
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 Clube Frutos do Espirito Importer",
      "Accept": "text/html,application/xhtml+xml"
    }
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar ${url} (${response.status})`);
  }

  return response.text();
}

function absoluteUrl(href: string) {
  if (href.startsWith("http")) return href;
  return new URL(href, "https://mda.wiki.br").toString();
}

function isSpecialtyHref(href: string) {
  const decoded = decodeURIComponent(href);
  return /\/Especialidade_de_/i.test(decoded);
}

function extractSpecialtyLinksFromArea(html: string) {
  const $ = cheerio.load(html);
  const found = new Map<string, string>();

  $("a").each((_, el) => {
    const text = normalizeText($(el).text());
    const href = $(el).attr("href");

    if (!href || !text) return;
    if (!/^Especialidade de\s+/i.test(text)) return;
    if (!isSpecialtyHref(href)) return;

    const title = cleanSpecialtyTitle(text);
    if (!title) return;

    found.set(title, absoluteUrl(href));
  });

  return [...found.entries()].map(([title, url]) => ({ title, url }));
}

function extractRequirementsFromPage(html: string): RequirementItem[] {
  const $ = cheerio.load(html);

  const pageText = normalizeText($("body").text());

  const sectionMatch = pageText.match(
    /Requisitos\s*([\s\S]*?)(Páginas Relacionadas|Categorias|Menções à esta página|Conteúdo retirado do site|$)/i
  );

  if (!sectionMatch) return [];

  const block = normalizeText(sectionMatch[1]);

  const items: RequirementItem[] = [];
  let order = 1;

  const numbered = [...block.matchAll(/(\d+\.)\s*([\s\S]*?)(?=(\d+\.)|$)/g)];

  if (numbered.length > 0) {
    for (const match of numbered) {
      const mainText = normalizeText(match[2]);
      if (!mainText) continue;

      items.push({
        marker: match[1],
        text: mainText,
        level: 0,
        order: order++
      });
    }
  } else {
    const lines = block
      .split("\n")
      .map((line) => normalizeText(line))
      .filter(Boolean);

    for (const line of lines) {
      if (/^(compartilhar|categorias|p[aá]ginas relacionadas|conte[uú]do retirado do site)/i.test(line)) {
        continue;
      }

      items.push({
        marker: `${order}.`,
        text: line,
        level: 0,
        order: order++
      });
    }
  }

  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.marker}|${normalizeName(item.text)}`;
    if (!item.text || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function findSpecialtyByTitle(title: string) {
  const specialties = await prisma.specialty.findMany({
    select: { id: true, name: true, code: true }
  });

  const normalizedTitle = normalizeName(title);

  let exact = specialties.find((item) => normalizeName(item.name) === normalizedTitle);
  if (exact) return exact;

  let relaxed = specialties.find((item) => {
    const db = normalizeName(item.name)
      .replace(/ - avancado/g, " avancado")
      .replace(/ - básico/g, " basico")
      .replace(/ - intermediário/g, " intermediario");

    const src = normalizedTitle
      .replace(/ - avancado/g, " avancado")
      .replace(/ - básico/g, " basico")
      .replace(/ - intermediário/g, " intermediario");

    return db === src;
  });

  return relaxed ?? null;
}

async function saveRequirements(
  specialtyId: string,
  sourceUrl: string,
  requirements: RequirementItem[]
) {
  await prisma.specialtyRequirement.deleteMany({
    where: { specialtyId }
  });

  for (const req of requirements) {
    await prisma.specialtyRequirement.create({
      data: {
        specialtyId,
        text: req.text,
        marker: req.marker,
        level: req.level,
        order: req.order
      }
    });
  }

  await prisma.specialty.update({
    where: { id: specialtyId },
    data: {
      sourceUrl,
      requirements: requirements.map((r) => `${r.marker} ${r.text}`).join("\n")
    }
  });
}

async function main() {
  console.log("Importando requisitos das especialidades...");

  let linkedPages = 0;
  let updated = 0;
  let empty = 0;
  let missingInDb = 0;

  for (const area of AREA_SOURCES) {
    console.log(`\nÁrea: ${area.area}`);

    const html = await fetchHtml(area.url);
    const links = extractSpecialtyLinksFromArea(html);

    console.log(`Links encontrados: ${links.length}`);
    linkedPages += links.length;

    for (const link of links) {
      const specialty = await findSpecialtyByTitle(link.title);

      if (!specialty) {
        console.warn(`Não encontrada no banco: ${link.title}`);
        missingInDb++;
        continue;
      }

      try {
        const specialtyHtml = await fetchHtml(link.url);
        const requirements = extractRequirementsFromPage(specialtyHtml);

        if (requirements.length === 0) {
          empty++;
          continue;
        }

        await saveRequirements(specialty.id, link.url, requirements);
        console.log(`✔ ${specialty.code ?? "--"} - ${specialty.name}: ${requirements.length} requisito(s)`);
        updated++;
      } catch (error) {
        console.error(`Erro em ${specialty.name}:`, error);
      }
    }
  }

  console.log("\nResumo:");
  console.log(`Páginas vinculadas: ${linkedPages}`);
  console.log(`Especialidades atualizadas: ${updated}`);
  console.log(`Sem requisitos extraídos: ${empty}`);
  console.log(`Não encontradas no banco: ${missingInDb}`);
}

main()
  .catch((error) => {
    console.error("Erro ao importar requisitos:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });