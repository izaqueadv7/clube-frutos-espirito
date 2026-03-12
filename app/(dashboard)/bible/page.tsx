import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { BibleReader } from "@/components/dashboard/bible-reader";

export default async function BiblePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h1 className="section-title">Modulo Biblico</h1>
        <p className="mt-2 text-sm text-slate-600">
          Lista de livros, navegacao por capitulos, busca de referencias e devocional diario.
        </p>
      </Card>

      <BibleReader />
    </div>
  );
}
