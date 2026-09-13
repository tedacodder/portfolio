import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import ArticleForm from "@/components/admin/resources/ArticleForm";
import { getArticleById } from "@/lib/services/articles.service";
import { NotFoundError } from "@/lib/errors/app-error";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticleById(id).catch((err) => {
    if (err instanceof NotFoundError) notFound();
    throw err;
  });
  return (
    <div>
      <PageHeader title="Edit article" />
      <ArticleForm article={article} />
    </div>
  );
}
