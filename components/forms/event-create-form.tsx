"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

export function EventCreateForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);

        const response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, date: new Date(date).toISOString(), location })
        });
        const data = await response.json();

        setLoading(false);

        if (!response.ok) {
          toast(data.error ?? "Erro ao criar evento");
          return;
        }

        toast("Evento criado com sucesso");
        setTitle("");
        setDescription("");
        setDate("");
        setLocation("");
      }}
    >
      <div>
        <label className="mb-1 block text-sm font-semibold">Titulo</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">Local</label>
        <Input value={location} onChange={(e) => setLocation(e.target.value)} required />
      </div>
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-semibold">Descricao</label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-semibold">Data e hora</label>
        <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      <Button type="submit" className="md:col-span-2" disabled={loading}>
        {loading ? "Criando..." : "Criar evento"}
      </Button>
    </form>
  );
}
