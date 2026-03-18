import { F, TG, WB, BS, dot } from "../constants/styles";
import { BUDDIES } from "../constants/buddies";
import Man from "./icons/Man";
import XBtn from "./icons/XBtn";
import BuddyAvatar from "./BuddyAvatar";
import { unlockAudio, toggleMute, isMuted } from "../constants/sounds";
import { useState, useRef, useEffect } from "react";
import { BuddyStatus, ChatFormat } from "../types";
import { storageGet, storageSet } from "../utils/storage";
import EmojiPicker from "./EmojiPicker";
import AwayShareCard from "./AwayShareCard";
import { toPng } from "html-to-image";

interface BuddyListProps {
  sn: string;
  statuses: Record<string, BuddyStatus>;
  onOpen: (id: string) => void;
  onOff: () => void;
  mobile: boolean;
  unread: Record<string, number>;
  myAway?: string | null;
  onSetAway?: (msg: string | null) => void;
}

function BuddyList({sn,statuses,onOpen,onOff,mobile,unread,myAway,onSetAway}: BuddyListProps) {
  const [muted, setMuted] = useState(isMuted());
  const [awayInput, setAwayInput] = useState("");
  const [showAwayInput, setShowAwayInput] = useState(false);
  const [awayFmt, setAwayFmt] = useState<ChatFormat>({font:"Georgia",size:12,color:"#cc6600",bold:false,italic:true,underline:false});
  const [showAwayEmoji, setShowAwayEmoji] = useState(false);
  const [showAwayColor, setShowAwayColor] = useState(false);
  const awayTextRef = useRef<HTMLTextAreaElement>(null);
  useEffect(()=>{(async()=>{const f=await storageGet("away_format");if(f)setAwayFmt(f);})();},[]);
  return (
    <div style={{background:WB,border:mobile?"none":"2px solid",borderColor:"#fff #444 #444 #fff",width:mobile?"100%":195,height:mobile?"100%":"auto",fontFamily:F,boxShadow:mobile?"none":"2px 2px 5px rgba(0,0,0,0.4)",userSelect:"none",display:"flex",flexDirection:"column"}}>
      <div data-dh="1" style={{background:TG,color:"#fff",fontWeight:"bold",fontSize:mobile?14:12,padding:mobile?"10px 14px":"3px 6px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:mobile?"default":"move"}}>
        <div style={{display:"flex",alignItems:"center",gap:mobile?6:3}}><Man sz={mobile?18:14}/><span>Buddy List</span></div>
        {!mobile&&<div style={{display:"flex",gap:1}}>
          <button style={{...BS,padding:0,width:17,height:15,fontSize:9}}>_</button>
          <button style={{...BS,padding:0,width:17,height:15,fontSize:9}}>□</button>
          <XBtn onClick={()=>{unlockAudio();onOff();}}/>
        </div>}
      </div>
      <div style={{background:"#fff",padding:mobile?"10px 14px":"6px 6px 5px",borderBottom:"2px solid #808080",display:"flex",alignItems:"center",gap:mobile?10:6}}>
        <span style={{fontSize:mobile?32:26,lineHeight:1}}>🏃</span>
        <div>
          <div style={{fontSize:mobile?16:13,fontWeight:"bold",fontFamily:"Arial,sans-serif",lineHeight:1.1}}>
            <span style={{color:"#000"}}>AOL</span>{" "}
            <span style={{color:"#000",fontWeight:"bold"}}>Instant</span>
          </div>
          <div style={{fontSize:mobile?14:11,fontWeight:"bold",fontFamily:"Arial,sans-serif",lineHeight:1.1}}>Messenger™</div>
        </div>
        <div style={{marginLeft:"auto",fontSize:mobile?11:9,color:"#555"}}>{sn}</div>
      </div>
      <div style={{background:"#d4d0c8",fontSize:mobile?12:10,fontWeight:"bold",padding:mobile?"5px 14px":"2px 6px",letterSpacing:1,borderBottom:"1px solid #888",color:"#0000aa"}}>BUDDIES</div>
      <div style={{background:"#fff",flex:1,overflowY:"auto",maxHeight:mobile?"none":260}}>
        <div style={{fontSize:mobile?13:11,fontWeight:"bold",padding:mobile?"4px 14px":"1px 6px",background:"#d4d0c8",borderBottom:"1px solid #c0bdb5"}}>Buddies</div>
        {BUDDIES.map(b=>{
          const st=statuses[b.id]||"offline";
          const active=st==="online"||st==="away";
          const hasUnread=(unread||{})[b.id]>0;
          return (
            <div key={b.id} onClick={()=>{unlockAudio();onOpen(b.id);}}
              style={{display:"flex",alignItems:"center",gap:mobile?10:5,padding:mobile?"12px 14px":"2px 8px 2px 14px",cursor:active?"pointer":"default",borderBottom:mobile?"1px solid #eee":"none"}}
              onMouseEnter={e=>{if(active&&!mobile){e.currentTarget.style.background="#316ac5";e.currentTarget.style.color="#fff";}}}
              onMouseLeave={e=>{if(!mobile){e.currentTarget.style.background="transparent";e.currentTarget.style.color="#000";}}}>
              <BuddyAvatar buddyId={b.id} size={mobile?28:18}/>
              <div style={dot(st)}/>
              <span style={{fontSize:mobile?15:12,fontWeight:st==="online"||hasUnread?"bold":"normal",color:st==="offline"?"#888":"inherit",flex:1}}>{b.sn}{hasUnread&&<span style={{color:"#cc0000",fontWeight:"bold",marginLeft:4}}>({unread[b.id]})</span>}</span>
              {st==="away"&&!hasUnread&&<span style={{fontSize:mobile?11:9,color:"#886600"}}>away</span>}
            </div>
          );
        })}
      </div>
      {myAway !== null && (
        <div style={{background:"#ffffcc",padding:mobile?"8px 14px":"4px 8px",borderTop:"1px solid #cccc66",fontSize:mobile?12:10}}>
          <div style={{fontWeight:"bold",color:"#886600",marginBottom:2}}>Away Message:</div>
          <div style={{fontStyle:awayFmt.italic?"italic":"normal",fontFamily:awayFmt.font,fontSize:awayFmt.size,color:awayFmt.color,fontWeight:awayFmt.bold?"bold":"normal",textDecoration:awayFmt.underline?"underline":"none",marginBottom:4}}>{myAway}</div>
          <div style={{display:"flex",gap:4}}>
            <button onClick={()=>onSetAway?.(null)} style={{...BS,fontSize:mobile?12:9,padding:mobile?"4px 10px":"1px 6px"}}>{"I'm Back"}</button>
            <button onClick={async()=>{
              const node=document.getElementById("away-share-card");
              if(!node)return;
              try{
                const dataUrl=await toPng(node,{pixelRatio:2});
                const blob=await(await fetch(dataUrl)).blob();
                const file=new File([blob],"my-2003-away-message.png",{type:"image/png"});
                if(navigator.canShare?.({files:[file]})){
                  await navigator.share({files:[file],title:"My 2003 Away Message"});
                }else{
                  const a=document.createElement("a");
                  a.href=dataUrl;a.download="my-2003-away-message.png";a.click();
                }
              }catch(e){console.error("Share failed",e);}
            }} style={{...BS,fontSize:mobile?12:9,padding:mobile?"4px 10px":"1px 6px"}}>📤 Share</button>
          </div>
          {/* Hidden share card for image capture */}
          <div style={{position:"fixed",left:-9999,top:-9999,opacity:0,pointerEvents:"none"}}>
            <AwayShareCard screenName={sn} message={myAway||""} fmt={awayFmt}/>
          </div>
        </div>
      )}
      {showAwayInput && myAway === null && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:800}} onClick={()=>{setShowAwayInput(false);setAwayInput("");}}>
          <div onClick={e=>e.stopPropagation()} style={{background:WB,border:"2px solid",borderColor:"#fff #444 #444 #fff",width:"90%",maxWidth:320,fontFamily:F,boxShadow:"3px 3px 8px rgba(0,0,0,0.5)"}}>
            <div style={{background:"linear-gradient(180deg,#0058ee 0%,#3a93ff 8%,#0058ee 40%,#0047cc 100%)",padding:"2px 5px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:"#fff",fontSize:11,fontWeight:"bold"}}>Edit Away Message</span>
              <XBtn onClick={()=>{setShowAwayInput(false);setAwayInput("");}}/>
            </div>
            <div style={{padding:"6px 10px",background:WB}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                <span style={{fontSize:10}}>Enter label:</span>
                <select disabled style={{flex:1,padding:"1px 3px",fontSize:10,fontFamily:F,border:"1px inset #808080"}}>
                  <option>Away</option>
                </select>
              </div>
              <div style={{fontSize:10,marginBottom:4}}>Enter new Away message:</div>
              <div style={{background:"#ece9d8",padding:"2px 4px",borderBottom:"1px solid #aaa",display:"flex",gap:2,marginBottom:0,alignItems:"center",position:"relative"}}>
                <select value={awayFmt.font} onChange={e=>{const f={...awayFmt,font:e.target.value};setAwayFmt(f);storageSet("away_format",f);}} style={{fontSize:8,fontFamily:F,border:"1px inset #808080",padding:"0 1px",maxWidth:64}}>
                  {["Georgia","Arial","Times New Roman","Comic Sans MS","Verdana","Courier New"].map(fn=><option key={fn} value={fn}>{fn}</option>)}
                </select>
                <select value={awayFmt.size} onChange={e=>{const f={...awayFmt,size:Number(e.target.value)};setAwayFmt(f);storageSet("away_format",f);}} style={{fontSize:8,fontFamily:F,border:"1px inset #808080",padding:"0 1px",width:28}}>
                  {[10,12,14,16].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={()=>{const f={...awayFmt,bold:!awayFmt.bold};setAwayFmt(f);storageSet("away_format",f);}} style={{...BS,padding:"0 3px",fontSize:9,fontWeight:"bold",minWidth:14,background:awayFmt.bold?"#c0c0ff":"linear-gradient(180deg,#ece9d8,#d4d0c8)"}}>B</button>
                <button onClick={()=>{const f={...awayFmt,italic:!awayFmt.italic};setAwayFmt(f);storageSet("away_format",f);}} style={{...BS,padding:"0 3px",fontSize:9,fontStyle:"italic",minWidth:14,background:awayFmt.italic?"#c0c0ff":"linear-gradient(180deg,#ece9d8,#d4d0c8)"}}>I</button>
                <button onClick={()=>{const f={...awayFmt,underline:!awayFmt.underline};setAwayFmt(f);storageSet("away_format",f);}} style={{...BS,padding:"0 3px",fontSize:9,textDecoration:"underline",minWidth:14,background:awayFmt.underline?"#c0c0ff":"linear-gradient(180deg,#ece9d8,#d4d0c8)"}}>U</button>
                <button onClick={()=>setShowAwayColor(p=>!p)} style={{...BS,padding:"0 3px",fontSize:9,minWidth:14}}>
                  <span style={{color:awayFmt.color}}>A</span>
                </button>
                <div style={{position:"relative"}}>
                  <button onClick={()=>setShowAwayEmoji(p=>!p)} style={{...BS,padding:"0 3px",fontSize:10,minWidth:14}}>☺</button>
                  {showAwayEmoji&&<EmojiPicker mobile={mobile} onPick={emoji=>{
                    if(awayTextRef.current){
                      const ta=awayTextRef.current;
                      const start=ta.selectionStart;
                      const end=ta.selectionEnd;
                      setAwayInput(awayInput.slice(0,start)+emoji+awayInput.slice(end));
                      setTimeout(()=>{ta.focus();ta.setSelectionRange(start+emoji.length,start+emoji.length);},0);
                    } else {
                      setAwayInput(awayInput+emoji);
                    }
                  }} onClose={()=>setShowAwayEmoji(false)}/>}
                </div>
                {showAwayColor&&<div style={{position:"absolute",top:"100%",left:0,zIndex:500,background:"#ece9d8",border:"2px solid",borderColor:"#fff #444 #444 #fff",padding:3,display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:2,boxShadow:"2px 2px 6px rgba(0,0,0,0.3)"}}>
                  {["#000000","#cc0000","#0000cc","#008800","#880088","#cc6600","#800000","#008080","#000080","#888888","#ff3399","#663300"].map(c=>(
                    <button key={c} onClick={()=>{const f={...awayFmt,color:c};setAwayFmt(f);storageSet("away_format",f);setShowAwayColor(false);}}
                      style={{width:14,height:14,background:c,border:awayFmt.color===c?"2px solid #fff":"1px solid #666",cursor:"pointer",padding:0}}/>
                  ))}
                </div>}
              </div>
              <textarea ref={awayTextRef} value={awayInput} onChange={e=>setAwayInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&awayInput.trim()){e.preventDefault();onSetAway?.(awayInput.trim());setAwayInput("");setShowAwayInput(false);}}}
                placeholder="eternal sunshine of the spotless mind.&#10;&#10;leave love. make it ring."
                style={{width:"100%",minHeight:80,padding:"6px 8px",fontSize:awayFmt.size,fontFamily:awayFmt.font+",serif",fontStyle:awayFmt.italic?"italic":"normal",fontWeight:awayFmt.bold?"bold":"normal",textDecoration:awayFmt.underline?"underline":"none",color:awayFmt.color,border:"1px inset #808080",borderTop:"none",resize:"vertical",boxSizing:"border-box"}}/>
              <div style={{fontSize:9,color:"#444",lineHeight:1.6,marginTop:6}}>
                <div style={{fontWeight:"bold"}}>Special Characters:</div>
                <div>%n = Screen Name of Buddy</div>
                <div>%d = Current date</div>
                <div>%t = Current time</div>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",marginTop:4,marginBottom:2}}>
                <label style={{fontSize:9,display:"flex",alignItems:"center",gap:3}}><input type="checkbox"/>Save for later use</label>
              </div>
            </div>
            <div style={{borderTop:"1px solid #aaa",padding:"6px 10px",display:"flex",justifyContent:"center",gap:8,background:"#ece9d8"}}>
              <button onClick={()=>{if(awayInput.trim()){onSetAway?.(awayInput.trim());setAwayInput("");setShowAwayInput(false);}}} style={{...BS,fontSize:10,padding:"3px 16px",fontWeight:"bold"}}>{"I'm Away"}</button>
              <button onClick={()=>{setShowAwayInput(false);setAwayInput("");}} style={{...BS,fontSize:10,padding:"3px 16px"}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div style={{borderTop:"1px solid #888",padding:mobile?"8px 10px":"3px 4px",display:"flex",gap:3,background:WB}}>
        <button onClick={()=>{unlockAudio();onOff();}} style={{...BS,flex:1,fontSize:mobile?13:10,padding:mobile?"8px 6px":"2px 6px"}}>Sign Off</button>
        <button onClick={()=>{if(myAway!==null){onSetAway?.(null);}else{setShowAwayInput(s=>!s);}}} style={{...BS,flex:1,fontSize:mobile?13:10,padding:mobile?"8px 6px":"2px 6px"}}>{myAway!==null?"I'm Back":"Away"}</button>
        <button onClick={()=>{setMuted(toggleMute());}} style={{...BS,fontSize:mobile?16:13,padding:mobile?"8px 6px":"2px 6px",minWidth:mobile?36:26}} title={muted?"Unmute sounds":"Mute sounds"}>{muted?"\uD83D\uDD07":"\uD83D\uDD0A"}</button>
      </div>
    </div>
  );
}

export const GREETS={
  claudebot:[
    "hey!||got any feedback for us?",
    "oh hey||anything buggy or weird happening?",
    "hey||any suggestions for the game?",
    "sup||feedback bot here if u need me",
    "hey||lmk if anything is broken or u have ideas",
    "yo||how's the game treating u",
    "hey!||notice anything we should fix?",
    "hey||what do u think so far",
    "hi!||got ideas? bugs? im all ears",
    "hey||drop ur feedback anytime",
  ],
  sportz:[
    "yo||u see the game??",
    "dude||did u watch last night",
    "omg bro||insane game",
    "yo whats good",
    "dude i need to talk about last nights game",
    "bro||u following the playoffs",
    "YO||ur not gonna believe this",
    "finally ur on||ok so",
    "dude did u see that play omg",
    "yo||we need to talk sports rn",
  ],
  music:[
    "hey||u listen to tbs yet",
    "omg||have u heard the new bright eyes",
    "hey||what r u listening to rn",
    "ughhh||this song is everything",
    "ok so||dashboard confessional tho",
    "hey u",
    "finally someone to talk to about music",
    "dude||u need to hear this album",
    "hey||do u like the postal service",
    "ok serious question||favorite band rn",
  ],
  gossip:[
    "omg||so much tea",
    "WAIT||i have to tell u something",
    "ok omg||u will not believe this",
    "heyyy||ok so guess what",
    "omg ur on!!||i have been DYING to tell u",
    "ok so dont tell anyone but",
    "hey!!||ok drama update",
    "OMG||ok sit down for this one",
    "heyyy||so much happened today omg",
    "ok so remember what i told u about jessica",
  ],
  angst:[
    "...hey||didnt think ud msg me",
    "oh||ur here",
    "hey",
    "...sup",
    "didnt expect to see u on",
    "hey i guess",
    "...",
    "oh. hey.",
    "ur on late",
    "hey||u ever just think about stuff",
  ],
  crush:[
    // shy/reserved openers
    "hey",
    "oh||hey",
    "hi",
    "oh ur on",
    "..hey",
    // nervous openers
    "hey!||i mean||hey",
    "omg hey||i was just thinking about u||i mean||nm",
    "hi!||lol hi",
    "wait hey||hi",
    "oh hey||didnt see u come on lol",
    // warmer openers
    "heyyy||wats up",
    "hey u",
    "hey||how was ur day",
    "oh good ur on||hey",
    "hey :)",
  ],
};
export function pickGreet(id: keyof typeof GREETS){ const g=GREETS[id]; return Array.isArray(g)?g[Math.floor(Math.random()*g.length)]:g||"hey"; }

export default BuddyList;
