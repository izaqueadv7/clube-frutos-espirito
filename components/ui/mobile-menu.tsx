"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  canAccessFullLeaderPanel,
  canAccessSecretaryPanel,
  canAccessMediaPanel,
  canAccessDirectorPanel,
  canAccessCounselorPanel
} from "@/lib/permissions";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function MobileMenu({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const [openManagement, setOpenManagement] = useState(false);
  const [openThemes, setOpenThemes] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  function closeAll() {
    setOpen(false);
    setOpenManagement(false);
    setOpenThemes(false);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!open) return;

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        closeAll();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const itemClass =
    "block rounded-lg px-2 py-2 hover:bg-[rgba(46,125,50,0.08)]";
  const buttonClass =
    "w-full rounded-lg px-3 py-2 text-left font-semibold bg-[rgba(46,125,50,0.08)] hover:bg-[rgba(46,125,50,0.14)]";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-primary px-3 py-2 text-white"
      >
        ☰
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div
            ref={menuRef}
            className="h-full w-80 overflow-y-auto p-4 shadow-xl"
            style={{
              backgroundColor: "rgb(var(--accent))",
              color: "rgb(var(--ink))"
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-primary">Menu</h2>
              <button
                type="button"
                onClick={closeAll}
                className="rounded-lg px-2 py-1 hover:bg-[rgba(46,125,50,0.08)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Geral
              </p>

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
              <Link href="/calendar" onClick={closeAll} className={itemClass}>
                Calendário
              </Link>
              <Link href="/announcements" onClick={closeAll} className={itemClass}>
                Avisos
              </Link>
              <Link href="/bible" onClick={closeAll} className={itemClass}>
                Bíblia
              </Link>
            </div>

            <div className="mt-6 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Temas
              </p>

              <button
                type="button"
                onClick={() => setOpenThemes(!openThemes)}
                className={buttonClass}
              >
                Aparência
              </button>

              {openThemes ? (
                <div className="ml-2 border-l border-slate-200 pl-3">
                  <ThemeToggle />
                </div>
              ) : null}
            </div>

            {user?.role === "LEADER" ? (
              <div className="mt-6 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Liderança
                </p>

                <button
                  type="button"
                  onClick={() => setOpenManagement(!openManagement)}
                  className={buttonClass}
                >
                  Gerenciamento
                </button>

                {openManagement ? (
                  <div className="ml-2 space-y-2 border-l border-slate-200 pl-3 text-sm">
                    {canAccessFullLeaderPanel(user) ? (
                      <Link href="/leader" onClick={closeAll} className={itemClass}>
                        Painel Líder
                      </Link>
                    ) : null}

                    {canAccessSecretaryPanel(user) ? (
                      <>
                        <Link href="/leader/users" onClick={closeAll} className={itemClass}>
                          Gerenciar Usuários
                        </Link>
                        <Link href="/leader/approvals" onClick={closeAll} className={itemClass}>
                          Aprovar Cadastros
                        </Link>
                        <Link href="/leader/secretaria" onClick={closeAll} className={itemClass}>
                          Painel da Secretária
                        </Link>
                        <Link href="/leader/membros/registros" onClick={closeAll} className={itemClass}>
                          Registros dos Membros
                        </Link>
                        <Link href="/leader/classes" onClick={closeAll} className={itemClass}>
                          Gerenciar Classes
                        </Link>
                        <Link href="/leader/classes/register" onClick={closeAll} className={itemClass}>
                          Registro de Classes
                        </Link>
                        <Link href="/leader/specialties" onClick={closeAll} className={itemClass}>
                          Gerenciar Especialidades
                        </Link>
                        <Link href="/leader/specialties/registe" onClick={closeAll} className={itemClass}>
                          Registro de Especialidades
                        </Link>
                        <Link href="/leader/parents/link" onClick={closeAll} className={itemClass}>
                          Vincular Responsável
                        </Link>
                        <Link href="/leader/assignments" onClick={closeAll} className={itemClass}>
  Vincular Classes e Especialidades
</Link>
                      </>
                    ) : null}

                    {canAccessMediaPanel(user) ? (
                      <>
                        <Link href="/leader/highlights" onClick={closeAll} className={itemClass}>
                          Avisos Principais
                        </Link>
                        <Link href="/leader/gallery" onClick={closeAll} className={itemClass}>
                          Galeria de Fotos
                        </Link>
                        <Link href="/leader/media" onClick={closeAll} className={itemClass}>
                          Painel da Mídia
                        </Link>
                      </>
                    ) : null}

                    {canAccessDirectorPanel(user) ? (
                      <Link href="/leader/diretor" onClick={closeAll} className={itemClass}>
                        Painel do Diretor
                      </Link>
                    ) : null}

                    {canAccessCounselorPanel(user) ? (
                      <Link href="/leader/conselheiro" onClick={closeAll} className={itemClass}>
                        Painel do Conselheiro
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
