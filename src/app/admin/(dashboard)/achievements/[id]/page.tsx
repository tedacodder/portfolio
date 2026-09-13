import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import AchievementForm from "@/components/admin/resources/AchievementForm";
import { getAchievementById } from "@/lib/services/achievements.service";
import { NotFoundError } from "@/lib/errors/app-error";

export default async function EditAchievementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const achievement = await getAchievementById(id).catch((err) => {
    if (err instanceof NotFoundError) notFound();
    throw err;
  });
  return (
    <div>
      <PageHeader title="Edit achievement" />
      <AchievementForm achievement={achievement} />
    </div>
  );
}
