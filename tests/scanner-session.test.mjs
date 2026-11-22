// Node 22+: node --experimental-strip-types --test tests/scanner-session.test.mjs
import { afterEach, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { POST } from '../app/api/scanner/session/route.ts'

const envNames = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'VERCEL']
let previousEnv
let previousFetch
let calls
let result

beforeEach(() => {
  previousEnv = envNames.map(name => process.env[name])
  previousFetch = globalThis.fetch
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://scanner-test.supabase.invalid'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-server-key'
  process.env.VERCEL = '1'
  calls = []
  result = { eventId: 'event-a', eventName: 'Test', token: 'a'.repeat(64), expiresAt: '2026-12-01T12:00:00Z' }
  // No tests contact Supabase or use actual credentials.
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), body: JSON.parse(options.body) })
    return Response.json(result)
  }
})

afterEach(() => {
  globalThis.fetch = previousFetch
  envNames.forEach((name, i) => {
    if (previousEnv[i] === undefined) delete process.env[name]
    else process.env[name] = previousEnv[i]
  })
})

function request(body = { code: 'abcd-1234-abcd-1234-abcd' }, headers = {}) {
  return new Request('https://scanner.test/api/scanner/session', {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
  })
}
const hash = text => createHash('sha256').update(text).digest('hex')

test('normalizes codes, hashes trusted ingress IP, and never caches the token', async () => {
  const response = await POST(request(undefined, { 'x-vercel-forwarded-for': '203.0.113.10', 'x-forwarded-for': 'spoofed' }))
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.deepEqual(await response.json(), result)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'https://scanner-test.supabase.invalid/rest/v1/rpc/start_scanner_session')
  assert.deepEqual(calls[0].body, { p_code: 'ABCD1234ABCD1234ABCD', p_source: hash('203.0.113.10') })
})

test('client-supplied source and ordinary forwarded headers cannot bypass source limits', async () => {
  await POST(request({ code: 'A'.repeat(20), source: 'my-new-bucket' }, { 'x-forwarded-for': '203.0.113.50' }))
  assert.equal(calls[0].body.p_source, hash('shared-ingress'))
  process.env.VERCEL = '0'
  await POST(request(undefined, { 'x-vercel-forwarded-for': '203.0.113.51' }))
  assert.equal(calls[1].body.p_source, hash('shared-ingress'))
})

test('database rate limits become HTTP 429 with retry instructions', async () => {
  result = { error: 'rate_limited' }
  const response = await POST(request())
  assert.equal(response.status, 429)
  assert.equal(response.headers.get('retry-after'), '900')
  assert.equal(response.headers.get('cache-control'), 'no-store')
})

test('invalid codes use generic errors and still reach the shared database limiter', async () => {
  result = { error: 'invalid_code' }
  const response = await POST(request({ code: '1234' }))
  assert.equal(response.status, 401)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].body.p_code, '1234')
})

test('missing server credential fails closed without using the anonymous key', async () => {
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
  assert.equal((await POST(request())).status, 503)
  assert.equal(calls.length, 0)
})

test('database and network failures do not disclose internals or authorize a session', async () => {
  globalThis.fetch = async () => Response.json({ message: 'secret database details' }, { status: 500 })
  let response = await POST(request())
  assert.equal(response.status, 503)
  assert.equal((await response.text()).includes('secret'), false)
  globalThis.fetch = async () => { throw new Error('network failure') }
  response = await POST(request())
  assert.equal(response.status, 503)
})

test('malformed and oversized bodies are rejected before accessing the database', async () => {
  assert.equal((await POST(request({ code: 1234 }))).status, 400)
  assert.equal((await POST(request({ code: 'A'.repeat(1025) }))).status, 413)
  const malformed = new Request('https://scanner.test/api/scanner/session', { method: 'POST', body: '{' })
  assert.equal((await POST(malformed)).status, 400)
  assert.equal(calls.length, 0)
})

// Storage/fragment helpers used by the scanner's mount and invalidation paths.
const {restoreScannerSession,saveScannerSession,clearScannerSession,isInvalidScannerSession,takeScannerCode,SESSION_KEY}=await import('../lib/scan/session.ts')
function storage() { const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)} }
test('stored unexpired session survives a reload, without unrelated data',()=>{
  const store=storage(),session={eventId:'event-a',eventName:'Door',token:'a'.repeat(64),expiresAt:'2030-01-01T00:00:00Z'}
  saveScannerSession(store,session)
  assert.deepEqual(restoreScannerSession(store,Date.parse('2026-11-22')),session)
})
test('expired and malformed sessions are removed',()=>{
  const store=storage()
  store.setItem(SESSION_KEY,JSON.stringify({eventId:'event-a',eventName:'Door',token:'a'.repeat(64),expiresAt:'2020-01-01'}))
  assert.equal(restoreScannerSession(store),null);assert.equal(store.getItem(SESSION_KEY),null)
  store.setItem(SESSION_KEY,'bad json');assert.equal(restoreScannerSession(store),null);assert.equal(store.getItem(SESSION_KEY),null)
})
test('invalid_session from either RPC is recognized and storage can be cleared',()=>{
  const store=storage();store.setItem(SESSION_KEY,'sensitive')
  for (const error of [{error:'invalid_session'},{message:'invalid_session'}])assert.equal(isInvalidScannerSession(error),true)
  clearScannerSession(store);assert.equal(store.getItem(SESSION_KEY),null)
  assert.equal(isInvalidScannerSession({message:'network unavailable'}),false)
})
test('scanner fragment is consumed before session creation and never enters a request URL',async()=>{
  const location={hash:'#code=ABCD-1234-ABCD-1234-ABCD',pathname:'/scan',search:'?door=1'},events=[]
  const history={state:{test:true},replaceState:(state,title,url)=>{events.push({kind:'remove',url,state});location.hash=''}}
  const code=takeScannerCode(location,history)
  const response=await POST(request({code}))
  events.push({kind:'start'});assert.equal(response.status,200)
  assert.deepEqual(events,[{kind:'remove',url:'/scan?door=1',state:{test:true}},{kind:'start'}])
  assert.equal(location.hash,'');assert.equal(calls[0].body.p_code,'ABCD1234ABCD1234ABCD')
  assert.equal(takeScannerCode(location,history),null)
})
