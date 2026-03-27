"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";

type ClassItem = {
  id: string;
  name: string;
  originalName: string;
  description: string;
  order: number;
  requirementsCount: number;
};

export function GlobalClassesPanel({ items }: { items: ClassItem[] }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("0");
  const [message, setMessage] = useState("");

  async function createItem(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/classes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        description,
        order: Number(order)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data?.error || "Erro ao criar classe.");
      return;
    }

    setName("");
    setDescription("");
    setOrder("0");
    setMessage("Classe criada com sucesso.");
    router.refresh();
  }

  async function updateItem(id: string, payload: any) {
    const response = await fetch(`/api/classes/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data?.error || "Erro ao atualizar classe.");
      return;
    }

    router.refresh();
  }

  async function deleteItem(id: string) {
    const confirmed = window.confirm("Deseja excluir esta classe?");
    if (!confirmed) return;

    const response = await fetch(`/api/classes/${id}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data?.error || "Erro ao excluir classe.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <form onSubmit={createItem} className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-semibold">Nome</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Ordem</label>
            <input
              type="number"
              className="w-full rounded-lg border px-3 py-2"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            />
          </div>

          <div className="md:col-span-3">
            <label className="mb-1 block text-sm font-semibold">Descrição</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {message ? (
            <p className="md:col-span-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-slate-700">
              {message}
            </p>
          ) : null}

          <div className="md:col-span-3">
            <button className="rounded-lg bg-primary px-4 py-2 font-semibold text-white">
              Cadastrar classe
            </button>
          </div>
        </form>
      </Card>

      <div className="grid gap-4">
        {items.map((item) => (
          <EditableClassCard
            key={item.id}
            item={item}
            onSave={(payload) => updateItem(item.id, payload)}
            onDelete={() => deleteItem(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

function EditableClassCard({
  item,
  onSave,
  onDelete
}: {
  item: ClassItem;
  onSave: (payload: any) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(item.originalName);
  const [description, setDescription] = useState(item.description);
  const [order, setOrder] = useState(String(item.order));

  return (
    <Card className="p-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-semibold">Nome</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Ordem</label>
          <input
            type="number"
            className="w-full rounded-lg border px-3 py-2"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          />
        </div>

        <div className="flex items-end text-sm text-slate-600">
          Requisitos: {item.requirementsCount}
        </div>

        <div className="md:col-span-3">
          <label className="mb-1 block text-sm font-semibold">Descrição</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="md:col-span-3">
          <button
            type="button"
            onClick={() =>
              onSave({
                name,
                description,
                order: Number(order)
              })
            }
            className="rounded-lg bg-primary px-4 py-2 font-semibold text-white"
          >
            Salvar
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="ml-3 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white"
          >
            Excluir
          </button>
        </div>
      </div>
    </Card>
  );
}