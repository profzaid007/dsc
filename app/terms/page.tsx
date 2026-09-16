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
    title: { en: "Acceptance of Terms", ar: "الموافقة على الشروط" },
    body: {
      en: "By accessing or using dsc.ac, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services.",
      ar: "باستخدامك لموقع dsc.ac أو تصفحك له، فإنك توافق على الالتزام بشروط الخدمة هذه وبجميع القوانين واللوائح المعمول بها. إذا كنت لا توافق على أي جزء من هذه الشروط، فيتعين عليك عدم استخدام خدماتنا.",
    },
  },
  {
    title: { en: "Use of Services", ar: "استخدام الخدمات" },
    body: {
      en: "Our consultancy services are provided for lawful purposes only. You agree not to misuse the platform, attempt to disrupt our systems, or use the services to store or transmit any unlawful or harmful material.",
      ar: "تُقدم خدماتنا الاستشارية لأغراض مشروعة فقط. توافق على عدم إساءة استخدام المنصة، أو محاولة تعطيل أنظمتنا، أو استخدام الخدمات لتخزين أو نقل أي مواد غير قانونية أو ضارة.",
    },
  },
  {
    title: { en: "Accounts and Registration", ar: "الحسابات والتسجيل" },
    body: {
      en: "You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must provide accurate and up-to-date information when registering.",
      ar: "أنت مسؤول عن الحفاظ على سرية بيانات اعتماد حسابك وعن جميع الأنشطة التي تتم تحت حسابك. يجب عليك تقديم معلومات دقيقة ومحدثة عند التسجيل.",
    },
  },
  {
    title: { en: "Intellectual Property", ar: "الملكية الفكرية" },
    body: {
      en: "All content on this website, including text, graphics, logos, and materials related to our consultancy services, is the property of Development Secrets Consultancy and is protected by applicable intellectual property laws.",
      ar: "جميع المحتويات على هذا الموقع، بما في ذلك النصوص والرسومات والشعارات والمواد المتعلقة بخدماتنا الاستشارية، هي ملك لاستشارية أسرار التطور ومحمية بموجب قوانين الملكية الفكرية المعمول بها.",
    },
  },
  {
    title: { en: "Limitation of Liability", ar: "حدود المسؤولية" },
    body: {
      en: "To the fullest extent permitted by law, Development Secrets Consultancy shall not be liable for any indirect, incidental, or consequential damages arising out of your use of, or inability to use, our services.",
      ar: "في حدود أقصى ما يسمح به القانون، لا تتحمل استشارية أسرار التطور أي مسؤولية عن الأضرار غير المباشرة أو العرضية أو التبعية الناشئة عن استخدامكم لخدماتنا أو عدم القدرة على استخدامها.",
    },
  },
  {
    title: { en: "Governing Law", ar: "القانون الحاكم" },
    body: {
      en: "These Terms of Service shall be governed by and construed in accordance with the laws of the Hashemite Kingdom of Jordan. Any disputes shall be subject to the exclusive jurisdiction of the courts of Amman.",
      ar: "تخضع شروط الخدمة هذه ويتم تفسيرها وفقاً لقوانين المملكة الأردنية الهاشمية. وتكون أي نزاعات خاضعة للاختصاص القضائي الحصري لمحاكم عمان.",
    },
  },
]

export default function TermsPage() {
  const { lang } = useLang()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 md:py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">
            {t({ en: "Terms of Service", ar: "شروط الخدمة" }, lang)}
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
                en: "These Terms of Service govern your use of the Development Secrets Consultancy website and services available at dsc.ac.",
                ar: "تحكم شروط الخدمة هذه استخدامك لموقع استشارية أسرار التطور والخدمات المتاحة عبر dsc.ac.",
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
                en: "If you have any questions about these Terms of Service, please contact us at support@dsc.ac.",
                ar: "إذا كانت لديك أي أسئلة حول شروط الخدمة هذه، يرجى التواصل معنا على support@dsc.ac.",
              },
              lang
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}