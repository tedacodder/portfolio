import * as dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import process from "node:process";
import { hashPassword } from "../src/lib/auth/password";
import * as schema from "../src/db/schema";

/**
 * Seed script. Run with: npm run db:seed
 *
 * Idempotent-ish: re-running will not duplicate the admin user (matched by
 * email) or the profile (there's only ever one row), but will insert fresh
 * copies of list-style sample content (projects, articles, etc.) if run
 * more than once against a non-empty database. It's intended for a fresh
 * dev database, not for repeated production use.
 */
async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and configure it.");
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "Admin";

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before seeding.");
  }
  if (adminPassword === "change-this-password") {
    throw new Error("Refusing to seed with the placeholder ADMIN_PASSWORD. Set a real value in .env.");
  }

  const client = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(client, { schema });

  console.log("Seeding database...");

  // 1. Admin user
  const passwordHash = await hashPassword(adminPassword);
  const [admin] = await db
    .insert(schema.users)
    .values({ email: adminEmail, passwordHash, name: adminName, role: "ADMIN" })
    .onConflictDoNothing({ target: schema.users.email })
    .returning();
  console.log(admin ? `Created admin user ${admin.email}` : `Admin user ${adminEmail} already exists, skipping`);

  // 2. Profile
  const existingProfile = await db.select().from(schema.profile).limit(1);
  if (existingProfile.length === 0) {
    await db.insert(schema.profile).values({
      name: adminName,
      headline: "Full-Stack Developer",
      shortBio:
        "Frontend development done — now expanding into backend development with Python and Django.",
      longBio:
        "I started with frontend development and built a solid foundation in modern tools like React, Next.js, and TypeScript. Having completed that focus, I'm now expanding into backend development, currently learning Python and Django to grow across the full stack. I have practical experience working on collaborative software projects, including SRAHUB, a full-stack recruitment platform where my primary contribution was on the web/frontend side.",
      location: "Remote",
      availabilityStatus: "Open to opportunities",
      email: adminEmail,
      githubUrl: "https://github.com/example",
      linkedinUrl: "https://linkedin.com/in/example",
    });
    console.log("Created profile");
  } else {
    console.log("Profile already exists, skipping");
  }

  // 3. Technologies
  const technologyDefs = [
    { name: "HTML", slug: "html", category: "Frontend", featured: true },
    { name: "CSS", slug: "css", category: "Frontend", featured: true },
    { name: "JavaScript", slug: "javascript", category: "Languages", featured: true },
    { name: "TypeScript", slug: "typescript", category: "Languages", featured: true },
    { name: "React", slug: "react", category: "Frontend", featured: true },
    { name: "Next.js", slug: "nextjs", category: "Frontend", featured: true },
    { name: "Tailwind CSS", slug: "tailwind-css", category: "Frontend", featured: true },
    { name: "Redux", slug: "redux", category: "Frontend" },
    { name: "Python", slug: "python", category: "Backend" },
    { name: "Django", slug: "django", category: "Backend" },
    { name: "REST API", slug: "rest-api", category: "Backend" },
    { name: "Go", slug: "go", category: "Backend" },
    { name: "JWT", slug: "jwt", category: "Backend" },
    { name: "PostgreSQL", slug: "postgresql", category: "Database", featured: true },
    { name: "Redis", slug: "redis", category: "Database" },
    { name: "Docker", slug: "docker", category: "DevOps", featured: true },
    { name: "Linux", slug: "linux", category: "Systems" },
    { name: "Flutter", slug: "flutter", category: "Mobile" },
    { name: "Dart", slug: "dart", category: "Languages" },
    { name: "Git", slug: "git", category: "Tools" },
  ];
  const insertedTechnologies = await db
    .insert(schema.technologies)
    .values(technologyDefs)
    .onConflictDoNothing({ target: schema.technologies.slug })
    .returning();
  const technologies =
    insertedTechnologies.length > 0 ? insertedTechnologies : await db.select().from(schema.technologies);
  const techBySlug = new Map(technologies.map((t) => [t.slug, t]));
  console.log(`Technologies ready (${technologies.length} total)`);

  // 4. Sample project
  const [project] = await db
    .insert(schema.projects)
    .values({
      title: "SRAHUB",
      slug: "srahub",
      shortDescription: "Full-stack collaborative recruitment platform.",
      description:
        "SRAHUB is a collaborative full-stack recruitment platform with a Next.js/TypeScript web application, a Go backend, and a Flutter mobile app. It covers authentication, role-based access, job postings, applications, user profiles, admin tools, and audit logging. It was built as a group project — my primary contribution was on the web/frontend side, working with Next.js, React, TypeScript, and REST API integration against the Go backend.",
      problem:
        "Recruitment workflows spread across email, spreadsheets, and ad-hoc tools made it hard for employers and seekers to track jobs, applications, and status changes in one place.",
      solution:
        "A unified platform — Next.js/TypeScript web app and Flutter mobile app on the front end, backed by a Go REST API — covering job postings, applications, role-based admin, and audit history.",
      status: "PUBLISHED",
      featured: true,
      startDate: "2026-01-10",
      githubUrl: "https://github.com/example/srahub",
      architectureDescription:
        "Next.js/TypeScript web client and Flutter mobile app consume a Go REST API, with JWT-based auth, role-based access control, PostgreSQL storage, and audit logging.",
      displayOrder: 0,
    })
    .onConflictDoNothing({ target: schema.projects.slug })
    .returning();

  if (project) {
    const projectTechSlugs = [
      "nextjs",
      "react",
      "typescript",
      "redux",
      "go",
      "postgresql",
      "jwt",
      "rest-api",
      "flutter",
      "dart",
      "docker",
    ];
    await db.insert(schema.projectTechnologies).values(
      projectTechSlugs
        .map((slug) => techBySlug.get(slug))
        .filter((t): t is NonNullable<typeof t> => Boolean(t))
        .map((t) => ({ projectId: project.id, technologyId: t.id })),
    );
    console.log(`Created project ${project.slug}`);
  } else {
    console.log("Sample project already exists, skipping");
  }

  // 5. Sample experience
  const [experience] = await db
    .insert(schema.experiences)
    .values({
      company: "Company X",
      role: "Software Engineer",
      employmentType: "FULL_TIME",
      location: "Remote",
      description: "Working across the backend platform team.",
      startDate: "2026-01-01",
      current: true,
      displayOrder: 0,
    })
    .returning();

  if (experience) {
    await db.insert(schema.experienceHighlights).values([
      { experienceId: experience.id, content: "Designed and shipped internal APIs used by three teams.", displayOrder: 0 },
      { experienceId: experience.id, content: "Reduced p95 query latency by 40% through indexing and query review.", displayOrder: 1 },
    ]);
    console.log("Created sample experience");
  }

  // 6. Sample skills
  const skillDefs = [
    { name: "HTML/CSS", category: "Frontend", proficiency: 90 },
    { name: "JavaScript", category: "Frontend", proficiency: 85 },
    { name: "TypeScript", category: "Frontend", proficiency: 80 },
    { name: "React", category: "Frontend", proficiency: 85 },
    { name: "Next.js", category: "Frontend", proficiency: 80 },
    { name: "Tailwind CSS", category: "Frontend", proficiency: 85 },
  ];
  await db.insert(schema.skills).values(skillDefs.map((s, i) => ({ ...s, displayOrder: i })));
  console.log("Created sample skills");

  // 7. Sample learning topics
  const learningDefs = [
    { topic: "Python", status: "LEARNING" as const, progress: 50 },
    { topic: "Django", status: "LEARNING" as const, progress: 35 },
    { topic: "REST API Design", status: "LEARNING" as const, progress: 45 },
    { topic: "Backend Architecture", status: "PLANNED" as const, progress: 15 },
  ];
  await db.insert(schema.learningTopics).values(learningDefs.map((l, i) => ({ ...l, displayOrder: i })));
  console.log("Created sample learning topics");

  // 8. Sample timeline
  const timelineDefs = [
    { yearOrLabel: "2024", title: "Started building with HTML, CSS, and JavaScript", date: "2024-01-01" },
    { yearOrLabel: "2025", title: "Built a frontend foundation with React, Next.js, and TypeScript", date: "2025-01-01" },
    { yearOrLabel: "2026", title: "Completed frontend focus, started learning Python and Django", date: "2026-01-01" },
    { yearOrLabel: "NOW", title: "Expanding into full-stack development", date: null },
  ];
  await db.insert(schema.timeline).values(timelineDefs.map((t, i) => ({ ...t, displayOrder: i })));
  console.log("Created sample timeline");

  // 9. Sample article
  const [article] = await db
    .insert(schema.articles)
    .values({
      title: "What I Learned Building SRAHUB's Frontend",
      slug: "what-i-learned-building-srahubs-frontend",
      excerpt: "Notes from building the SRAHUB web app: API integration, auth state, and working against a Go backend.",
      content:
        "# What I Learned\n\nBuilding the web app for SRAHUB, a collaborative full-stack recruitment platform, taught me a lot about integrating a Next.js/TypeScript frontend against a real REST API...",
      status: "PUBLISHED",
      publishedAt: new Date(),
      readingTimeMinutes: 6,
      featured: true,
    })
    .onConflictDoNothing({ target: schema.articles.slug })
    .returning();

  if (article) {
    const [tag1] = await db
      .insert(schema.tags)
      .values({ name: "Distributed Systems", slug: "distributed-systems" })
      .onConflictDoNothing({ target: schema.tags.slug })
      .returning();
    const [tag2] = await db
      .insert(schema.tags)
      .values({ name: "Go", slug: "go" })
      .onConflictDoNothing({ target: schema.tags.slug })
      .returning();

    const tagIds = [tag1, tag2].filter((t): t is NonNullable<typeof t> => Boolean(t)).map((t) => t.id);
    if (tagIds.length > 0) {
      await db.insert(schema.articleTags).values(tagIds.map((tagId) => ({ articleId: article.id, tagId })));
    }
    console.log(`Created article ${article.slug}`);
  } else {
    console.log("Sample article already exists, skipping");
  }

  // 10. Sample social links
  const socialDefs = [
    { platform: "GitHub", url: "https://github.com/example", displayOrder: 0 },
    { platform: "LinkedIn", url: "https://linkedin.com/in/example", displayOrder: 1 },
    { platform: "Email", url: "mailto:admin@example.com", displayOrder: 2 },
  ];
  await db.insert(schema.socialLinks).values(socialDefs);
  console.log("Created sample social links");

  console.log("Seeding complete.");
  await client.end();
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
