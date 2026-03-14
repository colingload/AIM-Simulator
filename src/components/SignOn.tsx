import { useState, useEffect } from "react";
import { F, TG, WB, BS } from "../constants/styles";
import { storageGet, storageSet } from "../utils/storage";
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
  const [snMode,setSnMode]=useState("select"); // "select" or "new"
  const [newSN,setNewSN]=useState("");
  const [gender,setGender]=useState(""); // "m" or "f"
  const [pace,setPace]=useState<PaceMode>("normal");

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
    })();
  },[]);

  async function go() {
    const name=(snMode==="new"?newSN:sn).trim();
    if(!name||!gender)return;
    const updated=[name,...savedSNs.filter(s=>s!==name)].slice(0,5);
    await storageSet("saved_screennames",updated);
    await storageSet("saved_gender",gender);
    await storageSet("saved_pace",pace);
    unlockAudio(); playSound(SND_DOOROPEN); setLoading(true);
    setTimeout(()=>onSignIn(name,gender,pace),900);
  }

  return (
    <div onClick={unlockAudio} style={{position:"fixed",inset:0,background:"linear-gradient(180deg,#3a6ec8 0%,#5b9bd5 44%,#4a8f3f 44%,#3d7a35 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F,padding:16}}>
      <div style={{background:WB,border:"2px solid",borderColor:"#fff #444 #444 #fff",width:"100%",maxWidth:300,boxShadow:"3px 3px 8px rgba(0,0,0,0.5)"}}>
        <div data-dh="1" style={{background:TG,color:"#fff",fontWeight:"bold",fontSize:12,padding:"3px 6px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"default"}}>
          <div style={{display:"flex",alignItems:"center",gap:4}}><Man sz={14}/><span>Sign On</span></div>
          <XBtn/>
        </div>
        <div style={{background:"linear-gradient(135deg,#1a1a8a,#3355cc)",padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
          <Man sz={42}/>
          <div>
            <div style={{color:"#ff9900",fontSize:20,fontWeight:"bold",fontFamily:"Arial Black,sans-serif"}}>AOL</div>
            <div style={{color:"#fff",fontSize:12,fontWeight:"bold",lineHeight:1.3}}>Instant<br/>Messenger<span style={{fontSize:9,verticalAlign:"super"}}>℠</span></div>
          </div>
        </div>
        <div style={{padding:"10px 14px 6px",background:WB}}>
          <div style={{display:"flex",alignItems:"center",marginBottom:4,gap:6}}>
            <label style={{fontSize:11,width:82,textAlign:"right",flexShrink:0}}>Screen Name</label>
            {snMode==="select" ? (
              <div style={{flex:1,display:"flex",gap:3}}>
                <select value={sn} onChange={e=>setSn(e.target.value)} style={{flex:1,padding:"1px 2px",fontSize:11,fontFamily:F,border:"1px inset #808080"}}>
                  {savedSNs.map(s=><option key={s}>{s}</option>)}
                </select>
                <button onClick={()=>setSnMode("new")} style={{...BS,fontSize:9,padding:"1px 4px"}}>New</button>
              </div>
            ) : (
              <div style={{flex:1,display:"flex",gap:3}}>
                <input autoFocus value={newSN} onChange={e=>setNewSN(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&go()}
                  placeholder="Enter screen name"
                  style={{flex:1,padding:"1px 4px",fontSize:11,fontFamily:F,border:"1px inset #808080"}}/>
                {savedSNs.length>0&&<button onClick={()=>setSnMode("select")} style={{...BS,fontSize:9,padding:"1px 4px"}}>↩</button>}
              </div>
            )}
          </div>
          <div style={{display:"flex",alignItems:"center",marginBottom:8,gap:6}}>
            <label style={{fontSize:11,width:82,textAlign:"right",flexShrink:0}}>Password</label>
            <input type="password" disabled value="••••••••" style={{flex:1,padding:"1px 4px",fontSize:11,fontFamily:F,border:"1px inset #808080",background:"#ece9d8",color:"#999"}}/>
          </div>
          <div style={{display:"flex",gap:16,paddingLeft:88,fontSize:11,marginBottom:6}}>
            <label style={{display:"flex",alignItems:"center",gap:3,color:"#999"}}><input type="checkbox" defaultChecked disabled/>Save password</label>
            <label style={{display:"flex",alignItems:"center",gap:3}}><input type="checkbox"/>Auto-login</label>
          </div>
          <div style={{display:"flex",alignItems:"center",marginBottom:8,gap:6}}>
            <label style={{fontSize:11,width:82,textAlign:"right",flexShrink:0}}>I am a</label>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setGender("m")} style={{...BS,fontSize:11,padding:"2px 12px",background:gender==="m"?"linear-gradient(180deg,#4a90d9,#2060b0)":"linear-gradient(180deg,#ece9d8,#d4d0c8)",color:gender==="m"?"#fff":"#000",borderColor:gender==="m"?"#2060b0 #0a3a8a #0a3a8a #2060b0":"#fff #888 #888 #fff"}}>
                guy 🤙
              </button>
              <button onClick={()=>setGender("f")} style={{...BS,fontSize:11,padding:"2px 12px",background:gender==="f"?"linear-gradient(180deg,#d94ab0,#b02080)":"linear-gradient(180deg,#ece9d8,#d4d0c8)",color:gender==="f"?"#fff":"#000",borderColor:gender==="f"?"#b02080 #7a0060 #7a0060 #b02080":"#fff #888 #888 #fff"}}>
                girl 💅
              </button>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",marginBottom:8,gap:6}}>
            <label style={{fontSize:11,width:82,textAlign:"right",flexShrink:0}}>Vibe</label>
            <div style={{display:"flex",gap:4}}>
              {([["chill","🐢 Chill"],["normal","😎 Normal"],["busy","🔥 Busy"]] as [PaceMode, string][]).map(([v,label])=>(
                <button key={v} onClick={()=>setPace(v)} style={{...BS,fontSize:10,padding:"2px 8px",background:pace===v?"linear-gradient(180deg,#4a90d9,#2060b0)":"linear-gradient(180deg,#ece9d8,#d4d0c8)",color:pace===v?"#fff":"#000",borderColor:pace===v?"#2060b0 #0a3a8a #0a3a8a #2060b0":"#fff #888 #888 #fff"}}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{borderTop:"1px solid #aaa",background:"#ece9d8",padding:"5px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",gap:10}}>
            {[["❓","Help"],["🔧","Setup"]].map(([ic,lb])=>(
              <div key={lb} style={{textAlign:"center",cursor:"pointer",fontSize:10}}>
                <div style={{fontSize:18}}>{ic}</div><div style={{fontWeight:"bold"}}>{lb}</div>
              </div>
            ))}
          </div>
          <button onClick={go} disabled={loading||!gender} style={{...BS,display:"flex",flexDirection:"column",alignItems:"center",padding:"3px 12px",fontWeight:"bold",opacity:(loading||!gender)?0.5:1}}>
            <Man sz={18}/><span>{loading?"Signing in...":"Sign On"}</span>
          </button>
        </div>
        <div style={{textAlign:"center",fontSize:9,color:"#666",padding:"2px 0 3px",background:"#ece9d8",borderTop:"1px solid #ddd"}}>Version 5.9.3861</div>
      </div>
    </div>
  );
}

export default SignOn;
