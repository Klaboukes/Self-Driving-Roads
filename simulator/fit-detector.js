/*
 * fit-detector.js: fit capacity, queue discharge and the speed-flow curve to loop-detector data.
 *
 * Roadmap item 2.1: today's road should reproduce a real three-lane section with an on-ramp. This
 * script turns detector data into the numbers to compare: free-flow speed, capacity before
 * breakdown, queue discharge flow after it, the capacity drop, flow per lane and a binned
 * speed-flow curve. It can also sample today's road in the simulator into the same CSV format
 * (--sim), so the same fit runs on both.
 *
 * Usage
 *   node simulator/fit-detector.js data.csv [options]           fit a CSV file
 *   node simulator/fit-detector.js --sim [options]              sample today's road, then fit it
 *   node simulator/fit-detector.js --sim --csv-out=sim.csv      ... and keep the sampled CSV
 * The markdown summary goes to stdout, and also to a file with --out=summary.md.
 *
 * CSV format: one header row, then one row per detector interval (any length; 1 minute is typical).
 * Separator "," (--sep=";" for other ones). Quotes around fields are stripped; no embedded separators.
 *   time        seconds (a number) or a date-time Date.parse understands (2024-03-05T07:15:00Z)
 *   flow        veh/h in that interval; or give counts with --count=col and the interval length
 *               with --interval=seconds (if left out: the median step between timestamps)
 *   speed       mean speed in km/h
 *   truck share optional; a fraction (0.1) or a percentage (10)
 *   state speed optional: speed at a detector UPSTREAM of the bottleneck. A detector downstream of
 *               a merge often sees queue discharge at fairly high speed, so breakdown is best read
 *               upstream (Cassidy & Bertini 1999). Default: the speed column itself.
 * Per lane: give comma-separated column lists, e.g. --flow=q1,q2,q3 --speed=v1,v2,v3. The section's
 * flow is the sum; its speed is the space-mean speed sum(q) / sum(q / v). An empty or non-numeric
 * speed in a lane with no flow is ignored.
 *
 * Options (defaults in brackets)
 *   --time=col [time]  --flow=cols [flow]  --count=cols  --interval=s  --speed=cols [speed]
 *   --trucks=col       --state=col         --sep=,       --lanes=n (when flow is not per lane) [3]
 *   --agg=min [5]      length of the intervals the fit works on
 *   --vcrit=km/h [70]  breakdown: the state speed falls below this ...
 *   --vrec=km/h [80]   ... and the queue has dissolved when it is back above this
 *   --min-cong=min [10] a drop below vcrit counts as a breakdown only if it lasts this long
 *   --pre=min [15]     capacity = mean flow over this window before breakdown
 *   --skip=min [5]     discharge = mean flow while congested, skipping this long after breakdown
 *   --bin=veh/h [250]  flow bin width for the speed-flow table
 *   --pce=n [2]        passenger-car equivalent of a truck (2 in the Dutch CIA handbook)
 *   --ref-trucks=f [0.10] capacity is also converted to this truck share
 *   --out=file         also write the markdown summary to this file
 *
 * Definitions (all on --agg minute intervals)
 *   free / congested   state speed below vcrit starts congestion, back above vrec ends it
 *   breakdown          a change from free to congested that lasts at least min-cong, with free
 *                      intervals in the pre window before it
 *   capacity           per breakdown, the mean flow of the free intervals in the pre minutes before
 *                      it (the highest *sustained* flow); the result is the median over breakdowns.
 *                      Also shown: the flow in the last interval before breakdown (Brilon's capacity
 *                      sample) and the 95th percentile of all free-flow intervals.
 *   discharge          the time-weighted mean flow of all congested intervals, skipping the first
 *                      skip minutes of each breakdown
 *   capacity drop      1 - discharge / capacity
 *   free-flow speed    median speed of free intervals carrying at most half the 95th-percentile flow
 *
 * Simulator sampling (--sim): runs today's road (new World({mode: 'human'})) with the main demand
 * rising linearly, and counts vehicles crossing a flow detector at --at (default 3000 m: after the
 * merge, before the exit, so it sees the full merged flow) and a state detector at --up (default
 * 1800 m: upstream of the acceleration lane, main lanes only). One row per minute.
 *   --seeds=n [1]  --seed=first [1]  --main-from=veh/h [3000]  --main-to=veh/h [6600]  --ramp=veh/h [900]
 *   --warm=min [10] at main-from first  --rise=min [60]  --hold=min [30] at main-to
 *   --plain        no on-ramp and no exit (demandRamp 0, exitShare 0)
 *   --cfg='{"humanT":1.2}'  extra World settings (JSON)
 *   --csv-out=file keep the sampled CSV
 * The sampled CSV has columns time, flow_0..flow_{n-1}, speed_0..speed_{n-1} (lane 0 = right lane,
 * as in engine.js), speed_up and truck_share; --sim sets the matching column options itself.
 * Each run of 100 simulated minutes takes a few minutes of CPU.
 */
'use strict';
const fs = require('fs');

// ---------- small helpers ----------
function parseArgs(argv) {
  const o = { _: [] };
  for (const a of argv) {
    const m = /^--([^=]+)(?:=(.*))?$/.exec(a);
    if (m) o[m[1]] = m[2] === undefined ? true : m[2];
    else o._.push(a);
  }
  return o;
}
const num = s => { const x = parseFloat(s); return Number.isFinite(x) ? x : NaN; };
const list = s => String(s).split(',').map(x => x.trim()).filter(Boolean);
const sum = a => a.reduce((s, x) => s + x, 0);
const mean = a => a.length ? sum(a) / a.length : NaN;
function percentile(a, p) {
  if (!a.length) return NaN;
  const s = [...a].sort((x, y) => x - y), i = (s.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i);
  return s[lo] + (s[hi] - s[lo]) * (i - lo);
}
const median = a => percentile(a, 0.5);
function spaceMeanSpeed(flows, speeds) {      // sum(q) / sum(q / v) over lanes that have flow and a speed
  let q = 0, k = 0;
  for (let i = 0; i < flows.length; i++) {
    const v = speeds.length === 1 ? speeds[0] : speeds[i];
    if (flows[i] > 0 && v > 0) { q += flows[i]; k += flows[i] / v; }
  }
  if (k > 0) return q / k;
  const ok = speeds.filter(v => Number.isFinite(v));
  return ok.length ? mean(ok) : NaN;
}

// ---------- reading ----------
function parseCsv(text, sep) {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  const split = l => l.split(sep || ',').map(f => f.trim().replace(/^"(.*)"$/, '$1'));
  return { header: split(lines[0]), rows: lines.slice(1).map(split) };
}
function parseTime(s) {
  if (/^-?\d+(\.\d+)?$/.test(s)) return +s;
  const ms = Date.parse(s);
  return Number.isFinite(ms) ? ms / 1000 : NaN;
}

// returns one record per row: { t (s), flow (veh/h), speed (km/h), state (km/h), trucks (0..1 or NaN), lanes [veh/h] }
function readRecords(text, opts = {}) {
  const o = { time: 'time', flow: 'flow', speed: 'speed', ...opts };
  const { header, rows } = parseCsv(text, o.sep);
  const col = name => {
    const i = header.indexOf(name);
    if (i < 0) throw new Error(`column "${name}" not found; the header is: ${header.join(', ')}`);
    return i;
  };
  const tI = col(o.time);
  const useCount = !!o.count;
  const qI = list(useCount ? o.count : o.flow).map(col);
  const vI = list(o.speed).map(col);
  const sI = o.state ? col(o.state) : -1;
  const kI = o.trucks ? col(o.trucks) : -1;
  const times = rows.map(r => parseTime(r[tI]));
  let interval = +o.interval;
  if (useCount && !(interval > 0)) {
    const steps = [];
    for (let i = 1; i < times.length; i++) if (times[i] > times[i - 1]) steps.push(times[i] - times[i - 1]);
    interval = median(steps);
    if (!(interval > 0)) throw new Error('cannot tell the interval length; give --interval=seconds');
  }
  const out = [];
  rows.forEach((r, n) => {
    const t = times[n];
    let lanes = qI.map(i => num(r[i]));
    if (!Number.isFinite(t) || lanes.some(q => !Number.isFinite(q))) return;   // skip broken rows
    if (useCount) lanes = lanes.map(c => c * 3600 / interval);
    const speeds = vI.map(i => num(r[i]));
    const speed = spaceMeanSpeed(lanes, speeds);
    let trucks = kI >= 0 ? num(r[kI]) : NaN;
    if (trucks > 1) trucks /= 100;
    const state = sI >= 0 ? num(r[sI]) : speed;
    out.push({ t, flow: sum(lanes), speed, state, trucks, lanes });
  });
  return out.sort((a, b) => a.t - b.t);
}

// ---------- aggregation to --agg minute intervals ----------
function aggregate(records, minutes) {
  const len = minutes * 60;
  if (!records.length) return [];
  const t0 = records[0].t;
  const groups = new Map();
  for (const r of records) {
    const k = Math.floor((r.t - t0 + 1e-6) / len);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  }
  const out = [];
  for (const [k, g] of [...groups].sort((a, b) => a[0] - b[0])) {
    const flow = mean(g.map(r => r.flow));
    let qs = 0, ks = 0;               // space-mean speed over the interval: sum(q) / sum(q / v)
    for (const r of g) if (r.flow > 0 && r.speed > 0) { qs += r.flow; ks += r.flow / r.speed; }
    const speed = ks > 0 ? qs / ks : mean(g.map(r => r.speed).filter(Number.isFinite));
    const st = g.map(r => r.state).filter(Number.isFinite);
    const tr = g.filter(r => Number.isFinite(r.trucks));
    const trucks = tr.length ? sum(tr.map(r => r.trucks * r.flow)) / Math.max(1e-9, sum(tr.map(r => r.flow))) : NaN;
    const lanes = g[0].lanes.map((_, i) => mean(g.map(r => r.lanes[i])));
    out.push({ k, t: t0 + k * len, flow, speed, state: st.length ? mean(st) : NaN, trucks, lanes });
  }
  return out;
}

// ---------- the fit ----------
function fit(records, opts = {}) {
  const o = {
    agg: 5, vcrit: 70, vrec: 80, 'min-cong': 10, pre: 15, skip: 5, bin: 250, pce: 2, 'ref-trucks': 0.10, lanes: 3,
    ...opts,
  };
  const agg = +o.agg, vcrit = +o.vcrit, vrec = +o.vrec;
  const iv = aggregate(records, agg);
  // free / congested with hysteresis; a gap in the data resets to the state of the next interval
  let cong = false;
  iv.forEach((x, i) => {
    if (i > 0 && x.k !== iv[i - 1].k + 1) cong = x.state < vcrit;
    else if (!cong && x.state < vcrit) cong = true;
    else if (cong && x.state >= vrec) cong = false;
    x.cong = cong;
  });
  const free = iv.filter(x => !x.cong);
  const q95free = percentile(free.map(x => x.flow), 0.95);

  // breakdowns
  const nPre = Math.max(1, Math.round(+o.pre / agg)), nSkip = Math.round(+o.skip / agg), nMin = Math.max(1, Math.round(+o['min-cong'] / agg));
  const events = [];
  for (let i = 1; i < iv.length; i++) {
    if (!iv[i].cong || iv[i - 1].cong || iv[i].k !== iv[i - 1].k + 1) continue;
    let j = i + 1;                               // end of this congested spell (exclusive)
    while (j < iv.length && iv[j].cong && iv[j].k === iv[j - 1].k + 1) j++;
    if (j - i < nMin) continue;
    const pre = [];
    for (let p = i - 1; p >= 0 && iv[p].k >= iv[i].k - nPre && !iv[p].cong; p--) pre.push(iv[p]);
    if (!pre.length) continue;
    const dis = iv.slice(i + nSkip, j);
    events.push({
      t: iv[i].t, minutes: (j - i) * agg,
      capacity: mean(pre.map(x => x.flow)), last: iv[i - 1].flow, preMax: Math.max(...pre.map(x => x.flow)),
      discharge: dis.length ? mean(dis.map(x => x.flow)) : NaN,
      pre, dis,
    });
  }
  const capacity = median(events.map(e => e.capacity));
  const disIv = events.flatMap(e => e.dis);
  const discharge = mean(disIv.map(x => x.flow));
  const ffIv = free.filter(x => x.flow <= 0.5 * q95free);
  const freeFlowSpeed = median((ffIv.length ? ffIv : free.filter(x => x.flow <= percentile(free.map(y => y.flow), 0.25))).map(x => x.speed));

  // speed-flow bins
  const bw = +o.bin, bins = new Map();
  for (const x of iv) {
    if (!Number.isFinite(x.speed)) continue;
    const b = Math.floor(x.flow / bw);
    if (!bins.has(b)) bins.set(b, { from: b * bw, to: (b + 1) * bw, free: [], cong: [] });
    bins.get(b)[x.cong ? 'cong' : 'free'].push(x.speed);
  }

  // flow per lane
  const nLanes = iv.length ? iv[0].lanes.length : 1;
  const perLane = nLanes > 1;
  const lanes = perLane ? iv[0].lanes.map((_, i) => ({
    lane: i,
    capacity: median(events.map(e => mean(e.pre.map(x => x.lanes[i])))),
    discharge: mean(disIv.map(x => x.lanes[i])),
    maxFree: percentile(free.map(x => x.lanes[i]), 0.95),
  })) : null;

  const trIv = iv.filter(x => Number.isFinite(x.trucks));
  const truckShare = trIv.length ? sum(trIv.map(x => x.trucks * x.flow)) / sum(trIv.map(x => x.flow)) : NaN;
  const pce = +o.pce, ref = +o['ref-trucks'];
  const toRef = Number.isFinite(truckShare) ? (1 + (pce - 1) * truckShare) / (1 + (pce - 1) * ref) : NaN;

  return {
    opts: o, rows: records.length, intervals: iv.length, congestedIntervals: iv.length - free.length,
    freeFlowSpeed, q95free, capacity, brilon: median(events.map(e => e.last)), discharge,
    drop: 1 - discharge / capacity, events, lanesN: perLane ? nLanes : +o.lanes, lanes, truckShare, toRef,
    bins: [...bins.values()].sort((a, b) => a.from - b.from),
  };
}

// ---------- report ----------
function toMarkdown(r, title) {
  const o = r.opts, f0 = x => Number.isFinite(x) ? Math.round(x).toLocaleString('en-US') : '–';
  const f1 = x => Number.isFinite(x) ? x.toFixed(1) : '–', pc = x => Number.isFinite(x) ? (100 * x).toFixed(1) + ' %' : '–';
  const L = [];
  L.push(`# Detector fit${title ? ': ' + title : ''}`, '');
  L.push(`${r.rows} rows, aggregated to ${r.intervals} intervals of ${o.agg} min (${r.congestedIntervals} congested). ` +
    `Breakdown: state speed below ${o.vcrit} km/h for at least ${o['min-cong']} min; the queue has gone when it is back above ${o.vrec} km/h. ` +
    `Capacity: mean flow of the ${o.pre} min before each breakdown (median over breakdowns). Discharge: mean flow while congested, from ${o.skip} min after breakdown.`, '');
  const perLane = x => Number.isFinite(x) ? ` (${f0(x / r.lanesN)} per lane)` : '';
  L.push('| Measure | Value |', '|---|---|');
  L.push(`| Free-flow speed | ${f1(r.freeFlowSpeed)} km/h |`);
  L.push(`| Breakdowns found | ${r.events.length} |`);
  L.push(`| **Capacity before breakdown** | **${f0(r.capacity)} veh/h**${perLane(r.capacity)} |`);
  L.push(`| Flow in the last ${o.agg} min before breakdown (median) | ${f0(r.brilon)} veh/h |`);
  L.push(`| 95th percentile of free-flow ${o.agg}-min flows | ${f0(r.q95free)} veh/h${perLane(r.q95free)} |`);
  L.push(`| **Queue discharge flow** | **${f0(r.discharge)} veh/h**${perLane(r.discharge)} |`);
  L.push(`| Capacity drop | ${pc(r.drop)} |`);
  if (Number.isFinite(r.truckShare)) {
    L.push(`| Truck share | ${pc(r.truckShare)} |`);
    L.push(`| Capacity / discharge in pcu/h (truck = ${o.pce} pcu) | ${f0(r.capacity * (1 + (o.pce - 1) * r.truckShare))} / ${f0(r.discharge * (1 + (o.pce - 1) * r.truckShare))} |`);
    L.push(`| Capacity / discharge at ${pc(+o['ref-trucks'])} trucks | ${f0(r.capacity * r.toRef)} / ${f0(r.discharge * r.toRef)} veh/h |`);
  }
  L.push('');
  if (r.events.length) {
    L.push('## Breakdowns', '', `| Start (s) | Congested (min) | Capacity (veh/h) | Last ${o.agg} min | Highest before | Discharge (veh/h) |`, '|---|---|---|---|---|---|');
    for (const e of r.events) L.push(`| ${Math.round(e.t)} | ${e.minutes} | ${f0(e.capacity)} | ${f0(e.last)} | ${f0(e.preMax)} | ${f0(e.discharge)} |`);
    L.push('');
  }
  L.push('## Speed-flow curve', '', `Space-mean speed (km/h) per flow bin, ${o.agg}-min intervals.`, '',
    '| Flow (veh/h) | Free: n | Free: speed | Congested: n | Congested: speed |', '|---|---|---|---|---|');
  for (const b of r.bins) L.push(`| ${f0(b.from)}–${f0(b.to)} | ${b.free.length} | ${f1(mean(b.free))} | ${b.cong.length} | ${f1(mean(b.cong))} |`);
  L.push('');
  if (r.lanes) {
    L.push('## Flow per lane', '', '| Lane | Capacity (veh/h) | Discharge (veh/h) | 95th pct free flow |', '|---|---|---|---|');
    for (const l of r.lanes) L.push(`| ${l.lane} | ${f0(l.capacity)} | ${f0(l.discharge)} | ${f0(l.maxFree)} |`);
    L.push('');
  }
  return L.join('\n');
}

// ---------- sampling today's road in the simulator ----------
function simulate(opts = {}) {
  const { World } = require('./engine.js');
  const g = (k, d) => (opts[k] === undefined || opts[k] === true ? d : +opts[k]);
  const at = g('at', 3000), up = g('up', 1800), seeds = g('seeds', 1), seed0 = g('seed', 1);
  const lo = g('main-from', 3000), hi = g('main-to', 6600), warm = g('warm', 10), rise = g('rise', 60), hold = g('hold', 30);
  const plain = !!opts.plain, ramp = plain ? 0 : g('ramp', 900);
  const extra = opts.cfg ? JSON.parse(opts.cfg) : {};
  const total = warm + rise + hold;
  let header = null;
  const rows = [];
  for (let s = 0; s < seeds; s++) {
    const w = new World({ ...extra, mode: 'human', seed: seed0 + s, demandMain: lo, demandRamp: ramp, ...(plain ? { exitShare: 0 } : {}) });
    const S = w.S, dt = w.cfg.dt, steps = Math.round(60 / dt);
    if (!header) header = ['time', ...[...Array(S).keys()].map(i => 'flow_' + i), ...[...Array(S).keys()].map(i => 'speed_' + i), 'speed_up', 'truck_share'];
    const prevX = new WeakMap();
    const offset = s * (total + 60) * 60;          // an hour's gap between seeds keeps them apart
    for (let m = 0; m < total; m++) {
      const main = m < warm ? lo : lo + (hi - lo) * (rise > 0 ? Math.min(1, (m - warm) / rise) : 1);
      w.setConfig({ demandMain: main });
      const n = new Array(S).fill(0), inv = new Array(S).fill(0);
      let nUp = 0, invUp = 0, trucks = 0;
      for (let i = 0; i < steps; i++) {
        w.step();
        for (const v of w.vehicles) {
          const x0 = prevX.get(v);
          prevX.set(v, v.x);
          if (x0 === undefined || v.lane < 0 || v.lane >= S) continue;
          const sp = Math.max(v.v, 0.1) * 3.6;
          if (x0 < at && v.x >= at) { n[v.lane]++; inv[v.lane] += 1 / sp; if (v.type === 'truck') trucks++; }
          if (x0 < up && v.x >= up) { nUp++; invUp += 1 / sp; }
        }
      }
      if (m < 5) continue;                          // the corridor is still filling
      const nAll = sum(n);
      rows.push([offset + (m + 1) * 60, ...n.map(c => c * 60), ...n.map((c, i) => c ? (c / inv[i]).toFixed(1) : ''),
        nUp ? (nUp / invUp).toFixed(1) : '0', nAll ? (trucks / nAll).toFixed(3) : '']);
    }
  }
  const S = (header.length - 3) / 2, lanes = [...Array(S).keys()];
  return {
    csv: [header.join(','), ...rows.map(r => r.join(','))].join('\n') + '\n',
    columns: { time: 'time', flow: lanes.map(i => 'flow_' + i).join(','), speed: lanes.map(i => 'speed_' + i).join(','), state: 'speed_up', trucks: 'truck_share' },
  };
}

function main(argv) {
  const o = parseArgs(argv);
  let text, title, cols = {};
  if (o.sim) {
    const sim = simulate(o);
    text = sim.csv; cols = sim.columns;
    title = `today's road in the simulator (${o.plain ? 'plain road' : 'on-ramp ' + (o.ramp || 900) + ' veh/h'}, main ${o['main-from'] || 3000} to ${o['main-to'] || 6600} veh/h, ${o.seeds || 1} seed(s), flow at ${o.at || 3000} m, state at ${o.up || 1800} m)`;
    if (o['csv-out']) fs.writeFileSync(o['csv-out'], text);
  } else {
    if (!o._[0]) { console.error('usage: node fit-detector.js data.csv [--flow=..] [--speed=..] [--out=..]   or   --sim'); process.exit(1); }
    text = fs.readFileSync(o._[0], 'utf8');
    title = o._[0];
  }
  const ro = { ...cols };
  for (const k of ['time', 'flow', 'count', 'interval', 'speed', 'trucks', 'state', 'sep']) if (typeof o[k] === 'string') ro[k] = o[k];
  const fo = {};
  for (const k of ['agg', 'vcrit', 'vrec', 'min-cong', 'pre', 'skip', 'bin', 'pce', 'ref-trucks', 'lanes']) if (typeof o[k] === 'string') fo[k] = +o[k];
  const md = toMarkdown(fit(readRecords(text, ro), fo), title);
  console.log(md);
  if (o.out) fs.writeFileSync(o.out, md + '\n');
  return md;
}

module.exports = { parseArgs, parseCsv, readRecords, aggregate, fit, toMarkdown, simulate, main };
if (require.main === module) main(process.argv.slice(2));
