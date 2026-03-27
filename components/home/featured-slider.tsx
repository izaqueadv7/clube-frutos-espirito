"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ProSlider } from "@/components/home/pro-slider";
import { ImageLightbox } from "@/components/home/image-lightbox";

type FeaturedSliderProps = {
  items: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string;
    linkUrl: string | null;
  }[];
};

export function FeaturedSlider({ items }: FeaturedSliderProps) {
  const [lightbox, setLightbox] = useState<{
    imageUrl: string;
    title?: string;
  } | null>(null);

  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="section-title">Avisos principais</h2>

      <ProSlider>
        {items.map((item) => {
          const card = (
            <Card className="overflow-hidden rounded-2xl border-0 p-0 shadow-lg">
              <div className="relative">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-56 w-full cursor-pointer object-cover"
                  onClick={() =>
                    setLightbox({
                      imageUrl: item.imageUrl,
                      title: item.title
                    })
                  }
                />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                </div>
              </div>

              <div className="space-y-3 p-4">
                {item.description ? (
                  <p className="text-sm text-slate-600">{item.description}</p>
                ) : null}

                {item.linkUrl ? (
                  <Link
                    href={item.linkUrl}
                    className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
                  >
                    Saiba mais
                  </Link>
                ) : null}
              </div>
            </Card>
          );

          return <div key={item.id}>{card}</div>;
        })}
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