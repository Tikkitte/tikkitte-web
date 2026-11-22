export type ScannerSession = { eventId: string; eventName: string; token: string; expiresAt: string }
export const SESSION_KEY = 'scan_session_v1'
type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem' | 'removeItem'>

export function clearScannerSession(storage: Storage) {
  try { storage.removeItem(SESSION_KEY) } catch { /* Storage can be disabled. */ }
}
export function restoreScannerSession(storage: Storage, now = Date.now()): ScannerSession | null {
  try {
    const value = JSON.parse(storage.getItem(SESSION_KEY) ?? 'null')
    if (value && typeof value.eventId === 'string' && value.eventId && typeof value.eventName === 'string'
      && typeof value.token === 'string' && /^[a-f0-9]{64}$/i.test(value.token)
      && typeof value.expiresAt === 'string' && Date.parse(value.expiresAt) > now) {
      return { eventId:value.eventId, eventName:value.eventName, token:value.token, expiresAt:value.expiresAt }
    }
  } catch { /* Malformed or inaccessible storage is not a session. */ }
  clearScannerSession(storage)
  return null
}
export function saveScannerSession(storage: Storage, session: ScannerSession) {
  storage.setItem(SESSION_KEY, JSON.stringify(session))
}
export function isInvalidScannerSession(error: { message?: string; error?: string } | null | undefined) {
  return error?.error === 'invalid_session' || error?.message?.includes('invalid_session') === true
}
// Consume the fragment synchronously, before any API call or session restore.
export function takeScannerCode(location: Pick<Location, 'hash' | 'pathname' | 'search'>, history: Pick<History, 'replaceState' | 'state'>): string | null {
  const parameters = new URLSearchParams(location.hash.replace(/^#/, ''))
  if (!parameters.has('code')) return null
  const code = parameters.get('code') ?? ''
  history.replaceState(history.state, '', location.pathname + location.search)
  return code.replace(/[\s-]/g, '').toUpperCase()
}
