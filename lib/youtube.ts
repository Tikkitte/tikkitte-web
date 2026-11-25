// The video ID the public event page embeds (components/EventPreviewGallery.tsx).
// Links without one are dropped from the page, so the editor rejects them.
// Parses the whole string as a URL: text around a link, other sites with a
// look-alike path and malformed IDs all return null.
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/

function isYouTubeHost(host: string) {
  return host === 'youtube.com' || host.endsWith('.youtube.com')
    || host === 'youtube-nocookie.com' || host.endsWith('.youtube-nocookie.com')
}

export function extractYouTubeId(input: string): string | null {
  let url: URL
  try {
    url = new URL(input.trim())
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  const host = url.hostname.toLowerCase()
  const [first, second] = url.pathname.split('/').filter(Boolean)
  let id: string | null | undefined = null
  if (host === 'youtu.be' || host === 'www.youtu.be') id = first
  else if (isYouTubeHost(host)) {
    if (first === 'watch') id = url.searchParams.get('v')
    else if (first === 'embed' || first === 'shorts' || first === 'live') id = second
  }
  return id && VIDEO_ID.test(id) ? id : null
}
