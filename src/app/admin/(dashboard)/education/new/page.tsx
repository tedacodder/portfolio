import PageHeader from "@/components/admin/PageHeader";
import EducationForm from "@/components/admin/resources/EducationForm";

export default function NewEducationPage() {
  return (
    <div>
      <PageHeader title="New education entry" />
      <EducationForm />
    </div>
  );
}
