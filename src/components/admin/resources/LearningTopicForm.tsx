"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { learningAdmin, ApiError, type RawLearningTopic } from "@/lib/api/admin";
import { useToast } from "@/components/admin/Toast";
import { TextField, TextAreaField, NumberField, SelectField, MultiCheckField } from "@/components/admin/fields";

const STATUS_OPTIONS = [
  { value: "PLANNED", label: "Planned" },
  { value: "LEARNING", label: "Learning" },
  { value: "PAUSED", label: "Paused" },
  { value: "COMPLETED", label: "Completed" },
];

export default function LearningTopicForm({
  topic,
  technologyOptions,
  currentTechnologyIds,
}: {
  topic?: RawLearningTopic;
  technologyOptions: { value: string; label: string }[];
  currentTechnologyIds?: string[];
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
      topic: String(formData.get("topic") ?? ""),
      description: String(formData.get("description") ?? "") || undefined,
      progress: Number(formData.get("progress") ?? 0),
      status: String(formData.get("status") ?? "PLANNED") as RawLearningTopic["status"],
      displayOrder: Number(formData.get("displayOrder") ?? 0),
      startedAt: String(formData.get("startedAt") ?? "") || undefined,
      targetDate: String(formData.get("targetDate") ?? "") || undefined,
      technologyIds: formData.getAll("technologyIds").map(String),
    };

    try {
      if (topic) {
        await learningAdmin.update(topic.id, input);
        notify("Learning topic updated.");
      } else {
        await learningAdmin.create(input);
        notify("Learning topic created.");
      }
      router.push("/admin/learning");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-5">
      <TextField label="Topic" name="topic" defaultValue={topic?.topic} required />
      <TextAreaField label="Description" name="description" defaultValue={topic?.description ?? undefined} />
      <NumberField label="Progress (0-100)" name="progress" defaultValue={topic?.progress ?? 0} min={0} max={100} />
      <SelectField label="Status" name="status" defaultValue={topic?.status ?? "PLANNED"} options={STATUS_OPTIONS} />
      <TextField label="Started" name="startedAt" type="date" defaultValue={topic?.startedAt ?? undefined} />
      <TextField label="Target date" name="targetDate" type="date" defaultValue={topic?.targetDate ?? undefined} />
      <NumberField label="Display order" name="displayOrder" defaultValue={topic?.displayOrder ?? 0} />
      <MultiCheckField
        label="Related technologies"
        name="technologyIds"
        options={technologyOptions}
        defaultValues={currentTechnologyIds}
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
