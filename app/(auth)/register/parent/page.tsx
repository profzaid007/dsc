import { cookies } from "next/headers"
import { ParentRegistrationForm } from "@/components/register/ParentRegistrationForm"
import { RegistrationHeading } from "@/components/register/RegistrationHeading"

export default function ParentRegisterPage() {
  return (
    <div className="space-y-6">
      <RegistrationHeading
        title={{ en: "Register as Parent", ar: "التسجيل كولي أمر" }}
      />
      <ParentRegistrationForm />
    </div>
  )
}

export async function generateMetadata() {
  return {
    title:
      (await cookies()).get("lang")?.value === "ar"
        ? "تسجيل ولي أمر"
        : "Parent registration",
  }
}
