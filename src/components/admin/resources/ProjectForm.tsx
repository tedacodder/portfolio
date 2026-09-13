"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { projectsAdmin, ApiError } from "@/lib/api/admin";
import { useToast } from "@/components/admin/Toast";
import { TextField, TextAreaField, NumberField, SelectField, CheckboxField, MultiCheckField } from "@/components/admin/fields";
import type { RawProject } from "@/types/backend-raw";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

export default function ProjectForm({
  project,
  technologyOptions,
}: {
  project?: RawProject;
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
    const input = {
      title: String(formData.get("title") ?? ""),
      slug: String(formData.get("slug") ?? "") || undefined,
      shortDescription: String(formData.get("shortDescription") ?? ""),
      description: String(formData.get("description") ?? "") || undefined,
      problem: String(formData.get("problem") ?? "") || undefined,
      solution: String(formData.get("solution") ?? "") || undefined,
      featured: formData.get("featured") === "on",
      status: String(formData.get("status") ?? "DRAFT") as RawProject["status"],
      startDate: String(formData.get("startDate") ?? "") || undefined,
      endDate: String(formData.get("endDate") ?? "") || undefined,
      githubUrl: String(formData.get("githubUrl") ?? "") || undefined,
      liveUrl: String(formData.get("liveUrl") ?? "") || undefined,
      coverImageUrl: String(formData.get("coverImageUrl") ?? "") || undefined,
      architectureDescription: String(formData.get("architectureDescription") ?? "") || undefined,
      displayOrder: Number(formData.get("displayOrder") ?? 0),
      technologyIds: formData.getAll("technologyIds").map(String),
    };

    try {
      if (project) {
        await projectsAdmin.update(project.id, input);
        notify("Project updated.");
        router.push("/admin/projects");
      } else {
        const created = await projectsAdmin.create(input);
        notify("Project created.");
        router.push(`/admin/projects/${created.id}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      <TextField label="Title" name="title" defaultValue={project?.title} required />
      <TextField label="Slug" name="slug" defaultValue={project?.slug} hint="Auto-generated from title if left blank" />
      <TextAreaField label="Short description" name="shortDescription" defaultValue={project?.shortDescription} rows={2} />
      <TextAreaField label="Description" name="description" defaultValue={project?.description ?? undefined} rows={6} />
      <TextAreaField label="Problem" name="problem" defaultValue={project?.problem ?? undefined} rows={4} />
      <TextAreaField label="Solution" name="solution" defaultValue={project?.solution ?? undefined} rows={4} />
      <SelectField label="Status" name="status" defaultValue={project?.status ?? "DRAFT"} options={STATUS_OPTIONS} />
      <CheckboxField label="Featured" name="featured" defaultChecked={project?.featured} />
      <TextField label="Start date" name="startDate" type="date" defaultValue={project?.startDate ?? undefined} />
      <TextField label="End date" name="endDate" type="date" defaultValue={project?.endDate ?? undefined} hint="Leave blank if ongoing" />
      <TextField label="GitHub URL" name="githubUrl" type="url" defaultValue={project?.githubUrl ?? undefined} />
      <TextField label="Live URL" name="liveUrl" type="url" defaultValue={project?.liveUrl ?? undefined} />
      <TextField label="Cover image URL" name="coverImageUrl" type="url" defaultValue={project?.coverImageUrl ?? undefined} />
      <TextAreaField
        label="Architecture description"
        name="architectureDescription"
        defaultValue={project?.architectureDescription ?? undefined}
        hint="Short prose summary shown alongside the architecture diagram"
      />
      <NumberField label="Display order" name="displayOrder" defaultValue={project?.displayOrder ?? 0} />
      <MultiCheckField
        label="Technologies"
        name="technologyIds"
        options={technologyOptions}
        defaultValues={project?.technologies.map((t) => t.id)}
      />

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-fit items-center border border-text px-5 py-2.5 font-mono text-xs text-text transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Save"}
      </button>
      {!project && (
        <p className="text-xs text-dim">
          After saving, you&rsquo;ll be able to build this project&rsquo;s architecture diagram.
        </p>
      )}
    </form>
  );
}
