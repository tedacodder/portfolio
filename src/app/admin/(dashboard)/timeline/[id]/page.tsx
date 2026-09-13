import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import TimelineEntryForm from "@/components/admin/resources/TimelineEntryForm";
import { getTimelineEntryById } from "@/lib/services/timeline.service";
import { NotFoundError } from "@/lib/errors/app-error";

export default async function EditTimelineEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await getTimelineEntryById(id).catch((err) => {
    if (err instanceof NotFoundError) notFound();
    throw err;
  });
  return (
    <div>
      <PageHeader title="Edit timeline entry" />
      <TimelineEntryForm entry={entry} />
    </div>
  );
}
