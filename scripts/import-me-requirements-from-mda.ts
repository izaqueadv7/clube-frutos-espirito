import { PrismaClient } from "@prisma/client";
import * as cheerio from "cheerio";

const prisma = new PrismaClient();

const AREA_URL = "https://mda.wiki.br/Mestrados";

type RequirementItem = {
  marker: string;
  text: string;
  level: number;
  order: number;
};

function normalizeText(text: string) {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeName(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function cleanTitle(text: string) {
  return normalizeText(text)
    .replace(/^Especialidade de\s+/i, "")
    .replace(/^Mestrado em\s+/i, "")
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
  return `${index + 1}.`;
}

function extractFromList($: cheerio.CheerioAPI) {
  const firstOl = $("ol").first();

  if (!firstOl.length) return [];

  const items: RequirementItem[] = [];
  let order = 1;

  firstOl.children("li").each((i, el) => {
    const li = $(el);

    const text = normalizeText(
      li.clone().children("ol,ul").remove().end().text()
    );

    if (text) {
      items.push({
        marker: getMarker(i, 0),
        text,
        level: 0,
        order: order++
      });
    }

    li.find("ol > li").each((j, sub) => {
      const subText = normalizeText($(sub).text());

      if (subText) {
        items.push({
          marker: getMarker(j, 1),
          text: subText,
          level: 1,
          order: order++
        });
      }
    });
  });

  return items;
}

// 🔥 fallback (quando não tem <ol>)
function extractFromMetaDescription(html: string) {
  const $ = cheerio.load(html);
  const meta = $('meta[name="description"]').attr("content");

  if (!meta) return [];

  const parts = meta
    .split(/(?=\d+\s)/) // separa por números tipo "1 "
    .map((t) => normalizeText(t))
    .filter(Boolean);

  return parts.map((text, i) => ({
    marker: `${i + 1}.`,
    text,
    level: 0,
    order: i + 1
  }));
}

async function fetchHtml(url: string) {
  const res = await fetch(url);
  return res.text();
}

function absoluteUrl(href: string) {
  if (href.startsWith("http")) return href;
  return new URL(href, "https://mda.wiki.br").toString();
}

function extractLinks(html: string) {
  const $ = cheerio.load(html);
  const map = new Map<string, string>();

  $("a").each((_, el) => {
    const text = normalizeText($(el).text());
    const href = $(el).attr("href");

    if (!href || !text) return;
    if (!/Mestrado/i.test(text)) return;

    const title = cleanTitle(text);
    map.set(title, absoluteUrl(href));
  });

  return [...map.entries()].map(([title, url]) => ({ title, url }));
}

async function findSpecialty(title: string) {
  const all = await prisma.specialty.findMany({
    where: { code: { startsWith: "ME" } }
  });

  const normalized = normalizeName(title);

  return all.find(
    (s) => normalizeName(s.name).includes(normalized)
  );
}

async function save(
  id: string,
  url: string,
  reqs: RequirementItem[]
) {
  await prisma.specialtyRequirement.deleteMany({
    where: { specialtyId: id }
  });

  for (const r of reqs) {
    await prisma.specialtyRequirement.create({
      data: {
        specialtyId: id,
        text: r.text,
        marker: r.marker,
        level: r.level,
        order: r.order
      }
    });
  }

  await prisma.specialty.update({
    where: { id },
    data: { sourceUrl: url }
  });
}

async function main() {
  console.log("Importando Mestrados...");

  const html = await fetchHtml(AREA_URL);
  const links = extractLinks(html);

  let updated = 0;
  let empty = 0;
  let missing = 0;

  for (const link of links) {
    const specialty = await findSpecialty(link.title);

    if (!specialty) {
      missing++;
      continue;
    }

    const html = await fetchHtml(link.url);

    let reqs = extractFromList(cheerio.load(html));

    if (reqs.length === 0) {
      reqs = extractFromMetaDescription(html);
    }

    if (reqs.length === 0) {
      empty++;
      continue;
    }

    await save(specialty.id, link.url, reqs);
    updated++;
  }

  console.log("\nResumo ME:");
  console.log("Atualizadas:", updated);
  console.log("Sem requisitos:", empty);
  console.log("Não encontradas:", missing);
}

main().finally(() => prisma.$disconnect());