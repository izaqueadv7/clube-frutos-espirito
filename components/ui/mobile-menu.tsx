"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Home,
  BookOpen,
  Calendar,
  Bell,
  User,
  Layers,
  Image as ImageIcon,
  Settings,
  ChevronDown,
  LogOut,
  BadgeCheck,
  BookMarked,
  LayoutDashboard,
  Link2,
  Users
} from "lucide-react";
import {
  canAccessFullLeaderPanel,
  canAccessSecretaryPanel,
  canAccessMediaPanel
} from "@/lib/permissions";

export function MobileMenu({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  function closeAll() {
    setOpen(false);
    setOpenSection(null);
  }

  function toggleSection(section: string) {
    setOpenSection((current) => (current === section ? null : section));
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeAll();
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [open]);

  const itemClass =
    "group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition duration-200 hover:bg-black/5 active:scale-[0.99] dark:hover:bg-white/5";

  const subItemClass =
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition duration-200 hover:bg-black/5 active:scale-[0.99] dark:hover:bg-white/5";

  const sectionTitleClass =
    "mb-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500";

  const profileType =
    user?.role === "LEADER"
      ? "Líder"
      : user?.role === "PARENT"
      ? "Responsável"
      : "Desbravador";

  const mainFunction =
    user?.primaryFunction ||
    (user?.role === "LEADER" ? "Liderança" : user?.role === "PARENT" ? "Responsável" : "Membro");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-2xl bg-white/15 px-3 py-2 text-white shadow-sm transition hover:bg-white/20 active:scale-[0.98]"
        aria-label="Abrir menu"
      >
        ☰
      </button>

      {open && (
        <div className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-[2px]">
          <div
  ref={menuRef}
  className="absolute left-0 top-0 z-[60] h-full w-[86%] max-w-[360px] overflow-y-auto rounded-r-[32px] p-4 pb-32 shadow-2xl animate-[slideInLeft_.22s_ease-out]"
            style={{
              backgroundColor: "rgb(var(--surface))",
              color: "rgb(var(--ink))"
            }}
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-primary">Menu</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Acesso rápido do aplicativo
                </p>
              </div>

              <button
                type="button"
                onClick={closeAll}
                className="rounded-2xl px-3 py-1.5 text-2xl leading-none transition hover:bg-black/5 dark:hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            <div className="mb-6 rounded-[28px] bg-primary p-4 text-white shadow-lg">
              <Link href="/profile" onClick={closeAll} className="block">
                <div className="flex items-center gap-3">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt="Foto do perfil"
                      className="h-16 w-16 rounded-full border-2 border-white/60 object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/50 bg-white/15 text-xl font-bold">
                      {user?.name?.[0] ?? "U"}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-xl font-extrabold">{user?.name ?? "Usuário"}</p>
                    <p className="truncate text-sm text-white/90">{profileType}</p>
                    <p className="truncate text-sm text-white/80">{mainFunction}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-white/15 px-4 py-3 text-center font-semibold transition hover:bg-white/20">
                  Ver Meu Perfil
                </div>
              </Link>
            </div>

            <div className="mb-6 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className={sectionTitleClass}>Geral</p>

              <div className="space-y-1">
                <Link href="/dashboard" onClick={closeAll} className={itemClass}>
                  <Home size={18} className="text-primary" />
                  Início
                </Link>

                <Link href="/classes" onClick={closeAll} className={itemClass}>
                  <Layers size={18} className="text-primary" />
                  Classes
                </Link>

                <Link href="/specialties" onClick={closeAll} className={itemClass}>
                  <BookMarked size={18} className="text-primary" />
                  Especialidades
                </Link>

                <Link href="/announcements" onClick={closeAll} className={itemClass}>
                  <Bell size={18} className="text-primary" />
                  Avisos
                </Link>

                <Link href="/calendar" onClick={closeAll} className={itemClass}>
                  <Calendar size={18} className="text-primary" />
                  Calendário
                </Link>

                <Link href="/bible" onClick={closeAll} className={itemClass}>
                  <BookOpen size={18} className="text-primary" />
                  Bíblia
                </Link>
              </div>
            </div>

            {(canAccessSecretaryPanel(user) || canAccessMediaPanel(user) || canAccessFullLeaderPanel(user)) && (
              <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <p className={sectionTitleClass}>Gerenciamento</p>

                <div className="space-y-2">
                  {canAccessSecretaryPanel(user) && (
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection("secretaria")}
                        className={`${itemClass} justify-between`}
                      >
                        <span className="flex items-center gap-3">
                          <Settings size={18} className="text-primary" />
                          Secretaria
                        </span>
                        <ChevronDown
                          size={18}
                          className={`transition duration-200 ${
                            openSection === "secretaria" ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <div
                        className={`overflow-hidden transition-all duration-200 ${
                          openSection === "secretaria" ? "mt-2 max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="ml-3 space-y-1 border-l border-slate-200 pl-3 dark:border-zinc-700">
                          <Link href="/leader/secretaria" onClick={closeAll} className={subItemClass}>
                            <LayoutDashboard size={16} className="text-primary" />
                            Painel Secretaria
                          </Link>
                          <Link href="/leader/secretaria/eventos" onClick={closeAll} className={subItemClass}>
                            <Calendar size={16} className="text-primary" />
                            Eventos
                          </Link>
                          <Link href="/leader/users" onClick={closeAll} className={subItemClass}>
                            <Users size={16} className="text-primary" />
                            Usuários
                          </Link>
                          <Link href="/leader/classes" onClick={closeAll} className={subItemClass}>
                            <Layers size={16} className="text-primary" />
                            Classes
                          </Link>
                          <Link href="/leader/classes/register" onClick={closeAll} className={subItemClass}>
                            <BadgeCheck size={16} className="text-primary" />
                            Registro Classes
                          </Link>
                          <Link href="/leader/specialties" onClick={closeAll} className={subItemClass}>
                            <BookMarked size={16} className="text-primary" />
                            Especialidades
                          </Link>
                          <Link href="/leader/specialties/registre" onClick={closeAll} className={subItemClass}>
                            <BadgeCheck size={16} className="text-primary" />
                            Registro Especialidades
                          </Link>
                          <Link href="/leader/assignments" onClick={closeAll} className={subItemClass}>
                            <Link2 size={16} className="text-primary" />
                            Vínculos
                          </Link>
                          <Link href="/leader/parents/link" onClick={closeAll} className={subItemClass}>
                            <Users size={16} className="text-primary" />
                            Responsáveis
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {canAccessMediaPanel(user) && (
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection("midia")}
                        className={`${itemClass} justify-between`}
                      >
                        <span className="flex items-center gap-3">
                          <ImageIcon size={18} className="text-primary" />
                          Mídia
                        </span>
                        <ChevronDown
                          size={18}
                          className={`transition duration-200 ${
                            openSection === "midia" ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <div
                        className={`overflow-hidden transition-all duration-200 ${
                          openSection === "midia" ? "mt-2 max-h-[200px] opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="ml-3 space-y-1 border-l border-slate-200 pl-3 dark:border-zinc-700">
                          <Link href="/leader/highlights" onClick={closeAll} className={subItemClass}>
                            <Bell size={16} className="text-primary" />
                            Avisos
                          </Link>
                          <Link href="/leader/gallery" onClick={closeAll} className={subItemClass}>
                            <ImageIcon size={16} className="text-primary" />
                            Galeria
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {canAccessFullLeaderPanel(user) && (
                    <Link href="/leader" onClick={closeAll} className={itemClass}>
                      <User size={18} className="text-primary" />
                      Painel Geral
                    </Link>
                  )}

                  <Link href="/login" onClick={closeAll} className={`${itemClass} text-red-600 dark:text-red-400`}>
                    <LogOut size={18} />
                    Sair
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}