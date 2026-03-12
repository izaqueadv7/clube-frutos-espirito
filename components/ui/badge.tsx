import { cn } from "@/lib/utils";

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn("badge bg-accent-light text-ink", className)}>{children}</span>;
}
