import assert from "node:assert/strict"
import { test } from "node:test"
import { NextRequest } from "next/server"
import { proxy } from "../proxy"
import { stripLocale, localizedPath, pathLanguage, isPublicPath } from "../lib/locale-routing"

test("language links preserve the page and recognize only complete locale segments", () => {
  assert.equal(localizedPath("/", "ar"), "/ar")
  assert.equal(localizedPath("/ar/portal/1", "en"), "/en/portal/1")
  assert.equal(stripLocale("/en"), "/")
  assert.equal(stripLocale("/arabic"), "/arabic")
  assert.equal(pathLanguage("/english"), undefined)
  for (const path of ["/dashboard/cases", "/cms", "/login", "/api/contact", "/sitemap.xml"]) assert.equal(isPublicPath(path), false)
})

test("URL language overrides stale cookies on the first server response", () => {
  const response = proxy(new NextRequest("https://dsc.ac/ar/portal/1?q=test", { headers: { cookie: "lang=en; session=keep" } }))
  assert.equal(response.headers.get("x-middleware-rewrite"), "https://dsc.ac/portal/1?q=test")
  assert.match(response.headers.get("x-middleware-request-cookie") || "", /lang=ar/)
  assert.match(response.headers.get("x-middleware-request-cookie") || "", /session=keep/)
  assert.equal(response.headers.get("x-middleware-request-x-public-path"), "/portal/1")
  assert.ok(response.headers.get("Content-Security-Policy"))
})

test("legacy public navigation keeps the selected language and query", () => {
  const response = proxy(new NextRequest("https://dsc.ac/blog?q=test", { headers: { cookie: "lang=ar" } }))
  assert.equal(response.headers.get("location"), "https://dsc.ac/ar/blog?q=test")
  assert.equal(response.headers.get("Cache-Control"), "private, no-store")
})

test("articles stay independent and protected routes ignore spoofed metadata paths", () => {
  const article = proxy(new NextRequest("https://dsc.ac/blog/an-article"))
  assert.equal(article.headers.get("location"), null)
  assert.equal(article.headers.get("x-middleware-request-x-public-path"), "/blog/an-article")
  const privateResponse = proxy(new NextRequest("https://dsc.ac/dashboard", { headers: { "x-public-path": "/fake" } }))
  assert.equal(privateResponse.headers.get("location"), null)
  assert.equal(privateResponse.headers.get("x-middleware-request-x-public-path"), null)
})


test("retired portal is gone in every URL language without redirecting or rewriting", async () => {
  for (const path of ["/portal/3", "/ar/portal/3", "/en/portal/3", "/portal/3/", "/ar/portal/3?from=programmes"]) {
    const response = proxy(new NextRequest(`https://dsc.ac${path}`, { headers: { cookie: "lang=ar" } }))
    assert.equal(response.status, 410)
    assert.equal(response.headers.get("location"), null)
    assert.equal(response.headers.get("x-middleware-rewrite"), null)
    assert.equal(response.headers.get("x-robots-tag"), "noindex")
    assert.ok((await response.text()).length > 0)
  }
})
