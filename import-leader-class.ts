import { PrismaClient } from "@prisma/client";
import * as cheerio from "cheerio";

const prisma = new PrismaClient();

const CLASS_CONFIG = {
  className: "Líder",
  url: "https://mda.wiki.br/Cart%C3%A3o_de_L%C3%ADder"
};

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
  let mainCounter = 0;

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

  function walkList(listNode: cheerio.Element, level: number) {
    const tag = listNode.tagName?.toLowerCase() || "ol";
    const style = ($(listNode).attr("style") || "").toLowerCase();
    const isAlpha = style.includes("lower-alpha") || style.includes("upper-alpha");
    const isBullet = tag === "ul";

    $(listNode)
      .children()
      .each((index, child) => {
        const childTag = child.tagName?.toLowerCase() || "";

        if (childTag === "li") {
          const liNode = $(child);
          const clone = liNode.clone();
          clone.children("ol,ul").remove();

          const text = clone.text();

          let marker = "•";

          if (level === 0) {
            mainCounter += 1;
            marker = `${mainCounter}.`;
          } else if (isBullet) {
            marker = "•";
          } else if (isAlpha) {
            marker = `${toAlpha(index + 1)})`;
          } else {
            marker = `${index + 1}.`;
          }

          push(text, marker, level);

          liNode.children("ol,ul").each((_, nested) => {
            walkList(nested, level + 1);
          });

          return;
        }

        if (childTag === "ol" || childTag === "ul") {
          walkList(child, level + 1);
          return;
        }

        if (childTag === "p") {
          const text = normalize($(child).text());
          if (!text) return;

          const numbered = text.match(/^(\d+)\.\s*(.+)$/);
          const alpha = text.match(/^([a-z])[\)\.]\s*(.+)$/i);

          if (numbered) {
            mainCounter += 1;
            push(numbered[2], `${mainCounter}.`, level);
          } else if (alpha) {
            push(alpha[2], `${alpha[1].toLowerCase()})`, level + 1);
          }
        }
      });
  }

  sectionNodes.each((_, node) => {
    const tag = node.tagName?.toLowerCase() || "";

    if (tag === "ol" || tag === "ul") {
      walkList(node, 0);
      return;
    }

    if (tag === "li") {
      const text = normalize($(node).text());
      if (text) {
        mainCounter += 1;
        push(text, `${mainCounter}.`, 0);
      }
      return;
    }

    if (tag === "p") {
      const text = normalize($(node).text());
      if (!text) return;

      const numbered = text.match(/^(\d+)\.\s*(.+)$/);
      const alpha = text.match(/^([a-z])[\)\.]\s*(.+)$/i);

      if (numbered) {
        mainCounter += 1;
        push(numbered[2], `${mainCounter}.`, 0);
      } else if (alpha) {
        push(alpha[2], `${alpha[1].toLowerCase()})`, 1);
      }
    }
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
  console.log("Importando classe Líder...");

  const html = await fetchHtml(CLASS_CONFIG.url);
  const parsedGroups = extractGroupsFromMdaPage(html);

  const classDb = await prisma.pathfinderClass.findFirst({
    where: { name: CLASS_CONFIG.className }
  });

  if (!classDb) {
    console.log("❌ Classe não encontrada no banco");
    return;
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
  console.log("🔥 FINALIZADO");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });