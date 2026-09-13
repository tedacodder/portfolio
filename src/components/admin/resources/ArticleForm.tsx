"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { articlesAdmin, ApiError } from "@/lib/api/admin";
import { useToast } from "@/components/admin/Toast";
import { TextField, TextAreaField, NumberField, SelectField, CheckboxField, ListField, parseListField } from "@/components/admin/fields";
import type { RawArticleRow } from "@/types/backend-raw";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

export default function ArticleForm({ article }: { article?: RawArticleRow }) {
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
    const readingTime = String(formData.get("readingTimeMinutes") ?? "");
    const input = {
      title: String(formData.get("title") ?? ""),
      slug: String(formData.get("slug") ?? "") || undefined,
      excerpt: String(formData.get("excerpt") ?? "") || undefined,
      content: String(formData.get("content") ?? ""),
      coverImageUrl: String(formData.get("coverImageUrl") ?? "") || undefined,
      status: String(formData.get("status") ?? "DRAFT") as RawArticleRow["status"],
      readingTimeMinutes: readingTime ? Number(readingTime) : undefined,
      featured: formData.get("featured") === "on",
      tags: parseListField(formData, "tags"),
    };

    try {
      if (article) {
        await articlesAdmin.update(article.id, input);
        notify("Article updated.");
      } else {
        await articlesAdmin.create(input);
        notify("Article created.");
      }
      router.push("/admin/articles");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      <TextField label="Title" name="title" defaultValue={article?.title} required />
      <TextField label="Slug" name="slug" defaultValue={article?.slug} hint="Auto-generated from title if left blank" />
      <TextAreaField label="Excerpt" name="excerpt" defaultValue={article?.excerpt ?? undefined} rows={2} />
      <TextAreaField
        label="Content (Markdown)"
        name="content"
        defaultValue={article?.content}
        rows={16}
        hint="Supports headings, lists, code blocks, links, tables (GFM)"
      />
      <TextField label="Cover image URL" name="coverImageUrl" type="url" defaultValue={article?.coverImageUrl ?? undefined} />
      <SelectField label="Status" name="status" defaultValue={article?.status ?? "DRAFT"} options={STATUS_OPTIONS} />
      <NumberField label="Reading time (minutes)" name="readingTimeMinutes" defaultValue={article?.readingTimeMinutes ?? undefined} min={1} />
      <CheckboxField label="Featured" name="featured" defaultChecked={article?.featured} />
      <ListField label="Tags" name="tags" defaultValues={article?.tags.map((t) => t.name)} />

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
