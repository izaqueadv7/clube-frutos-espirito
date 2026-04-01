import * as fs from "fs/promises";
import * as cheerio from "cheerio";

const URL = "https://mda.wiki.br/Cart%C3%A3o_de_L%C3%ADder_Master";

function normalize(text: string) {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function main() {
  const res = await fetch(URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 Clube Frutos do Espirito Importer",
      Accept: "text/html,application/xhtml+xml"
    }
  });

  if (!res.ok) {
    throw new Error(`Falha ao buscar ${URL} (${res.status})`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const content =
    $(".page-content").first().length > 0
      ? $(".page-content").first()
      : $("#page-content").first();

  let targetHeading: cheerio.Element | null = null;

  content.find("h2").each((_, el) => {
    const text = normalize($(el).text());
    if (text === "III. Capacitação Aplicada") {
      targetHeading = el;
      return false;
    }
  });

  if (!targetHeading) {
    await fs.writeFile("debug-group3.txt", "Heading não encontrado", "utf8");
    console.log("Heading III. Capacitação Aplicada não encontrado.");
    return;
  }

  const next = $(targetHeading).nextUntil("h2");

  await fs.writeFile("debug-group3-text.txt", normalize(next.text()), "utf8");
  await fs.writeFile("debug-group3-html.html", next.html() || "", "utf8");

  const nodes = next
    .map((_, el) => ({
      tag: el.tagName,
      text: normalize($(el).text()).slice(0, 300),
      html: $.html(el).slice(0, 1200)
    }))
    .get();

  await fs.writeFile(
    "debug-group3-nodes.json",
    JSON.stringify(nodes, null, 2),
    "utf8"
  );

  console.log("Arquivos gerados:");
  console.log("- debug-group3-text.txt");
  console.log("- debug-group3-html.html");
  console.log("- debug-group3-nodes.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});