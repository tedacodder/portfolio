import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import PrincipleForm from "@/components/admin/resources/PrincipleForm";
import { getPrincipleById } from "@/lib/services/principles.service";
import { NotFoundError } from "@/lib/errors/app-error";

export default async function EditPrinciplePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const principle = await getPrincipleById(id).catch((err) => {
    if (err instanceof NotFoundError) notFound();
    throw err;
  });
  return (
    <div>
      <PageHeader title="Edit principle" />
      <PrincipleForm principle={principle} />
    </div>
  );
}
