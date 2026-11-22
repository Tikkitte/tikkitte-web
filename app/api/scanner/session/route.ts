import { createHash } from 'node:crypto'
import { isIP } from 'node:net'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const headers = { 'Cache-Control': 'no-store' }
const reply = (body: unknown, status: number) => Response.json(body, { status, headers })

export async function POST(request: Request) {
  // This credential stays on the server. Session creation is denied if the
  // server is not configured; there is no fallback to an anonymous RPC.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return reply({ error: 'Scanner temporarily unavailable.' }, 503)

  // Vercel sets this at its ingress. Do not trust arbitrary forwarded headers
  // on another host. A shared fallback bucket is safe for local/self-host use.
  // https://vercel.com/docs/headers/request-headers#x-vercel-forwarded-for
  const ingressIp = process.env.VERCEL === '1'
    ? request.headers.get('x-vercel-forwarded-for')?.trim()
    : null
  const source = ingressIp && isIP(ingressIp) ? ingressIp : 'shared-ingress'

  let code: string
  try {
    // Enforce the limit on actual bytes, including chunked requests.
    const reader = request.body?.getReader()
    if (!reader) return reply({ error: 'Enter a scanner code.' }, 400)
    const chunks: Uint8Array[] = []
    let size = 0
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.length
      if (size > 1024) {
        await reader.cancel()
        return reply({ error: 'Request too large.' }, 413)
      }
      chunks.push(value)
    }
    const body: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    if (!body || typeof body !== 'object' || !('code' in body) || typeof body.code !== 'string') {
      return reply({ error: 'Enter a scanner code.' }, 400)
    }
    code = body.code.replace(/[\s-]/g, '').toUpperCase()
  } catch {
    return reply({ error: 'Invalid request.' }, 400)
  }

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data, error } = await supabase.rpc('start_scanner_session', {
      p_code: code,
      p_source: createHash('sha256').update(source).digest('hex'),
    })
    if (error || !data) return reply({ error: 'Scanner temporarily unavailable.' }, 503)
    if (data.error === 'rate_limited') {
      return Response.json({ error: 'Too many attempts. Try again in 15 minutes.' }, {
        status: 429, headers: { ...headers, 'Retry-After': '900' },
      })
    }
    if (data.error) return reply({ error: 'Invalid scanner code. Check with your organizer.' }, 401)
    return reply(data, 200)
  } catch {
    return reply({ error: 'Scanner temporarily unavailable.' }, 503)
  }
}
