"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { achievementsAdmin, ApiError } from "@/lib/api/admin";
import { useToast } from "@/components/admin/Toast";
import { TextField, TextAreaField, NumberField } from "@/components/admin/fields";
import type { RawAchievement } from "@/types/backend-raw";

export default function AchievementForm({ achievement }: { achievement?: RawAchievement }) {
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
      description: String(formData.get("description") ?? "") || undefined,
      organization: String(formData.get("organization") ?? "") || undefined,
      date: String(formData.get("date") ?? "") || undefined,
      url: String(formData.get("url") ?? "") || undefined,
      imageUrl: String(formData.get("imageUrl") ?? "") || undefined,
      displayOrder: Number(formData.get("displayOrder") ?? 0),
    };

    try {
      if (achievement) {
        await achievementsAdmin.update(achievement.id, input);
        notify("Achievement updated.");
      } else {
        await achievementsAdmin.create(input);
        notify("Achievement created.");
      }
      router.push("/admin/achievements");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-5">
      <TextField label="Title" name="title" defaultValue={achievement?.title} required />
      <TextAreaField label="Description" name="description" defaultValue={achievement?.description ?? undefined} />
      <TextField label="Organization" name="organization" defaultValue={achievement?.organization ?? undefined} />
      <TextField label="Date" name="date" type="date" defaultValue={achievement?.date ?? undefined} />
      <TextField label="URL" name="url" type="url" defaultValue={achievement?.url ?? undefined} />
      <TextField label="Image URL" name="imageUrl" type="url" defaultValue={achievement?.imageUrl ?? undefined} />
      <NumberField label="Display order" name="displayOrder" defaultValue={achievement?.displayOrder ?? 0} />

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
