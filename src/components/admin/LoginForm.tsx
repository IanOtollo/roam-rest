"use client";

import Image from "next/image";
import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "@/app/admin/actions";
import { brand } from "@/lib/property";
import { btnPrimary, Field, inputCls, Notice } from "./ui";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

/**
 * The whole sign-in screen: one full-height page (no scrolling) with the logo, the form and
 * a copyright line at the bottom.
 */
export function LoginForm() {
  const [state, action] = useFormState<LoginState, FormData>(loginAction, {});
  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-5 text-center">
            {/* Official logo; dark mode uses the light-lettered copy of the same artwork. */}
            <Image src="/brand/logo.png" alt={brand.name} width={900} height={754} priority className="mx-auto h-20 w-auto dark:hidden" />
            <Image
              src="/brand/logo-dark.png"
              alt={brand.name}
              width={900}
              height={754}
              priority
              className="mx-auto hidden h-20 w-auto dark:block"
            />
            <h1 className="mt-2 text-2xl tracking-tight">Admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to manage properties, bookings and reviews.</p>
          </div>
          <form action={action} className="space-y-4 rounded-2xl border border-border/60 bg-card p-6">
            <Field label="Email">
              <input name="email" type="email" required autoComplete="username" spellCheck={false} className={inputCls} />
            </Field>
            <Field label="Password">
              <input name="password" type="password" required autoComplete="current-password" className={inputCls} />
            </Field>
            {state.error && <Notice kind="error">{state.error}</Notice>}
            <Submit />
          </form>
        </div>
      </div>
      <p className="shrink-0 pb-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {brand.legalName}. All rights reserved.
      </p>
    </div>
  );
}
