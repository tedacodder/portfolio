import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import LearningTopicForm from "@/components/admin/resources/LearningTopicForm";
import { getLearningTopicById } from "@/lib/services/learning.service";
import { listTechnologies } from "@/lib/services/technologies.service";
import { NotFoundError } from "@/lib/errors/app-error";

export default async function EditLearningTopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [topic, { rows }] = await Promise.all([
    getLearningTopicById(id),
    listTechnologies({ page: 1, limit: 200 }, {}),
  ]).catch((err) => {
    if (err instanceof NotFoundError) notFound();
    throw err;
  });
  return (
    <div>
      <PageHeader title="Edit learning topic" />
      <LearningTopicForm
        topic={topic}
        technologyOptions={rows.map((t) => ({ value: t.id, label: t.name }))}
        currentTechnologyIds={topic.technologies.map((t) => t.id)}
      />
    </div>
  );
}
