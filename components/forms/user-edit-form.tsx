"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UserEditFormProps = {
  user: {
    id: string;
    name: string;
    email: string;
    role: "PATHFINDER" | "LEADER" | "PARENT";
    primaryFunction: string;
    secondaryFunction: string;
    isAdmin: boolean;
    isMedia: boolean;
    canManageUsers: boolean;
    canManageContent: boolean;
    isActive: boolean;
  };
};

export function UserEditForm({ user }: UserEditFormProps) {
  const router = useRouter();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user.role);
  const [primaryFunction, setPrimaryFunction] = useState(user.primaryFunction);
  const [secondaryFunction, setSecondaryFunction] = useState(user.secondaryFunction);
  const [isAdmin, setIsAdmin] = useState(user.isAdmin);
  const [isMedia, setIsMedia] = useState(user.isMedia);
  const [canManageUsers, setCanManageUsers] = useState(user.canManageUsers);
  const [canManageContent, setCanManageContent] = useState(user.canManageContent);
  const [isActive, setIsActive] = useState(user.isActive);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          primaryFunction,
          secondaryFunction,
          isAdmin,
          isMedia,
          canManageUsers,
          canManageContent,
          isActive
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Não foi possível salvar.");
        setLoading(false);
        return;
      }

      setMessage("Usuário atualizado com sucesso.");
      setPassword("");
      router.refresh();
    } catch {
      setError("Erro ao atualizar usuário.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Tem certeza que deseja excluir este usuário?");
    if (!confirmed) return;

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Não foi possível excluir.");
        setLoading(false);
        return;
      }

      setMessage("Usuário excluído com sucesso.");
      router.refresh();
    } catch {
      setError("Erro ao excluir usuário.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Nome</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Nova senha
        </label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Deixe vazio para não alterar"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Perfil</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "PATHFINDER" | "LEADER" | "PARENT")}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="PATHFINDER">PATHFINDER</option>
          <option value="LEADER">LEADER</option>
          <option value="PARENT">PARENT</option>
          <option value="ADMIN">ADMIN</option>
          <option value="DIRECTOR">DIRECTOR</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Função principal
        </label>
        <input
          value={primaryFunction}
          onChange={(e) => setPrimaryFunction(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Função secundária
        </label>
        <input
          value={secondaryFunction}
          onChange={(e) => setSecondaryFunction(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={isAdmin}
          onChange={(e) => setIsAdmin(e.target.checked)}
        />
        Administrador geral
      </label>

      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={isMedia}
          onChange={(e) => setIsMedia(e.target.checked)}
        />
        Responsável por mídia
      </label>

      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={canManageUsers}
          onChange={(e) => setCanManageUsers(e.target.checked)}
        />
        Gerencia usuários
      </label>

      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={canManageContent}
          onChange={(e) => setCanManageContent(e.target.checked)}
        />
        Gerencia conteúdo
      </label>

      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 md:col-span-2">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Usuário ativo
      </label>

      <div className="md:col-span-2">
        {error ? (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        ) : null}

        {message ? (
          <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar alterações"}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="ml-3 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          Excluir usuário
        </button>
      </div>
    </form>
  );
}