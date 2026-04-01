import { PrismaClient } from "@prisma/client";
import * as cheerio from "cheerio";

const prisma = new PrismaClient();

const CLASS_URLS = [
  { name: "Amigo da Natureza", url: "https://mda.wiki.br/Cartão_de_Amigo_da_Natureza" },
  { name: "Companheiro de Excursão", url: "https://mda.wiki.br/Cartão_de_Companheiro_de_Excursão" },
  { name: "Pesquisador de Campo e Bosque", url: "https://mda.wiki.br/Cartão_de_Pesquisador_de_Campo_e_Bosque" },
  { name: "Pioneiro de Novas Fronteiras", url: "https://mda.wiki.br/Cartão_de_Pioneiro_de_Novas_Fronteiras" },
  { name: "Excursionista na Mata", url: "https://mda.wiki.br/Cartão_de_Excursionista_na_Mata" },
  { name: "Guia de Exploração", url: "https://mda.wiki.br/Cartão_de_Guia_de_Exploração" },
  { name: "Líder Master", url: "https://mda.wiki.br/Cartão_de_Líder_Master" },
  { name: "Líder Master Avançado", url: "https://mda.wiki.br/Cartão_de_Líder_Master_Avançado" }
];

type ParsedItem = {
  title: string;
  details: string;
  marker: string;
  level: number;
  order: number;
  group: string;
};

function normalize(text: string) {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toAlpha(n: number) {
  let s = "";
  while (n > 0) {
    n--;
    s = String.fromCharCode(97 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}

function getMarker(index: number, level: number) {
  if (level === 0) return `${index + 1}.`;
  if (level === 1) return `${toAlpha(index + 1)})`;
  return `${index + 1}.`;
}

async function fetchHtml(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 Clube Frutos do Espirito Importer",
      Accept: "text/html,application/xhtml+xml"
    }
  });

  if (!res.ok) {
    throw new Error(`Falha ao buscar ${url} (${res.status})`);
  }

  return res.text();
}

function extractFromLists(html: string) {
  const $ = cheerio.load(html);
  const items: ParsedItem[] = [];
  let order = 1;
  let currentGroup = "Requisitos";

  $(".page-content h2, .page-content h3, #page-content h2, #page-content h3").each((_, heading) => {
    const headingText = normalize($(heading).text());
    if (headingText) currentGroup = headingText;

    const section = $(heading).nextUntil("h2, h3");

    section.find("ol").each((_, ol) => {
      $(ol).children("li").each((i, li) => {
        const liNode = $(li);
        const cloned = liNode.clone();
        cloned.children("ol,ul").remove();

        const text = normalize(cloned.text());
        if (!text) return;

        items.push({
          title: text,
          details: text,
          marker: getMarker(i, 0),
          level: 0,
          order: order++,
          group: currentGroup
        });

        liNode.children("ol,ul").each((_, childList) => {
          $(childList).children("li").each((j, sub) => {
            const subText = normalize($(sub).text());
            if (!subText) return;

            items.push({
              title: subText,
              details: subText,
              marker: getMarker(j, 1),
              level: 1,
              order: order++,
              group: currentGroup
            });
          });
        });
      });
    });
  });

  return items;
}

function extractFromMetaDescription(html: string) {
  const $ = cheerio.load(html);
  const meta = $('meta[name="description"]').attr("content");

  if (!meta) return [] as ParsedItem[];

  const text = normalize(meta);

  const parts = text
    .split(/(?=(?:\d+\s)|(?:[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+\s))/)
    .map((t) => normalize(t))
    .filter((t) => t.length > 10);

  return parts.map((part, index) => ({
    title: part,
    details: part,
    marker: `${index + 1}.`,
    level: 0,
    order: index + 1,
    group: "Requisitos"
  }));
}

function extractRequirements(html: string) {
  const fromLists = extractFromLists(html);
  if (fromLists.length > 0) return fromLists;

  return extractFromMetaDescription(html);
}

async function main() {
  console.log("Importando classes avançadas...");

  for (const cls of CLASS_URLS) {
    console.log(`\nClasse: ${cls.name}`);

    const html = await fetchHtml(cls.url);
    const items = extractRequirements(html);

    const classDb = await prisma.pathfinderClass.findFirst({
      where: { name: cls.name }
    });

    if (!classDb) {
      console.log("❌ Classe não encontrada no banco");
      continue;
    }

    await prisma.classRequirement.deleteMany({
      where: { classId: classDb.id }
    });

    for (const item of items) {
      await prisma.classRequirement.create({
        data: {
          classId: classDb.id,
          title: item.title,
          details: item.details,
          text: item.details,
          marker: item.marker,
          level: item.level,
          order: item.order,
          groupId: null
        }
      });
    }

    console.log(`✅ Importado: ${items.length} itens`);
  }

  console.log("\n🔥 FINALIZADO");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });