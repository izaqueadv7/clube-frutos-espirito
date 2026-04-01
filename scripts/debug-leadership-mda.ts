import * as fs from "fs/promises";
import * as cheerio from "cheerio";

const URLS = [
  {
    name: "lider-master",
    url: "https://mda.wiki.br/Cart%C3%A3o_de_L%C3%ADder_Master"
  },
  {
    name: "lider-master-avancado",
    url: "https://mda.wiki.br/Cart%C3%A3o_de_L%C3%ADder_Master_Avan%C3%A7ado"
  }
];

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
  for (const item of URLS) {
    const res = await fetch(item.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 Clube Frutos do Espirito Importer",
        Accept: "text/html,application/xhtml+xml"
      }
    });

    if (!res.ok) {
      throw new Error(`Falha ao buscar ${item.url} (${res.status})`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const content =
      $(".page-content").first().length > 0
        ? $(".page-content").first()
        : $("#page-content").first();

    const headings = content
      .find("h1, h2, h3, h4, h5, h6")
      .map((_, el) => normalize($(el).text()))
      .get()
      .filter(Boolean);

    const blocks: Array<{
      heading: string;
      nextUntilText: string;
      nextHtml: string;
    }> = [];

    content.find("h2").each((_, heading) => {
      const headingText = normalize($(heading).text());
      const next = $(heading).nextUntil("h2");

      blocks.push({
        heading: headingText,
        nextUntilText: normalize(next.text()),
        nextHtml: next.html() || ""
      });
    });

    await fs.writeFile(`${item.name}-page.html`, html, "utf8");
    await fs.writeFile(
      `${item.name}-headings.json`,
      JSON.stringify(headings, null, 2),
      "utf8"
    );
    await fs.writeFile(
      `${item.name}-blocks.json`,
      JSON.stringify(blocks, null, 2),
      "utf8"
    );
  }

  console.log("Arquivos gerados:");
  console.log("- lider-master-page.html");
  console.log("- lider-master-headings.json");
  console.log("- lider-master-blocks.json");
  console.log("- lider-master-avancado-page.html");
  console.log("- lider-master-avancado-headings.json");
  console.log("- lider-master-avancado-blocks.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});