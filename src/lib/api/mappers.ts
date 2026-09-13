import type {
  RawProfile,
  RawPrinciple,
  RawTechnology,
  RawTechnologyRef,
  RawProject,
  RawProjectArchitecture,
  RawExperience,
  RawEducation,
  RawLearningTopic,
  RawArticle,
  RawAchievement,
  RawSocialLink,
} from "@/types/backend-raw";
import type {
  Profile,
  Principle,
  Technology,
  Project,
  ProjectArchitecture,
  Experience,
  Education,
  LearningTopic,
  Article,
  Achievement,
  SocialLink,
} from "@/types/api";

export function mapProfile(row: RawProfile): Profile {
  return {
    id: row.id,
    name: row.name,
    role: row.headline,
    headline: row.headline,
    bio: row.longBio ?? row.shortBio,
    shortBio: row.shortBio,
    location: row.location ?? undefined,
    availability: row.availabilityStatus
      ? { isAvailable: true, label: row.availabilityStatus }
      : undefined,
    avatarUrl: row.profileImageUrl ?? undefined,
    resumeUrl: row.resumeUrl ?? undefined,
    githubUrl: row.githubUrl ?? undefined,
    linkedinUrl: row.linkedinUrl ?? undefined,
    email: row.email,
    websiteUrl: row.websiteUrl ?? undefined,
  };
}

export function mapPrinciple(row: RawPrinciple): Principle {
  return { id: row.id, order: row.displayOrder, title: row.title, description: row.description };
}

function mapTechRef(t: RawTechnologyRef) {
  return { id: t.id, name: t.name, slug: t.slug, icon: t.icon ?? undefined };
}

export function mapTechnology(row: RawTechnology): Technology {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category ?? undefined,
    description: row.description ?? undefined,
    proficiency: row.proficiency,
    iconUrl: row.icon ?? undefined,
    featured: row.featured,
    displayOrder: row.displayOrder,
  };
}

/**
 * Flattens the relational {layers, nodes, connections} architecture data
 * into the simple {nodes: [{order}], edges} shape the existing
 * ArchitectureScene component expects, so the visual component itself
 * doesn't need to change. Ordering: nodes are grouped by their layer's
 * displayOrder (unassigned nodes sort last), preserving each node's
 * original position within its group.
 */
export function mapArchitecture(raw: RawProjectArchitecture): ProjectArchitecture {
  const layerOrder = new Map<string, number>();
  [...raw.layers]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .forEach((layer, i) => layerOrder.set(layer.id, i));
  const layerName = new Map(raw.layers.map((l) => [l.id, l.name]));

  const ordered = raw.nodes
    .map((node, insertionIndex) => ({
      node,
      insertionIndex,
      group: node.layerId ? (layerOrder.get(node.layerId) ?? raw.layers.length) : raw.layers.length + 1,
    }))
    .sort((a, b) => a.group - b.group || a.insertionIndex - b.insertionIndex);

  const nodes = ordered.map(({ node }, order) => ({
    id: node.id,
    label: node.label,
    sublabel: (node.layerId && layerName.get(node.layerId)) || node.type,
    order,
  }));

  const edges = raw.connections.map((c) => ({
    from: c.fromNodeId,
    to: c.toNodeId,
    label: c.label ?? undefined,
  }));

  return { nodes, edges };
}

export function mapProject(row: RawProject): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.shortDescription,
    description: row.description ?? undefined,
    problem: row.problem ?? undefined,
    solution: row.solution ?? undefined,
    status: row.status,
    published: row.status === "PUBLISHED",
    technologies: row.technologies.map(mapTechRef),
    architecture: row.architecture ? mapArchitecture(row.architecture) : undefined,
    githubUrl: row.githubUrl ?? undefined,
    liveUrl: row.liveUrl ?? undefined,
    coverImageUrl: row.coverImageUrl ?? undefined,
    featured: row.featured,
    startDate: row.startDate ?? undefined,
    endDate: row.endDate,
  };
}

export function mapExperience(row: RawExperience): Experience {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    employmentType: row.employmentType,
    location: row.location ?? undefined,
    description: row.description ?? undefined,
    startDate: row.startDate,
    endDate: row.endDate,
    current: row.current,
    companyUrl: row.companyUrl ?? undefined,
    highlights: row.highlights.map((h) => h.content),
    technologies: row.technologies.map(mapTechRef),
  };
}

export function mapEducation(row: RawEducation): Education {
  return {
    id: row.id,
    institution: row.institution,
    degree: row.degree,
    fieldOfStudy: row.fieldOfStudy ?? undefined,
    description: row.description ?? undefined,
    startDate: row.startDate,
    endDate: row.endDate,
    current: row.current,
    location: row.location ?? undefined,
    url: row.url ?? undefined,
  };
}

export function mapLearningTopic(row: RawLearningTopic): LearningTopic {
  return {
    id: row.id,
    title: row.topic,
    description: row.description ?? undefined,
    progress: row.progress,
    status: row.status,
    technologies: row.technologies.map(mapTechRef),
  };
}

export function mapArticle(row: RawArticle): Article {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? undefined,
    content: row.content,
    coverImageUrl: row.coverImageUrl ?? undefined,
    status: row.status,
    published: row.status === "PUBLISHED",
    publishedAt: row.publishedAt,
    readingTimeMinutes: row.readingTimeMinutes ?? undefined,
    featured: row.featured,
    tags: row.tags.map((t) => t.name),
  };
}

export function mapAchievement(row: RawAchievement): Achievement {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    organization: row.organization ?? undefined,
    date: row.date ?? undefined,
    url: row.url ?? undefined,
    imageUrl: row.imageUrl ?? undefined,
    displayOrder: row.displayOrder,
  };
}

export function mapSocialLink(row: RawSocialLink): SocialLink {
  return {
    id: row.id,
    platform: row.platform,
    label: row.label ?? undefined,
    url: row.url,
    icon: row.icon ?? undefined,
  };
}
