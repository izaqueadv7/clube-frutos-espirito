"use client";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const styles = {
    primary:
      "bg-primary text-white hover:bg-primary-dark",
    secondary:
      "bg-white text-primary hover:bg-slate-100 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800",
    ghost:
      "bg-white text-primary border border-primary/30 hover:bg-[rgba(46,125,50,0.08)] dark:bg-zinc-950 dark:text-white dark:border-white/20 dark:hover:bg-zinc-900"
  }[variant];

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold transition focus:outline-none focus:ring-2 focus:ring-[rgba(46,125,50,0.25)] disabled:cursor-not-allowed disabled:opacity-60",
        styles,
        className
      )}
      {...props}
    />
  );
}