import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Read-only row of golden stars (whole numbers). */
export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn("h-4 w-4", n <= value ? "fill-amber-400 text-amber-400" : "fill-transparent text-muted-foreground/40")}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}
