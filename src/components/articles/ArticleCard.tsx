import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Article } from "@/types/api";

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="border-t border-border py-8 first:border-t-0">
      <p className="section-kicker mb-2">ENGINEERING NOTE</p>
      <h3 className="font-display text-xl text-text md:text-2xl">
        <Link href={`/articles/${article.slug}`} className="transition-colors hover:text-accent">
          {article.title}
        </Link>
      </h3>
      <p className="mt-2 max-w-2xl text-sm text-muted">{article.excerpt}</p>
      <div className="mt-4 flex items-center gap-4 font-mono text-xs text-dim">
        {formatDate(article.publishedAt) && <span>{formatDate(article.publishedAt)}</span>}
        {article.tags.slice(0, 2).map((tag) => (
          <span key={tag}>#{tag}</span>
        ))}
      </div>
      <Link
        href={`/articles/${article.slug}`}
        className="mt-4 inline-flex items-center gap-1.5 font-body text-sm text-accent"
      >
        Read article <ArrowRight size={14} />
      </Link>
    </article>
  );
}
