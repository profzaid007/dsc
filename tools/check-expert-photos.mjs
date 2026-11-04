// Read-only backend check. A baseline distinguishes already-empty profiles from
// newly lost references after a deployment, import, or backup restore.
import fs from "node:fs/promises"

const args = process.argv.slice(2)
const option = (key) => {
  const index = args.indexOf(key)
  return index < 0 ? undefined : args[index + 1]
}
const base = option("--url")?.replace(/\/$/, "")
if (!base)
  throw Error(
    "Usage: node tools/check-expert-photos.mjs --url https://backend.example [--baseline file.json] [--save-baseline new-file.json]"
  )
const records = []
for (let page = 1; ; page++) {
  const response = await fetch(
    `${base}/api/collections/experts_public/records?perPage=100&page=${page}`,
    { signal: AbortSignal.timeout(15000) }
  )
  if (!response.ok)
    throw Error(`Expert listing failed: HTTP ${response.status}`)
  const result = await response.json()
  records.push(...result.items)
  if (page >= result.totalPages) break
}
const broken = []
for (const record of records.filter((record) => record.profile_photo)) {
  const url = `${base}/api/files/expert_profiles/${record.id}/${encodeURIComponent(record.profile_photo)}`
  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(15000),
    })
    if (
      !response.ok ||
      !response.headers.get("content-type")?.startsWith("image/")
    )
      broken.push({ id: record.id, status: response.status })
  } catch (error) {
    broken.push({ id: record.id, error: error.message })
  }
}
const baselinePath = option("--baseline")
const previous = baselinePath
  ? JSON.parse(await fs.readFile(baselinePath, "utf8"))
  : null
if (previous && previous.base !== base)
  throw Error(
    "Baseline belongs to a different backend; use a matching baseline."
  )
const current = new Map(records.map((record) => [record.id, record]))
const lostReferences = (previous?.records || [])
  .filter(
    (record) => record.profile_photo && !current.get(record.id)?.profile_photo
  )
  .map((record) => record.id)
const summary = {
  checkedAt: new Date().toISOString(),
  base,
  total: records.length,
  withPhotos: records.filter((record) => record.profile_photo).length,
  withoutPhotos: records
    .filter((record) => !record.profile_photo)
    .map((record) => record.id),
  broken,
  lostReferences,
}
console.log(JSON.stringify(summary, null, 2))
if (broken.length || lostReferences.length) process.exitCode = 1
else if (option("--save-baseline")) {
  await fs.writeFile(
    option("--save-baseline"),
    JSON.stringify(
      {
        checkedAt: summary.checkedAt,
        base,
        records: records.map(({ id, profile_photo }) => ({
          id,
          profile_photo,
        })),
      },
      null,
      2
    ) + "\n",
    { flag: "wx" }
  )
}
