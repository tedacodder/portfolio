"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { profileAdmin, ApiError } from "@/lib/api/admin";
import { useToast } from "@/components/admin/Toast";
import { TextField, TextAreaField } from "@/components/admin/fields";
import type { RawProfile } from "@/types/backend-raw";

export default function ProfileForm({ profile }: { profile: RawProfile | null }) {
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
      headline: String(formData.get("headline") ?? ""),
      shortBio: String(formData.get("shortBio") ?? ""),
      longBio: String(formData.get("longBio") ?? "") || undefined,
      location: String(formData.get("location") ?? "") || undefined,
      availabilityStatus: String(formData.get("availabilityStatus") ?? "") || undefined,
      profileImageUrl: String(formData.get("profileImageUrl") ?? "") || undefined,
      resumeUrl: String(formData.get("resumeUrl") ?? "") || undefined,
      githubUrl: String(formData.get("githubUrl") ?? "") || undefined,
      linkedinUrl: String(formData.get("linkedinUrl") ?? "") || undefined,
      email: String(formData.get("email") ?? ""),
      websiteUrl: String(formData.get("websiteUrl") ?? "") || undefined,
    };

    try {
      await profileAdmin.save(input);
      notify("Profile saved.");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-5">
      <TextField label="Name" name="name" defaultValue={profile?.name} required />
      <TextField label="Headline" name="headline" defaultValue={profile?.headline} required hint="Shown as the big hero statement, e.g. 'I build systems, not just websites.'" />
      <TextAreaField label="Short bio" name="shortBio" defaultValue={profile?.shortBio} rows={2} hint="Shown under the hero headline" />
      <TextAreaField label="Long bio" name="longBio" defaultValue={profile?.longBio ?? undefined} rows={6} hint="Shown in the About section" />
      <TextField label="Location" name="location" defaultValue={profile?.location ?? undefined} />
      <TextField label="Availability status" name="availabilityStatus" defaultValue={profile?.availabilityStatus ?? undefined} hint="e.g. 'Open to opportunities' — leave blank to hide the badge" />
      <TextField label="Profile image URL" name="profileImageUrl" type="url" defaultValue={profile?.profileImageUrl ?? undefined} />
      <TextField label="Resume URL" name="resumeUrl" type="url" defaultValue={profile?.resumeUrl ?? undefined} />
      <TextField label="GitHub URL" name="githubUrl" type="url" defaultValue={profile?.githubUrl ?? undefined} />
      <TextField label="LinkedIn URL" name="linkedinUrl" type="url" defaultValue={profile?.linkedinUrl ?? undefined} />
      <TextField label="Email" name="email" type="email" defaultValue={profile?.email} required />
      <TextField label="Website URL" name="websiteUrl" type="url" defaultValue={profile?.websiteUrl ?? undefined} />

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
