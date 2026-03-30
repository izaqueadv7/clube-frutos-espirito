import { Card } from "@/components/ui/card";

export function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-extrabold text-primary">{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
    </Card>
  );
}
