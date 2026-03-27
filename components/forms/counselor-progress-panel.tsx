"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";

type PathfinderItem = {
  id: string;
  name: string;
  email: string;
  currentClass: {
    id: string;
    name: string;
    requirements: {
      id: string;
      title: string;
      details: string;
    }[];
  } | null;
  progress: {
    requirementId: string;
    completed: boolean;
  }[];
};

export function CounselorProgressPanel({
  pathfinders
}: {
  pathfinders: PathfinderItem[];
}) {
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return pathfinders.filter((item) => {
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.currentClass?.name.toLowerCase().includes(q)
      );
    });
  }, [pathfinders, query]);

  async function toggleProgress(
    pathfinderId: string,
    requirementId: string,
    completed: boolean
  ) {
    setSavingId(`${pathfinderId}-${requirementId}`);

    try {
      const response = await fetch("/api/progress/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pathfinderId,
          requirementId,
          completed
        })
      });

      if (!response.ok) {
        alert("Não foi possível atualizar o progresso.");
        return;
      }

      window.location.reload();
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <label className="mb-2 block text-sm font-semibold">Buscar desbravador</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Nome, email ou classe"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-5">
          <p className="text-sm text-slate-600 dark:text-slate-300">Nenhum desbravador encontrado.</p>
        </Card>
      ) : (
        filtered.map((pathfinder) => (
          <Card key={pathfinder.id} className="p-5">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-primary">{pathfinder.name}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">{pathfinder.email}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Classe atual: {pathfinder.currentClass?.name ?? "Não definida"}
              </p>
            </div>

            {!pathfinder.currentClass ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Este desbravador ainda não possui classe definida.
              </p>
            ) : (
              <div className="space-y-3">
                {pathfinder.currentClass.requirements.map((req) => {
                  const progressItem = pathfinder.progress.find(
                    (item) => item.requirementId === req.id
                  );

                  const checked = !!progressItem?.completed;
                  const rowId = `${pathfinder.id}-${req.id}`;

                  return (
                    <div
                      key={req.id}
                      className="rounded-xl border border-red-100 p-4"
                    >
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={savingId === rowId}
                          onChange={(e) =>
                            toggleProgress(
                              pathfinder.id,
                              req.id,
                              e.target.checked
                            )
                          }
                        />
                        <div>
                          <p className="font-semibold">{req.title}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">{req.details}</p>
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
}