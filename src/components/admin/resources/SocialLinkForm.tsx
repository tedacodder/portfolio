"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { socialLinksAdmin, ApiError } from "@/lib/api/admin";
import { useToast } from "@/components/admin/Toast";
import { TextField, NumberField, CheckboxField } from "@/components/admin/fields";
import type { RawSocialLink } from "@/types/backend-raw";

export default function SocialLinkForm({ socialLink }: { socialLink?: RawSocialLink }) {
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
      platform: String(formData.get("platform") ?? ""),
      label: String(formData.get("label") ?? "") || undefined,
      url: String(formData.get("url") ?? ""),
      icon: String(formData.get("icon") ?? "") || undefined,
      displayOrder: Number(formData.get("displayOrder") ?? 0),
      visible: formData.get("visible") === "on",
    };

    try {
      if (socialLink) {
        await socialLinksAdmin.update(socialLink.id, input);
        notify("Social link updated.");
      } else {
        await socialLinksAdmin.create(input);
        notify("Social link created.");
      }
      router.push("/admin/social-links");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-5">
      <TextField label="Platform" name="platform" defaultValue={socialLink?.platform} required hint="e.g. GitHub, LinkedIn, X" />
      <TextField label="Label" name="label" defaultValue={socialLink?.label ?? undefined} hint="Optional display text" />
      <TextField label="URL" name="url" type="url" defaultValue={socialLink?.url} required />
      <TextField label="Icon" name="icon" defaultValue={socialLink?.icon ?? undefined} hint="Icon identifier used by the frontend" />
      <NumberField label="Display order" name="displayOrder" defaultValue={socialLink?.displayOrder ?? 0} />
      <CheckboxField label="Visible on public site" name="visible" defaultChecked={socialLink?.visible ?? true} />

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
