import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { LogoutButton } from "@/components/forms/logout-button";
import { SubscribeNotifications } from "@/components/pwa/subscribe-notifications";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-hero-gradient px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl bg-white p-4 shadow-card">
        <Link href="/" className="text-lg font-extrabold text-primary">
          Portal Frutos do Espirito
        </Link>
        <div className="flex items-center gap-3">
          <SubscribeNotifications />
          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-primary">
            {session.user.role}
          </span>
          <LogoutButton />
        </div>
      </div>

      <div className="mx-auto mt-4 grid max-w-7xl gap-4 lg:grid-cols-[260px_1fr]">
        <Sidebar />
        <section className="space-y-4">{children}</section>
      </div>
    </main>
  );
}
