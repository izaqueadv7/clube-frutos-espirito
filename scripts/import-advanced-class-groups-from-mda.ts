import { PrismaClient } from "@prisma/client";
import * as cheerio from "cheerio";

const prisma = new PrismaClient();

const ADVANCED_CLASSES = [
  {
    baseClassName: "Amigo",
    groupName: "Amigo da Natureza",
    url: "https://www.adventistas.org/pt/desbravadores/classes/amigo-e-amigo-da-natureza/"
  },
  {
    baseClassName: "Companheiro",
    groupName: "Companheiro de Excursão",
    url: "https://www.adventistas.org/pt/desbravadores/classes/companheiro-e-companheiro-de-excursionismo/"
  },
  {
    baseClassName: "Pesquisador",
    groupName: "Pesquisador de Campo e Bosque",
    url: "https://www.adventistas.org/pt/desbravadores/classes/pesquisador-e-pesquisador-de-campo-e-bosque/"
  },
  {
    baseClassName: "Pioneiro",
    groupName: "Pioneiro de Novas Fronteiras",
    url: "https://www.adventistas.org/pt/desbravadores/classes/pioneiro-e-pioneiro-de-novas-fronteiras/"
  },
  {
    baseClassName: "Excursionista",
    groupName: "Excursionista na Mata",
    url: "https://www.adventistas.org/pt/desbravadores/classes/excursionista-e-excursionista-na-mata/"
  },
  {
    baseClassName: "Guia",
    groupName: "Guia de Exploração",
    url: "https://www.adventistas.org/pt/desbravadores/classes/guia-e-guia-de-exploracao/"
  }
];

type ParsedRequirement = {
  title: string;
  details: string;
  marker: string;
  level: number;
  order: number;
};

function normalize(text: string) {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeLoose(text: string) {
  return normalize(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
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

function dedupeRequirements(items: ParsedRequirement[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.marker}|${item.level}|${item.details}`;
    if (!item.details || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractRequirementsFromNode($: cheerio.CheerioAPI, root: cheerio.Cheerio<any>) {
  const items: ParsedRequirement[] = [];
  let order = 1;

  const topLists = root.find("ol, ul").filter((_, el) => {
    const parentLists = $(el).parents("ol, ul");
    return parentLists.length === 0;
  });

  topLists.each((_, list) => {
    const tag = list.tagName?.toLowerCase();

    $(list)
      .children("li")
      .each((i, li) => {
        const liNode = $(li);
        const clone = liNode.clone();
        clone.children("ol,ul").remove();

        const text = normalize(clone.text());
        if (!text) return;

        items.push({
          title: text,
          details: text,
          marker: tag === "ul" ? "•" : getMarker(i, 0),
          level: 0,
          order: order++
        });

        liNode.children("ol,ul").each((_, childList) => {
          const childTag = childList.tagName?.toLowerCase();

          $(childList)
            .children("li")
            .each((j, sub) => {
              const subText = normalize($(sub).text());
              if (!subText) return;

              items.push({
                title: subText,
                details: subText,
                marker: childTag === "ul" ? "•" : getMarker(j, 1),
                level: 1,
                order: order++
              });
            });
        });
      });
  });

  return dedupeRequirements(items);
}

function extractAdvancedSectionFromOfficialPage(html: string, groupName: string) {
  const $ = cheerio.load(html);

  const headings = $("h1, h2, h3, h4, h5, h6");

  let targetHeading: cheerio.Element | null = null;

  headings.each((_, el) => {
    const text = normalizeLoose($(el).text());
    if (text.includes(normalizeLoose(groupName))) {
      targetHeading = el;
      return false;
    }
  });

  if (!targetHeading) return [] as ParsedRequirement[];

  const sectionNodes: cheerio.Element[] = [];
  let current = $(targetHeading).next();

  while (current.length > 0) {
    const tagName = current.get(0)?.tagName?.toLowerCase() || "";

    if (/^h[1-6]$/.test(tagName)) {
      break;
    }

    sectionNodes.push(current.get(0)!);
    current = current.next();
  }

  const wrapper = $("<div></div>");
  for (const node of sectionNodes) {
    wrapper.append($(node).clone());
  }

  const fromLists = extractRequirementsFromNode($, wrapper);
  if (fromLists.length > 0) return fromLists;

  const plainText = normalize(wrapper.text());

  const parts = plainText
    .split(/(?=(?:\d+\.)|(?:\d+\s)|(?:[a-z]\)))/i)
    .map((t) => normalize(t))
    .filter((t) => t.length > 8);

  return dedupeRequirements(
    parts.map((part, index) => ({
      title: part,
      details: part,
      marker: `${index + 1}.`,
      level: 0,
      order: index + 1
    }))
  );
}

async function getNextGroupPosition(classId: string) {
  const groups = await prisma.pathfinderClassGroup.findMany({
    where: {
      classId,
      order: { lt: 900 }
    },
    orderBy: { order: "asc" },
    select: { order: true }
  });

  const maxOrder = groups.length > 0 ? Math.max(...groups.map((g) => g.order)) : 0;
  const nextOrder = maxOrder + 1;

  return {
    order: nextOrder,
    roman: toRoman(nextOrder)
  };
}

async function main() {
  console.log("Importando classes avançadas como grupos...");

  for (const item of ADVANCED_CLASSES) {
    console.log(`\nClasse base: ${item.baseClassName}`);
    console.log(`Grupo: ${item.groupName}`);

    const html = await fetchHtml(item.url);
    const parsed = extractAdvancedSectionFromOfficialPage(html, item.groupName);

    const baseClass = await prisma.pathfinderClass.findFirst({
      where: { name: item.baseClassName }
    });

    if (!baseClass) {
      console.log("❌ Classe base não encontrada no banco");
      continue;
    }

    const nextPosition = await getNextGroupPosition(baseClass.id);

    let group = await prisma.pathfinderClassGroup.findFirst({
      where: {
        classId: baseClass.id,
        title: item.groupName
      }
    });

    if (!group) {
      group = await prisma.pathfinderClassGroup.create({
        data: {
          classId: baseClass.id,
          title: item.groupName,
          roman: nextPosition.roman,
          order: nextPosition.order
        }
      });
    } else {
      group = await prisma.pathfinderClassGroup.update({
        where: { id: group.id },
        data: {
          title: item.groupName,
          roman: nextPosition.roman,
          order: nextPosition.order
        }
      });
    }

    await prisma.classRequirement.deleteMany({
      where: {
        classId: baseClass.id,
        groupId: group.id
      }
    });

    for (const req of parsed) {
      await prisma.classRequirement.create({
        data: {
          classId: baseClass.id,
          groupId: group.id,
          title: req.title,
          details: req.details,
          marker: req.marker,
          level: req.level,
          order: req.order,
          points: 1
        }
      });
    }

    console.log(`✅ Importado: ${parsed.length} itens | Grupo ${group.roman}`);
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