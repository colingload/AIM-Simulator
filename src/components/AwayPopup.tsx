import { F, WB, BS, AWAY_STYLES } from "../constants/styles";
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
      <div onClick={e=>e.stopPropagation()} style={{background:WB,border:"2px solid",borderColor:"#fff #444 #444 #fff",width:"90%",maxWidth:340,fontFamily:F,boxShadow:"3px 3px 8px rgba(0,0,0,0.5)"}}>
        {/* Title bar */}
        <div style={{background:"linear-gradient(180deg,#0058ee 0%,#3a93ff 8%,#0058ee 40%,#0047cc 100%)",padding:"2px 5px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:"#fff",fontSize:11,fontWeight:"bold"}}>{buddy.emoji} {buddy.sn} — Away Message</span>
          <XBtn onClick={onClose}/>
        </div>

        {/* Decorative toolbar */}
        <div style={{background:"#ece9d8",padding:"3px 6px",borderBottom:"1px solid #aaa",display:"flex",gap:4}}>
          {["A","𝐀","A▾","A","ᴬA","𝐁","𝐼","U","link","☺"].map((t,i)=>(
            <span key={i} style={{...BS,fontSize:9,padding:"1px 4px",cursor:"default",display:"inline-block"}}>{t}</span>
          ))}
        </div>

        {/* Away message display */}
        <div style={{background:"#fff",border:"1px inset #808080",margin:"8px 10px",minHeight:80,padding:"10px 12px"}}>
          <div style={{color:s.mc,fontFamily:s.mf,fontSize:s.ms,lineHeight:1.7,fontStyle:"italic"}}>{msg||"brb"}</div>
        </div>

        {/* Special characters info */}
        <div style={{padding:"4px 12px",fontSize:9,color:"#444",lineHeight:1.6}}>
          <div style={{fontWeight:"bold",marginBottom:1}}>Special Characters:</div>
          <div>%n = Screen Name of Buddy</div>
          <div>%d = Current date</div>
          <div>%t = Current time</div>
        </div>

        {/* Bottom buttons */}
        <div style={{borderTop:"1px solid #aaa",padding:"6px 10px",display:"flex",justifyContent:"center",gap:8,background:"#ece9d8"}}>
          <button onClick={onClose} style={{...BS,fontSize:10,padding:"3px 16px",fontWeight:"bold"}}>OK</button>
        </div>
      </div>
    </div>
  );
}

export default AwayPopup;
