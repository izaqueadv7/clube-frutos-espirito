import { Suspense } from "react";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";

function ResetPasswordContent() {
  return <ResetPasswordForm />;
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-hero-gradient px-4">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-extrabold text-primary">Nova senha</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Defina uma nova senha para seu acesso.</p>
        <div className="mt-6">
          <Suspense fallback={<p className="text-sm text-slate-500 dark:text-slate-400">Carregando...</p>}>
            <ResetPasswordContent />
          </Suspense>
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
