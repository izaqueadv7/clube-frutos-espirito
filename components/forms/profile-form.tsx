"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageUpload } from "@/components/forms/image-upload";

export function ProfileForm({ user }: { user: any }) {
  const router = useRouter();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [birthDate, setBirthDate] = useState(user?.birthDate || "");
  const [image, setImage] = useState(user?.image || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        setMessage("Informe sua senha atual para alterar a senha.");
        setLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        setMessage("A nova senha deve ter pelo menos 6 caracteres.");
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setMessage("A confirmação da nova senha não confere.");
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch("/api/users/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          birthDate,
          image,
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.error || "Erro ao atualizar perfil.");
        return;
      }

      setMessage("Perfil atualizado com sucesso.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      router.refresh();

      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch {
      setMessage("Erro ao salvar perfil.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-semibold">Foto de perfil</p>

        {image ? (
          <img
            src={image}
            alt="Foto de perfil"
            className="mb-3 h-24 w-24 rounded-full border object-cover"
          />
        ) : (
          <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full border bg-slate-100 dark:bg-zinc-800text-slate-500 dark:text-slate-400">
            Sem foto
          </div>
        )}

        <ImageUpload
          onUploaded={({ url }) => {
            setImage(url);
          }}
        />
      </div>

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
        <label className="mb-1 block text-sm font-semibold">Data de nascimento</label>
        <input
          type="date"
          className="w-full rounded-lg border px-3 py-2"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </div>

      <div className="rounded-xl border p-4">
        <p className="mb-3 text-sm font-semibold">Alterar senha</p>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-semibold">Senha atual</label>
            <input
              type="password"
              className="w-full rounded-lg border px-3 py-2"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Nova senha</label>
            <input
              type="password"
              className="w-full rounded-lg border px-3 py-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Confirmar nova senha</label>
            <input
              type="password"
              className="w-full rounded-lg border px-3 py-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
      </div>

      {message ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary px-4 py-2 font-semibold text-white"
      >
        {loading ? "Salvando..." : "Salvar perfil"}
      </button>
    </form>
  );
}