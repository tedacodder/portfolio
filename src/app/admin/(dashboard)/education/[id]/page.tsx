import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import EducationForm from "@/components/admin/resources/EducationForm";
import { getEducationById } from "@/lib/services/education.service";
import { NotFoundError } from "@/lib/errors/app-error";

export default async function EditEducationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const education = await getEducationById(id).catch((err) => {
    if (err instanceof NotFoundError) notFound();
    throw err;
  });
  return (
    <div>
      <PageHeader title="Edit education entry" />
      <EducationForm education={education} />
    </div>
  );
}
