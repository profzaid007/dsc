export default async function siteRateLimit(_request, context) {
  return context.next()
}

export const config = {
  path: "/*",
  rateLimit: { windowLimit: 600, windowSize: 60, aggregateBy: ["ip", "domain"] },
}
