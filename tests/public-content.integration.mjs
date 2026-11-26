// Run against a local production server with published portal and blog fixtures:
// SSR_BASE_URL=http://localhost:3000 node tests/public-content.integration.mjs
import assert from "node:assert/strict"
const base = process.env.SSR_BASE_URL || "http://localhost:3000"
async function page(path) {
  const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(40000) })
  assert.equal(response.status, 200, path)
  const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
  assert.doesNotMatch(html, /Loading portals…|Loading articles…/, path)
  const footer = html.match(/<footer[\s\S]*?<\/footer>/)?.[0] || ""
  assert.match(footer, /href="\/portal\//, `${path}: footer portals in server HTML`)
  return html
}
for (const lang of ["ar", "en"]) {
  const home = await page(`/${lang}`)
  assert.match(home, new RegExp(`href="/${lang}/consultation"`))
  assert.match(home, /href="\/info\//, "Published services appear before hydration")
  const portalPath = home.match(/href="(\/portal\/[^"/]+)"/)?.[1]
  assert.ok(portalPath)
  const portal = await page(`/${lang}${portalPath}`)
  assert.match(portal, /href="\/register(?:\/[^"/]+)?"/, "Get Started has a registration link")
  const blog = await page(`/${lang}/blog`)
  assert.match(blog, /href="\/blog\/[^"/]+"/, "Published article links appear before hydration")
  const consultation = await page(`/${lang}/consultation`)
  assert.match(consultation, /id="consult-name"/, "Consultation link has a directly accessible form")
  console.log(`PASS ${lang}: homepage, footer, services, blog and consultation without JavaScript`)
}
