export const VERSE_OF_WEEK = [
  "Filipenses 4:13 - Posso todas as coisas naquele que me fortalece.",
  "Salmos 119:105 - Lampada para os meus pes e tua palavra.",
  "Josue 1:9 - Sede forte e corajoso.",
  "Mateus 5:16 - Que a luz de voces brilhe diante dos homens.",
  "Romanos 12:12 - Alegrai-vos na esperanca, sede pacientes na tribulacao.",
  "Joao 13:34 - Ameis uns aos outros como eu vos amei."
];

export function getVerseOfWeek(date = new Date()) {
  const reference = new Date(date.getFullYear(), 0, 1);
  const diff = Math.floor((date.getTime() - reference.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return VERSE_OF_WEEK[Math.abs(diff) % VERSE_OF_WEEK.length];
}

export function getVerseOfDay(date = new Date()) {
  const index = (date.getDate() + date.getMonth() * 3) % VERSE_OF_WEEK.length;
  return VERSE_OF_WEEK[index];
}
