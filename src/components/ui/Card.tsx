import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-brand-border bg-white shadow-[0_8px_24px_rgba(26,43,75,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}
