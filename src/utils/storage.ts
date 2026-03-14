declare global {
  interface Window {
    storage?: {
      get(key: string, shared?: boolean): Promise<{value: string} | null>;
      set(key: string, value: string, shared?: boolean): Promise<void>;
    };
  }
}

const _hasClaudeStorage = typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function storageGet(key: string): Promise<any> {
  if (_hasClaudeStorage) {
    try { const r=await window.storage!.get(key); return r?JSON.parse(r.value):null; } catch(e) { return null; }
  }
  try { const v=localStorage.getItem('aim_'+key); return v?JSON.parse(v):null; } catch(e) { return null; }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function storageSet(key: string, val: any) {
  if (_hasClaudeStorage) {
    try { await window.storage!.set(key,JSON.stringify(val)); } catch(e) {}
    return;
  }
  try { localStorage.setItem('aim_'+key,JSON.stringify(val)); } catch(e) {}
}
// Shared storage — visible to all users (for feedback). Falls back to localStorage locally.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function storageGetShared(key: string): Promise<any> {
  if (_hasClaudeStorage) {
    try { const r=await window.storage!.get(key,true); return r?JSON.parse(r.value):null; } catch(e) { return null; }
  }
  try { const v=localStorage.getItem('aim_shared_'+key); return v?JSON.parse(v):null; } catch(e) { return null; }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function storageSetShared(key: string, val: any) {
  if (_hasClaudeStorage) {
    try { await window.storage!.set(key,JSON.stringify(val),true); } catch(e) {}
    return;
  }
  try { localStorage.setItem('aim_shared_'+key,JSON.stringify(val)); } catch(e) {}
}
