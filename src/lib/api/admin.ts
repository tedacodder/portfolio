import { fetchOne, fetchPage, postOne, patchOne, requestVoid, ApiError } from "./fetcher";
import type { Pagination } from "@/types/api";
import type { AdminUser, ContactMessage } from "@/types/api";
import type { LoginInput } from "@/lib/validation/auth";
import type { CreatePrincipleInput, UpdatePrincipleInput } from "@/lib/validation/principles";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/validation/projects";
import type { CreateArticleInput, UpdateArticleInput } from "@/lib/validation/articles";
import type { CreateExperienceInput, UpdateExperienceInput } from "@/lib/validation/experiences";
import type { CreateEducationInput, UpdateEducationInput } from "@/lib/validation/education";
import type { CreateTechnologyInput, UpdateTechnologyInput } from "@/lib/validation/technologies";
import type { CreateSkillInput, UpdateSkillInput } from "@/lib/validation/skills";
import type { CreateLearningTopicInput, UpdateLearningTopicInput } from "@/lib/validation/learning";
import type { CreateAchievementInput, UpdateAchievementInput } from "@/lib/validation/achievements";
import type { CreateCertificationInput, UpdateCertificationInput } from "@/lib/validation/certifications";
import type { CreateSocialLinkInput, UpdateSocialLinkInput } from "@/lib/validation/social-links";
import type { CreateTimelineEntryInput, UpdateTimelineEntryInput } from "@/lib/validation/timeline";
import type { UpsertProfileInput } from "@/lib/validation/profile";

export { ApiError };

// ---- Auth ----

export async function adminLogin(input: LoginInput): Promise<{ user: AdminUser }> {
  return postOne("/api/auth/login", input);
}

export async function adminLogout(): Promise<void> {
  await requestVoid("/api/auth/logout", "POST");
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const { user } = await fetchOne<{ user: AdminUser }>("/api/auth/me", { cache: "no-store" });
    return user;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}

// ---- Generic admin CRUD factory ----
// Every admin resource follows the same shape: GET (list, paginated), GET
// :id, POST, PATCH :id, DELETE :id. This factory is the single
// implementation every resource client below composes instead of
// duplicating the same four fetch calls fifteen times.

function adminResource<TRow extends { id: string }, TCreate, TUpdate>(basePath: string) {
  return {
    async list(query?: Record<string, string | number | boolean | undefined>): Promise<{
      data: TRow[];
      pagination?: Pagination;
    }> {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(query ?? {})) {
        if (value !== undefined) params.set(key, String(value));
      }
      const qs = params.toString();
      return fetchPage<TRow>(`${basePath}${qs ? `?${qs}` : ""}`, { cache: "no-store" });
    },
    async get(id: string): Promise<TRow> {
      return fetchOne<TRow>(`${basePath}/${id}`, { cache: "no-store" });
    },
    async create(input: TCreate): Promise<TRow> {
      return postOne<TCreate, TRow>(basePath, input);
    },
    async update(id: string, input: TUpdate): Promise<TRow> {
      return patchOne<TUpdate, TRow>(`${basePath}/${id}`, input);
    },
    async remove(id: string): Promise<void> {
      await requestVoid(`${basePath}/${id}`, "DELETE");
    },
  };
}

// ---- Resource clients ----
// Row types here are the raw backend shapes (see src/types/backend-raw.ts)
// — admin screens work with the real DB rows directly rather than the
// mapped public UI types, since e.g. status/displayOrder/technology ids
// need to be edited, not just displayed.

import type {
  RawPrinciple,
  RawProject,
  RawArticle,
  RawExperience,
  RawEducation,
  RawTechnology,
  RawSocialLink,
  RawAchievement,
} from "@/types/backend-raw";

export interface RawSkill {
  id: string;
  name: string;
  category: string;
  description: string | null;
  proficiency: number | null;
  displayOrder: number;
  technology: { id: string; name: string; slug: string } | null;
}

export interface RawCertification {
  id: string;
  name: string;
  issuer: string;
  credentialId: string | null;
  credentialUrl: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  imageUrl: string | null;
  description: string | null;
}

export interface RawTimelineEntry {
  id: string;
  yearOrLabel: string;
  title: string;
  description: string | null;
  date: string | null;
  displayOrder: number;
}

export interface RawLearningTopic {
  id: string;
  topic: string;
  description: string | null;
  progress: number;
  status: "PLANNED" | "LEARNING" | "PAUSED" | "COMPLETED";
  displayOrder: number;
  startedAt: string | null;
  targetDate: string | null;
}

export const principlesAdmin = adminResource<RawPrinciple, CreatePrincipleInput, UpdatePrincipleInput>(
  "/api/admin/principles",
);
export const projectsAdmin = adminResource<RawProject, CreateProjectInput, UpdateProjectInput>(
  "/api/admin/projects",
);
export const articlesAdmin = adminResource<RawArticle, CreateArticleInput, UpdateArticleInput>(
  "/api/admin/articles",
);
export const experiencesAdmin = adminResource<RawExperience, CreateExperienceInput, UpdateExperienceInput>(
  "/api/admin/experiences",
);
export const educationAdmin = adminResource<RawEducation, CreateEducationInput, UpdateEducationInput>(
  "/api/admin/education",
);
export const technologiesAdmin = adminResource<RawTechnology, CreateTechnologyInput, UpdateTechnologyInput>(
  "/api/admin/technologies",
);
export const skillsAdmin = adminResource<RawSkill, CreateSkillInput, UpdateSkillInput>("/api/admin/skills");
export const learningAdmin = adminResource<
  RawLearningTopic,
  CreateLearningTopicInput,
  UpdateLearningTopicInput
>("/api/admin/learning");
export const achievementsAdmin = adminResource<RawAchievement, CreateAchievementInput, UpdateAchievementInput>(
  "/api/admin/achievements",
);
export const certificationsAdmin = adminResource<
  RawCertification,
  CreateCertificationInput,
  UpdateCertificationInput
>("/api/admin/certifications");
export const socialLinksAdmin = adminResource<RawSocialLink, CreateSocialLinkInput, UpdateSocialLinkInput>(
  "/api/admin/social-links",
);
export const timelineAdmin = adminResource<RawTimelineEntry, CreateTimelineEntryInput, UpdateTimelineEntryInput>(
  "/api/admin/timeline",
);

// ---- Profile (singleton — no list/create/delete, just get + upsert) ----

export const profileAdmin = {
  async get() {
    return fetchOne<import("@/types/backend-raw").RawProfile | null>("/api/admin/profile", {
      cache: "no-store",
    });
  },
  async save(input: UpsertProfileInput) {
    return patchOne<UpsertProfileInput, import("@/types/backend-raw").RawProfile>(
      "/api/admin/profile",
      input,
    );
  },
};

// ---- Contact messages (list/get/update-status/delete, no create) ----

export const contactAdmin = {
  async list(query?: { page?: number; limit?: number; status?: string }) {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.status) params.set("status", query.status);
    const qs = params.toString();
    return fetchPage<ContactMessage>(`/api/admin/contact${qs ? `?${qs}` : ""}`, { cache: "no-store" });
  },
  async get(id: string) {
    return fetchOne<ContactMessage>(`/api/admin/contact/${id}`, { cache: "no-store" });
  },
  async updateStatus(id: string, status: "UNREAD" | "READ" | "ARCHIVED") {
    return patchOne<{ status: string }, ContactMessage>(`/api/admin/contact/${id}`, { status });
  },
  async remove(id: string) {
    await requestVoid(`/api/admin/contact/${id}`, "DELETE");
  },
};

// ---- Project architecture (nested under a project; layers/nodes/connections) ----

export interface RawArchitectureLayer {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  displayOrder: number;
}
export interface RawArchitectureNode {
  id: string;
  projectId: string;
  layerId: string | null;
  label: string;
  type: string;
  description: string | null;
  position: { x: number; y: number } | null;
}
export interface RawArchitectureConnection {
  id: string;
  projectId: string;
  fromNodeId: string;
  toNodeId: string;
  label: string | null;
}

export const architectureAdmin = {
  async get(projectId: string) {
    return fetchOne<{
      layers: RawArchitectureLayer[];
      nodes: RawArchitectureNode[];
      connections: RawArchitectureConnection[];
    }>(`/api/admin/projects/${projectId}/architecture`, { cache: "no-store" });
  },
  layers: {
    async create(projectId: string, input: { name: string; description?: string; displayOrder: number }) {
      return postOne(`/api/admin/projects/${projectId}/architecture/layers`, input);
    },
    async update(
      projectId: string,
      layerId: string,
      input: Partial<{ name: string; description?: string; displayOrder: number }>,
    ) {
      return patchOne(`/api/admin/projects/${projectId}/architecture/layers/${layerId}`, input);
    },
    async remove(projectId: string, layerId: string) {
      await requestVoid(`/api/admin/projects/${projectId}/architecture/layers/${layerId}`, "DELETE");
    },
  },
  nodes: {
    async create(
      projectId: string,
      input: { layerId?: string; label: string; type: string; description?: string; position?: { x: number; y: number } },
    ) {
      return postOne(`/api/admin/projects/${projectId}/architecture/nodes`, input);
    },
    async update(
      projectId: string,
      nodeId: string,
      input: Partial<{ layerId?: string; label: string; type: string; description?: string; position?: { x: number; y: number } }>,
    ) {
      return patchOne(`/api/admin/projects/${projectId}/architecture/nodes/${nodeId}`, input);
    },
    async remove(projectId: string, nodeId: string) {
      await requestVoid(`/api/admin/projects/${projectId}/architecture/nodes/${nodeId}`, "DELETE");
    },
  },
  connections: {
    async create(projectId: string, input: { fromNodeId: string; toNodeId: string; label?: string }) {
      return postOne(`/api/admin/projects/${projectId}/architecture/connections`, input);
    },
    async remove(projectId: string, connectionId: string) {
      await requestVoid(`/api/admin/projects/${projectId}/architecture/connections/${connectionId}`, "DELETE");
    },
  },
};
