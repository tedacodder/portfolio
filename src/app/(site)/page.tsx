import {
  getProfile,
  getPrinciples,
  getProjects,
  getTechnologies,
  getExperiences,
  getEducation,
  getLearningTopics,
  getArticles,
  getAchievements,
  getActivity,
  getSocialLinks,
} from "@/lib/data";
import Hero from "@/components/hero/Hero";
import About from "@/components/about/About";
import TechnologyConstellation from "@/components/technology/TechnologyConstellation";
import ProjectList from "@/components/projects/ProjectList";
import SystemDesignSection from "@/components/architecture/SystemDesignSection";
import ExperienceTimeline from "@/components/experience/ExperienceTimeline";
import ActivityVisualization from "@/components/activity/ActivityVisualization";
import LearningList from "@/components/learning/LearningList";
import ArticleCard from "@/components/articles/ArticleCard";
import Achievements from "@/components/achievements/Achievements";
import ContactForm from "@/components/contact/ContactForm";
import Section, { SectionKicker, SectionHeading } from "@/components/ui/Section";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function HomePage() {
  const [
    profile,
    principles,
    projects,
    technologies,
    experiences,
    education,
    learningTopics,
    articles,
    achievements,
    activity,
    socialLinks,
  ] = await Promise.all([
    getProfile(),
    getPrinciples(),
    getProjects(),
    getTechnologies(),
    getExperiences(),
    getEducation(),
    getLearningTopics(),
    getArticles(),
    getAchievements(),
    getActivity(),
    getSocialLinks(),
  ]);

  const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);
  const projectsToShow = featuredProjects.length > 0 ? featuredProjects : projects.slice(0, 3);
  const recentArticles = articles.slice(0, 3);

  return (
    <>
      <Hero profile={profile} />
      <About profile={profile} principles={principles} />
      <TechnologyConstellation technologies={technologies} />

      <Section id="projects-preview" className="border-t border-border">
        <div className="flex items-end justify-between gap-4">
          <div>
            <SectionKicker>PROJECTS</SectionKicker>
            <SectionHeading>Selected work.</SectionHeading>
          </div>
          <Link
            href="/projects"
            className="hidden items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-accent sm:inline-flex"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-10">
          <ProjectList projects={projectsToShow} showHeading={false} />
        </div>
        <Link
          href="/projects"
          className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-accent sm:hidden"
        >
          View all projects <ArrowRight size={14} />
        </Link>
      </Section>

      <SystemDesignSection />

      <Section id="experience" className="border-t border-border">
        <SectionKicker>EXPERIENCE</SectionKicker>
        <SectionHeading>The journey so far.</SectionHeading>
        <div className="mt-10">
          <ExperienceTimeline experiences={experiences} education={education} />
        </div>
      </Section>

      {activity.hasData && (
        <Section id="activity" className="border-t border-border">
          <SectionKicker>ENGINEERING ACTIVITY</SectionKicker>
          <SectionHeading>Recent output.</SectionHeading>
          <div className="mt-10">
            <ActivityVisualization activity={activity} />
          </div>
        </Section>
      )}

      {learningTopics.length > 0 && (
        <Section id="learning" className="border-t border-border">
          <SectionKicker>CURRENTLY EXPLORING</SectionKicker>
          <SectionHeading>What&rsquo;s in progress.</SectionHeading>
          <div className="mt-10 max-w-xl">
            <LearningList topics={learningTopics} />
          </div>
        </Section>
      )}

      {recentArticles.length > 0 && (
        <Section id="articles-preview" className="border-t border-border">
          <div className="flex items-end justify-between gap-4">
            <div>
              <SectionKicker>ARTICLES</SectionKicker>
              <SectionHeading>Engineering notes.</SectionHeading>
            </div>
            <Link
              href="/articles"
              className="hidden items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-accent sm:inline-flex"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-10">
            {recentArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </Section>
      )}

      {achievements.length > 0 && (
        <Section id="achievements" className="border-t border-border">
          <SectionKicker>ACHIEVEMENTS</SectionKicker>
          <SectionHeading>Milestones.</SectionHeading>
          <div className="mt-10">
            <Achievements achievements={achievements} />
          </div>
        </Section>
      )}

      <Section id="contact" className="border-t border-border">
        <SectionKicker>GET IN TOUCH</SectionKicker>
        <SectionHeading>Let&rsquo;s build something worth remembering.</SectionHeading>
        {profile?.bio && (
          <p className="mt-4 max-w-xl text-sm text-muted md:text-base">
            {profile.shortBio ?? "Open to backend engineering roles, internships, and collaborations."}
          </p>
        )}

        <div className="mt-10 grid gap-12 md:grid-cols-2">
          <div>
            {socialLinks.length > 0 ? (
              <ul className="space-y-3">
                {socialLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target={link.url.startsWith("http") ? "_blank" : undefined}
                      rel={link.url.startsWith("http") ? "noreferrer noopener" : undefined}
                      className="inline-flex items-center gap-1.5 font-body text-base text-muted transition-colors hover:text-accent"
                    >
                      {link.platform} <ArrowRight size={14} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-mono text-xs text-dim">No social links published yet.</p>
            )}
          </div>
          <ContactForm />
        </div>
      </Section>
    </>
  );
}
