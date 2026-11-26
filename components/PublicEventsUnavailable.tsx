"use client"
import { useRouter } from "next/navigation"
import { useLang } from "@/lib/lang-context"
import { Button } from "@/components/ui/button"
export function PublicEventsUnavailable() {
  const router = useRouter()
  const { lang } = useLang()
  return (
    <div role="alert" className="mx-auto max-w-3xl space-y-4 px-4 py-12">
      <h1 className="text-2xl font-bold">
        {lang === "ar"
          ? "تعذر تحميل الفعاليات"
          : "Events are temporarily unavailable"}
      </h1>
      <p>
        {lang === "ar"
          ? "يرجى المحاولة مرة أخرى بعد قليل."
          : "Please try again in a moment."}
      </p>
      <Button onClick={() => router.refresh()}>
        {lang === "ar" ? "إعادة المحاولة" : "Try again"}
      </Button>
    </div>
  )
}
