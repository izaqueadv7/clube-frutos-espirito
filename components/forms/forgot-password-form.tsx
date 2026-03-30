"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setMessage("");

        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });

        const data = await response.json();
        setMessage(data.message ?? "Solicitacao processada.");
        setLoading(false);
      }}
    >
      <div>
        <label className="mb-1 block text-sm font-semibold">Email cadastrado</label>
        <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      </div>

      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Enviar link de recuperacao"}
      </Button>

      {message ? <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p> : null}
    </form>
  );
}
