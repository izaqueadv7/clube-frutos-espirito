"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageUpload } from "@/components/forms/image-upload";

export function ProfileForm({ user }: { user: any }) {
  const router = useRouter();
  const [name, setName] = useState(user?.name || "");
  const [image, setImage] = useState(user?.image || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/users/update-profile", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          image
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.error || "Erro ao atualizar perfil.");
        return;
      }

      setMessage("Perfil atualizado com sucesso.");
      router.refresh();

      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
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
          <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full border bg-slate-100 text-slate-500">
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

      {message ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-slate-700">
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