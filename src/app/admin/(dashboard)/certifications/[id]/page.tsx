import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import CertificationForm from "@/components/admin/resources/CertificationForm";
import { getCertificationById } from "@/lib/services/certifications.service";
import { NotFoundError } from "@/lib/errors/app-error";

export default async function EditCertificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const certification = await getCertificationById(id).catch((err) => {
    if (err instanceof NotFoundError) notFound();
    throw err;
  });
  return (
    <div>
      <PageHeader title="Edit certification" />
      <CertificationForm certification={certification} />
    </div>
  );
}
