"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

export function AttendanceForm() {
  const [eventId, setEventId] = useState("");
  const [pathfinderId, setPathfinderId] = useState("");
  const [status, setStatus] = useState("PRESENT");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);

        const response = await fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, pathfinderId, status, note })
        });

        const data = await response.json();
        setLoading(false);

        if (!response.ok) {
          toast(data.error ?? "Erro ao registrar presenca");
          return;
        }

        toast("Presenca registrada");
      }}
    >
      <Input placeholder="Event ID" value={eventId} onChange={(e) => setEventId(e.target.value)} required />
      <Input placeholder="Pathfinder ID" value={pathfinderId} onChange={(e) => setPathfinderId(e.target.value)} required />
      <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="PRESENT">Presente</option>
        <option value="ABSENT">Ausente</option>
        <option value="LATE">Atrasado</option>
        <option value="EXCUSED">Justificado</option>
      </select>
      <Input placeholder="Observacao" value={note} onChange={(e) => setNote(e.target.value)} />
      <Button type="submit" disabled={loading}>
        {loading ? "Registrando..." : "Registrar presenca"}
      </Button>
    </form>
  );
}
