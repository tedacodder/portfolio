"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { contactAdmin, ApiError } from "@/lib/api/admin";
import { useToast } from "@/components/admin/Toast";
import type { RawContactMessage } from "@/types/backend-raw";

export default function ContactMessageActions({ message }: { message: RawContactMessage }) {
  const router = useRouter();
  const { notify } = useToast();
  const [pending, setPending] = useState(false);

  // Viewing the message marks it read, same as any inbox.
  useEffect(() => {
    if (message.status === "UNREAD") {
      contactAdmin.updateStatus(message.id, "READ").catch(() => {
        // Non-critical — the list will just keep showing it as unread.
      });
    }
  }, [message.id, message.status]);

  async function setStatus(status: "READ" | "ARCHIVED" | "UNREAD") {
    setPending(true);
    try {
      await contactAdmin.updateStatus(message.id, status);
      notify(`Marked as ${status.toLowerCase()}.`);
      router.refresh();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed to update.", "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex gap-3">
      {message.status !== "ARCHIVED" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => setStatus("ARCHIVED")}
          className="border border-border px-4 py-2 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
        >
          Archive
        </button>
      )}
      {message.status === "ARCHIVED" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => setStatus("READ")}
          className="border border-border px-4 py-2 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
        >
          Move back to inbox
        </button>
      )}
    </div>
  );
}
