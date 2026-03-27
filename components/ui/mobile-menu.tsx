"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  canAccessFullLeaderPanel,
  canAccessSecretaryPanel,
  canAccessMediaPanel,
  canAccessDirectorPanel,
  canAccessCounselorPanel,
  canManageAssignments
} from "@/lib/permissions";

export function MobileMenu({ isOpen, onClose, user }: any) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const itemClass =
    "block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-zinc-900";

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div
        ref={menuRef}
        className="absolute left-0 top-0 h-full w-72 bg-white p-4 dark:bg-zinc-950"
      >
        <h2 className="mb-4 text-lg font-bold text-primary">Menu</h2>

        <Link href="/dashboard" onClick={onClose} className={itemClass}>
          Dashboard
        </Link>

        {canAccessFullLeaderPanel(user) && (
          <Link href="/leader" onClick={onClose} className={itemClass}>
            Painel Geral
          </Link>
        )}

        {canAccessSecretaryPanel(user) && (
          <>
            <p className="mt-3 text-xs text-gray-400">SECRETARIA</p>
            <Link href="/leader/secretaria" onClick={onClose} className={itemClass}>
              Painel Secretaria
            </Link>
            <Link href="/leader/secretaria/eventos" onClick={onClose} className={itemClass}>
              Eventos
            </Link>
          </>
        )}

        {canAccessMediaPanel(user) && (
          <>
            <p className="mt-3 text-xs text-gray-400">MÍDIA</p>
            <Link href="/leader/highlights" onClick={onClose} className={itemClass}>
              Avisos
            </Link>
            <Link href="/leader/gallery" onClick={onClose} className={itemClass}>
              Galeria
            </Link>
          </>
        )}

        {canAccessDirectorPanel(user) && (
          <>
            <p className="mt-3 text-xs text-gray-400">DIREÇÃO</p>
            <Link href="/leader/classes" onClick={onClose} className={itemClass}>
              Classes
            </Link>
            <Link href="/leader/classes/register" onClick={onClose} className={itemClass}>
              Registro Classes
            </Link>
            <Link href="/leader/specialties" onClick={onClose} className={itemClass}>
              Especialidades
            </Link>
            <Link href="/leader/specialties/registre" onClick={onClose} className={itemClass}>
              Registro Especialidades
            </Link>
          </>
        )}

        {canAccessCounselorPanel(user) && (
          <>
            <p className="mt-3 text-xs text-gray-400">CONSELHEIRO</p>
            <Link href="/leader/progress" onClick={onClose} className={itemClass}>
              Progresso
            </Link>
          </>
        )}

        {canManageAssignments(user) && (
          <>
            <p className="mt-3 text-xs text-gray-400">GERENCIAMENTO</p>
            <Link href="/leader/assignments" onClick={onClose} className={itemClass}>
              Vínculos
            </Link>
            <Link href="/leader/parents/link" onClick={onClose} className={itemClass}>
              Responsáveis
            </Link>
          </>
        )}
      </div>
    </div>
  );
}