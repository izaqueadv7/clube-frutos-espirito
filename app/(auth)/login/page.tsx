import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-hero-gradient px-4">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-extrabold text-primary">Entrar no Portal</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Acesse com email e senha cadastrados.
        </p>

        <div className="mt-6">
          <LoginForm />
        </div>

        <div className="mt-4 flex justify-between text-sm">
          <Link
            href="/forgot-password"
            className="font-semibold text-primary hover:underline"
          >
            Esqueci minha senha
          </Link>
          <Link href="/" className="text-slate-600 dark:text-slate-300 hover:text-primary">
            Voltar
          </Link>
        </div>

        <div className="mt-4 text-center text-sm">
          <span className="text-slate-600 dark:text-slate-300">Não tem conta? </span>
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline"
          >
            Cadastre-se
          </Link>
        </div>
      </div>
    </main>
  );
}