import React from "react";
export const F="Tahoma,Arial,sans-serif";
export const TG="linear-gradient(180deg,#0058ee 0%,#3a93ff 8%,#0058ee 40%,#0047cc 100%)";
export const WB="#d4d0c8";
export const BS:React.CSSProperties={fontFamily:F,fontSize:11,cursor:"pointer",border:"1px solid",borderColor:"#fff #888 #888 #fff",background:"linear-gradient(180deg,#ece9d8,#d4d0c8)",padding:"2px 6px",userSelect:"none",outline:"none"};

export function dot(s:string):React.CSSProperties {
  return {width:8,height:8,borderRadius:"50%",display:"inline-block",flexShrink:0,
    background:s==="online"?"#00cc00":s==="away"?"#ffaa00":"#aaa",
    border:"1px solid "+(s==="online"?"#008800":s==="away"?"#aa7700":"#777")};
}

export const AWAY_STYLES: Record<string, {bg:string;bdr:string;tg:string;tc:string;tf:string;mc:string;mf:string;ms:number;deco:string;dc:string}> = {
  claudebot:{ bg:"#0a0a1a", bdr:"#4488ff", tg:"linear-gradient(90deg,#0a1a3a,#1a3366)", tc:"#88bbff", tf:"Courier New,monospace", mc:"#aaccff", mf:"Courier New,monospace", ms:13, deco:"[ FEEDBACK BOX ]", dc:"#3366aa" },
  sportz:   { bg:"#0d1100", bdr:"#ffcc00", tg:"linear-gradient(90deg,#003300,#005500)", tc:"#ffff00", tf:"Impact,sans-serif",       mc:"#ffffff", mf:"Impact,sans-serif",       ms:16, deco:"🏈 GAME ON 🏈",        dc:"#aaaa00" },
  music:    { bg:"#0d000d", bdr:"#cc44cc", tg:"linear-gradient(90deg,#1a001a,#330033)", tc:"#ff88ff", tf:"Georgia,serif",            mc:"#ddaaff", mf:"Georgia,serif",            ms:13, deco:"~*~ music is life ~*~",dc:"#884488" },
  gossip:   { bg:"#fff0f5", bdr:"#ff69b4", tg:"linear-gradient(90deg,#ff69b4,#ff99cc)", tc:"#ffffff", tf:"Comic Sans MS,cursive",    mc:"#cc0066", mf:"Comic Sans MS,cursive",    ms:13, deco:"✨ ~*~ ✨",             dc:"#ff69b4" },
  angst:    { bg:"#050005", bdr:"#440044", tg:"linear-gradient(90deg,#0a000a,#180018)", tc:"#888899", tf:"Georgia,serif",            mc:"#9988aa", mf:"Georgia,serif",            ms:13, deco:".. . .  .   .",       dc:"#332233" },
  crush:    { bg:"#fff5f9", bdr:"#ff6699", tg:"linear-gradient(90deg,#ff99bb,#ffbbcc)",  tc:"#fff",    tf:"Comic Sans MS,cursive",    mc:"#cc2266", mf:"Comic Sans MS,cursive",    ms:13, deco:"💘 ~ * ~ 💘",           dc:"#ff6699" },
};
