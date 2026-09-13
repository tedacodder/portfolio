import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import SkillForm from "@/components/admin/resources/SkillForm";
import { getSkillById } from "@/lib/services/skills.service";
import { listTechnologies } from "@/lib/services/technologies.service";
import { NotFoundError } from "@/lib/errors/app-error";

export default async function EditSkillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [skill, { rows }] = await Promise.all([
    getSkillById(id),
    listTechnologies({ page: 1, limit: 200 }, {}),
  ]).catch((err) => {
    if (err instanceof NotFoundError) notFound();
    throw err;
  });
  return (
    <div>
      <PageHeader title="Edit skill" />
      <SkillForm skill={skill} technologyOptions={rows.map((t) => ({ value: t.id, label: t.name }))} />
    </div>
  );
}
