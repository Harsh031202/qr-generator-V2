import * as React from "react";
import { cn } from "@/lib/utils";

interface ShellProps {
  children: React.ReactNode;
  className?: string;
}

export function Shell({ children, className }: ShellProps) {
  return (
    <div
      className={cn(
        "min-h-[calc(100vh-3.25rem)] w-full max-w-[1440px] mx-auto px-4 py-6 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </div>
  );
}
