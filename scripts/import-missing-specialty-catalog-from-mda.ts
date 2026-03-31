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
    .replace(/\s+/g, "-");
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function cleanupName(name: string) {
  return normalizeText(name)
    .replace(/\s+\|\s+.*$/g, "")
    .replace(/\s+\(.*?\)\s*$/g, "")
    .replace(/^[-–:\s]+/, "")
    .trim();
}

type AreaSource = {
  area: string;
  prefix: string;
  url: string;
};

const AREA_SOURCES: AreaSource[] = [
  {
    area: "ADRA",
    prefix: "AD",
    url: "https://mda.wiki.br/especialidades"
  },
  {
    area: "Atividades missionárias e comunitárias",
    prefix: "AM",
    url: "https://mda.wiki.br/Atividades_Mission%C3%A1rias_e_Comunit%C3%A1rias"
  },
  {
    area: "Ensinos Bíblicos",
    prefix: "AM-EB",
    url: "https://mda.wiki.br/Atividades_Mission%C3%A1rias_e_Comunit%C3%A1rias_-_Ensinos_Biblicos"
  }
];

const OFFICIAL_AREAS = [
  { area: "ADRA", slug: "adra", order: 1 },
  { area: "Artes e habilidades manuais", slug: "artes-e-habilidades-manuais", order: 2 },
  { area: "Atividades agrícolas", slug: "atividades-agricolas", order: 3 },
  { area: "Atividades missionárias e comunitárias", slug: "atividades-missionarias-e-comunitarias", order: 4 },
  { area: "Ensinos Bíblicos", slug: "ensinos-biblicos", order: 5 },
  { area: "Atividades profissionais", slug: "atividades-profissionais", order: 6 },
  { area: "Atividades recreativas", slug: "atividades-recreativas", order: 7 },
  { area: "Ciência e saúde", slug: "ciencia-e-saude", order: 8 },
  { area: "Estudo da natureza", slug: "estudo-da-natureza", order: 9 },
  { area: "Habilidades domésticas", slug: "habilidades-domesticas", order: 10 },
  { area: "Mestrados", slug: "mestrados", order: 11 }
];

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 Clube Frutos do Espirito Importer",
      "Accept": "text/html,application/xhtml+xml"
    }
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar ${url} (${response.status})`);
  }

  return response.text();
}

async function ensureAreas() {
  for (const item of OFFICIAL_AREAS) {
    await prisma.specialtyArea.upsert({
      where: { slug: item.slug },
      update: {
        name: item.area,
        order: item.order
      },
      create: {
        name: item.area,
        slug: item.slug,
        order: item.order
      }
    });
  }
}

function buildRegex(prefix: string) {
  if (prefix === "AM-EB") {
    return /AM[-\s]?EB[-\s]?(\d{3})\s*([\s\S]*?)(?=AM[-\s]?EB[-\s]?\d{3}|Páginas nesta Categoria|Categorias|Menções à esta página|Páginas Relacionadas|Conteúdo retirado do site|$)/gi;
  }

  return new RegExp(
    `${prefix}[-\\s]?(\\d{3})\\s*([\\s\\S]*?)(?=${prefix}[-\\s]?\\d{3}|Páginas nesta Categoria|Categorias|Menções à esta página|Páginas Relacionadas|Conteúdo retirado do site|AM[-\\s]?EB[-\\s]?\\d{3}|$)`,
    "gi"
  );
}

function parseSpecialtiesFromHtml(html: string, prefix: string) {
  const $ = cheerio.load(html);

  const rawText = $("body").text();

  const compact = rawText
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n+/g, " ")
    .trim();

  const regex = buildRegex(prefix);
  const found = new Map<string, { code: string; name: string }>();

  for (const match of compact.matchAll(regex)) {
    const code =
      prefix === "AM-EB" ? `AM-EB${match[1]}` : `${prefix}${match[1]}`;

    let name = cleanupName(match[2] || "");

    if (!name) continue;

    name = name
      .replace(/^Especialidade de\s+/i, "")
      .replace(/\s+Especialidade de.*$/i, "")
      .replace(/^[-–:\s]+/, "")
      .trim();

    if (!name) continue;

    found.set(code, { code, name });
  }

  return [...found.values()].sort((a, b) => a.code.localeCompare(b.code));
}

async function upsertSpecialty(
  areaName: string,
  areaId: string,
  item: { code: string; name: string },
  order: number
) {
  const slug = slugify(`${item.code}-${item.name}`);

  const existingBySlug = await prisma.specialty.findUnique({
    where: { slug }
  });

  if (existingBySlug) {
    await prisma.specialty.update({
      where: { id: existingBySlug.id },
      data: {
        name: item.name,
        code: item.code,
        category: areaName,
        description: item.name,
        areaId,
        order,
        slug
      }
    });
    return;
  }

  const existingByName = await prisma.specialty.findUnique({
    where: { name: item.name }
  });

  if (existingByName) {
    await prisma.specialty.update({
      where: { id: existingByName.id },
      data: {
        name: item.name,
        code: item.code,
        category: areaName,
        description: item.name,
        areaId,
        order,
        slug
      }
    });
    return;
  }

  await prisma.specialty.create({
    data: {
      name: item.name,
      code: item.code,
      category: areaName,
      description: item.name,
      requirements: "",
      slug,
      areaId,
      order
    }
  });
}

async function importArea(areaSource: AreaSource) {
  console.log(`Importando ${areaSource.area}...`);

  const html = await fetchHtml(areaSource.url);

  const area = await prisma.specialtyArea.findUnique({
    where: { slug: slugify(areaSource.area) }
  });

  if (!area) {
    console.warn(`Área não encontrada no banco: ${areaSource.area}`);
    return;
  }

  const specialties = parseSpecialtiesFromHtml(html, areaSource.prefix);

  console.log(`Encontradas ${specialties.length} especialidades em ${areaSource.area}.`);

  if (specialties.length > 0) {
    console.log("Primeiras encontradas:", specialties.slice(0, 10));
  }

  for (let i = 0; i < specialties.length; i++) {
    await upsertSpecialty(areaSource.area, area.id, specialties[i], i + 1);
  }
}

async function main() {
  await ensureAreas();

  for (const source of AREA_SOURCES) {
    try {
      await importArea(source);
    } catch (error) {
      console.error(`Erro ao importar ${source.area}:`, error);
    }
  }

  console.log("Importação das áreas faltantes concluída.");
}

main()
  .catch((error) => {
    console.error("Erro ao importar catálogo faltante:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });