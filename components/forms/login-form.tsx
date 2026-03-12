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

        if (!result || result.error) {
          setError("Email ou senha invalidos");
          return;
        }

        router.push("/dashboard");
      }}
    >
      <div>
        <label className="mb-1 block text-sm font-semibold">Email</label>
        <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Senha</label>
        <Input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
