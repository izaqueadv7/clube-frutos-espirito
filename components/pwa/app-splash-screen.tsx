"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function AppSplashScreen() {
  const [visible, setVisible] = useState(true);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem("app-splash-seen");

    if (alreadySeen) {
      setVisible(false);
      return;
    }

    const startHide = setTimeout(() => {
      setHide(true);
    }, 1800);

    const finish = setTimeout(() => {
      sessionStorage.setItem("app-splash-seen", "true");
      setVisible(false);
    }, 2500);

    return () => {
      clearTimeout(startHide);
      clearTimeout(finish);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={[
        "fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-700",
        hide ? "opacity-0" : "opacity-100"
      ].join(" ")}
      style={{
        background: "linear-gradient(180deg, #F5FAF5 0%, #E8F5E9 100%)"
      }}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="animate-[pulse_1.8s_ease-in-out_infinite]">
          <Image
            src="/logo-clube.png"
            alt="Logo Clube Frutos do Espírito"
            width={180}
            height={180}
            priority
            className="h-36 w-36 object-contain sm:h-44 sm:w-44"
          />
        </div>

        <h1 className="mt-6 text-center text-2xl font-extrabold text-primary sm:text-3xl">
          Clube Frutos do Espírito
        </h1>

        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-300">
          Carregando...
        </p>
      </div>
    </div>
  );
}