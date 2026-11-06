import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-medium uppercase tracking-widest text-accent">404</p>
      <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">We couldn&apos;t find that page</h1>
      <p className="mt-4 max-w-md text-muted-foreground">It may have moved, or the address may have changed.</p>
      <Link
        href="/#stays"
        className="mt-8 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
      >
        Browse stays
      </Link>
    </main>
  );
}
