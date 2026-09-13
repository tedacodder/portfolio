"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { educationAdmin, ApiError } from "@/lib/api/admin";
import { useToast } from "@/components/admin/Toast";
import { TextField, TextAreaField, NumberField, CheckboxField } from "@/components/admin/fields";
import type { RawEducation } from "@/types/backend-raw";

export default function EducationForm({ education }: { education?: RawEducation }) {
  const router = useRouter();
  const { notify } = useToast();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [current, setCurrent] = useState(education?.current ?? false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const isCurrent = formData.get("current") === "on";
    const input = {
      institution: String(formData.get("institution") ?? ""),
      degree: String(formData.get("degree") ?? ""),
      fieldOfStudy: String(formData.get("fieldOfStudy") ?? "") || undefined,
      description: String(formData.get("description") ?? "") || undefined,
      startDate: String(formData.get("startDate") ?? ""),
      endDate: isCurrent ? undefined : String(formData.get("endDate") ?? "") || undefined,
      current: isCurrent,
      location: String(formData.get("location") ?? "") || undefined,
      url: String(formData.get("url") ?? "") || undefined,
      displayOrder: Number(formData.get("displayOrder") ?? 0),
    };

    try {
      if (education) {
        await educationAdmin.update(education.id, input);
        notify("Education entry updated.");
      } else {
        await educationAdmin.create(input);
        notify("Education entry created.");
      }
      router.push("/admin/education");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-5">
      <TextField label="Institution" name="institution" defaultValue={education?.institution} required />
      <TextField label="Degree" name="degree" defaultValue={education?.degree} required />
      <TextField label="Field of study" name="fieldOfStudy" defaultValue={education?.fieldOfStudy ?? undefined} />
      <TextAreaField label="Description" name="description" defaultValue={education?.description ?? undefined} />
      <TextField label="Start date" name="startDate" type="date" defaultValue={education?.startDate} required />
      <CheckboxField
        label="Currently studying here"
        name="current"
        defaultChecked={current}
        onChange={(e) => setCurrent(e.target.checked)}
      />
      {!current && (
        <TextField label="End date" name="endDate" type="date" defaultValue={education?.endDate ?? undefined} />
      )}
      <TextField label="Location" name="location" defaultValue={education?.location ?? undefined} />
      <TextField label="URL" name="url" type="url" defaultValue={education?.url ?? undefined} />
      <NumberField label="Display order" name="displayOrder" defaultValue={education?.displayOrder ?? 0} />

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
