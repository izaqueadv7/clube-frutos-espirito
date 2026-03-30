"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";

type ParentItem = {
  id: string;
  name: string;
  email: string;
};

type PathfinderItem = {
  id: string;
  name: string;
  email: string;
};

export function ParentLinkForm({
  parents,
  pathfinders
}: {
  parents: ParentItem[];
  pathfinders: PathfinderItem[];
}) {
  const router = useRouter();

  const [parentUserId, setParentUserId] = useState("");
  const [pathfinderId, setPathfinderId] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/parents/link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        parentUserId,
        pathfinderId,
        phone
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data?.error || "Erro ao vincular responsável.");
      return;
    }

    setParentUserId("");
    setPathfinderId("");
    setPhone("");
    setMessage("Responsável vinculado com sucesso.");
    router.refresh();
  }

  return (
    <Card className="p-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold">Responsável</label>
          <select
            className="w-full rounded-lg border px-3 py-2"
            value={parentUserId}
            onChange={(e) => setParentUserId(e.target.value)}
          >
            <option value="">Selecione</option>
            {parents.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} - {item.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Desbravador</label>
          <select
            className="w-full rounded-lg border px-3 py-2"
            value={pathfinderId}
            onChange={(e) => setPathfinderId(e.target.value)}
          >
            <option value="">Selecione</option>
            {pathfinders.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} - {item.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Telefone do responsável</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Opcional"
          />
        </div>

        {message ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 font-semibold text-white"
        >
          Vincular responsável
        </button>
      </form>
    </Card>
  );
}