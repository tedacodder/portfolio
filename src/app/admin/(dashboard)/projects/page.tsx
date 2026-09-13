"use client";

import Link from "next/link";
import { projectsAdmin } from "@/lib/api/admin";
import { useAdminList } from "@/components/admin/useAdminList";
import { useToast } from "@/components/admin/Toast";
import DataTable, { type Column } from "@/components/admin/DataTable";
import PageHeader from "@/components/admin/PageHeader";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import StatusBadge from "@/components/admin/StatusBadge";
import type { RawProject } from "@/types/backend-raw";

export default function ProjectsListPage() {
  const { notify } = useToast();
  const { data, pagination, status, error, setPage, reload } = useAdminList<RawProject>(
    async (p) => projectsAdmin.list({ page: p, limit: 20 })
  );

  const columns: Column<RawProject>[] = [
    { header: "Title", render: (row) => row.title },
    { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { header: "Featured", render: (row) => (row.featured ? "Yes" : "—"), className: "font-mono text-dim" },
    { header: "Technologies", render: (row) => row.technologies.map((t) => t.name).join(", ") || "—", className: "text-muted" },
  ];

  return (
    <div>
      <PageHeader title="Projects" action={{ href: "/admin/projects/new", label: "New project" }} />
      <DataTable
        rows={data}
        columns={columns}
        status={status}
        error={error}
        onRetry={reload}
        pagination={pagination}
        onPageChange={setPage}
        emptyMessage="No projects yet."
        actions={(row) => (
          <div className="flex flex-col gap-1.5">
            <Link href={`/admin/projects/${row.id}`} className="font-mono text-xs text-accent underline underline-offset-4">Edit</Link>
            <Link href={`/admin/projects/${row.id}/architecture`} className="font-mono text-xs text-accent underline underline-offset-4">Architecture</Link>
            <ConfirmDialog
              trigger={<button type="button" className="font-mono text-xs text-red-400 underline underline-offset-4">Delete</button>}
              title={`Delete "${row.title}"?`}
              description="This also removes its architecture diagram and technology links."
              onConfirm={async () => {
                await projectsAdmin.remove(row.id);
                notify("Project deleted.");
                reload();
              }}
            />
          </div>
        )}
      />
    </div>
  );
}
