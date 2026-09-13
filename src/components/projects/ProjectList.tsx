import Section, { SectionKicker, SectionHeading } from "@/components/ui/Section";
import EmptyState from "@/components/ui/EmptyState";
import ProjectCard from "./ProjectCard";
import type { Project } from "@/types/api";

export default function ProjectList({
  projects,
  showHeading = true,
}: {
  projects: Project[];
  showHeading?: boolean;
}) {
  return (
    <Section id="projects">
      {showHeading && (
        <>
          <SectionKicker>PROJECTS</SectionKicker>
          <SectionHeading>Selected work.</SectionHeading>
        </>
      )}
      <div className="mt-10">
        {projects.length === 0 ? (
          <EmptyState message="No projects published yet." />
        ) : (
          projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))
        )}
      </div>
    </Section>
  );
}
