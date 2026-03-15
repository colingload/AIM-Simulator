import { useState, useEffect, useRef } from "react";
import { F, TG, WB, BS } from "../constants/styles";
import { BUDDIES } from "../constants/buddies";
import { callClaude } from "../utils/api";
import { storageGet, storageSet, storageGetShared, storageSetShared } from "../utils/storage";
import { typingMs, thinkMs } from "../utils/typing";
import { getDateStr, daysBetween, timeAgoText } from "../utils/time";
import { checkMessage } from "../constants/moderation";
import { playSound, SND_IMRCV, SND_IMSEND, unlockAudio } from "../constants/sounds";
import XBtn from "./icons/XBtn";
import Man from "./icons/Man";
import BuddyAvatar from "./BuddyAvatar";
import { exportChatLog } from "../utils/exportLog";
import BuddyProfile from "./BuddyProfile";
import { Message, ConvMessage, BuddyStatus, SessionEntry, UnsolUpdate, ChatFormat } from "../types";
import EmojiPicker from "./EmojiPicker";

interface ChatWinProps {
  buddyId: string;
  sn: string;
  status: BuddyStatus;
  awayMsg: string;
  onClose: () => void;
  onTop: () => void;
  extUpdate: UnsolUpdate | null;
  sessionId: string;
  buddyStarted: boolean;
  onWin: (() => void) | null;
  mobile: boolean;
  strikes: number;
  onStrike: () => void;
  tryTension: ((buddyId: string, exchangeCount: number) => string | null) | null;
  tryJordanMention?: ((buddyId: string, exchangeCount: number) => string | null) | null;
  jordanStage?: number;
  onUserReply?: (buddyId: string) => void;
  convEnergy?: "hyped"|"normal"|"low";
}

function ChatWin({buddyId,sn,status,awayMsg,onClose,onTop,extUpdate,sessionId,buddyStarted,onWin,mobile,strikes,onStrike,tryTension,tryJordanMention,jordanStage=0,onUserReply,convEnergy="normal"}: ChatWinProps) {
  const buddy=BUDDIES.find(b=>b.id===buddyId)!;
  const [msgs,setMsgs]=useState<(Message & {err?:boolean})[]>([]);
  const [inp,setInp]=useState("");
  const [typing,setTyping]=useState(false);
  const [ready,setReady]=useState(false);
  const [showProfile,setShowProfile]=useState(false);
  const [showEmoji,setShowEmoji]=useState(false);
  const [showColorPicker,setShowColorPicker]=useState(false);
  const [chatFmt,setChatFmt]=useState<ChatFormat>({font:"Arial",size:12,color:"#000000",bold:false,italic:false,underline:false});
  const textareaRef=useRef<HTMLTextAreaElement>(null);
  const logRef=useRef<HTMLDivElement>(null);
  const conv=useRef<ConvMessage[]>([]); // raw conv — what gets stored
  const sessionLog=useRef<SessionEntry[]>([]); // [{sid,startIdx}] — tracks session boundaries
  const sessionLogged=useRef(false); // has this session been logged yet?
  const timeCtx=useRef(""); // temporal context injected into system prompt
  const can=status==="online";

  // Build a conv array with session separators injected (for Jordan only)
  function getMarkedConv(){
    if(buddyId!=="crush"||sessionLog.current.length<=1) return conv.current;
    const raw=conv.current;
    const log=sessionLog.current;
    const marked:ConvMessage[]=[];
    let lastSid:string|null=null;
    for(let i=0;i<raw.length;i++){
      let thisSid:string|null=null;
      for(let s=log.length-1;s>=0;s--){
        if(i>=log[s].startIdx){thisSid=log[s].sid;break;}
      }
      if(thisSid && thisSid!==lastSid && lastSid!==null){
        marked.push({role:"user",content:"[--- END OF PREVIOUS CONVERSATION. User signed off AIM and came back later — this is a completely NEW separate session. Everything above was a past conversation, possibly days ago. Do NOT treat it as the current conversation or continue it directly. Start fresh like a new day on AIM. ---]"});
        marked.push({role:"assistant",content:"[got it — new session, starting fresh]"});
      }
      lastSid=thisSid;
      marked.push(raw[i]);
    }
    return marked;
  }

  async function drip(parts:string[],from:string,cur:(Message & {err?:boolean})[],done:(m:(Message & {err?:boolean})[])=>void) {
    let m=[...cur];
    for(let i=0;i<parts.length;i++){
      const p=parts[i].trim(); if(!p)continue;
      if(i===0){
        // First part: think delay (no indicator) → typing delay (with indicator)
        await new Promise(r=>setTimeout(r,thinkMs()));
        setTyping(true);
        const tt=typingMs(p);
        // typing-stop-typing pattern (second-guessing). Higher chance for Jordan at stage 2+
        const hesitateChance = (buddyId==="crush"&&jordanStage>=2) ? 0.50 : 0.35;
        if(Math.random()<hesitateChance && tt>2000){
          await new Promise(r=>setTimeout(r,tt*0.4));
          setTyping(false);
          await new Promise(r=>setTimeout(r,800+Math.random()*1800));
          setTyping(true);
          await new Promise(r=>setTimeout(r,tt*0.5));
        } else {
          await new Promise(r=>setTimeout(r,tt));
        }
      } else {
        // Follow-up parts: short pause → typing based on length
        await new Promise(r=>setTimeout(r,400+Math.random()*800)); // brief gap between sends
        setTyping(true);
        await new Promise(r=>setTimeout(r,typingMs(p)));
      }
      setTyping(false);
      m=[...m,{from,text:p,ts:Date.now(),isNew:true,sid:sessionId}];
      setMsgs([...m]); playSound(SND_IMRCV);
    }
    done(m);
  }

  useEffect(()=>{
    // Reset state for new chat
    shownCount.current=0;
    lastExtV.current=0;
    setReady(false);
    setMsgs([]);
    setTyping(false);
    setShowEmoji(false);
    setShowColorPicker(false);
    (async()=>{
      const savedFmt=await storageGet("chat_format");
      if(savedFmt) setChatFmt(savedFmt);
      const saved=await storageGet("chat_"+buddyId);
      const today=getDateStr();

      // Build temporal context from lastTalkDate
      if(saved?.lastTalkDate){
        const days=daysBetween(saved.lastTalkDate,today)??0;
        if(days===0 && saved?.conv?.length>2){
          timeCtx.current="\n\nTIME CONTEXT: You already talked to this user earlier today in this session. Don't re-introduce yourself or say hey again — just pick up where you left off naturally.";
        } else if(days>=7){
          const ago=timeAgoText(days);
          timeCtx.current="\n\nTIME CONTEXT: You last talked to this user "+ago+". It's been a while. Reference this naturally — like 'hey havent seen u in a bit' or casually ask what they've been up to. Don't be weird about it.";
        } else if(days>=4){
          timeCtx.current="\n\nTIME CONTEXT: You last talked to this user a few days ago. You can mention it briefly but don't make a big deal of it. Just chat normally.";
        } else {
          // 1-3 days — normal daily chatting, no special context needed
          timeCtx.current="";
        }
      } else if(saved?.conv?.length>0){
        timeCtx.current="\n\nTIME CONTEXT: You've talked to this user before but it's been a while. You can vaguely reference past convos.";
      } else {
        timeCtx.current="";
      }

      if(buddyId==="crush" && saved?.messages?.length){
        // Jordan only: load full history, grey out previous sessions
        const loaded=saved.messages.map((m:Message)=>({...m,isOld:m.sid!==sessionId}));
        shownCount.current=loaded.length;
        setMsgs(loaded);
        conv.current=saved.conv||[];
        sessionLog.current=saved.sessionLog||[];
        sessionLogged.current=false;
        setReady(true);
      } else if(saved){
        // Non-Jordan: load conv history for AI memory, but only show THIS session's messages
        conv.current=saved.conv||[];
        sessionLog.current=[];
        sessionLogged.current=false;
        const currentSessionMsgs=(saved.messages||[]).filter((m:Message)=>m.sid===sessionId);
        shownCount.current=currentSessionMsgs.length;
        setMsgs(currentSessionMsgs);
        setReady(true);
      } else {
        conv.current=[];
        sessionLog.current=[];
        sessionLogged.current=false;
        setReady(true);
      }
    })();
  },[buddyId]);

  useEffect(()=>{if(logRef.current)logRef.current.scrollTop=logRef.current.scrollHeight;},[msgs,typing]);
  const shownCount=useRef(0);
  const lastExtV=useRef(0); // version counter to prevent re-processing
  useEffect(()=>{
    if(!ready) return; // don't process until initial load is done
    if(!extUpdate||!extUpdate.msgs) return;
    if(extUpdate.v && extUpdate.v<=lastExtV.current) return; // already processed
    if(extUpdate.v) lastExtV.current=extUpdate.v;
    conv.current=extUpdate.conv;
    // For non-Jordan, only show current session messages
    const relevantMsgs = buddyId==="crush" ? extUpdate.msgs : extUpdate.msgs.filter((m:Message)=>m.sid===sessionId);
    const alreadyShown = shownCount.current;
    const newOnes=relevantMsgs.slice(alreadyShown);
    if(!newOnes.length) return;
    shownCount.current = alreadyShown + newOnes.length;
    // Show new messages one at a time with word-count-based delays
    let cumulativeDelay=0;
    newOnes.forEach((msg:Message,i:number)=>{
      const delay = i===0 ? 0 : typingMs(msg.text||"hey");
      cumulativeDelay+=delay;
      setTimeout(()=>{
        const visible = relevantMsgs.slice(0, alreadyShown + i + 1);
        setMsgs(visible.map((m:Message)=>({...m,sid:m.sid||sessionId})));
        if(alreadyShown>0||i>0) playSound(SND_IMRCV);
      }, cumulativeDelay);
    });
  },[extUpdate,ready]);

  async function send() {
    const text=inp.trim(); if(!text||!can)return;
    unlockAudio(); setInp("");

    // ── Moderation check ──
    if(checkMessage(text)){
      // Buddy reacts uncomfortably first
      const buddyReactions: Record<string, string[]> = {
        claudebot: ["whoa thats not cool","hey pls keep it appropriate","not the vibe"],
        sportz:    ["dude what","bro chill","yo thats not cool man"],
        music:     ["um what","thats not ok","dude...no"],
        gossip:    ["eww stop","omg thats gross","um no thx"],
        angst:     ["...why would u say that","not cool","yeah im good on that"],
        crush:     ["um","wow ok","i dont wanna talk about that","..."],
      };
      const reactions = buddyReactions[buddyId] || ["hey thats not cool"];
      const reaction = reactions[Math.floor(Math.random()*reactions.length)];

      const warns=[
        "⚠️ Keep it clean — this is meant to be fun. (Warning "+(strikes+1)+"/3)",
        "⚠️ Last warning. One more and you're getting signed off. (Warning "+(strikes+1)+"/3)",
        "⚠️ That's it. You're out."
      ];
      const warnMsg = warns[Math.min(strikes, warns.length-1)];
      setMsgs(p=>[...p,
        {from:sn,text,ts:Date.now(),isNew:true,sid:sessionId},
        {from:buddy.sn,text:reaction,ts:Date.now(),isNew:true,sid:sessionId},
        {from:"System",text:warnMsg,ts:Date.now(),err:true}
      ]);
      playSound(SND_IMRCV);
      if(onStrike) onStrike();
      return;
    }

    if(onUserReply) onUserReply(buddyId);
    const um={from:sn,text,ts:Date.now(),isNew:true,sid:sessionId,fmt:chatFmt};
    const wu=[...msgs,um];
    setMsgs(wu); playSound(SND_IMSEND);

    // For Jordan: log this session's start index in conv before first message
    if(buddyId==="crush" && !sessionLogged.current){
      sessionLog.current=[...sessionLog.current,{sid:sessionId,startIdx:conv.current.length}];
      sessionLogged.current=true;
    }

    conv.current=[...conv.current,{role:"user",content:text}];

    // Save feedback when messaging FeedbackBot — shared so all users' feedback is visible
    if(buddyId==="claudebot"){
      try{
        const existing=await storageGetShared("feedback_log")||[];
        existing.push({sn,text,ts:Date.now(),session:sessionId});
        await storageSetShared("feedback_log",existing);
      }catch(e){}
    }

    // No typing indicator during API call — buddy is "reading" your message.
    // Drip function handles think delay + typing indicator after response arrives.
    try{
      // Check for tension moment — inject drama prompt if triggered
      const exchangeCount = conv.current.filter((m:ConvMessage)=>m.role==="user").length;
      const tensionPrompt = tryTension ? tryTension(buddyId, exchangeCount) : null;
      // Check if this buddy should casually mention Jordan
      const jordanMention = tryJordanMention ? tryJordanMention(buddyId, exchangeCount) : null;
      let systemForCall = (tensionPrompt ? buddy.system + "\n\nIMPORTANT OVERRIDE FOR THIS ONE REPLY ONLY: " + tensionPrompt : buddy.system) + timeCtx.current;
      // Conversation energy — affects how engaged the buddy is
      if(convEnergy==="low") systemForCall+="\n\nENERGY: You're distracted right now — doing homework, watching TV, half paying attention. Give shorter responses. Sometimes just 'lol' or 'ya' or 'haha true' or 'idk'. The user has to carry this conversation. Don't ask questions back unless they say something really interesting.";
      else if(convEnergy==="hyped") systemForCall+="\n\nENERGY: You're really into this conversation right now. You have a lot to say. After responding, you might add another thought unprompted. Use more || chunks than usual. Be engaged — ask follow-up questions, share related things, keep the energy going.";
      if(jordanMention){
        systemForCall += "\n\nAFTER you respond to what they said, casually add this in a separate message chunk (use ||): \""+jordanMention+"\". Make it feel natural and offhand, like you just thought of it. Don't make a big deal of it.";
      }
      // Use marked conv (with session separators) for Jordan, raw conv for others
      const convForApi = buddyId==="crush" ? getMarkedConv() : conv.current;
      const raw=await callClaude(systemForCall,convForApi);
      const parts=raw.split("||").map(p=>p.trim()).filter(Boolean);
      conv.current=[...conv.current,{role:"assistant",content:parts.join(" ")}];
      await drip(parts,buddy.sn,wu,async (fm:(Message & {err?:boolean})[])=>{
        await storageSet("chat_"+buddyId,{messages:fm,conv:conv.current,lastTalkDate:getDateStr(),sessionLog:sessionLog.current});
      });
      // Hyped energy: 40% chance buddy sends an unprompted follow-up 5-15s later
      if(convEnergy==="hyped"&&Math.random()<0.40&&buddyId!=="claudebot"){
        setTimeout(async()=>{
          try{
            const followUp=await callClaude(systemForCall+"\n\nYou just finished saying something. Now add one more thought unprompted — something related you just thought of, a question, or a 'oh wait also'. Keep it short (1-2 chunks max). Use || to split if needed.",conv.current);
            const fp=followUp.split("||").map(p=>p.trim()).filter(Boolean);
            conv.current=[...conv.current,{role:"assistant",content:fp.join(" ")}];
            const latest=await storageGet("chat_"+buddyId);
            const lm=latest?.messages||[];
            await drip(fp,buddy.sn,lm,async(fm)=>{
              await storageSet("chat_"+buddyId,{messages:fm,conv:conv.current,lastTalkDate:getDateStr(),sessionLog:sessionLog.current});
            });
          }catch(e){}
        },5000+Math.random()*10000);
      }
      // Save bot response to feedback log for full context
      if(buddyId==="claudebot"){
        try{
          const existing=await storageGetShared("feedback_log")||[];
          existing.push({sn:buddy.sn,text:parts.join(" "),ts:Date.now(),session:sessionId,isBot:true});
          await storageSetShared("feedback_log",existing);
        }catch(e){}
      }
      // Win detection for Jordan — only at stage 4 (relationship must develop over multiple sessions)
      if(buddyId==="crush"&&onWin&&conv.current.length>=4&&jordanStage>=4){
        try{
          const last4=conv.current.slice(-4);
          const check=await callClaude(
            "You are a judge. Look at the last few messages of an AIM conversation between a teen and their crush. Did the crush (the assistant) just agree to go out with the user, say yes to a date, confess mutual feelings, or clearly reciprocate romantic interest? Reply ONLY with YES or NO. Nothing else.",
            [{role:"user",content:JSON.stringify(last4)}],10
          );
          if(check.trim().toUpperCase().startsWith("YES")){
            setTimeout(()=>onWin(),3000);
          }
        }catch(e){}
      }
    }catch(e:unknown){
      setTyping(false);
      setMsgs(p=>[...p,{from:"System",text:"error: "+(e instanceof Error ? e.message : String(e)),ts:Date.now(),err:true}]);
      console.error(e);
    }
  }

  return (
    <div onClick={onTop} style={{background:WB,border:mobile?"none":"2px solid",borderColor:"#fff #444 #444 #fff",width:mobile?"100%":410,height:mobile?"100%":"auto",fontFamily:F,boxShadow:mobile?"none":"2px 2px 6px rgba(0,0,0,0.45)",display:"flex",flexDirection:"column"}}>
      <div data-dh="1" style={{background:TG,color:"#fff",fontWeight:"bold",fontSize:mobile?14:12,padding:mobile?"10px 14px":"3px 6px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:mobile?"default":"move"}}>
        <div style={{display:"flex",alignItems:"center",gap:mobile?8:4}}>
          {mobile&&<button onClick={onClose} style={{background:"none",border:"none",color:"#fff",fontSize:18,cursor:"pointer",padding:"0 4px 0 0"}}>‹</button>}
          <BuddyAvatar buddyId={buddyId} size={mobile?24:18}/><span onClick={()=>setShowProfile(true)} style={{cursor:"pointer"}}>{buddy.emoji} {buddy.sn}</span>
          {status!=="online"&&<span style={{fontSize:mobile?11:9,opacity:0.7,marginLeft:4}}>({status})</span>}
        </div>
        {!mobile&&<div style={{display:"flex",gap:1}}>
          <button style={{...BS,padding:0,width:17,height:15,fontSize:9}}>_</button>
          <button style={{...BS,padding:0,width:17,height:15,fontSize:9}}>□</button>
          <XBtn onClick={onClose}/>
        </div>}
      </div>
      <div ref={logRef} style={{flex:mobile?1:"unset",height:mobile?"auto":210,overflowY:"auto",padding:mobile?"12px 14px":"7px 10px",background:"#fff",borderBottom:"1px solid #808080"}}>
        {!ready&&<div style={{color:"#aaa",fontSize:mobile?13:11,fontStyle:"italic"}}>Loading...</div>}
        {msgs.map((m,i)=>(
          <div key={i} style={{marginBottom:mobile?6:3,lineHeight:1.6,opacity:m.isOld?0.4:1}}>
            <span style={{fontWeight:"bold",fontSize:mobile?14:12,color:m.err?"#c00":m.from===buddy.sn?"#cc0000":"#0000cc"}}>{m.from}: </span>
            <span style={{
              fontSize:m.fmt?.size||(mobile?14:12),
              color:m.err?"#c00":(m.fmt?.color||"#000"),
              fontFamily:m.fmt?.font||"inherit",
              fontWeight:m.fmt?.bold?"bold":"normal",
              fontStyle:m.fmt?.italic?"italic":"normal",
              textDecoration:m.fmt?.underline?"underline":"none",
            }}>{m.text}</span>
          </div>
        ))}
        {typing&&<div style={{color:"#aaa",fontSize:mobile?13:11,fontStyle:"italic"}}>{buddy.sn} is typing...</div>}
      </div>
      {!mobile&&<div style={{background:WB,borderBottom:"1px solid #808080",padding:"2px 3px",display:"flex",gap:1,alignItems:"center",position:"relative"}}>
        <select value={chatFmt.font} onChange={e=>{const f={...chatFmt,font:e.target.value};setChatFmt(f);storageSet("chat_format",f);}} style={{fontSize:9,fontFamily:F,border:"1px inset #808080",padding:"1px 2px",maxWidth:80}}>
          {["Arial","Times New Roman","Comic Sans MS","Georgia","Verdana","Courier New"].map(f=><option key={f} value={f} style={{fontFamily:f}}>{f}</option>)}
        </select>
        <select value={chatFmt.size} onChange={e=>{const f={...chatFmt,size:Number(e.target.value)};setChatFmt(f);storageSet("chat_format",f);}} style={{fontSize:9,fontFamily:F,border:"1px inset #808080",padding:"1px 2px",width:34}}>
          {[10,12,14,16].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={()=>{const f={...chatFmt,bold:!chatFmt.bold};setChatFmt(f);storageSet("chat_format",f);}} style={{...BS,padding:"1px 4px",fontSize:11,fontWeight:"bold",minWidth:18,background:chatFmt.bold?"#c0c0ff":"linear-gradient(180deg,#ece9d8,#d4d0c8)"}}>B</button>
        <button onClick={()=>{const f={...chatFmt,italic:!chatFmt.italic};setChatFmt(f);storageSet("chat_format",f);}} style={{...BS,padding:"1px 4px",fontSize:11,fontStyle:"italic",minWidth:18,background:chatFmt.italic?"#c0c0ff":"linear-gradient(180deg,#ece9d8,#d4d0c8)"}}>I</button>
        <button onClick={()=>{const f={...chatFmt,underline:!chatFmt.underline};setChatFmt(f);storageSet("chat_format",f);}} style={{...BS,padding:"1px 4px",fontSize:11,textDecoration:"underline",minWidth:18,background:chatFmt.underline?"#c0c0ff":"linear-gradient(180deg,#ece9d8,#d4d0c8)"}}>U</button>
        <button onClick={()=>setShowColorPicker(p=>!p)} style={{...BS,padding:"1px 4px",fontSize:10,minWidth:18,position:"relative"}}>
          <span style={{color:chatFmt.color}}>A</span>
          <span style={{display:"block",height:2,width:12,background:chatFmt.color,margin:"0 auto"}}/>
        </button>
        <div style={{position:"relative"}}>
          <button onClick={()=>setShowEmoji(p=>!p)} style={{...BS,padding:"1px 4px",fontSize:12,minWidth:18}}>☺</button>
          {showEmoji&&<EmojiPicker mobile={mobile} onPick={emoji=>{
            if(textareaRef.current){
              const ta=textareaRef.current;
              const start=ta.selectionStart;
              const end=ta.selectionEnd;
              setInp(inp.slice(0,start)+emoji+inp.slice(end));
              setTimeout(()=>{ta.focus();ta.setSelectionRange(start+emoji.length,start+emoji.length);},0);
            } else {
              setInp(inp+emoji);
            }
          }} onClose={()=>setShowEmoji(false)}/>}
        </div>
        <div style={{flex:1}}/>
        <button onClick={()=>exportChatLog(buddy.sn,msgs,sn)} style={{...BS,padding:"1px 6px",fontSize:10}} title="Save conversation log">💾</button>
        {showColorPicker&&<div style={{position:"absolute",top:"100%",left:0,zIndex:500,background:"#ece9d8",border:"2px solid",borderColor:"#fff #444 #444 #fff",padding:4,display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:2,boxShadow:"2px 2px 6px rgba(0,0,0,0.3)"}}>
          {["#000000","#cc0000","#0000cc","#008800","#880088","#cc6600","#800000","#008080","#000080","#888888","#ff3399","#663300"].map(c=>(
            <button key={c} onClick={()=>{const f={...chatFmt,color:c};setChatFmt(f);storageSet("chat_format",f);setShowColorPicker(false);}}
              style={{width:16,height:16,background:c,border:chatFmt.color===c?"2px solid #fff":"1px solid #666",cursor:"pointer",padding:0}}/>
          ))}
        </div>}
      </div>}
      <div style={{display:"flex",gap:0,borderTop:mobile?"1px solid #808080":"none"}}>
        <textarea ref={textareaRef} value={inp} onChange={e=>setInp(e.target.value)} onClick={unlockAudio}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
          disabled={!can}
          placeholder={can?"Type here...":buddy.sn+" is "+status}
          style={{flex:1,height:mobile?44:55,padding:mobile?"10px 12px":"5px 9px",fontSize:mobile?16:chatFmt.size,border:"none",borderBottom:mobile?"none":"1px solid #808080",outline:"none",resize:"none",fontFamily:mobile?F:chatFmt.font,background:can?"#fff":"#f0ede8",color:can?chatFmt.color:"#999",fontWeight:chatFmt.bold?"bold":"normal",fontStyle:chatFmt.italic?"italic":"normal",textDecoration:chatFmt.underline?"underline":"none",boxSizing:"border-box"}}/>
        <button onClick={send} disabled={!can||!inp.trim()} style={{...BS,border:"none",borderLeft:"1px solid #ccc",padding:mobile?"10px 18px":"2px 10px",fontWeight:"bold",fontSize:mobile?16:10,background:(can&&inp.trim())?"linear-gradient(180deg,#4a90d9,#2060b0)":"linear-gradient(180deg,#ece9d8,#d4d0c8)",color:(can&&inp.trim())?"#fff":"#999",borderRadius:0}}>
          Send
        </button>
      </div>
      {!mobile&&<div style={{background:WB,padding:"3px 5px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",gap:2}}>
          {[["⚡","Warn"],["🚫","Block"],["😄","Exprs"],["🎲","Games"],["📞","Talk"]].map(([ic,lb])=>(
            <button key={lb} style={{...BS,fontSize:9,padding:"1px 4px",display:"flex",flexDirection:"column",alignItems:"center"}}>
              <span style={{fontSize:13}}>{ic}</span><span>{lb}</span>
            </button>
          ))}
        </div>
      </div>}
      {showProfile&&<BuddyProfile buddy={buddy} onClose={()=>setShowProfile(false)}/>}
    </div>
  );
}

export default ChatWin;
