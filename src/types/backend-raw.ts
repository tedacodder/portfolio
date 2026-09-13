// Raw shapes as returned by the backend services/routes, i.e. the Drizzle
// row shapes (camelCase columns) plus whatever relations each service
// attaches. These exist only so `lib/api/index.ts` has something precise to
// map from — UI code should always import from `@/types/api`, never here.

export interface RawProfile {
  id: string;
  name: string;
  headline: string;
  shortBio: string;
  longBio: string | null;
  location: string | null;
  availabilityStatus: string | null;
  profileImageUrl: string | null;
  resumeUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  email: string;
  websiteUrl: string | null;
}

export interface RawPrinciple {
  id: string;
  title: string;
  description: string;
  displayOrder: number;
}

export interface RawTechnologyRef {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export interface RawTechnology extends RawTechnologyRef {
  description: string | null;
  category: string | null;
  featured: boolean;
  displayOrder: number;
  proficiency?: number;
}

export interface RawArchitectureLayer {
  id: string;
  name: string;
  displayOrder: number;
}

export interface RawArchitectureNode {
  id: string;
  layerId: string | null;
  label: string;
  type: string;
  description: string | null;
}

export interface RawArchitectureConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label: string | null;
}

export interface RawProjectArchitecture {
  layers: RawArchitectureLayer[];
  nodes: RawArchitectureNode[];
  connections: RawArchitectureConnection[];
}

export interface RawProject {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string | null;
  problem: string | null;
  solution: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  displayOrder: number;
  startDate: string | null;
  endDate: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  coverImageUrl?: string | null;
  architectureDescription: string | null;
  technologies: RawTechnologyRef[];
  architecture?: RawProjectArchitecture;
}

export interface RawExperience {
  id: string;
  company: string;
  role: string;
  location: string | null;
  description: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  companyUrl: string | null;
  displayOrder: number;
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE";
  highlights: { content: string }[];
  technologies: RawTechnologyRef[];
}

export interface RawEducation {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string | null;
  description: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  location: string | null;
  url: string | null;
  displayOrder: number;
}

export interface RawLearningTopic {
  id: string;
  topic: string;
  description: string | null;
  progress: number;
  status: "PLANNED" | "LEARNING" | "PAUSED" | "COMPLETED";
  technologies: RawTechnologyRef[];
}

export interface RawArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | null;
  readingTimeMinutes: number | null;
  featured: boolean;
  tags: { name: string }[];
}

/**
 * Same shape as RawArticle, but for the direct-service-call path (admin
 * edit page calling getArticleById() server-side) rather than the
 * HTTP/JSON path (mappers.ts, admin.ts's articlesAdmin, the articles list
 * page) — `published_at` is a timestamp column, so Drizzle returns a real
 * Date there, whereas JSON serialization turns it into a string. Two type
 * names for the same DB row, split by which side of that boundary reads it.
 */
export interface RawArticleRow extends Omit<RawArticle, "publishedAt"> {
  publishedAt: Date | null;
}

export interface RawAchievement {
  id: string;
  title: string;
  description: string | null;
  organization: string | null;
  date: string | null;
  url: string | null;
  imageUrl: string | null;
  displayOrder: number;
}

export interface RawSocialLink {
  id: string;
  platform: string;
  label: string | null;
  url: string;
  icon: string | null;
  visible: boolean;
  displayOrder: number;
}

export interface RawContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: "UNREAD" | "READ" | "ARCHIVED";
  readAt: Date | null;
  createdAt: Date;
}
