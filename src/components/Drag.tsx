import React, { useState, useRef, useEffect } from "react";

interface DragProps {
  children: React.ReactNode;
  x0?: number;
  y0?: number;
  z?: number;
  onTop?: () => void;
}

function Drag({children, x0=100, y0=50, z=10, onTop}: DragProps) {
  const [pos,setPos]=useState({x:x0,y:y0});
  const drag=useRef(false);
  const off=useRef({x:0,y:0});
  function md(e: React.MouseEvent) {
    if(!(e.target as HTMLElement).closest("[data-dh]")) return;
    drag.current=true; off.current={x:e.clientX-pos.x,y:e.clientY-pos.y}; e.preventDefault();
  }
  useEffect(()=>{
    const mm=(e:MouseEvent)=>{if(!drag.current)return;setPos({x:e.clientX-off.current.x,y:e.clientY-off.current.y});};
    const mu=()=>{drag.current=false;};
    window.addEventListener("mousemove",mm); window.addEventListener("mouseup",mu);
    return()=>{window.removeEventListener("mousemove",mm);window.removeEventListener("mouseup",mu);};
  },[]);
  return <div onMouseDown={md} onClick={onTop} style={{position:"absolute",top:pos.y,left:pos.x,zIndex:z}}>{children}</div>;
}

export default Drag;
