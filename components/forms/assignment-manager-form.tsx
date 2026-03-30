"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Search, ChevronDown, ChevronUp, CheckCircle2, Trash2, PlusCircle } from "lucide-react";

type PathfinderItem = {
  id: string;
  name: string;
  email: string;
  image?: string;
  currentClassId: string;
  specialtyIds: string[];
  completedRequirementIds: string[];
};

type ClassRequirementItem = {
  id: string;
  title: string;
  details: string;
  marker?: string;
  level?: number;
  order: number;
};

type ClassGroupItem = {
  id: string;
  title: string;
  roman: string;
  order: number;
  requirements: ClassRequirementItem[];
};

type ClassItem = {
  id: string;
  name: string;
  category?: string;
  order: number;
  groups: ClassGroupItem[];
  requirements?: ClassRequirementItem[];
};

type SpecialtyRequirementItem = {
  id: string;
  text: string;
  marker?: string;
  level?: number;
  order: number;
};

type SpecialtyItem = {
  id: string;
  name: string;
  category: string;
  code?: string;
  description?: string;
  area?: {
    id: string;
    name: string;
  } | null;
  items?: SpecialtyRequirementItem[];
};

export function AssignmentManagerForm({
  pathfinders,
  classes,
  specialties
}: {
  pathfinders: PathfinderItem[];
  classes: ClassItem[];
  specialties: SpecialtyItem[];
}) {
  const router = useRouter();

  const [tab, setTab] = useState<"class" | "specialty">("class");
  const [pathfinderId, setPathfinderId] = useState(pathfinders[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [specialtyQuery, setSpecialtyQuery] = useState("");
  const [classId, setClassId] = useState(pathfinders[0]?.currentClassId ?? "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [completedAt, setCompletedAt] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const filteredPathfinders = useMemo(() => {
    const q = query.trim().toLowerCase();

    return pathfinders.filter((item) => {
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q)
      );
    });
  }, [pathfinders, query]);

  const selectedPathfinder =
    pathfinders.find((item) => item.id === pathfinderId) ?? null;

  const selectedClass =
    classes.find((item) => item.id === classId) ?? null;

  const filteredSpecialties = useMemo(() => {
    const q = specialtyQuery.trim().toLowerCase();

    return specialties.filter((item) => {
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.code ?? "").toLowerCase().includes(q) ||
        (item.area?.name ?? "").toLowerCase().includes(q)
      );
    });
  }, [specialties, specialtyQuery]);

  function handleSelectPathfinder(id: string) {
    setPathfinderId(id);

    const target = pathfinders.find((item) => item.id === id);
    setClassId(target?.currentClassId ?? "");
    setMessage("");
  }

  function toggleGroup(groupId: string) {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  }

  async function assignClass() {
    if (!pathfinderId || !classId) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/assignments/class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "assign",
          pathfinderId,
          classId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.error || "Erro ao vincular classe.");
        return;
      }

      setMessage("Classe vinculada com sucesso.");
      router.refresh();
    } catch {
      setMessage("Erro ao vincular classe.");
    } finally {
      setLoading(false);
    }
  }

  async function completeAllClassRequirements() {
    if (!pathfinderId || !classId) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/assignments/class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "completeAll",
          pathfinderId,
          classId,
          completedAt
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.error || "Erro ao concluir classe.");
        return;
      }

      setMessage("Todos os requisitos da classe foram marcados.");
      router.refresh();
    } catch {
      setMessage("Erro ao concluir classe.");
    } finally {
      setLoading(false);
    }
  }

  async function removeClass() {
    if (!pathfinderId || !classId) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/assignments/class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "removeClass",
          pathfinderId,
          classId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.error || "Erro ao remover classe.");
        return;
      }

      setMessage("Classe removida do desbravador.");
      setClassId("");
      router.refresh();
    } catch {
      setMessage("Erro ao remover classe.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleRequirement(requirementId: string) {
    if (!pathfinderId || !classId) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/assignments/class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "toggleRequirement",
          pathfinderId,
          classId,
          requirementId,
          completedAt
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.error || "Erro ao atualizar requisito.");
        return;
      }

      router.refresh();
    } catch {
      setMessage("Erro ao atualizar requisito.");
    } finally {
      setLoading(false);
    }
  }

  async function assignSpecialty(specialtyId: string) {
    if (!pathfinderId) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/assignments/specialty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "assign",
          pathfinderId,
          specialtyId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.error || "Erro ao adicionar especialidade.");
        return;
      }

      setMessage("Especialidade vinculada com sucesso.");
      router.refresh();
    } catch {
      setMessage("Erro ao adicionar especialidade.");
    } finally {
      setLoading(false);
    }
  }

  async function completeSpecialty(specialtyId: string) {
    if (!pathfinderId) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/assignments/specialty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "complete",
          pathfinderId,
          specialtyId,
          completedAt
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.error || "Erro ao concluir especialidade.");
        return;
      }

      setMessage("Especialidade concluída com sucesso.");
      router.refresh();
    } catch {
      setMessage("Erro ao concluir especialidade.");
    } finally {
      setLoading(false);
    }
  }

  async function removeSpecialty(specialtyId: string) {
    if (!pathfinderId) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/assignments/specialty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "remove",
          pathfinderId,
          specialtyId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.error || "Erro ao remover especialidade.");
        return;
      }

      setMessage("Especialidade removida com sucesso.");
      router.refresh();
    } catch {
      setMessage("Erro ao remover especialidade.");
    } finally {
      setLoading(false);
    }
  }

  function isRequirementCompleted(requirementId: string) {
    return selectedPathfinder?.completedRequirementIds.includes(requirementId) ?? false;
  }

  function hasSpecialty(specialtyId: string) {
    return selectedPathfinder?.specialtyIds.includes(specialtyId) ?? false;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
      <Card className="p-4">
        <p className="mb-2 text-sm font-semibold">Selecionar desbravador</p>

        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-xl border px-3 py-2 pl-10"
            placeholder="Buscar nome ou email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
          {filteredPathfinders.map((item) => {
            const active = item.id === pathfinderId;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectPathfinder(item.id)}
                className={[
                  "w-full rounded-2xl border p-3 text-left transition",
                  active
                    ? "border-primary bg-[rgba(46,125,50,0.08)]"
                    : "border-slate-200 hover:bg-slate-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                ].join(" ")}
              >
                <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{item.email}</p>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTab("class")}
              className={[
                "rounded-xl px-4 py-2 font-semibold transition",
                tab === "class"
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-200 dark:hover:bg-zinc-700"
              ].join(" ")}
            >
              Classes
            </button>

            <button
              type="button"
              onClick={() => setTab("specialty")}
              className={[
                "rounded-xl px-4 py-2 font-semibold transition",
                tab === "specialty"
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-200 dark:hover:bg-zinc-700"
              ].join(" ")}
            >
              Especialidades
            </button>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-semibold">Data de conclusão</label>
            <input
              type="date"
              className="w-full rounded-xl border px-3 py-2"
              value={completedAt}
              onChange={(e) => setCompletedAt(e.target.value)}
            />
          </div>

          {message ? (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-slate-700 dark:bg-zinc-900 dark:text-slate-300">
              {message}
            </p>
          ) : null}
        </Card>

        {tab === "class" ? (
          <Card className="p-5">
            <h2 className="section-title">Classe do desbravador</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Selecione uma classe, carregue os requisitos e marque o que já foi cumprido.
            </p>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-semibold">Classe</label>
              <select
                className="w-full rounded-xl border px-3 py-2"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
              >
                <option value="">Selecione</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={assignClass}
                disabled={loading || !pathfinderId || !classId}
                className="rounded-xl bg-primary px-4 py-2 font-semibold text-white disabled:opacity-60"
              >
                Vincular classe
              </button>

              <button
                type="button"
                onClick={completeAllClassRequirements}
                disabled={loading || !pathfinderId || !classId}
                className="rounded-xl bg-slate-100 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-60 dark:bg-zinc-800 dark:text-slate-200 dark:hover:bg-zinc-700"
              >
                Marcar todos
              </button>

              <button
                type="button"
                onClick={removeClass}
                disabled={loading || !pathfinderId || !classId}
                className="rounded-xl bg-red-100 px-4 py-2 font-semibold text-red-700 hover:bg-red-200 disabled:opacity-60 dark:bg-red-950 dark:text-red-300"
              >
                Excluir classe
              </button>
            </div>

            {selectedClass ? (
              <div className="mt-6 space-y-4">
                {selectedClass.groups?.map((group) => {
                  const isOpen = !!openGroups[group.id];

                  return (
                    <div
                      key={group.id}
                      className="rounded-2xl border border-slate-200 p-4 dark:border-zinc-800"
                    >
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.id)}
                        className="flex w-full items-center justify-between text-left"
                      >
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            Grupo {group.roman}
                          </p>
                          <h3 className="font-bold text-slate-900 dark:text-white">
                            {group.title}
                          </h3>
                        </div>

                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-slate-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-500" />
                        )}
                      </button>

                      {isOpen ? (
                        <div className="mt-4 space-y-3">
                          {group.requirements.map((req) => {
                            const completed = isRequirementCompleted(req.id);

                            return (
                              <div
                                key={req.id}
                                className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-900"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
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

                                  <button
                                    type="button"
                                    onClick={() => toggleRequirement(req.id)}
                                    disabled={loading}
                                    className={[
                                      "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition disabled:opacity-60",
                                      completed
                                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                                        : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-zinc-800 dark:text-slate-200 dark:hover:bg-zinc-700"
                                    ].join(" ")}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                    {completed ? "Concluído" : "Marcar"}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </Card>
        ) : (
          <Card className="p-5">
            <h2 className="section-title">Especialidades do desbravador</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Pesquise uma especialidade, vincule ao desbravador, conclua ou remova.
            </p>

            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-xl border px-3 py-2 pl-10"
                placeholder="Buscar especialidade"
                value={specialtyQuery}
                onChange={(e) => setSpecialtyQuery(e.target.value)}
              />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {filteredSpecialties.map((item) => {
                const linked = hasSpecialty(item.id);

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 p-4 dark:border-zinc-800"
                  >
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {item.area?.name || item.category}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {!linked ? (
                        <button
                          type="button"
                          onClick={() => assignSpecialty(item.id)}
                          disabled={loading}
                          className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          <PlusCircle className="h-4 w-4" />
                          Vincular
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => completeSpecialty(item.id)}
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-xl bg-green-100 px-3 py-2 text-sm font-semibold text-green-700 dark:bg-green-950 dark:text-green-300 disabled:opacity-60"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Concluir
                          </button>

                          <button
                            type="button"
                            onClick={() => removeSpecialty(item.id)}
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 dark:bg-red-950 dark:text-red-300 disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}