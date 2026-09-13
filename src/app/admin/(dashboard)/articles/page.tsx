"use client";

import Link from "next/link";
import { articlesAdmin } from "@/lib/api/admin";
import { useAdminList } from "@/components/admin/useAdminList";
import { useToast } from "@/components/admin/Toast";
import DataTable, { type Column } from "@/components/admin/DataTable";
import PageHeader from "@/components/admin/PageHeader";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import StatusBadge from "@/components/admin/StatusBadge";
import type { RawArticle } from "@/types/backend-raw";

export default function ArticlesListPage() {
  const { notify } = useToast();
  const { data, pagination, status, error, setPage, reload } = useAdminList<RawArticle>(
    async (p) => articlesAdmin.list({ page: p, limit: 20 })
  );

  const columns: Column<RawArticle>[] = [
    { header: "Title", render: (row) => row.title },
    { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { header: "Featured", render: (row) => (row.featured ? "Yes" : "—"), className: "font-mono text-dim" },
  ];

  return (
    <div>
      <PageHeader title="Articles" action={{ href: "/admin/articles/new", label: "New article" }} />
      <DataTable
        rows={data}
        columns={columns}
        status={status}
        error={error}
        onRetry={reload}
        pagination={pagination}
        onPageChange={setPage}
        emptyMessage="No articles yet."
        actions={(row) => (
          <div className="flex gap-3">
            <Link href={`/admin/articles/${row.id}`} className="font-mono text-xs text-accent underline underline-offset-4">Edit</Link>
            <ConfirmDialog
              trigger={<button type="button" className="font-mono text-xs text-red-400 underline underline-offset-4">Delete</button>}
              title={`Delete "${row.title}"?`}
              onConfirm={async () => {
                await articlesAdmin.remove(row.id);
                notify("Article deleted.");
                reload();
              }}
            />
          </div>
        )}
      />
    </div>
  );
}
