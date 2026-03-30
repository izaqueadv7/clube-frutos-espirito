"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageUpload } from "@/components/forms/image-upload";

type GalleryPhotoItemFormProps = {
  item: {
    id: string;
    title: string | null;
    imageUrl: string;
    imagePublicId?: string | null;
    order: number;
    isActive: boolean;
  };
};

export function GalleryPhotoItemForm({ item }: GalleryPhotoItemFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(item.title ?? "");
  const [imageUrl, setImageUrl] = useState(item.imageUrl);
  const [imagePublicId, setImagePublicId] = useState(item.imagePublicId ?? "");
  const [order, setOrder] = useState(String(item.order));
  const [isActive, setIsActive] = useState(item.isActive);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/gallery-photos/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          imageUrl,
          imagePublicId,
          order: Number(order),
          isActive
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.error || "Erro ao atualizar.");
        return;
      }

      setMessage("Foto atualizada com sucesso.");
      router.refresh();
    } catch (error) {
      setMessage("Erro ao atualizar foto.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Deseja excluir esta foto?");
    if (!confirmed) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/gallery-photos/${item.id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.error || "Erro ao excluir.");
        return;
      }

      router.refresh();
    } catch (error) {
      setMessage("Erro ao excluir foto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="grid gap-4">
      <div>
        <label className="mb-1 block text-sm font-semibold">Título</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Trocar imagem</label>
        <ImageUpload
          onUploaded={({ url, publicId }) => {
            setImageUrl(url);
            setImagePublicId(publicId);
          }}
        />
      </div>

      {imageUrl ? (
        <div>
          <img
            src={imageUrl}
            alt="Imagem da galeria"
            className="h-56 w-full rounded-lg border object-cover"
          />
        </div>
      ) : null}

      <div>
        <label className="mb-1 block text-sm font-semibold">Ordem</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          type="number"
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Foto ativa
      </label>

      {message ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
          {message}
        </p>
      ) : null}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 font-semibold text-white"
        >
          {loading ? "Salvando..." : "Salvar alterações"}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="ml-3 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white"
        >
          Excluir
        </button>
      </div>
    </form>
  );
}