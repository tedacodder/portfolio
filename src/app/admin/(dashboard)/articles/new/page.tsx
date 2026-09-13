import PageHeader from "@/components/admin/PageHeader";
import ArticleForm from "@/components/admin/resources/ArticleForm";

export default function NewArticlePage() {
  return (
    <div>
      <PageHeader title="New article" />
      <ArticleForm />
    </div>
  );
}
