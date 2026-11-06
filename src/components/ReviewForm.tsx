"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { CheckCircle2 } from "lucide-react";
import { submitReviewAction, type ReviewState } from "@/app/review/actions";
import { btnPrimary, Field, inputCls, Notice } from "@/components/admin/ui";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
      {pending ? "Sending…" : "Send my review"}
    </button>
  );
}

export function ReviewForm({ token, defaultName }: { token: string; defaultName: string }) {
  const [state, action] = useFormState<ReviewState, FormData>(submitReviewAction, {});
  const [text, setText] = useState("");

  if (state.done) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-accent" strokeWidth={1.5} />
        <h2 className="mt-4 font-serif text-2xl tracking-tight">Thank you</h2>
        <p className="mt-2 text-muted-foreground">
          Your review has been sent. It will appear on the website once the host has approved it.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5 rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
      <input type="hidden" name="token" value={token} />
      {/* Honeypot: invisible to people, tempting to bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <Field label="Your name" hint="Shown next to your review.">
        <input name="author" required minLength={2} maxLength={60} defaultValue={defaultName} className={inputCls} />
      </Field>
      <Field label="Your review">
        <textarea
          name="quote"
          required
          minLength={10}
          maxLength={600}
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What stood out about your stay?"
          className={`${inputCls} resize-y`}
        />
        <span className="mt-1.5 block text-right text-xs text-muted-foreground">{text.length} / 600</span>
      </Field>
      {state.error && <Notice kind="error">{state.error}</Notice>}
      <Submit />
    </form>
  );
}
