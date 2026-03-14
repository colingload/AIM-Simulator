import { F } from "../constants/styles";
import { Toast } from "../types";

interface ToastsProps {
  items: Toast[];
}

function Toasts({items}: ToastsProps) {
  return (
    <div style={{position:"fixed",bottom:34,right:6,left:6,display:"flex",flexDirection:"column-reverse",gap:3,zIndex:800,pointerEvents:"none",alignItems:"flex-end"}}>
      {items.map(t=>(
        <div key={t.id} style={{background:"#ffffcc",border:"1px solid #cccc44",padding:"6px 12px",fontSize:13,fontFamily:F,boxShadow:"2px 2px 3px rgba(0,0,0,0.25)",maxWidth:280,animation:"fi 0.2s ease"}}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

export default Toasts;
