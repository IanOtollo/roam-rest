"use client";

/** Full-viewport hero. It scrolls away normally; nothing fades, shrinks or shifts as the page moves. */
export function HeroShell({ copy, art }: { copy: React.ReactNode; art: React.ReactNode }) {
  return (
    <section id="top" className="flex min-h-[calc(100svh-4rem)] items-center px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl items-start gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="min-w-0 lg:pt-12">{copy}</div>
        <div className="min-w-0">{art}</div>
      </div>
    </section>
  );
}
