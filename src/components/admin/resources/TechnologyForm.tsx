"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { technologiesAdmin, ApiError } from "@/lib/api/admin";
import { useToast } from "@/components/admin/Toast";
import { TextField, TextAreaField, NumberField, CheckboxField } from "@/components/admin/fields";
import type { RawTechnology } from "@/types/backend-raw";

export default function TechnologyForm({ technology }: { technology?: RawTechnology }) {
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
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? "") || undefined,
      description: String(formData.get("description") ?? "") || undefined,
      icon: String(formData.get("icon") ?? "") || undefined,
      category: String(formData.get("category") ?? "") || undefined,
      featured: formData.get("featured") === "on",
      displayOrder: Number(formData.get("displayOrder") ?? 0),
    };

    try {
      if (technology) {
        await technologiesAdmin.update(technology.id, input);
        notify("Technology updated.");
      } else {
        await technologiesAdmin.create(input);
        notify("Technology created.");
      }
      router.push("/admin/technologies");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-5">
      <TextField label="Name" name="name" defaultValue={technology?.name} required />
      <TextField label="Slug" name="slug" defaultValue={technology?.slug} hint="Auto-generated from name if left blank" />
      <TextAreaField label="Description" name="description" defaultValue={technology?.description ?? undefined} />
      <TextField label="Icon" name="icon" defaultValue={technology?.icon ?? undefined} hint="Icon identifier used by the frontend" />
      <TextField label="Category" name="category" defaultValue={technology?.category ?? undefined} />
      <NumberField label="Display order" name="displayOrder" defaultValue={technology?.displayOrder ?? 0} />
      <CheckboxField label="Featured" name="featured" defaultChecked={technology?.featured} />

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
