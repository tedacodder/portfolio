import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import ExperienceForm from "@/components/admin/resources/ExperienceForm";
import { getExperienceById } from "@/lib/services/experiences.service";
import { listTechnologies } from "@/lib/services/technologies.service";
import { NotFoundError } from "@/lib/errors/app-error";

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [experience, { rows }] = await Promise.all([
    getExperienceById(id),
    listTechnologies({ page: 1, limit: 200 }, {}),
  ]).catch((err) => {
    if (err instanceof NotFoundError) notFound();
    throw err;
  });
  return (
    <div>
      <PageHeader title="Edit experience" />
      <ExperienceForm experience={experience} technologyOptions={rows.map((t) => ({ value: t.id, label: t.name }))} />
    </div>
  );
}
