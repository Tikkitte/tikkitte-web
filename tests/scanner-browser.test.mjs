// Run after `next build` + `next start` with SCANNER_UI_BASE_URL set.
import {test,before,after} from 'node:test'
import assert from 'node:assert/strict'
const enabled=Boolean(process.env.SCANNER_UI_BASE_URL)
let browser
const session={eventId:'door-test',eventName:'Door test',token:'a'.repeat(64),expiresAt:new Date(Date.now()+3600000).toISOString()}
before(async()=>{if(enabled){const {chromium}=await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{})})}})
after(async()=>{await browser?.close()})
async function setup({stored=session,invalidCache=false,invalidScan=false,queue=false}={}){
 const p=await browser.newPage({bypassCSP:true});p.setDefaultTimeout(7000);p.setDefaultNavigationTimeout(10000);const starts=[]
 await p.addInitScript(({stored,queue})=>{if(!sessionStorage.getItem('fixture-initialized')){
   if(stored)localStorage.setItem('scan_session_v1',JSON.stringify(stored))
   if(queue)localStorage.setItem('scan_queue_v2',JSON.stringify([{ticketId:'bbbbbbbb-0000-4000-8000-000000000023',eventId:'door-test',ts:1}]))
   sessionStorage.setItem('fixture-initialized','1')
 }},{stored,queue})
 await p.route('**/api/scanner/session',async route=>{
   starts.push({hash:await p.evaluate(()=>location.hash),code:route.request().postDataJSON().code})
   await route.fulfill({json:session})
 })
 await p.route('http://127.0.0.1:54321/**',async route=>{
   const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':route.request().headers()['access-control-request-headers'] ?? '*','Access-Control-Allow-Methods':'GET,POST,OPTIONS'}
   if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers})
   const cache=route.request().url().includes('get_event_tickets_for_cache')
   await route.fulfill({status:cache&&invalidCache?403:200,headers,json:cache?(invalidCache?{message:'invalid_session'}:[]):(invalidScan?{ok:false,error:'invalid_session'}:{ok:true})})
 })
 return {p,starts}
}
const base=process.env.SCANNER_UI_BASE_URL
test('scanner restores across reload and clears when changing events',{skip:!enabled},async()=>{
 const {p,starts}=await setup();try{
   await p.goto(`${base}/scan`);await p.getByText('Door test',{exact:true}).waitFor()
   await p.reload();await p.getByText('Door test',{exact:true}).waitFor()
   assert.equal(starts.length,0)
   await p.getByRole('button',{name:'Change event'}).click()
   assert.equal(await p.evaluate(()=>localStorage.getItem('scan_session_v1')),null)
 }finally{await p.close()}
})
test('expired session is discarded and an active session expires on the phone',{skip:!enabled},async()=>{
 const {p}=await setup({stored:{...session,expiresAt:new Date(Date.now()-1000).toISOString()}});try{
  await p.goto(`${base}/scan`);await p.getByRole('heading',{name:'Ticket Scanner',exact:true}).waitFor()
  await p.waitForFunction(()=>localStorage.getItem('scan_session_v1')===null)
 }finally{await p.close()}
 const {p:active}=await setup({stored:{...session,expiresAt:new Date(Date.now()+3500).toISOString()}});try{
  await active.goto(`${base}/scan`);await active.getByText('Door test',{exact:true}).waitFor()
  await active.getByText('Scanner session expired. Enter your code again.',{exact:true}).waitFor()
  assert.equal(await active.evaluate(()=>localStorage.getItem('scan_session_v1')),null)
 }finally{await active.close()}
})
test('invalid_session from cache and queue scan RPCs clears persistence',{skip:!enabled},async()=>{
 for(const options of [{invalidCache:true},{invalidScan:true,queue:true}]){
  const {p}=await setup(options);try{
   await p.goto(`${base}/scan`)
   await p.getByRole('heading',{name:'Ticket Scanner',exact:true}).waitFor()
   await p.waitForFunction(()=>localStorage.getItem('scan_session_v1')===null)
  }finally{await p.close()}
 }
})
test('fragment starts a session after removing the code from the address bar',{skip:!enabled},async()=>{
 const {p,starts}=await setup({stored:null});try{
  await p.goto(`${base}/scan#code=ABCD-1234-ABCD-1234-ABCD`)
  await p.getByText('Door test',{exact:true}).waitFor()
  assert.deepEqual(starts,[{hash:'',code:'ABCD1234ABCD1234ABCD'}])
  assert.equal(new URL(p.url()).hash,'')
  assert.equal(JSON.parse(await p.evaluate(()=>localStorage.getItem('scan_session_v1'))).token,session.token)
 }finally{await p.close()}
})
