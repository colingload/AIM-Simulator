import { F, TG, WB, BS, dot } from "../constants/styles";
import { BUDDIES } from "../constants/buddies";
import Man from "./icons/Man";
import XBtn from "./icons/XBtn";
import BuddyAvatar from "./BuddyAvatar";
import { unlockAudio, toggleMute, isMuted } from "../constants/sounds";
import { useState } from "react";
import { BuddyStatus } from "../types";

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
      <div style={{background:"#fff",padding:mobile?"10px 14px":"6px 6px 5px",borderBottom:"2px solid #808080",display:"flex",alignItems:"center",gap:mobile?12:7}}>
        <Man sz={mobile?36:30}/>
        <div>
          <div style={{fontSize:mobile?15:12,fontWeight:"bold",color:"#ff6600",fontFamily:"Arial Black,sans-serif"}}>AOL</div>
          <div style={{fontSize:mobile?12:10,lineHeight:1.2}}>Instant Messenger™</div>
        </div>
        <div style={{marginLeft:"auto",fontSize:mobile?12:10,color:"#555"}}>{sn}</div>
      </div>
      <div style={{background:"#d4d0c8",fontSize:mobile?12:10,fontWeight:"bold",padding:mobile?"5px 14px":"2px 6px",letterSpacing:1,borderBottom:"1px solid #888"}}>BUDDIES</div>
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
              <span style={{fontSize:mobile?15:12,fontWeight:st==="online"||hasUnread?"bold":"normal",color:st==="offline"?"#888":"inherit",flex:1}}>{b.sn}</span>
              {hasUnread&&<span style={{background:"#cc0000",color:"#fff",borderRadius:10,fontSize:mobile?12:9,padding:mobile?"2px 8px":"1px 5px",fontWeight:"bold",minWidth:mobile?20:14,textAlign:"center"}}>{unread[b.id]}</span>}
              {st==="away"&&!hasUnread&&<span style={{fontSize:mobile?11:9,color:"#886600"}}>away</span>}
            </div>
          );
        })}
      </div>
      {myAway !== null && (
        <div style={{background:"#ffffcc",padding:mobile?"8px 14px":"4px 8px",borderTop:"1px solid #cccc66",fontSize:mobile?12:10}}>
          <div style={{fontWeight:"bold",color:"#886600",marginBottom:2}}>Away Message:</div>
          <div style={{fontStyle:"italic",color:"#666",marginBottom:4}}>{myAway}</div>
          <button onClick={()=>onSetAway?.(null)} style={{...BS,fontSize:mobile?12:9,padding:mobile?"4px 10px":"1px 6px"}}>{"I'm Back"}</button>
        </div>
      )}
      {showAwayInput && myAway === null && (
        <div style={{background:"#f0ede8",padding:mobile?"8px 14px":"4px 8px",borderTop:"1px solid #aaa",fontSize:mobile?12:10}}>
          <input value={awayInput} onChange={e=>setAwayInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&awayInput.trim()){onSetAway?.(awayInput.trim());setAwayInput("");setShowAwayInput(false);}}}
            placeholder="Type away message..."
            style={{width:"100%",padding:"2px 4px",fontSize:mobile?13:10,fontFamily:F,border:"1px inset #808080",marginBottom:3,boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:3}}>
            <button onClick={()=>{if(awayInput.trim()){onSetAway?.(awayInput.trim());setAwayInput("");setShowAwayInput(false);}}} style={{...BS,fontSize:mobile?11:9,padding:mobile?"4px 8px":"1px 6px"}}>Set Away</button>
            <button onClick={()=>{setShowAwayInput(false);setAwayInput("");}} style={{...BS,fontSize:mobile?11:9,padding:mobile?"4px 8px":"1px 6px"}}>Cancel</button>
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
