import PageHeader from "@/components/admin/PageHeader";
import CertificationForm from "@/components/admin/resources/CertificationForm";

export default function NewCertificationPage() {
  return (
    <div>
      <PageHeader title="New certification" />
      <CertificationForm />
    </div>
  );
}
