import type { Metadata } from "next";
import { getProjects, getProfile } from "@/lib/data";
import ProjectList from "@/components/projects/ProjectList";
import Section, { SectionKicker, SectionHeading } from "@/components/ui/Section";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const name = profile?.name ?? "Portfolio";
  return {
    title: "Projects",
    description: `Selected engineering projects by ${name}.`,
  };
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <Section className="pt-32 md:pt-40">
      <SectionKicker>PROJECTS</SectionKicker>
      <SectionHeading>Everything I&rsquo;ve shipped.</SectionHeading>
      <div className="mt-10">
        <ProjectList projects={projects} showHeading={false} />
      </div>
    </Section>
  );
}
