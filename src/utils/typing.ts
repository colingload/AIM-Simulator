export function rMin(a:number,b:number) { return (a+Math.random()*(b-a))*60000; }

// Simulate realistic typing time based on word count
// AIM teens type ~40-70 WPM with variance. We compress slightly so it doesn't feel sluggish.
export function typingMs(text:string){
  const words=text.split(/\s+/).filter(Boolean).length;
  // base 600ms + ~350ms per word + random jitter
  return Math.min(600 + words*350 + Math.random()*1500, 18000); // cap at 18s
}
// Pre-typing "reading/thinking" delay — before the indicator even shows
export function thinkMs(){
  // 70% of the time: quick 0.5-2s read. 30%: longer 2-5s pause (they're thinking)
  return Math.random()<0.7 ? (500+Math.random()*1500) : (2000+Math.random()*3000);
}
