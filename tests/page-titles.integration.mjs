import assert from "node:assert/strict"
const base = process.env.SSR_BASE_URL || "http://localhost:3000"
async function html(path) {
  const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(40000) })
  assert.equal(response.status, 200, path)
  return (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
}
const portal = await html("/en/portal/1")
const servicePaths = [...new Set([...portal.matchAll(/href="(\/info\/[^"?#]+)"/g)].map(match => match[1]))].filter(path => /autis|adhd|attention|hyper/i.test(path))
assert.ok(servicePaths.length >= 2, "Published autism and ADHD fixtures required")
const blog = await html("/en/blog")
const article = blog.match(/href="(\/blog\/[^"/]+)"/)?.[1]
assert.ok(article, "Published article fixture required")
const result = new Map()
for (const lang of ["ar", "en"]) {
  const titles = new Set()
  for (const path of ["", "/portal/1", "/contact-us", "/programmes", ...servicePaths, article]) {
    const body = await html(`/${lang}${path}`)
    const matches = [...body.matchAll(/<title>(.*?)<\/title>/g)]
    assert.equal(matches.length, 1, path)
    const title = matches[0][1]
    assert.match(title, /\| DSC$/)
    assert.doesNotMatch(title, /DSC.*DSC|عمّان|عمان|Amman|online|أونلاين/i)
    assert.ok(!titles.has(title), `${lang}: repeated title ${title}`)
    titles.add(title)
    result.set(`/${lang}${path}`, title)
    console.log(`PASS /${lang}${path}: ${title}`)
  }
}
assert.notEqual(result.get("/ar/portal/1"), result.get("/en/portal/1"))
// Independent articles retain their authored titles across interface languages.
assert.equal(result.get(`/ar${article}`), result.get(`/en${article}`))
