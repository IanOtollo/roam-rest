"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { cn, ease } from "@/lib/utils";
import { brand } from "@/lib/property";
import { SunsetToggle } from "@/components/ui/SunsetToggle";
import { ProfileMenu } from "./ProfileMenu";

/**
 * Sticky, blurred top bar. Pages pass their own actions (e.g. Share / Reserve) as children.
 * `back` adds a back link at the far left, which stays in reach through the whole page.
 */
export function Navbar({
  children,
  back,
}: {
  children?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4">
          {back && (
            <Link
              href={back.href}
              aria-label={back.label}
              className="group flex items-center gap-2 rounded-full border border-border bg-card p-2.5 text-sm transition-colors hover:bg-muted active:scale-[0.98] sm:py-2 sm:pl-3 sm:pr-4"
            >
              <ArrowLeft className="arrow-left h-4 w-4" />
              <span className="hidden sm:inline">{back.label}</span>
            </Link>
          )}
          <Link href="/" className="flex items-center gap-2.5">
            {/* The logo's lettering is black, so dark mode uses a light-lettered copy of the same artwork. */}
            <Image
              src="/brand/logo-mark.png"
              alt=""
              width={480}
              height={344}
              priority
              className="h-9 w-auto dark:hidden"
            />
            <Image
              src="/brand/logo-mark-dark.png"
              alt=""
              width={480}
              height={344}
              priority
              className="hidden h-9 w-auto dark:block"
            />
            {/* With a back button on a narrow screen, the logo alone keeps the bar uncluttered. */}
            <span className={cn("font-serif text-xl tracking-tight", back && "hidden sm:inline")}>{brand.name}</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {children}
          {/* Toggle and profile sit together, with a comfortable gap between them. */}
          <div className="flex items-center gap-5">
            <SunsetToggle className="hidden sm:block" />
            <ProfileMenu />
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
