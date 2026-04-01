import { PrismaClient } from "@prisma/client";
import * as cheerio from "cheerio";

const prisma = new PrismaClient();

const LEADERSHIP_CLASSES = [
  {
    className: "Líder Master",
    url: "https://mda.wiki.br/Cart%C3%A3o_de_L%C3%ADder_Master"
  },
  {
    className: "Líder Master Avançado",
    url: "https://mda.wiki.br/Cart%C3%A3o_de_L%C3%ADder_Master_Avan%C3%A7ado"
  }
];

type ParsedRequirement = {
  title: string;
  details: string;
  marker: string;
  level: number;
  order: number;
};

type ParsedGroup = {
  title: string;
  roman: string;
  order: number;
  requirements: ParsedRequirement[];
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

function toAlpha(n: number) {
  let s = "";
  while (n > 0) {
    n--;
    s = String.fromCharCode(97 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
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
    const key = `${item.marker}|${item.order}|${item.details}`;
    if (!item.details || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseSectionNodes(
  $: cheerio.CheerioAPI,
  sectionNodes: cheerio.Cheerio<any>
): ParsedRequirement[] {
  const requirements: ParsedRequirement[] = [];
  let order = 1;

  function push(text: string, marker: string, level: number) {
    const clean = normalize(text);
    if (!clean) return;

    requirements.push({
      title: clean,
      details: clean,
      marker,
      level,
      order: order++
    });
  }

  function walk(node: cheerio.Element, level = 0) {
    const tag = node.tagName?.toLowerCase();

    if (tag === "li") {
      const el = $(node);

      const clone = el.clone();
      clone.children("ol,ul").remove();

      const text = clone.text();
      push(text, level === 0 ? `${requirements.length + 1}.` : "•", level);

      el.children("ol,ul").each((_, child) => {
        walk(child, level + 1);
      });
      return;
    }

    if (tag === "ol" || tag === "ul") {
      $(node)
        .children("li")
        .each((_, li) => {
          walk(li, level);
        });
      return;
    }

    if (tag === "p") {
      const text = normalize($(node).text());

      const num = text.match(/^(\d+)\.\s*(.+)$/);
      const alpha = text.match(/^([a-z])[\)\.]\s*(.+)$/i);

      if (num) {
        push(num[2], `${num[1]}.`, 0);
      } else if (alpha) {
        push(alpha[2], `${alpha[1]})`, 1);
      }
    }
  }

  sectionNodes.each((_, node) => {
    walk(node, 0);
  });

  return dedupeRequirements(requirements);
}

function extractGroupsFromMdaPage(html: string): ParsedGroup[] {
  const $ = cheerio.load(html);

  const content =
    $(".page-content").first().length > 0
      ? $(".page-content").first()
      : $("#page-content").first();

  const groups: ParsedGroup[] = [];

  content.find("h2").each((_, heading) => {
    const title = normalize($(heading).text());
    if (!title) return;

    const sectionNodes = $(heading).nextUntil("h2");
    if (!sectionNodes.length) return;

    let roman = "";
    let cleanTitle = title;

    if (/^Pré-Requisitos$/i.test(title) || /^Pre-Requisitos$/i.test(title)) {
      roman = "PR";
      cleanTitle = "Pré-Requisitos";
    } else {
      const match = title.match(/^([IVXLCDM]+)\.\s*(.+)$/i);
      if (!match) return;
      roman = match[1].toUpperCase();
      cleanTitle = normalize(match[2]);
    }

    const requirements = parseSectionNodes($, sectionNodes);

    groups.push({
      title: cleanTitle,
      roman,
      order: groups.length + 1,
      requirements
    });
  });

  return groups;
}

async function upsertGroup(
  classId: string,
  title: string,
  roman: string,
  order: number
) {
  let group = await prisma.pathfinderClassGroup.findFirst({
    where: {
      classId,
      title
    }
  });

  if (!group) {
    group = await prisma.pathfinderClassGroup.create({
      data: {
        classId,
        title,
        roman,
        order
      }
    });
  } else {
    group = await prisma.pathfinderClassGroup.update({
      where: { id: group.id },
      data: {
        title,
        roman,
        order
      }
    });
  }

  return group;
}

async function main() {
  console.log("Importando classes de liderança master...");

  for (const item of LEADERSHIP_CLASSES) {
    console.log(`\nClasse: ${item.className}`);

    const html = await fetchHtml(item.url);
    const parsedGroups = extractGroupsFromMdaPage(html);

    const classDb = await prisma.pathfinderClass.findFirst({
      where: { name: item.className }
    });

    if (!classDb) {
      console.log("❌ Classe não encontrada no banco");
      continue;
    }

    await prisma.classRequirement.deleteMany({
      where: { classId: classDb.id }
    });

    await prisma.pathfinderClassGroup.deleteMany({
      where: { classId: classDb.id }
    });

    let totalRequirements = 0;

    for (const groupData of parsedGroups) {
      const group = await upsertGroup(
        classDb.id,
        groupData.title,
        groupData.roman,
        groupData.order
      );

      for (const req of groupData.requirements) {
        await prisma.classRequirement.create({
          data: {
            classId: classDb.id,
            groupId: group.id,
            title: req.title,
            details: req.details,
            marker: req.marker,
            level: req.level,
            order: req.order,
            points: 1
          }
        });
        totalRequirements++;
      }
    }

    console.log(
      `✅ Importado: ${parsedGroups.length} grupos e ${totalRequirements} requisitos`
    );
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