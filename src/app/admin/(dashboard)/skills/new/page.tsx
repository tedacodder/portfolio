import PageHeader from "@/components/admin/PageHeader";
import SkillForm from "@/components/admin/resources/SkillForm";
import { listTechnologies } from "@/lib/services/technologies.service";

export default async function NewSkillPage() {
  const { rows } = await listTechnologies({ page: 1, limit: 200 }, {});
  return (
    <div>
      <PageHeader title="New skill" />
      <SkillForm technologyOptions={rows.map((t) => ({ value: t.id, label: t.name }))} />
    </div>
  );
}
