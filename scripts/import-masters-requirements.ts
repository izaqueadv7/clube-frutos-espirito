import axios from "axios";
import * as cheerio from "cheerio";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MASTERS = [
  { name: "Mestrado em ADRA", slug: "Mestrado_em_ADRA" },
  { name: "Mestrado em Aquática", slug: "Mestrado_em_Aquática" },
  { name: "Mestrado em Artes e Habilidades Manuais", slug: "Mestrado_em_Artes_e_Habilidades_Manuais" },
  { name: "Mestrado em Atividades Agrícolas", slug: "Mestrado_em_Atividades_Agrícolas" },
  { name: "Mestrado em Atividades Profissionais", slug: "Mestrado_em_Atividades_Profissionais" },
  { name: "Mestrado em Atividades Recreativas", slug: "Mestrado_em_Atividades_Recreativas" },
  { name: "Mestrado em Botânica", slug: "Mestrado_em_Botânica" },
  { name: "Mestrado em Ciência e Tecnologia", slug: "Mestrado_em_Ciência_e_Tecnologia" },
  { name: "Mestrado em Ecologia", slug: "Mestrado_em_Ecologia" },
  { name: "Mestrado em Ensinos Bíblicos", slug: "Mestrado_em_Ensinos_Bíblicos" },
  { name: "Mestrado em Esportes", slug: "Mestrado_em_Esportes" },
  { name: "Mestrado em Habilidades Domésticas", slug: "Mestrado_em_Habilidades_Domésticas" },
  { name: "Mestrado em Saúde", slug: "Mestrado_em_Saúde" },
  { name: "Mestrado em Testificação", slug: "Mestrado_em_Testificação" },
  { name: "Mestrado em Vida Campestre", slug: "Mestrado_em_Vida_Campestre" },
  { name: "Mestrado em Zoologia", slug: "Mestrado_em_Zoologia" }
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

function normalizeLoose(text: string) {
  return normalizeText(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isValidRequirement(text: string) {
  const t = normalizeLoose(text);

  if (!t || t.length < 2) return false;

  const blocked = [
    "conteudo retirado do site",
    "mda.wiki.br",
    "page_print",
    "display: none",
    "@media print",
    "navbar",
    "sidebar",
    "content_wrapper",
    "paginas relacionadas",
    "mencoes a esta pagina",
    "consulte este artigo no link",
    "html, body, #main",
    "background-color",
    "zoom: 125%",
    "position: initial"
  ];

  return !blocked.some((item) => t.includes(item));
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

function getMarker(index: number, tag: string, level: number, type?: string, start?: string) {
  if (tag === "ul") return "•";

  const base = Number(start || "1");
  const value = base + index;

  const inferred =
    type || (level === 0 ? "1" : level === 1 ? "a" : level === 2 ? "1" : "a");

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

function extractMalformedList(
  $: cheerio.CheerioAPI,
  listEl: cheerio.Element,
  level = 0,
  orderRef = { v: 1 }
): RequirementItem[] {
  const list = $(listEl);
  const listTag = list.get(0)?.tagName?.toLowerCase() || "ol";
  const listType = list.attr("type") || undefined;
  const listStart = list.attr("start") || undefined;

  const result: RequirementItem[] = [];
  let itemIndex = 0;

  list.contents().each((_, node) => {
    if (node.type !== "tag") return;

    const tag = node.tagName?.toLowerCase() || "";

    if (tag === "li") {
      const li = $(node);
      const clone = li.clone();
      clone.children("ol,ul").remove();

      const text = normalizeText(clone.text());

      if (isValidRequirement(text)) {
        result.push({
          marker: getMarker(itemIndex, listTag, level, listType, listStart),
          text,
          level,
          order: orderRef.v++
        });
      }

      itemIndex++;

      li.children("ol,ul").each((_, nested) => {
        result.push(...extractMalformedList($, nested, level + 1, orderRef));
      });

      return;
    }

    if (tag === "ol" || tag === "ul") {
      result.push(...extractMalformedList($, node, level + 1, orderRef));
    }
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

  const firstList = root.find("ol, ul").first();
  if (!firstList.length) return [];

  return dedupeRequirements(
    extractMalformedList($, firstList.get(0)!)
  ).filter((req) => isValidRequirement(req.text));
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

async function main() {
  console.log("Importando requisitos dos mestrados...");

  for (const master of MASTERS) {
    try {
      const specialty = await prisma.specialty.findFirst({
        where: { name: master.name }
      });

      if (!specialty) {
        console.log(`⚠️ Não encontrado no banco: ${master.name}`);
        continue;
      }

      const url = `https://mda.wiki.br/${master.slug}`;
      const html = await fetchPage(url);
      const requirements = extractRequirements(html);

      if (!requirements.length) {
        console.log(`⚠️ Sem requisitos: ${master.name}`);
        continue;
      }

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

      await prisma.specialty.update({
        where: { id: specialty.id },
        data: {
          sourceUrl: url,
          requirements: requirements.map((req) => `${req.marker} ${req.text}`).join("\n")
        }
      });

      console.log(`✅ ${master.name} (${requirements.length} requisito(s))`);
    } catch (error) {
      console.log(`❌ Erro em ${master.name}`);
      console.error(error);
    }
  }

  console.log("🔥 Finalizado");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });