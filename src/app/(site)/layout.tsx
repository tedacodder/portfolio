import { getProfile, getSocialLinks } from "@/lib/data";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/layout/ScrollProgress";

export const revalidate = 60;
// Chrome for the public-facing portfolio only (marketing pages, project
// list, articles). Intentionally NOT shared with /admin: the admin console
// has its own shell (sidebar + content grid) and must not be covered by the
// site's fixed top navbar/scroll bar or trailed by the site footer. Splitting
// this into its own route-group layout — instead of the previous setup where
// the root layout rendered Navbar/Footer/ScrollProgress around every route,
// including /admin — is what actually fixes the header/sidebar overlap
// rather than papering over it with margin/padding offsets.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [profile, socialLinks] = await Promise.all([getProfile(), getSocialLinks()]);

  return (
    <>
      <ScrollProgress />
      <Navbar name={profile?.name ?? ""} availability={profile?.availability} />
      <main>{children}</main>
      <Footer name={profile?.name ?? ""} socialLinks={socialLinks} />
    </>
  );
}
