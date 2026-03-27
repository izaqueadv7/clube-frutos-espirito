"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

export function SpecialtyStatusForm() {
  const [assignmentId, setAssignmentId] = useState("");
  const [status, setStatus] = useState("IN_PROGRESS");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);

        const response = await fetch("/api/specialties", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignmentId, status })
        });

        const data = await response.json();
        setLoading(false);

        if (!response.ok) {
          toast(data.error ?? "Erro ao atualizar status");
          return;
        }

        toast("Status da especialidade atualizado");
        setAssignmentId("");
      }}
    >
      <Input
        placeholder="ID da atribuição (Especialidade do Desbravador)"
        value={assignmentId}
        onChange={(e) => setAssignmentId(e.target.value)}
        required
      />
      <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="PENDING">Pendente</option>
        <option value="IN_PROGRESS">Em andamento</option>
        <option value="COMPLETED">Concluida</option>
      </select>
      <Button type="submit" disabled={loading}>
        {loading ? "Atualizando..." : "Atualizar status"}
      </Button>
    </form>
  );
}
