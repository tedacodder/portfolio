"use client";

import Link from "next/link";
import { achievementsAdmin } from "@/lib/api/admin";
import { useAdminList } from "@/components/admin/useAdminList";
import { useToast } from "@/components/admin/Toast";
import DataTable, { type Column } from "@/components/admin/DataTable";
import PageHeader from "@/components/admin/PageHeader";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { RawAchievement } from "@/types/backend-raw";

export default function AchievementsListPage() {
  const { notify } = useToast();
  const { data, status, error, reload } = useAdminList<RawAchievement>(async () => {
    const rows = await achievementsAdmin.list();
    return { data: rows.data };
  });

  const columns: Column<RawAchievement>[] = [
    { header: "Title", render: (row) => row.title },
    { header: "Organization", render: (row) => row.organization ?? "—", className: "text-muted" },
    { header: "Date", render: (row) => row.date ?? "—", className: "font-mono text-dim" },
  ];

  return (
    <div>
      <PageHeader title="Achievements" action={{ href: "/admin/achievements/new", label: "New achievement" }} />
      <DataTable
        rows={data}
        columns={columns}
        status={status}
        error={error}
        onRetry={reload}
        emptyMessage="No achievements yet."
        actions={(row) => (
          <div className="flex gap-3">
            <Link href={`/admin/achievements/${row.id}`} className="font-mono text-xs text-accent underline underline-offset-4">Edit</Link>
            <ConfirmDialog
              trigger={<button type="button" className="font-mono text-xs text-red-400 underline underline-offset-4">Delete</button>}
              title={`Delete "${row.title}"?`}
              onConfirm={async () => {
                await achievementsAdmin.remove(row.id);
                notify("Achievement deleted.");
                reload();
              }}
            />
          </div>
        )}
      />
    </div>
  );
}
