import { OrganizationRegistrationForm } from "@/components/register/OrganizationRegistrationForm"
import { RegistrationHeading } from "@/components/register/RegistrationHeading"

export default function CareFoundationRegisterPage() {
  return <div className="space-y-6">
    <RegistrationHeading title={{ en: "Register as Care Foundation", ar: "التسجيل كمؤسسة رعاية" }} />
    <OrganizationRegistrationForm accountType="care_foundation" />
  </div>
}
