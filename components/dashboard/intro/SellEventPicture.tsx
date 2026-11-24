import s from './pictures.module.css'
export default function SellEventPicture() {
  return <div className={s.drawing}>
    <div className={`${s.box} ${s.column}`}><div className={s.between}><span className={s.name}>Rooftop Sessions Vol. 3</span><span className={s.live}>Live</span></div><div className={s.link}>tikkitte.com/e/rooftop-sessions</div><div className={s.row}><div className={s.pill}>Copy link</div><div className={s.outlinePill}>WhatsApp</div></div></div>
    <div className={`${s.box} ${s.between}`}><span className={s.promo}>EARLYBIRD</span><span className={s.small} style={{flex:1,fontSize:12}}>20% off</span><span className={s.name}>34 used</span></div>
    <div className={`${s.box} ${s.column}`}><div className={s.label}>Tracking links</div>{[['Kofi',48,100],['Instagram bio',31,65],['Abena',22,46]].map(([name,sold,width]) => <div key={name} className={s.between}><span className={s.trackingName}>{name}</span><div className={s.bar}><div className={s.fill} style={{width:`${width}%`}} /></div><span className={s.sold}>{sold} sold</span></div>)}</div>
  </div>
}
