"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";

export function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<any>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!promptEvent) return null;

  return (
    <Button
      variant="primary"
      onClick={async () => {
        promptEvent.prompt();
        const result = await promptEvent.userChoice;
        toast(result.outcome === "accepted" ? "Aplicativo instalado!" : "Instalação cancelada");
        setPromptEvent(null);
      }}
    >
      Instalar App
    </Button>
  );
}