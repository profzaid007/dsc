"use client"

import { useState, type FormEvent } from "react"
import { useLang } from "@/lib/lang-context"
import { t } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, Mail, MapPin, Loader2, Send } from "lucide-react"

export default function ContactPage() {
  const { lang } = useLang()
  const [name, setName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      // TODO: integrate with backend API
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setDone(true)
    } catch {
      setError(
        t(
          {
            en: "Something went wrong. Please try again later.",
            ar: "حدث خطأ ما. يرجى المحاولة مرة أخرى لاحقًا.",
          },
          lang
        )
      )
    } finally {
      setSubmitting(false)
    }
  }

  const accentColor = "#0b1a30"
  const goldColor = "#c9a227"

  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <section
        className="py-16 md:py-24"
        style={{ backgroundColor: accentColor }}
      >
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-4 inline-block">
            <div
              className="h-1 w-16"
              style={{ backgroundColor: goldColor }}
            />
          </div>
          <h1 className="text-3xl font-bold text-white md:text-5xl">
            {t({ en: "Contact Us", ar: "تواصل معنا" }, lang)}
          </h1>
          <p
            className="mx-auto mt-4 max-w-2xl text-base leading-relaxed md:text-lg"
            style={{ color: "#d4a017" }}
          >
            {t(
              {
                en: "Have a question or want to work with us? Fill out the form below and we will get back to you as soon as possible.",
                ar: "هل لديك سؤال أو ترغب في العمل معنا؟ املأ النموذج أدناه وسنعود إليك في أقرب وقت ممكن.",
              },
              lang
            )}
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="flex-1 bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {/* Left: Contact Info */}
            <div className="flex flex-col gap-8">
              <div>
                <h2
                  className="mb-2 text-2xl font-bold"
                  style={{ color: accentColor }}
                >
                  {t(
                    { en: "Get in Touch", ar: "تواصل معنا" },
                    lang
                  )}
                </h2>
                <p className="text-muted-foreground">
                  {t(
                    {
                      en: "We are here to help and answer any question you might have. We look forward to hearing from you.",
                      ar: "نحن هنا للمساعدة والإجابة على أي سؤال قد يكون لديك. نتطلع إلى سماع منك.",
                    },
                    lang
                  )}
                </p>
              </div>

              <Card className="border-0 shadow-none">
                <CardContent className="flex flex-col gap-6 ps-6">
                  <div className="flex items-start gap-4">
                    <Phone className="h-5 w-5 shrink-0 mt-0.5" style={{ color: goldColor }} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {t({ en: "Phone", ar: "الهاتف" }, lang)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        +962 788 689123
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail className="h-5 w-5 shrink-0 mt-0.5" style={{ color: goldColor }} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {t({ en: "Email", ar: "البريد الإلكتروني" }, lang)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        info@dsc.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin className="h-5 w-5 shrink-0 mt-0.5" style={{ color: goldColor }} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {t({ en: "Address", ar: "العنوان" }, lang)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          {
                            en: "Riyadh, Kingdom of Saudi Arabia",
                            ar: "الرياض، المملكة العربية السعودية",
                          },
                          lang
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <i className="fab fa-whatsapp mt-0.5" style={{ color: goldColor, fontSize: 20 }} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {t({ en: "WhatsApp", ar: "واتساب" }, lang)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        +962 788 689123
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="h-5 w-5 shrink-0 mt-0.5" style={{ color: goldColor }} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {t({ en: "Telephone", ar: "هاتف ثابت" }, lang)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        +962 6 5652527
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Contact Form */}
            <Card className="shadow-sm">
              <CardContent className="p-6 md:p-8">
                {done ? (
                  <div className="py-12 text-center">
                    <div
                      className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: "#22c55e" }}
                    >
                      <Send className="h-6 w-6" />
                    </div>
                    <h3
                      className="text-xl font-bold"
                      style={{ color: accentColor }}
                    >
                      {t(
                        {
                          en: "Message Sent Successfully!",
                          ar: "تم إرسال الرسالة بنجاح!",
                        },
                        lang
                      )}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t(
                        {
                          en: "Thank you for reaching out. We will get back to you within 48 hours.",
                          ar: "شكرًا على تواصلك. سنعود إليك خلال 48 ساعة.",
                        },
                        lang
                      )}
                    </p>
                    <Button
                      className="mt-6"
                      variant="outline"
                      onClick={() => {
                        setDone(false)
                        setName("")
                        setPhoneNumber("")
                        setEmail("")
                        setDescription("")
                      }}
                    >
                      {t(
                        { en: "Send Another Message", ar: "إرسال رسالة أخرى" },
                        lang
                      )}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        {t({ en: "Name", ar: "الاسم" }, lang)}
                      </label>
                      <Input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t(
                          { en: "Your full name", ar: "اسمك الكامل" },
                          lang
                        )}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        {t({ en: "Phone Number", ar: "رقم الهاتف" }, lang)}
                      </label>
                      <Input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder={t(
                          {
                            en: "Your phone number",
                            ar: "رقم هاتفك",
                          },
                          lang
                        )}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        {t({ en: "Email", ar: "البريد الإلكتروني" }, lang)}
                      </label>
                      <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t(
                          {
                            en: "your@email.com",
                            ar: "بريدك@الإلكتروني.com",
                          },
                          lang
                        )}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        {t(
                          { en: "Description", ar: "الوصف" },
                          lang
                        )}
                      </label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t(
                          {
                            en: "How can we help you?",
                            ar: "كيف يمكننا مساعدتك؟",
                          },
                          lang
                        )}
                        rows={4}
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-red-500">{error}</p>
                    )}

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full text-base font-semibold"
                      style={{
                        backgroundColor: goldColor,
                        color: "#fff",
                      }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t(
                            { en: "Sending...", ar: "جاري الإرسال..." },
                            lang
                          )}
                        </>
                      ) : (
                        t({ en: "Submit", ar: "إرسال" }, lang)
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
