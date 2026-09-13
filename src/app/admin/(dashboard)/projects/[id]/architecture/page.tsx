import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import ArchitectureEditor from "@/components/admin/resources/ArchitectureEditor";
import { getProjectById, getProjectArchitecture } from "@/lib/services/projects.service";
import { NotFoundError } from "@/lib/errors/app-error";

export default async function ProjectArchitecturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, graph] = await Promise.all([getProjectById(id), getProjectArchitecture(id)]).catch((err) => {
    if (err instanceof NotFoundError) notFound();
    throw err;
  });
  return (
    <div>
      <PageHeader
        title={`Architecture — ${project.title}`}
        description="Changes here update the public project page's architecture diagram immediately."
        action={
          <Link
            href={`/admin/projects/${id}`}
            className="inline-flex items-center border border-border px-4 py-2 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-accent"
          >
            ← Back to project
          </Link>
        }
      />
      <ArchitectureEditor projectId={id} initialGraph={graph} />
    </div>
  );
}
