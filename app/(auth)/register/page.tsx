import Link from "next/link";
import { RegisterForm } from "@/components/forms/register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-hero-gradient px-4">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-extrabold text-primary">Criar conta</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-800">
          Preencha seus dados para solicitar acesso ao portal.
        </p>

        <div className="mt-6">
          <RegisterForm />
        </div>

        <div className="mt-4 text-center text-sm">
          <span className="text-slate-600 dark:text-slate-800">Já tem conta? </span>
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Entrar
          </Link>
        </div>
      </div>
    </main>
  );
}