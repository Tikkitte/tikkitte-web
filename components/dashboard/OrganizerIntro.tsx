'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Eyebrow } from 'tikkitte-ui'
import CreateEventPicture from './intro/CreateEventPicture'
import SellEventPicture from './intro/SellEventPicture'
import RunEventPicture from './intro/RunEventPicture'
import GetPaidPicture from './intro/GetPaidPicture'
import s from './OrganizerIntro.module.css'

const slides = [
  { title:'Create your event', body:'Set it up in a few minutes.', bullets:['Ticket types with their own prices and sale dates','Your poster and event details','Hide it from browse so only people with the link can find it'], Picture:CreateEventPicture },
  { title:'Sell it', body:'One link for WhatsApp, Instagram and anywhere else your crowd is.', bullets:['Share your event link in a tap','Promo codes for early birds and friends','Tracking links that show what each promoter sold'], Picture:SellEventPicture },
  { title:'Run the event', body:'Everything you need on the night, right from your phone.', bullets:['Scan tickets at the door, even offline','Send comp tickets to guests','Message everyone who bought a ticket'], Picture:RunEventPicture },
  { title:'Get paid', body:'Watch sales come in, then get your money out.', bullets:['Live sales and check-in numbers','Payouts to Mobile Money or your bank','Your fees shown before you publish'], Picture:GetPaidPicture },
]

export default function OrganizerIntro({ approved }: { approved:boolean }) {
  const router = useRouter()
  const [step,setStep] = useState(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const skip = useRef<HTMLButtonElement>(null)
  const nextButton = useRef<HTMLButtonElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const element=dialog.current
    if (!element) return
    previousFocus.current=document.activeElement instanceof HTMLElement && document.activeElement!==document.body
      ? document.activeElement : document.querySelector<HTMLElement>('[data-organizer-intro-trigger]')
    const oldOverflow=document.documentElement.style.overflow
    document.documentElement.style.overflow='hidden'
    element.showModal() // The native modal makes the background inert.
    skip.current?.focus()
    return () => { element.close();document.documentElement.style.overflow=oldOverflow;previousFocus.current?.focus() }
  },[])
  function close() {
    dialog.current?.close()
    previousFocus.current?.focus()
    router.replace('/dashboard', { scroll:false })
  }
  function back() {
    // Back is hidden on slide 1, so move focus to Next before it disappears.
    if (step===1) nextButton.current?.focus()
    setStep(step-1)
  }
  const slide=slides[step]
  return <dialog ref={dialog} className={s.dialog} role="dialog" aria-modal="true" aria-labelledby="organizer-intro-title" onKeyDown={event=>{
    if (event.key!=='Tab') return
    const controls=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button, a[href], [tabindex="0"]')).filter(element=>element.getClientRects().length>0)
    const first=controls[0], last=controls.at(-1)
    if (event.shiftKey && document.activeElement===first) { event.preventDefault();last?.focus() }
    else if (!event.shiftKey && document.activeElement===last) { event.preventDefault();first?.focus() }
  }} onCancel={event=>{event.preventDefault();close()}}>
    <div className={s.shell}>
      <header className={s.header}><Image src="/images/logo.png" alt="Tikkitte" width={48} height={33} className={s.logo}/><button ref={skip} type="button" className={s.skip} onClick={close}><span className={s.phoneOnly}>Skip</span><span className={s.desktopOnly}>Skip intro</span></button></header>
      <Card variant="elevated" className={s.card}>
        <div className={s.content}>
          <div className={s.picture} aria-hidden="true"><slide.Picture/></div>
          <div className={s.text}><Eyebrow>Step {step+1} of 4</Eyebrow><h1 id="organizer-intro-title" className={s.title}>{slide.title}</h1><p className={s.body}>{step===0 && !approved ? 'Set it up while we review your account. It only takes a few minutes.' : slide.body}</p>
            <ul className={s.bullets}>{slide.bullets.map((bullet,index)=><li key={bullet}><svg className={s.check} width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="10" fill="#d9e4fa"/><path d="M6 10.3l2.6 2.6 5.4-5.6" fill="none" stroke="#2565d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg><span>{bullet}{step===2 && index>0 && !approved && <> <span className={s.approvalNote}>(after approval)</span></>}</span></li>)}</ul>
          </div>
        </div>
        <footer className={s.footer}><div className={s.dots} aria-label="Intro progress">{slides.map((slide,index)=><span key={slide.title}><span className={`${s.dot} ${s.phoneOnly} ${index===step?s.activeDot:''}`} aria-hidden="true"/><button type="button" className={s.dotButton} aria-label={`Go to step ${index+1}`} aria-current={index===step?'step':undefined} onClick={()=>setStep(index)}><span className={`${s.dot} ${index===step?s.activeDot:''}`}/></button></span>)}</div><div className={s.buttons}>{step>0 && <Button variant="secondary" onClick={back}>Back</Button>}<Button ref={nextButton} variant="primary" onClick={step===3?close:()=>setStep(step+1)}>{step===3?'Go to my checklist':'Next'}</Button></div></footer>
      </Card>
    </div>
  </dialog>
}
