import { useState, useRef, useEffect } from "react";
import { F, WB, BS } from "../constants/styles";
import { ChatFormat } from "../types";
import EmojiPicker from "./EmojiPicker";
import AwayShareCard from "./AwayShareCard";
import { toPng } from "html-to-image";

interface AwayCreatorProps {
  onGoToApp: () => void;
}

export default function AwayCreator({ onGoToApp }: AwayCreatorProps) {
  const [msg, setMsg] = useState("");
  const [screenName, setScreenName] = useState("");
  const [fmt, setFmt] = useState<ChatFormat>({font:"Georgia",size:13,color:"#cc6600",bold:false,italic:true,underline:false});
  const [showEmoji, setShowEmoji] = useState(false);
  const [showColor, setShowColor] = useState(false);
  const [shared, setShared] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(()=>{
    // Generate a fun default screen name
    const prefixes = ["xo_","~*","Sk8r","xX_","","",""];
    const names = ["Jordan","Ashley","Tyler","Brittany","Mike","Sarah","Chris","Tiffany","Nick","Lauren"];
    const suffixes = ["_xo","*~","Boi","_Xx","03","2003","_04",""];
    const p = prefixes[Math.floor(Math.random()*prefixes.length)];
    const n = names[Math.floor(Math.random()*names.length)];
    const s = suffixes[Math.floor(Math.random()*suffixes.length)];
    setScreenName(p+n+s);
  },[]);

  async function handleShare() {
    const node = document.getElementById("away-share-card");
    if (!node) return;
    try {
      const dataUrl = await toPng(node, { pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "my-2003-away-message.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My 2003 Away Message" });
      } else {
        const a = document.createElement("a");
        a.href = dataUrl; a.download = "my-2003-away-message.png"; a.click();
      }
      setShared(true);
    } catch (e) { console.error("Share failed", e); }
  }

  return (
    <div style={{position:"fixed",inset:0,background:"url('/xp-bg.jpg') center/cover no-repeat",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F,padding:16}}>
      <div style={{background:WB,border:"2px solid",borderColor:"#fff #444 #444 #fff",width:"100%",maxWidth:400,boxShadow:"3px 3px 8px rgba(0,0,0,0.5)"}}>
        {/* Title bar */}
        <div style={{background:"linear-gradient(180deg,#0058ee 0%,#3a93ff 8%,#0058ee 40%,#0047cc 100%)",padding:"4px 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:14}}>🏃</span>
            <span style={{color:"#fff",fontSize:11,fontWeight:"bold"}}>Create Your 2003 Away Message</span>
          </div>
        </div>

        <div style={{padding:"12px 16px",background:WB}}>
          <div style={{textAlign:"center",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:"bold",color:"#333",marginBottom:4}}>what would your away message say?</div>
            <div style={{fontSize:10,color:"#888",fontStyle:"italic"}}>it's 2003. you're signing off AIM to go to the mall.</div>
          </div>

          {/* Screen name input */}
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
            <label style={{fontSize:10,fontWeight:"bold",flexShrink:0}}>Screen Name:</label>
            <input value={screenName} onChange={e=>setScreenName(e.target.value)}
              style={{flex:1,padding:"2px 4px",fontSize:11,fontFamily:F,border:"1px inset #808080"}}/>
          </div>

          {/* Formatting toolbar */}
          <div style={{background:"#ece9d8",padding:"3px 4px",borderBottom:"1px solid #aaa",display:"flex",gap:2,alignItems:"center",position:"relative"}}>
            <select value={fmt.font} onChange={e=>setFmt({...fmt,font:e.target.value})} style={{fontSize:9,fontFamily:F,border:"1px inset #808080",padding:"1px 2px",maxWidth:80}}>
              {["Georgia","Arial","Times New Roman","Comic Sans MS","Verdana","Courier New"].map(f=><option key={f} value={f}>{f}</option>)}
            </select>
            <select value={fmt.size} onChange={e=>setFmt({...fmt,size:Number(e.target.value)})} style={{fontSize:9,fontFamily:F,border:"1px inset #808080",padding:"1px 2px",width:34}}>
              {[10,12,14,16].map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={()=>setFmt({...fmt,bold:!fmt.bold})} style={{...BS,padding:"1px 4px",fontSize:10,fontWeight:"bold",minWidth:16,background:fmt.bold?"#c0c0ff":"linear-gradient(180deg,#ece9d8,#d4d0c8)"}}>B</button>
            <button onClick={()=>setFmt({...fmt,italic:!fmt.italic})} style={{...BS,padding:"1px 4px",fontSize:10,fontStyle:"italic",minWidth:16,background:fmt.italic?"#c0c0ff":"linear-gradient(180deg,#ece9d8,#d4d0c8)"}}>I</button>
            <button onClick={()=>setFmt({...fmt,underline:!fmt.underline})} style={{...BS,padding:"1px 4px",fontSize:10,textDecoration:"underline",minWidth:16,background:fmt.underline?"#c0c0ff":"linear-gradient(180deg,#ece9d8,#d4d0c8)"}}>U</button>
            <button onClick={()=>setShowColor(p=>!p)} style={{...BS,padding:"1px 4px",fontSize:10,minWidth:16}}>
              <span style={{color:fmt.color}}>A</span>
            </button>
            <div style={{position:"relative"}}>
              <button onClick={()=>setShowEmoji(p=>!p)} style={{...BS,padding:"1px 4px",fontSize:11,minWidth:16}}>☺</button>
              {showEmoji&&<EmojiPicker onPick={emoji=>{
                if(textRef.current){
                  const ta=textRef.current;
                  const start=ta.selectionStart;
                  const end=ta.selectionEnd;
                  setMsg(msg.slice(0,start)+emoji+msg.slice(end));
                  setTimeout(()=>{ta.focus();ta.setSelectionRange(start+emoji.length,start+emoji.length);},0);
                } else { setMsg(msg+emoji); }
              }} onClose={()=>setShowEmoji(false)}/>}
            </div>
            {showColor&&<div style={{position:"absolute",top:"100%",left:0,zIndex:500,background:"#ece9d8",border:"2px solid",borderColor:"#fff #444 #444 #fff",padding:3,display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:2,boxShadow:"2px 2px 6px rgba(0,0,0,0.3)"}}>
              {["#000000","#cc0000","#0000cc","#008800","#880088","#cc6600","#800000","#008080","#000080","#888888","#ff3399","#663300"].map(c=>(
                <button key={c} onClick={()=>{setFmt({...fmt,color:c});setShowColor(false);}}
                  style={{width:16,height:16,background:c,border:fmt.color===c?"2px solid #fff":"1px solid #666",cursor:"pointer",padding:0}}/>
              ))}
            </div>}
          </div>

          {/* Message textarea */}
          <textarea ref={textRef} value={msg} onChange={e=>setMsg(e.target.value)}
            placeholder={"eternal sunshine of the spotless mind.\n\n~*~ leave love. make it ring. ~*~"}
            style={{width:"100%",minHeight:100,padding:"8px 10px",fontSize:fmt.size,fontFamily:fmt.font+",serif",fontStyle:fmt.italic?"italic":"normal",fontWeight:fmt.bold?"bold":"normal",textDecoration:fmt.underline?"underline":"none",color:fmt.color,border:"1px inset #808080",borderTop:"none",resize:"vertical",boxSizing:"border-box"}}/>

          {/* Action buttons */}
          <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:10}}>
            <button onClick={handleShare} disabled={!msg.trim()||!screenName.trim()}
              style={{...BS,fontSize:11,padding:"5px 20px",fontWeight:"bold",opacity:(!msg.trim()||!screenName.trim())?0.5:1}}>
              📤 Create & Share
            </button>
          </div>

          {shared&&<div style={{textAlign:"center",marginTop:8,fontSize:10,color:"#008800",fontWeight:"bold"}}>
            image saved! share it on social media 🎉
          </div>}

          {/* CTA to full app */}
          <div style={{textAlign:"center",marginTop:14,paddingTop:10,borderTop:"1px solid #ccc"}}>
            <div style={{fontSize:10,color:"#888",marginBottom:4}}>want to actually sign on to AIM?</div>
            <button onClick={onGoToApp} style={{...BS,fontSize:11,padding:"4px 16px",background:"linear-gradient(180deg,#4a90d9,#2060b0)",color:"#fff",fontWeight:"bold",borderColor:"#2060b0 #0a3a8a #0a3a8a #2060b0"}}>
              Sign On →
            </button>
          </div>
        </div>

        <div style={{textAlign:"center",fontSize:7,color:"#999",padding:"3px 0",background:"#ece9d8",borderTop:"1px solid #aaa"}}>
          A nostalgia experience. Not affiliated with or endorsed by AOL, Inc.
        </div>
      </div>

      {/* Hidden share card */}
      <div style={{position:"fixed",left:-9999,top:-9999,opacity:0,pointerEvents:"none"}}>
        <AwayShareCard screenName={screenName} message={msg||"eternal sunshine of the spotless mind."} fmt={fmt}/>
      </div>
    </div>
  );
}
