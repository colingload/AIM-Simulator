interface XBtnProps {
  onClick?: () => void;
}

function XBtn({onClick}: XBtnProps) {
  return <button onClick={onClick} style={{width:17,height:15,fontSize:10,padding:0,cursor:"pointer",border:"1px solid",borderColor:"#ff8888 #aa0000 #aa0000 #ff8888",background:"linear-gradient(180deg,#ff6060,#cc2020)",color:"#fff",fontWeight:"bold",outline:"none"}}>✕</button>;
}

export default XBtn;
