"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";

type ClassItem = {
  id: string;
  name: string;
  description: string;
  order: number;
  requirements?: {
    id: string;
    title: string;
    details: string;
  }[];
};

type GroupState = {
  title: string;
  requirements: string[];
};

export function ClassRegisterForm({ items }: { items?: ClassItem[] }) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("0");
  const [groups, setGroups] = useState<GroupState[]>([
    { title: "", requirements: [""] }
  ]);
  const [message, setMessage] = useState("");

  function updateGroupTitle(index: number, value: string) {
    const copy = [...groups];
    copy[index].title = value;
    setGroups(copy);
  }

  function updateRequirement(groupIndex: number, reqIndex: number, value: string) {
    const copy = [...groups];
    copy[groupIndex].requirements[reqIndex] = value;
    setGroups(copy);
  }

  function addGroup() {
    setGroups((prev) => [...prev, { title: "", requirements: [""] }]);
  }

  function removeGroup(index: number) {
    if (groups.length === 1) return;
    setGroups((prev) => prev.filter((_, i) => i !== index));
  }

  function addRequirement(groupIndex: number) {
    const copy = [...groups];
    copy[groupIndex].requirements.push("");
    setGroups(copy);
  }

  function removeRequirement(groupIndex: number, reqIndex: number) {
    const copy = [...groups];
    if (copy[groupIndex].requirements.length === 1) return;
    copy[groupIndex].requirements = copy[groupIndex].requirements.filter((_, i) => i !== reqIndex);
    setGroups(copy);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/classes/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: title,
        description,
        order: Number(order),
        groups
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data?.error || "Erro ao cadastrar classe.");
      return;
    }

    setTitle("");
    setDescription("");
    setOrder("0");
    setGroups([{ title: "", requirements: [""] }]);
    setMessage("Classe cadastrada com sucesso.");
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
            <label className="mb-1 block text-sm font-semibold">Descrição</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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

          <div className="space-y-4">
            <p className="text-sm font-semibold">Grupos e requisitos</p>

            {groups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-3 rounded-lg border p-4">
                <input
                  className="w-full rounded-lg border px-3 py-2"
                  value={group.title}
                  onChange={(e) => updateGroupTitle(groupIndex, e.target.value)}
                  placeholder={`Nome do grupo ${groupIndex + 1}`}
                />

                {group.requirements.map((req, reqIndex) => (
                  <div key={reqIndex} className="space-y-2 rounded-lg border p-3">
                    <textarea
                      className="w-full rounded-lg border px-3 py-2"
                      value={req}
                      onChange={(e) => updateRequirement(groupIndex, reqIndex, e.target.value)}
                      placeholder={`Requisito ${reqIndex + 1}`}
                      rows={5}
                    />

                    <button
                      type="button"
                      onClick={() => removeRequirement(groupIndex, reqIndex)}
                      className="rounded-lg bg-red-600 px-3 py-2 text-white"
                    >
                      Remover requisito
                    </button>
                  </div>
                ))}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => addRequirement(groupIndex)}
                    className="rounded-lg bg-slate-700 px-4 py-2 text-white"
                  >
                    Adicionar requisito
                  </button>

                  <button
                    type="button"
                    onClick={() => removeGroup(groupIndex)}
                    className="rounded-lg bg-red-700 px-4 py-2 text-white"
                  >
                    Remover grupo
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addGroup}
              className="rounded-lg bg-primary px-4 py-2 font-semibold text-white"
            >
              Adicionar mais um grupo
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
          {items.map((item) => (
            <Card key={item.id} className="p-5">
              <p className="font-bold text-primary">{item.name}</p>
              <p className="text-sm text-slate-600">{item.description}</p>
              <p className="text-sm text-slate-600">Ordem: {item.order}</p>

              <div className="mt-3 space-y-3">
                {item.requirements?.length ? (
                  item.requirements.map((group) => {
                    const parsedItems = group.details
                      ? group.details.split("||ITEM||").map((req) => req.trim()).filter(Boolean)
                      : [];

                    return (
                      <div key={group.id} className="rounded-lg border p-3">
                        <p className="font-semibold">{group.title}</p>

                        <div className="mt-2 space-y-2">
                          {parsedItems.map((req, index) => (
                            <div key={index} className="whitespace-pre-line rounded border p-2 text-sm">
                              {req}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500">Sem grupos cadastrados.</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}