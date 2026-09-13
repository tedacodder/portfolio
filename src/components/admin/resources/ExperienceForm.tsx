"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { experiencesAdmin, ApiError } from "@/lib/api/admin";
import { useToast } from "@/components/admin/Toast";
import { TextField, TextAreaField, NumberField, CheckboxField, SelectField, MultiCheckField, ListField, parseListField } from "@/components/admin/fields";
import type { RawExperience } from "@/types/backend-raw";

const EMPLOYMENT_TYPES = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "FREELANCE", label: "Freelance" },
];

export default function ExperienceForm({
  experience,
  technologyOptions,
}: {
  experience?: RawExperience;
  technologyOptions: { value: string; label: string }[];
}) {
  const router = useRouter();
  const { notify } = useToast();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [current, setCurrent] = useState(experience?.current ?? false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const isCurrent = formData.get("current") === "on";
    const input = {
      company: String(formData.get("company") ?? ""),
      role: String(formData.get("role") ?? ""),
      employmentType: String(formData.get("employmentType") ?? "FULL_TIME") as RawExperience["employmentType"],
      location: String(formData.get("location") ?? "") || undefined,
      description: String(formData.get("description") ?? "") || undefined,
      startDate: String(formData.get("startDate") ?? ""),
      endDate: isCurrent ? undefined : String(formData.get("endDate") ?? "") || undefined,
      current: isCurrent,
      companyUrl: String(formData.get("companyUrl") ?? "") || undefined,
      displayOrder: Number(formData.get("displayOrder") ?? 0),
      highlights: parseListField(formData, "highlights"),
      technologyIds: formData.getAll("technologyIds").map(String),
    };

    try {
      if (experience) {
        await experiencesAdmin.update(experience.id, input);
        notify("Experience updated.");
      } else {
        await experiencesAdmin.create(input);
        notify("Experience created.");
      }
      router.push("/admin/experience");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-5">
      <TextField label="Company" name="company" defaultValue={experience?.company} required />
      <TextField label="Role" name="role" defaultValue={experience?.role} required />
      <SelectField
        label="Employment type"
        name="employmentType"
        defaultValue={experience?.employmentType ?? "FULL_TIME"}
        options={EMPLOYMENT_TYPES}
      />
      <TextField label="Location" name="location" defaultValue={experience?.location ?? undefined} />
      <TextAreaField label="Description" name="description" defaultValue={experience?.description ?? undefined} />
      <TextField label="Start date" name="startDate" type="date" defaultValue={experience?.startDate} required />
      <CheckboxField label="I currently work here" name="current" defaultChecked={current} onChange={(e) => setCurrent(e.target.checked)} />
      {!current && (
        <TextField label="End date" name="endDate" type="date" defaultValue={experience?.endDate ?? undefined} />
      )}
      <TextField label="Company URL" name="companyUrl" type="url" defaultValue={experience?.companyUrl ?? undefined} />
      <NumberField label="Display order" name="displayOrder" defaultValue={experience?.displayOrder ?? 0} />
      <ListField label="Highlights" name="highlights" defaultValues={experience?.highlights.map((h) => h.content)} />
      <MultiCheckField
        label="Technologies used"
        name="technologyIds"
        options={technologyOptions}
        defaultValues={experience?.technologies.map((t) => t.id)}
      />

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
