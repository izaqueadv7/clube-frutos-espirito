"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  BadgeCheck,
  FolderOpen
} from "lucide-react";

type RequirementItem = {
  id: string;
  text: string;
  marker: string;
  level: number;
  order: number;
};

type SpecialtyItem = {
  id: string;
  name: string;
  slug: string;
  code: string;
  category: string;
  description: string;
  order: number;
  requirements: RequirementItem[];
};

type AreaItem = {
  id: string;
  name: string;
  slug: string;
  order: number;
  specialties: SpecialtyItem[];
};

function indentClass(level: number) {
  if (level === 1) return "ml-8";
  if (level === 2) return "ml-14";
  if (level >= 3) return "ml-20";
  return "";
}

export function SpecialtiesBrowser({ items }: { items: AreaItem[] }) {
  const [searchArea, setSearchArea] = useState("");
  const [searchSpecialty, setSearchSpecialty] = useState("");

  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string | null>(null);

  const selectedArea =
    items.find((item) => item.id === selectedAreaId) ?? null;

  const selectedSpecialty =
    selectedArea?.specialties.find((item) => item.id === selectedSpecialtyId) ?? null;

  const filteredAreas = useMemo(() => {
    const q = searchArea.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.name.toLowerCase().includes(q));
  }, [items, searchArea]);

  const filteredSpecialties = useMemo(() => {
    if (!selectedArea) return [];
    const q = searchSpecialty.trim().toLowerCase();
    if (!q) return selectedArea.specialties;
    return selectedArea.specialties.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [selectedArea, searchSpecialty]);

  function openArea(areaId: string) {
    setSelectedAreaId(areaId);
    setSelectedSpecialtyId(null);
    setSearchSpecialty("");
  }

  function openSpecialty(specialtyId: string) {
    setSelectedSpecialtyId(specialtyId);
  }

  function backToAreas() {
    setSelectedAreaId(null);
    setSelectedSpecialtyId(null);
    setSearchSpecialty("");
  }

  function backToSpecialties() {
    setSelectedSpecialtyId(null);
  }

  return (
    <div className="space-y-4">
      {!selectedArea ? (
        <>
          <div className="rounded-[28px] bg-primary p-5 text-white shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
              Especialidades
            </p>
            <h1 className="mt-1 text-3xl font-extrabold">
              Áreas de conhecimento
            </h1>
            <p className="mt-2 text-sm text-white/85">
              Escolha uma área para visualizar as especialidades e seus requisitos.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
                placeholder="Pesquisar área"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-primary dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredAreas.map((area) => (
              <button
                key={area.id}
                type="button"
                onClick={() => openArea(area.id)}
                className="flex w-full items-center justify-between rounded-[28px] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-primary/30 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Área
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                    {area.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {area.specialties.length} especialidade{area.specialties.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="ml-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </button>
            ))}

            {filteredAreas.length === 0 ? (
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-slate-300">
                Nenhuma área encontrada.
              </div>
            ) : null}
          </div>
        </>
      ) : !selectedSpecialty ? (
        <>
          <div className="rounded-[28px] bg-primary p-5 text-white shadow-lg">
            <button
              type="button"
              onClick={backToAreas}
              className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar para áreas
            </button>

            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
              Área
            </p>
            <h1 className="mt-1 text-3xl font-extrabold">
              {selectedArea.name}
            </h1>
            <p className="mt-2 text-sm text-white/85">
              Escolha uma especialidade para visualizar seus requisitos.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchSpecialty}
                onChange={(e) => setSearchSpecialty(e.target.value)}
                placeholder="Pesquisar especialidade"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-primary dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredSpecialties.map((specialty) => (
              <button
                key={specialty.id}
                type="button"
                onClick={() => openSpecialty(specialty.id)}
                className="flex w-full items-center justify-between rounded-[28px] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-primary/30 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    {specialty.code || "Especialidade"}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                    {specialty.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {specialty.description || specialty.category}
                  </p>
                </div>

                <div className="ml-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </button>
            ))}

            {filteredSpecialties.length === 0 ? (
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-slate-300">
                Nenhuma especialidade encontrada nessa área.
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <>
          <div className="rounded-[28px] bg-primary p-5 text-white shadow-lg">
            <button
              type="button"
              onClick={backToSpecialties}
              className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar para especialidades
            </button>

            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
              {selectedArea.name}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold">
              {selectedSpecialty.name}
            </h1>
            <p className="mt-2 text-sm text-white/85">
              {selectedSpecialty.code
                ? `Código ${selectedSpecialty.code}`
                : "Especialidade"}
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
                <FolderOpen className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Requisitos
                </p>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedSpecialty.name}
                </h2>
              </div>
            </div>

            {selectedSpecialty.requirements.length > 0 ? (
              <div className="space-y-3">
                {selectedSpecialty.requirements.map((req) => (
                  <div
                    key={req.id}
                    className={`rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900 ${indentClass(req.level)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                        <BadgeCheck className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {req.marker ? `${req.marker} ` : ""}
                          {req.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-300">
                Essa especialidade ainda não possui requisitos cadastrados.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}