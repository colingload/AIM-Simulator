import React from "react";

function Man({sz=28,col="#f5a623"}) {
  return (
    <svg width={sz} height={sz*1.3} viewBox="0 0 40 52" fill="none">
      <circle cx="20" cy="7" r="6" fill={col} stroke="#c8801a" strokeWidth="1"/>
      <path d="M20 13 L16 28 L20 42 L24 42 L21 28 L26 22 L32 26 L34 23 L26 17 L23 13Z" fill={col} stroke="#c8801a" strokeWidth="0.5"/>
      <path d="M16 28 L10 36 L13 38 L18 31Z" fill={col}/>
      <path d="M13 38 L9 44 L12 45 L16 39Z" fill={col}/>
      <path d="M20 42 L19 48 L22 48 L24 42Z" fill={col}/>
    </svg>
  );
}

export default Man;
