import { BS } from "../constants/styles";

const EMOJIS: [string, string][] = [
  ["😊","smile"], ["😃","grin"], ["😉","wink"], ["😛","tongue"],
  ["😞","sad"], ["😢","cry"], ["😮","surprised"], ["😡","angry"],
  ["😕","confused"], ["😬","nervous"], ["😎","cool"], ["😇","angel"],
  ["😘","kiss"], ["🤐","sealed"], ["🤭","playful"], ["😂","lol"],
  ["❤️","heart"], ["💔","broken"], ["⭐","star"], ["🔥","fire"],
];

interface EmojiPickerProps {
  onPick: (emoji: string) => void;
  onClose: () => void;
  mobile?: boolean;
}

export default function EmojiPicker({ onPick, onClose, mobile }: EmojiPickerProps) {
  return (
    <div style={{position:"absolute",bottom:"100%",right:0,marginBottom:2,zIndex:500}} onClick={e=>e.stopPropagation()}>
      <div style={{background:"#ece9d8",border:"2px solid",borderColor:"#fff #444 #444 #fff",padding:4,boxShadow:"2px 2px 6px rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
          <span style={{fontSize:mobile?10:8,fontWeight:"bold",color:"#333"}}>Emoticons</span>
          <button onClick={onClose} style={{...BS,fontSize:8,padding:"0 3px",lineHeight:1}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:2}}>
          {EMOJIS.map(([emoji,label])=>(
            <button key={label} title={label} onClick={()=>{onPick(emoji);onClose();}}
              style={{...BS,fontSize:mobile?18:14,padding:mobile?"4px":"2px",minWidth:mobile?32:24,textAlign:"center",cursor:"pointer"}}>
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
