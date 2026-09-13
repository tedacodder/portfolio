import type { ActivitySummary } from "@/types/api";

// Per the brief: never invent statistics. If the backend has no real
// activity data, this renders nothing rather than fabricating numbers.
export default function ActivityVisualization({ activity }: { activity: ActivitySummary }) {
  if (!activity.hasData) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {typeof activity.contributionsLastYear === "number" && (
        <div className="border border-border p-6">
          <p className="font-display text-3xl text-text">{activity.contributionsLastYear}</p>
          <p className="mt-1 font-mono text-xs text-dim">CONTRIBUTIONS / YEAR</p>
        </div>
      )}
      {typeof activity.streakDays === "number" && (
        <div className="border border-border p-6">
          <p className="font-display text-3xl text-text">{activity.streakDays}</p>
          <p className="mt-1 font-mono text-xs text-dim">DAY STREAK</p>
        </div>
      )}
      {activity.topLanguages && activity.topLanguages.length > 0 && (
        <div className="border border-border p-6">
          <p className="font-mono text-xs text-dim">TOP LANGUAGES</p>
          <ul className="mt-2 space-y-1">
            {activity.topLanguages.slice(0, 3).map((lang) => (
              <li key={lang.name} className="text-sm text-muted">
                {lang.name} — {lang.percentage}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
