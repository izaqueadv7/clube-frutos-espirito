import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { canAccessMediaPanel } from "@/lib/permissions";

export default async function MediaPanelPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!canAccessMediaPanel(session.user)) redirect("/dashboard");

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Painel da Mídia</h1>
        <p className="mt-2 text-sm text-slate-600">
          Área para cuidar dos avisos principais, galeria de fotos e conteúdos visuais do clube.
        </p>
      </Card>

      <Card className="p-5">
        <div className="space-y-3">
          <a href="/leader/highlights" className="block rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white">
            Gerenciar Avisos Principais
          </a>
          <a href="/leader/gallery" className="block rounded-lg bg-purple-600 px-4 py-3 font-semibold text-white">
            Gerenciar Galeria de Fotos
          </a>
        </div>
      </Card>
    </div>
  );
}