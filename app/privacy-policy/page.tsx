"use client"

import { useLang } from "@/lib/lang-context"
import { t } from "@/lib/i18n"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const SECTIONS = [
  {
    title: { en: "Information We Collect", ar: "المعلومات التي نجمعها" },
    body: {
      en: "We collect information you provide directly, such as your name, email address, phone number, and any other details you submit through our forms. We may also automatically collect basic usage data to improve our services.",
      ar: "نجمع المعلومات التي تقدمها مباشرة، مثل اسمك وبريدك الإلكتروني ورقم هاتفك وأي تفاصيل أخرى ترسلها عبر نماذجنا. قد نقوم أيضاً بجمع بيانات أساسية عن الاستخدام لتحسين خدماتنا.",
    },
  },
  {
    title: { en: "How We Use Your Information", ar: "كيفية استخدامنا لمعلوماتك" },
    body: {
      en: "We use the information we collect to provide and improve our consultancy services, to communicate with you about your requests, and to comply with legal obligations. We do not sell your personal information to third parties.",
      ar: "نستخدم المعلومات التي نجمعها لتقديم خدماتنا الاستشارية وتحسينها، والتواصل معك بخصوص طلباتك، والامتثال للالتزامات القانونية. نحن لا نبيع معلوماتك الشخصية لأي طرف ثالث.",
    },
  },
  {
    title: { en: "Cookies and Analytics", ar: "ملفات تعريف الارتباط والتحليلات" },
    body: {
      en: "Our website may use cookies and similar technologies to remember your preferences, such as your language selection, and to understand how visitors use our site. You can disable cookies through your browser settings.",
      ar: "قد يستخدم موقعنا ملفات تعريف الارتباط وتقنيات مشابهة لتذكر تفضيلاتك، مثل اختيار اللغة، وفهم كيفية استخدام الزوار لموقعنا. يمكنك تعطيل ملفات تعريف الارتباط من خلال إعدادات المتصفح.",
    },
  },
  {
    title: { en: "Data Security", ar: "أمن البيانات" },
    body: {
      en: "We take reasonable measures to protect your personal information from unauthorized access, alteration, or disclosure. However, no method of transmission over the internet is completely secure.",
      ar: "نتخذ إجراءات معقولة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التعديل أو الإفصاح. ومع ذلك، لا توجد طريقة لنقل المعلومات عبر الإنترنت آمنة بشكل كامل.",
    },
  },
  {
    title: { en: "Your Rights", ar: "حقوقك" },
    body: {
      en: "You may request access to, correction of, or deletion of your personal information at any time. Please contact us using the details provided on our contact page to exercise these rights.",
      ar: "يحق لك طلب الوصول إلى معلوماتك الشخصية أو تصحيحها أو حذفها في أي وقت. يرجى التواصل معنا باستخدام التفاصيل المتوفرة في صفحة التواصل لدينا لممارسة هذه الحقوق.",
    },
  },
]

export default function PrivacyPolicyPage() {
  const { lang } = useLang()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 md:py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">
            {t(
              { en: "Privacy Policy", ar: "سياسة الخصوصية" },
              lang
            )}
          </CardTitle>
          <CardDescription>
            {t(
              {
                en: "Last updated: January 2026",
                ar: "آخر تحديث: يناير 2026",
              },
              lang
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            {t(
              {
                en: "This Privacy Policy explains how Development Secrets Consultancy (\"we\", \"us\", or \"our\") collects, uses, and protects the personal information you share with us through dsc.ac.",
                ar: "توضح سياسة الخصوصية هذه كيف تقوم استشارية أسرار التطور (\"نحن\" أو \"إياك\" أو \"مؤسستنا\") بجمع المعلومات الشخصية التي تشاركها معنا عبر dsc.ac واستخدامها وحمايتها.",
              },
              lang
            )}
          </p>
          {SECTIONS.map((section, i) => {
            const title = t(section.title, lang)
            const body = t(section.body, lang)
            return (
              <section key={i}>
                <h2 className="mb-2 text-lg font-semibold text-foreground">
                  {title}
                </h2>
                <p className="text-sm text-muted-foreground">{body}</p>
              </section>
            )
          })}
          <p className="text-sm text-muted-foreground">
            {t(
              {
                en: "If you have any questions about this Privacy Policy, please contact us at support@dsc.ac.",
                ar: "إذا كانت لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا على support@dsc.ac.",
              },
              lang
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}