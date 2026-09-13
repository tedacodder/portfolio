import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/middleware";
import AdminShell from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/admin/Toast";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  // Server-side auth check: reads the session cookie directly against the
  // database (same helper every admin API route uses), so an anonymous
  // visitor never even receives the dashboard shell HTML, not just a
  // client-side redirect after the fact.
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <ToastProvider>
      <AdminShell user={user}>{children}</AdminShell>
    </ToastProvider>
  );
}
