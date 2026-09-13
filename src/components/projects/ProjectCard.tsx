import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/types/api";

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article className="border-t border-border py-12 first:border-t-0 md:py-16">
      <div className="grid gap-6 md:grid-cols-[80px_1fr]">
        <p className="font-mono text-sm text-dim">{String(index + 1).padStart(2, "0")}</p>

        <div>
          <h3 className="font-display text-2xl text-text md:text-3xl">
            <Link href={`/projects/${project.slug}`} className="transition-colors hover:text-accent">
              {project.title}
            </Link>
          </h3>
          <p className="mt-3 max-w-2xl text-sm text-muted md:text-base">
            {project.shortDescription}
          </p>

          {(project.problem || project.solution) && (
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {project.problem && (
                <div>
                  <p className="font-mono text-xs text-dim">PROBLEM</p>
                  <p className="mt-1 text-sm text-muted">{project.problem}</p>
                </div>
              )}
              {project.solution && (
                <div>
                  <p className="font-mono text-xs text-dim">SOLUTION</p>
                  <p className="mt-1 text-sm text-muted">{project.solution}</p>
                </div>
              )}
            </div>
          )}

          {project.technologies.length > 0 && (
            <div className="mt-6">
              <p className="font-mono text-xs text-dim">TECHNOLOGIES</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span key={tech.id} className="border border-border px-2.5 py-1 font-mono text-xs text-muted">
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-6">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 font-body text-sm text-muted transition-colors hover:text-accent"
              >
                GitHub <ArrowUpRight size={14} />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 font-body text-sm text-muted transition-colors hover:text-accent"
              >
                Live Demo <ArrowUpRight size={14} />
              </a>
            )}
            <Link
              href={`/projects/${project.slug}`}
              className="inline-flex items-center gap-1.5 font-body text-sm text-accent"
            >
              View project <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
