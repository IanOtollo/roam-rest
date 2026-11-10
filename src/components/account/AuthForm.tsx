"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { signInAction, signUpAction, type AuthState } from "@/app/account/actions";
import { btnPrimary, Field, inputCls, Notice } from "@/components/admin/ui";

function Submit({ label, busy }: { label: string; busy: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
      {pending ? busy : label}
    </button>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.5 1.2-4 1.2-3.1 0-5.7-2.1-6.7-4.9H1.3v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
    </svg>
  );
}

/** Sign in or sign up. Accounts are optional: the page says so, and booking never needs one. */
export function AuthForm({ mode, next, google }: { mode: "sign-in" | "sign-up"; next: string; google: boolean }) {
  const signIn = mode === "sign-in";
  const [state, action] = useFormState<AuthState, FormData>(signIn ? signInAction : signUpAction, {});
  const q = next && next !== "/account" ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-5">
      {google && (
        <>
          <a
            href={`/api/auth/google${q}`}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium transition-colors hover:bg-muted active:scale-[0.98]"
          >
            <GoogleMark /> Continue with Google
          </a>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or use your email <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        {/* Hidden field that real people never fill in; bots usually do. */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        {!signIn && (
          <Field label="Your name (optional)">
            <input name="name" maxLength={60} autoComplete="name" className={inputCls} />
          </Field>
        )}
        <Field label="Email">
          <input name="email" type="email" required maxLength={254} autoComplete="email" className={inputCls} />
        </Field>
        <Field label="Password" hint={signIn ? undefined : "At least 8 characters."}>
          <input
            name="password"
            type="password"
            required
            minLength={signIn ? undefined : 8}
            maxLength={128}
            autoComplete={signIn ? "current-password" : "new-password"}
            className={inputCls}
          />
        </Field>
        {state.error && <Notice kind="error">{state.error}</Notice>}
        <Submit label={signIn ? "Sign in" : "Create account"} busy={signIn ? "Signing in…" : "Creating…"} />
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {signIn ? "New here? " : "Already have an account? "}
        <Link href={`/account/${signIn ? "sign-up" : "sign-in"}${q}`} className="text-foreground underline underline-offset-4">
          {signIn ? "Create an account" : "Sign in"}
        </Link>
      </p>
      <p className="text-center text-xs text-muted-foreground">An account is optional. You can always book without one.</p>
    </div>
  );
}
