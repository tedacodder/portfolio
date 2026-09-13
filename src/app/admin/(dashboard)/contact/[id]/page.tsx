import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import ContactMessageActions from "@/components/admin/resources/ContactMessageActions";
import StatusBadge from "@/components/admin/StatusBadge";
import { getContactMessageById } from "@/lib/services/contact.service";
import { NotFoundError } from "@/lib/errors/app-error";

export default async function ContactMessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const message = await getContactMessageById(id).catch((err) => {
    if (err instanceof NotFoundError) notFound();
    throw err;
  });
  return (
    <div>
      <PageHeader
        title={message.subject || "Message"}
        action={
          <Link href="/admin/contact" className="inline-flex items-center border border-border px-4 py-2 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-accent">
            ← Back to inbox
          </Link>
        }
      />
      <div className="max-w-2xl border border-border p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-text">{message.name}</p>
            <p className="font-mono text-xs text-dim">{message.email}</p>
          </div>
          <StatusBadge status={message.status} />
        </div>
        <p className="mt-2 font-mono text-xs text-dim">
          {new Date(message.createdAt).toLocaleString()}
        </p>
        <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-text">{message.message}</p>
      </div>
      <div className="mt-4 max-w-2xl">
        <ContactMessageActions message={message} />
      </div>
    </div>
  );
}
