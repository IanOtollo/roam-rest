"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccount } from "./AccountProvider";

/** A heart to save a stay. Signed-out visitors are taken to sign in; nothing else about the site changes. */
export function SaveButton({ slug, title, className }: { slug: string; title: string; className?: string }) {
  const { isSaved, toggleSaved } = useAccount();
  const on = isSaved(slug);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${title} from saved stays` : `Save ${title}`}
      onClick={(e) => {
        // The card around it is a link; saving must not open the stay.
        e.preventDefault();
        e.stopPropagation();
        void toggleSaved(slug);
      }}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-background/85 shadow-sm backdrop-blur-sm transition-transform hover:scale-110 active:scale-95 sm:h-9 sm:w-9",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4", on ? "fill-rose-500 text-rose-500" : "text-foreground")} strokeWidth={1.75} />
    </button>
  );
}
