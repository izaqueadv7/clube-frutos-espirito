export type BibleBook = {
  name: string;
  chapters: number;
};

export type VerseItem = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

export const BIBLE_BOOKS: BibleBook[] = [
  { name: "Genesis", chapters: 50 },
  { name: "Exodo", chapters: 40 },
  { name: "Levitico", chapters: 27 },
  { name: "Numeros", chapters: 36 },
  { name: "Deuteronomio", chapters: 34 },
  { name: "Josue", chapters: 24 },
  { name: "Juizes", chapters: 21 },
  { name: "Rute", chapters: 4 },
  { name: "1 Samuel", chapters: 31 },
  { name: "2 Samuel", chapters: 24 },
  { name: "1 Reis", chapters: 22 },
  { name: "2 Reis", chapters: 25 },
  { name: "1 Cronicas", chapters: 29 },
  { name: "2 Cronicas", chapters: 36 },
  { name: "Esdras", chapters: 10 },
  { name: "Neemias", chapters: 13 },
  { name: "Ester", chapters: 10 },
  { name: "Jo", chapters: 42 },
  { name: "Salmos", chapters: 150 },
  { name: "Proverbios", chapters: 31 },
  { name: "Eclesiastes", chapters: 12 },
  { name: "Cantares", chapters: 8 },
  { name: "Isaias", chapters: 66 },
  { name: "Jeremias", chapters: 52 },
  { name: "Lamentacoes", chapters: 5 },
  { name: "Ezequiel", chapters: 48 },
  { name: "Daniel", chapters: 12 },
  { name: "Oseias", chapters: 14 },
  { name: "Joel", chapters: 3 },
  { name: "Amos", chapters: 9 },
  { name: "Obadias", chapters: 1 },
  { name: "Jonas", chapters: 4 },
  { name: "Miqueias", chapters: 7 },
  { name: "Naum", chapters: 3 },
  { name: "Habacuque", chapters: 3 },
  { name: "Sofonias", chapters: 3 },
  { name: "Ageu", chapters: 2 },
  { name: "Zacarias", chapters: 14 },
  { name: "Malaquias", chapters: 4 },
  { name: "Mateus", chapters: 28 },
  { name: "Marcos", chapters: 16 },
  { name: "Lucas", chapters: 24 },
  { name: "Joao", chapters: 21 },
  { name: "Atos", chapters: 28 },
  { name: "Romanos", chapters: 16 },
  { name: "1 Corintios", chapters: 16 },
  { name: "2 Corintios", chapters: 13 },
  { name: "Galatas", chapters: 6 },
  { name: "Efesios", chapters: 6 },
  { name: "Filipenses", chapters: 4 },
  { name: "Colossenses", chapters: 4 },
  { name: "1 Tessalonicenses", chapters: 5 },
  { name: "2 Tessalonicenses", chapters: 3 },
  { name: "1 Timoteo", chapters: 6 },
  { name: "2 Timoteo", chapters: 4 },
  { name: "Tito", chapters: 3 },
  { name: "Filemom", chapters: 1 },
  { name: "Hebreus", chapters: 13 },
  { name: "Tiago", chapters: 5 },
  { name: "1 Pedro", chapters: 5 },
  { name: "2 Pedro", chapters: 3 },
  { name: "1 Joao", chapters: 5 },
  { name: "2 Joao", chapters: 1 },
  { name: "3 Joao", chapters: 1 },
  { name: "Judas", chapters: 1 },
  { name: "Apocalipse", chapters: 22 }
];

export const VERSE_INDEX: VerseItem[] = [
  { book: "Joao", chapter: 3, verse: 16, text: "Deus amou o mundo e ofereceu salvacao." },
  { book: "Salmos", chapter: 23, verse: 1, text: "O Senhor cuida do seu povo como pastor." },
  { book: "Filipenses", chapter: 4, verse: 13, text: "A forca vem de Cristo para enfrentar desafios." },
  { book: "Josue", chapter: 1, verse: 9, text: "Coragem e fe para seguir em frente." },
  { book: "Romanos", chapter: 12, verse: 12, text: "Esperanca, paciencia e oracao constante." },
  { book: "Mateus", chapter: 5, verse: 16, text: "Boas obras refletem a luz de Deus." },
  { book: "1 Timoteo", chapter: 4, verse: 12, text: "Exemplo em palavra, conduta, amor e pureza." },
  { book: "Salmos", chapter: 119, verse: 105, text: "A Palavra guia cada passo no caminho certo." },
  { book: "Proverbios", chapter: 3, verse: 5, text: "Confianca total em Deus acima do proprio entendimento." },
  { book: "Isaias", chapter: 41, verse: 10, text: "Nao temas, Deus sustenta e fortalece." },
  { book: "Tiago", chapter: 1, verse: 5, text: "Sabedoria e dada a quem pede com fe." },
  { book: "Hebreus", chapter: 11, verse: 1, text: "Fe e conviccao do que ainda nao se ve." },
  { book: "Joao", chapter: 14, verse: 6, text: "Jesus e o caminho, a verdade e a vida." },
  { book: "Mateus", chapter: 28, verse: 19, text: "Ide e fazei discipulos em todas as nacoes." },
  { book: "Salmos", chapter: 46, verse: 1, text: "Deus e refugio e fortaleza em todo tempo." }
];

export function getDailyDevotional(date = new Date()) {
  const index = (date.getDate() * 7 + date.getMonth()) % VERSE_INDEX.length;
  return VERSE_INDEX[index];
}

export function getVersesByReference(book: string, chapter: number) {
  const hits = VERSE_INDEX.filter((item) => item.book.toLowerCase() === book.toLowerCase() && item.chapter === chapter);
  if (hits.length > 0) {
    return hits;
  }

  return [
    {
      book,
      chapter,
      verse: 1,
      text: "Leitura recomendada: medite neste capitulo e registre os principais aprendizados no seu diario espiritual."
    }
  ];
}

export function searchVerses(term: string) {
  const q = term.trim().toLowerCase();
  if (!q) return [];
  return VERSE_INDEX.filter(
    (item) => item.text.toLowerCase().includes(q) || item.book.toLowerCase().includes(q)
  );
}
