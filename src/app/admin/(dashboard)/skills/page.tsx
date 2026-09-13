"use client";

import Link from "next/link";
import { skillsAdmin, type RawSkill } from "@/lib/api/admin";
import { useAdminList } from "@/components/admin/useAdminList";
import { useToast } from "@/components/admin/Toast";
import DataTable, { type Column } from "@/components/admin/DataTable";
import PageHeader from "@/components/admin/PageHeader";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

export default function SkillsListPage() {
  const { notify } = useToast();
  const { data, status, error, reload } = useAdminList<RawSkill>(async () => {
    const rows = await skillsAdmin.list();
    return { data: rows.data };
  });

  const columns: Column<RawSkill>[] = [
    { header: "Name", render: (row) => row.name },
    { header: "Category", render: (row) => row.category, className: "text-muted" },
    { header: "Proficiency", render: (row) => (row.proficiency != null ? `${row.proficiency}%` : "—"), className: "font-mono text-dim" },
  ];

  return (
    <div>
      <PageHeader
        title="Skills"
        description="Proficiency ratings, optionally linked to a technology for the constellation view."
        action={{ href: "/admin/skills/new", label: "New skill" }}
      />
      <DataTable
        rows={data}
        columns={columns}
        status={status}
        error={error}
        onRetry={reload}
        emptyMessage="No skills yet."
        actions={(row) => (
          <div className="flex gap-3">
            <Link href={`/admin/skills/${row.id}`} className="font-mono text-xs text-accent underline underline-offset-4">Edit</Link>
            <ConfirmDialog
              trigger={<button type="button" className="font-mono text-xs text-red-400 underline underline-offset-4">Delete</button>}
              title={`Delete "${row.name}"?`}
              onConfirm={async () => {
                await skillsAdmin.remove(row.id);
                notify("Skill deleted.");
                reload();
              }}
            />
          </div>
        )}
      />
    </div>
  );
}
