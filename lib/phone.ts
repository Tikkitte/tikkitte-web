import { getCountries, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js/min'
import { PHONE_COUNTRIES } from './phoneCountries'

// Checkout phone rules. make-payment applies the same check with the same
// pinned libphonenumber-js (stealthstartup/supabase/functions/_shared/phone.ts),
// and the mobile app has a copy of this file (stealthstartup/lib/phone.ts).
// Keep them in sync so a number accepted here is never rejected at payment.

export type { CountryCode }

// Used when the buyer's location is unknown.
export const DEFAULT_PHONE_COUNTRY: CountryCode = 'GH'

const KNOWN_COUNTRIES = new Set<string>(getCountries())

export function isPhoneCountry(code: unknown): code is CountryCode {
  return typeof code === 'string' && KNOWN_COUNTRIES.has(code)
}

// The number in E.164 (+233241234567), or null if it isn't a valid number
// for `country`. Accepts the usual ways people write numbers, with or without
// the trunk 0. A number typed with + uses its own country code instead.
export function normalizePhoneNumber(raw: unknown, country: CountryCode = DEFAULT_PHONE_COUNTRY): string | null {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed || trimmed.length > 32 || !/^\+?[0-9\s().-]+$/.test(trimmed)) return null
  const parsed = parsePhoneNumberFromString(trimmed, country)
  return parsed?.isValid() ? parsed.number : null
}

// For a number typed, pasted or autofilled with +, what the field should
// change to: `country` for the picker, and once the number is complete,
// `national`, the number as written locally (053 951 1236) so the field
// doesn't repeat the code the picker shows. `national` is null while the
// number is incomplete. Null when nothing should change.
export function splitInternationalInput(
  raw: string,
  current: CountryCode,
): { country: CountryCode; national: string | null } | null {
  const trimmed = raw.trim()
  if (!trimmed.startsWith('+')) return null
  const e164 = normalizePhoneNumber(trimmed, current)
  const parsed = parsePhoneNumberFromString(e164 ?? trimmed)
  if (!parsed?.country) return null
  // Keep the picker where it is when the code is shared (US and Canada, UK
  // and Guernsey).
  const country = parsed.countryCallingCode === phoneCountryDial(current) ? current : parsed.country
  if (e164) {
    const national = parsed.formatNational()
    // Only rewrite the field if the local form still checks out as the same number.
    if (normalizePhoneNumber(national, country) === e164) return { country, national }
    if (parsed.country !== current && normalizePhoneNumber(national, parsed.country) === e164) {
      return { country: parsed.country, national }
    }
  }
  return country === current ? null : { country, national: null }
}

export function phoneCountryName(code: string): string {
  return PHONE_COUNTRIES.find(([c]) => c === code)?.[1] ?? code
}

export function phoneCountryDial(code: string): string {
  return PHONE_COUNTRIES.find(([c]) => c === code)?.[2] ?? ''
}

export function flagEmoji(code: string): string {
  return String.fromCodePoint(...[...code.toUpperCase()].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65))
}

export function phoneErrorMessage(raw: string, country: CountryCode): string {
  return raw.trim().startsWith('+')
    ? 'Please enter a valid phone number.'
    : `Please enter a valid ${phoneCountryName(country)} phone number, or pick a different country.`
}
