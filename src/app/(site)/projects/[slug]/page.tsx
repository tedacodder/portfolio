import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getProjects, getProjectBySlug, getProfile } from "@/lib/data";
import ArchitectureScene from "@/components/architecture/ArchitectureScene";
import Section, { SectionKicker } from "@/components/ui/Section";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  const profile = await getProfile();
  if (!project) return { title: "Project not found" };

  return {
    title: `${project.title} — ${profile?.name ?? "Portfolio"}`,
    description: project.shortDescription,
    openGraph: { title: project.title, description: project.shortDescription },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const allProjects = await getProjects();
  const techIds = new Set(project.technologies.map((t) => t.id));
  // "Related" = other published projects sharing at least one technology —
  // real, derived from the actual project_technologies data.
  const relatedProjects = allProjects
    .filter((p) => p.slug !== project.slug && p.technologies.some((t) => techIds.has(t.id)))
    .slice(0, 4);

  return (
    <Section className="pt-32 md:pt-40">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={14} /> All projects
      </Link>

      <h1 className="mt-8 font-display text-4xl text-text md:text-5xl">{project.title}</h1>
      <p className="mt-4 max-w-2xl text-base text-muted md:text-lg">{project.shortDescription}</p>

      <div className="mt-6 flex flex-wrap gap-6">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 font-body text-sm text-text transition-colors hover:text-accent"
          >
            GitHub <ArrowUpRight size={14} />
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 font-body text-sm text-text transition-colors hover:text-accent"
          >
            Live Demo <ArrowUpRight size={14} />
          </a>
        )}
      </div>

      <div className="mt-14 grid gap-12 md:grid-cols-2">
        <div>
          <p className="text-base leading-relaxed text-muted">{project.description}</p>

          {(project.problem || project.solution) && (
            <div className="mt-8 space-y-6">
              {project.problem && (
                <div>
                  <SectionKicker>PROBLEM</SectionKicker>
                  <p className="text-sm text-muted">{project.problem}</p>
                </div>
              )}
              {project.solution && (
                <div>
                  <SectionKicker>SOLUTION</SectionKicker>
                  <p className="text-sm text-muted">{project.solution}</p>
                </div>
              )}
            </div>
          )}

          {project.technologies.length > 0 && (
            <div className="mt-8">
              <SectionKicker>TECHNOLOGIES</SectionKicker>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span key={tech.id} className="border border-border px-2.5 py-1 font-mono text-xs text-muted">
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {project.architecture && project.architecture.nodes.length > 0 && (
          <div>
            <SectionKicker>ARCHITECTURE</SectionKicker>
            <ArchitectureScene architecture={project.architecture} />
          </div>
        )}
      </div>

      {relatedProjects.length > 0 && (
        <div className="mt-20 border-t border-border pt-12">
          <SectionKicker>RELATED PROJECTS</SectionKicker>
          <ul className="space-y-2">
            {relatedProjects.map((p) => (
              <li key={p.slug}>
                <Link href={`/projects/${p.slug}`} className="text-sm text-muted hover:text-accent">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}
