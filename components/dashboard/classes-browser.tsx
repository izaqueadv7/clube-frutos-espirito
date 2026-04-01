"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, BookOpenCheck } from "lucide-react";

type RequirementItem = {
  id: string;
  title: string;
  details: string;
  marker: string;
  level: number;
  order: number;
};

type GroupItem = {
  id: string;
  title: string;
  roman: string;
  order: number;
  requirements: RequirementItem[];
};

type ClassItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  order: number;
  groups: GroupItem[];
  looseRequirements: RequirementItem[];
};

function categoryLabel(category: string) {
  if (category === "REGULAR") return "Regular";
  if (category === "AVANCADA") return "Avançada";
  if (category === "LIDERANCA") return "Liderança";
  return "Classe";
}

function getClassDisplayName(name: string) {
  const map: Record<string, string> = {
    "Amigo": "Amigo e Amigo da Natureza",
    "Companheiro": "Companheiro e Companheiro de Excursão",
    "Pesquisador": "Pesquisador e Pesquisador de Campo e Bosque",
    "Pioneiro": "Pioneiro e Pioneiro de Novas Fronteiras",
    "Excursionista": "Excursionista e Excursionista na Mata",
    "Guia": "Guia e Guia de Exploração"
  };

  return map[name] ?? name;
}

function indentClass(level: number) {
  if (level === 1) return "ml-4";
  if (level >= 2) return "ml-8";
  return "";
}

export function ClassesBrowser({ items }: { items: ClassItem[] }) {
  const [search, setSearch] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [items, search]);

  const selectedClass =
    items.find((item) => item.id === selectedClassId) ?? null;

  function backToList() {
    setSelectedClassId(null);
  }

  return (
    <div className="space-y-4">
      {!selectedClass ? (
        <>
          <div className="rounded-[28px] bg-primary p-5 text-white shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
              Classes
            </p>
            <h1 className="mt-1 text-3xl font-extrabold">
              Trilhas de crescimento
            </h1>
            <p className="mt-2 text-sm text-white/85">
              Escolha uma classe para visualizar seus grupos e requisitos.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar classe"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-primary dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedClassId(item.id)}
                className="flex w-full items-center justify-between rounded-[28px] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-primary/30 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    {categoryLabel(item.category)}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                    {getClassDisplayName(item.name)}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {item.description}
                  </p>
                </div>

                <div className="ml-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </button>
            ))}

            {filtered.length === 0 ? (
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-slate-300">
                Nenhuma classe encontrada.
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <>
          <div className="rounded-[28px] bg-primary p-5 text-white shadow-lg">
            <button
              type="button"
              onClick={backToList}
              className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar para classes
            </button>

            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
              {categoryLabel(selectedClass.category)}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold">
              {getClassDisplayName(selectedClass.name)}
            </h1>
            <p className="mt-2 text-sm text-white/85">
              {selectedClass.description}
            </p>
          </div>

          {selectedClass.groups.length > 0 ? (
            <div className="space-y-4">
              {selectedClass.groups.map((group) => (
                <div
                  key={group.id}
                  className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white">
                      {group.roman}
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        Grupo
                      </p>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {group.title}
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {group.requirements.map((req) => (
                      <div
                        key={req.id}
                        className={`rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900 ${indentClass(req.level)}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                            <BookOpenCheck className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {req.marker ? `${req.marker} ` : ""}
                              {req.title}
                            </p>
                            {req.details ? (
                              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                {req.details}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {selectedClass.looseRequirements.length > 0 ? (
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
                    Requisitos adicionais
                  </h2>

                  <div className="space-y-3">
                    {selectedClass.looseRequirements.map((req) => (
                      <div
                        key={req.id}
                        className={`rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900 ${indentClass(req.level)}`}
                      >
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {req.marker ? `${req.marker} ` : ""}
                          {req.title}
                        </p>
                        {req.details ? (
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            {req.details}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-slate-300">
              Essa classe ainda não possui grupos ou requisitos cadastrados.
            </div>
          )}
        </>
      )}
    </div>
  );
}