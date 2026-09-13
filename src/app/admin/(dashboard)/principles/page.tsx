"use client";

import { principlesAdmin } from "@/lib/api/admin";
import { useAdminList } from "@/components/admin/useAdminList";
import { useToast } from "@/components/admin/Toast";
import DataTable, { type Column } from "@/components/admin/DataTable";
import PageHeader from "@/components/admin/PageHeader";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Link from "next/link";
import type { RawPrinciple } from "@/types/backend-raw";

export default function PrinciplesListPage() {
  const { notify } = useToast();
  const { data, status, error, reload } = useAdminList<RawPrinciple>(async () => {
    const rows = await principlesAdmin.list();
    return { data: rows.data };
  });

  const columns: Column<RawPrinciple>[] = [
    { header: "Order", render: (row) => row.displayOrder, className: "font-mono text-dim" },
    { header: "Title", render: (row) => row.title },
    {
      header: "Description",
      render: (row) => <span className="line-clamp-2 max-w-md text-muted">{row.description}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Principles"
        description="Cards shown in the About section, ordered by 'Order'."
        action={{ href: "/admin/principles/new", label: "New principle" }}
      />
      <DataTable
        rows={data}
        columns={columns}
        status={status}
        error={error}
        onRetry={reload}
        emptyMessage="No principles yet."
        actions={(row) => (
          <div className="flex gap-3">
            <Link href={`/admin/principles/${row.id}`} className="font-mono text-xs text-accent underline underline-offset-4">
              Edit
            </Link>
            <ConfirmDialog
              trigger={<button type="button" className="font-mono text-xs text-red-400 underline underline-offset-4">Delete</button>}
              title={`Delete "${row.title}"?`}
              onConfirm={async () => {
                await principlesAdmin.remove(row.id);
                notify("Principle deleted.");
                reload();
              }}
            />
          </div>
        )}
      />
    </div>
  );
}
