export default function ErrorState({
  message = "Unable to load this section.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="border border-border px-6 py-10 text-center">
      <p className="mb-3 text-sm text-muted">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="font-mono text-xs text-accent underline underline-offset-4"
        >
          Try again
        </button>
      )}
    </div>
  );
}
