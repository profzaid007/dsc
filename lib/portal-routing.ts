/** Innovation (3) has been merged into education (4). */
export function canonicalPortalId(id: string): string {
  return id === "3" ? "4" : id
}

/** Update only internal portal links; unrelated external URLs remain untouched. */
export function canonicalPortalHref(href: string): string {
  return href.replace(/^((?:https?:\/\/(?:www\.)?dsc\.ac)?(?:\/(?:ar|en))?\/?portal\/)3(?=\/?(?:[?#]|$))/, (_, prefix: string) => `${prefix}4`)
}
