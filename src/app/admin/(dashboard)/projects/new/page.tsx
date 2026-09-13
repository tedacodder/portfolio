import PageHeader from "@/components/admin/PageHeader";
import ProjectForm from "@/components/admin/resources/ProjectForm";
import { listTechnologies } from "@/lib/services/technologies.service";

export default async function NewProjectPage() {
  const { rows } = await listTechnologies({ page: 1, limit: 200 }, {});
  return (
    <div>
      <PageHeader title="New project" />
      <ProjectForm technologyOptions={rows.map((t) => ({ value: t.id, label: t.name }))} />
    </div>
  );
}
