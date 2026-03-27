"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ApprovalActions({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: "APPROVED" | "REJECTED") {
    try {
      setLoading(true);

      const response = await fetch(`/api/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        alert("Não foi possível atualizar o status.");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-3">
      <button
        type="button"
        disabled={loading}
        onClick={() => updateStatus("APPROVED")}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        Aprovar
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={() => updateStatus("REJECTED")}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        Rejeitar
      </button>
    </div>
  );
}