import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import SocialLinkForm from "@/components/admin/resources/SocialLinkForm";
import { getSocialLinkById } from "@/lib/services/social-links.service";
import { NotFoundError } from "@/lib/errors/app-error";

export default async function EditSocialLinkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const socialLink = await getSocialLinkById(id).catch((err) => {
    if (err instanceof NotFoundError) notFound();
    throw err;
  });
  return (
    <div>
      <PageHeader title="Edit social link" />
      <SocialLinkForm socialLink={socialLink} />
    </div>
  );
}
