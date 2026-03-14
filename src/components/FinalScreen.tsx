import { useState, useEffect, useRef, useCallback } from "react";
import { F } from "../constants/styles";

const POEM_LINES=["you stayed up until 3am","waiting for a screenname to go from gray to blue.","","you burned a cd you never gave them.","track 7 was the one that meant something","but you'd never say that out loud.","","you typed \"hey\" forty different ways","and sent the one that looked the most casual.","","you set your away message like a prayer —","hoping one specific person would read it","and just... know.","","they probably did."];
const POEM_DELAYS=POEM_LINES.map(l=>l===""?600:1800+Math.random()*400);
type TypeSeqStep = {type:"type";text:string} | {type:"pause";ms:number} | {type:"delete";count:number} | {type:"done"};
const FINAL_TYPE_SEQ:TypeSeqStep[]=[{type:"type",text:"talking to "},{type:"pause",ms:700},{type:"type",text:"my "},{type:"pause",ms:500},{type:"delete",count:3},{type:"pause",ms:900},{type:"type",text:"someone "},{type:"pause",ms:350},{type:"type",text:"i like"},{type:"pause",ms:1400},{type:"delete",count:6},{type:"pause",ms:600},{type:"type",text:"someone special "},{type:"pause",ms:500},{type:"type",text:"~*~"},{type:"pause",ms:1000},{type:"done"}];
const COMIC_F="'Comic Sans MS','Chalkboard SE',cursive";
const SERIF_F="'Georgia','Times New Roman',serif";

interface FinalScreenProps {
  onReplay: () => void;
}

function FinalScreen({onReplay}: FinalScreenProps){
  const [phase,setPhase]=useState("desktop");
  const [dim,setDim]=useState(0);
  const [vis,setVis]=useState(0);
  const [msg,setMsg]=useState("");
  const [blk,setBlk]=useState(true);
  const [saved,setSaved]=useState(false);
  const [stat,setStat]=useState("");
  const [winO,setWinO]=useState(0);
  const [fade,setFade]=useState(0);
  const [showC,setShowC]=useState(false);
  const tt=useRef<ReturnType<typeof setTimeout>[]>([]);const ss=useRef(0);const sc=useRef(0);const bf=useRef("");
  const cl=useCallback(()=>{tt.current.forEach(clearTimeout);tt.current=[];},[]);
  const dl=useCallback((fn:()=>void,ms:number)=>{const t=setTimeout(fn,ms);tt.current.push(t);return t;},[]);
  useEffect(()=>{const i=setInterval(()=>setBlk(v=>!v),530);return()=>clearInterval(i);},[]);
  useEffect(()=>{if(phase!=="desktop")return;dl(()=>setDim(0.3),800);dl(()=>setDim(0.6),2000);dl(()=>setDim(0.85),3200);dl(()=>setDim(1),4200);dl(()=>setPhase("poem"),5000);return cl;},[phase,dl,cl]);
  useEffect(()=>{if(phase!=="poem")return;let c=400;for(let i=0;i<POEM_LINES.length;i++){c+=POEM_DELAYS[i];const n=i+1;dl(()=>setVis(n),c);}dl(()=>setPhase("awaymsg"),c+3000);return cl;},[phase,dl,cl]);
  useEffect(()=>{if(phase!=="awaymsg")return;dl(()=>setVis(-1),0);dl(()=>setWinO(0.4),800);dl(()=>setWinO(0.7),1200);dl(()=>setWinO(1),1600);dl(()=>setPhase("typing"),2400);return cl;},[phase,dl,cl]);
  useEffect(()=>{if(phase!=="typing")return;setStat("xo_Jordan_xo is typing...");function run(){const s=FINAL_TYPE_SEQ[ss.current];if(!s)return;if(s.type==="type"){if(sc.current<s.text.length){bf.current+=s.text[sc.current];setMsg(bf.current);sc.current++;dl(run,80+Math.random()*100);}else{sc.current=0;ss.current++;dl(run,80);}}else if(s.type==="delete"){if(sc.current<s.count){bf.current=bf.current.slice(0,-1);setMsg(bf.current);sc.current++;dl(run,55+Math.random()*60);}else{sc.current=0;ss.current++;dl(run,80);}}else if(s.type==="pause"){ss.current++;dl(run,s.ms);}else if(s.type==="done"){setPhase("saving");}}dl(run,700);return cl;},[phase,dl,cl]);
  useEffect(()=>{if(phase!=="saving")return;setStat("saving...");dl(()=>{setSaved(true);setStat("away message set 💘");},1000);dl(()=>setFade(0.3),2200);dl(()=>setFade(0.6),2800);dl(()=>setFade(1),3400);dl(()=>setPhase("congrats"),4400);dl(()=>setShowC(true),4600);return cl;},[phase,dl,cl]);
  const fb={fontFamily:F,fontSize:11,padding:"3px 14px",cursor:"pointer",outline:"none",border:"1px solid",borderColor:"#fff #888 #888 #fff",background:"linear-gradient(180deg,#ece9d8,#d4d0c8)",color:"#000"};
  if(phase==="congrats")return(<div onClick={onReplay} style={{position:"fixed",inset:0,background:"#000",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontFamily:F}}>{showC&&(<div style={{textAlign:"center",animation:"fadeUp 2s ease forwards"}}><div style={{fontSize:11,letterSpacing:7,color:"#555",textTransform:"uppercase",marginBottom:36}}>xo_Jordan_xo · away message saved</div><div style={{fontSize:72,fontWeight:"bold",color:"#fff",fontFamily:SERIF_F,letterSpacing:-3,lineHeight:1}}>you won.</div><div style={{fontSize:22,color:"#444",marginTop:28}}>💘</div><div style={{fontSize:10,color:"#444",marginTop:52,letterSpacing:3}}>click anywhere to replay</div></div>)}<style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style></div>);
  const po=vis===-1;
  return(<div style={{position:"fixed",inset:0,overflow:"hidden",fontFamily:F}}><div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,#3a6ec8 0%,#62a8e8 40%,#4a9f3f 40%,#3d8a35 100%)"}}/><div style={{position:"absolute",inset:0,background:"#000",opacity:dim,transition:"opacity 1.8s ease"}}/><div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px",opacity:po?0:1,transition:"opacity 1.2s ease",pointerEvents:"none"}}>{POEM_LINES.map((l,i)=>(<div key={i} style={{fontFamily:SERIF_F,fontSize:l===""?0:17,lineHeight:l===""?"20px":2.1,color:"#c8c8c8",letterSpacing:0.3,opacity:i<vis?1:0,transform:i<vis?"translateY(0)":"translateY(8px)",transition:"opacity 1.4s ease, transform 1.4s ease",minHeight:l===""?20:"auto",textAlign:"center",maxWidth:460}}>{l}</div>))}</div><div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",opacity:winO,transition:"opacity 0.8s ease",pointerEvents:winO>0?"auto":"none"}}><div style={{background:"#ece9d8",border:"2px solid",borderColor:"#fff #444 #444 #fff",width:370,boxShadow:"4px 4px 16px rgba(0,0,0,0.6)"}}><div style={{background:"linear-gradient(180deg,#0058ee,#3a93ff,#0058ee,#0047cc)",padding:"3px 6px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{color:"#fff",fontWeight:"bold",fontSize:12}}>Edit Away Message</span><div style={{display:"flex",gap:1}}>{["_","□"].map(l=><button key={l} style={{...fb,width:17,height:15,fontSize:9,padding:0}}>{l}</button>)}<button style={{width:17,height:15,fontSize:10,padding:0,border:"1px solid",borderColor:"#ff8888 #aa0000 #aa0000 #ff8888",background:"linear-gradient(180deg,#ff6060,#cc2020)",color:"#fff",fontWeight:"bold",cursor:"pointer",outline:"none"}}>✕</button></div></div><div style={{padding:"14px 16px 12px"}}><div style={{fontSize:11,color:"#333",marginBottom:6}}>Your Away Message:</div><div style={{background:"#fff",border:"1px inset #808080",padding:"8px 10px",minHeight:56,fontSize:13,fontFamily:COMIC_F,color:"#cc2266",fontStyle:"italic",marginBottom:12,lineHeight:1.7}}><span>💘 </span><span>{msg}</span>{(phase==="awaymsg"||phase==="typing")&&<span style={{display:"inline-block",width:1,height:"1em",background:blk?"#333":"transparent",verticalAlign:"text-bottom",marginLeft:1}}/>}</div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:10,color:"#888",fontStyle:"italic"}}>{stat}</span><div style={{display:"flex",gap:6}}><button style={fb}>Cancel</button><button style={{...fb,background:saved?"linear-gradient(180deg,#c8c4b4,#d4d0c8)":phase==="saving"?"linear-gradient(180deg,#4a90d9,#2060b0)":"linear-gradient(180deg,#ece9d8,#d4d0c8)",color:(phase==="saving"&&!saved)?"#fff":"#000",borderColor:saved?"#888 #fff #fff #888":"#fff #888 #888 #fff",fontWeight:(phase==="saving"&&!saved)?"bold":"normal",cursor:"default",transition:"all 0.3s"}}>{saved?"Saved ✓":"Save"}</button></div></div></div></div></div><div style={{position:"absolute",inset:0,background:"#000",opacity:fade,transition:"opacity 1s ease",pointerEvents:"none"}}/><style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style></div>);
}

export default FinalScreen;
