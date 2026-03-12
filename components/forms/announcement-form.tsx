"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

export function AnnouncementForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("ALL");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);

        const response = await fetch("/api/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, audience })
        });

        const data = await response.json();
        setLoading(false);

        if (!response.ok) {
          toast(data.error ?? "Erro ao publicar aviso");
          return;
        }

        toast("Aviso publicado");
        setTitle("");
        setContent("");
      }}
    >
      <div>
        <label className="mb-1 block text-sm font-semibold">Titulo</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">Conteudo</label>
        <textarea
          className="input min-h-24"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">Publico</label>
        <select className="input" value={audience} onChange={(e) => setAudience(e.target.value)}>
          <option value="ALL">Todos</option>
          <option value="PATHFINDER">Pathfinders</option>
          <option value="PARENT">Pais</option>
        </select>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Publicando..." : "Publicar aviso"}
      </Button>
    </form>
  );
}
