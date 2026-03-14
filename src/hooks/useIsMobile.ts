import { useState, useEffect } from "react";

export function useIsMobile() {
  const [m,setM]=useState(window.innerWidth<700);
  useEffect(()=>{const h=()=>setM(window.innerWidth<700);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  return m;
}
