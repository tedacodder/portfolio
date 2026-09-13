"use client";

import Link from "next/link";
import { technologiesAdmin } from "@/lib/api/admin";
import { useAdminList } from "@/components/admin/useAdminList";
import { useToast } from "@/components/admin/Toast";
import DataTable, { type Column } from "@/components/admin/DataTable";
import PageHeader from "@/components/admin/PageHeader";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { RawTechnology } from "@/types/backend-raw";

export default function TechnologiesListPage() {
  const { notify } = useToast();
  const { data, pagination, status, error, setPage, reload } = useAdminList<RawTechnology>(
    async (p) => technologiesAdmin.list({ page: p, limit: 50 })
  );

  const columns: Column<RawTechnology>[] = [
    { header: "Name", render: (row) => row.name },
    { header: "Category", render: (row) => row.category ?? "—", className: "text-muted" },
    { header: "Featured", render: (row) => (row.featured ? "Yes" : "—"), className: "font-mono text-dim" },
    { header: "Order", render: (row) => row.displayOrder, className: "font-mono text-dim" },
  ];

  return (
    <div>
      <PageHeader
        title="Technologies"
        description="Powers the technology constellation and project/experience tagging."
        action={{ href: "/admin/technologies/new", label: "New technology" }}
      />
      <DataTable
        rows={data}
        columns={columns}
        status={status}
        error={error}
        onRetry={reload}
        pagination={pagination}
        onPageChange={setPage}
        emptyMessage="No technologies yet."
        actions={(row) => (
          <div className="flex gap-3">
            <Link href={`/admin/technologies/${row.id}`} className="font-mono text-xs text-accent underline underline-offset-4">Edit</Link>
            <ConfirmDialog
              trigger={<button type="button" className="font-mono text-xs text-red-400 underline underline-offset-4">Delete</button>}
              title={`Delete "${row.name}"?`}
              onConfirm={async () => {
                await technologiesAdmin.remove(row.id);
                notify("Technology deleted.");
                reload();
              }}
            />
          </div>
        )}
      />
    </div>
  );
}
