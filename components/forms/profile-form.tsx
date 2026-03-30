"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Camera,
  Mail,
  User,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { ImageUpload } from "@/components/forms/image-upload";

export function ProfileForm({
  user,
  roleLabel
}: {
  user: any;
  roleLabel: string;
}) {
  const router = useRouter();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [image, setImage] = useState(user?.image || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
      }, 700);
    } catch {
      setMessage("Erro ao salvar perfil.");
    } finally {
      setLoading(false);
    }
  }

  const mainFunction =
    user?.primaryFunction ||
    (user?.role === "LEADER"
      ? "Liderança"
      : user?.role === "PARENT"
      ? "Responsável"
      : "Desbravador");

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] bg-primary p-5 text-white shadow-lg">
        <div className="flex items-center gap-4">
          {image ? (
            <img
              src={image}
              alt="Foto do perfil"
              className="h-24 w-24 rounded-full border-4 border-white/60 object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/50 bg-white/15 text-3xl font-bold">
              {name?.[0] ?? "U"}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-2xl font-extrabold">{name || "Usuário"}</p>
            <p className="mt-1 text-sm text-white/90">{roleLabel}</p>
            <p className="text-sm text-white/80">{mainFunction}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Perfil
          </p>

          <div className="space-y-4">
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <Camera size={16} className="text-primary" />
                Foto de perfil
              </p>

              <div className="mb-3">
                {image ? (
                  <img
                    src={image}
                    alt="Foto de perfil"
                    className="h-24 w-24 rounded-full border object-cover dark:border-zinc-700"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border bg-slate-100 text-slate-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-400">
                    Sem foto
                  </div>
                )}
              </div>

              <ImageUpload
                onUploaded={({ url }) => {
                  setImage(url);
                }}
              />
            </div>

            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <User size={16} className="text-primary" />
                Nome
              </label>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-primary dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <Mail size={16} className="text-primary" />
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-primary dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <ShieldCheck size={16} className="text-primary" />
                Perfil no sistema
              </label>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-300">
                {roleLabel}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Segurança
          </p>

          <div className="space-y-4">
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <Lock size={16} className="text-primary" />
                Senha atual
              </label>

              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-slate-900 outline-none transition focus:border-primary dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <Lock size={16} className="text-primary" />
                Nova senha
              </label>

              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-slate-900 outline-none transition focus:border-primary dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <Lock size={16} className="text-primary" />
                Confirmar nova senha
              </label>

              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-slate-900 outline-none transition focus:border-primary dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {message ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-slate-700 dark:bg-zinc-900 dark:text-slate-300">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-primary px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar perfil"}
        </button>
      </form>
    </div>
  );
}