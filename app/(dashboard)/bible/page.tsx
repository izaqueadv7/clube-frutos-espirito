import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BibleReader } from "@/components/dashboard/bible-reader";

export default async function BiblePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <BibleReader />;
}