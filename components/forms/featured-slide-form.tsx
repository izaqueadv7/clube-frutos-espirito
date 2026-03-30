"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageUpload } from "@/components/forms/image-upload";

export function FeaturedSlideForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [order, setOrder] = useState("0");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!imageUrl) {
        setMessage("Envie uma imagem antes de cadastrar o aviso principal.");
        return;
      }

      const response = await fetch("/api/featured-slide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          description,
          imageUrl,
          imagePublicId,
          linkUrl,
          order: Number(order)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.error || "Erro ao salvar.");
        return;
      }

      setTitle("");
      setDescription("");
      setImageUrl("");
      setImagePublicId("");
      setLinkUrl("");
      setOrder("0");
      setMessage("Aviso principal cadastrado com sucesso.");
      router.refresh();
    } catch {
      setMessage("Erro ao salvar aviso principal.");
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
        <label className="mb-1 block text-sm font-semibold">Descrição</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
            alt="Prévia"
            className="h-48 w-full rounded-lg border object-cover"
          />
        </div>
      ) : null}

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-semibold">
          Link do card (opcional)
        </label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
        />
      </div>

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
          {loading ? "Salvando..." : "Cadastrar aviso principal"}
        </button>
      </div>
    </form>
  );
}