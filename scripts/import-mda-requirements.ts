import { PrismaClient } from "@prisma/client";
import * as cheerio from "cheerio";

const prisma = new PrismaClient();

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}

function normalizeText(text: string) {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildCandidateUrls(name: string) {
  const base = "https://mda.wiki.br";
  const raw = slugify(name);

  return [
    `${base}/Especialidade_de_${raw}`,
    `${base}/Especialidade_de_${raw}/`,
    `${base}/${raw}`,
    `${base}/${raw}/`
  ];
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 Clube Frutos do Espirito Importer"
    }
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar ${url} (${response.status})`);
  }

  return response.text();
}

async function resolveWorkingUrl(name: string) {
  const candidates = buildCandidateUrls(name);

  for (const url of candidates) {
    try {
      const html = await fetchHtml(url);
      if (html && html.length > 500) {
        return { url, html };
      }
    } catch {
      // tenta próximo
    }
  }

  return null;
}

function parseRequirementsFromMdaHtml(html: string) {
  const $ = cheerio.load(html);
  const bodyText = normalizeText($("body").text());

  const stopWords = [
    "Conteúdo retirado do site mda.wiki.br",
    "Ferramentas Pessoais",
    "Menu de navegação",
    "Ações da página",
    "Categorias",
    "Esta página foi modificada"
  ];

  let text = bodyText;
  for (const stop of stopWords) {
    const idx = text.indexOf(stop);
    if (idx !== -1) {
      text = text.slice(0, idx).trim();
    }
  }

  const lines = text
    .split("\n")
    .map((line) => normalizeText(line))
    .filter(Boolean);

  const requirements: {
    marker: string;
    text: string;
    level: number;
    order: number;
  }[] = [];

  let order = 1;

  for (const line of lines) {
    const main = line.match(/^(\d+\.)\s*(.+)$/);
    if (main) {
      requirements.push({
        marker: main[1],
        text: main[2].trim(),
        level: 0,
        order: order++
      });
      continue;
    }

    const subNumeric = line.match(/^(\d+\.)\s*(.+)$/);
    if (subNumeric) {
      requirements.push({
        marker: subNumeric[1],
        text: subNumeric[2].trim(),
        level: 1,
        order: order++
      });
      continue;
    }

    const letter = line.match(/^([a-z]\))\s*(.+)$/i);
    if (letter) {
      requirements.push({
        marker: letter[1],
        text: letter[2].trim(),
        level: 1,
        order: order++
      });
      continue;
    }

    const roman = line.match(/^([ivxlcdm]+\))\s*(.+)$/i);
    if (roman) {
      requirements.push({
        marker: roman[1],
        text: roman[2].trim(),
        level: 2,
        order: order++
      });
      continue;
    }

    if (requirements.length > 0) {
      const last = requirements[requirements.length - 1];
      last.text = `${last.text} ${line}`.trim();
    }
  }

  // remove duplicados simples
  const seen = new Set<string>();
  return requirements.filter((item) => {
    const key = `${item.marker}|${item.text}`;
    if (!item.text || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function importOneSpecialty(specialty: {
  id: string;
  name: string;
  code: string | null;
}) {
  const resolved = await resolveWorkingUrl(specialty.name);

  if (!resolved) {
    console.warn(`Página não encontrada no MDA: ${specialty.name}`);
    return;
  }

  const requirements = parseRequirementsFromMdaHtml(resolved.html);

  if (requirements.length === 0) {
    console.warn(`Nenhum requisito encontrado no MDA: ${specialty.name}`);
    return;
  }

  await prisma.specialty.update({
    where: { id: specialty.id },
    data: {
      sourceUrl: resolved.url,
      requirements: requirements.map((r) => `${r.marker} ${r.text}`).join("\n")
    }
  });

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

  console.log(`✔ ${specialty.code ?? "--"} ${specialty.name}: ${requirements.length} requisito(s)`);
}

async function main() {
  const specialties = await prisma.specialty.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      code: true
    }
  });

  console.log(`Importando requisitos MDA para ${specialties.length} especialidade(s)...`);

  for (const specialty of specialties) {
    await importOneSpecialty(specialty);
  }

  console.log("Importação MDA concluída.");
}

main()
  .catch((error) => {
    console.error("Erro ao importar requisitos do MDA:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });