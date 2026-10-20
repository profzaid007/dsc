import { cookies } from "next/headers"
import { OrganizationRegistrationForm } from "@/components/register/OrganizationRegistrationForm"
import { RegistrationHeading } from "@/components/register/RegistrationHeading"

export default function OrganizationRegisterPage() {
  return (
    <div className="space-y-6">
      <RegistrationHeading
        title={{ en: "Register as Organization", ar: "التسجيل كمؤسسة" }}
      />
      <OrganizationRegistrationForm />
    </div>
  )
}

export async function generateMetadata() {
  return {
    title:
      (await cookies()).get("lang")?.value === "ar"
        ? "تسجيل مؤسسة"
        : "Organization registration",
  }
}
