import * as cheerio from "cheerio";
import fs from "node:fs/promises";

const PAGE_URL = "https://mda.wiki.br/Especialidade_de_Escrituras_Sagradas";

function normalizeText(text: string) {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function main() {
  const response = await fetch(PAGE_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 Clube Frutos do Espirito Importer",
      Accept: "text/html,application/xhtml+xml"
    }
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar ${PAGE_URL} (${response.status})`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const bodyText = normalizeText($("body").text());

  const headings = $("h1,h2,h3,h4,h5,h6")
    .map((_, el) => ({
      tag: el.tagName,
      text: normalizeText($(el).text())
    }))
    .get();

  const hasRequisitos = headings.some((h) => /requisitos/i.test(h.text));
  const requisitosIndex = bodyText.search(/Requisitos/i);

  const snippet =
    requisitosIndex >= 0
      ? bodyText.slice(Math.max(0, requisitosIndex - 500), requisitosIndex + 4000)
      : bodyText.slice(0, 5000);

  await fs.writeFile("debug-ameb-page.html", html, "utf8");
  await fs.writeFile("debug-ameb-page.txt", bodyText, "utf8");
  await fs.writeFile("debug-ameb-headings.json", JSON.stringify(headings, null, 2), "utf8");
  await fs.writeFile("debug-ameb-snippet.txt", snippet, "utf8");

  console.log("Arquivos gerados:");
  console.log("- debug-ameb-page.html");
  console.log("- debug-ameb-page.txt");
  console.log("- debug-ameb-headings.json");
  console.log("- debug-ameb-snippet.txt");
  console.log("");
  console.log(`Tem heading com 'Requisitos'? ${hasRequisitos ? "SIM" : "NÃO"}`);
  console.log(`Índice de 'Requisitos' no texto bruto: ${requisitosIndex}`);
}

main().catch((error) => {
  console.error("Erro no diagnóstico:", error);
  process.exit(1);
});