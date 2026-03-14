import { F, WB } from "../constants/styles";

function BannedScreen(){
  return (
    <div style={{position:"fixed",inset:0,background:"linear-gradient(180deg,#1a1a2e,#16213e)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F,padding:20}}>
      <div style={{background:WB,border:"2px solid",borderColor:"#fff #444 #444 #fff",maxWidth:340,width:"100%",boxShadow:"3px 3px 8px rgba(0,0,0,0.5)"}}>
        <div style={{background:"linear-gradient(180deg,#cc2020,#880000)",padding:"6px 10px",display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:16}}>🚫</span>
          <span style={{color:"#fff",fontWeight:"bold",fontSize:12}}>Account Suspended</span>
        </div>
        <div style={{padding:"20px 18px",textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:10}}>🚫</div>
          <div style={{fontSize:13,fontWeight:"bold",marginBottom:10,color:"#cc0000"}}>Your account has been suspended.</div>
          <div style={{fontSize:11,color:"#555",lineHeight:1.7,marginBottom:16}}>You were warned multiple times about inappropriate language. This AIM simulator is meant to be a fun, respectful game for everyone. Your buddies have signed off.</div>
          <div style={{fontSize:10,color:"#999",fontStyle:"italic"}}>To reset, clear your browser storage.</div>
        </div>
      </div>
    </div>
  );
}

export default BannedScreen;
