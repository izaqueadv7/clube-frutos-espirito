"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ClassItem = {
  id: string;
  name: string;
};

export function PathfinderRegisterForm({ classes }: { classes: ClassItem[] }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Pathfinder@123");
  const [classId, setClassId] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/pathfinders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password,
          classId,
          parentEmail,
          birthDate,
          parentPhone,
          notes
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.error || "Erro ao cadastrar desbravador.");
        return;
      }

      setName("");
      setEmail("");
      setPassword("Pathfinder@123");
      setClassId("");
      setParentEmail("");
      setBirthDate("");
      setParentPhone("");
      setNotes("");
      setMessage("Desbravador cadastrado com sucesso.");
      router.refresh();
    } catch (error) {
      setMessage("Erro ao cadastrar desbravador.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-semibold">Nome</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Email</label>
        <input
          type="email"
          className="w-full rounded-lg border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Senha inicial</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Classe atual</label>
        <select
          className="w-full rounded-lg border px-3 py-2"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
        >
          <option value="">Selecione</option>
          {classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Data de nascimento</label>
        <input
          type="date"
          className="w-full rounded-lg border px-3 py-2"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Email do responsável</label>
        <input
          type="email"
          className="w-full rounded-lg border px-3 py-2"
          value={parentEmail}
          onChange={(e) => setParentEmail(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Telefone do responsável</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={parentPhone}
          onChange={(e) => setParentPhone(e.target.value)}
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-semibold">Observações</label>
        <textarea
          className="w-full rounded-lg border px-3 py-2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {message ? (
        <p className="md:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      ) : null}

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 font-semibold text-white"
        >
          {loading ? "Salvando..." : "Cadastrar desbravador"}
        </button>
      </div>
    </form>
  );
}