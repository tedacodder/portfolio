import PageHeader from "@/components/admin/PageHeader";
import ProfileForm from "@/components/admin/resources/ProfileForm";
import { getProfileOrNull } from "@/lib/services/profile.service";

export default async function ProfilePage() {
  const profile = await getProfileOrNull();
  return (
    <div>
      <PageHeader title="Profile" description="Drives the hero, about, and site-wide metadata." />
      <ProfileForm profile={profile} />
    </div>
  );
}
