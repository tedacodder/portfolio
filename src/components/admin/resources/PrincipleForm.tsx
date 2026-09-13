"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { principlesAdmin, ApiError } from "@/lib/api/admin";
import { useToast } from "@/components/admin/Toast";
import { TextField, TextAreaField, NumberField } from "@/components/admin/fields";
import type { RawPrinciple } from "@/types/backend-raw";

export default function PrincipleForm({ principle }: { principle?: RawPrinciple }) {
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
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      displayOrder: Number(formData.get("displayOrder") ?? 0),
    };

    try {
      if (principle) {
        await principlesAdmin.update(principle.id, input);
        notify("Principle updated.");
      } else {
        await principlesAdmin.create(input);
        notify("Principle created.");
      }
      router.push("/admin/principles");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-5">
      <TextField label="Title" name="title" defaultValue={principle?.title} required />
      <TextAreaField label="Description" name="description" defaultValue={principle?.description} />
      <NumberField label="Display order" name="displayOrder" defaultValue={principle?.displayOrder ?? 0} />

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center border border-text px-5 py-2.5 font-mono text-xs text-text transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
