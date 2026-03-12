"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";

export function NotificationTestForm() {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="secondary"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const response = await fetch("/api/notifications/test", { method: "POST" });
        const data = await response.json();
        setLoading(false);

        if (!response.ok) {
          toast(data.error ?? "Falha ao executar teste");
          return;
        }

        toast(`Teste executado para ${data.subscribers} assinaturas`);
      }}
    >
      {loading ? "Executando..." : "Testar notificacoes"}
    </Button>
  );
}
