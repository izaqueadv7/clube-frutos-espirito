import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-hero-gradient px-4">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-extrabold text-primary">Recuperar senha</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-800">
          Informe seu email para gerar o link de redefinicao.
        </p>
        <div className="mt-6">
          <ForgotPasswordForm />
        </div>
        <div className="mt-4 text-sm">
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Voltar para login
          </Link>
        </div>
      </div>
    </main>
  );
}
