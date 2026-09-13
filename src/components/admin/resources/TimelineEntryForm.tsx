"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { timelineAdmin, ApiError, type RawTimelineEntry } from "@/lib/api/admin";
import { useToast } from "@/components/admin/Toast";
import { TextField, TextAreaField, NumberField } from "@/components/admin/fields";

export default function TimelineEntryForm({ entry }: { entry?: RawTimelineEntry }) {
  const router = useRouter();
  const { notify } = useToast();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const input = {
      yearOrLabel: String(formData.get("yearOrLabel") ?? ""),
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? "") || undefined,
      date: String(formData.get("date") ?? "") || undefined,
      displayOrder: Number(formData.get("displayOrder") ?? 0),
    };

    try {
      if (entry) {
        await timelineAdmin.update(entry.id, input);
        notify("Timeline entry updated.");
      } else {
        await timelineAdmin.create(input);
        notify("Timeline entry created.");
      }
      router.push("/admin/timeline");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-5">
      <TextField label="Year / Label" name="yearOrLabel" defaultValue={entry?.yearOrLabel} required hint="e.g. 2024 or 'Early Career'" />
      <TextField label="Title" name="title" defaultValue={entry?.title} required />
      <TextAreaField label="Description" name="description" defaultValue={entry?.description ?? undefined} />
      <TextField label="Date" name="date" type="date" defaultValue={entry?.date ?? undefined} />
      <NumberField label="Display order" name="displayOrder" defaultValue={entry?.displayOrder ?? 0} />

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-fit items-center border border-text px-5 py-2.5 font-mono text-xs text-text transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
