"use client";

import Link from "next/link";
import { experiencesAdmin } from "@/lib/api/admin";
import { useAdminList } from "@/components/admin/useAdminList";
import { useToast } from "@/components/admin/Toast";
import DataTable, { type Column } from "@/components/admin/DataTable";
import PageHeader from "@/components/admin/PageHeader";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { RawExperience } from "@/types/backend-raw";

export default function ExperienceListPage() {
  const { notify } = useToast();
  const { data, status, error, reload } = useAdminList<RawExperience>(async () => {
    const rows = await experiencesAdmin.list();
    return { data: rows.data };
  });

  const columns: Column<RawExperience>[] = [
    { header: "Company", render: (row) => row.company },
    { header: "Role", render: (row) => row.role, className: "text-muted" },
    {
      header: "Dates",
      render: (row) => `${row.startDate.slice(0, 4)}–${row.current ? "Now" : (row.endDate?.slice(0, 4) ?? "")}`,
      className: "font-mono text-dim",
    },
  ];

  return (
    <div>
      <PageHeader title="Experience" action={{ href: "/admin/experience/new", label: "New role" }} />
      <DataTable
        rows={data}
        columns={columns}
        status={status}
        error={error}
        onRetry={reload}
        emptyMessage="No experience entries yet."
        actions={(row) => (
          <div className="flex gap-3">
            <Link href={`/admin/experience/${row.id}`} className="font-mono text-xs text-accent underline underline-offset-4">Edit</Link>
            <ConfirmDialog
              trigger={<button type="button" className="font-mono text-xs text-red-400 underline underline-offset-4">Delete</button>}
              title={`Delete "${row.role} at ${row.company}"?`}
              onConfirm={async () => {
                await experiencesAdmin.remove(row.id);
                notify("Experience entry deleted.");
                reload();
              }}
            />
          </div>
        )}
      />
    </div>
  );
}
