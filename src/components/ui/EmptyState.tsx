export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-border px-6 py-10 text-center">
      <p className="font-mono text-xs text-dim">{message}</p>
    </div>
  );
}
