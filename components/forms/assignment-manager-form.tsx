"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

type PathfinderItem = {
  id: string;
  name: string;
  email: string;
  currentClassId: string;
  specialtyIds: string[];
};

type ClassItem = {
  id: string;
  name: string;
};

type SpecialtyItem = {
  id: string;
  name: string;
  category: string;
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

  const [pathfinderId, setPathfinderId] = useState(pathfinders[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [messageClass, setMessageClass] = useState("");
  const [messageSpecialty, setMessageSpecialty] = useState("");
  const [loadingClass, setLoadingClass] = useState(false);
  const [loadingSpecialty, setLoadingSpecialty] = useState(false);

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
    pathfinders.find((item) => item.id === pathfinderId) ?? pathfinders[0];

  const [classId, setClassId] = useState(selectedPathfinder?.currentClassId ?? "");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    selectedPathfinder?.specialtyIds ?? []
  );

  function handleSelectPathfinder(id: string) {
    setPathfinderId(id);

    const target = pathfinders.find((item) => item.id === id);
    setClassId(target?.currentClassId ?? "");
    setSelectedSpecialties(target?.specialtyIds ?? []);
    setMessageClass("");
    setMessageSpecialty("");
  }

  function toggleSpecialty(id: string) {
    setSelectedSpecialties((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function saveClass() {
    setLoadingClass(true);
    setMessageClass("");

    try {
      const response = await fetch("/api/assignments/class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pathfinderId,
          classId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessageClass(data?.error || "Erro ao vincular classe.");
        return;
      }

      setMessageClass("Classe vinculada com sucesso.");
      router.refresh();
    } catch {
      setMessageClass("Erro ao vincular classe.");
    } finally {
      setLoadingClass(false);
    }
  }

  async function saveSpecialties() {
    setLoadingSpecialty(true);
    setMessageSpecialty("");

    try {
      const response = await fetch("/api/assignments/specialties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pathfinderId,
          specialtyIds: selectedSpecialties
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessageSpecialty(data?.error || "Erro ao vincular especialidades.");
        return;
      }

      setMessageSpecialty("Especialidades vinculadas com sucesso.");
      router.refresh();
    } catch {
      setMessageSpecialty("Erro ao vincular especialidades.");
    } finally {
      setLoadingSpecialty(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
      <Card className="p-4">
        <p className="mb-2 text-sm font-semibold">Selecionar desbravador</p>

        <input
          className="mb-3 w-full rounded-lg border px-3 py-2"
          placeholder="Buscar nome ou email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="max-h-[520px] space-y-2 overflow-y-auto">
          {filteredPathfinders.map((item) => {
            const active = item.id === pathfinderId;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectPathfinder(item.id)}
                className={[
                  "w-full rounded-xl border p-3 text-left transition",
                  active
                    ? "border-primary bg-[rgba(46,125,50,0.08)]"
                    : "border-slate-200 hover:bg-slate-50"
                ].join(" ")}
              >
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-slate-600">{item.email}</p>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="p-5">
          <h2 className="section-title">Classe do desbravador</h2>
          <p className="mt-1 text-sm text-slate-600">
            Selecione uma classe e clique em salvar.
          </p>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-semibold">Classe</label>
            <select
              className="w-full rounded-lg border px-3 py-2"
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

          {messageClass ? (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-slate-700">
              {messageClass}
            </p>
          ) : null}

          <div className="mt-4">
            <button
              type="button"
              onClick={saveClass}
              disabled={loadingClass || !pathfinderId || !classId}
              className="rounded-lg bg-primary px-4 py-2 font-semibold text-white"
            >
              {loadingClass ? "Salvando..." : "Salvar classe"}
            </button>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="section-title">Especialidades do desbravador</h2>
          <p className="mt-1 text-sm text-slate-600">
            Marque as especialidades desejadas e clique em salvar.
          </p>

          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {specialties.map((item) => {
              const checked = selectedSpecialties.includes(item.id);

              return (
                <label
                  key={item.id}
                  className={[
                    "flex items-start gap-3 rounded-xl border p-3 transition",
                    checked
                      ? "border-primary bg-[rgba(46,125,50,0.08)]"
                      : "border-slate-200 hover:bg-slate-50"
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSpecialty(item.id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-slate-600">{item.category}</p>
                  </div>
                </label>
              );
            })}
          </div>

          {messageSpecialty ? (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-slate-700">
              {messageSpecialty}
            </p>
          ) : null}

          <div className="mt-4">
            <button
              type="button"
              onClick={saveSpecialties}
              disabled={loadingSpecialty || !pathfinderId}
              className="rounded-lg bg-primary px-4 py-2 font-semibold text-white"
            >
              {loadingSpecialty ? "Salvando..." : "Salvar especialidades"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}