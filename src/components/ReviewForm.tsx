"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { CheckCircle2, Star } from "lucide-react";
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
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

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
      <Field label="Your name (optional)" hint="Shown next to your review. Leave it blank to appear as Guest.">
        <input name="author" maxLength={60} defaultValue={defaultName} className={inputCls} />
      </Field>
      <Field label="Your rating" hint="Tap a star, 5 is the best.">
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
              aria-pressed={rating === n}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              className="rounded-md p-1 transition-transform active:scale-90"
            >
              <Star
                className={`h-9 w-9 transition-colors ${
                  n <= (hover || rating) ? "fill-amber-400 text-amber-400" : "fill-transparent text-muted-foreground/40"
                }`}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>
        <input type="hidden" name="rating" value={rating || ""} />
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
