"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";

type SpecialtyItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  requirements: string;
};

export function SpecialtyRegisterForm({ items }: { items?: SpecialtyItem[] }) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("");
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [message, setMessage] = useState("");

  function updateRequirement(index: number, value: string) {
    const copy = [...requirements];
    copy[index] = value;
    setRequirements(copy);
  }

  function addRequirement() {
    setRequirements((prev) => [...prev, ""]);
  }

  function removeRequirement(index: number) {
    if (requirements.length === 1) return;
    setRequirements((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/specialties", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        code,
        category,
        requirements
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data?.error || "Erro ao cadastrar especialidade.");
      return;
    }

    setTitle("");
    setCode("");
    setCategory("");
    setRequirements([""]);
    setMessage("Especialidade cadastrada com sucesso.");
    router.refresh();
  }

  async function handleDelete(id: string) {
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold">Título</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Código</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={code}
              onChange={(e) => setCode(e.target.value)}
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

          <div className="space-y-3">
            <p className="text-sm font-semibold">Requisitos</p>

            {requirements.map((item, index) => (
              <div key={index} className="space-y-2 rounded-lg border p-3">
                <textarea
                  className="w-full rounded-lg border px-3 py-2"
                  value={item}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  placeholder={`Requisito ${index + 1}`}
                  rows={5}
                />

                <button
                  type="button"
                  onClick={() => removeRequirement(index)}
                  className="rounded-lg bg-red-600 px-3 py-2 text-white"
                >
                  Remover requisito
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addRequirement}
              className="rounded-lg bg-slate-700 px-4 py-2 font-semibold text-white"
            >
              Adicionar mais um requisito
            </button>
          </div>

          {message ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-slate-700">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 font-semibold text-white"
          >
            Salvar
          </button>
        </form>
      </Card>

      {items?.length ? (
        <div className="space-y-4">
          {items.map((item) => {
            const parsedRequirements = item.requirements
              ? item.requirements.split("||REQ||").map((req) => req.trim()).filter(Boolean)
              : [];

            return (
              <Card key={item.id} className="p-5">
                <p className="font-bold text-primary">{item.name}</p>
                <p className="text-sm text-slate-600">Código: {item.description}</p>
                <p className="text-sm text-slate-600">Categoria: {item.category}</p>

                <div className="mt-3 space-y-2">
                  {parsedRequirements.length ? (
                    parsedRequirements.map((req, index) => (
                      <div key={index} className="whitespace-pre-line rounded-lg border p-2 text-sm">
                        {req}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Sem requisitos cadastrados.</p>
                  )}
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg bg-red-600 px-4 py-2 text-white"
                  >
                    Excluir especialidade
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}