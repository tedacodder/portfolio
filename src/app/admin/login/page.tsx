"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { adminLogin, ApiError } from "@/lib/api/admin";

const schema = z.object({
  email: z.email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const formData = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await adminLogin(parsed.data);
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "Invalid email or password."
          : err instanceof ApiError && err.status === 429
            ? "Too many attempts. Please wait a moment and try again."
            : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-6 text-text">
      <div className="w-full max-w-sm border border-border bg-panel p-8">
        <p className="font-mono text-xs text-accent">ADMIN</p>
        <h1 className="mt-2 font-display text-2xl text-text">Sign in</h1>

        <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="font-mono text-xs text-dim">EMAIL</span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              className="border border-border bg-transparent px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-xs text-dim">PASSWORD</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              className="border border-border bg-transparent px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex items-center justify-center border border-text px-6 py-3 font-body text-sm text-text transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
