"use client";

import Link from "next/link";
import { certificationsAdmin } from "@/lib/api/admin";
import { useAdminList } from "@/components/admin/useAdminList";
import { useToast } from "@/components/admin/Toast";
import DataTable, { type Column } from "@/components/admin/DataTable";
import PageHeader from "@/components/admin/PageHeader";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { RawCertification } from "@/lib/api/admin";

export default function CertificationsListPage() {
  const { notify } = useToast();
  const { data, status, error, reload } = useAdminList<RawCertification>(async () => {
    const rows = await certificationsAdmin.list();
    return { data: rows.data };
  });

  const columns: Column<RawCertification>[] = [
    { header: "Name", render: (row) => row.name },
    { header: "Issuer", render: (row) => row.issuer, className: "text-muted" },
    { header: "Issued", render: (row) => row.issuedAt ?? "—", className: "font-mono text-dim" },
    { header: "Expires", render: (row) => row.expiresAt ?? "—", className: "font-mono text-dim" },
  ];

  return (
    <div>
      <PageHeader title="Certifications" action={{ href: "/admin/certifications/new", label: "New certification" }} />
      <DataTable
        rows={data}
        columns={columns}
        status={status}
        error={error}
        onRetry={reload}
        emptyMessage="No certifications yet."
        actions={(row) => (
          <div className="flex gap-3">
            <Link href={`/admin/certifications/${row.id}`} className="font-mono text-xs text-accent underline underline-offset-4">Edit</Link>
            <ConfirmDialog
              trigger={<button type="button" className="font-mono text-xs text-red-400 underline underline-offset-4">Delete</button>}
              title={`Delete "${row.name}"?`}
              onConfirm={async () => {
                await certificationsAdmin.remove(row.id);
                notify("Certification deleted.");
                reload();
              }}
            />
          </div>
        )}
      />
    </div>
  );
}
