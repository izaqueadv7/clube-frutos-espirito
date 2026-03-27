"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageUpload } from "@/components/forms/image-upload";

type FeaturedSlideItemFormProps = {
  item: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string;
    imagePublicId?: string | null;
    linkUrl: string | null;
    order: number;
    isActive: boolean;
  };
};

export function FeaturedSlideItemForm({ item }: FeaturedSlideItemFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [imageUrl, setImageUrl] = useState(item.imageUrl);
  const [imagePublicId, setImagePublicId] = useState(item.imagePublicId ?? "");
  const [linkUrl, setLinkUrl] = useState(item.linkUrl ?? "");
  const [order, setOrder] = useState(String(item.order));
  const [isActive, setIsActive] = useState(item.isActive);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/featured-slide/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          description,
          imageUrl,
          imagePublicId,
          linkUrl,
          order: Number(order),
          isActive
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.error || "Erro ao atualizar.");
        return;
      }

      setMessage("Aviso atualizado com sucesso.");
      router.refresh();
    } catch (error) {
      setMessage("Erro ao atualizar aviso principal.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Deseja excluir este aviso principal?");
    if (!confirmed) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/featured-slide/${item.id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.error || "Erro ao excluir aviso.");
        return;
      }

      router.refresh();
    } catch (error) {
      setMessage("Erro ao excluir aviso principal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
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
        <label className="mb-1 block text-sm font-semibold">Trocar imagem</label>
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
            alt="Imagem atual do aviso"
            className="h-48 w-full rounded-lg border object-cover"
          />
        </div>
      ) : null}

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-semibold">Link do card</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
        />
      </div>

      <label className="md:col-span-2 flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Aviso ativo
      </label>

      {message ? (
        <p className="md:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      ) : null}

      <div className="md:col-span-2">
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