"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";

type EventItem = {
  id: string;
  title: string;
  description: string;
  date: string | Date;
  location: string;
};

export function SecretaryEventsPanel({ events }: { events: EventItem[] }) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function createEvent(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          description,
          location,
          date
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.error || "Erro ao criar evento.");
        return;
      }

      setTitle("");
      setDescription("");
      setLocation("");
      setDate("");
      setMessage("Evento criado com sucesso.");
      router.refresh();
    } catch (error) {
      setMessage("Erro ao criar evento.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvent(id: string) {
    const confirmed = window.confirm("Deseja excluir este evento?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data?.error || "Erro ao excluir evento.");
        return;
      }

      router.refresh();
    } catch (error) {
      alert("Erro ao excluir evento.");
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <form onSubmit={createEvent} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold">Título</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Local</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold">Descrição</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold">Data e hora</label>
            <input
              type="datetime-local"
              className="w-full rounded-lg border px-3 py-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {message ? (
            <p className="md:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
              {message}
            </p>
          ) : null}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-4 py-2 font-semibold text-white"
            >
              {loading ? "Salvando..." : "Criar evento"}
            </button>
          </div>
        </form>
      </Card>

      <div className="grid gap-4">
        {events.map((item) => (
          <EditableEventCard
            key={item.id}
            item={item}
            onDelete={() => deleteEvent(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

function EditableEventCard({
  item,
  onDelete
}: {
  item: EventItem;
  onDelete: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description || "");
  const [location, setLocation] = useState(item.location);
  const [date, setDate] = useState(formatForInput(item.date));
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/events/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          description,
          location,
          date
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.error || "Erro ao atualizar evento.");
        return;
      }

      setMessage("Evento atualizado com sucesso.");
      router.refresh();
    } catch (error) {
      setMessage("Erro ao atualizar evento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold">Título</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Local</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-semibold">Descrição</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-semibold">Data e hora</label>
          <input
            type="datetime-local"
            className="w-full rounded-lg border px-3 py-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {message ? (
          <p className="md:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
            {message}
          </p>
        ) : null}

        <div className="md:col-span-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 font-semibold text-white"
          >
            {loading ? "Salvando..." : "Salvar alterações"}
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="ml-3 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white"
          >
            Excluir evento
          </button>
        </div>
      </div>
    </Card>
  );
}

function formatForInput(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}