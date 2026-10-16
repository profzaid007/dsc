/** Search visible text and authored keywords, ignoring Arabic marks and letter case. */
export function matchesContentSearch(query: string, ...values: (string | undefined | null)[]): boolean {
  const normalize = (value: string) => value.normalize("NFKC").replace(/[\u064B-\u065F\u0670\u0640]/g, "").toLocaleLowerCase().trim()
  return normalize(values.filter(Boolean).join(" ")).includes(normalize(query))
}
