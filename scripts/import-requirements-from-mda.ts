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
  return text
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeLoose(text: string) {
  return normalizeText(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function dedupeRequirements(items: RequirementItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.marker}|${item.level}|${normalizeLoose(item.text)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isValidRequirement(text: string) {
  const t = normalizeLoose(text);

  if (!t || t.length < 5) return false;

  const blockedSnippets = [
    "conteudo retirado do site",
    "mda.wiki.br",
    "page_print",
    "display: none",
    "@media print",
    "navbar",
    "sidebar",
    "content_wrapper",
    "categorias",
    "paginas relacionadas",
    "mencoes a esta pagina",
    "consulte este artigo no link",
    "html, body, #main",
    "background-color",
    "zoom: 125%",
    "position: initial",
    "talvez voce esteja procurando",
    "especialidades mencoes a esta pagina"
  ];

  if (blockedSnippets.some((s) => t.includes(s))) return false;

  return true;
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
  tag: string,
  level: number,
  type?: string,
  start?: string
) {
  if (tag === "ul") return "•";

  const base = Number(start || "1");
  const value = base + index;

  const inferred =
    type || (level === 0 ? "1" : level === 1 ? "a" : "1");

  switch (inferred) {
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

function extractList(
  $: cheerio.CheerioAPI,
  el: any,
  level = 0,
  order = { v: 1 }
): RequirementItem[] {
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

    if (isValidRequirement(text)) {
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

  const root =
    $(".page-content").first().length > 0
      ? $(".page-content").first()
      : $("#page-content").first();

  if (!root.length) return [];

  const list = root.find("ol").first();

  if (!list.length) return [];

  return dedupeRequirements(extractList($, list.get(0)!)).filter((req) =>
    isValidRequirement(req.text)
  );
}

async function fetchPage(url: string) {
  const res = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 Clube Frutos do Espirito Importer",
      Accept: "text/html,application/xhtml+xml"
    },
    timeout: 30000
  });

  return res.data;
}

function buildMdaUrlFromSlug(slug: string) {
  return `https://mda.wiki.br/${slug.replace(/-/g, "_")}/`;
}

async function cleanupGarbageRequirements() {
  await prisma.specialtyRequirement.deleteMany({
    where: {
      OR: [
        { text: { contains: "Conteúdo retirado" } },
        { text: { contains: "mda.wiki" } },
        { text: { contains: "page_print" } },
        { text: { contains: "navbar" } },
        { text: { contains: "sidebar" } },
        { text: { contains: "content_wrapper" } }
      ]
    }
  });
}

async function processArea(areaName: string) {
  if (areaName.toLowerCase() === "mestrados") {
    console.log(
      "⚠️ A área 'Mestrados' não deve usar este script. Use um script próprio para mestrados."
    );
    return;
  }

  const specialties = await prisma.specialty.findMany({
    where: {
      category: areaName
    },
    orderBy: {
      order: "asc"
    }
  });

  console.log(`Importando ${areaName}...`);
  console.log(`Total: ${specialties.length}`);

  let updated = 0;
  let empty = 0;
  let errors = 0;

  for (const sp of specialties) {
    try {
      const url =
        sp.sourceUrl && sp.sourceUrl.includes("mda.wiki.br")
          ? sp.sourceUrl
          : buildMdaUrlFromSlug(sp.slug);

      const html = await fetchPage(url);
      const requirements = extractRequirements(html);

      if (!requirements.length) {
        console.log(`⚠️ Sem requisitos: ${sp.name}`);
        empty++;
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

      await prisma.specialty.update({
        where: { id: sp.id },
        data: {
          sourceUrl: url,
          requirements: requirements
            .map((req) => `${req.marker} ${req.text}`)
            .join("\n")
        }
      });

      console.log(`✅ ${sp.name} (${requirements.length} requisito(s))`);
      updated++;
    } catch (err) {
      console.log(`❌ Erro em ${sp.name}`);
      errors++;
    }
  }

  console.log("\nResumo:");
  console.log(`Atualizadas: ${updated}`);
  console.log(`Sem requisitos: ${empty}`);
  console.log(`Erros: ${errors}`);
}

async function main() {
  const area = process.argv[2];

  if (!area) {
    console.log("Informe a área");
    process.exit(1);
  }

  await cleanupGarbageRequirements();
  await processArea(area);

  console.log("Finalizado");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });