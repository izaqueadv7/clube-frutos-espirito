"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function SubscribeNotifications() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setEnabled(Boolean(subscription)))
      .catch(() => undefined);
  }, []);

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) return null;

  return (
    <Button
      variant="secondary"
      disabled={loading || enabled}
      onClick={async () => {
        setLoading(true);

        try {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            toast("Permissao de notificacao negada");
            setLoading(false);
            return;
          }

          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey)
          });

          const response = await fetch("/api/notifications/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(subscription)
          });

          if (!response.ok) {
            throw new Error("Falha ao salvar assinatura");
          }

          setEnabled(true);
          toast("Notificacoes ativadas com sucesso");
        } catch {
          toast("Nao foi possivel ativar notificacoes");
        } finally {
          setLoading(false);
        }
      }}
    >
      {enabled ? "Notificacoes ativas" : loading ? "Ativando..." : "Ativar notificacoes"}
    </Button>
  );
}
