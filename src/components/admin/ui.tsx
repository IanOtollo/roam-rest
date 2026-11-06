import { cn } from "@/lib/utils";

/** Small building blocks shared by every admin screen, so they all look and behave alike. */

export const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm transition-colors hover:bg-muted active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

export const btnSmall =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs transition-colors hover:bg-muted active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";

export function Card({
  title,
  hint,
  children,
  className,
}: {
  title?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border/60 bg-card p-6 sm:p-8", className)}>
      {title && <h2 className="font-serif text-xl tracking-tight">{title}</h2>}
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      <div className={cn(title && "mt-6")}>{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function PageTitle({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl tracking-tight sm:text-4xl">{title}</h1>
        {hint && <p className="mt-2 max-w-xl text-muted-foreground">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function Notice({ kind = "info", children }: { kind?: "info" | "error" | "success"; children: React.ReactNode }) {
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        kind === "error" && "border-accent/40 bg-accent/10 text-foreground",
        kind === "success" && "border-border bg-muted text-foreground",
        kind === "info" && "border-border bg-muted/60 text-muted-foreground",
      )}
    >
      {children}
    </p>
  );
}

export const formatDay = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const nightsBetween = (a: string, b: string) =>
  Math.round((new Date(`${b}T00:00:00`).getTime() - new Date(`${a}T00:00:00`).getTime()) / 86_400_000);
