export const _isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const _apiBase = _isLocal ? '/api/anthropic/v1/messages' : '/api/anthropic';

// ── API QUEUE ───────────────────────────────────────────────────
let _apiQueue: Promise<unknown> = Promise.resolve();
export function callClaude(system: string, messages: {role:string;content:string}[], max=80): Promise<string> {
  const result = _apiQueue.then(()=>_doCall(system,messages,max)).catch(()=>"");
  _apiQueue = result;
  return result;
}
async function _doCall(system: string, messages: {role:string;content:string}[], max=80): Promise<string> {
  const controller = new AbortController();
  const tid = setTimeout(()=>controller.abort(), 18000); // 18s timeout
  try {
    const res = await fetch(_apiBase, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:max, system, messages }),
      signal: controller.signal,
    });
    clearTimeout(tid);
    if (!res.ok) { const e=await res.text(); throw new Error(res.status+": "+e.slice(0,80)); }
    const d = await res.json();
    return d.content?.[0]?.text || "";
  } catch(e) {
    clearTimeout(tid);
    throw e;
  }
}
