/* Question bank helpers. Convention: in mc questions the FIRST choice is correct;
   in ms questions the FIRST k choices are correct. The engine shuffles at runtime. */
window.SP = { domains: [], questions: [], acronyms: [], glossary: [] };
(function () {
  const cnt = {};
  const add = (q) => { cnt[q.o] = (cnt[q.o] || 0) + 1; q.id = q.o + '-' + String(cnt[q.o]).padStart(2, '0'); SP.questions.push(q); return q; };
  const rng = (k) => [...Array(k).keys()];
  SP.mc = (o, q, c, e) => add({ o, t: 'mc', q, c, a: 0, e });
  SP.ms = (o, q, c, k, e) => add({ o, t: 'ms', q, c, a: rng(k), e });
  SP.tf = (o, q, a, e) => add({ o, t: 'tf', q, a: !!a, e });
  SP.fill = (o, q, a, e) => add({ o, t: 'fill', q, a: [].concat(a), e });
  SP.match = (o, q, pairs, e) => add({ o, t: 'match', q, pairs, e });
  SP.order = (o, q, items, e) => add({ o, t: 'order', q, items, e });
  SP.cat = (o, q, buckets, items, e) => add({ o, t: 'cat', q, buckets, items, e });
  SP.pbq = (o, title, q, ex, tasks, e) => add({ o, t: 'pbq', title, q, ex, tasks, e });
  // Task builders for PBQs (same shapes as questions, no id)
  SP.T = {
    mc: (q, c) => ({ t: 'mc', q, c, a: 0 }),
    ms: (q, c, k) => ({ t: 'ms', q, c, a: rng(k) }),
    fill: (q, a) => ({ t: 'fill', q, a: [].concat(a) }),
    num: (q, a, tol, unit) => ({ t: 'num', q, a, tol, unit }),
    match: (q, pairs) => ({ t: 'match', q, pairs }),
    order: (q, items) => ({ t: 'order', q, items }),
    cat: (q, buckets, items) => ({ t: 'cat', q, buckets, items }),
    // cols: [[header, options|null]], rows: [[cell...]] – a cell under a column with options is the correct value (string or array of accepted)
    grid: (q, cols, rows) => ({ t: 'grid', q, cols, rows }),
    // lines prefixed with '*' are the correct (suspicious) lines
    lines: (q, lines) => ({ t: 'lines', q, lines: lines.map((l) => l.replace(/^\*/, '')), a: lines.map((l, i) => (l[0] === '*' ? i : -1)).filter((i) => i >= 0) })
  };
})();
