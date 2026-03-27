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

export function BibleReader() {
  const [book, setBook] = useState("Joao");
  const [chapter, setChapter] = useState(1);
  const [search, setSearch] = useState("");

  const [devotional, setDevotional] = useState<DevotionalItem | null>(null);
  const [verses, setVerses] = useState<VerseItem[]>([]);
  const [searchResult, setSearchResult] = useState<VerseItem[]>([]);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const selectedBook = useMemo(
    () => BIBLE_BOOKS.find((item) => item.name === book),
    [book]
  );

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
      setLoadingVerses(true);
      try {
        const data = await getVersesByReference(book, chapter);
        setVerses(data);
      } finally {
        setLoadingVerses(false);
      }
    }

    loadChapter();
  }, [book, chapter]);

  useEffect(() => {
    async function runSearch() {
      if (search.trim().length < 2) {
        setSearchResult([]);
        return;
      }

      setLoadingSearch(true);
      try {
        const data = await searchVerses(search);
        setSearchResult(data);
      } finally {
        setLoadingSearch(false);
      }
    }

    runSearch();
  }, [search]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="space-y-3 p-4 lg:col-span-1">
        <h2 className="section-title">Livros</h2>
        <Input
          placeholder="Buscar livro"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="max-h-80 space-y-1 overflow-auto">
          {BIBLE_BOOKS.filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
          ).map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setBook(item.name);
                setChapter(1);
              }}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold ${
                item.name === book ? "bg-primary text-white" : "hover:bg-red-50"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-4 lg:col-span-2">
        <Card className="p-4">
          <h3 className="section-title">Devocional do dia</h3>
          <p className="mt-2 text-sm text-slate-600">
            {devotional ? `${devotional.book} ${devotional.chapter}:${devotional.verse}` : "Carregando..."}
          </p>
          <p className="mt-2 text-ink">
            {devotional?.text ?? "Carregando devocional..."}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="section-title">
              {book} - Capítulo {chapter}
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setChapter((current) => Math.max(1, current - 1))}
              >
                Anterior
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  setChapter((current) =>
                    Math.min(selectedBook?.chapters ?? current, current + 1)
                  )
                }
              >
                Próximo
              </Button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {loadingVerses ? (
              <p className="text-sm text-slate-500">Carregando capítulo...</p>
            ) : verses.length === 0 ? (
              <p className="text-sm text-slate-500">
                Não foi possível carregar os versículos deste capítulo.
              </p>
            ) : (
              verses.map((item) => (
                <div
                  key={`${item.book}-${item.chapter}-${item.verse}`}
                  className="rounded-xl border border-red-100 p-3"
                >
                  <p className="text-xs font-semibold text-primary">
                    {item.book} {item.chapter}:{item.verse}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{item.text}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        {search.trim().length >= 2 ? (
          <Card className="p-4">
            <h3 className="section-title">Resultado da busca</h3>
            <div className="mt-4 space-y-2">
              {loadingSearch ? (
                <p className="text-sm text-slate-500">Buscando...</p>
              ) : searchResult.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Nenhum verso encontrado. Tente buscar algo como: Joao 3:16
                </p>
              ) : (
                searchResult.map((item) => (
                  <p key={`${item.book}-${item.chapter}-${item.verse}`} className="text-sm">
                    <span className="font-semibold text-primary">
                      {item.book} {item.chapter}:{item.verse}
                    </span>{" "}
                    - {item.text}
                  </p>
                ))
              )}
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}