"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import { submitContactForm } from "@/lib/api";
import { ApiError } from "@/lib/api/fetcher";

const schema = z.object({
  name: z.string().min(1, "Enter your name."),
  email: z.email("Enter a valid email."),
  subject: z.string().min(1, "Add a subject."),
  message: z.string().min(10, "Message is too short."),
  // Honeypot: real visitors never see or fill this field (hidden via CSS
  // below). If it comes back non-empty the backend silently discards the
  // submission as spam.
  website: z.string().optional(),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof schema>, string>>;

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return; // prevent duplicate submissions

    const formData = new FormData(e.currentTarget);
    const values = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
      website: String(formData.get("website") ?? ""),
    };

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FieldErrors;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");
    try {
      await submitContactForm(parsed.data);
      setStatus("success");
      e.currentTarget.reset();
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError && err.status === 429
          ? "Too many messages sent recently. Please try again in a few minutes."
          : "Something went wrong sending your message. Please try again."
      );
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-border p-8">
        <p className="font-display text-lg text-text">Message sent.</p>
        <p className="mt-2 text-sm text-muted">Thanks for reaching out — I&rsquo;ll reply soon.</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 font-mono text-xs text-accent underline underline-offset-4"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 sm:grid-cols-2">
      <Field label="Name" name="name" error={errors.name} />
      <Field label="Email" name="email" type="email" error={errors.email} />
      <Field label="Subject" name="subject" className="sm:col-span-2" error={errors.subject} />
      <TextField label="Message" name="message" error={errors.message} />

      {/* Honeypot field: visually hidden and unreachable by keyboard/AT, so
          real visitors never interact with it, but simple bots that fill in
          every field trip it. Never labeled "honeypot" — an obvious name
          defeats the purpose. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
        <label>
          Leave this field blank
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status === "error" && (
        <p className="sm:col-span-2 text-sm text-red-400">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="sm:col-span-2 mt-2 inline-flex w-fit items-center gap-2 border border-text px-6 py-3 font-body text-sm text-text transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  error,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-2 ${className ?? ""}`}>
      <span className="font-mono text-xs text-dim">{label.toUpperCase()}</span>
      <input
        type={type}
        name={name}
        aria-invalid={!!error}
        className="border border-border bg-transparent px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent"
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </label>
  );
}

function TextField({ label, name, error }: { label: string; name: string; error?: string }) {
  return (
    <label className="flex flex-col gap-2 sm:col-span-2">
      <span className="font-mono text-xs text-dim">{label.toUpperCase()}</span>
      <textarea
        name={name}
        rows={5}
        aria-invalid={!!error}
        className="resize-none border border-border bg-transparent px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent"
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </label>
  );
}
