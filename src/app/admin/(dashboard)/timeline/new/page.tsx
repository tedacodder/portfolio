import PageHeader from "@/components/admin/PageHeader";
import TimelineEntryForm from "@/components/admin/resources/TimelineEntryForm";

export default function NewTimelineEntryPage() {
  return (
    <div>
      <PageHeader title="New timeline entry" />
      <TimelineEntryForm />
    </div>
  );
}
