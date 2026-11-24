import { StatTile } from 'tikkitte-ui'
import s from './pictures.module.css'
export default function GetPaidPicture() {
  return <div className={s.drawing}><div className={s.stats}><StatTile className={s.stat} label="Tickets sold" value="340" valueUnit="/ 400"/><StatTile className={s.stat} label="Sales (GHS)" value="38,400"/></div>
    <div className={`${s.box} ${s.column}`}><div className={s.label}>Sales this week</div><div className={s.chart}>{[22,36,30,52,74,100,64].map((height,i) => <div key={i} className={s.chartBar} style={{height:`${height}%`,background:i===5?'#2565d0':'#bcd2f7'}} />)}</div><div className={s.days}>{['M','T','W','T','F','S','S'].map((day,i)=><span key={i}>{day}</span>)}</div></div>
    <div className={`${s.box} ${s.between}`} style={{padding:12}}><div className={s.ticketInfo}><span className={s.label}>Ready to pay out</span><span className={s.payout}>GHS 34,560</span><span className={s.small}>Mobile Money ending 4821</span></div><div className={s.pill} style={{flex:'none',background:'#2565d0',padding:'9px 12px'}}>Request payout</div></div>
  </div>
}
