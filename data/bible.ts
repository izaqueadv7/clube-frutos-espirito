export type BibleBook = {
  name: string;
  code: string;
  chapters: number;
};

export type VerseItem = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

export const BIBLE_BOOKS: BibleBook[] = [
  { name: "Genesis", code: "GEN", chapters: 50 },
  { name: "Exodo", code: "EXO", chapters: 40 },
  { name: "Levitico", code: "LEV", chapters: 27 },
  { name: "Numeros", code: "NUM", chapters: 36 },
  { name: "Deuteronomio", code: "DEU", chapters: 34 },
  { name: "Josue", code: "JOS", chapters: 24 },
  { name: "Juizes", code: "JDG", chapters: 21 },
  { name: "Rute", code: "RUT", chapters: 4 },
  { name: "1 Samuel", code: "1SA", chapters: 31 },
  { name: "2 Samuel", code: "2SA", chapters: 24 },
  { name: "1 Reis", code: "1KI", chapters: 22 },
  { name: "2 Reis", code: "2KI", chapters: 25 },
  { name: "1 Cronicas", code: "1CH", chapters: 29 },
  { name: "2 Cronicas", code: "2CH", chapters: 36 },
  { name: "Esdras", code: "EZR", chapters: 10 },
  { name: "Neemias", code: "NEH", chapters: 13 },
  { name: "Ester", code: "EST", chapters: 10 },
  { name: "Jo", code: "JOB", chapters: 42 },
  { name: "Salmos", code: "PSA", chapters: 150 },
  { name: "Proverbios", code: "PRO", chapters: 31 },
  { name: "Eclesiastes", code: "ECC", chapters: 12 },
  { name: "Cantares", code: "SNG", chapters: 8 },
  { name: "Isaias", code: "ISA", chapters: 66 },
  { name: "Jeremias", code: "JER", chapters: 52 },
  { name: "Lamentacoes", code: "LAM", chapters: 5 },
  { name: "Ezequiel", code: "EZK", chapters: 48 },
  { name: "Daniel", code: "DAN", chapters: 12 },
  { name: "Oseias", code: "HOS", chapters: 14 },
  { name: "Joel", code: "JOL", chapters: 3 },
  { name: "Amos", code: "AMO", chapters: 9 },
  { name: "Obadias", code: "OBA", chapters: 1 },
  { name: "Jonas", code: "JON", chapters: 4 },
  { name: "Miqueias", code: "MIC", chapters: 7 },
  { name: "Naum", code: "NAM", chapters: 3 },
  { name: "Habacuque", code: "HAB", chapters: 3 },
  { name: "Sofonias", code: "ZEP", chapters: 3 },
  { name: "Ageu", code: "HAG", chapters: 2 },
  { name: "Zacarias", code: "ZEC", chapters: 14 },
  { name: "Malaquias", code: "MAL", chapters: 4 },
  { name: "Mateus", code: "MAT", chapters: 28 },
  { name: "Marcos", code: "MRK", chapters: 16 },
  { name: "Lucas", code: "LUK", chapters: 24 },
  { name: "Joao", code: "JHN", chapters: 21 },
  { name: "Atos", code: "ACT", chapters: 28 },
  { name: "Romanos", code: "ROM", chapters: 16 },
  { name: "1 Corintios", code: "1CO", chapters: 16 },
  { name: "2 Corintios", code: "2CO", chapters: 13 },
  { name: "Galatas", code: "GAL", chapters: 6 },
  { name: "Efesios", code: "EPH", chapters: 6 },
  { name: "Filipenses", code: "PHP", chapters: 4 },
  { name: "Colossenses", code: "COL", chapters: 4 },
  { name: "1 Tessalonicenses", code: "1TH", chapters: 5 },
  { name: "2 Tessalonicenses", code: "2TH", chapters: 3 },
  { name: "1 Timoteo", code: "1TI", chapters: 6 },
  { name: "2 Timoteo", code: "2TI", chapters: 4 },
  { name: "Tito", code: "TIT", chapters: 3 },
  { name: "Filemom", code: "PHM", chapters: 1 },
  { name: "Hebreus", code: "HEB", chapters: 13 },
  { name: "Tiago", code: "JAS", chapters: 5 },
  { name: "1 Pedro", code: "1PE", chapters: 5 },
  { name: "2 Pedro", code: "2PE", chapters: 3 },
  { name: "1 Joao", code: "1JN", chapters: 5 },
  { name: "2 Joao", code: "2JN", chapters: 1 },
  { name: "3 Joao", code: "3JN", chapters: 1 },
  { name: "Judas", code: "JUD", chapters: 1 },
  { name: "Apocalipse", code: "REV", chapters: 22 }
];

type BibleApiVerse = {
  book_id?: string;
  book_name?: string;
  chapter: number;
  verse: number;
  text: string;
};

type BibleApiChapterResponse = {
  reference?: string;
  verses?: BibleApiVerse[];
};

const TRANSLATION = "almeida";

export function getDailyDevotionalReference(date = new Date()) {
  const references = [
    "Joao 3:16",
    "Salmos 23:1",
    "Filipenses 4:13",
    "Josue 1:9",
    "Romanos 12:12",
    "Mateus 5:16",
    "1 Timoteo 4:12",
    "Salmos 119:105",
    "Proverbios 3:5",
    "Isaias 41:10",
    "Tiago 1:5",
    "Hebreus 11:1",
    "Joao 14:6",
    "Mateus 28:19",
    "Salmos 46:1"
  ];

  const index = (date.getDate() * 7 + date.getMonth()) % references.length;
  return references[index];
}

export async function getDailyDevotional() {
  const reference = getDailyDevotionalReference();
  const response = await fetch(
    `https://bible-api.com/${encodeURIComponent(reference)}?translation=${TRANSLATION}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Não foi possível carregar o devocional.");
  }

  const data = await response.json();

  const firstVerse = data?.verses?.[0];

  return {
    book: firstVerse?.book_name ?? "Joao",
    chapter: firstVerse?.chapter ?? 1,
    verse: firstVerse?.verse ?? 1,
    text: data?.text?.trim?.() || firstVerse?.text?.trim?.() || "Sem conteúdo disponível."
  };
}

export async function getVersesByReference(book: string, chapter: number): Promise<VerseItem[]> {
  const selectedBook = BIBLE_BOOKS.find(
    (item) => item.name.toLowerCase() === book.toLowerCase()
  );

  if (!selectedBook) {
    return [];
  }

  const response = await fetch(
    `https://bible-api.com/data/${TRANSLATION}/${selectedBook.code}/${chapter}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    return [];
  }

  const data: BibleApiChapterResponse = await response.json();

  return (data.verses ?? []).map((item) => ({
    book,
    chapter: item.chapter,
    verse: item.verse,
    text: item.text.trim()
  }));
}

export async function searchVerses(term: string): Promise<VerseItem[]> {
  const q = term.trim();
  if (!q) return [];

  const response = await fetch(
    `https://bible-api.com/${encodeURIComponent(q)}?translation=${TRANSLATION}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  return (data.verses ?? []).map((item: BibleApiVerse) => ({
    book: item.book_name ?? "",
    chapter: item.chapter,
    verse: item.verse,
    text: item.text.trim()
  }));
}