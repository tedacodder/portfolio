// Central type definitions for every backend resource this frontend
// consumes. These mirror the real Drizzle/service response shapes exactly
// (see src/db/schema/*.ts and src/lib/services/*.ts) — never widen an API
// response to `any`; extend these types instead.

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiListEnvelope<T> {
  success: boolean;
  data: T[];
  pagination?: Pagination;
}

export interface ApiErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface Profile {
  id: string;
  name: string;
  /** Tagline/role-style text, e.g. "Backend Engineer". Sourced from the
   * profile's `headline` column — there is no separate "role" column. */
  role: string;
  headline: string;
  bio: string;
  shortBio: string;
  location?: string;
  availability?: {
    isAvailable: boolean;
    label: string;
  };
  avatarUrl?: string;
  resumeUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  email: string;
  websiteUrl?: string;
}

export interface Principle {
  id: string;
  order: number;
  title: string;
  description: string;
}

export interface Technology {
  id: string;
  name: string;
  slug: string;
  category?: string;
  description?: string;
  /** 0-100. Only present when a `skills` row links to this technology. */
  proficiency?: number;
  iconUrl?: string;
  featured: boolean;
  displayOrder: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  proficiency?: number;
  displayOrder: number;
  technology?: { id: string; name: string; slug: string } | null;
}

export interface ArchitectureNode {
  id: string;
  label: string;
  sublabel?: string;
  order: number;
}

export interface ArchitectureEdge {
  from: string;
  to: string;
  label?: string;
}

export interface ProjectArchitecture {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
}

export type ProjectStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Project {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description?: string;
  problem?: string;
  solution?: string;
  status: ProjectStatus;
  /** Convenience flag derived from `status === "PUBLISHED"`. */
  published: boolean;
  technologies: { id: string; name: string; slug: string; icon?: string }[];
  architecture?: ProjectArchitecture;
  githubUrl?: string;
  liveUrl?: string;
  coverImageUrl?: string;
  featured: boolean;
  startDate?: string;
  endDate?: string | null;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE";
  location?: string;
  description?: string;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  companyUrl?: string;
  highlights: string[];
  technologies: { id: string; name: string; slug: string }[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  description?: string;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  location?: string;
  url?: string;
}

export type LearningStatus = "PLANNED" | "LEARNING" | "PAUSED" | "COMPLETED";

export interface LearningTopic {
  id: string;
  /** Mapped from the backend's `topic` column. */
  title: string;
  description?: string;
  progress: number; // 0-100
  status: LearningStatus;
  technologies: { id: string; name: string; slug: string }[];
}

export type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string; // markdown
  coverImageUrl?: string;
  status: ArticleStatus;
  published: boolean;
  publishedAt?: string | null;
  readingTimeMinutes?: number;
  featured: boolean;
  tags: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description?: string;
  organization?: string;
  date?: string;
  url?: string;
  imageUrl?: string;
  displayOrder: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  credentialId?: string;
  credentialUrl?: string;
  issuedAt?: string;
  expiresAt?: string;
  imageUrl?: string;
  description?: string;
}

export interface TimelineEntry {
  id: string;
  yearOrLabel: string;
  title: string;
  description?: string;
  date?: string;
  displayOrder: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  label?: string;
  url: string;
  icon?: string;
}

/** Structured so a real activity data source can be plugged in later
 * without changing the component contract — see ActivityVisualization. */
export interface ActivitySummary {
  hasData: boolean;
  contributionsLastYear?: number;
  streakDays?: number;
  topLanguages?: { name: string; percentage: number }[];
}

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Honeypot field — must stay empty; hidden from real visitors via CSS. */
  website?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: "UNREAD" | "READ" | "ARCHIVED";
  readAt?: string | null;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN";
}
