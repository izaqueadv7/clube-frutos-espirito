"use client";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const styles = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    secondary: "bg-accent text-ink hover:bg-accent-dark",
    ghost: "bg-white dark:bg-zinc-950 text-primary border border-primary/30 hover:bg-red-50 dark:hover:bg-zinc-900"
  }[variant];

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold transition focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60",
        styles,
        className
      )}
      {...props}
    />
  );
}
