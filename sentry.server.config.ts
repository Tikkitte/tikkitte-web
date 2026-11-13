import * as Sentry from '@sentry/nextjs'

// Server actions only exist under these route segments. A "Failed to find
// Server Action" error anywhere else can't come from a real browser (no
// deploy ever had an action there to go stale), so it's a scanner probing
// with a made-up Next-Action header, e.g. POST /index. On these routes the
// same error can mean a real organizer kept a tab open across a deploy, so
// it still gets reported. If you add a server action to a page outside
// these segments, add its segment here too.
const ROUTES_WITH_SERVER_ACTIONS = /^(\/app)?\/(dashboard|admin)(\/|$)/

function isServerActionProbe(event: Sentry.ErrorEvent): boolean {
  const message = event.exception?.values?.[0]?.value ?? ''
  if (!message.includes('Failed to find Server Action')) return false
  // Set by captureRequestError from Next's onRequestError context: the route
  // file path (e.g. "/page", "/dashboard/events/[id]/page"), which stays
  // correct for the create.tikkitte.com root rewrite to /dashboard.
  const routePath = event.contexts?.nextjs?.router_path
  if (typeof routePath !== 'string') return false
  return !ROUTES_WITH_SERVER_ACTIONS.test(routePath)
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
  includeLocalVariables: true,
  beforeSend(event) {
    return isServerActionProbe(event) ? null : event
  },
})
