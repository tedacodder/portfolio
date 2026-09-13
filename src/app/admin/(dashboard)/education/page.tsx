"use client";

import Link from "next/link";
import { educationAdmin } from "@/lib/api/admin";
import { useAdminList } from "@/components/admin/useAdminList";
import { useToast } from "@/components/admin/Toast";
import DataTable, { type Column } from "@/components/admin/DataTable";
import PageHeader from "@/components/admin/PageHeader";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { RawEducation } from "@/types/backend-raw";

export default function EducationListPage() {
  const { notify } = useToast();
  const { data, status, error, reload } = useAdminList<RawEducation>(async () => {
    const rows = await educationAdmin.list();
    return { data: rows.data };
  });

  const columns: Column<RawEducation>[] = [
    { header: "Institution", render: (row) => row.institution },
    { header: "Degree", render: (row) => row.degree, className: "text-muted" },
    { header: "Dates", render: (row) => `${row.startDate.slice(0, 4)}–${row.current ? "Now" : (row.endDate?.slice(0, 4) ?? "")}`, className: "font-mono text-dim" },
  ];

  return (
    <div>
      <PageHeader title="Education" action={{ href: "/admin/education/new", label: "New entry" }} />
      <DataTable
        rows={data}
        columns={columns}
        status={status}
        error={error}
        onRetry={reload}
        emptyMessage="No education entries yet."
        actions={(row) => (
          <div className="flex gap-3">
            <Link href={`/admin/education/${row.id}`} className="font-mono text-xs text-accent underline underline-offset-4">Edit</Link>
            <ConfirmDialog
              trigger={<button type="button" className="font-mono text-xs text-red-400 underline underline-offset-4">Delete</button>}
              title={`Delete "${row.institution}"?`}
              onConfirm={async () => {
                await educationAdmin.remove(row.id);
                notify("Education entry deleted.");
                reload();
              }}
            />
          </div>
        )}
      />
    </div>
  );
}
