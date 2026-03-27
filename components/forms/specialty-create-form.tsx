"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

export function SpecialtyCreateForm() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);

        const response = await fetch("/api/specialties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, category, description, requirements })
        });

        const data = await response.json();
        setLoading(false);

        if (!response.ok) {
          toast(data.error ?? "Erro ao criar especialidade");
          return;
        }

        toast("Especialidade criada");
        setName("");
        setCategory("");
        setDescription("");
        setRequirements("");
      }}
    >
      <Input placeholder="Nome da especialidade" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input placeholder="Categoria" value={category} onChange={(e) => setCategory(e.target.value)} required />
      <Input placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} required />
      <textarea
        className="input min-h-20"
        placeholder="Requisitos"
        value={requirements}
        onChange={(e) => setRequirements(e.target.value)}
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Criar especialidade"}
      </Button>
    </form>
  );
}
