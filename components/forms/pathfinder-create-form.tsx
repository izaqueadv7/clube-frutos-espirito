"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

export function PathfinderCreateForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Desbravador@123");
  const [className, setClassName] = useState("Amigo");
  const [parentEmail, setParentEmail] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);

        const response = await fetch("/api/pathfinders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, className, parentEmail })
        });

        const data = await response.json();
        setLoading(false);

        if (!response.ok) {
          toast(data.error ?? "Falha ao cadastrar");
          return;
        }

        toast("Pathfinder cadastrado com sucesso");
        setName("");
        setEmail("");
        setParentEmail("");
      }}
    >
      <div>
        <label className="mb-1 block text-sm font-semibold">Nome</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">Email</label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">Senha inicial</label>
        <Input value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">Classe</label>
        <Input value={className} onChange={(e) => setClassName(e.target.value)} required />
      </div>
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-semibold">Email do responsavel (opcional)</label>
        <Input value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} type="email" />
      </div>

      <Button type="submit" className="md:col-span-2" disabled={loading}>
        {loading ? "Salvando..." : "Registrar Desbravador"}
      </Button>
    </form>
  );
}
