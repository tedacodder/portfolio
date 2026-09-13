export default function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PUBLISHED: "border-accent/40 text-accent",
    DRAFT: "border-dim text-dim",
    ARCHIVED: "border-muted text-muted",
    UNREAD: "border-accent/40 text-accent",
    READ: "border-dim text-dim",
  };
  return (
    <span
      className={`inline-block border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
        styles[status] ?? "border-border text-muted"
      }`}
    >
      {status}
    </span>
  );
}
