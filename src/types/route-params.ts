// Shared route param types for Next.js App Router dynamic segments.
export interface RouteParams<T extends Record<string, string>> {
  params: Promise<T>;
}
