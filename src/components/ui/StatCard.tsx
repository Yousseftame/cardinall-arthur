import React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

export function StatGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <article className={cn("rounded-[24px] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-transform hover:-translate-y-1 duration-300", className)}>
      <div className="mb-6 flex items-center gap-2 text-[#2C0E11]">
        {Icon ? <Icon className="h-[18px] w-[18px]" strokeWidth={2} /> : null}
        <span className="text-sm font-semibold">{label}</span>
      </div>

      <div className="flex items-end justify-between gap-4">
        <p className="text-[2rem] leading-none font-bold tracking-tight text-[#2C0E11] sm:text-[2.35rem]">
          {value}
        </p>
      </div>
    </article>
  );
}
