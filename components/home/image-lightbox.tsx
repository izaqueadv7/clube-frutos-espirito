"use client";

type ImageLightboxProps = {
  imageUrl: string;
  title?: string;
  onClose: () => void;
};

export function ImageLightbox({
  imageUrl,
  title,
  onClose
}: ImageLightboxProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 dark:bg-zinc-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-lg font-bold text-slate-800 shadow"
        >
          ×
        </button>

        <img
          src={imageUrl}
          alt={title || "Imagem ampliada"}
          className="max-h-[80vh] w-full object-contain bg-black"
        />

        {title ? (
          <div className="p-4">
            <p className="text-sm font-semibold text-slate-800">{title}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}