"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { certificationsAdmin, ApiError, type RawCertification } from "@/lib/api/admin";
import { useToast } from "@/components/admin/Toast";
import { TextField, TextAreaField } from "@/components/admin/fields";

export default function CertificationForm({ certification }: { certification?: RawCertification }) {
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
      issuer: String(formData.get("issuer") ?? ""),
      credentialId: String(formData.get("credentialId") ?? "") || undefined,
      credentialUrl: String(formData.get("credentialUrl") ?? "") || undefined,
      issuedAt: String(formData.get("issuedAt") ?? "") || undefined,
      expiresAt: String(formData.get("expiresAt") ?? "") || undefined,
      imageUrl: String(formData.get("imageUrl") ?? "") || undefined,
      description: String(formData.get("description") ?? "") || undefined,
    };

    try {
      if (certification) {
        await certificationsAdmin.update(certification.id, input);
        notify("Certification updated.");
      } else {
        await certificationsAdmin.create(input);
        notify("Certification created.");
      }
      router.push("/admin/certifications");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-5">
      <TextField label="Name" name="name" defaultValue={certification?.name} required />
      <TextField label="Issuer" name="issuer" defaultValue={certification?.issuer} required />
      <TextField label="Credential ID" name="credentialId" defaultValue={certification?.credentialId ?? undefined} />
      <TextField label="Credential URL" name="credentialUrl" type="url" defaultValue={certification?.credentialUrl ?? undefined} />
      <TextField label="Issued" name="issuedAt" type="date" defaultValue={certification?.issuedAt ?? undefined} />
      <TextField label="Expires" name="expiresAt" type="date" defaultValue={certification?.expiresAt ?? undefined} />
      <TextField label="Image URL" name="imageUrl" type="url" defaultValue={certification?.imageUrl ?? undefined} />
      <TextAreaField label="Description" name="description" defaultValue={certification?.description ?? undefined} />

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
