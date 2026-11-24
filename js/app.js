(function () {
'use strict';
const V = document.getElementById('view');
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const range = (n) => [...Array(n).keys()];
const pct = (x) => Math.round(x * 100) + '%';
const LS = {
  get(k, d) { try { const v = localStorage.getItem('sp_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('sp_' + k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem('sp_' + k); } catch (e) {} }
};

/* ---------- indexes ---------- */
const QM = {}; SP.questions.forEach((q) => (QM[q.id] = q));
const OBJ = {}, DOM = {};
SP.domains.forEach((d) => { DOM[d.id] = d; d.objectives.forEach((o) => { o.d = d.id; OBJ[o.id] = o; }); });
const dOf = (q) => parseInt(q.o, 10) || 0;
const TL = { mc: 'Multiple choice', ms: 'Multiple select', tf: 'True / False', fill: 'Fill in', match: 'Matching', order: 'Ordering', cat: 'Drag & drop', pbq: 'Performance-based', grid: 'Configuration', lines: 'Log analysis', num: 'Calculation' };
const TYPES = ['mc', 'ms', 'tf', 'fill', 'match', 'order', 'cat', 'pbq'];
const ALLOBJ = Object.keys(OBJ);

/* ---------- state ---------- */
let ST = LS.get('stats', {}), FL = LS.get('flags', {}), HI = LS.get('hist', []), CD = LS.get('cards', {});
let S = LS.get('session', null);
let PB = LS.get('pb', { objs: ALLOBJ.slice(), types: TYPES.slice(), src: 'all', n: 20, instant: true });
let FC = null; const UI = { chip: null, ord: null };
const saveLocal = () => { LS.set('stats', ST); LS.set('flags', FL); LS.set('hist', HI); LS.set('cards', CD); LS.set('upd', SYNC.upd); };
const save = () => { SYNC.upd = Date.now(); saveLocal(); queuePush(); };

/* ---------- cross-device sync (hosted version only; private per signed-in user) ---------- */
const SYNC = { ref: null, state: 'local', timer: null, busy: false, again: false, upd: LS.get('upd', 0) };
function syncBadge() {
  const el = document.getElementById('syncSt'); if (!el) return;
  el.textContent = { local: '● Saved on this device', connecting: '◌ Connecting sync…', saving: '◌ Syncing…', synced: '☁ Synced across devices', error: '⚠ Sync unavailable – saved on this device' }[SYNC.state] || '';
}
function queuePush() { if (!SYNC.ref) return; clearTimeout(SYNC.timer); SYNC.timer = setTimeout(push, 1500); }
async function push() {
  if (!SYNC.ref) return; if (SYNC.busy) { SYNC.again = true; return; }
  SYNC.busy = true; SYNC.state = 'saving'; syncBadge();
  try { await SYNC.ref.set({ upd: SYNC.upd, data: JSON.stringify({ stats: ST, flags: FL, hist: HI, cards: CD }) }); SYNC.state = 'synced'; }
  catch (e) { SYNC.state = 'error'; }
  SYNC.busy = false; syncBadge(); if (SYNC.again) { SYNC.again = false; push(); }
}
function adopt(d) {
  try { const j = JSON.parse(d.data); ST = j.stats || {}; FL = j.flags || {}; HI = j.hist || []; CD = j.cards || {}; } catch (e) { return; }
  SYNC.upd = d.upd; saveLocal();
  if (!location.hash.startsWith('#quiz') && !(location.hash.startsWith('#flashcards') && FC)) route();
}
async function initSync() {
  const db = await CAP('db'), user = await CAP('user');
  if (!db || !user) { syncBadge(); return; }
  let id; try { id = await user.id(); } catch (e) { id = null; }
  if (!id) { syncBadge(); return; }
  SYNC.ref = db.collection('data/users/' + id).doc('progress'); SYNC.state = 'connecting'; syncBadge();
  let settled = false; const to = setTimeout(() => { if (!settled) { SYNC.state = 'error'; syncBadge(); } }, 10000);
  SYNC.ref.onSnapshot((snap) => {
    if (snap.metadata && snap.metadata.hasPendingWrites) return;
    const d = snap.exists ? snap.data() : null, cached = snap.metadata && snap.metadata.fromCache;
    if (!cached) { settled = true; clearTimeout(to); }
    if (d && typeof d.upd === 'number' && d.upd > SYNC.upd) { adopt(d); if (!cached) { SYNC.state = 'synced'; syncBadge(); } }
    else if (!cached && (!d || (d.upd || 0) < SYNC.upd)) { if (SYNC.upd) push(); else { SYNC.state = 'synced'; syncBadge(); } }
    else if (!cached) { SYNC.state = 'synced'; syncBadge(); }
  }, () => { settled = true; clearTimeout(to); SYNC.state = 'error'; syncBadge(); });
}
const saveS = () => LS.set('session', S);
if (S && S.qids && S.qids.some((id) => !QM[id] && !(S.gen && S.gen[id]))) S = null; // bank changed

const th0 = LS.get('theme', null); if (th0) document.documentElement.dataset.theme = th0;
document.getElementById('themeBtn').onclick = () => {
  const cur = document.documentElement.dataset.theme || 'dark';
  const t = cur === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = t; LS.set('theme', t);
};

/* ---------- in-page dialogs (the hosted viewer blocks alert/confirm) ---------- */
function ask(msg, okLabel) {
  return new Promise((res) => {
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="card modal-box" role="dialog" aria-modal="true"><p>${esc(msg)}</p><div class="row" style="justify-content:flex-end"><button class="btn" data-m="0">Cancel</button><button class="btn pri" data-m="1">${esc(okLabel || 'OK')}</button></div></div>`;
    m.addEventListener('click', (e) => { const b = e.target.closest('[data-m]'); if (!b && e.target !== m) return; m.remove(); res(!!b && b.dataset.m === '1'); });
    document.body.appendChild(m); m.querySelector('[data-m="1"]').focus();
  });
}
function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}
/* ---------- audio: answer sounds (generated, no files) ---------- */
let SOUND = LS.get('sound', true), ACX = null;
const TONES = {
  ok: [[523.25, 0, 0.12], [659.25, 0.09, 0.12], [783.99, 0.18, 0.28]],
  part: [[523.25, 0, 0.14], [587.33, 0.13, 0.24]],
  bad: [[233.08, 0, 0.2, 'square'], [174.61, 0.17, 0.34, 'square']],
  pass: [[523.25, 0, 0.14], [659.25, 0.12, 0.14], [783.99, 0.24, 0.14], [1046.5, 0.36, 0.5]],
  fail: [[392, 0, 0.22, 'square'], [349.23, 0.2, 0.22, 'square'], [261.63, 0.4, 0.5, 'square']],
  card: [[880, 0, 0.08]]
};
function sfx(kind) {
  if (!SOUND || !TONES[kind]) return;
  try {
    ACX = ACX || new (window.AudioContext || window.webkitAudioContext)();
    if (ACX.state === 'suspended') ACX.resume();
    const t0 = ACX.currentTime + 0.02;
    TONES[kind].forEach(([f, d, len, type]) => {
      const o = ACX.createOscillator(), g = ACX.createGain();
      o.type = type || 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + d);
      g.gain.exponentialRampToValueAtTime(type ? 0.06 : 0.25, t0 + d + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + len);
      o.connect(g); g.connect(ACX.destination); o.start(t0 + d); o.stop(t0 + d + len + 0.05);
    });
  } catch (e) { /* audio not available */ }
}
const sndBtn = document.createElement('button'); sndBtn.className = 'btn ghost sm'; sndBtn.id = 'sndBtn';
const sndLbl = () => (sndBtn.textContent = SOUND ? '🔊 Sounds on' : '🔇 Sounds off');
sndLbl(); document.getElementById('themeBtn').after(sndBtn);
sndBtn.onclick = () => { SOUND = !SOUND; LS.set('sound', SOUND); sndLbl(); if (SOUND) sfx('ok'); };

/* ---------- audio: read lessons aloud (browser speech) ---------- */
const SY = window.speechSynthesis && window.SpeechSynthesisUtterance ? window.speechSynthesis : null;
const TTS = { rate: LS.get('ttsRate', 1), voice: LS.get('ttsVoice', ''), auto: LS.get('ttsAuto', false), oid: null, i: 0, on: false, gen: 0, autostart: false };
const ttsItems = () => [...document.querySelectorAll('#view [data-say]')];
const ttsVoices = () => (SY ? SY.getVoices().filter((v) => /^en/i.test(v.lang)) : []);
const sayText = (el) => (el.dataset.say || el.textContent).replace(/→/g, ' to ').replace(/[•·]/g, ', ').replace(/\s+/g, ' ').trim();
function ttsHalt() { TTS.gen++; TTS.on = false; if (SY) SY.cancel(); }
function ttsUI() {
  const items = ttsItems(), n = items.length, b = document.getElementById('ttsPlay'); if (!b) return;
  b.textContent = TTS.on ? '❚❚ Pause' : TTS.i > 0 && TTS.i < n ? '▶ Resume' : '▶ Listen';
  items.forEach((el, k) => el.classList.toggle('speaking', TTS.on && k === TTS.i));
  document.getElementById('ttsPos').textContent = n ? `${Math.min(TTS.i + 1, n)} / ${n}` : '';
  document.getElementById('ttsBar').style.width = (n ? (TTS.i / n) * 100 : 0) + '%';
}
function ttsSpeak() {
  const items = ttsItems();
  if (TTS.i >= items.length) {
    TTS.on = false; TTS.i = 0; ttsUI();
    const ids = ALLOBJ, k = ids.indexOf(TTS.oid);
    if (TTS.auto && k >= 0 && k < ids.length - 1) { TTS.autostart = true; go('#study-' + String(ids[k + 1]).replace('.', '-')); }
    return;
  }
  const el = items[TTS.i], u = new SpeechSynthesisUtterance(sayText(el)), my = TTS.gen;
  const v = ttsVoices().find((x) => x.name === TTS.voice);
  if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-US';
  u.rate = TTS.rate;
  u.onend = () => { if (my !== TTS.gen || !TTS.on) return; TTS.i++; ttsSpeak(); };
  u.onerror = (e) => { if (my !== TTS.gen || (e && (e.error === 'interrupted' || e.error === 'canceled'))) return; TTS.on = false; ttsUI(); toast('Read-aloud stopped: this browser could not play speech.'); };
  ttsUI(); if (el.scrollIntoView) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  SY.speak(u);
}
function ttsJump(d) { const n = ttsItems().length, was = TTS.on; ttsHalt(); TTS.i = Math.max(0, Math.min(n - 1, TTS.i + d)); if (was) { TTS.on = true; ttsSpeak(); } else ttsUI(); }
function ttsPanel() {
  if (!SY) return `<div class="card tts"><div class="muted small">🎧 Read-aloud is not supported in this browser. Try Chrome, Edge or Safari.</div></div>`;
  return `<div class="card tts"><div class="row between" style="flex-wrap:wrap;gap:10px">
   <div class="row" style="flex-wrap:wrap"><button class="btn pri" id="ttsPlay" data-act="run" data-fn="ttsplay">▶ Listen</button>
    <button class="btn sm ghost" data-act="run" data-fn="ttsprev" title="Previous">⏮</button><button class="btn sm ghost" data-act="run" data-fn="ttsnext" title="Next">⏭</button><button class="btn sm ghost" data-act="run" data-fn="ttsstop" title="Stop">■</button>
    <span id="ttsPos" class="muted small"></span></div>
   <div class="row" style="flex-wrap:wrap"><select id="ttsRate" aria-label="Speed">${[0.75, 1, 1.25, 1.5, 1.75].map((r) => `<option value="${r}" ${r === TTS.rate ? 'selected' : ''}>${r}×</option>`).join('')}</select>
    <select id="ttsVoice" aria-label="Voice" style="max-width:190px"></select>
    <label class="check" style="margin:0"><input type="checkbox" id="ttsAuto" ${TTS.auto ? 'checked' : ''}><span class="small">Auto-play next objective</span></label></div></div>
   <div class="bar" style="margin-top:10px"><span id="ttsBar" style="width:0;background:var(--acc)"></span></div>
   <div class="muted small" style="margin-top:6px">Tap any note to listen from there.</div></div>`;
}
function ttsFillVoices() {
  const s = document.getElementById('ttsVoice'); if (!s) return;
  const vs = ttsVoices(); s.style.display = vs.length ? '' : 'none';
  s.innerHTML = `<option value="">Default voice</option>` + vs.map((v) => `<option ${v.name === TTS.voice ? 'selected' : ''}>${esc(v.name)}</option>`).join('');
}
if (SY) SY.onvoiceschanged = ttsFillVoices;
function ttsBind(oid) {
  if (TTS.oid !== oid) { TTS.oid = oid; TTS.i = 0; }
  if (!SY) return;
  ttsFillVoices();
  document.getElementById('ttsRate').onchange = (e) => { TTS.rate = +e.target.value; LS.set('ttsRate', TTS.rate); if (TTS.on) ttsJump(0); };
  document.getElementById('ttsVoice').onchange = (e) => { TTS.voice = e.target.value; LS.set('ttsVoice', TTS.voice); if (TTS.on) ttsJump(0); };
  document.getElementById('ttsAuto').onchange = (e) => { TTS.auto = e.target.checked; LS.set('ttsAuto', TTS.auto); };
  ttsItems().forEach((el, k) => { el.classList.add('sayable'); el.onclick = (e) => { if (e.target.closest('a,button')) return; ttsHalt(); TTS.i = k; TTS.on = true; ttsSpeak(); }; });
  if (TTS.autostart) { TTS.autostart = false; TTS.i = 0; TTS.on = true; ttsSpeak(); } else ttsUI();
}

const CAP = (n) => (window.claude && window.claude.use ? window.claude.use(n).catch(() => null) : Promise.resolve(null));
document.getElementById('menuBtn').onclick = () => document.getElementById('side').classList.toggle('open');

/* ---------- stats helpers ---------- */
function record(id, g) {
  if (!QM[id]) return;
  const s = ST[id] || { n: 0, c: 0 }; s.n++; if (g >= 0.999) s.c++; s.last = g >= 0.999 ? 1 : 0; s.t = Date.now(); ST[id] = s; save();
}
function agg(filter) {
  let total = 0, n = 0, c = 0;
  for (const q of SP.questions) { if (filter && !filter(q)) continue; total++; const s = ST[q.id]; if (s) { n++; c += s.last; } }
  return { total, n, c, p: n ? c / n : 0 };
}
const domStat = (id) => agg((q) => dOf(q) === id);
const objStat = (id) => agg((q) => q.o === id);
function predicted() {
  let s = 0; SP.domains.forEach((d) => { const a = domStat(d.id); s += (d.weight / 100) * (a.c / (a.n + 3)); });
  return Math.round(100 + 800 * s);
}
const answeredCount = () => Object.keys(ST).filter((k) => QM[k]).length;

/* ---------- question helpers ---------- */
const getQ = (id) => QM[id] || (S && S.gen && S.gen[id]);
function unitOf(key) { const [id, ti] = key.split('|'); const q = getQ(id); return ti === undefined ? q : q.tasks[+ti]; }
function perm(key, n, noIdent) {
  S.perm = S.perm || {}; let p = S.perm[key];
  if (!p || p.length !== n) { p = shuffle(range(n)); if (noIdent && n > 1) { let t = 0; while (p.every((v, i) => v === i) && t++ < 20) p = shuffle(range(n)); } S.perm[key] = p; }
  return p;
}
const norm = (s) => String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9&]/g, '');
function grade(u, r) {
  switch (u.t) {
    case 'mc': case 'tf': return r === u.a ? 1 : 0;
    case 'ms': return Array.isArray(r) && r.length === u.a.length && u.a.every((x) => r.includes(x)) ? 1 : 0;
    case 'fill': return u.a.some((x) => norm(x) === norm(r)) && norm(r) !== '' ? 1 : 0;
    case 'num': { const v = parseFloat(String(r == null ? '' : r).replace(/[$,%\s]/g, '')); const tol = u.tol != null ? u.tol : Math.max(0.01, Math.abs(u.a) * 0.005); return !isNaN(v) && Math.abs(v - u.a) <= tol ? 1 : 0; }
    case 'match': { if (!r) return 0; let c = 0; u.pairs.forEach((p, i) => { if (r[i] === p[1]) c++; }); return c / u.pairs.length; }
    case 'order': { if (!r) return 0; let c = 0; r.forEach((v, i) => { if (v === i) c++; }); return c / u.items.length; }
    case 'cat': { if (!r) return 0; let c = 0; u.items.forEach((it, i) => { if (r[i] === it[1]) c++; }); return c / u.items.length; }
    case 'grid': { let t = 0, c = 0; u.rows.forEach((row, ri) => u.cols.forEach((col, ci) => { if (col[1]) { t++; if (r && [].concat(row[ci]).includes(r[ri + ',' + ci])) c++; } })); return t ? c / t : 0; }
    case 'lines': { const s = r || []; const tp = s.filter((x) => u.a.includes(x)).length; return Math.max(0, (tp - (s.length - tp)) / u.a.length); }
  }
  return 0;
}
function gradeQ(q) {
  if (q.t === 'pbq') { let s = 0; q.tasks.forEach((t, i) => (s += grade(t, S.resp[q.id + '|' + i]))); return s / q.tasks.length; }
  return grade(q, S.resp[q.id]);
}
function answered(u, key) {
  const r = S.resp[key]; if (r == null) return false;
  if (Array.isArray(r)) return u.t === 'order' || r.some((x) => x != null && x !== -1 && x !== '');
  if (typeof r === 'object') return Object.values(r).some((v) => v);
  if (typeof r === 'string') return r.trim() !== '';
  return true;
}
const qAnswered = (q) => (q.t === 'pbq' ? q.tasks.some((t, i) => answered(t, q.id + '|' + i)) : answered(q, q.id));
const locked = (key) => { const id = key.split('|')[0]; return !S || S.done || (S.instant && S.chk[id]); };
const scorePill = (g) => `<span class="pill ${g >= 0.999 ? 'ok' : g > 0 ? 'warn' : 'bad'}">${pct(g)}</span>`;
const L = 'ABCDEFGHIJ';

/* ---------- renderers ---------- */
function R(u, key, rev) {
  const r = S.resp[key]; const k = esc(key);
  switch (u.t) {
    case 'mc': case 'ms': {
      const p = perm(key, u.c.length), multi = u.t === 'ms';
      let h = multi ? `<div class="muted small" style="margin-bottom:8px">Select ${u.a.length} answers.</div>` : '';
      p.forEach((j, pos) => {
        const sel = multi ? (r || []).includes(j) : r === j, cor = multi ? u.a.includes(j) : u.a === j;
        let cls = 'opt'; if (rev) { if (cor) cls += ' ok'; else if (sel) cls += ' bad'; } else if (sel) cls += ' sel';
        h += `<button class="${cls}" data-k="${k}" data-act="pick" data-v="${j}"><span class="ltr">${L[pos]}</span><span>${fmt(u.c[j])}${rev && sel ? ' <span class="pill">your answer</span>' : ''}</span></button>`;
      });
      return h;
    }
    case 'tf': return [true, false].map((v, pos) => {
      let cls = 'opt'; if (rev) { if (u.a === v) cls += ' ok'; else if (r === v) cls += ' bad'; } else if (r === v) cls += ' sel';
      return `<button class="${cls}" data-k="${k}" data-act="pick" data-v="${v ? 1 : 0}"><span class="ltr">${L[pos]}</span><span>${v ? 'True' : 'False'}</span></button>`;
    }).join('');
    case 'fill': case 'num': {
      const g = rev ? grade(u, r) : 0;
      return `<div class="row">${u.unit ? `<b>${esc(u.unit)}</b>` : ''}<input class="txt ${rev ? (g ? 'ok' : 'bad') : ''}" style="flex:1;max-width:420px" data-k="${k}" data-act="text" value="${esc(r || '')}" placeholder="${u.t === 'num' ? 'Enter a number' : 'Type your answer'}" ${rev ? 'disabled' : ''} autocomplete="off"></div>` +
        (rev && !g ? `<div class="corr" style="margin-top:6px">✓ ${u.t === 'num' ? esc((u.unit || '') + u.a.toLocaleString()) : esc(u.a.join('  •  '))}</div>` : '');
    }
    case 'match': {
      const rights = [...new Set(u.pairs.map((p) => p[1]))], p = perm(key, rights.length), lp = perm(key + ':L', u.pairs.length);
      return lp.map((i) => {
        const pr = u.pairs[i], v = r && r[i]; let cls = 'sel'; if (rev) cls += v === pr[1] ? ' ok' : ' bad';
        return `<div class="mrow"><div>${fmt(pr[0])}</div><div><select class="${cls}" data-k="${k}" data-act="msel" data-i="${i}" ${rev ? 'disabled' : ''}><option value="">— select —</option>${p.map((j) => `<option ${v === rights[j] ? 'selected' : ''}>${esc(rights[j])}</option>`).join('')}</select>${rev && v !== pr[1] ? `<div class="corr">✓ ${esc(pr[1])}</div>` : ''}</div></div>`;
      }).join('');
    }
    case 'order': {
      let o = r; if (!o) { o = perm(key, u.items.length, true).slice(); S.resp[key] = o; }
      let h = `<div class="muted small" style="margin-bottom:8px">${rev ? '' : 'Use ▲ ▼ or drag items into the correct order.'}</div><ol class="olist">` + o.map((j, pos) => {
        const cls = rev ? (j === pos ? 'ok' : 'bad') : '';
        return `<li class="oi ${cls}" ${rev ? '' : 'draggable="true"'} data-k="${k}" data-i="${pos}"><span class="n">${pos + 1}</span><span class="t">${fmt(u.items[j])}</span>${rev ? '' : `<button class="btn sm ghost" data-k="${k}" data-act="up" data-i="${pos}" ${pos === 0 ? 'disabled' : ''}>▲</button><button class="btn sm ghost" data-k="${k}" data-act="down" data-i="${pos}" ${pos === o.length - 1 ? 'disabled' : ''}>▼</button>`}</li>`;
      }).join('') + '</ol>';
      if (rev && grade(u, o) < 1) h += `<div class="corr" style="margin-top:8px">Correct order:</div><ol class="small">${u.items.map((t) => `<li>${fmt(t)}</li>`).join('')}</ol>`;
      return h;
    }
    case 'cat': {
      const a = r || u.items.map(() => -1), p = perm(key, u.items.length);
      const chip = (i) => {
        const sel = UI.chip && UI.chip.key === key && UI.chip.i === i; let cls = 'chip' + (sel ? ' sel' : ''), ex = '';
        if (rev) { const ok = a[i] === u.items[i][1]; cls += ok ? ' ok' : ' bad'; if (!ok) ex = `<small>✓ ${esc(u.buckets[u.items[i][1]])}</small>`; }
        return `<span class="${cls}" ${rev ? '' : 'draggable="true"'} data-k="${k}" data-act="chip" data-i="${i}">${fmt(u.items[i][0])}${ex}</span>`;
      };
      const pool = p.filter((i) => a[i] === -1);
      return `<div class="cat"><div class="muted small" style="margin-bottom:8px">${rev ? '' : 'Drag items into a box, or click an item then click a box.'}</div>` +
        `<div class="pool drop" data-k="${k}" data-act="drop" data-b="-1"><div class="lbl">Items</div>${pool.map(chip).join('') || '<span class="muted small">All items placed</span>'}</div>` +
        `<div class="buckets">${u.buckets.map((b, bi) => `<div class="bucket drop ${UI.chip && UI.chip.key === key ? 'target' : ''}" data-k="${k}" data-act="drop" data-b="${bi}"><div class="lbl">${fmt(b)}</div>${p.filter((i) => a[i] === bi).map(chip).join('')}</div>`).join('')}</div></div>`;
    }
    case 'grid': {
      return `<div class="gridq"><table><thead><tr>${u.cols.map((c) => `<th>${esc(c[0])}</th>`).join('')}</tr></thead><tbody>${u.rows.map((row, ri) => `<tr>${u.cols.map((c, ci) => {
        if (!c[1]) return `<td>${fmt(row[ci])}</td>`;
        const kk = ri + ',' + ci, v = r && r[kk], want = [].concat(row[ci]); let cls = 'sel'; if (rev) cls += want.includes(v) ? ' ok' : ' bad';
        return `<td><select class="${cls}" data-k="${k}" data-act="gsel" data-i="${kk}" ${rev ? 'disabled' : ''}><option value="">—</option>${c[1].map((o) => `<option ${v === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>${rev && !want.includes(v) ? `<div class="corr">✓ ${esc(want.join(' / '))}</div>` : ''}</td>`;
      }).join('')}</tr>`).join('')}</tbody></table></div>`;
    }
    case 'lines': {
      const s = r || [];
      return `<div class="muted small" style="margin-bottom:8px">${rev ? 'Green = correctly selected, red = wrongly selected, dashed = missed.' : 'Click lines to select / deselect them.'}</div><div class="log">${u.lines.map((l, i) => {
        const se = s.includes(i), c = u.a.includes(i); let cls = 'll';
        if (rev) cls += se && c ? ' ok' : se ? ' bad' : c ? ' miss' : ''; else if (se) cls += ' sel';
        return `<div class="${cls}" data-k="${k}" data-act="line" data-i="${i}"><span class="ln">${i + 1}</span><span>${esc(l)}</span></div>`;
      }).join('')}</div>`;
    }
  }
  return '';
}
function rPBQ(q, rev) {
  let h = `<div class="scenario">${fmt(q.q)}</div>`;
  if (q.ex) h += `<div class="lbl muted small" style="font-weight:700;margin-bottom:4px">EXHIBIT</div><pre class="exhibit">${esc(q.ex)}</pre>`;
  q.tasks.forEach((t, i) => {
    const key = q.id + '|' + i;
    h += `<div class="task"><h3>Task ${i + 1} of ${q.tasks.length} <span class="pill">${TL[t.t]}</span>${rev ? ' ' + scorePill(grade(t, S.resp[key])) : ''}</h3><div class="stem">${fmt(t.q)}</div>${R(t, key, rev)}</div>`;
  });
  return h;
}
function answerText(q) {
  if (q.t === 'mc') return `<div class="ans"><b>Answer:</b> ${fmt(q.c[q.a])}</div>`;
  if (q.t === 'ms') return `<div class="ans"><b>Answers:</b> ${q.a.map((i) => fmt(q.c[i])).join('; ')}</div>`;
  if (q.t === 'tf') return `<div class="ans"><b>Answer:</b> ${q.a ? 'True' : 'False'}</div>`;
  if (q.t === 'fill') return `<div class="ans"><b>Accepted:</b> ${esc(q.a.join(', '))}</div>`;
  return '';
}

/* ---------- sessions ---------- */
async function start(o) {
  if (!o.qids.length) { toast('No questions match these settings.'); return; }
  if (S && !S.done && S.mode === 'exam' && !(await ask('You have an exam in progress. Replace it with this new session?', 'Replace exam'))) return;
  S = { mode: o.mode || 'practice', title: o.title, qids: o.qids, idx: 0, resp: {}, chk: {}, perm: {}, t0: Date.now(), limit: o.limit || 0, instant: o.mode === 'exam' ? false : o.instant !== false, done: false, gen: o.gen || null, res: null };
  UI.chip = null; saveS(); go('#quiz');
}
async function finish(force) {
  if (!S || S.done) return;
  if (!force) { const un = S.qids.filter((id) => !qAnswered(getQ(id))).length; if (!(await ask(un ? `${un} question(s) unanswered. Finish and score now?` : 'Finish and score this session?', 'Finish & score'))) return; }
  if (!S || S.done) return;
  let tot = 0, ok = 0; const bd = {};
  S.qids.forEach((id) => {
    const q = getQ(id), g = gradeQ(q); tot += g; if (g >= 0.999) ok++;
    const dk = dOf(q); bd[dk] = bd[dk] || { n: 0, s: 0 }; bd[dk].n++; bd[dk].s += g;
    if (!S.chk[id] && (S.mode === 'exam' || qAnswered(q))) record(id, g);
  });
  const p = tot / S.qids.length;
  S.done = true; S.res = { pct: p, scaled: Math.round(100 + 800 * p), bd, ok, n: S.qids.length, time: Math.round((Date.now() - S.t0) / 1000) };
  HI.unshift({ t: Date.now(), mode: S.mode, title: S.title, n: S.res.n, pct: p, scaled: S.res.scaled, bd, time: S.res.time }); HI = HI.slice(0, 200);
  save(); saveS(); go('#results'); sfx(S.res.scaled >= 750 ? 'pass' : 'fail');
}
function pick(pool, n) { return shuffle(pool).slice(0, n).map((q) => q.id); }
function buildExam(n, pbqN) {
  const pbqs = pick(SP.questions.filter((q) => q.t === 'pbq'), pbqN);
  const poolQ = SP.questions.filter((q) => !['pbq', 'tf', 'fill'].includes(q.t)), rest = n - pbqs.length; let out = [];
  SP.domains.forEach((d) => out.push(...pick(poolQ.filter((q) => dOf(q) === d.id), Math.round((rest * d.weight) / 100))));
  if (out.length > rest) out = shuffle(out).slice(0, rest);
  if (out.length < rest) out.push(...pick(poolQ.filter((q) => !out.includes(q.id)), rest - out.length));
  return pbqs.concat(shuffle(out));
}
function genAcr(n) {
  const A = SP.acronyms, gen = {}, ids = [];
  shuffle(A).slice(0, n).forEach(([ac, df], k) => {
    const o = shuffle(A.filter((x) => x[0] !== ac)).slice(0, 3), id = 'gen:a:' + ac, m = k % 3;
    gen[id] = m === 0 ? { id, o: 'ACR', t: 'mc', q: `What does **${ac}** stand for?`, c: [df, ...o.map((x) => x[1])], a: 0, e: '' }
      : m === 1 ? { id, o: 'ACR', t: 'mc', q: `Which acronym stands for **${df}**?`, c: [ac, ...o.map((x) => x[0])], a: 0, e: `${ac} = ${df}` }
      : { id, o: 'ACR', t: 'fill', q: `Type the acronym for: **${df}**`, a: [ac], e: '' };
    ids.push(id);
  });
  return { gen, ids };
}
function genGlo(n, objs) {
  const G = SP.glossary, src = objs ? G.filter((g) => objs.includes(g[2])) : G, gen = {}, ids = [];
  shuffle(src).slice(0, n).forEach(([t, df, o], k) => {
    const same = shuffle(G.filter((x) => x[0] !== t && parseInt(x[2]) === parseInt(o))), other = shuffle(G.filter((x) => x[0] !== t && !same.includes(x)));
    const d3 = same.concat(other).slice(0, 3), id = 'gen:g:' + t;
    gen[id] = k % 2 ? { id, o, t: 'mc', q: `Which term BEST matches this description?\n“${df}”`, c: [t, ...d3.map((x) => x[0])], a: 0, e: `${t}: ${df}` }
      : { id, o, t: 'mc', q: `Which BEST describes **${t}**?`, c: [df, ...d3.map((x) => x[1])], a: 0, e: '' };
    ids.push(id);
  });
  return { gen, ids };
}
const CMD = {
  quick10: () => start({ title: 'Quick 10', qids: pick(SP.questions.filter((q) => q.t !== 'pbq'), 10) }),
  sampler: () => { const ids = []; TYPES.filter((t) => t !== 'pbq').forEach((t) => ids.push(...pick(SP.questions.filter((q) => q.t === t), 2))); ids.push(...pick(SP.questions.filter((q) => q.t === 'pbq'), 1)); start({ title: 'All-types sampler', qids: shuffle(ids) }); },
  weak: () => {
    const objs = ALLOBJ.map((o) => ({ o, s: objStat(o) })).sort((a, b) => (a.s.n ? a.s.p : 0.5) - (b.s.n ? b.s.p : 0.5)).slice(0, 3).map((x) => x.o);
    const pool = SP.questions.filter((q) => objs.includes(q.o) && q.t !== 'pbq');
    const pri = pool.filter((q) => !ST[q.id] || !ST[q.id].last);
    start({ title: 'Weak areas: ' + objs.join(', '), qids: shuffle(pri).concat(shuffle(pool.filter((q) => !pri.includes(q)))).slice(0, 20).map((q) => q.id) });
  },
  acr: () => { const g = genAcr(25); start({ title: 'Acronym drill', qids: g.ids, gen: g.gen }); },
  glo: () => { const g = genGlo(25); start({ title: 'Key concepts drill', qids: g.ids, gen: g.gen }); },
  dom: (d) => start({ title: `Domain ${d} quiz`, qids: pick(SP.questions.filter((q) => dOf(q) === +d && q.t !== 'pbq'), 25) }),
  obj: (o) => start({ title: `Objective ${o}`, qids: shuffle(SP.questions.filter((q) => q.o === o)).sort((a, b) => (a.t === 'pbq') - (b.t === 'pbq')).map((q) => q.id) }),
  objpbq: (o) => start({ title: `PBQs – ${o}`, qids: SP.questions.filter((q) => q.o === o && q.t === 'pbq').map((q) => q.id) }),
  pbq1: (id) => start({ title: 'PBQ: ' + QM[id].title, qids: [id] }),
  pbqall: () => start({ title: 'PBQ marathon', qids: pick(SP.questions.filter((q) => q.t === 'pbq'), 999) }),
  pbq5: () => start({ title: 'PBQ set (5)', qids: pick(SP.questions.filter((q) => q.t === 'pbq'), 5) }),
  exam: (k) => { const cfg = { full: [90, 90, 5], half: [45, 45, 3], mini: [20, 20, 1] }[k]; start({ mode: 'exam', title: `Exam simulation (${cfg[0]} Q)`, qids: buildExam(cfg[0], cfg[2]), limit: cfg[1] * 60 }); },
  custom: () => { const pool = poolPB(); start({ title: 'Custom practice', qids: PB.n ? pick(pool, PB.n) : pick(pool, 9999), instant: PB.instant }); },
  missed: () => start({ title: 'Review missed', qids: pick(SP.questions.filter((q) => ST[q.id] && !ST[q.id].last), 50) }),
  flagged: () => start({ title: 'Review flagged', qids: Object.keys(FL).filter((id) => QM[id]) }),
  clearflags: async () => { if (await ask('Clear all flags?', 'Clear flags')) { FL = {}; save(); route(); } },
  retry: () => { const ids = S.qids.filter((id) => gradeQ(getQ(id)) < 0.999); start({ title: 'Retry incorrect', qids: ids, gen: S.gen }); },
  resume: () => go('#quiz'),
  prev: () => { if (S.idx > 0) { S.idx--; saveS(); vQuiz(true); } },
  next: () => { if (S.idx < S.qids.length - 1) { S.idx++; saveS(); vQuiz(true); } else if (!S.done) finish(); },
  goto: (i) => { S.idx = +i; saveS(); if (location.hash.startsWith('#quiz')) vQuiz(true); else go('#quiz'); },
  check: () => { const id = S.qids[S.idx]; if (S.chk[id]) return; S.chk[id] = true; const g = gradeQ(getQ(id)); record(id, g); sfx(g >= 0.999 ? 'ok' : g > 0 ? 'part' : 'bad'); saveS(); vQuiz(); },
  ttsplay: () => { if (TTS.on) { ttsHalt(); ttsUI(); } else { if (TTS.i >= ttsItems().length) TTS.i = 0; TTS.on = true; ttsSpeak(); } },
  ttsstop: () => { ttsHalt(); TTS.i = 0; ttsUI(); },
  ttsprev: () => ttsJump(-1), ttsnext: () => ttsJump(1),
  finish: () => finish(),
  flag: () => { const id = S.qids[S.idx]; if (FL[id]) delete FL[id]; else FL[id] = 1; save(); vQuiz(); },
  exit: () => go('#dashboard'),
  results: () => go('#results'),
  review: (mode) => { S.idx = mode === 'wrong' ? Math.max(0, S.qids.findIndex((id) => gradeQ(getQ(id)) < 0.999)) : 0; saveS(); go('#quiz'); },
  fcstart: (d) => fcStart(d), fcflip: () => { FC.flip = !FC.flip; vCards(); }, fcrate: (g) => fcRate(+g), fcend: () => { FC = null; vCards(); },
  pbtoggle: (o) => { const i = PB.objs.indexOf(o); i >= 0 ? PB.objs.splice(i, 1) : PB.objs.push(o); pbSave(); },
  pbdom: (d) => { const os = DOM[d].objectives.map((o) => o.id), all = os.every((o) => PB.objs.includes(o)); PB.objs = PB.objs.filter((o) => !os.includes(o)); if (!all) PB.objs.push(...os); pbSave(); },
  pbtype: (t) => { const i = PB.types.indexOf(t); i >= 0 ? PB.types.splice(i, 1) : PB.types.push(t); pbSave(); },
  pbsrc: (s) => { PB.src = s; pbSave(); }, pbn: (n) => { PB.n = +n; pbSave(); }, pbfb: (v) => { PB.instant = v === '1'; pbSave(); },
  pball: () => { PB.objs = ALLOBJ.slice(); pbSave(); }, pbnone: () => { PB.objs = []; pbSave(); },
  export: async () => {
    const json = JSON.stringify({ stats: ST, flags: FL, hist: HI, cards: CD }), dl = await CAP('downloads');
    if (dl) { try { await dl.save({ filename: 'secplus-progress.json', data: json }); } catch (e) { if (e && e.code && e.code !== 'declined' && e.code !== 'dismissed') toast('Export was not saved.'); } return; }
    if (window.claude) { toast('Export is not available here. Your progress syncs automatically.'); return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' })); a.download = 'secplus-progress.json'; a.click();
  },
  import: () => document.getElementById('impFile').click(),
  reset: async () => { if (await ask('Delete ALL progress, history, flags and flashcard data on every synced device? This cannot be undone.', 'Delete everything')) { ['session'].forEach(LS.del); ST = {}; FL = {}; HI = []; CD = {}; S = null; save(); route(); } }
};
function pbSave() { LS.set('pb', PB); vPractice(); }
function poolPB() {
  return SP.questions.filter((q) => PB.objs.includes(q.o) && PB.types.includes(q.t) && (PB.src === 'all' || (PB.src === 'new' && !ST[q.id]) || (PB.src === 'missed' && ST[q.id] && !ST[q.id].last) || (PB.src === 'flagged' && FL[q.id])));
}

/* ---------- flashcards ---------- */
const DAY = 864e5, INT = [0, 1, 3, 7, 14, 30, 60];
function deck(n) { return n === 'acr' ? SP.acronyms.map(([a, d]) => ({ id: 'a:' + a, f: a, b: d })) : SP.glossary.map(([t, d, o]) => ({ id: 'g:' + t, f: t, b: d, o })); }
function deckStat(n) { const cs = deck(n), now = Date.now(); return { total: cs.length, due: cs.filter((c) => CD[c.id] && CD[c.id].due <= now).length, fresh: cs.filter((c) => !CD[c.id]).length, mastered: cs.filter((c) => CD[c.id] && CD[c.id].b >= 4).length }; }
function fcStart(n) {
  const cs = deck(n), now = Date.now(); const due = cs.filter((c) => CD[c.id] && CD[c.id].due <= now), fresh = cs.filter((c) => !CD[c.id]);
  let list = shuffle(due).concat(shuffle(fresh).slice(0, 20)); if (!list.length) list = shuffle(cs).slice(0, 20);
  const rv = document.getElementById('fcrev'); FC = { n, list, i: 0, flip: false, rev: rv ? rv.checked : false, done: 0 }; vCards();
}
function fcRate(g) {
  const c = FC.list[FC.i], s = CD[c.id] || { b: 0 };
  if (g === 0) { s.b = 0; s.due = Date.now() + 60e3; FC.list.push(c); }
  else if (g === 1) { s.b = Math.max(1, s.b); s.due = Date.now() + INT[s.b] * DAY * 0.5; }
  else { s.b = Math.min(6, s.b + (g === 3 ? 2 : 1)); s.due = Date.now() + INT[s.b] * DAY; }
  sfx(g === 0 ? 'bad' : g === 1 ? 'card' : 'ok');
  CD[c.id] = s; save(); FC.i++; FC.done++; FC.flip = false; vCards();
}

/* ---------- router ---------- */
const routes = { dashboard: vDash, study: vStudy, practice: vPractice, pbq: vPbq, exam: vExam, quiz: vQuiz, results: vResults, flashcards: vCards, acronyms: vAcr, review: vReview, progress: vProgress };
function go(h) { if (location.hash === h) route(); else location.hash = h; }
function route() {
  const hs = (location.hash || '#dashboard').slice(1), di = hs.indexOf('-'), p0 = di < 0 ? hs : hs.slice(0, di);
  const parts = [p0, di < 0 ? '' : hs.slice(di + 1).replace(/-/g, '.')], name = routes[p0] ? p0 : 'dashboard';
  document.querySelectorAll('#nav a').forEach((a) => a.classList.toggle('on', a.dataset.r === name || (name === 'quiz' || name === 'results') && a.dataset.r === (S && S.mode === 'exam' ? 'exam' : 'practice')));
  document.getElementById('side').classList.remove('open');
  if (!TTS.autostart && (TTS.on || (SY && SY.speaking))) ttsHalt();
  routes[name](parts[1] ? decodeURIComponent(parts[1]) : undefined);
  window.scrollTo(0, 0); updResume(); tick();
}
window.addEventListener('hashchange', route);
const crumb = (t) => (document.getElementById('crumb').textContent = t);
function updResume() {
  const el = document.getElementById('resume');
  el.innerHTML = S && !S.done && !location.hash.startsWith('#quiz') ? `<button class="btn sm pri" data-act="run" data-fn="resume">▶ Resume: ${esc(S.title)}</button>` : '';
}
const fmtT = (s) => { s = Math.max(0, Math.floor(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };
function tick() {
  const el = document.getElementById('timer');
  if (!S || S.done || !location.hash.startsWith('#quiz')) { el.textContent = ''; el.className = ''; return; }
  const el2 = (Date.now() - S.t0) / 1000;
  if (S.limit) { const rem = S.limit - el2; el.textContent = '⏱ ' + fmtT(rem); el.className = rem < 300 ? 'low' : ''; if (rem <= 0) { toast('Time is up! Your exam has been scored.'); finish(true); } }
  else { el.textContent = '⏱ ' + fmtT(el2); el.className = ''; }
}
setInterval(tick, 1000);

/* ---------- views ---------- */
function vDash() {
  crumb('Dashboard');
  const ans = answeredCount(), all = agg(), pred = predicted(), frac = Math.max(0, Math.min(1, (pred - 100) / 800)), C = 2 * Math.PI * 92;
  const col = pred >= 750 ? 'var(--ok)' : pred >= 600 ? 'var(--warn)' : 'var(--bad)';
  const exams = HI.filter((h) => h.mode === 'exam'), best = exams.reduce((m, h) => Math.max(m, h.scaled), 0);
  const nP = SP.questions.filter((q) => q.t === 'pbq').length;
  const weak = ALLOBJ.map((o) => ({ o, s: objStat(o) })).filter((x) => x.s.n > 0).sort((a, b) => a.s.p - b.s.p).slice(0, 4);
  const untouched = ALLOBJ.filter((o) => objStat(o).n === 0).slice(0, 4);
  V.innerHTML = `
  <div class="row between"><div><h1>Welcome back 👋</h1><div class="muted">CompTIA Security+ SY0-801 · ${SP.questions.length} bank questions · ${nP} PBQs · ${SP.acronyms.length + SP.glossary.length} flashcards</div></div>
  <div class="row"><button class="btn pri" data-act="run" data-fn="exam" data-arg="full">⏱ Full exam</button><button class="btn" data-act="run" data-fn="quick10">⚡ Quick 10</button></div></div>
  <div class="card hero" style="margin-top:18px">
    <div class="gauge"><svg width="220" height="220"><circle cx="110" cy="110" r="92" fill="none" stroke="var(--card2)" stroke-width="16"/><circle cx="110" cy="110" r="92" fill="none" stroke="${col}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - frac)}"/></svg>
      <div class="c"><div><span class="muted small">Predicted score</span><b>${ans < 20 ? '—' : pred}</b><span class="muted small">${ans < 20 ? 'answer 20+ questions' : 'pass = 750 / 900'}</span></div></div></div>
    <div><div class="grid g4">
      <div class="tile"><div class="l">Answered</div><div class="v">${ans}<span class="muted small"> / ${SP.questions.length}</span></div></div>
      <div class="tile"><div class="l">Accuracy</div><div class="v">${all.n ? pct(all.p) : '—'}</div></div>
      <div class="tile"><div class="l">Exams taken</div><div class="v">${exams.length}</div></div>
      <div class="tile"><div class="l">Best exam</div><div class="v">${best || '—'}</div></div></div>
      <div style="margin-top:10px">${SP.domains.map((d) => { const s = domStat(d.id); return `<div class="dom"><span class="dnum" style="background:${d.color}">${d.id}</span><div><div class="row between small"><span>${esc(d.name)} <span class="muted">· ${d.weight}% of exam</span></span><span class="muted">${s.n}/${s.total} answered</span></div><div class="bar"><span style="width:${s.n ? s.p * 100 : 0}%;background:${d.color}"></span></div></div><b style="text-align:right">${s.n ? pct(s.p) : '—'}</b></div>`; }).join('')}</div>
    </div></div>
  <div class="sec"><h2>Start studying</h2></div>
  <div class="grid g4">
    ${qc('☰', 'Study guide', 'Notes for all 27 objectives', '#study')}
    ${qc('✎', 'Custom practice', 'Pick domains, types, size', '#practice')}
    ${qc('⚙', 'PBQ lab', `${nP} hands-on simulations`, '#pbq')}
    ${qc('❐', 'Flashcards', 'Spaced repetition decks', '#flashcards')}
  </div>
  <div class="grid g2" style="margin-top:14px">
    <div class="card"><h3>🎯 Focus areas</h3>${weak.length ? weak.map((x) => objRow(x.o, x.s)).join('') : '<div class="muted small">Answer some questions to see your weakest objectives.</div>'}
      ${untouched.length ? `<div class="muted small" style="margin-top:10px">Not started yet:</div>${untouched.map((o) => objRow(o, objStat(o))).join('')}` : ''}
      <div style="margin-top:12px"><button class="btn sm" data-act="run" data-fn="weak">Practice weak areas</button></div></div>
    <div class="card"><h3>🕘 Recent activity</h3>${HI.length ? `<table>${HI.slice(0, 6).map((h) => `<tr><td>${esc(h.title)}<div class="muted small">${new Date(h.t).toLocaleString()}</div></td><td>${h.n} Q</td><td>${h.mode === 'exam' ? `<span class="pill ${h.scaled >= 750 ? 'ok' : 'bad'}">${h.scaled}</span>` : scorePill(h.pct)}</td></tr>`).join('')}</table>` : '<div class="muted small">No sessions yet. Try a Quick 10!</div>'}</div>
  </div>`;
}
const qc = (ic, t, d, href, fn, arg) => `<a class="card qcard" ${href ? `href="${href}"` : `data-act="run" data-fn="${fn}" data-arg="${arg || ''}"`} style="color:var(--tx)"><div class="ic">${ic}</div><h3 style="margin:6px 0 2px">${t}</h3><div class="muted small">${d}</div></a>`;
function objRow(o, s) { return `<div class="row between" style="padding:6px 0;border-bottom:1px dashed var(--line)"><a href="#study-${String(o).replace('.', '-')}"><span class="oid">${o}</span> ${esc(OBJ[o].title)}</a><span class="row"><span class="muted small">${s.n}/${s.total}</span>${s.n ? scorePill(s.p) : ''}<button class="btn sm" data-act="run" data-fn="obj" data-arg="${o}">Practice</button></span></div>`; }

function vStudy(oid) {
  if (oid && OBJ[oid]) return vObj(oid);
  crumb('Study Guide');
  V.innerHTML = `<h1>Study Guide</h1><div class="muted">SY0-801 exam objectives with condensed notes. Up to 90 questions · 90 minutes · passing score 750 (100–900).</div>` +
    SP.domains.map((d) => { const s = domStat(d.id); return `<div class="card" style="margin-top:16px"><div class="row between"><div class="row"><span class="dnum" style="background:${d.color}">${d.id}</span><h2 style="margin:0">${esc(d.name)}</h2><span class="pill">${d.weight}%</span></div><div class="row"><span class="muted small">${s.total} questions · ${s.n ? pct(s.p) + ' accuracy' : 'not started'}</span><button class="btn sm" data-act="run" data-fn="dom" data-arg="${d.id}">Domain quiz</button></div></div>
    <div class="objlist" style="margin-top:10px">${d.objectives.map((o) => { const os = objStat(o.id); return `<a href="#study-${String(o.id).replace('.', '-')}"><span class="oid">${o.id}</span><span class="grow">${esc(o.title)}</span><span class="muted small">${os.total} Q</span><span style="width:90px" class="bar"><span style="width:${os.n ? os.p * 100 : 0}%;background:${d.color}"></span></span></a>`; }).join('')}</div></div>`; }).join('');
}
function vObj(oid) {
  const o = OBJ[oid], d = DOM[o.d]; crumb(`Study Guide › ${oid}`);
  const qs = SP.questions.filter((q) => q.o === oid), s = objStat(oid), nP = qs.filter((q) => q.t === 'pbq').length;
  const byT = TYPES.map((t) => [t, qs.filter((q) => q.t === t).length]).filter((x) => x[1]);
  const gl = SP.glossary.filter((g) => g[2] === oid);
  const ids = ALLOBJ, i = ids.indexOf(oid);
  V.innerHTML = `<div class="row"><a href="#study" class="btn sm ghost">← All objectives</a></div>
  <div class="row" style="margin-top:12px"><span class="dnum" style="background:${d.color}">${d.id}</span><span class="muted">${esc(d.name)}</span></div>
  <h1 style="margin-top:8px" data-say="Objective ${oid}. ${esc(o.title)}."><span class="oid">${oid}</span> ${esc(o.title)}</h1>
  ${ttsPanel()}
  <div class="grid" style="grid-template-columns:minmax(0,1fr) 300px;align-items:start">
   <div><div class="card"><h2>Key notes</h2><ul class="notes">${o.notes.map((n) => `<li data-say="">${fmt(n)}</li>`).join('')}</ul></div>
   ${gl.length ? `<div class="card"><h2>Key terms</h2><table>${gl.map((g) => `<tr data-say="${esc(g[0])}. ${esc(g[1])}"><td style="width:34%"><b>${esc(g[0])}</b></td><td>${esc(g[1])}</td></tr>`).join('')}</table></div>` : ''}</div>
   <div class="card sticky"><h3>Practice this objective</h3><div class="muted small">${qs.length} questions · ${s.n ? pct(s.p) + ' accuracy' : 'not started'}</div>
    <div style="margin:10px 0">${byT.map(([t, n]) => `<span class="pill" style="margin:0 4px 4px 0">${TL[t]} · ${n}</span>`).join('')}</div>
    <button class="btn pri" style="width:100%;justify-content:center" data-act="run" data-fn="obj" data-arg="${oid}">Start (${qs.length})</button>
    ${nP ? `<button class="btn" style="width:100%;justify-content:center;margin-top:8px" data-act="run" data-fn="objpbq" data-arg="${oid}">PBQs only (${nP})</button>` : ''}
    <div class="row between" style="margin-top:14px">${i > 0 ? `<a class="btn sm ghost" href="#study-${String(ids[i - 1]).replace('.', '-')}">← ${ids[i - 1]}</a>` : '<span></span>'}${i < ids.length - 1 ? `<a class="btn sm ghost" href="#study-${String(ids[i + 1]).replace('.', '-')}">${ids[i + 1]} →</a>` : ''}</div></div>
  </div>`;
  if (innerWidth < 980) V.querySelector('.grid').style.gridTemplateColumns = '1fr';
  ttsBind(oid);
}

function vPractice() {
  crumb('Practice Quizzes');
  const pool = poolPB(), cnt = (t) => SP.questions.filter((q) => q.t === t).length;
  V.innerHTML = `<h1>Practice Quizzes</h1><div class="muted">Instant feedback with explanations. Every answer updates your progress.</div>
  <div class="sec"><h2>Quick start</h2></div>
  <div class="grid g4">
   ${qc('⚡', 'Quick 10', 'Random mixed questions', null, 'quick10')}
   ${qc('🧩', 'All-types sampler', 'Two of every question type + a PBQ', null, 'sampler')}
   ${qc('🎯', 'Weak areas', 'Your 3 lowest objectives', null, 'weak')}
   ${qc('↺', 'Missed questions', `${SP.questions.filter((q) => ST[q.id] && !ST[q.id].last).length} to review`, null, 'missed')}
   ${qc('Aa', 'Acronym drill', `25 of ${SP.acronyms.length} acronyms (auto-generated)`, null, 'acr')}
   ${qc('💡', 'Key concepts drill', `25 of ${SP.glossary.length} terms (auto-generated)`, null, 'glo')}
   ${SP.domains.map((d) => qc(`<span class="dnum" style="background:${d.color}">${d.id}</span>`, `Domain ${d.id} quiz`, esc(d.name) + ' · 25 Q', null, 'dom', d.id)).slice(0, 2).join('')}
  </div>
  <div class="grid g3" style="margin-top:14px">${SP.domains.slice(2).map((d) => qc(`<span class="dnum" style="background:${d.color}">${d.id}</span>`, `Domain ${d.id} quiz`, esc(d.name) + ' · 25 Q', null, 'dom', d.id)).join('')}</div>
  <div class="sec"><h2>Custom quiz builder</h2></div>
  <div class="grid" style="grid-template-columns:minmax(0,1fr) 320px;align-items:start" id="pbgrid">
   <div class="card"><div class="row between"><h3 style="margin:0">Objectives</h3><span class="row"><button class="btn sm ghost" data-act="run" data-fn="pball">All</button><button class="btn sm ghost" data-act="run" data-fn="pbnone">None</button></span></div>
    <div style="margin-top:10px">${SP.domains.map((d) => { const os = d.objectives.map((o) => o.id), on = os.filter((o) => PB.objs.includes(o)).length; return `<details class="dgrp" ${on && on < os.length ? 'open' : ''}><summary><input type="checkbox" ${on === os.length ? 'checked' : ''} data-act="run" data-fn="pbdom" data-arg="${d.id}"><span class="dnum" style="background:${d.color};width:22px;height:22px;font-size:.75rem">${d.id}</span>${esc(d.name)} <span class="muted small">(${on}/${os.length})</span></summary>${d.objectives.map((o) => `<label class="check"><input type="checkbox" ${PB.objs.includes(o.id) ? 'checked' : ''} data-act="run" data-fn="pbtoggle" data-arg="${o.id}"><span><span class="oid">${o.id}</span> ${esc(o.title)} <span class="muted small">(${objStat(o.id).total})</span></span></label>`).join('')}</details>`; }).join('')}</div></div>
   <div class="card sticky"><h3>Question types</h3>${TYPES.map((t) => `<label class="check"><input type="checkbox" ${PB.types.includes(t) ? 'checked' : ''} data-act="run" data-fn="pbtype" data-arg="${t}"><span>${TL[t]} <span class="muted small">(${cnt(t)})</span></span></label>`).join('')}
    <h3 style="margin-top:14px">Source</h3><div class="seg">${[['all', 'All'], ['new', 'Unseen'], ['missed', 'Missed'], ['flagged', 'Flagged']].map(([v, l]) => `<button class="${PB.src === v ? 'on' : ''}" data-act="run" data-fn="pbsrc" data-arg="${v}">${l}</button>`).join('')}</div>
    <h3 style="margin-top:14px">Number of questions</h3><div class="seg">${[10, 20, 30, 50, 0].map((n) => `<button class="${PB.n === n ? 'on' : ''}" data-act="run" data-fn="pbn" data-arg="${n}">${n || 'All'}</button>`).join('')}</div>
    <h3 style="margin-top:14px">Feedback</h3><div class="seg"><button class="${PB.instant ? 'on' : ''}" data-act="run" data-fn="pbfb" data-arg="1">After each</button><button class="${!PB.instant ? 'on' : ''}" data-act="run" data-fn="pbfb" data-arg="0">At the end</button></div>
    <button class="btn pri" style="width:100%;justify-content:center;margin-top:18px" data-act="run" data-fn="custom" ${pool.length ? '' : 'disabled'}>Start · ${PB.n ? Math.min(PB.n, pool.length) : pool.length} of ${pool.length} available</button></div>
  </div>`;
  if (innerWidth < 980) document.getElementById('pbgrid').style.gridTemplateColumns = '1fr';
}

function vPbq() {
  crumb('PBQ Lab');
  const ps = SP.questions.filter((q) => q.t === 'pbq');
  V.innerHTML = `<div class="row between"><div><h1>Performance-Based Question Lab</h1><div class="muted">Hands-on simulations: firewall rules, log analysis, network placement, risk math, configuration grids, drag-and-drop and more. Partial credit per task, like the real exam.</div></div>
  <div class="row"><button class="btn pri" data-act="run" data-fn="pbq5">Random 5</button><button class="btn" data-act="run" data-fn="pbqall">All ${ps.length}</button></div></div>
  <div class="grid g3" style="margin-top:18px">${ps.map((q) => { const s = ST[q.id], d = DOM[dOf(q)]; return `<div class="card qcard" data-act="run" data-fn="pbq1" data-arg="${q.id}"><div class="row between"><span class="pill" style="color:${d.color};border-color:${d.color}">Obj ${q.o}</span>${s ? (s.last ? '<span class="pill ok">✓ passed</span>' : '<span class="pill bad">retry</span>') : '<span class="pill">new</span>'}</div><h3 style="margin:10px 0 4px">${esc(q.title)}</h3><div class="muted small">${q.tasks.length} tasks · ${[...new Set(q.tasks.map((t) => TL[t.t]))].join(', ')}</div></div>`; }).join('')}</div>`;
}

function vExam() {
  crumb('Exam Simulator');
  const ex = HI.filter((h) => h.mode === 'exam'), active = S && S.mode === 'exam' && !S.done;
  V.innerHTML = `<h1>Exam Simulator</h1><div class="muted">Mirrors the SY0-801 format: PBQs first, then multiple-choice/multiple-select weighted by domain. No feedback until you submit. Timer keeps running if you leave the page.</div>
  ${active ? `<div class="card" style="margin-top:16px;border-color:var(--warn)"><div class="row between"><div><h3 style="margin:0">Exam in progress</h3><div class="muted small">${Object.keys(S.resp).length ? 'Answers saved' : 'Not started'} · ${fmtT(S.limit - (Date.now() - S.t0) / 1000)} remaining</div></div><button class="btn pri" data-act="run" data-fn="resume">Resume exam</button></div></div>` : ''}
  <div class="grid g3" style="margin-top:16px">
   ${[['full', 'Full exam', '90 questions · 90 min · 5 PBQs'], ['half', 'Half exam', '45 questions · 45 min · 3 PBQs'], ['mini', 'Mini exam', '20 questions · 20 min · 1 PBQ']].map(([k, t, d]) => `<div class="card"><h2>${t}</h2><div class="muted">${d}</div><button class="btn ${k === 'full' ? 'pri' : ''}" style="margin-top:14px" data-act="run" data-fn="exam" data-arg="${k}">Start</button></div>`).join('')}
  </div>
  <div class="card" style="margin-top:14px"><h3>Exam tips</h3><ul class="notes small">
   <li>PBQs appear first. If one is taking too long, <b>flag it</b>, move on, and return at the end.</li>
   <li>Read the LAST sentence of a scenario first: it tells you what is actually being asked (BEST, FIRST, MOST likely).</li>
   <li>Multiple-select questions tell you how many to choose. All must be correct.</li>
   <li>Scaled score shown here is an estimate (100 + 800 × percent). The real exam uses a different, unpublished scaling.</li>
   <li>Keyboard: <span class="kbd">1</span>–<span class="kbd">6</span> select · <span class="kbd">←</span> <span class="kbd">→</span> navigate · <span class="kbd">F</span> flag · <span class="kbd">Enter</span> check/next.</li></ul></div>
  <div class="card"><h3>Previous exams</h3>${ex.length ? `<table><tr><th>Date</th><th>Questions</th><th>Time</th><th>Score</th></tr>${ex.slice(0, 15).map((h) => `<tr><td>${new Date(h.t).toLocaleString()}</td><td>${h.n}</td><td>${fmtT(h.time)}</td><td><span class="pill ${h.scaled >= 750 ? 'ok' : 'bad'}">${h.scaled} ${h.scaled >= 750 ? 'PASS' : 'FAIL'}</span></td></tr>`).join('')}</table>` : '<div class="muted small">No exams yet.</div>'}</div>`;
}

function vQuiz(keepScroll) {
  if (!S) { crumb('Quiz'); V.innerHTML = `<div class="empty"><h2>No active session</h2><p>Start a quiz from Practice, the PBQ Lab or the Exam Simulator.</p><a class="btn pri" href="#practice">Go to Practice</a></div>`; return; }
  const sy = window.scrollY;
  const id = S.qids[S.idx], q = getQ(id), rev = S.done || (S.instant && S.chk[id]), d = DOM[dOf(q)];
  crumb(S.title + (S.done ? ' · review' : ''));
  let body = q.t === 'pbq' ? `<h2>⚙ ${esc(q.title)}</h2>${rPBQ(q, rev)}` : `<div class="stem">${fmt(q.q)}</div>${R(q, id, rev)}`;
  let fb = '';
  if (rev) {
    const g = gradeQ(q), cls = g >= 0.999 ? 'ok' : g > 0 ? 'part' : 'bad';
    fb = `<div class="fb ${cls}"><h3>${g >= 0.999 ? '✓ Correct' : g > 0 ? `◐ Partially correct (${pct(g)})` : '✗ Incorrect'}</h3>${answerText(q)}${q.e ? `<div style="margin-top:6px">${fmt(q.e)}</div>` : ''}${OBJ[q.o] ? `<div class="muted small" style="margin-top:8px">Objective <a href="#study-${String(q.o).replace('.', '-')}">${q.o} – ${esc(OBJ[q.o].title)}</a></div>` : ''}</div>`;
  }
  const last = S.idx === S.qids.length - 1, nAns = S.qids.filter((x) => qAnswered(getQ(x))).length;
  const showChk = !S.done && S.instant && !S.chk[id];
  const nav = S.qids.map((x, i) => {
    const qq = getQ(x); let c = i === S.idx ? 'cur' : '';
    if (S.done || (S.instant && S.chk[x])) { const g = gradeQ(qq); c += g >= 0.999 ? ' ok' : g > 0 ? ' part' : ' bad'; } else if (qAnswered(qq)) c += ' ans';
    if (FL[x]) c += ' flag';
    return `<button class="${c}" data-act="run" data-fn="goto" data-arg="${i}" title="${qq.t === 'pbq' ? 'PBQ' : TL[qq.t]}">${qq.t === 'pbq' ? 'P' : ''}${i + 1}</button>`;
  }).join('');
  V.innerHTML = `<div class="qwrap"><div class="card ${rev ? 'locked' : ''}">
    <div class="qhead"><b>Question ${S.idx + 1} of ${S.qids.length}</b>${d ? `<span class="pill" style="color:${d.color};border-color:${d.color}">${q.o} · ${esc(d.name)}</span>` : '<span class="pill">Acronyms</span>'}<span class="pill">${TL[q.t]}</span><span class="grow"></span>
    ${S.done ? '' : `<button class="btn sm ${FL[id] ? 'on' : 'ghost'}" data-act="run" data-fn="flag">⚑ ${FL[id] ? 'Flagged' : 'Flag'}</button>`}</div>
    ${body}${fb}
    <div class="qfoot"><button class="btn" data-act="run" data-fn="prev" ${S.idx === 0 ? 'disabled' : ''}>← Previous</button><span class="grow"></span>
    ${showChk ? `<button class="btn pri" data-act="run" data-fn="check">Check answer</button>` : ''}
    ${last ? (S.done ? `<button class="btn pri" data-act="run" data-fn="results">Results</button>` : `<button class="btn ${showChk ? '' : 'pri'}" data-act="run" data-fn="finish">Finish ✓</button>`) : `<button class="btn ${showChk ? '' : 'pri'}" data-act="run" data-fn="next">Next →</button>`}</div>
  </div>
  <div class="card sticky"><div class="row between"><b>${S.done ? 'Review' : 'Progress'}</b><span class="muted small">${nAns}/${S.qids.length} answered</span></div>
   <div class="bar" style="margin:8px 0 12px"><span style="width:${(nAns / S.qids.length) * 100}%"></span></div>
   <div class="navgrid">${nav}</div>
   <div class="legend"><span><i style="background:var(--sel);border-color:var(--acc)"></i>answered</span><span><i style="background:var(--okbg);border-color:var(--ok)"></i>correct</span><span><i style="background:var(--badbg);border-color:var(--bad)"></i>wrong</span><span><i style="background:var(--warn)"></i>flagged</span></div>
   <div style="margin-top:14px;display:flex;flex-direction:column;gap:8px">${S.done ? `<button class="btn" data-act="run" data-fn="results">← Back to results</button>` : `<button class="btn pri" data-act="run" data-fn="finish">${S.mode === 'exam' ? 'Submit exam' : 'Finish & score'}</button><button class="btn ghost" data-act="run" data-fn="exit">Save &amp; exit</button>`}</div>
   <div class="muted small" style="margin-top:10px"><span class="kbd">1-6</span> pick · <span class="kbd">←→</span> move · <span class="kbd">F</span> flag · <span class="kbd">Enter</span> ${S.instant ? 'check' : 'next'}</div>
  </div></div>`;
  if (keepScroll === true) window.scrollTo(0, 0); else window.scrollTo(0, sy);
  updResume(); tick();
}

function vResults() {
  if (!S || !S.done) return go('#dashboard');
  crumb(S.title + ' · results');
  const r = S.res, pass = r.scaled >= 750, wrong = r.n - r.ok;
  V.innerHTML = `<div class="card" style="text-align:center;padding:30px"><div class="muted">${esc(S.title)}</div>
   ${S.mode === 'exam' ? `<div class="score-big" style="color:${pass ? 'var(--ok)' : 'var(--bad)'};margin-top:10px">${r.scaled}</div><div><span class="pill ${pass ? 'ok' : 'bad'}" style="font-size:.95rem;margin-top:8px">${pass ? 'PASS' : 'FAIL'} · 750 required</span></div>` : `<div class="score-big" style="margin-top:10px">${pct(r.pct)}</div>`}
   <div class="muted" style="margin-top:10px">${r.ok} fully correct · ${wrong} incorrect/partial · ${pct(r.pct)} weighted score · time ${fmtT(r.time)}</div>
   <div class="row" style="justify-content:center;margin-top:18px"><button class="btn pri" data-act="run" data-fn="review" data-arg="all">Review all answers</button>${wrong ? `<button class="btn" data-act="run" data-fn="review" data-arg="wrong">Jump to first miss</button><button class="btn" data-act="run" data-fn="retry">Retry incorrect (${wrong})</button>` : ''}<a class="btn ghost" href="#dashboard">Dashboard</a></div></div>
  <div class="grid g2" style="margin-top:14px"><div class="card"><h3>By domain</h3>${Object.keys(r.bd).sort().map((k) => { const b = r.bd[k], d = DOM[k]; return `<div class="dom"><span class="dnum" style="background:${d ? d.color : '#888'}">${d ? d.id : 'A'}</span><div><div class="small">${d ? esc(d.name) : 'Acronyms'} <span class="muted">· ${b.n} Q</span></div><div class="bar"><span style="width:${(b.s / b.n) * 100}%;background:${d ? d.color : 'var(--acc)'}"></span></div></div><b style="text-align:right">${pct(b.s / b.n)}</b></div>`; }).join('')}</div>
  <div class="card"><h3>Questions</h3><div class="navgrid" style="grid-template-columns:repeat(10,1fr)">${S.qids.map((x, i) => { const g = gradeQ(getQ(x)); return `<button class="${g >= 0.999 ? 'ok' : g > 0 ? 'part' : 'bad'}" data-act="run" data-fn="goto" data-arg="${i}">${i + 1}</button>`; }).join('')}</div></div></div>`;
}

function vCards() {
  crumb('Flashcards');
  if (!FC) {
    V.innerHTML = `<h1>Flashcards</h1><div class="muted">Spaced repetition (Leitner): cards you know come back less often; cards you miss come back soon.</div>
    <div class="grid g2" style="margin-top:16px">${[['acr', 'Acronyms', 'Every acronym from the official SY0-801 list'], ['glo', 'Key concepts', 'Core terms mapped to each objective']].map(([k, t, d]) => { const s = deckStat(k); return `<div class="card"><h2>${t}</h2><div class="muted small">${d}</div><div class="grid g4" style="margin:14px 0"><div class="tile" style="padding:0"><div class="l">Cards</div><div class="v">${s.total}</div></div><div class="tile" style="padding:0"><div class="l">Due</div><div class="v">${s.due}</div></div><div class="tile" style="padding:0"><div class="l">New</div><div class="v">${s.fresh}</div></div><div class="tile" style="padding:0"><div class="l">Mastered</div><div class="v">${s.mastered}</div></div></div><div class="bar"><span style="width:${(s.mastered / s.total) * 100}%;background:var(--ok)"></span></div><button class="btn pri" style="margin-top:14px" data-act="run" data-fn="fcstart" data-arg="${k}">Study ${s.due ? s.due + ' due' : ''}${s.due && s.fresh ? ' + ' : ''}${s.fresh ? Math.min(20, s.fresh) + ' new' : ''}${!s.due && !s.fresh ? '20 random' : ''}</button></div>`; }).join('')}</div>
    <label class="check" style="margin-top:12px"><input type="checkbox" id="fcrev"><span>Reverse mode (show the definition, recall the term)</span></label>`;
    return;
  }
  if (FC.i >= FC.list.length) { V.innerHTML = `<div class="empty"><h2>🎉 Session complete</h2><p>You reviewed ${FC.done} cards.</p><button class="btn pri" data-act="run" data-fn="fcend">Back to decks</button></div>`; return; }
  const c = FC.list[FC.i], front = FC.rev ? c.b : c.f, back = FC.rev ? c.f : c.b;
  V.innerHTML = `<div class="row between"><button class="btn sm ghost" data-act="run" data-fn="fcend">← Decks</button><span class="muted">${FC.i + 1} / ${FC.list.length}${c.o ? ' · Obj ' + c.o : ''}</span></div>
  <div class="bar" style="margin:12px 0 22px"><span style="width:${(FC.i / FC.list.length) * 100}%"></span></div>
  <div class="fc ${FC.flip ? 'flip' : ''}" data-act="run" data-fn="fcflip"><div class="inner"><div class="face">${FC.rev ? `<p>${esc(front)}</p>` : `<b>${esc(front)}</b>`}<div class="muted small" style="position:absolute;bottom:14px">click or press Space to flip</div></div><div class="face back">${FC.rev ? `<b>${esc(back)}</b>` : `<p>${esc(back)}</p>`}</div></div></div>
  <div class="rate" style="visibility:${FC.flip ? 'visible' : 'hidden'}"><button class="btn danger" data-act="run" data-fn="fcrate" data-arg="0">1 · Again</button><button class="btn" data-act="run" data-fn="fcrate" data-arg="1">2 · Hard</button><button class="btn pri" data-act="run" data-fn="fcrate" data-arg="2">3 · Good</button><button class="btn ok" data-act="run" data-fn="fcrate" data-arg="3">4 · Easy</button></div>`;
}

function vAcr() {
  crumb('Acronyms');
  V.innerHTML = `<div class="row between"><div><h1>Acronym reference</h1><div class="muted">${SP.acronyms.length} acronyms · official SY0-801 list plus common extras</div></div><button class="btn pri" data-act="run" data-fn="acr">Acronym drill</button></div>
  <input class="txt search" id="acrq" placeholder="Search acronyms or definitions…" style="margin:16px 0" autocomplete="off">
  <div class="card" style="padding:6px 10px"><table><tbody id="acrt"></tbody></table></div>`;
  const draw = () => { const f = norm(document.getElementById('acrq').value); document.getElementById('acrt').innerHTML = SP.acronyms.filter((a) => !f || norm(a[0] + a[1]).includes(f)).sort((a, b) => a[0].localeCompare(b[0])).map((a) => `<tr><td style="width:120px"><b style="font-family:var(--mono)">${esc(a[0])}</b></td><td>${esc(a[1])}</td></tr>`).join('') || '<tr><td class="muted">No matches</td></tr>'; };
  document.getElementById('acrq').addEventListener('input', draw); draw();
}

function vReview() {
  crumb('Review & Flags');
  const missed = SP.questions.filter((q) => ST[q.id] && !ST[q.id].last), flagged = SP.questions.filter((q) => FL[q.id]);
  const list = (qs) => qs.length ? `<table>${qs.slice(0, 60).map((q) => `<tr><td><span class="oid">${q.o}</span></td><td>${q.t === 'pbq' ? '<b>PBQ:</b> ' + esc(q.title) : esc(String(q.q).slice(0, 140))}${String(q.q).length > 140 && q.t !== 'pbq' ? '…' : ''}</td><td><span class="pill">${TL[q.t]}</span></td></tr>`).join('')}</table>${qs.length > 60 ? `<div class="muted small">+${qs.length - 60} more</div>` : ''}` : '<div class="muted small">Nothing here yet.</div>';
  V.innerHTML = `<h1>Review &amp; Flags</h1>
  <div class="grid g2" style="margin-top:14px"><div class="card"><div class="row between"><h2 style="margin:0">Missed (${missed.length})</h2><button class="btn sm pri" data-act="run" data-fn="missed" ${missed.length ? '' : 'disabled'}>Practice</button></div><div class="muted small" style="margin:6px 0 10px">Questions you got wrong the last time you answered them.</div>${list(missed)}</div>
  <div class="card"><div class="row between"><h2 style="margin:0">Flagged (${flagged.length})</h2><span class="row"><button class="btn sm ghost" data-act="run" data-fn="clearflags" ${flagged.length ? '' : 'disabled'}>Clear</button><button class="btn sm pri" data-act="run" data-fn="flagged" ${flagged.length ? '' : 'disabled'}>Practice</button></span></div><div class="muted small" style="margin:6px 0 10px">Questions you marked with ⚑ during any session.</div>${list(flagged)}</div></div>`;
}

function vProgress() {
  crumb('Progress');
  const all = agg(), ex = HI.filter((h) => h.mode === 'exam');
  V.innerHTML = `<h1>Progress</h1>
  <div class="grid g4" style="margin-top:14px"><div class="card tile"><div class="l">Coverage</div><div class="v">${pct(all.n / all.total)}</div><div class="muted small">${all.n}/${all.total} questions</div></div>
  <div class="card tile"><div class="l">Accuracy</div><div class="v">${all.n ? pct(all.p) : '—'}</div><div class="muted small">latest attempt per question</div></div>
  <div class="card tile"><div class="l">Sessions</div><div class="v">${HI.length}</div><div class="muted small">${ex.length} exams</div></div>
  <div class="card tile"><div class="l">Predicted</div><div class="v">${answeredCount() < 20 ? '—' : predicted()}</div><div class="muted small">scaled estimate</div></div></div>
  <div class="sec"><h2>Objective mastery</h2><span class="muted small">color = accuracy · click to study</span></div>
  <div class="heat">${ALLOBJ.map((o) => { const s = objStat(o), c = !s.n ? 'var(--card2)' : s.p >= 0.85 ? 'var(--okbg)' : s.p >= 0.65 ? 'var(--warnbg)' : 'var(--badbg)'; return `<a href="#study-${String(o).replace('.', '-')}" style="background:${c}"><b>${o}</b> ${s.n ? pct(s.p) : '—'}<div class="muted small">${s.n}/${s.total} answered</div></a>`; }).join('')}</div>
  <div class="card" style="margin-top:18px"><h3>Session history</h3>${HI.length ? `<table><tr><th>Date</th><th>Session</th><th>Q</th><th>Time</th><th>Score</th></tr>${HI.slice(0, 40).map((h) => `<tr><td class="small">${new Date(h.t).toLocaleString()}</td><td>${esc(h.title)}</td><td>${h.n}</td><td>${fmtT(h.time)}</td><td>${h.mode === 'exam' ? `<span class="pill ${h.scaled >= 750 ? 'ok' : 'bad'}">${h.scaled}</span>` : scorePill(h.pct)}</td></tr>`).join('')}</table>` : '<div class="muted small">No sessions yet.</div>'}</div>
  <div class="card"><h3>Your data</h3><div class="muted small">Progress is saved in this browser only. Export it to back up or move to another device.</div>
   <div class="row" style="margin-top:12px"><button class="btn" data-act="run" data-fn="export">⬇ Export progress</button><button class="btn" data-act="run" data-fn="import">⬆ Import progress</button><button class="btn danger" data-act="run" data-fn="reset">Reset everything</button><input type="file" id="impFile" accept=".json" hidden></div></div>`;
  document.getElementById('impFile').onchange = (e) => {
    const f = e.target.files[0]; if (!f) return; const rd = new FileReader();
    rd.onload = () => { try { const j = JSON.parse(rd.result); ST = j.stats || {}; FL = j.flags || {}; HI = j.hist || []; CD = j.cards || {}; save(); toast('Progress imported.'); route(); } catch (err) { toast('That file is not a valid progress export.'); } };
    rd.readAsText(f);
  };
}

/* ---------- interaction ---------- */
function mutate(key, fn) { if (locked(key)) return; fn(); saveS(); vQuiz(); }
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const act = el.dataset.act, key = el.dataset.k;
  if (act === 'run') { if (el.tagName !== 'INPUT') e.preventDefault(); e.stopPropagation(); const f = CMD[el.dataset.fn]; if (f) f(el.dataset.arg); return; }
  if (!S || !key) return;
  const u = unitOf(key); if (!u) return;
  if (act === 'pick') mutate(key, () => {
    if (u.t === 'mc') S.resp[key] = +el.dataset.v;
    else if (u.t === 'tf') S.resp[key] = el.dataset.v === '1';
    else { const a = (S.resp[key] || []).slice(), v = +el.dataset.v, i = a.indexOf(v); i >= 0 ? a.splice(i, 1) : a.push(v); S.resp[key] = a; }
  });
  else if (act === 'line') mutate(key, () => { const a = (S.resp[key] || []).slice(), v = +el.dataset.i, i = a.indexOf(v); i >= 0 ? a.splice(i, 1) : a.push(v); S.resp[key] = a; });
  else if (act === 'up' || act === 'down') mutate(key, () => { const a = S.resp[key].slice(), i = +el.dataset.i, j = act === 'up' ? i - 1 : i + 1; [a[i], a[j]] = [a[j], a[i]]; S.resp[key] = a; });
  else if (act === 'chip') { if (locked(key)) return; const i = +el.dataset.i; UI.chip = UI.chip && UI.chip.key === key && UI.chip.i === i ? null : { key, i }; vQuiz(); }
  else if (act === 'drop') { if (UI.chip && UI.chip.key === key) place(key, UI.chip.i, +el.dataset.b); }
});
function place(key, i, b) { const u = unitOf(key); mutate(key, () => { const a = (S.resp[key] || u.items.map(() => -1)).slice(); a[i] = b; S.resp[key] = a; UI.chip = null; }); }
document.addEventListener('change', (e) => {
  const el = e.target; if (!el.dataset || !S) return; const key = el.dataset.k; if (!key || locked(key)) return;
  if (el.dataset.act === 'msel') mutate(key, () => { const a = (S.resp[key] || []).slice(); a[+el.dataset.i] = el.value || null; S.resp[key] = a; });
  if (el.dataset.act === 'gsel') mutate(key, () => { const o = Object.assign({}, S.resp[key] || {}); o[el.dataset.i] = el.value || null; S.resp[key] = o; });
});
document.addEventListener('input', (e) => {
  const el = e.target; if (!el.dataset || el.dataset.act !== 'text' || !S) return; const key = el.dataset.k; if (locked(key)) return;
  S.resp[key] = el.value; saveS();
  const g = document.querySelector('.navgrid button.cur'); if (g && el.value.trim()) g.classList.add('ans');
});
/* drag & drop */
document.addEventListener('dragstart', (e) => {
  const c = e.target.closest && e.target.closest('.chip'); if (c) { UI.chip = { key: c.dataset.k, i: +c.dataset.i }; e.dataTransfer.setData('text/plain', 'chip'); return; }
  const o = e.target.closest && e.target.closest('.oi'); if (o) { UI.ord = { key: o.dataset.k, i: +o.dataset.i }; o.classList.add('drag'); e.dataTransfer.setData('text/plain', 'ord'); }
});
document.addEventListener('dragover', (e) => { const d = e.target.closest && e.target.closest('.drop, .oi'); if (d) { e.preventDefault(); d.classList.add('over'); } });
document.addEventListener('dragleave', (e) => { const d = e.target.closest && e.target.closest('.drop, .oi'); if (d) d.classList.remove('over'); });
document.addEventListener('drop', (e) => {
  const d = e.target.closest && e.target.closest('.drop'); const o = e.target.closest && e.target.closest('.oi');
  if (d && UI.chip && UI.chip.key === d.dataset.k) { e.preventDefault(); place(d.dataset.k, UI.chip.i, +d.dataset.b); return; }
  if (o && UI.ord && UI.ord.key === o.dataset.k) { e.preventDefault(); const key = o.dataset.k, from = UI.ord.i, to = +o.dataset.i; UI.ord = null; mutate(key, () => { const a = S.resp[key].slice(); const [m] = a.splice(from, 1); a.splice(to, 0, m); S.resp[key] = a; }); }
});
document.addEventListener('dragend', () => { UI.ord = null; document.querySelectorAll('.over,.drag').forEach((x) => x.classList.remove('over', 'drag')); });
/* keyboard */
document.addEventListener('keydown', (e) => {
  if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
  const h = location.hash;
  if (h.startsWith('#flashcards') && FC && FC.i < FC.list.length) {
    if (e.key === ' ') { e.preventDefault(); CMD.fcflip(); } else if (FC.flip && /^[1-4]$/.test(e.key)) fcRate(+e.key - 1);
    return;
  }
  if (!h.startsWith('#quiz') || !S) return;
  const id = S.qids[S.idx], q = getQ(id);
  if (/^[1-8]$/.test(e.key) && ['mc', 'ms', 'tf'].includes(q.t)) {
    const btns = V.querySelectorAll('.opt'); const b = btns[+e.key - 1]; if (b) b.click();
  } else if (e.key === 'ArrowRight') CMD.next();
  else if (e.key === 'ArrowLeft') CMD.prev();
  else if (e.key === 'Enter') { e.preventDefault(); if (!S.done && S.instant && !S.chk[id]) CMD.check(); else CMD.next(); }
  else if (e.key.toLowerCase() === 'f' && !S.done) CMD.flag();
});

route();
syncBadge();
initSync();
})();
