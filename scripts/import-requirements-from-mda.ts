import axios from "axios";
import * as cheerio from "cheerio";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type RequirementItem = {
  marker: string;
  text: string;
  level: number;
  order: number;
};

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function dedupeRequirements(items: RequirementItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.marker}-${item.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
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

function getMarker(index: number, tag: string, level: number, type?: string, start?: string) {
  if (tag === "ul") return "•";

  const base = Number(start || "1");
  const value = base + index;

  const inferred = type || (level === 0 ? "1" : level === 1 ? "a" : "1");

  switch (inferred) {
    case "a": return `${toAlpha(value)})`;
    case "A": return `${toAlpha(value).toUpperCase()})`;
    case "i": return `${toRoman(value).toLowerCase()}.`;
    case "I": return `${toRoman(value)}.`;
    default: return `${value}.`;
  }
}

function extractList($: cheerio.CheerioAPI, el: cheerio.Element, level = 0, order = { v: 1 }): RequirementItem[] {
  const list = $(el);
  const tag = list.get(0)?.tagName || "ol";

  const type = list.attr("type");
  const start = list.attr("start");

  let result: RequirementItem[] = [];

  list.children("li").each((i, li) => {
    const node = $(li);

    const clone = node.clone();
    clone.children("ol,ul").remove();

    const text = normalizeText(clone.text());

    if (text) {
      result.push({
        marker: getMarker(i, tag, level, type, start),
        text,
        level,
        order: order.v++
      });
    }

    node.children("ol,ul").each((_, child) => {
      result.push(...extractList($, child, level + 1, order));
    });
  });

  return result;
}

function extractRequirements(html: string) {
  const $ = cheerio.load(html);

  const root = $(".page-content").first();
  const list = root.find("ol").first();

  if (list.length === 0) return [];

  return dedupeRequirements(
    extractList($, list.get(0)!)
  );
}

async function fetchPage(url: string) {
  const res = await axios.get(url);
  return res.data;
}

async function processArea(areaName: string) {
  const specialties = await prisma.specialty.findMany({
    where: {
      category: areaName
    }
  });

  console.log(`Importando ${areaName}...`);
  console.log(`Total: ${specialties.length}`);

  for (const sp of specialties) {
    try {
      const slug = sp.slug.replace(/-/g, "_");
      const url = `https://mda.wiki.br/${slug}/`;

      const html = await fetchPage(url);
      const requirements = extractRequirements(html);

      if (!requirements.length) {
        console.log(`⚠️ Sem requisitos: ${sp.name}`);
        continue;
      }

      await prisma.specialtyRequirement.deleteMany({
        where: { specialtyId: sp.id }
      });

      for (const req of requirements) {
        await prisma.specialtyRequirement.create({
          data: {
            specialtyId: sp.id,
            text: req.text,
            marker: req.marker,
            level: req.level,
            order: req.order
          }
        });
      }

      console.log(`✅ ${sp.name}`);
    } catch (err) {
      console.log(`❌ Erro em ${sp.name}`);
    }
  }
}

async function main() {
  const area = process.argv[2];

  if (!area) {
    console.log("Informe a área");
    process.exit(1);
  }

  await processArea(area);

  console.log("Finalizado");
}

main().finally(() => prisma.$disconnect());