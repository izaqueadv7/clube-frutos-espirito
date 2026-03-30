"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ProSlider } from "@/components/home/pro-slider";
import { ImageLightbox } from "@/components/home/image-lightbox";

type GallerySliderProps = {
  items: {
    id: string;
    title: string | null;
    imageUrl: string;
  }[];
};

export function GallerySlider({ items }: GallerySliderProps) {
  const [lightbox, setLightbox] = useState<{
    imageUrl: string;
    title?: string;
  } | null>(null);

  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="section-title">Fotos do clube</h2>

      <ProSlider>
        {items.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden rounded-2xl border-0 p-0 shadow-lg"
          >
            <img
              src={item.imageUrl}
              alt={item.title || "Foto do clube"}
              className="h-72 w-full cursor-pointer object-cover"
              onClick={() =>
                setLightbox({
                  imageUrl: item.imageUrl,
                  title: item.title || "Foto do clube"
                })
              }
            />

            <div className="p-4">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-600">
                {item.title || "Foto do clube"}
              </p>
            </div>
          </Card>
        ))}
      </ProSlider>

      {lightbox ? (
        <ImageLightbox
          imageUrl={lightbox.imageUrl}
          title={lightbox.title}
          onClose={() => setLightbox(null)}
        />
      ) : null}
    </section>
  );
}