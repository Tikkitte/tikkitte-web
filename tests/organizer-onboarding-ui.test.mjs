// Run against the isolated fixture checkout described in the V1.1 handoff:
// ONBOARDING_UI_BASE_URL=http://127.0.0.1:3317 PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs
// node --test tests/organizer-onboarding-ui.test.mjs
import {test,before,after} from 'node:test'
import assert from 'node:assert/strict'
import {mkdirSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
const enabled=Boolean(process.env.ONBOARDING_UI_BASE_URL)
const base=process.env.ONBOARDING_UI_BASE_URL
const screenshots=process.env.ONBOARDING_SCREENSHOTS ?? join(tmpdir(),'organizer-intro-screenshots')
let browser
before(async()=>{
  if(!enabled)return
  const {chromium}=await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright')
  browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{})})
  mkdirSync(screenshots,{recursive:true})
})
after(async()=>{await browser?.close()})
async function page(width=1280,failTerms=false) {
  const value=await browser.newPage({viewport:{width,height:844}})
  const calls=[]
  await value.route('http://localhost:54321/**',async route=>{
    const request=route.request();calls.push({url:request.url(),method:request.method(),body:request.postData()})
    const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,PATCH,OPTIONS','Access-Control-Allow-Headers':request.headers()['access-control-request-headers'] ?? 'apikey,authorization,content-type,x-client-info,prefer,accept-profile,content-profile'}
    if(request.method()==='OPTIONS')return route.fulfill({status:204,headers})
    if(failTerms&&request.url().includes('get_event_publish_terms'))return route.fulfill({status:503,headers,contentType:'application/json',body:'{"message":"Test outage"}'})
    const result=request.url().includes('get_event_publish_terms')?{approved:true,firstPublish:true,buyerFeePercent:2,platformFeePercent:8,termsVersion:null,termsAccepted:true}
      :request.url().includes('/event?')?{published:false,ever_published:true}
      :request.url().includes('/organizer_application')?{organizer_id:'11111111-1111-4111-8111-111111111111'}:{}
    return route.fulfill({status:200,headers,contentType:'application/json',body:JSON.stringify(result)})
  })
  return {page:value,calls}
}
test('Unpublish works without approval or a working terms RPC; pending Publish is disabled',{skip:!enabled},async()=>{
  const {page:p,calls}=await page(1280,true)
  try {
    await p.goto(`${base}/dashboard?view=publish&published=true`)
    assert.equal(await p.getByRole('button',{name:'Unpublish',exact:true}).isEnabled(),true)
    await p.getByRole('button',{name:'Unpublish',exact:true}).click()
    const response=p.waitForResponse(response=>response.request().method()==='PATCH')
    await p.getByRole('dialog').getByRole('button',{name:'Unpublish',exact:true}).click()
    assert.equal((await response).status(),200)
    assert.equal(calls.some(call=>call.url.includes('get_event_publish_terms')),false)
    await p.goto(`${base}/dashboard?view=publish`)
    assert.equal(await p.getByRole('button',{name:'Publish event',exact:true}).isDisabled(),true)
    assert.match(await p.locator('main').innerText(),/Publishing unlocks once your account is approved/)
  }finally{await p.close()}
})
test('intro navigation, dots, close actions, wording and focus at desktop width',{skip:!enabled},async()=>{
  const {page:p}=await page()
  try {
    await p.goto(`${base}/dashboard?intro=1`)
    const dialog=p.getByRole('dialog')
    await dialog.waitFor()
    assert.match(await dialog.innerText(),/while we review your account/)
    assert.equal(await p.evaluate(()=>document.querySelector('dialog').contains(document.activeElement)),true)
    await p.keyboard.press('Shift+Tab')
    assert.equal(await p.evaluate(()=>document.querySelector('dialog').contains(document.activeElement)),true)
    // Back is hidden on slide 1; keyboard focus must land on Next, not drop out of the dialog.
    await dialog.getByRole('button',{name:'Next',exact:true}).click()
    await dialog.getByRole('button',{name:'Back',exact:true}).press('Enter')
    assert.equal(await dialog.getByRole('heading').textContent(),'Create your event')
    assert.equal(await p.evaluate(()=>document.activeElement?.textContent),'Next')
    for(let i=1;i<=4;i++) {
      await dialog.getByRole('button',{name:`Go to step ${i}`}).click()
      await p.screenshot({path:join(screenshots,`desktop-${i}.png`)})
    }
    await dialog.getByRole('button',{name:'Back',exact:true}).click()
    assert.equal(await dialog.getByRole('heading').textContent(),'Run the event')
    assert.equal(await dialog.getByText('(after approval)',{exact:true}).count(),2)
    await dialog.getByRole('button',{name:'Next',exact:true}).click()
    await dialog.getByRole('button',{name:'Go to my checklist',exact:true}).click()
    await p.waitForURL(`${base}/dashboard`)
    assert.equal(await p.getByRole('dialog').count(),0)
    assert.equal(await p.evaluate(()=>document.activeElement?.hasAttribute('data-organizer-intro-trigger')),true)
    await p.getByRole('link',{name:'See what you can do'}).click()
    await p.getByRole('dialog').waitFor()
    await p.keyboard.press('Escape');await p.waitForURL(`${base}/dashboard`)
    await p.getByRole('link',{name:'See what you can do'}).click()
    await p.getByRole('dialog').getByRole('button',{name:'Skip intro',exact:true}).click()
    await p.waitForURL(`${base}/dashboard`)
    await p.goto(`${base}/dashboard?intro=1&approved=true`)
    assert.doesNotMatch(await p.getByRole('dialog').innerText(),/while we review/)
    await p.getByRole('button',{name:'Go to step 3'}).click()
    assert.equal(await p.getByRole('dialog').getByText('(after approval)',{exact:true}).count(),0)
  }finally{await p.close()}
})
test('mobile intro, application entry and removal of the placeholder agreement',{skip:!enabled},async()=>{
  const {page:p,calls}=await page(390)
  try {
    await p.goto(`${base}/dashboard?view=application`)
    await p.getByLabel('What best describes you?').selectOption('promoter')
    await p.getByLabel('Phone number').fill('024 123 4567')
    await p.getByLabel('Best way to reach you').selectOption('whatsapp')
    await p.getByRole('button',{name:'Send application',exact:true}).click()
    await p.waitForURL(`${base}/dashboard?intro=1`)
    const dialog=p.getByRole('dialog');await dialog.waitFor()
    const insert=calls.find(call=>call.method==='POST'&&call.url.includes('/organizer_application'))
    assert.equal(JSON.parse(insert.body).phone,'+233241234567')
    for(let i=1;i<=4;i++) {
      await p.screenshot({path:join(screenshots,`phone-${i}.png`)})
      assert.equal(await p.evaluate(()=>document.querySelector('dialog').scrollWidth<=innerWidth),true)
      if(i<4)await dialog.getByRole('button',{name:'Next',exact:true}).click()
    }
    await dialog.getByRole('button',{name:'Skip',exact:true}).click()
    await p.waitForURL(`${base}/dashboard`)
    await p.getByRole('link',{name:'See what you can do'}).click()
    await p.getByRole('dialog').waitFor()
    await p.goto(`${base}/terms`)
    assert.equal(await p.getByRole('link',{name:'Organizer terms',exact:true}).count(),0)
    assert.equal((await p.goto(`${base}/organizer-terms`)).status(),404)
  }finally{await p.close()}
})
