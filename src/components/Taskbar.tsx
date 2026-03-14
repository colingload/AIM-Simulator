import { useState, useEffect } from "react";
import { BUDDIES } from "../constants/buddies";
import { F, BS } from "../constants/styles";
import { unlockAudio } from "../constants/sounds";
import Man from "./icons/Man";

interface TaskbarProps {
  sn: string;
  openChats: string[];
  onChat: (id: string) => void;
  onOff: () => void;
}

function Taskbar({sn,openChats,onChat,onOff}: TaskbarProps) {
  const [t,setT]=useState(new Date());
  useEffect(()=>{const i=setInterval(()=>setT(new Date()),1000);return()=>clearInterval(i);},[]);
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,height:30,background:"linear-gradient(180deg,#245edc,#1a47b0)",borderTop:"2px solid #3a7ae4",display:"flex",alignItems:"center",fontFamily:F,zIndex:500,userSelect:"none"}}>
      <div onClick={()=>{unlockAudio();onOff();}} style={{background:"linear-gradient(90deg,#3cb050,#2a8a38)",height:"100%",display:"flex",alignItems:"center",padding:"0 12px",fontWeight:"bold",color:"#fff",fontSize:13,borderRight:"2px solid #1a6028",cursor:"pointer",gap:3}}>
        🟢 start
      </div>
      <div style={{display:"flex",gap:2,padding:"0 4px",flex:1,overflow:"hidden"}}>
        {openChats.map(id=>{
          const b=BUDDIES.find(x=>x.id===id);
          return <button key={id} onClick={()=>{unlockAudio();onChat(id);}} style={{...BS,background:"linear-gradient(180deg,#3a7ae4,#1a47b0)",borderColor:"#5a9af4 #1a3a9a #1a3a9a #5a9af4",color:"#fff",fontSize:11,padding:"1px 7px",maxWidth:125,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b?.emoji} {b?.sn}</button>;
        })}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:7,padding:"0 9px",color:"#fff",fontSize:11,borderLeft:"1px solid #3a7ae4"}}>
        <Man sz={14}/><span>{sn}</span>
        <span>{t.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
      </div>
    </div>
  );
}

export default Taskbar;
