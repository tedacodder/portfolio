"use client";

import Link from "next/link";
import { timelineAdmin } from "@/lib/api/admin";
import { useAdminList } from "@/components/admin/useAdminList";
import { useToast } from "@/components/admin/Toast";
import DataTable, { type Column } from "@/components/admin/DataTable";
import PageHeader from "@/components/admin/PageHeader";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { RawTimelineEntry } from "@/lib/api/admin";

export default function TimelineListPage() {
  const { notify } = useToast();
  const { data, status, error, reload } = useAdminList<RawTimelineEntry>(async () => {
    const rows = await timelineAdmin.list();
    return { data: rows.data };
  });

  const columns: Column<RawTimelineEntry>[] = [
    { header: "Order", render: (row) => row.displayOrder, className: "font-mono text-dim" },
    { header: "Year/Label", render: (row) => row.yearOrLabel, className: "font-mono text-dim" },
    { header: "Title", render: (row) => row.title },
  ];

  return (
    <div>
      <PageHeader title="Timeline" action={{ href: "/admin/timeline/new", label: "New entry" }} />
      <DataTable
        rows={data}
        columns={columns}
        status={status}
        error={error}
        onRetry={reload}
        emptyMessage="No timeline entries yet."
        actions={(row) => (
          <div className="flex gap-3">
            <Link href={`/admin/timeline/${row.id}`} className="font-mono text-xs text-accent underline underline-offset-4">Edit</Link>
            <ConfirmDialog
              trigger={<button type="button" className="font-mono text-xs text-red-400 underline underline-offset-4">Delete</button>}
              title={`Delete "${row.title}"?`}
              onConfirm={async () => {
                await timelineAdmin.remove(row.id);
                notify("Timeline entry deleted.");
                reload();
              }}
            />
          </div>
        )}
      />
    </div>
  );
}
