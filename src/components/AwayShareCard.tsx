import { F, BS } from "../constants/styles";
import { ChatFormat } from "../types";

interface AwayShareCardProps {
  screenName: string;
  message: string;
  fmt?: ChatFormat;
}

export default function AwayShareCard({ screenName, message, fmt }: AwayShareCardProps) {
  const font = fmt?.font || "Georgia";
  const size = fmt?.size || 13;
  const color = fmt?.color || "#cc6600";
  const bold = fmt?.bold || false;
  const italic = fmt?.italic !== false; // default italic
  const underline = fmt?.underline || false;

  return (
    <div id="away-share-card" style={{width:380,fontFamily:F,background:"#d4d0c8",padding:0,boxSizing:"border-box"}}>
      {/* XP title bar */}
      <div style={{background:"linear-gradient(180deg,#0058ee 0%,#3a93ff 8%,#0058ee 40%,#0047cc 100%)",padding:"4px 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <span style={{fontSize:14}}>🏃</span>
          <span style={{color:"#fff",fontSize:11,fontWeight:"bold"}}>{screenName} - Away Message</span>
        </div>
        <div style={{display:"flex",gap:1}}>
          <div style={{...BS,padding:0,width:16,height:14,fontSize:8,textAlign:"center",lineHeight:"14px"}}>_</div>
          <div style={{...BS,padding:0,width:16,height:14,fontSize:8,textAlign:"center",lineHeight:"14px"}}>□</div>
          <div style={{...BS,padding:0,width:16,height:14,fontSize:8,textAlign:"center",lineHeight:"14px",fontWeight:"bold"}}>✕</div>
        </div>
      </div>

      {/* Decorative toolbar */}
      <div style={{background:"#ece9d8",padding:"2px 6px",borderBottom:"1px solid #aaa",display:"flex",gap:3}}>
        {["A","𝐀","A▾","B","I","U","☺"].map((t,i)=>(
          <span key={i} style={{...BS,fontSize:8,padding:"0px 3px",display:"inline-block"}}>{t}</span>
        ))}
      </div>

      {/* Message area */}
      <div style={{background:"#fff",padding:"20px 24px",minHeight:100,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center"}}>
        <div style={{
          fontFamily:font+",serif",
          fontSize:size+2,
          color,
          fontWeight:bold?"bold":"normal",
          fontStyle:italic?"italic":"normal",
          textDecoration:underline?"underline":"none",
          lineHeight:1.6,
          whiteSpace:"pre-wrap",
          wordBreak:"break-word",
          maxWidth:320,
        }}>
          {message}
        </div>
        <div style={{marginTop:16,color:"#ff6699",fontSize:11,letterSpacing:2}}>💘 ~ * ~ 💘</div>
      </div>

      {/* Footer with URL */}
      <div style={{background:"#ece9d8",borderTop:"1px solid #aaa",padding:"6px 0",textAlign:"center"}}>
        <div style={{fontSize:9,color:"#666",letterSpacing:0.5}}>aim-simulator.vercel.app</div>
      </div>
    </div>
  );
}
