"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BIBLE_BOOKS,
  getDailyDevotional,
  getVersesByReference,
  searchVerses,
  VerseItem
} from "@/data/bible";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type DevotionalItem = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

type ViewMode = "books" | "chapters" | "verses";

export function BibleReader() {
  const [devotional, setDevotional] = useState<DevotionalItem | null>(null);

  const [referenceSearch, setReferenceSearch] = useState("");
  const [searchResult, setSearchResult] = useState<VerseItem[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [bookSearch, setBookSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [verses, setVerses] = useState<VerseItem[]>([]);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [view, setView] = useState<ViewMode>("books");

  const filteredBooks = useMemo(() => {
    return BIBLE_BOOKS.filter((item) =>
      item.name.toLowerCase().includes(bookSearch.toLowerCase())
    );
  }, [bookSearch]);

  const currentBook = useMemo(() => {
    return BIBLE_BOOKS.find((item) => item.name === selectedBook) ?? null;
  }, [selectedBook]);

  useEffect(() => {
    async function loadDevotional() {
      try {
        const data = await getDailyDevotional();
        setDevotional(data);
      } catch {
        setDevotional({
          book: "Joao",
          chapter: 3,
          verse: 16,
          text: "Não foi possível carregar o devocional do dia."
        });
      }
    }

    loadDevotional();
  }, []);

  useEffect(() => {
    async function loadChapter() {
      if (!selectedBook || !selectedChapter) return;

      setLoadingVerses(true);
      try {
        const data = await getVersesByReference(selectedBook, selectedChapter);
        setVerses(data);
      } finally {
        setLoadingVerses(false);
      }
    }

    if (view === "verses" && selectedBook && selectedChapter) {
      loadChapter();
    }
  }, [view, selectedBook, selectedChapter]);

  async function handleReferenceSearch() {
    if (referenceSearch.trim().length < 2) {
      setSearchResult([]);
      return;
    }

    setLoadingSearch(true);
    try {
      const data = await searchVerses(referenceSearch);
      setSearchResult(data);
    } finally {
      setLoadingSearch(false);
    }
  }

  function openReference(item: VerseItem) {
    setSelectedBook(item.book);
    setSelectedChapter(item.chapter);
    setView("verses");
    setSearchResult([]);
    setReferenceSearch("");
  }

  function openBook(bookName: string) {
    setSelectedBook(bookName);
    setSelectedChapter(null);
    setVerses([]);
    setView("chapters");
  }

  function openChapter(chapter: number) {
    setSelectedChapter(chapter);
    setVerses([]);
    setView("verses");
  }

  function backToBooks() {
    setView("books");
    setSelectedBook(null);
    setSelectedChapter(null);
    setVerses([]);
  }

  function backToChapters() {
    setView("chapters");
    setSelectedChapter(null);
    setVerses([]);
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h2 className="section-title">Devocional do dia</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {devotional
            ? `${devotional.book} ${devotional.chapter}:${devotional.verse}`
            : "Carregando..."}
        </p>
        <p className="mt-3 text-base text-ink">
          {devotional?.text ?? "Carregando devocional..."}
        </p>
      </Card>

      <Card className="space-y-4 p-5">
        <div>
          <h2 className="section-title">Buscar referência bíblica</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Exemplo: Joao 3:16, Salmos 23:1, Romanos 12:12
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Digite a referência bíblica"
            value={referenceSearch}
            onChange={(event) => setReferenceSearch(event.target.value)}
          />
          <Button type="button" onClick={handleReferenceSearch}>
            Buscar
          </Button>
        </div>

        {referenceSearch.trim().length >= 2 || searchResult.length > 0 ? (
          <div className="space-y-2">
            {loadingSearch ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Buscando...</p>
            ) : searchResult.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nenhum verso encontrado. Tente algo como Joao 3:16
              </p>
            ) : (
              searchResult.map((item) => (
                <button
                  key={`${item.book}-${item.chapter}-${item.verse}`}
                  type="button"
                  onClick={() => openReference(item)}
                  className="block w-full rounded-xl border border-red-100 p-3 text-left hover:bg-red-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  <p className="font-semibold text-primary">
                    {item.book} {item.chapter}:{item.verse}
                  </p>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    {item.text}
                  </p>
                </button>
              ))
            )}
          </div>
        ) : null}
      </Card>

      <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-card dark:border-zinc-800 dark:bg-black dark:text-white dark:shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-primary dark:text-white">Bíblia</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Navegue por livros, capítulos e versículos
            </p>
          </div>

          {view !== "books" ? (
            <button
              type="button"
              onClick={view === "verses" ? backToChapters : backToBooks}
              className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            >
              Voltar
            </button>
          ) : null}
        </div>

        {view === "books" ? (
          <div className="space-y-4">
            <div>
              <input
                value={bookSearch}
                onChange={(event) => setBookSearch(event.target.value)}
                placeholder="Pesquisar livro"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-1">
              {filteredBooks.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => openBook(item.name)}
                  className="flex w-full items-center justify-between rounded-2xl px-3 py-4 text-left text-gray-800 transition hover:bg-gray-100 dark:text-white dark:hover:bg-white/10"
                >
                  <span className="text-lg font-medium">{item.name}</span>
                  <span className="text-xl text-gray-400 dark:text-gray-500">›</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {view === "chapters" && currentBook ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentBook.name}
              </h3>

              <button
                type="button"
                onClick={backToBooks}
                className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              >
                Livros
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {Array.from({ length: currentBook.chapters }, (_, index) => index + 1).map(
                (chapterNumber) => (
                  <button
                    key={chapterNumber}
                    type="button"
                    onClick={() => openChapter(chapterNumber)}
                    className="rounded-2xl bg-gray-100 px-3 py-5 text-center text-xl font-semibold text-gray-800 transition hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                  >
                    {chapterNumber}
                  </button>
                )
              )}
            </div>
          </div>
        ) : null}

        {view === "verses" && currentBook && selectedChapter ? (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-2xl text-gray-500 dark:text-gray-300">{currentBook.name}</p>
              <h3 className="mt-1 text-7xl font-bold leading-none text-gray-900 dark:text-white">
                {selectedChapter}
              </h3>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={backToChapters}
                className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              >
                Capítulos
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    selectedChapter > 1 && openChapter(selectedChapter - 1)
                  }
                  disabled={selectedChapter <= 1}
                  className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-40 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                >
                  Anterior
                </button>

                <button
                  type="button"
                  onClick={() =>
                    currentBook.chapters > selectedChapter &&
                    openChapter(selectedChapter + 1)
                  }
                  disabled={selectedChapter >= currentBook.chapters}
                  className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-40 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                >
                  Próximo
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {loadingVerses ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Carregando capítulo...</p>
              ) : verses.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Não foi possível carregar os versículos deste capítulo.
                </p>
              ) : (
                verses.map((item) => (
                  <div
                    key={`${item.book}-${item.chapter}-${item.verse}`}
                    className="text-lg leading-9 text-gray-800 dark:text-gray-100"
                  >
                    <span className="mr-2 align-super text-xs text-gray-500 dark:text-gray-400">
                      {item.verse}
                    </span>
                    {item.text}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}