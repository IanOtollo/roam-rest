"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ease } from "@/lib/utils";
import { btnPrimary, btnSecondary } from "./ui";

type Ask = { title: string; body?: string; confirmLabel?: string };

/**
 * An "Are you sure?" dialog in the site's own style (native confirm() boxes can be blocked by
 * some phone browsers, which would let a delete through unasked or never fire at all).
 *
 *   const { confirm, dialog } = useConfirm();
 *   onClick={async () => (await confirm({ title: "Delete this?" })) && doIt()}
 *   ...render {dialog} once in the component.
 */
export function useConfirm() {
  const [ask, setAsk] = useState<(Ask & { resolve: (ok: boolean) => void }) | null>(null);

  const confirm = useCallback((opts: Ask) => new Promise<boolean>((resolve) => setAsk({ ...opts, resolve })), []);
  const answer = (ok: boolean) => {
    ask?.resolve(ok);
    setAsk(null);
  };

  const dialog = <Dialog ask={ask} onAnswer={answer} />;
  return { confirm, dialog };
}

function Dialog({ ask, onAnswer }: { ask: Ask | null; onAnswer: (ok: boolean) => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!ask) return;
    cancelRef.current?.focus(); // the safe choice is focused first
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onAnswer(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ask, onAnswer]);

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {ask && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => e.target === e.currentTarget && onAnswer(false)}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease }}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8"
          >
            <h2 id="confirm-title" className="font-serif text-xl tracking-tight">
              {ask.title}
            </h2>
            {ask.body && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{ask.body}</p>}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button ref={cancelRef} type="button" className={btnSecondary} onClick={() => onAnswer(false)}>
                Keep it
              </button>
              <button type="button" className={btnPrimary} onClick={() => onAnswer(true)}>
                {ask.confirmLabel ?? "Yes, continue"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
