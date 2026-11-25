// Node 22+: node --experimental-strip-types --test tests/poster-fit.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { posterFit } = await import('../lib/poster-fit.ts')

test('9:16 posters at a usable size are a perfect fit', () => {
  assert.equal(posterFit(1080, 1920), 'perfect')
  assert.equal(posterFit(720, 1280), 'perfect')
})
test('other shapes fit with blurred edges', () => {
  assert.equal(posterFit(1080, 1350), 'edges') // Instagram portrait
  assert.equal(posterFit(1080, 1080), 'edges') // square
  assert.equal(posterFit(1920, 1080), 'edges') // landscape
})
test('small images are flagged', () => {
  assert.equal(posterFit(400, 711), 'small')
  assert.equal(posterFit(500, 500), 'small')
  assert.equal(posterFit(600, 1067), 'perfect') // only just enlarged, still fine
})
