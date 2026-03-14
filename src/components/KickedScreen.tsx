import { F, WB, TG, BS } from "../constants/styles";

interface KickedScreenProps {
  onSignIn: () => void;
}

function KickedScreen({onSignIn}: KickedScreenProps){
  return (
    <div style={{position:"fixed",inset:0,background:"linear-gradient(180deg,#3a6ec8 0%,#5b9bd5 44%,#4a8f3f 44%,#3d7a35 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F,padding:20}}>
      <div style={{background:WB,border:"2px solid",borderColor:"#fff #444 #444 #fff",maxWidth:340,width:"100%",boxShadow:"3px 3px 8px rgba(0,0,0,0.5)"}}>
        <div style={{background:TG,padding:"6px 10px",display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:14}}>⚠️</span>
          <span style={{color:"#fff",fontWeight:"bold",fontSize:12}}>{"You've Been Signed Off"}</span>
        </div>
        <div style={{padding:"20px 18px",textAlign:"center"}}>
          <div style={{fontSize:28,marginBottom:10}}>⚠️</div>
          <div style={{fontSize:13,fontWeight:"bold",marginBottom:10,color:"#cc6600"}}>Inappropriate language detected.</div>
          <div style={{fontSize:11,color:"#555",lineHeight:1.7,marginBottom:16}}>{"Hey — this is a fun game meant for everyone. The buddies here aren't into that kind of talk. Keep it chill and respectful next time!"}</div>
          <div style={{fontSize:11,color:"#cc0000",fontWeight:"bold",marginBottom:16}}>⚠️ One more offense and your account will be permanently suspended.</div>
          <button onClick={onSignIn} style={{...BS,padding:"8px 24px",fontSize:12,fontWeight:"bold"}}>{"I'll be cool — Sign Back In"}</button>
        </div>
      </div>
    </div>
  );
}

export default KickedScreen;
