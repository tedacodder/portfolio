"use client";

import Link from "next/link";
import { contactAdmin } from "@/lib/api/admin";
import { useAdminList } from "@/components/admin/useAdminList";
import { useToast } from "@/components/admin/Toast";
import DataTable, { type Column } from "@/components/admin/DataTable";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { ContactMessage } from "@/types/api";

export default function ContactMessagesListPage() {
  const { notify } = useToast();
  const { data, pagination, status, error, setPage, reload } = useAdminList<ContactMessage>(
    async (p) => contactAdmin.list({ page: p, limit: 20 })
  );

  const columns: Column<ContactMessage>[] = [
    { header: "From", render: (row) => `${row.name} <${row.email}>` },
    { header: "Subject", render: (row) => row.subject ?? "—", className: "text-muted" },
    { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { header: "Received", render: (row) => new Date(row.createdAt).toLocaleDateString(), className: "font-mono text-dim" },
  ];

  return (
    <div>
      <PageHeader title="Contact Messages" />
      <DataTable
        rows={data}
        columns={columns}
        status={status}
        error={error}
        onRetry={reload}
        pagination={pagination}
        onPageChange={setPage}
        emptyMessage="No messages yet."
        actions={(row) => (
          <div className="flex gap-3">
            <Link href={`/admin/contact/${row.id}`} className="font-mono text-xs text-accent underline underline-offset-4">View</Link>
            <ConfirmDialog
              trigger={<button type="button" className="font-mono text-xs text-red-400 underline underline-offset-4">Delete</button>}
              title={`Delete message from "${row.name}"?`}
              onConfirm={async () => {
                await contactAdmin.remove(row.id);
                notify("Message deleted.");
                reload();
              }}
            />
          </div>
        )}
      />
    </div>
  );
}
