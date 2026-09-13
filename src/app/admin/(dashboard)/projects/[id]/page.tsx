import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import ProjectForm from "@/components/admin/resources/ProjectForm";
import { getProjectById } from "@/lib/services/projects.service";
import { listTechnologies } from "@/lib/services/technologies.service";
import { NotFoundError } from "@/lib/errors/app-error";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, { rows }] = await Promise.all([
    getProjectById(id),
    listTechnologies({ page: 1, limit: 200 }, {}),
  ]).catch((err) => {
    if (err instanceof NotFoundError) notFound();
    throw err;
  });
  return (
    <div>
      <PageHeader
        title="Edit project"
        action={
          <Link
            href={`/admin/projects/${id}/architecture`}
            className="inline-flex items-center border border-text px-4 py-2 font-mono text-xs text-text transition-colors hover:border-accent hover:text-accent"
          >
            Edit architecture →
          </Link>
        }
      />
      <ProjectForm project={project} technologyOptions={rows.map((t) => ({ value: t.id, label: t.name }))} />
    </div>
  );
}
