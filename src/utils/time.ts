export function getDateStr(d=new Date()){ return d.toISOString().split("T")[0]; } // "2026-03-13"
export function daysBetween(dateStr1:string,dateStr2:string){
  if(!dateStr1||!dateStr2) return null;
  const d1=new Date(dateStr1+"T00:00:00"), d2=new Date(dateStr2+"T00:00:00");
  return Math.round((d2.getTime()-d1.getTime())/(1000*60*60*24));
}
export function timeAgoText(days:number|null){
  if(days===null||days===undefined) return null;
  if(days===0) return "earlier today";
  if(days===1) return "yesterday";
  if(days<7) return days+" days ago";
  if(days<14) return "about a week ago";
  return Math.round(days/7)+" weeks ago";
}
