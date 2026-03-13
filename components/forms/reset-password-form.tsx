"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = params?.get("token") ?? "";

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password })
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error ?? "Nao foi possivel redefinir a senha");
          setLoading(false);
          return;
        }

        setMessage(data.message ?? "Senha redefinida.");
        setLoading(false);
        setTimeout(() => router.push("/login"), 1200);
      }}
    >
      <div>
        <label className="mb-1 block text-sm font-semibold">Nova senha</label>
        <Input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
      </div>

      <Button className="w-full" type="submit" disabled={loading || !token}>
        {loading ? "Atualizando..." : "Redefinir senha"}
      </Button>

      {!token ? <p className="text-sm text-red-600">Token nao encontrado na URL.</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-green-700">{message}</p> : null}
    </form>
  );
}
