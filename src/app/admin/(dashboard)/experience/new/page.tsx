import PageHeader from "@/components/admin/PageHeader";
import ExperienceForm from "@/components/admin/resources/ExperienceForm";
import { listTechnologies } from "@/lib/services/technologies.service";

export default async function NewExperiencePage() {
  const { rows } = await listTechnologies({ page: 1, limit: 200 }, {});
  return (
    <div>
      <PageHeader title="New experience" />
      <ExperienceForm technologyOptions={rows.map((t) => ({ value: t.id, label: t.name }))} />
    </div>
  );
}
