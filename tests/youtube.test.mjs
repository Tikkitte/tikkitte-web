// Node 22+: node --experimental-strip-types --test tests/youtube.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { extractYouTubeId } = await import('../lib/youtube.ts')

const ID = 'Q8mR2xLp4Ts'

test('accepts the YouTube links the event page can play', () => {
  for (const url of [
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}&t=30s`,
    `https://m.youtube.com/watch?v=${ID}`,
    `https://youtu.be/${ID}?si=abc`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube-nocookie.com/embed/${ID}`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://www.youtube.com/live/${ID}?feature=share`,
    `  https://youtu.be/${ID}  `,
  ]) assert.equal(extractYouTubeId(url), ID, url)
})

test('rejects anything that is not exactly a YouTube video link', () => {
  for (const url of [
    'not a URL',
    `Watch this: https://youtu.be/${ID}`,
    `youtu.be/${ID}`,
    `https://example.com/watch?v=${ID}`,
    `https://notyoutube.com/watch?v=${ID}`,
    `https://youtube.com.evil.example/watch?v=${ID}`,
    `https://www.youtube.com/watch?v=${ID}X`,
    `https://www.youtube.com/watch?v=short`,
    `https://youtu.be/${ID}X`,
    'https://www.youtube.com/@tikkitte',
    'https://vimeo.com/123456789',
    `javascript:alert('https://youtu.be/${ID}')`,
  ]) assert.equal(extractYouTubeId(url), null, url)
})
