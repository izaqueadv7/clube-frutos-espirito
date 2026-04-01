import { PrismaClient } from "@prisma/client";
import * as cheerio from "cheerio";

const prisma = new PrismaClient();

const AREA_URL = "https://mda.wiki.br/especialidades";

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

function toAlpha(num: number) {
  let n = num;
  let result = "";

  while (n > 0) {
    n--;
    result = String.fromCharCode(97 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }

  return result;
}

function toRoman(num: number) {
  const values: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"]
  ];

  let n = num;
  let result = "";

  for (const [value, symbol] of values) {
    while (n >= value) {
      result += symbol;
      n -= value;
    }
  }

  return result;
}

function getMarker(
  index: number,
  tagName: string,
  level: number,
  typeAttr?: string,
  startAttr?: string
) {
  if (tagName === "ul") return "•";

  const start = Number(startAttr || "1");
  const value = start + index;

  const inferredType =
    typeAttr || (level === 0 ? "1" : level === 1 ? "a" : level === 2 ? "1" : "a");

  switch (inferredType) {
    case "a":
      return `${toAlpha(value)})`;
    case "A":
      return `${toAlpha(value).toUpperCase()})`;
    case "i":
      return `${toRoman(value).toLowerCase()}.`;
    case "I":
      return `${toRoman(value)}.`;
    default:
      return `${value}.`;
  }
}

function dedupeRequirements(items: RequirementItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.marker}|${normalizeName(item.text)}`;
    if (!item.text || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractListRecursively(
  $: cheerio.CheerioAPI,
  listElement: any,
  level = 0,
  orderRef = { value: 1 }
): RequirementItem[] {
  const list = $(listElement);
  const tagName = list.get(0)?.tagName?.toLowerCase() || "ol";
  const typeAttr = list.attr("type");
  const startAttr = list.attr("start");

  const items: RequirementItem[] = [];

  list.children("li").each((index, li) => {
    const liNode = $(li);

    const cloned = liNode.clone();
    cloned.children("ol,ul").remove();

    const ownText = normalizeText(cloned.text());

    if (ownText) {
      items.push({
        marker: getMarker(index, tagName, level, typeAttr, startAttr),
        text: ownText,
        level,
        order: orderRef.value++
      });
    }

    liNode.children("ol,ul").each((_, childList) => {
      items.push(...extractListRecursively($, childList, level + 1, orderRef));
    });
  });

  return items;
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 Clube Frutos do Espirito Importer",
      Accept: "text/html,application/xhtml+xml"
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

    const normalized = normalizeName(title);
    if (normalized.includes("aventureiro") || normalized.includes("(aventureiros)")) {
      return;
    }

    found.set(title, absoluteUrl(href));
  });

  return [...found.entries()].map(([title, url]) => ({ title, url }));
}

function extractRequirementsFromPage(html: string): RequirementItem[] {
  const $ = cheerio.load(html);

  const contentRoot =
    $(".page-content").first().length > 0
      ? $(".page-content").first()
      : $("#page-content").first();

  if (contentRoot.length > 0) {
    const firstOl = contentRoot.find("ol").first();

    if (firstOl.length > 0) {
      return dedupeRequirements(
        extractListRecursively($, firstOl.get(0)!, 0, { value: 1 })
      );
    }

    const plainText = normalizeText(contentRoot.text());

    if (plainText) {
      const fallbackLines = plainText
        .split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/g)
        .map((line) => normalizeText(line))
        .filter(
          (line) =>
            line.length > 20 &&
            !/^(especialidade de|area|c[oó]digo|n[ií]vel|ano|institui[cç][aã]o de origem|conte[uú]do retirado do site|categorias|p[aá]ginas relacionadas)/i.test(
              line
            )
        );

      if (fallbackLines.length > 0) {
        return dedupeRequirements(
          fallbackLines.map((line, index) => ({
            marker: `${index + 1}.`,
            text: line,
            level: 0,
            order: index + 1
          }))
        );
      }
    }
  }

  const pageText = normalizeText($("body").text());
  const sectionMatch = pageText.match(
    /Requisitos\s*([\s\S]*?)(Páginas Relacionadas|Categorias|Menções à esta página|Conteúdo retirado do site|$)/i
  );

  if (!sectionMatch) return [];

  const block = normalizeText(sectionMatch[1]);
  const lines = block
    .split("\n")
    .map((line) => normalizeText(line))
    .filter(Boolean);

  return dedupeRequirements(
    lines.map((line, index) => ({
      marker: `${index + 1}.`,
      text: line,
      level: 0,
      order: index + 1
    }))
  );
}

async function findSpecialtyByTitle(title: string) {
  const specialties = await prisma.specialty.findMany({
    where: {
      code: {
        startsWith: "AD"
      }
    },
    select: {
      id: true,
      name: true,
      code: true
    }
  });

  const normalizedTitle = normalizeName(title);

  const exact = specialties.find((item) => normalizeName(item.name) === normalizedTitle);
  if (exact) return exact;

  const relaxed = specialties.find((item) => {
    const db = normalizeName(item.name)
      .replace(/emergencias/g, "emergências")
      .replace(/desenvolvimento comunitario/g, "desenvolvimento comunitário")
      .replace(/avancado/g, "avançado");

    const src = normalizedTitle
      .replace(/emergencias/g, "emergências")
      .replace(/desenvolvimento comunitario/g, "desenvolvimento comunitário")
      .replace(/avancado/g, "avançado");

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
  console.log("Importando requisitos de ADRA...");

  const html = await fetchHtml(AREA_URL);
  const links = extractSpecialtyLinksFromArea(html);

  console.log(`Links encontrados: ${links.length}`);

  let updated = 0;
  let empty = 0;
  let missingInDb = 0;

  for (const link of links) {
    const specialty = await findSpecialtyByTitle(link.title);

    if (!specialty) {
      continue;
    }

    try {
      const specialtyHtml = await fetchHtml(link.url);
      const requirements = extractRequirementsFromPage(specialtyHtml);

      if (requirements.length === 0) {
        console.warn(`Sem requisitos extraídos: ${specialty.code} - ${specialty.name}`);
        empty++;
        continue;
      }

      await saveRequirements(specialty.id, link.url, requirements);
      console.log(`✔ ${specialty.code} - ${specialty.name}: ${requirements.length} requisito(s)`);
      updated++;
    } catch (error) {
      console.error(`Erro em ${specialty.code} - ${specialty.name}:`, error);
    }
  }

  console.log("\nResumo ADRA:");
  console.log(`Especialidades atualizadas: ${updated}`);
  console.log(`Sem requisitos extraídos: ${empty}`);
  console.log(`Não encontradas no banco: ${missingInDb}`);
}

main()
  .catch((error) => {
    console.error("Erro ao importar requisitos de ADRA:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });