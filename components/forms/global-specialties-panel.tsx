"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";

type SpecialtyItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  requirements: string;
};

export function GlobalSpecialtiesPanel({ items }: { items: SpecialtyItem[] }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [message, setMessage] = useState("");

  async function createItem(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/specialties", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        category,
        description,
        requirements
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data?.error || "Erro ao criar especialidade.");
      return;
    }

    setName("");
    setCategory("");
    setDescription("");
    setRequirements("");
    setMessage("Especialidade criada com sucesso.");
    router.refresh();
  }

  async function updateItem(id: string, payload: any) {
    const response = await fetch(`/api/specialties/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data?.error || "Erro ao atualizar especialidade.");
      return;
    }

    router.refresh();
  }

  async function deleteItem(id: string) {
    const confirmed = window.confirm("Deseja excluir esta especialidade?");
    if (!confirmed) return;

    const response = await fetch(`/api/specialties/${id}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data?.error || "Erro ao excluir especialidade.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <form onSubmit={createItem} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold">Nome</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Categoria</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold">Código</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold">Requisitos</label>
            <textarea
              className="w-full rounded-lg border px-3 py-2"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
            />
          </div>

          {message ? (
            <p className="md:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-slate-700">
              {message}
            </p>
          ) : null}

          <div className="md:col-span-2">
            <button className="rounded-lg bg-primary px-4 py-2 font-semibold text-white">
              Cadastrar especialidade
            </button>
          </div>
        </form>
      </Card>

      <div className="grid gap-4">
        {items.map((item) => (
          <EditableSpecialtyCard
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

function EditableSpecialtyCard({
  item,
  onSave,
  onDelete
}: {
  item: SpecialtyItem;
  onSave: (payload: any) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [description, setDescription] = useState(item.description);
  const [requirements, setRequirements] = useState(item.requirements);

  return (
    <Card className="p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold">Nome</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Categoria</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-semibold">Código</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-semibold">Requisitos</label>
          <textarea
            className="w-full rounded-lg border px-3 py-2"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="button"
            onClick={() =>
              onSave({
                name,
                category,
                description,
                requirements
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