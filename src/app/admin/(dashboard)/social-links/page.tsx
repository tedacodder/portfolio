"use client";

import Link from "next/link";
import { socialLinksAdmin } from "@/lib/api/admin";
import { useAdminList } from "@/components/admin/useAdminList";
import { useToast } from "@/components/admin/Toast";
import DataTable, { type Column } from "@/components/admin/DataTable";
import PageHeader from "@/components/admin/PageHeader";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { RawSocialLink } from "@/types/backend-raw";

export default function SocialLinksListPage() {
  const { notify } = useToast();
  const { data, status, error, reload } = useAdminList<RawSocialLink>(async () => {
    const rows = await socialLinksAdmin.list();
    return { data: rows.data };
  });

  const columns: Column<RawSocialLink>[] = [
    { header: "Platform", render: (row) => row.platform },
    { header: "URL", render: (row) => <span className="text-muted">{row.url}</span> },
    {
      header: "Visible",
      render: (row) => (
        <span className={row.visible ? "text-accent" : "text-dim"}>{row.visible ? "Yes" : "Hidden"}</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Social Links" action={{ href: "/admin/social-links/new", label: "New link" }} />
      <DataTable
        rows={data}
        columns={columns}
        status={status}
        error={error}
        onRetry={reload}
        emptyMessage="No social links yet."
        actions={(row) => (
          <div className="flex gap-3">
            <button
              type="button"
              className="font-mono text-xs text-accent underline underline-offset-4"
              onClick={async () => {
                await socialLinksAdmin.update(row.id, { visible: !row.visible });
                notify(row.visible ? "Link hidden." : "Link shown.");
                reload();
              }}
            >
              {row.visible ? "Hide" : "Show"}
            </button>
            <Link href={`/admin/social-links/${row.id}`} className="font-mono text-xs text-accent underline underline-offset-4">Edit</Link>
            <ConfirmDialog
              trigger={<button type="button" className="font-mono text-xs text-red-400 underline underline-offset-4">Delete</button>}
              title={`Delete "${row.platform}"?`}
              onConfirm={async () => {
                await socialLinksAdmin.remove(row.id);
                notify("Social link deleted.");
                reload();
              }}
            />
          </div>
        )}
      />
    </div>
  );
}
