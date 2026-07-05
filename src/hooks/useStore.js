export const store = {
  get: (k) => { try { return JSON.parse(localStorage.getItem('sb:' + k)); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem('sb:' + k, JSON.stringify(v)); } catch {} },
};
