"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { UserEditForm } from "@/components/forms/user-edit-form";
import { translateRole, translateStatus } from "@/lib/translate";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: "PATHFINDER" | "LEADER" | "PARENT";
  status: "PENDING" | "APPROVED" | "REJECTED";
  primaryFunction: string;
  secondaryFunction: string;
  isAdmin: boolean;
  isMedia: boolean;
  canManageUsers: boolean;
  canManageContent: boolean;
  isActive: boolean;
};

export function UserManagementPanel({ users }: { users: UserItem[] }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [active, setActive] = useState("ALL");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const q = query.trim().toLowerCase();

      const matchesQuery =
        q === "" ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.primaryFunction.toLowerCase().includes(q) ||
        user.secondaryFunction.toLowerCase().includes(q);

      const matchesRole = role === "ALL" || user.role === role;
      const matchesStatus = status === "ALL" || user.status === status;
      const matchesActive =
        active === "ALL" ||
        (active === "ACTIVE" && user.isActive) ||
        (active === "INACTIVE" && !user.isActive);

      return matchesQuery && matchesRole && matchesStatus && matchesActive;
    });
  }, [users, query, role, status, active]);

  return (
    <div className="space-y-4">
      <Card className="grid gap-4 p-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-semibold">Buscar</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Nome, email ou função"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Perfil</label>
          <select
            className="w-full rounded-lg border px-3 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="ALL">Todos</option>
            <option value="LEADER">Líder</option>
            <option value="PATHFINDER">Desbravador</option>
            <option value="PARENT">Responsável</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Status</label>
          <select
            className="w-full rounded-lg border px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ALL">Todos</option>
            <option value="PENDING">Pendente</option>
            <option value="APPROVED">Aprovado</option>
            <option value="REJECTED">Rejeitado</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Situação</label>
          <select
            className="w-full rounded-lg border px-3 py-2"
            value={active}
            onChange={(e) => setActive(e.target.value)}
          >
            <option value="ALL">Todos</option>
            <option value="ACTIVE">Ativos</option>
            <option value="INACTIVE">Inativos</option>
          </select>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <Card className="p-5">
            <p className="text-sm text-slate-600">Nenhum usuário encontrado.</p>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="p-5">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-primary">{user.name}</h2>
                <p className="text-sm text-slate-600">{user.email}</p>
                <p className="text-sm text-slate-600">
                  Perfil: {translateRole(user.role)}
                </p>
                <p className="text-sm text-slate-600">
                  Status: {translateStatus(user.status)}
                </p>
              </div>

              <UserEditForm user={user} />
            </Card>
          ))
        )}
      </div>
    </div>
  );
}