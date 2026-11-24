// node --experimental-strip-types --test tests/organizer-onboarding.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { organizerRedirect } from '../lib/organizer-access.ts'
import { sortOrganizers } from '../lib/organizer-review.ts'
import { normalizeInstagram, normalizeApplicationPhone, normalizeSocialLink, socialHandle } from '../lib/organizer-application.ts'

test('each account state can reach exactly its onboarding destination without a redirect loop', () => {
  const paths = ['/dashboard','/dashboard/welcome','/dashboard/pending','/dashboard/declined','/dashboard/application']
  const states = [
    { state: { signedIn: false, profile: null, hasApplication: false }, destination: '/login' },
    { state: { signedIn: true, anonymous: true, profile: null, hasApplication: false }, destination: '/login' },
    { state: { signedIn: true, profile: null, hasApplication: false }, destination: '/dashboard/pending' },
    { state: { signedIn: true, profile: { approved: false, review_status: 'pending' }, hasApplication: false }, destination: '/dashboard/welcome' },
    { state: { signedIn: true, profile: { approved: false, review_status: 'declined' }, hasApplication: true }, destination: '/dashboard/declined' },
  ]
  for (const {state,destination} of states) {
    for (const path of paths) assert.equal(organizerRedirect(path,state), path === destination ? null : destination)
    if (destination !== '/login') assert.equal(organizerRedirect(destination,state),null)
  }
  for (const review_status of ['pending','needs_info','approved']) {
    const approved = review_status === 'approved'
    const state = { signedIn: true, profile: { approved,review_status }, hasApplication: !approved }
    assert.equal(organizerRedirect('/dashboard',state),null)
    assert.equal(organizerRedirect('/dashboard/events/new',state),null)
    for (const path of ['/dashboard/pending','/dashboard/welcome','/dashboard/declined']) assert.equal(organizerRedirect(path,state),'/dashboard')
    assert.equal(organizerRedirect('/dashboard/application',state),approved ? '/dashboard' : null)
    assert.equal(organizerRedirect('/dashboard/audience',state),approved ? null : '/dashboard')
    assert.equal(organizerRedirect('/dashboard/audience/export',state),approved ? null : '/dashboard')
  }
})
test('application contact details normalize without accepting arbitrary links', () => {
  assert.equal(normalizeApplicationPhone('024 123 4567'),'+233241234567')
  assert.equal(normalizeApplicationPhone('+233241234567'),'+233241234567')
  assert.equal(normalizeApplicationPhone('123'),null)
  for (const input of ['@club.aria','club.aria','https://www.instagram.com/club.aria/?ref=test','https://www.instagram.com/club.aria/reels/']) assert.equal(normalizeInstagram(input),'https://instagram.com/club.aria')
  for (const input of ['https://evil.test/club','javascript:alert(1)','https://instagram.com/p/abc','https://instagram.com/reel/abc','https://instagram.com/stories/club','<script>']) assert.equal(normalizeInstagram(input),null)
  assert.equal(normalizeInstagram(''),'')
})
test('social links accept a handle or a profile link and store the profile link', () => {
  for (const input of ['club.aria','@club.aria','https://www.tiktok.com/@club.aria?lang=en','tiktok.com/@club.aria']) assert.equal(normalizeSocialLink('tiktok',input),'https://www.tiktok.com/@club.aria')
  for (const input of ['clubaria','@clubaria','https://www.snapchat.com/add/clubaria?share_id=1','snapchat.com/@clubaria']) assert.equal(normalizeSocialLink('snapchat',input),'https://www.snapchat.com/add/clubaria')
  assert.equal(normalizeSocialLink('instagram','@club.aria'),'https://instagram.com/club.aria')
  assert.equal(normalizeSocialLink('tiktok','https://vm.tiktok.com/ZMabc123/'),'https://vm.tiktok.com/ZMabc123/')
  for (const input of ['https://evil.test/@club','javascript:alert(1)','club aria','<script>']) {
    assert.equal(normalizeSocialLink('tiktok',input),null)
    assert.equal(normalizeSocialLink('snapchat',input),null)
  }
  assert.equal(normalizeSocialLink('snapchat',' '),'')
  assert.equal(socialHandle('tiktok','https://www.tiktok.com/@club.aria'),'@club.aria')
  assert.equal(socialHandle('snapchat','https://www.snapchat.com/add/clubaria'),'@clubaria')
  assert.equal(socialHandle('instagram','https://instagram.com/club.aria'),'@club.aria')
  assert.equal(socialHandle('tiktok','https://vm.tiktok.com/ZMabc123/'),'https://vm.tiktok.com/ZMabc123/')
  assert.equal(socialHandle('instagram',null),'')
})

test('admin queue sorts only pending by application age, and other views by newest signup', () => {
  const rows = [
    {id:'old',review_status:'pending',created_at:'2026-01-01',application:{submitted_at:'2026-11-20'}},
    {id:'new',review_status:'needs_info',created_at:'2026-11-01',application:{submitted_at:'2026-11-10'}},
    {id:'approved-old',review_status:'approved',created_at:'2026-02-01',application:null},
    {id:'approved-new',review_status:'approved',created_at:'2026-10-01',application:null},
    {id:'declined-old',review_status:'declined',created_at:'2026-03-01',application:null},
    {id:'declined-new',review_status:'declined',created_at:'2026-09-01',application:null},
  ]
  assert.deepEqual(sortOrganizers(rows,'pending').map(row=>row.id),['new','old'])
  assert.deepEqual(sortOrganizers(rows,'approved').map(row=>row.id),['approved-new','approved-old'])
  assert.deepEqual(sortOrganizers(rows,'declined').map(row=>row.id),['declined-new','declined-old'])
  assert.equal(sortOrganizers(rows,'all')[0].id,'new')
})
