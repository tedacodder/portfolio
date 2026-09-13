import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import readingTime from "reading-time";
import { getArticles, getArticleBySlug, getProfile } from "@/lib/data";
import ArticleContent from "@/components/articles/ArticleContent";
import Section, { SectionKicker } from "@/components/ui/Section";

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const profile = await getProfile();
  if (!article) return { title: "Article not found" };

  return {
    title: `${article.title} — ${profile?.name ?? "Portfolio"}`,
    description: article.excerpt,
    openGraph: { title: article.title, description: article.excerpt, type: "article" },
  };
}

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const allArticles = await getArticles();
  const currentIndex = allArticles.findIndex((a) => a.slug === article.slug);
  const previous = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;
  // "Related" = other published articles sharing at least one tag — real,
  // derived from actual tag data rather than a separate relation.
  const related = allArticles
    .filter((a) => a.slug !== article.slug && a.tags.some((tag) => article.tags.includes(tag)))
    .slice(0, 3);
  const stats = readingTime(article.content);

  return (
    <Section className="pt-32 md:pt-40">
      <Link
        href="/articles"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={14} /> All articles
      </Link>

      <article className="mx-auto mt-8 max-w-2xl">
        <p className="section-kicker mb-4">ENGINEERING NOTE</p>
        <h1 className="font-display text-3xl text-text md:text-4xl">{article.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-xs text-dim">
          {formatDate(article.publishedAt) && <span>{formatDate(article.publishedAt)}</span>}
          <span>{Math.ceil(stats.minutes)} min read</span>
          {article.tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>

        <p className="mt-6 text-lg text-muted">{article.excerpt}</p>

        <div className="mt-8 border-t border-border pt-8">
          <ArticleContent content={article.content} />
        </div>

        <div className="mt-16 flex items-center justify-between gap-4 border-t border-border pt-8">
          {previous ? (
            <Link
              href={`/articles/${previous.slug}`}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-accent"
            >
              <ArrowLeft size={14} /> {previous.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/articles/${next.slug}`}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-accent"
            >
              {next.title} <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {related.length > 0 && (
          <div className="mt-12 border-t border-border pt-8">
            <SectionKicker>RELATED ARTICLES</SectionKicker>
            <ul className="space-y-2">
              {related.map((a) => (
                <li key={a.slug}>
                  <Link href={`/articles/${a.slug}`} className="text-sm text-muted hover:text-accent">
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </Section>
  );
}
