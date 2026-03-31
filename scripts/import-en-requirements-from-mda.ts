import { PrismaClient } from "@prisma/client";
import * as cheerio from "cheerio";

const prisma = new PrismaClient();

const AREA_URL = "https://mda.wiki.br/Estudos_da_Natureza";

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

function getMarker(index: number, level: number) {
  if (level === 0) return `${index + 1}.`;
  if (level === 1) return `${toAlpha(index + 1)})`;
  if (level === 2) return `${index + 1}.`;
  return `${toAlpha(index + 1)})`;
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
  listElement: cheerio.Element,
  level = 0,
  orderRef = { value: 1 }
): RequirementItem[] {
  const list = $(listElement);
  const items: RequirementItem[] = [];

  list.children("li").each((index, li) => {
    const liNode = $(li);

    const cloned = liNode.clone();
    cloned.children("ol,ul").remove();

    const ownText = normalizeText(cloned.text());

    if (ownText) {
      items.push({
        marker: getMarker(index, level),
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
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Erro ao buscar ${url}`);
  return response.text();
}

function absoluteUrl(href: string) {
  if (href.startsWith("http")) return href;
  return new URL(href, "https://mda.wiki.br").toString();
}

function extractSpecialtyLinksFromArea(html: string) {
  const $ = cheerio.load(html);
  const found = new Map<string, string>();

  $("a").each((_, el) => {
    const text = normalizeText($(el).text());
    const href = $(el).attr("href");

    if (!href || !text) return;
    if (!/^Especialidade de/i.test(text)) return;

    const title = cleanSpecialtyTitle(text);
    found.set(title, absoluteUrl(href));
  });

  return [...found.entries()].map(([title, url]) => ({ title, url }));
}

function extractRequirementsFromPage(html: string): RequirementItem[] {
  const $ = cheerio.load(html);

  const firstOl = $("ol").first();

  if (firstOl.length > 0) {
    return dedupeRequirements(
      extractListRecursively($, firstOl.get(0)!)
    );
  }

  return [];
}

async function findSpecialtyByTitle(title: string) {
  const specialties = await prisma.specialty.findMany({
    where: { code: { startsWith: "EN" } },
    select: { id: true, name: true, code: true }
  });

  const normalizedTitle = normalizeName(title);

  return (
    specialties.find((s) => normalizeName(s.name) === normalizedTitle) ?? null
  );
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
    data: { sourceUrl }
  });
}

async function main() {
  console.log("Importando requisitos de EN...");

  const html = await fetchHtml(AREA_URL);
  const links = extractSpecialtyLinksFromArea(html);

  let updated = 0;
  let empty = 0;
  let missing = 0;

  for (const link of links) {
    const specialty = await findSpecialtyByTitle(link.title);

    if (!specialty) {
      missing++;
      continue;
    }

    const html = await fetchHtml(link.url);
    const reqs = extractRequirementsFromPage(html);

    if (reqs.length === 0) {
      empty++;
      continue;
    }

    await saveRequirements(specialty.id, link.url, reqs);
    updated++;
  }

  console.log("\nResumo EN:");
  console.log("Atualizadas:", updated);
  console.log("Sem requisitos:", empty);
  console.log("Não encontradas:", missing);
}

main().finally(() => prisma.$disconnect());