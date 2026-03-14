import { useState, useEffect } from "react";
import { F, TG, WB, BS } from "../constants/styles";
import { storageGet, storageSet, storageGetShared, storageSetShared } from "../utils/storage";
import { unlockAudio, playSound, SND_DOOROPEN } from "../constants/sounds";
import Man from "./icons/Man";
import XBtn from "./icons/XBtn";
import { PaceMode } from "../types";

interface SignOnProps {
  onSignIn: (name: string, gender: string, pace: PaceMode) => void;
}

function SignOn({onSignIn}: SignOnProps) {
  const [sn,setSn]=useState("");
  const [savedSNs,setSavedSNs]=useState<string[]>([]);
  const [loading,setLoading]=useState(false);
  const [snMode,setSnMode]=useState("select");
  const [newSN,setNewSN]=useState("");
  const [gender,setGender]=useState("");
  const [pace,setPace]=useState<PaceMode>("normal");
  const [firstVisit,setFirstVisit]=useState(false);
  const [signOnCount,setSignOnCount]=useState<number|null>(null);

  useEffect(()=>{
    (async()=>{
      const saved=await storageGet("saved_screennames");
      const savedG=await storageGet("saved_gender");
      const savedP=await storageGet("saved_pace");
      if(saved&&saved.length){
        setSavedSNs(saved);
        setSn(saved[0]);
      } else {
        setSnMode("new");
      }
      if(savedG) setGender(savedG);
      if(savedP) setPace(savedP as PaceMode);
      const visited=await storageGet("has_visited");
      if(!visited) setFirstVisit(true);
      const count=await storageGetShared("signon_count");
      if(count) setSignOnCount(count);
    })();
  },[]);

  async function go() {
    const name=(snMode==="new"?newSN:sn).trim();
    if(!name||!gender)return;
    const updated=[name,...savedSNs.filter(s=>s!==name)].slice(0,5);
    await storageSet("saved_screennames",updated);
    await storageSet("saved_gender",gender);
    await storageSet("saved_pace",pace);
    await storageSet("has_visited",true);
    const prev=await storageGetShared("signon_count");
    await storageSetShared("signon_count",(prev||0)+1);
    setFirstVisit(false);
    unlockAudio(); playSound(SND_DOOROPEN); setLoading(true);
    setTimeout(()=>onSignIn(name,gender,pace),900);
  }

  return (
    <div onClick={unlockAudio} style={{position:"fixed",inset:0,background:"url('/xp-bg.jpg') center/cover no-repeat",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F,padding:16}}>
      <div style={{background:"#bbc3d0",border:"2px solid",borderColor:"#fff #444 #444 #fff",width:"100%",maxWidth:280,boxShadow:"3px 3px 8px rgba(0,0,0,0.5)"}}>
        <div data-dh="1" style={{background:TG,color:"#fff",fontWeight:"bold",fontSize:11,padding:"2px 5px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"default"}}>
          <div style={{display:"flex",alignItems:"center",gap:3}}><Man sz={12}/><span>Sign On</span></div>
          <XBtn/>
        </div>

        {/* AIM Logo Section - dark blue gradient with yellow running man */}
        <div style={{background:"linear-gradient(180deg,#1a237e 0%,#283593 50%,#1a237e 100%)",padding:"18px 14px",textAlign:"center"}}>
          <div style={{fontSize:48,lineHeight:1,marginBottom:4,filter:"drop-shadow(2px 2px 4px rgba(0,0,0,0.5))"}}>🏃</div>
          <div style={{color:"#fff",fontSize:16,fontWeight:"bold",fontFamily:"Arial,sans-serif",letterSpacing:1}}>AOL Instant Messenger</div>
          <div style={{color:"#ccc",fontSize:9,marginTop:2}}>TM</div>
          {firstVisit&&<div style={{color:"#aab8d0",fontSize:10,fontStyle:"italic",marginTop:6,letterSpacing:0.5}}>it's 2003. you just got home from school.</div>}
        </div>

        {/* Form Section */}
        <div style={{padding:"10px 14px 6px",background:"#bbc3d0"}}>
          <div style={{display:"flex",alignItems:"center",marginBottom:2,gap:6}}>
            <label style={{fontSize:11,fontWeight:"bold",flexShrink:0}}>ScreenName</label>
            <span style={{color:"red",fontSize:10}}>●━━━</span>
          </div>
          <div style={{marginBottom:4}}>
            {snMode==="select" ? (
              <div style={{display:"flex",gap:3}}>
                <select value={sn} onChange={e=>setSn(e.target.value)} style={{flex:1,padding:"2px 3px",fontSize:11,fontFamily:F,border:"1px inset #808080",background:"#fff"}}>
                  {savedSNs.map(s=><option key={s}>{s}</option>)}
                </select>
                <button onClick={()=>setSnMode("new")} style={{...BS,fontSize:9,padding:"1px 4px"}}>New</button>
              </div>
            ) : (
              <div style={{display:"flex",gap:3}}>
                <input autoFocus value={newSN} onChange={e=>setNewSN(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&go()}
                  placeholder="Enter screen name"
                  style={{flex:1,padding:"2px 4px",fontSize:11,fontFamily:F,border:"1px inset #808080"}}/>
                {savedSNs.length>0&&<button onClick={()=>setSnMode("select")} style={{...BS,fontSize:9,padding:"1px 4px"}}>↩</button>}
              </div>
            )}
          </div>
          <div style={{fontSize:10,color:"#0000cc",cursor:"pointer",marginBottom:8,textDecoration:"underline"}}>Get a Screen Name</div>

          <div style={{marginBottom:2}}>
            <label style={{fontSize:11,fontWeight:"bold"}}>Password</label>
          </div>
          <input type="password" disabled value="••••••••" style={{width:"100%",padding:"2px 4px",fontSize:11,fontFamily:F,border:"1px inset #808080",background:"#ece9d8",color:"#999",marginBottom:2,boxSizing:"border-box"}}/>
          <div style={{fontSize:10,color:"#0000cc",cursor:"pointer",marginBottom:6,textDecoration:"underline"}}>Forgot Password?</div>

          <div style={{display:"flex",gap:16,fontSize:10,marginBottom:8}}>
            <label style={{display:"flex",alignItems:"center",gap:3,color:"#333"}}><input type="checkbox" defaultChecked disabled/>Save password</label>
            <label style={{display:"flex",alignItems:"center",gap:3,color:"#333"}}><input type="checkbox"/>Auto-login</label>
          </div>

          {/* Gender Selection */}
          <div style={{display:"flex",alignItems:"center",marginBottom:6,gap:6}}>
            <label style={{fontSize:11,fontWeight:"bold",flexShrink:0}}>I am a</label>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setGender("m")} style={{...BS,fontSize:11,padding:"2px 12px",background:gender==="m"?"linear-gradient(180deg,#4a90d9,#2060b0)":"linear-gradient(180deg,#ece9d8,#d4d0c8)",color:gender==="m"?"#fff":"#000",borderColor:gender==="m"?"#2060b0 #0a3a8a #0a3a8a #2060b0":"#fff #888 #888 #fff"}}>
                guy 🤙
              </button>
              <button onClick={()=>setGender("f")} style={{...BS,fontSize:11,padding:"2px 12px",background:gender==="f"?"linear-gradient(180deg,#d94ab0,#b02080)":"linear-gradient(180deg,#ece9d8,#d4d0c8)",color:gender==="f"?"#fff":"#000",borderColor:gender==="f"?"#b02080 #7a0060 #7a0060 #b02080":"#fff #888 #888 #fff"}}>
                girl 💅
              </button>
            </div>
          </div>

          {/* Vibe Selection */}
          <div style={{display:"flex",alignItems:"center",marginBottom:6,gap:6}}>
            <label style={{fontSize:11,fontWeight:"bold",flexShrink:0}}>Vibe</label>
            <div style={{display:"flex",gap:4}}>
              {([["chill","🐢 Chill"],["normal","😎 Normal"],["busy","🔥 Busy"]] as [PaceMode, string][]).map(([v,label])=>(
                <button key={v} onClick={()=>setPace(v)} style={{...BS,fontSize:10,padding:"2px 8px",background:pace===v?"linear-gradient(180deg,#4a90d9,#2060b0)":"linear-gradient(180deg,#ece9d8,#d4d0c8)",color:pace===v?"#fff":"#000",borderColor:pace===v?"#2060b0 #0a3a8a #0a3a8a #2060b0":"#fff #888 #888 #fff"}}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{borderTop:"1px solid #999",background:"#aab2bf",padding:"5px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",gap:10}}>
            {[["❓","Help"],["🔧","Setup"]].map(([ic,lb])=>(
              <div key={lb} style={{textAlign:"center",cursor:"pointer",fontSize:10}}>
                <div style={{fontSize:16}}>{ic}</div><div style={{fontWeight:"bold"}}>{lb}</div>
              </div>
            ))}
          </div>
          <button onClick={go} disabled={loading||!gender} style={{...BS,display:"flex",flexDirection:"column",alignItems:"center",padding:"3px 12px",fontWeight:"bold",opacity:(loading||!gender)?0.5:1}}>
            <Man sz={18}/><span>{loading?"Signing in...":"Sign On"}</span>
          </button>
        </div>
        <div style={{textAlign:"center",fontSize:9,color:"#555",padding:"2px 0 3px",background:"#aab2bf",borderTop:"1px solid #999"}}>Version: 5.9.6089</div>
        {signOnCount!==null&&signOnCount>0&&<div style={{textAlign:"center",fontSize:8,color:"#777",padding:"1px 0 2px",background:"#aab2bf"}}>{signOnCount.toLocaleString()} screen names created</div>}
        <div style={{textAlign:"center",fontSize:7,color:"#999",padding:"2px 0 3px",background:"#aab2bf"}}>A nostalgia experience. Not affiliated with or endorsed by AOL, Inc.</div>
      </div>
    </div>
  );
}

export default SignOn;
