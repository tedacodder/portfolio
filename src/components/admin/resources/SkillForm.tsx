"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { skillsAdmin, ApiError, type RawSkill } from "@/lib/api/admin";
import { useToast } from "@/components/admin/Toast";
import { TextField, TextAreaField, NumberField, SelectField } from "@/components/admin/fields";

export default function SkillForm({
  skill,
  technologyOptions,
}: {
  skill?: RawSkill;
  technologyOptions: { value: string; label: string }[];
}) {
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
    const technologyId = String(formData.get("technologyId") ?? "");
    const proficiency = String(formData.get("proficiency") ?? "");
    const input = {
      name: String(formData.get("name") ?? ""),
      category: String(formData.get("category") ?? ""),
      description: String(formData.get("description") ?? "") || undefined,
      proficiency: proficiency ? Number(proficiency) : undefined,
      displayOrder: Number(formData.get("displayOrder") ?? 0),
      technologyId: technologyId || undefined,
    };

    try {
      if (skill) {
        await skillsAdmin.update(skill.id, input);
        notify("Skill updated.");
      } else {
        await skillsAdmin.create(input);
        notify("Skill created.");
      }
      router.push("/admin/skills");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-5">
      <TextField label="Name" name="name" defaultValue={skill?.name} required />
      <TextField label="Category" name="category" defaultValue={skill?.category} required />
      <TextAreaField label="Description" name="description" defaultValue={skill?.description ?? undefined} />
      <NumberField label="Proficiency (0-100)" name="proficiency" defaultValue={skill?.proficiency ?? undefined} min={0} max={100} />
      <NumberField label="Display order" name="displayOrder" defaultValue={skill?.displayOrder ?? 0} />
      <SelectField
        label="Linked technology"
        name="technologyId"
        defaultValue={skill?.technology?.id ?? ""}
        options={[{ value: "", label: "— None —" }, ...technologyOptions]}
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
