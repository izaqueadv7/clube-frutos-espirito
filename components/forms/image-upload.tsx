"use client";

import { useState } from "react";

type ImageUploadProps = {
  onUploaded: (data: { url: string; publicId: string }) => void;
};

export function ImageUpload({ onUploaded }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.error || "Erro ao enviar imagem.");
        return;
      }

      setPreview(data.url);

      onUploaded({
        url: data.url,
        publicId: data.publicId
      });

      setMessage("Imagem enviada com sucesso.");
    } catch (error) {
      setMessage("Erro no upload.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="file" accept="image/*" onChange={handleUpload} />

      {loading ? (
        <p className="text-sm text-slate-500">Enviando imagem...</p>
      ) : null}

      {message ? (
        <p className="text-sm text-slate-600">{message}</p>
      ) : null}

      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="h-40 w-full rounded-lg border object-cover"
        />
      ) : null}
    </div>
  );
}