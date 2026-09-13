"use client";

import { useId, type ReactNode } from "react";

function FieldShell({
  label,
  error,
  hint,
  children,
  className,
  errorId,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  errorId?: string;
}) {
  return (
    <label className={`flex flex-col gap-2 ${className ?? ""}`}>
      <span className="font-mono text-xs text-dim">{label.toUpperCase()}</span>
      {children}
      {hint && !error && <span className="text-xs text-dim">{hint}</span>}
      {error && (
        <span id={errorId} role="alert" className="text-xs text-red-400">
          {error}
        </span>
      )}
    </label>
  );
}

const inputClass =
  "border border-border bg-transparent px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent disabled:opacity-50";

export function TextField({
  label,
  name,
  defaultValue,
  type = "text",
  error,
  hint,
  required,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}) {
  // FIX: inputs had no `aria-invalid`/`aria-describedby` wiring to their
  // error text, so a screen-reader user tabbing into a field with a
  // validation error got no indication anything was wrong — the error
  // text existed visually but wasn't announced or associated with the
  // input. `useId` gives each field instance a stable, unique id for the
  // association without the caller having to pass one in.
  const errorId = useId();
  return (
    <FieldShell label={label} error={error} hint={hint} className={className} errorId={errorId}>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={inputClass}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  name,
  defaultValue,
  rows = 5,
  error,
  hint,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  error?: string;
  hint?: string;
  className?: string;
}) {
  const errorId = useId();
  return (
    <FieldShell label={label} error={error} hint={hint} className={className} errorId={errorId}>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`resize-y ${inputClass}`}
      />
    </FieldShell>
  );
}

export function NumberField({
  label,
  name,
  defaultValue,
  min,
  max,
  error,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  error?: string;
  className?: string;
}) {
  const errorId = useId();
  return (
    <FieldShell label={label} error={error} className={className} errorId={errorId}>
      <input
        type="number"
        name={name}
        defaultValue={defaultValue}
        min={min}
        max={max}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={inputClass}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  options,
  error,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  error?: string;
  className?: string;
}) {
  const errorId = useId();
  return (
    <FieldShell label={label} error={error} className={className} errorId={errorId}>
      <select
        name={name}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={inputClass}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-panel">
            {opt.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({
  label,
  name,
  defaultChecked,
  onChange,
  className,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) {
  return (
    <label className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        onChange={onChange}
        className="h-4 w-4 accent-accent"
      />
      <span className="font-mono text-xs text-dim">{label.toUpperCase()}</span>
    </label>
  );
}

/** Checkbox list for many-to-many relations (e.g. project technologies). */
export function MultiCheckField({
  label,
  name,
  options,
  defaultValues = [],
  className,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValues?: string[];
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <span className="font-mono text-xs text-dim">{label.toUpperCase()}</span>
      {options.length === 0 ? (
        <p className="text-xs text-dim">Nothing to choose from yet.</p>
      ) : (
        <div className="flex flex-wrap gap-x-4 gap-y-2 border border-border p-3">
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                name={name}
                value={opt.value}
                defaultChecked={defaultValues.includes(opt.value)}
                className="h-3.5 w-3.5 accent-accent"
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

/** Line-per-entry textarea for simple string lists (e.g. experience highlights, article tags). */
export function ListField({
  label,
  name,
  defaultValues = [],
  hint,
  className,
}: {
  label: string;
  name: string;
  defaultValues?: string[];
  hint?: string;
  className?: string;
}) {
  return (
    <FieldShell label={label} hint={hint ?? "One per line"} className={className}>
      <textarea
        name={name}
        defaultValue={defaultValues.join("\n")}
        rows={4}
        className={`resize-y ${inputClass}`}
      />
    </FieldShell>
  );
}

export function parseListField(formData: FormData, name: string): string[] {
  const raw = String(formData.get(name) ?? "");
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
