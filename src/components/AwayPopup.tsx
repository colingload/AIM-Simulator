import { F, AWAY_STYLES } from "../constants/styles";
import XBtn from "./icons/XBtn";
import { Buddy } from "../types";

interface AwayPopupProps {
  buddy: Buddy;
  msg: string;
  onClose: () => void;
}

function AwayPopup({buddy,msg,onClose}: AwayPopupProps) {
  const s=AWAY_STYLES[buddy.id]||AWAY_STYLES.claudebot;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:900}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:s.bg,border:"2px solid "+s.bdr,width:"90%",maxWidth:340,fontFamily:F,boxShadow:"0 0 18px "+s.bdr+"66"}}>
        <div style={{background:s.tg,padding:"3px 7px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:s.tc,fontFamily:s.tf,fontSize:12,fontWeight:"bold"}}>{buddy.emoji} {buddy.sn} — away message</span>
          <XBtn onClick={onClose}/>
        </div>
        <div style={{background:s.bg,textAlign:"center",padding:"3px 0",fontSize:10,color:s.dc,fontFamily:s.tf,letterSpacing:2,borderBottom:"1px solid "+s.bdr+"33"}}>{s.deco}</div>
        <div style={{background:s.bg,padding:"18px 22px 22px",minHeight:60,textAlign:"center"}}>
          <div style={{color:s.mc,fontFamily:s.mf,fontSize:s.ms,lineHeight:1.7,fontStyle:"italic"}}>{msg||"brb"}</div>
        </div>
        <div style={{background:s.bg,borderTop:"1px solid "+s.bdr+"33",padding:"4px 8px",display:"flex",justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{background:"transparent",border:"1px solid "+s.dc,color:s.mc,cursor:"pointer",fontSize:10,padding:"1px 12px",fontFamily:s.tf}}>ok</button>
        </div>
      </div>
    </div>
  );
}

export default AwayPopup;
