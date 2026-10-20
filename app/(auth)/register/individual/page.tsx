import { cookies } from "next/headers"
import { IndividualRegistrationForm } from "@/components/register/IndividualRegistrationForm"
import { RegistrationHeading } from "@/components/register/RegistrationHeading"

export default function IndividualRegisterPage() {
  return (
    <div className="space-y-6">
      <RegistrationHeading
        title={{ en: "Register as Individual", ar: "التسجيل كفرد" }}
      />
      <IndividualRegistrationForm />
    </div>
  )
}

export async function generateMetadata() {
  return {
    title:
      (await cookies()).get("lang")?.value === "ar"
        ? "التسجيل كفرد"
        : "Individual registration",
  }
}
