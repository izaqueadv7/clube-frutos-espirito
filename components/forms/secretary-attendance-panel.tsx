"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";

type EventItem = {
  id: string;
  title: string;
  date: string | Date;
  location: string;
  attendance: {
    pathfinderId: string;
    status: string;
  }[];
};

type PathfinderItem = {
  id: string;
  name: string;
};

export function SecretaryAttendancePanel({
  events,
  pathfinders
}: {
  events: EventItem[];
  pathfinders: PathfinderItem[];
}) {
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");

  const currentEvent = useMemo(() => {
    return events.find((event) => event.id === eventId) ?? null;
  }, [events, eventId]);

  useEffect(() => {
    if (!currentEvent) return;

    const initialSelected: Record<string, boolean> = {};

    currentEvent.attendance.forEach((item) => {
      if (item.status === "PRESENT") {
        initialSelected[item.pathfinderId] = true;
      }
    });

    setSelected(initialSelected);
  }, [currentEvent]);

  const filteredPathfinders = useMemo(() => {
    const q = query.trim().toLowerCase();

    return pathfinders.filter((pathfinder) => {
      if (!q) return true;
      return pathfinder.name.toLowerCase().includes(q);
    });
  }, [pathfinders, query]);

  function togglePathfinder(id: string) {
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  }

  function markAllVisible() {
    const updates: Record<string, boolean> = {};
    filteredPathfinders.forEach((item) => {
      updates[item.id] = true;
    });

    setSelected((prev) => ({
      ...prev,
      ...updates
    }));
  }

  function unmarkAllVisible() {
    const copy = { ...selected };
    filteredPathfinders.forEach((item) => {
      delete copy[item.id];
    });
    setSelected(copy);
  }

  async function handleSave() {
    setLoading(true);
    setMessage("");

    try {
      const presentIds = Object.entries(selected)
        .filter(([, checked]) => checked)
        .map(([id]) => id);

      const response = await fetch("/api/attendance/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          eventId,
          presentIds
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.error || "Erro ao registrar presença.");
        return;
      }

      setMessage("Presença registrada com sucesso.");
    } catch (error) {
      setMessage("Erro ao registrar presença.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="space-y-4 p-5">
      <div>
        <label className="mb-1 block text-sm font-semibold">Evento</label>
        <select
          className="w-full rounded-lg border px-3 py-2"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        >
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title} - {event.location}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Buscar nome</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Digite o nome do desbravador"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={markAllVisible}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Marcar todos
        </button>

        <button
          type="button"
          onClick={unmarkAllVisible}
          className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Desmarcar todos
        </button>
      </div>

      <div className="space-y-2">
        {filteredPathfinders.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum desbravador encontrado.</p>
        ) : (
          filteredPathfinders.map((pathfinder) => (
            <label
              key={pathfinder.id}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <input
                type="checkbox"
                checked={!!selected[pathfinder.id]}
                onChange={() => togglePathfinder(pathfinder.id)}
              />
              <span>{pathfinder.name}</span>
            </label>
          ))
        )}
      </div>

      {message ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
          {message}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="rounded-lg bg-primary px-4 py-2 font-semibold text-white"
      >
        {loading ? "Salvando..." : "Salvar presença"}
      </button>
    </Card>
  );
}