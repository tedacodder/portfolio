export default function Loading() {
  return (
    <div className="container-page pt-32 md:pt-40">
      <div className="space-y-4">
        <div className="h-3 w-24 animate-pulse bg-border" />
        <div className="h-10 w-2/3 animate-pulse bg-border" />
        <div className="h-4 w-1/2 animate-pulse bg-border" />
      </div>
      <div className="mt-14 space-y-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse border border-border bg-panel/40" />
        ))}
      </div>
    </div>
  );
}
