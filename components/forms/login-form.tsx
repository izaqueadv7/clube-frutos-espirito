"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        const result = await signIn("credentials", {
          email,
          password,
          redirect: false
        });

        setLoading(false);

        if (!result) {
          setError("Não foi possível iniciar o login.");
          return;
        }

        if (result.error) {
          setError(result.error);
          return;
        }

        router.push("/dashboard");
        router.refresh();
      }}
    >
      <div>
        <label className="mb-1 block text-sm font-semibold">Email</label>
        <Input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Senha</label>
        <Input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
          {error}
        </div>
      ) : null}

      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}