// PocketBase 0.31 predates :changed. Preserve the same no-change conditions
// using :isset and equality, including explicitly submitted unchanged values.
export function compatibleProfileUpdateRule(rule) {
  if (typeof rule !== "string") return rule
  return rule.replace(
    /@request\.body\.([a-zA-Z0-9_]+):changed\s*=\s*false\b/g,
    "(@request.body.$1:isset = false || @request.body.$1 = $1)"
  )
}
