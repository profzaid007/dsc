type ContentFields = { content_en?: string; content_ar?: string }

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
