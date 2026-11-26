import { NextRequest, NextResponse } from "next/server"
import { pathLanguage, stripLocale, localizedPath, isPublicPath, isArticlePath } from "@/lib/locale-routing"

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const language = pathLanguage(pathname)
  const barePath = stripLocale(pathname)
  const publicPage = isPublicPath(barePath)
  // This portal is permanently removed. Internal links use portal 4 directly.
  if (barePath === "/portal/3" || barePath === "/portal/3/") {
    const lang = language || (request.cookies.get("lang")?.value === "ar" ? "ar" : "en")
    return new NextResponse(
      lang === "ar" ? "تمت إزالة هذه الصفحة نهائيًا." : "This page has been permanently removed.",
      { status: 410, headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex",
        "Cache-Control": "private, no-store",
      } }
    )
  }
  if (publicPage && !language && !isArticlePath(barePath)) {
    const target = request.nextUrl.clone()
    target.pathname = localizedPath(barePath, request.cookies.get("lang")?.value === "ar" ? "ar" : "en")
    const response = NextResponse.redirect(target, 307)
    response.headers.set("Cache-Control", "private, no-store")
    return response
  }
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")
  const backend = new URL(process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090")
  const development = process.env.NODE_ENV === "development"
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
    "script-src-attr 'none'",
    // Rich text, editor layouts and React components use inline styles.
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
    "font-src 'self' data: https://cdnjs.cloudflare.com",
    "img-src 'self' https: data: blob:",
    "media-src 'self' https: blob:",
    `connect-src 'self' ${backend.origin}${development ? " ws: http://127.0.0.1:8090" : ""}`,
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://drive.google.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(development ? [] : ["upgrade-insecure-requests"]),
  ].join("; ")
  const headers = new Headers(request.headers)
  headers.set("x-nonce", nonce)
  headers.set("Content-Security-Policy", policy)
  // Never trust a client-provided path header used for metadata.
  headers.delete("x-public-path")
  if (publicPage) headers.set("x-public-path", barePath)
  if (publicPage && language) {
    const cookieRequest = new NextRequest(request.url, { headers })
    cookieRequest.cookies.set("lang", language)
    headers.set("cookie", cookieRequest.headers.get("cookie") || "")
  }
  const target = request.nextUrl.clone()
  target.pathname = barePath
  const response = publicPage && language
    ? NextResponse.rewrite(target, { request: { headers } })
    : NextResponse.next({ request: { headers } })
  if (publicPage && language) response.cookies.set("lang", language, { path: "/", maxAge: 31536000, sameSite: "lax" })
  response.headers.set("Content-Security-Policy", policy)
  response.headers.set("Cache-Control", "private, no-store")
  return response
}

export const config = {
  matcher: ["/((?!api/|_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|css|js|mp4|pdf)$).*)"],
}
