import type { Metadata } from "next";
import { getArticles, getProfile } from "@/lib/data";
import ArticleCard from "@/components/articles/ArticleCard";
import EmptyState from "@/components/ui/EmptyState";
import Section, { SectionKicker, SectionHeading } from "@/components/ui/Section";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return {
    title: "Articles",
    description: `Engineering notes by ${profile?.name ?? "the author"}.`,
  };
}

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <Section className="pt-32 md:pt-40">
      <SectionKicker>ARTICLES</SectionKicker>
      <SectionHeading>Engineering notes.</SectionHeading>
      <div className="mt-10">
        {articles.length === 0 ? (
          <EmptyState message="No articles published yet." />
        ) : (
          articles.map((article) => <ArticleCard key={article.id} article={article} />)
        )}
      </div>
    </Section>
  );
}
