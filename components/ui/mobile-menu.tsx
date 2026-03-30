"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  canAccessFullLeaderPanel,
  canAccessSecretaryPanel,
  canAccessMediaPanel,
  canAccessDirectorPanel,
  canAccessCounselorPanel,
  canManageAssignments
} from "@/lib/permissions";

export function MobileMenu({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  function closeAll() {
    setOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        closeAll();
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const itemClass =
    "block rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-[rgba(46,125,50,0.08)]";
  const sectionTitleClass =
    "mt-4 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-[rgba(46,125,50,0.15)] bg-white dark:bg-zinc-950 px-3 py-2 text-primary shadow-sm hover:bg-[rgba(46,125,50,0.06)]"
        aria-label="Abrir menu"
      >
        ☰
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/35">
          <div
            ref={menuRef}
            className="absolute left-0 top-0 h-full w-[82%] max-w-[320px] overflow-y-auto rounded-r-3xl border-r p-4 shadow-2xl"
            style={{
              backgroundColor: "rgb(var(--accent))",
              color: "rgb(var(--ink))",
              borderColor: "rgba(46,125,50,0.12)"
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-primary">Menu</h2>

              <button
                type="button"
                onClick={closeAll}
                className="rounded-xl px-3 py-1 text-sm font-semibold hover:bg-[rgba(46,125,50,0.08)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
  <p className={sectionTitleClass}>Geral</p>

  <Link href="/profile" onClick={closeAll} className={itemClass}>
    Usuário
  </Link>

  <Link href="/dashboard" onClick={closeAll} className={itemClass}>
    Resumo
  </Link>

  <Link href="/classes" onClick={closeAll} className={itemClass}>
    Classes
  </Link>

  <Link href="/specialties" onClick={closeAll} className={itemClass}>
    Especialidades
  </Link>

  <Link href="/announcements" onClick={closeAll} className={itemClass}>
    Avisos
  </Link>

  <Link href="/calendar" onClick={closeAll} className={itemClass}>
    Calendário
  </Link>

  <Link href="/bible" onClick={closeAll} className={itemClass}>
    Bíblia
  </Link>

  {canAccessFullLeaderPanel(user) && (
    <Link href="/leader" onClick={closeAll} className={itemClass}>
      Painel Geral
    </Link>
  )}
</div>

            {canAccessSecretaryPanel(user) && (
              <div className="space-y-1">
                <p className={sectionTitleClass}>Secretaria</p>

                <Link href="/leader/secretaria" onClick={closeAll} className={itemClass}>
                  Painel Secretaria
                </Link>

                <Link href="/leader/secretaria/eventos" onClick={closeAll} className={itemClass}>
                  Eventos
                </Link>

                <Link href="/leader/users" onClick={closeAll} className={itemClass}>
                  Usuários
                </Link>
              </div>
            )}

            {canAccessMediaPanel(user) && (
              <div className="space-y-1">
                <p className={sectionTitleClass}>Mídia</p>

                <Link href="/leader/highlights" onClick={closeAll} className={itemClass}>
                  Avisos
                </Link>

                <Link href="/leader/gallery" onClick={closeAll} className={itemClass}>
                  Galeria
                </Link>
              </div>
            )}

            {canAccessDirectorPanel(user) && (
              <div className="space-y-1">
                <p className={sectionTitleClass}>Direção</p>

                <Link href="/leader/classes" onClick={closeAll} className={itemClass}>
                  Classes
                </Link>

                <Link href="/leader/classes/register" onClick={closeAll} className={itemClass}>
                  Registro Classes
                </Link>

                <Link href="/leader/specialties" onClick={closeAll} className={itemClass}>
                  Especialidades
                </Link>

                <Link href="/leader/specialties/registre" onClick={closeAll} className={itemClass}>
                  Registro Especialidades
                </Link>
              </div>
            )}

            {canAccessCounselorPanel(user) && (
              <div className="space-y-1">
                <p className={sectionTitleClass}>Conselheiro</p>

                <Link href="/leader/conselheiro" onClick={closeAll} className={itemClass}>
                  Progresso
                </Link>
              </div>
            )}

            {canManageAssignments(user) && (
              <div className="space-y-1">
                <p className={sectionTitleClass}>Gerenciamento</p>

                <Link href="/leader/assignments" onClick={closeAll} className={itemClass}>
                  Vínculos
                </Link>

                <Link href="/leader/parents/link" onClick={closeAll} className={itemClass}>
                  Responsáveis
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}