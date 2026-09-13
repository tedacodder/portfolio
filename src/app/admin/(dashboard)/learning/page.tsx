"use client";

import Link from "next/link";
import { learningAdmin, type RawLearningTopic } from "@/lib/api/admin";
import { useAdminList } from "@/components/admin/useAdminList";
import { useToast } from "@/components/admin/Toast";
import DataTable, { type Column } from "@/components/admin/DataTable";
import PageHeader from "@/components/admin/PageHeader";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

export default function LearningListPage() {
  const { notify } = useToast();
  const { data, status, error, reload } = useAdminList<RawLearningTopic>(async () => {
    const rows = await learningAdmin.list();
    return { data: rows.data };
  });

  const columns: Column<RawLearningTopic>[] = [
    { header: "Topic", render: (row) => row.topic },
    { header: "Status", render: (row) => row.status, className: "font-mono text-dim" },
    { header: "Progress", render: (row) => `${row.progress}%`, className: "font-mono text-dim" },
  ];

  return (
    <div>
      <PageHeader title="Learning" action={{ href: "/admin/learning/new", label: "New topic" }} />
      <DataTable
        rows={data}
        columns={columns}
        status={status}
        error={error}
        onRetry={reload}
        emptyMessage="No learning topics yet."
        actions={(row) => (
          <div className="flex gap-3">
            <Link href={`/admin/learning/${row.id}`} className="font-mono text-xs text-accent underline underline-offset-4">Edit</Link>
            <ConfirmDialog
              trigger={<button type="button" className="font-mono text-xs text-red-400 underline underline-offset-4">Delete</button>}
              title={`Delete "${row.topic}"?`}
              onConfirm={async () => {
                await learningAdmin.remove(row.id);
                notify("Learning topic deleted.");
                reload();
              }}
            />
          </div>
        )}
      />
    </div>
  );
}
