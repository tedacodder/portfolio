"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ApiError } from "@/lib/api/admin";
import { useToast } from "./Toast";

/**
 * Destructive-action confirmation modal. Used for every delete button in
 * the admin dashboard so a single click can never remove a record.
 *
 * FIX: `onConfirm` failures (e.g. the DELETE request comes back 409/500)
 * used to be silently swallowed — `pending` was reset in `finally`, but
 * nothing ever told the user the delete didn't happen, and the modal
 * stayed open with no explanation. Failures are now surfaced through the
 * shared toast system (already used for every other admin
 * success/failure message) and shown inline in the dialog itself.
 */
export default function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
}: {
  trigger: ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
}) {
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      // Move focus into the dialog so keyboard/screen-reader users land
      // somewhere sensible instead of the trigger they just activated.
      cancelButtonRef.current?.focus();
    }
  }, [open]);

  async function handleConfirm() {
    setPending(true);
    setError("");
    try {
      await onConfirm();
      setOpen(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to delete. Please try again.";
      setError(message);
      notify(message, "error");
    } finally {
      setPending(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape" && !pending) {
      setOpen(false);
    }
  }

  return (
    <>
      <span
        onClick={() => {
          // FIX: clear any error left over from a previous attempt here,
          // at the point the dialog is opened, instead of in the effect
          // above (setState directly in an effect body trips
          // react-hooks/set-state-in-effect). Same visible behavior —
          // this is the only place `open` ever transitions to true.
          setError("");
          setOpen(true);
        }}
      >
        {trigger}
      </span>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onKeyDown={handleKeyDown}
          ref={dialogRef}
        >
          <div className="w-full max-w-sm border border-border bg-panel p-6">
            <h2 id={titleId} className="font-display text-lg text-text">
              {title}
            </h2>
            {description && <p className="mt-2 text-sm text-muted">{description}</p>}
            <p className="mt-2 text-sm text-red-400">This action cannot be undone.</p>
            {error && (
              <p role="alert" className="mt-3 border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="border border-border px-4 py-2 font-mono text-xs text-muted hover:text-text"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={pending}
                className="border border-red-500/50 px-4 py-2 font-mono text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50"
              >
                {pending ? "Deleting…" : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
