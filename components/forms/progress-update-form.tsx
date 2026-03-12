"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

export function ProgressUpdateForm() {
  const [pathfinderId, setPathfinderId] = useState("");
  const [requirementId, setRequirementId] = useState("");
  const [completed, setCompleted] = useState(true);
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);

        const response = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pathfinderId, requirementId, completed })
        });

        const data = await response.json();
        setLoading(false);

        if (!response.ok) {
          toast(data.error ?? "Erro ao atualizar progresso");
          return;
        }

        toast("Progresso atualizado");
      }}
    >
      <Input placeholder="Pathfinder ID" value={pathfinderId} onChange={(e) => setPathfinderId(e.target.value)} required />
      <Input placeholder="Requirement ID" value={requirementId} onChange={(e) => setRequirementId(e.target.value)} required />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={completed} onChange={(e) => setCompleted(e.target.checked)} />
        Requisito concluido
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Atualizar progresso"}
      </Button>
    </form>
  );
}
