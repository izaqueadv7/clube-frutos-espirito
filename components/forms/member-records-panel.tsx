"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

type PathfinderItem = {
  id: string;
  name: string;
  email: string;
  currentClass: string | null;
  progress: {
    id: string;
    title: string;
    details: string;
    completed: boolean;
  }[];
  specialties: {
    id: string;
    name: string;
    category: string;
    status: string;
  }[];
};

export function MemberRecordsPanel({
  pathfinders
}: {
  pathfinders: PathfinderItem[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return pathfinders.filter((item) => {
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        (item.currentClass ?? "").toLowerCase().includes(q)
      );
    });
  }, [pathfinders, query]);

  async function deleteRecord(type: "progress" | "specialty", id: string) {
    const confirmed = window.confirm("Deseja excluir este registro?");
    if (!confirmed) return;

    const response = await fetch("/api/member-records/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ type, id })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data?.error || "Erro ao excluir registro.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <label className="mb-1 block text-sm font-semibold">Buscar membro</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Nome, email ou classe"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Card>

      {filtered.map((member) => (
        <Card key={member.id} className="p-5 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-primary">{member.name}</h2>
            <p className="text-sm text-slate-600">{member.email}</p>
            <p className="text-sm text-slate-600">
              Classe atual: {member.currentClass ?? "Não definida"}
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Progresso de Classe</h3>
            <div className="space-y-2">
              {member.progress.length === 0 ? (
                <p className="text-sm text-slate-500">Sem registros de progresso.</p>
              ) : (
                member.progress.map((item) => (
                  <div key={item.id} className="rounded-lg border p-3">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-slate-600">{item.details}</p>
                    <p className="text-sm text-slate-600">
                      Concluído: {item.completed ? "Sim" : "Não"}
                    </p>
                    <button
                      type="button"
                      onClick={() => deleteRecord("progress", item.id)}
                      className="mt-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                    >
                      Excluir registro
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Especialidades</h3>
            <div className="space-y-2">
              {member.specialties.length === 0 ? (
                <p className="text-sm text-slate-500">Sem especialidades registradas.</p>
              ) : (
                member.specialties.map((item) => (
                  <div key={item.id} className="rounded-lg border p-3">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-slate-600">{item.category}</p>
                    <p className="text-sm text-slate-600">Status: {item.status}</p>
                    <button
                      type="button"
                      onClick={() => deleteRecord("specialty", item.id)}
                      className="mt-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                    >
                      Excluir registro
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}