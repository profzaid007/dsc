type ContentFields = { content_en?: string; content_ar?: string }

export function cmsFieldErrorsMessage(
  errors: Record<string, string>,
  lang: "en" | "ar"
): string {
  const labels: Record<string, { en: string; ar: string }> = {
    content_en: { en: "English content", ar: "المحتوى الإنجليزي" },
    content_ar: { en: "Arabic content", ar: "المحتوى العربي" },
    title_en: { en: "English title", ar: "العنوان الإنجليزي" },
    title_ar: { en: "Arabic title", ar: "العنوان العربي" },
    slug: { en: "URL slug", ar: "معرف الرابط" },
    media: { en: "Media", ar: "الوسائط" },
  }
  return Object.entries(errors)
    .map(([field, message]) => `${labels[field]?.[lang] ?? field}: ${message}`)
    .join("\n")
}

/** Save the current editor buffer and retain drafts from the other language tab. */
export function cmsContentPayload(
  language: "en" | "ar",
  html: string,
  english: string,
  arabic: string
) {
  return {
    content_en: language === "en" ? html : english,
    content_ar: language === "ar" ? html : arabic,
  }
}

export class CmsSaveVerificationError extends Error {
  constructor() {
    super("The saved content could not be verified.")
    this.name = "CmsSaveVerificationError"
  }
}

/** Confirm persistence with a fresh read, rather than only trusting a completed click. */
export async function saveCmsPageVerified<
  T extends ContentFields & { id: string },
>(
  write: () => Promise<T>,
  read: (id: string) => Promise<T>,
  expected: Required<ContentFields>
): Promise<T> {
  const updated = await write()
  const persisted = await read(updated.id)
  const normalize = (html: string | undefined) =>
    (html ?? "").replace(/\r\n/g, "\n").trim()
  if (
    normalize(persisted.content_en) !== normalize(expected.content_en) ||
    normalize(persisted.content_ar) !== normalize(expected.content_ar)
  ) {
    throw new CmsSaveVerificationError()
  }
  return persisted
}
