import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-white/10 bg-primary text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-3">
        <div>
          <h3 className="text-2xl font-bold">Clube Frutos do Espírito</h3>
          <p className="mt-3 text-sm text-white/90">
            Portal oficial do Clube de Desbravadores Frutos do Espírito.
          </p>
        </div>

        <div>
          <h4 className="text-xl font-semibold">Contato</h4>

          <div className="mt-3 space-y-2 text-sm">
            <a
              href="https://wa.me/5584996720843"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-white/95 hover:text-white"
            >
              <MessageCircle size={16} />
              <span>(84) 99672-0843</span>
            </a>

            <a
              href="https://wa.me/5584998946754"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-white/95 hover:text-white"
            >
              <MessageCircle size={16} />
              <span>(84) 99894-6754</span>
            </a>

            <a
              href="https://instagram.com/clubefrutosdoespirito"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-white/95 hover:text-white"
            >
              <Instagram size={16} />
              <span>@clubefrutosdoespirito</span>
            </a>

            <a
              href="mailto:frutosdoespirito2012@gmail.com"
              className="block text-white/95 hover:text-white"
            >
              frutosdoespirito2012@gmail.com
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-xl font-semibold">Endereço</h4>
          <div className="mt-3 space-y-1 text-sm text-white/95">
            <p>Rua Profetiza Ellen G. White, Nº 154</p>
            <p>Frutilândia, Assú/RN</p>
            <p>59.650-000</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-sm md:flex-row">
          <p className="text-white/90">Clube de Desbravadores Frutos do Espírito</p>

          <div className="flex items-center gap-5">
            <Link href="/login" className="text-white/90 hover:text-white">
              Login
            </Link>
            <Link href="/" className="text-white/90 hover:text-white">
              Clube
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}