import s from './pictures.module.css'
export default function CreateEventPicture() {
  return <div className={s.drawing}>
    <div className={s.row}>
      <div className={s.poster}><div className={s.posterTitle}>Rooftop Sessions</div><div><div className={s.posterVolume}>Vol. 3</div><div className={s.posterDate}>Sat 14 Dec, Osu</div></div></div>
      <div className={`${s.box} ${s.column}`}>
        <div className={s.label}>Ticket types</div>
        {[['Early bird','Until 1 Dec','GHS 80'],['Regular','On sale','GHS 120'],['VIP','12 left','GHS 300']].map(([name,detail,price]) => <div className={s.ticket} key={name}><div className={s.ticketInfo}><span className={s.name}>{name}</span><span className={s.small}>{detail}</span></div><span className={s.name} style={{whiteSpace:'nowrap'}}>{price}</span></div>)}
        <div className={s.add}>+ Add ticket type</div>
      </div>
    </div>
    <div className={`${s.box} ${s.between}`}><div className={s.ticketInfo}><span className={s.name}>Hide from browse</span><span className={s.small}>Only people with the link can find it</span></div><div className={s.switch} /></div>
  </div>
}
