import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-red-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>Clube de Desbravadores Frutos do Espirito</p>
        <div className="flex gap-4">
          <Link href="/login" className="hover:text-primary">
            Login
          </Link>
          <Link href="/dashboard" className="hover:text-primary">
            Clube
          </Link>
        </div>
      </div>
    </footer>
  );
}
