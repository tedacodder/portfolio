import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import TechnologyForm from "@/components/admin/resources/TechnologyForm";
import { getTechnologyById } from "@/lib/services/technologies.service";
import { NotFoundError } from "@/lib/errors/app-error";

export default async function EditTechnologyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const technology = await getTechnologyById(id).catch((err) => {
    if (err instanceof NotFoundError) notFound();
    throw err;
  });
  return (
    <div>
      <PageHeader title="Edit technology" />
      <TechnologyForm technology={technology} />
    </div>
  );
}
