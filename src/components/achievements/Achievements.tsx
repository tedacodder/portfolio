import type { Achievement } from "@/types/api";

export default function Achievements({ achievements }: { achievements: Achievement[] }) {
  if (achievements.length === 0) return null;

  return (
    <ul className="divide-y divide-border border-y border-border">
      {achievements.map((item) => (
        <li key={item.id} className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <p className="font-body text-sm text-text">{item.title}</p>
            {item.organization && (
              <p className="mt-0.5 font-mono text-xs text-dim">{item.organization}</p>
            )}
          </div>
          {item.date && <p className="font-mono text-xs text-muted">{item.date}</p>}
        </li>
      ))}
    </ul>
  );
}
