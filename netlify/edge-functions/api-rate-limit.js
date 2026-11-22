// Netlify enforces this shared edge quota before invoking application handlers.
export default async function apiRateLimit(_request, context) {
  return context.next()
}

export const config = {
  path: "/api/*",
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["ip", "domain"] },
}
