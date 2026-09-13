import PageHeader from "@/components/admin/PageHeader";
import LearningTopicForm from "@/components/admin/resources/LearningTopicForm";
import { listTechnologies } from "@/lib/services/technologies.service";

export default async function NewLearningTopicPage() {
  const { rows } = await listTechnologies({ page: 1, limit: 200 }, {});
  return (
    <div>
      <PageHeader title="New learning topic" />
      <LearningTopicForm technologyOptions={rows.map((t) => ({ value: t.id, label: t.name }))} />
    </div>
  );
}
