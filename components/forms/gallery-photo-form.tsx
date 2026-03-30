"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageUpload } from "@/components/forms/image-upload";

export function GalleryPhotoForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [order, setOrder] = useState("0");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!imageUrl) {
        setMessage("Envie uma imagem antes de cadastrar a foto.");
        return;
      }

      const response = await fetch("/api/gallery-photos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          imageUrl,
          imagePublicId,
          order: Number(order)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.error || "Erro ao salvar.");
        return;
      }

      setTitle("");
      setImageUrl("");
      setImagePublicId("");
      setOrder("0");
      setMessage("Foto cadastrada com sucesso.");
      router.refresh();
    } catch {
      setMessage("Erro ao salvar foto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-semibold">Título</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Ordem</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          type="number"
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-semibold">Enviar imagem</label>
        <ImageUpload
          onUploaded={({ url, publicId }) => {
            setImageUrl(url);
            setImagePublicId(publicId);
          }}
        />
      </div>

      {imageUrl ? (
        <div className="md:col-span-2">
          <img
            src={imageUrl}
            alt="Prévia da galeria"
            className="h-56 w-full rounded-lg border object-cover"
          />
        </div>
      ) : null}

      {message ? (
        <p className="md:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
          {message}
        </p>
      ) : null}

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 font-semibold text-white"
        >
          {loading ? "Salvando..." : "Cadastrar foto"}
        </button>
      </div>
    </form>
  );
}