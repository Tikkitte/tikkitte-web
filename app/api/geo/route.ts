// The caller's country (ISO code) from Vercel's IP geolocation, or null when
// unknown (local dev, or Vercel couldn't place the IP). The mobile app uses
// it to preselect the checkout phone picker; the web event page reads the
// same header directly. Varies per caller, so never cached.
export function GET(request: Request) {
  const country = request.headers.get('x-vercel-ip-country')
  return Response.json(
    { country: country && /^[A-Z]{2}$/.test(country) ? country : null },
    { headers: { 'Cache-Control': 'private, no-store', 'Access-Control-Allow-Origin': '*' } },
  )
}
