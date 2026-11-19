/*
 * Headless experiments for the SDR simulator.
 *   node experiments.js                 -> runs everything, writes results/results.md and results/results.json
 *   node experiments.js --quick         -> fewer seeds, shorter runs (smoke test)
 *   node experiments.js --only=a,b      -> only these groups (see GROUPS); the others are kept from the last run
 *
 * Every group is a list of independent simulation runs (tasks) plus a function that turns their
 * results into table rows. All tasks of all groups share one pool of worker threads.
 */
'use strict';
const { Worker, isMainThread, parentPort } = require('worker_threads');
const fs = require('fs');
const path = require('path');
const os = require('os');
const SDR = require('./engine.js');
const { World } = SDR;

const QUICK = process.argv.includes('--quick');
const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const range = n => Array.from({ length: n }, (_, i) => i + 1);
const SEEDS_FLOW = range(QUICK ? 2 : 5);      // throughput runs
const SEEDS_INC = range(QUICK ? 2 : 10);      // incident runs
const WARM = 300, MEAS = QUICK ? 300 : 900;   // throughput runs: warm-up and measuring time (s)
// A comparison whose 95 % confidence interval includes zero gets more runs, once, up to these numbers
// (both rows of the comparison, same seeds). One fixed step, not "until it is significant".
const MORE_FLOW = QUICK ? 2 : 15, MORE_INC = QUICK ? 2 : 30;

const SYSTEMS = {
  'Today (human drivers)':          { mode: 'human' },
  'SDR, absolute separation':       { mode: 'sdr', separation: 'absolute' },
  'SDR, absolute + adaptive speed': { mode: 'sdr', separation: 'absolute', speedPolicy: 'adaptive' },
  'SDR, relative separation':       { mode: 'sdr', separation: 'relative' },
  'SDR, hybrid separation':         { mode: 'sdr', separation: 'hybrid' },
};
const TODAY = 'Today (human drivers)';
const POLICIES = {
  'SDR absolute': { mode: 'sdr', separation: 'absolute' },
  'SDR relative': { mode: 'sdr', separation: 'relative' },
  'SDR hybrid':   { mode: 'sdr', separation: 'hybrid' },
};

// ------------------------------------------------------------------ single runs (executed in workers)
// throughput run. `pre` may switch road sensors off in one segment before the run starts.
function runFlow(cfg, warmup, measure, pre) {
  const w = new World(cfg);
  if (pre && pre.sensorsDown >= 0) w.toggleSensors(pre.sensorsDown);
  w.run(warmup);
  const m = w.m;
  const tStart = w.t;
  const id0 = w.nextId, done0 = m.completed, hard0 = m.hardBrakes, dist0 = m.vehDist, brake0 = m.brakeEnergy, col0 = m.collisions;
  const sup0 = m.supervision, safe0 = m.safeStops, miss0 = m.missedExits;
  m.minSpare = Infinity;
  let speedSum = 0, speedN = 0;
  const n = Math.round(measure / 30);
  for (let i = 0; i < n; i++) {
    w.run(30);
    const s = w.stats(30);
    if (!isNaN(s.meanSpeed)) { speedSum += s.meanSpeed; speedN++; }
  }
  const s = w.stats(measure);
  const arrived = w.nextId - id0;
  const served = m.completed - done0;
  const km = (m.vehDist - dist0) / 1000;
  const exiting = arrived * (w.cfg.exitShare || 0);
  // Waits at the gates: every vehicle let in during the measuring time, plus those still waiting at
  // the end with their wait so far (a lower bound: without them a gate that lets nobody in looks fine).
  const adm = m.admits.filter(a => a.t > tStart);
  const still = (queue, ramp) => queue.map(v => ({ wait: w.t - v.tArrive, ramp, truck: v.type === 'truck' }));
  const all = adm.concat(still(w.mainQueue, false), still(w.rampQueue, true));
  const pct = (list, f) => {
    if (!list.length) return 0;
    const a = list.map(x => x.wait).sort((p, q) => p - q);
    return a[Math.min(a.length - 1, Math.floor(f * a.length))];
  };
  const main = all.filter(a => !a.ramp), ramp = all.filter(a => a.ramp);
  const perH = n => n / measure * 3600;
  return {
    flow: s.flow,
    waitP50: pct(all, 0.5), waitP95: pct(all, 0.95), waitMax: pct(all, 1),
    waitMainP50: pct(main, 0.5), waitMainP95: pct(main, 0.95),
    waitRampP50: pct(ramp, 0.5), waitRampP95: pct(ramp, 0.95),
    waitTruckP95: pct(all.filter(a => a.truck), 0.95), waitCarP95: pct(all.filter(a => !a.truck), 0.95),
    inMainPerH: perH(adm.filter(a => !a.ramp).length), inRampPerH: perH(adm.filter(a => a.ramp).length),
    truckPctIn: adm.length ? 100 * adm.filter(a => a.truck).length / adm.length : NaN,
    queueMain: s.mainQueue, queueRamp: s.rampQueue,
    servedPerH: served / measure * 3600,
    servedPct: arrived > 0 ? 100 * served / arrived : 100,
    speedKmh: speedN ? speedSum / speedN * 3.6 : NaN,
    tripDelay: s.tripDelay,
    tripTime: s.tripTime,
    queueEnd: s.mainQueue + s.rampQueue,
    maxWait: s.maxQueueWait,
    collisions: m.collisions - col0,
    hardPer1000km: km > 0 ? 1000 * (m.hardBrakes - hard0) / km : 0,
    brakeWhPerKm: km > 0 ? ((m.brakeEnergy - brake0) * 1500 / 3600) / km : 0,
    missedPct: exiting > 0 ? 100 * (m.missedExits - miss0) / exiting : 0,
    supervision: m.supervision - sup0,
    safeStops: m.safeStops - safe0,
    minSpare: m.minSpare,
    allowance: s.staleExtra,
    vLimitKmh: s.vLimit * 3.6,
  };
}

// spot in lane 1 (2.2–4.2 km) with the most free road upstream, so the debris is as avoidable as
// the traffic allows; the clearance is reported
function freeSpot(w, lane) {
  let best = null, bestClear = -1;
  for (let x = 4200; x >= 2200; x -= 10) {
    let clear = 300;
    for (const v of w.vehicles) {
      if (v.lane !== lane && v.laneTo !== lane) continue;
      if (v.x - v.length < x + 10 && v.x > x - 300) clear = Math.min(clear, x - v.x);
    }
    if (clear >= 150) return { x, clear };
    if (clear > bestClear) { bestClear = clear; best = { x, clear }; }
  }
  return best;
}

// a load falls off the truck nearest to x that has a follower close behind it: it lands just behind the truck
// `load` narrows it down: secure (true/false: a truck with or without an enclosed, monitored load),
// follower ('truck' or 'car'), slide (m/s²: the load keeps the truck's speed and slides to rest; 0 = stops dead)
function dropFromTruck(w, x, load) {
  const L = load || {};
  let best = null, bd = Infinity;
  for (const v of w.vehicles) {
    if (v.type !== 'truck' || v.lane < 0 || v.lane >= w.S || v.laneTo !== null || v.v < 15) continue;
    if (L.secure !== undefined && !!v.secure !== L.secure) continue;
    const fol = w._behind(v.lane, v.x - v.length, v, false);
    if (!fol || fol.isObstacle || v.x - v.length - fol.x > 150) continue;
    if (L.follower && fol.type !== L.follower) continue;
    const d = Math.abs(v.x - x);
    if (d < bd) { bd = d; best = { truck: v, fol }; }
  }
  if (!best) return null;
  const o = w.addDebris(best.truck.x - best.truck.length - 2, best.truck.lane, best.truck.v, L.slide || 0);
  return { o, gap: o.x - o.length - best.fol.x };
}

// time spent in the system (driving or waiting at a gate) by all vehicles within [t0, now]
function vehicleSeconds(w, t0) {
  let s = 0;
  for (const tr of w.m.trips) if (tr.t >= t0) s += tr.t - Math.max(tr.t - tr.time, t0);
  for (const v of w.vehicles.concat(w.mainQueue, w.rampQueue)) s += w.t - Math.max(v.tArrive, t0);
  return s;
}

function applyIncident(w, kind, cfg, opts) {
  switch (kind) {
    case 'debris': {
      const spot = freeSpot(w, 1);
      if (!spot || spot.clear < 0) return null;
      w.addDebris(spot.x, 1); return { clearance: spot.clear };
    }
    case 'brick-wall stop': return w.suddenStop(3000) ? {} : null;
    case 'vehicle comms loss': if (cfg.mode !== 'sdr') return null; return w.commsLoss(3000) ? {} : null;
    case 'segment controller failure (60 s)':
      if (cfg.mode !== 'sdr') return null;
      w.toggleSegment(2); w.run(60); w.toggleSegment(2); return {};
    case 'sudden 50 % brake loss': return w.degradeBrakes(3000) ? {} : null;
    case 'breakdown': return w.breakdown(3700) ? {} : null;   // coasts to a stop around 4.1–4.6 km, clear of ramp and exit
    case 'object 150 m ahead': { const o = w.dropObjectAhead(3000, 1, 150); return o ? { gap: o.clearance } : null; }
    case 'object 300 m ahead': { const o = w.dropObjectAhead(3000, 1, 300); return o ? { gap: o.clearance } : null; }
    case 'load falls off a truck': { const r = dropFromTruck(w, 3000, opts && opts.load); return r ? { gap: r.gap } : null; }
  }
  throw new Error('unknown incident ' + kind);
}

const INC_DEFAULTS = { warmup: 600, observe: 300 };
function runIncident(cfg, kind, seed, opts) {
  const o = Object.assign({}, INC_DEFAULTS, opts || {});
  const w = new World(Object.assign({}, cfg, { seed }));
  w.run(o.warmup);
  const m0 = Object.assign({}, w.m);
  const tIncident = w.t;
  const info = applyIncident(w, kind, cfg, o);
  if (!info) return { applicable: false };
  w.run(Math.max(0, tIncident + o.observe - w.t));
  const impacts = w.m.incidents.filter(i => i.t >= tIncident);
  return {
    applicable: true,
    collisions: w.m.collisions - m0.collisions,
    objectHits: impacts.filter(i => i.other === 'debris').length,
    maxImpactKmh: impacts.length ? Math.max(...impacts.map(i => i.dv * 3.6)) : 0,
    guardian: w.m.guardian - m0.guardian,
    supervision: w.m.supervision - m0.supervision,
    safeStops: w.m.safeStops - m0.safeStops,
    hardBrakes: w.m.hardBrakes - m0.hardBrakes,
    sidetracked: w.m.sidetracked - m0.sidetracked,
    liveLaneStopS: w.m.liveLaneStopS - m0.liveLaneStopS,
    vehS: vehicleSeconds(w, tIncident),
    clearance: info.clearance, gap: info.gap,
  };
}

// the same traffic (same seed, same period) without the incident: what would have happened anyway
function runBaseline(cfg, seed, opts) {
  const o = Object.assign({}, INC_DEFAULTS, opts || {});
  const w = new World(Object.assign({}, cfg, { seed }));
  w.run(o.warmup);
  const col0 = w.m.collisions, hard0 = w.m.hardBrakes, t0 = w.t;
  w.run(o.observe);
  return { collisions: w.m.collisions - col0, hardBrakes: w.m.hardBrakes - hard0, vehS: vehicleSeconds(w, t0) };
}

const TASKS = { flow: runFlow, incident: runIncident, baseline: runBaseline };

// ------------------------------------------------------------------ statistics
const num = x => typeof x === 'number' && isFinite(x);
function mean(a) { const v = a.filter(num); return v.length ? v.reduce((p, q) => p + q, 0) / v.length : NaN; }
function sd(a) {
  const v = a.filter(num); if (v.length < 2) return NaN;
  const mu = mean(v); return Math.sqrt(v.reduce((p, q) => p + (q - mu) * (q - mu), 0) / (v.length - 1));
}
// mean of every numeric field, plus <field>Sd = standard deviation between runs
function avg(list) {
  const out = { runs: list.length };
  for (const k of Object.keys(list[0])) {
    out[k] = mean(list.map(r => r[k]));
    out[k + 'Sd'] = sd(list.map(r => r[k]));
  }
  out.minSpare = Math.min(...list.map(r => num(r.minSpare) ? r.minSpare : Infinity));
  out.collisionsTotal = list.reduce((a, r) => a + (r.collisions || 0), 0);
  return out;
}

// Two-sided 95 % point of Student's t for `df` degrees of freedom
const T95 = [NaN, 12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228, 2.201, 2.179, 2.160, 2.145, 2.131,
  2.120, 2.110, 2.101, 2.093, 2.086, 2.080, 2.074, 2.069, 2.064, 2.060, 2.056, 2.052, 2.048, 2.045, 2.042];
const t95 = df => df < 1 ? NaN : df <= 30 ? T95[df] : df <= 40 ? 2.021 : df <= 60 ? 2.000 : 1.980;
// Paired comparison of two rows that were run with the same seeds (the same traffic). `a` and `b` hold
// one value per seed. The difference is taken per seed, so the variation in traffic that both rows
// share drops out; the result is its mean with a 95 % confidence interval.
function pairedStat(a, b) {
  const d = [], va = [], vb = [];
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (num(a[i]) && num(b[i])) { d.push(a[i] - b[i]); va.push(a[i]); vb.push(b[i]); }
  const n = d.length, diff = mean(d), s = sd(d);
  const half = n >= 2 ? t95(n - 1) * s / Math.sqrt(n) : NaN;
  const out = { n, a: mean(va), b: mean(vb), diff, lo: diff - half, hi: diff + half };
  out.pct = out.b ? 100 * diff / Math.abs(out.b) : NaN;
  out.verdict = n < 2 ? 'too few runs' : d.every(x => x === 0) ? 'identical' : out.lo > 0 || out.hi < 0 ? 'outside the noise' : 'within the noise';
  return out;
}

function summarise(res) {
  const sum = k => res.reduce((a, r) => a + (r[k] || 0), 0);
  const paired = res.filter(r => r.base);
  return {
    runs: res.length,
    runsWithCollision: res.filter(r => r.collisions > 0).length,
    collisions: sum('collisions'),
    // collisions in the same traffic without the incident (only where a paired run was made)
    bgCollisions: paired.length ? paired.reduce((a, r) => a + r.base.collisions, 0) : undefined,
    objectHits: sum('objectHits'),
    maxImpactKmh: res.length ? Math.max(...res.map(r => r.maxImpactKmh)) : 0,
    guardian: sum('guardian'), safeStops: sum('safeStops'), supervision: sum('supervision'),
    hardBrakes: sum('hardBrakes') / res.length,
    bgHardBrakes: paired.length ? paired.reduce((a, r) => a + r.base.hardBrakes, 0) / paired.length : undefined,
    sidetracked: sum('sidetracked') / res.length,
    liveLaneStopS: sum('liveLaneStopS') / res.length,
    clearance: mean(res.map(r => r.clearance)),
    gap: mean(res.map(r => r.gap)),
    extraVehH: paired.length ? mean(paired.map(r => (r.vehS - r.base.vehS) / 3600)) : undefined,
    extraVehHSd: paired.length ? sd(paired.map(r => (r.vehS - r.base.vehS) / 3600)) : undefined,
  };
}

// ------------------------------------------------------------------ task planning
// A plan collects the runs a group needs. `add` returns a handle; identical baseline runs are shared.
function makePlan() {
  const tasks = [], seen = new Map(), comparisons = [];
  return {
    tasks, comparisons,
    add(kind, ...args) { tasks.push({ kind, args }); return tasks.length - 1; },
    unique(kind, ...args) {
      const key = kind + JSON.stringify(args);
      if (!seen.has(key)) seen.set(key, this.add(kind, ...args));
      return seen.get(key);
    },
    // Register a paired comparison "A against B" of two rows (the `runs` of each). `measures` maps a
    // name to a function (results, run) -> value for one seed. `what` says under which conditions.
    // `fixed`: never add seeds for this one (exploratory variants).
    compare(what, nameA, runsA, nameB, runsB, measures, fixed) { comparisons.push({ what, nameA, runsA, nameB, runsB, measures, fixed: !!fixed }); },
  };
}
// The runs of one table row, one per seed. `extendTo(n)` adds seeds up to n (used for comparisons that
// are within the noise) and returns how many runs it added.
function seededRuns(seeds, addOne, more) {
  const runs = seeds.map(addOne);
  let next = seeds.length + 1;
  runs.more = more;
  runs.extendTo = n => { let k = 0; for (; next <= n; next++, k++) runs.push(addOne(next)); return k; };
  return runs;
}
// one table row of incident runs: every seed, optionally paired with the same traffic without the incident
function incidentRuns(p, cfg, kind, opts, paired) {
  const runs = seededRuns(SEEDS_INC, seed => ({
    inc: p.add('incident', cfg, kind, seed, opts),
    base: paired ? p.unique('baseline', cfg, seed, opts) : -1,
  }), MORE_INC);
  runs.incident = true;
  return runs;
}
// per-seed values for comparisons
const flowVal = k => (r, i) => r[i][k];
const incVal = k => (r, e) => r[e.inc].applicable ? r[e.inc][k] : NaN;
const incExtraVehH = (r, e) => r[e.inc].applicable && e.base >= 0 ? (r[e.inc].vehS - r[e.base].vehS) / 3600 : NaN;
const SERVED = { 'Served (veh/h)': flowVal('servedPerH') };
const SERVED_DELAY = { 'Served (veh/h)': flowVal('servedPerH'), 'Trip delay (s)': flowVal('tripDelay') };
const SERVED_DELAY_BRAKES = Object.assign({ 'Hard brakes / 1000 veh-km': flowVal('hardPer1000km') }, SERVED_DELAY);
const COLLISIONS = { 'Collisions per run': incVal('collisions') };
function compareStats(c, r) {
  return Object.entries(c.measures).map(([measure, get]) => {
    const { a, b, ...st } = pairedStat(c.runsA.map(x => get(r, x)), c.runsB.map(x => get(r, x)));
    return { what: c.what, a: c.nameA, b: c.nameB, measure, a_: a, b_: b, ...st };       // a_, b_: the two means
  });
}
function incidentSummary(r, runs) {
  const res = [];
  for (const { inc, base } of runs) {
    if (!r[inc].applicable) continue;
    res.push(base >= 0 ? Object.assign({ base: r[base] }, r[inc]) : r[inc]);
  }
  return res.length ? summarise(res) : { runs: 0 };
}
const flowRuns = (p, cfg, pre) => seededRuns(SEEDS_FLOW, seed => p.add('flow', Object.assign({ seed }, cfg), WARM, MEAS, pre), MORE_FLOW);
const flowAvg = (r, runs) => avg(runs.map(i => r[i]));

// ------------------------------------------------------------------ experiment groups
// Each group: (plan) -> function(results) -> rows
const DEMANDS = QUICK ? [3600, 6000] : [2400, 3600, 4800, 6000, 7200];
function groupDemand(p) {
  const rows = [];
  for (const [name, sys] of Object.entries(SYSTEMS)) for (const dm of DEMANDS)
    rows.push({ system: name, demandMain: dm, demandRamp: 900, runs: flowRuns(p, Object.assign({ demandMain: dm, demandRamp: 900 }, sys)) });
  for (const row of rows) {
    if (row.system === TODAY) continue;
    const base = rows.find(x => x.system === TODAY && x.demandMain === row.demandMain);
    p.compare(`${f0(row.demandMain)} + 900 veh/h`, row.system, row.runs, TODAY, base.runs, SERVED_DELAY_BRAKES);
  }
  return r => rows.map(({ runs, ...m }) => ({ ...m, ...flowAvg(r, runs) }));
}

const INC_DEMAND = { demandMain: 4200, demandRamp: 600 };
function groupIncidents(p) {
  const kinds = ['debris', 'brick-wall stop', 'vehicle comms loss', 'segment controller failure (60 s)', 'sudden 50 % brake loss'];
  const rows = [];
  for (const kind of kinds) for (const [name, sys] of Object.entries(SYSTEMS)) {
    if (name.includes('adaptive')) continue;
    rows.push({ incident: kind, system: name, runs: incidentRuns(p, Object.assign({}, INC_DEMAND, sys), kind, undefined, true) });
  }
  for (const row of rows) {
    if (row.system === TODAY || /comms|segment/.test(row.incident)) continue;      // those two cannot happen on today's road
    const base = rows.find(x => x.system === TODAY && x.incident === row.incident);
    p.compare(row.incident, row.system, row.runs, TODAY, base.runs, COLLISIONS);
  }
  return r => rows.map(({ runs, ...m }) => ({ ...m, ...incidentSummary(r, runs) }));
}

function groupWeather(p) {
  const rows = [];
  for (const [label, friction] of [['dry', 1.0], ['wet', 0.7], ['ice', 0.3]])
    for (const [name, sys] of Object.entries(SYSTEMS))
      rows.push({ weather: label, system: name, runs: flowRuns(p, Object.assign({ friction, demandMain: 3600, demandRamp: 600 }, sys)) });
  for (const row of rows) {
    if (row.system === TODAY) continue;
    const base = rows.find(x => x.system === TODAY && x.weather === row.weather);
    p.compare(row.weather, row.system, row.runs, TODAY, base.runs, SERVED_DELAY);
  }
  return r => rows.map(({ runs, ...m }) => ({ ...m, ...flowAvg(r, runs) }));
}

function groupTheory() {
  return () => {
    const rows = [];
    for (const [label, friction] of [['dry', 1.0], ['wet', 0.7], ['ice', 0.3]]) {
      const cfg = Object.assign({}, SDR.DEFAULTS, { friction });
      const r = { weather: label };
      for (const kmh of [40, 60, 80, 100, 120]) {
        r[`abs@${kmh}`] = SDR.sdrCapacity(cfg, 'absolute', kmh / 3.6);
        r[`hyb@${kmh}`] = SDR.sdrCapacity(cfg, 'hybrid', kmh / 3.6);
        r[`rel@${kmh}`] = SDR.sdrCapacity(cfg, 'relative', kmh / 3.6);
        r[`hum@${kmh}`] = SDR.humanCapacity(cfg, kmh / 3.6);
      }
      r.absOpt = SDR.sdrOptimalSpeed(cfg, 'absolute') * 3.6;
      r.hybOpt = SDR.sdrOptimalSpeed(cfg, 'hybrid') * 3.6;
      r.relOpt = SDR.sdrOptimalSpeed(cfg, 'relative') * 3.6;
      rows.push(r);
    }
    return rows;
  };
}

// hybrid variants: what each rule costs in capacity and what it buys at a brick-wall stop / lost load
const HYBRID_VARIANTS = {
  'Relative (no hybrid rules)':                          { separation: 'relative' },
  'Relative + absolute behind faulty vehicles only':     { separation: 'hybrid', platoonBreakEvery: 0, hybridTruckAbsolute: false },
  '+ platoon break every 20':                            { separation: 'hybrid', platoonBreakEvery: 20, hybridTruckAbsolute: false },
  '+ platoon break every 10':                            { separation: 'hybrid', platoonBreakEvery: 10, hybridTruckAbsolute: false },
  '+ platoon break every 5':                             { separation: 'hybrid', platoonBreakEvery: 5, hybridTruckAbsolute: false },
  '+ platoon break every 3':                             { separation: 'hybrid', platoonBreakEvery: 3, hybridTruckAbsolute: false },
  '+ absolute behind trucks (recommended hybrid)':       { separation: 'hybrid', platoonBreakEvery: 0, hybridTruckAbsolute: true },
  '+ absolute behind trucks + platoon break every 10':   { separation: 'hybrid', platoonBreakEvery: 10, hybridTruckAbsolute: true },
  'Absolute':                                            { separation: 'absolute' },
};
const SHORT = { warmup: 400, observe: 240 };
const SAT = { demandMain: 7200, demandRamp: 900 };     // more than any system can carry
function groupHybrid(p) {
  const rows = [];
  for (const [name, v] of Object.entries(HYBRID_VARIANTS)) {
    const sys = Object.assign({ mode: 'sdr' }, v);
    rows.push({
      variant: name,
      flow: flowRuns(p, Object.assign({}, SAT, sys)),
      brick: incidentRuns(p, Object.assign({}, INC_DEMAND, sys), 'brick-wall stop', SHORT, false),
      load: incidentRuns(p, Object.assign({}, INC_DEMAND, sys), 'load falls off a truck', SHORT, false),
    });
  }
  const ref = rows[0];                                   // relative: what each rule costs and buys is measured against it
  for (const row of rows.slice(1)) {
    p.compare('capacity, 7,200 + 900 veh/h', row.variant, row.flow, ref.variant, ref.flow, SERVED);
    p.compare('brick-wall stop', row.variant, row.brick, ref.variant, ref.brick, COLLISIONS);
    p.compare('load falls off a truck', row.variant, row.load, ref.variant, ref.load, COLLISIONS);
  }
  return r => rows.map(row => {
    const f = flowAvg(r, row.flow);
    return { variant: row.variant, servedPerH: f.servedPerH, servedPerHSd: f.servedPerHSd, speedKmh: f.speedKmh, tripDelay: f.tripDelay, queueEnd: f.queueEnd,
      brick: incidentSummary(r, row.brick), load: incidentSummary(r, row.load) };
  });
}

// detection layers vs foreign objects
const LAYERS = {
  'Nobody detects it':                       { roadDetectProb: 0, carDetectProb: 0 },
  'Road cameras only (95 %, 0.5 s)':         { roadDetectProb: 0.95, carDetectProb: 0 },
  'Car sensors only (90 %), not shared':     { roadDetectProb: 0, carDetectProb: 0.9, carSensorShare: 'none' },
  'Car sensors (90 %) + V2V':                { roadDetectProb: 0, carDetectProb: 0.9, carSensorShare: 'v2v' },
  'Road cameras + car sensors + V2V':        { roadDetectProb: 0.95, carDetectProb: 0.9, carSensorShare: 'v2v' },
};
function groupObjects(kind) {
  return p => {
    const rows = [];
    rows.push({ scenario: kind, layers: 'Human drivers (see it within 150 m)', policy: 'Today', runs: incidentRuns(p, Object.assign({ mode: 'human' }, INC_DEMAND), kind, SHORT, true) });
    for (const [lname, layers] of Object.entries(LAYERS)) for (const [pname, pol] of Object.entries(POLICIES))
      rows.push({ scenario: kind, layers: lname, policy: pname, runs: incidentRuns(p, Object.assign({}, INC_DEMAND, pol, layers), kind, SHORT, false) });
    for (const row of rows.slice(1)) if (row.policy === 'SDR hybrid') p.compare(`${kind}; ${row.layers}`, row.policy, row.runs, 'Today', rows[0].runs, COLLISIONS);
    return r => rows.map(({ runs, ...m }) => ({ ...m, ...incidentSummary(r, runs) }));
  };
}

// safety lane / hard shoulder: extra vehicle-hours over 20 minutes vs the same traffic without the incident
const SAFETY_SYSTEMS = {
  'Today, no hard shoulder':       { mode: 'human', safetyLane: false },
  'Today, with hard shoulder':     { mode: 'human', safetyLane: true },
  'SDR hybrid, no safety lane':    { mode: 'sdr', separation: 'hybrid', safetyLane: false },
  'SDR hybrid, with safety lane':  { mode: 'sdr', separation: 'hybrid', safetyLane: true },
};
function groupSafety(kind) {
  return p => {
    const rows = [];
    const opts = { warmup: 400, observe: QUICK ? 600 : 1200 };
    for (const [name, sys] of Object.entries(SAFETY_SYSTEMS)) {
      if (sys.mode === 'human' && kind !== 'breakdown') continue;
      rows.push({ incident: kind, system: name, runs: incidentRuns(p, Object.assign({}, INC_DEMAND, sys), kind, opts, true) });
    }
    const row = n => rows.find(x => x.system === n);
    const cmp = (a, b) => row(a) && row(b) && p.compare(kind, a, row(a).runs, b, row(b).runs, { 'Extra delay (vehicle-hours)': incExtraVehH, 'Collisions per run': incVal('collisions') });
    cmp('SDR hybrid, no safety lane', 'Today, no hard shoulder');
    cmp('SDR hybrid, with safety lane', 'Today, with hard shoulder');
    cmp('SDR hybrid, with safety lane', 'SDR hybrid, no safety lane');
    cmp('Today, with hard shoulder', 'Today, no hard shoulder');
    return r => rows.map(({ runs, ...m }) => ({ ...m, ...incidentSummary(r, runs) }));
  };
}

// road sensors down in one segment: hybrid falls back to absolute there
function groupSensors(p) {
  const rows = [];
  for (const [dm, dr] of [[4200, 600], [7200, 900]])
    for (const [label, seg] of [['all sensors up', -1], ['down at the on-ramp merge (2–3 km)', 2], ['down on a plain stretch (4–5 km)', 4]])
      rows.push({ demand: `${dm} + ${dr}`, state: label, runs: flowRuns(p, { mode: 'sdr', separation: 'hybrid', demandMain: dm, demandRamp: dr }, { sensorsDown: seg }) });
  for (const row of rows) {
    const base = rows.find(x => x.demand === row.demand);          // the first row of each demand: all sensors up
    if (row !== base) p.compare(`${row.demand} veh/h`, `sensors ${row.state}`, row.runs, base.state, base.runs, SERVED);
  }
  return r => rows.map(({ runs, ...m }) => ({ ...m, ...flowAvg(r, runs) }));
}

// radio packet loss: fixed gaps vs gaps the road widens to the loss it measures
function groupLoss(p) {
  const rows = [];
  for (const adaptive of [false, true]) for (const loss of QUICK ? [0, 0.2] : [0, 0.01, 0.05, 0.1, 0.2, 0.5])
    rows.push({ packetLoss: loss, adaptive, runs: flowRuns(p, Object.assign({ mode: 'sdr', separation: 'hybrid', packetLoss: loss, lossAdaptive: adaptive }, SAT)) });
  const gaps = a => a ? 'widened gaps' : 'fixed gaps';
  for (const row of rows) {
    if (!row.packetLoss) continue;
    const base = rows.find(x => x.adaptive === row.adaptive && !x.packetLoss);
    p.compare(gaps(row.adaptive), `${f0(row.packetLoss * 100)} % loss`, row.runs, 'no loss', base.runs, SERVED);
    const fixed = rows.find(x => !x.adaptive && x.packetLoss === row.packetLoss);
    if (row.adaptive) p.compare(`${f0(row.packetLoss * 100)} % loss`, gaps(true), row.runs, gaps(false), fixed.runs, { 'Supervision brakes per run': flowVal('supervision') });
  }
  return r => rows.map(({ runs, ...m }) => ({ ...m, ...flowAvg(r, runs) }));
}

// truck share: the hybrid rule (absolute gap behind trucks) costs more the more trucks there are
function groupTrucks(p) {
  const rows = [];
  const systems = { 'Today (human drivers)': SYSTEMS['Today (human drivers)'], 'SDR, relative separation': SYSTEMS['SDR, relative separation'], 'SDR, hybrid separation': SYSTEMS['SDR, hybrid separation'] };
  for (const share of QUICK ? [0, 0.3] : [0, 0.1, 0.2, 0.3]) for (const [name, sys] of Object.entries(systems))
    rows.push({ truckShare: share, system: name, runs: flowRuns(p, Object.assign({ truckShare: share }, SAT, sys)) });
  for (const share of new Set(rows.map(x => x.truckShare))) {
    const at = n => rows.find(x => x.truckShare === share && x.system === n);
    const what = `${f0(share * 100)} % trucks`, hyb = 'SDR, hybrid separation', rel = 'SDR, relative separation';
    p.compare(what, hyb, at(hyb).runs, TODAY, at(TODAY).runs, SERVED);
    p.compare(what, rel, at(rel).runs, TODAY, at(TODAY).runs, SERVED);
    p.compare(what, hyb, at(hyb).runs, rel, at(rel).runs, SERVED);
  }
  return r => rows.map(({ runs, ...m }) => ({ ...m, ...flowAvg(r, runs) }));
}

// today's road on its own: does the human baseline behave like a real motorway?
function groupToday(p) {
  const rows = [];
  for (const dm of QUICK ? [6000] : [3000, 4500, 6000, 7200])
    rows.push({ road: 'Plain road (no ramp, no exit)', demand: `${dm}`, total: dm, runs: flowRuns(p, { mode: 'human', demandMain: dm, demandRamp: 0, exitShare: 0 }) });
  for (const dm of QUICK ? [3600] : [2400, 3600, 4800, 6000])
    rows.push({ road: 'With on-ramp and exit', demand: `${dm} + 900`, total: dm + 900, runs: flowRuns(p, { mode: 'human', demandMain: dm, demandRamp: 900 }) });
  return r => rows.map(({ runs, ...m }) => ({ ...m, ...flowAvg(r, runs) }));
}

// Gate and merge rules (roadmap 1.1): who waits at which gate, and what each rule does to it
const GATE_OLD = { ghostFrame: false, ghostType: false, rampLaneWindow: 0, rampMaxWait: 45 };
const GATE_VARIANTS = {
  'Before: merge and gates as they were':                        GATE_OLD,
  '1. Ramp vehicle keeps its place in the merge order':           { ghostType: false, rampLaneWindow: 0, rampMaxWait: 45 },
  '2. + truck gap opened for a merging truck':                    { rampLaneWindow: 0, rampMaxWait: 45 },
  '3. + right lane kept free by ramp arrivals (was: ramp queue)': { rampMaxWait: 45 },
  '4. + ramp gate timer 15 s (was 45 s)':                         { rampMaxWait: 15 },
  '5. + no ramp gate timer (the new default)':                    { },
  '5, corridor filled to 90 %':                                   { budgetFactor: 0.9 },
  '5, corridor filled to 110 %':                                  { budgetFactor: 1.1 },
  '5, right lane never kept free for the ramp':                   { rampKeepLaneAbove: 1e9 },
  '5, right lane always kept free for the ramp':                  { rampKeepLaneAbove: -1 },
};
const GATE_MEASURES = { 'Served (veh/h)': flowVal('servedPerH'), 'Trip delay (s)': flowVal('tripDelay'), 'Wait, 95th percentile (s)': flowVal('waitP95'), 'Hard brakes / 1000 veh-km': flowVal('hardPer1000km') };
function groupGates(p) {
  const rows = [];
  const names = Object.keys(GATE_VARIANTS);
  for (const dm of QUICK ? [4800] : [3600, 4800, 7200]) {
    rows.push({ demandMain: dm, variant: TODAY, runs: flowRuns(p, { mode: 'human', demandMain: dm, demandRamp: 900 }) });
    for (const name of names) rows.push({ demandMain: dm, variant: name, runs: flowRuns(p, Object.assign({ mode: 'sdr', separation: 'hybrid', demandMain: dm, demandRamp: 900 }, GATE_VARIANTS[name])) });
  }
  for (const row of rows) {
    if (row.variant === TODAY) continue;
    const at = n => rows.find(x => x.demandMain === row.demandMain && x.variant === n);
    const what = `${f0(row.demandMain)} + 900 veh/h`;
    p.compare(what, row.variant, row.runs, TODAY, at(TODAY).runs, GATE_MEASURES, true);
    if (row.variant !== names[0]) p.compare(what, row.variant, row.runs, names[0], at(names[0]).runs, GATE_MEASURES, true);
  }
  return r => rows.map(({ runs, ...m }) => ({ ...m, ...flowAvg(r, runs) }));
}

// Speed under pressure (roadmap 1.3): does a lower speed buy capacity with relative or hybrid separation?
const SPEEDS = {
  'fixed 120 km/h':                    { },
  'adaptive (slows down when queues build)': { speedPolicy: 'adaptive' },
  'fixed 100 km/h':                    { speedLimit: 100 / 3.6 },
  'fixed 80 km/h':                     { speedLimit: 80 / 3.6 },
};
const SPEED_MEASURES = { 'Served (veh/h)': flowVal('servedPerH'), 'Trip time (s)': flowVal('tripTime'), 'Hard brakes / 1000 veh-km': flowVal('hardPer1000km') };
function groupSpeed(p) {
  const rows = [];
  const ref = Object.keys(SPEEDS)[0];
  for (const [sname, sys] of [['SDR, hybrid separation', SYSTEMS['SDR, hybrid separation']], ['SDR, relative separation', SYSTEMS['SDR, relative separation']]])
    for (const dm of DEMANDS) for (const [speed, opt] of Object.entries(SPEEDS))
      rows.push({ system: sname, demandMain: dm, speed, runs: flowRuns(p, Object.assign({ demandMain: dm, demandRamp: 900 }, sys, opt)) });
  for (const row of rows) {
    if (row.speed === ref) continue;
    const base = rows.find(x => x.system === row.system && x.demandMain === row.demandMain && x.speed === ref);
    p.compare(`${row.system.replace('SDR, ', '').replace(' separation', '')}, ${f0(row.demandMain)} + 900 veh/h`, row.speed, row.runs, ref, base.runs, SPEED_MEASURES);
  }
  return r => rows.map(({ runs, ...m }) => ({ ...m, ...flowAvg(r, runs) }));
}

// Cheaper truck rules (roadmap 1.2): capacity at 10, 20 and 30 % trucks, and what a lost load then does
const TRUCK_RULES = {
  'Brick-wall gap behind every truck (the rule as it is)':        { },
  'No truck rule (relative separation)':                          { hybridTruckAbsolute: false },
  'a. Not behind enclosed, monitored trucks: 25 % of trucks':     { secureLoadShare: 0.25 },
  'a. Not behind enclosed, monitored trucks: 50 %':               { secureLoadShare: 0.5 },
  'a. Not behind enclosed, monitored trucks: 75 %':               { secureLoadShare: 0.75 },
  'b. Gap for a load that stops dead + 0.5 s to confirm it':      { truckGapConfirm: 0.5 },
  'b. Gap for a load that stops dead + 1 s to confirm it':        { truckGapConfirm: 1 },
  'b. Gap for a load that slides (6 m/s²) + 0.5 s to confirm it': { loadSlideDecel: 6, truckGapConfirm: 0.5 },
  'b. Gap for a load that slides (6 m/s²) + 1 s to confirm it':   { loadSlideDecel: 6, truckGapConfirm: 1 },
  'c. Trucks follow trucks closely':                              { truckBehindTruckRelative: true },
  'd. Truck lane':                                                { truckLane: true },
  'c + d. Truck lane, trucks follow trucks closely':              { truckLane: true, truckBehindTruckRelative: true },
};
// Lost-load tests. Only the road's own sensors count here (no car sensors), so the confirmation time is what is tested.
const ROAD_ONLY = { roadDetectProb: 1, carDetectProb: 0 };
const LOAD_TESTS = {
  dead05:  { title: 'stops dead, road confirms in 0.5 s', cfg: { roadDetectionDelay: 0.5 }, load: {} },
  dead10:  { title: 'stops dead, road confirms in 1 s',   cfg: { roadDetectionDelay: 1.0 }, load: {} },
  slide10: { title: 'slides at 6 m/s², road confirms in 1 s', cfg: { roadDetectionDelay: 1.0 }, load: { slide: 6 } },
};
const TRUCK_SHARES = QUICK ? [0.2] : [0.1, 0.2, 0.3];
function groupTruckRule(p) {
  const rows = [];
  const names = Object.keys(TRUCK_RULES), ref = names[0];
  for (const share of TRUCK_SHARES) {
    rows.push({ truckShare: share, rule: TODAY, flow: flowRuns(p, Object.assign({ mode: 'human', truckShare: share }, SAT)) });
    for (const name of names) {
      const sys = Object.assign({ mode: 'sdr', separation: 'hybrid', truckShare: share }, TRUCK_RULES[name]);
      const row = { truckShare: share, rule: name, flow: flowRuns(p, Object.assign({}, SAT, sys)), tests: {} };
      // a. the load falls off a truck that still has the long gap behind it (an open one); c. the follower may be a truck
      const base = name.startsWith('a.') ? { secure: false } : {};
      for (const [key, t] of Object.entries(LOAD_TESTS)) {
        if (key !== 'dead05' && share !== 0.2) continue;                  // the extra tests at 20 % trucks only
        row.tests[key] = incidentRuns(p, Object.assign({}, INC_DEMAND, sys, ROAD_ONLY, t.cfg), 'load falls off a truck', Object.assign({ load: Object.assign({}, base, t.load) }, SHORT), false);
      }
      if (share === 0.2 && name.startsWith('a.'))    // what if an enclosed, monitored truck loses something after all
        row.tests.secure = incidentRuns(p, Object.assign({}, INC_DEMAND, sys, ROAD_ONLY), 'load falls off a truck', Object.assign({ load: { secure: true } }, SHORT), false);
      if (share === 0.2 && name.startsWith('c'))     // the follower is a truck
        row.tests.truck = incidentRuns(p, Object.assign({}, INC_DEMAND, sys, ROAD_ONLY), 'load falls off a truck', Object.assign({ load: { follower: 'truck' } }, SHORT), false);
      rows.push(row);
    }
  }
  for (const row of rows) {
    if (row.rule === TODAY) continue;
    const at = n => rows.find(x => x.truckShare === row.truckShare && x.rule === n);
    const what = `${f0(row.truckShare * 100)} % trucks`;
    p.compare(what, row.rule, row.flow, TODAY, at(TODAY).flow, SERVED);
    if (row.rule !== ref) p.compare(what, row.rule, row.flow, ref, at(ref).flow, SERVED, true);
  }
  return r => rows.map(row => {
    const f = flowAvg(r, row.flow);
    const out = { truckShare: row.truckShare, rule: row.rule, runs: f.runs, servedPerH: f.servedPerH, servedPerHSd: f.servedPerHSd, speedKmh: f.speedKmh, tripDelay: f.tripDelay, waitP95: f.waitP95, hardPer1000km: f.hardPer1000km, collisionsTotal: f.collisionsTotal, tests: {} };
    for (const [key, runs] of Object.entries(row.tests || {})) out.tests[key] = incidentSummary(r, runs);
    return out;
  });
}

const GROUPS = {
  demand: groupDemand, incidents: groupIncidents, weather: groupWeather, theory: groupTheory,
  hybrid: groupHybrid,
  'objects-150': groupObjects('object 150 m ahead'),
  'objects-300': groupObjects('object 300 m ahead'),
  'objects-truck': groupObjects('load falls off a truck'),
  'safety-breakdown': groupSafety('breakdown'),
  'safety-brakes': groupSafety('sudden 50 % brake loss'),
  'safety-comms': groupSafety('vehicle comms loss'),
  sensors: groupSensors,
  'packet-loss': groupLoss,
  trucks: groupTrucks,
  today: groupToday,
  gates: groupGates,
  speed: groupSpeed,
  'truck-rule': groupTruckRule,
};

// ------------------------------------------------------------------ report
const f0 = v => num(v) ? Math.round(v).toLocaleString('en-US') : '–';
const f1 = v => num(v) ? v.toFixed(1) : '–';
const f2 = v => num(v) ? v.toFixed(2) : '–';
const pm = (v, s) => num(s) ? `${f0(v)} ± ${f0(s)}` : f0(v);          // mean ± standard deviation between runs
const pm1 = (v, s) => num(s) ? `${f1(v)} ± ${f1(s)}` : f1(v);
const bg = r => r.bgCollisions === undefined ? '' : ` (${r.bgCollisions})`;
const waits = (p50, p95) => `${f0(p50)} / ${f0(p95)}`;
const fx = v => !num(v) ? '–' : Math.abs(v) >= 100 ? f0(v) : Math.abs(v) >= 10 ? f1(v) : f2(v);
const WAIT_NOTE = 'Trip delay = time from arriving at the entry (including waiting at a gate) to leaving the corridor, minus free-flow time. Waits are those of every vehicle let in during the measuring time, plus the vehicles still waiting at the end with their wait so far; on today\'s road the "gate" is the queue to get onto a full road. Once demand is above what a road can carry, the queue and the waits grow for as long as the run lasts.';
const GROUP_TITLES = {
  demand: 'Throughput and delay vs demand (section 1)', incidents: 'Incidents (section 2)', hybrid: 'Hybrid separation variants (section 3)',
  'objects-150': 'Object 150 m ahead (section 4)', 'objects-300': 'Object 300 m ahead (section 4)', 'objects-truck': 'Load falls off a truck (section 4)',
  'safety-breakdown': 'Safety lane: breakdown (section 5)', 'safety-brakes': 'Safety lane: brake loss (section 5)', 'safety-comms': 'Safety lane: radio loss (section 5)',
  gates: 'Gate and merge rules (section 12)', speed: 'Speed under pressure (section 13)', 'truck-rule': 'Cheaper truck rules (section 14)',
  sensors: 'Road-sensor outage (section 6)', weather: 'Weather (section 7)', 'packet-loss': 'Radio packet loss (section 9)', trucks: 'Truck share (section 10)',
};

function report(res) {
  const meta = res._meta || {};
  const L = [];
  const head = name => {       // one line saying how the section's data was produced
    const m = meta[name];
    if (!m) return '';
    const more = m.moreFlow > m.flowSeeds ? ` Rows in a comparison that was within the noise were extended to ${m.moreFlow} and ${m.moreInc} runs (last section).` : '';
    return `*${m.quick ? 'Quick run' : 'Full run'} of ${m.date}: ${m.flowSeeds} runs per throughput row, ${m.incidentSeeds} per incident row.${more}*`;
  };
  L.push('# SDR simulator: experiment results', '');
  L.push('Corridor: 5 km, 3 lanes, on-ramp merging at 2.0–2.3 km, off-ramp at 3.5 km (20 % of vehicles exit), 10 % trucks.');
  L.push('"Today" is the same corridor with 100 % human drivers; every SDR row is 100 % SDR-guided vehicles.');
  L.push('Hybrid separation (recommended, and the simulator default) = relative, plus an absolute gap behind trucks, behind any vehicle that reports a fault, and in/just before a segment whose road sensors are down. Platoon breaks are off (section 3 shows why).');
  L.push('"±" is the standard deviation between runs with different traffic (seeds). Whether a difference between two rows is real is worked out per seed, because both rows get the same traffic: see the last section.', '');

  if (res.demand) {
    L.push('## 1. Throughput and delay vs demand', '', head('demand'), '');
    L.push('Ramp demand 900 veh/h in all runs. Warm-up 5 min, then measured (15 min in a full run, 5 min in a quick run).', '');
    L.push('| System | Main demand (veh/h) | Served (veh/h) | Let in: main + ramp (veh/h) | Mean speed (km/h) | Trip delay, mean (s) | Wait at main entry: median / 95th pct (s) | Wait at on-ramp: median / 95th pct (s) | Longest wait (s) | Queue at end: main + ramp | Collisions (all runs) | Hard brakes / 1000 veh-km | Braking loss (Wh/veh-km) |');
    L.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
    for (const r of res.demand) L.push(`| ${r.system} | ${f0(r.demandMain)} | ${pm(r.servedPerH, r.servedPerHSd)} | ${f0(r.inMainPerH)} + ${f0(r.inRampPerH)} | ${f0(r.speedKmh)} | ${pm(r.tripDelay, r.tripDelaySd)} | ${waits(r.waitMainP50, r.waitMainP95)} | ${waits(r.waitRampP50, r.waitRampP95)} | ${f0(r.waitMax)} | ${f0(r.queueMain)} + ${f0(r.queueRamp)} | ${r.collisionsTotal} | ${f0(r.hardPer1000km)} | ${f1(r.brakeWhPerKm)} |`);
    L.push('', WAIT_NOTE, '');
  }
  if (res.incidents) {
    L.push('## 2. Incidents', '', head('incidents'), '');
    L.push('Main demand 4,200 veh/h + ramp 600 veh/h. Incident at t = 10 min around x = 3 km, observed for 5 min. "Brick-wall stop": a vehicle hits something no sensor saw and stops within about a second. "Sudden 50 % brake loss": the brakes of one vehicle halve; SDR health monitoring reports it after 0.5 s (sooner once it brakes); a human driver is not told. Numbers in brackets: the same traffic over the same 5 minutes without the incident.', '');
    L.push('| Incident | System | Runs | Runs with a collision | Collisions (without incident) | Worst impact (km/h) | Guardian activations | Safe stops | Supervision brakes | Hard brakes per run (without incident) |');
    L.push('|---|---|---|---|---|---|---|---|---|---|');
    for (const r of res.incidents) {
      if (!r.runs) { L.push(`| ${r.incident} | ${r.system} | n/a | | | | | | | |`); continue; }
      L.push(`| ${r.incident} | ${r.system} | ${r.runs} | ${r.runsWithCollision} | ${r.collisions}${bg(r)} | ${f0(r.maxImpactKmh)} | ${r.guardian} | ${r.safeStops} | ${r.supervision} | ${f0(r.hardBrakes)} (${f0(r.bgHardBrakes)}) |`);
    }
    L.push('');
  }
  if (res.hybrid) {
    L.push('## 3. Hybrid separation variants', '', head('hybrid'), '');
    L.push('Capacity: main 7,200 + ramp 900 veh/h (more than any variant can carry). Safety: runs at 4,200 + 600 veh/h; "load falls off a truck" drops an object just behind a truck that has a vehicle within 150 m behind it.', '');
    L.push('| Variant | Served (veh/h) | Mean speed (km/h) | Trip delay (s) | Brick-wall stop: runs with collision / collisions / worst (km/h) | Lost load: runs with collision / collisions / worst (km/h) | Lost load: mean gap of the follower (m) |');
    L.push('|---|---|---|---|---|---|---|');
    for (const r of res.hybrid) L.push(`| ${r.variant} | ${pm(r.servedPerH, r.servedPerHSd)} | ${f0(r.speedKmh)} | ${f0(r.tripDelay)} | ${r.brick.runsWithCollision} of ${r.brick.runs} / ${r.brick.collisions} / ${f0(r.brick.maxImpactKmh)} | ${r.load.runsWithCollision} of ${r.load.runs} / ${r.load.collisions} / ${f0(r.load.maxImpactKmh)} | ${f0(r.load.gap)} |`);
    L.push('');
  }
  const objKeys = ['objects-150', 'objects-300', 'objects-truck'].filter(k => res[k]);
  if (objKeys.length) {
    L.push('## 4. Detection layers vs foreign objects', '', head(objKeys[0]), '');
    L.push('An object that stops a vehicle dead (worst case) appears in lane 2 at 4,200 + 600 veh/h, observed for 4 minutes. Road cameras confirm an object after 0.5 s; each vehicle\'s own sensor sees it within 120 m with the stated probability (rolled per vehicle); "shared" means the detecting vehicle reports it to the road (confirmed one control cycle later) and with V2V also directly to nearby vehicles.', '');
    L.push('| Scenario | Detection layers | Policy | Runs with a collision | Collisions | Vehicles that hit the object | Worst impact (km/h) | Mean distance of first vehicle (m) |');
    L.push('|---|---|---|---|---|---|---|---|');
    for (const k of objKeys) for (const r of res[k]) {
      if (!r.runs) { L.push(`| ${r.scenario} | ${r.layers} | ${r.policy} | n/a | | | | |`); continue; }
      L.push(`| ${r.scenario} | ${r.layers} | ${r.policy} | ${r.runsWithCollision} of ${r.runs} | ${r.collisions}${bg(r)} | ${r.objectHits} | ${f0(r.maxImpactKmh)} | ${f0(r.gap)} |`);
    }
    L.push('', 'Numbers in brackets (human rows): collisions in the same traffic without the object.', '');
  }
  const safKeys = ['safety-breakdown', 'safety-brakes', 'safety-comms'].filter(k => res[k]);
  if (safKeys.length) {
    L.push('## 5. Safety lane (hard shoulder)', '', head(safKeys[0]), '');
    L.push('4,200 + 600 veh/h, observed for 20 minutes (10 in a quick run). A broken-down vehicle loses propulsion and is towed 15 minutes after it stops. Extra delay = vehicle-hours spent in the system in that time minus the same traffic without the incident. Collisions in brackets: the same traffic without the incident.', '');
    L.push('| Incident | System | Runs | Collisions (without incident) | Worst impact (km/h) | Sent to safety lane (per run) | Vehicle stopped in a live lane (s per run) | Extra delay (vehicle-hours) |');
    L.push('|---|---|---|---|---|---|---|---|');
    for (const k of safKeys) for (const r of res[k]) {
      if (!r.runs) { L.push(`| ${r.incident} | ${r.system} | n/a | | | | | |`); continue; }
      L.push(`| ${r.incident} | ${r.system} | ${r.runs} | ${r.collisions}${bg(r)} | ${f0(r.maxImpactKmh)} | ${f1(r.sidetracked)} | ${f0(r.liveLaneStopS)} | ${pm1(r.extraVehH, r.extraVehHSd)} |`);
    }
    L.push('');
  }
  if (res.sensors) {
    L.push('## 6. Road-sensor outage (hybrid falls back to absolute locally)', '', head('sensors'), '');
    L.push('| Demand (veh/h) | Road sensors | Served (veh/h) | Trip delay (s) | Queue at gates (end) | Collisions (all runs) |');
    L.push('|---|---|---|---|---|---|');
    for (const r of res.sensors) L.push(`| ${r.demand} | ${r.state} | ${pm(r.servedPerH, r.servedPerHSd)} | ${f0(r.tripDelay)} | ${f0(r.queueEnd)} | ${r.collisionsTotal} |`);
    L.push('');
  }
  if (res.weather) {
    L.push('## 7. Weather', '', head('weather'), '');
    L.push('Main demand 3,600 veh/h + ramp 600 veh/h.', '');
    L.push('| Weather | System | Served (veh/h) | Mean speed (km/h) | Trip delay (s) | Queue at gates (end) | Collisions (all runs) | Hard brakes / 1000 veh-km |');
    L.push('|---|---|---|---|---|---|---|---|');
    for (const r of res.weather) L.push(`| ${r.weather} | ${r.system} | ${pm(r.servedPerH, r.servedPerHSd)} | ${f0(r.speedKmh)} | ${f0(r.tripDelay)} | ${f0(r.queueEnd)} | ${r.collisionsTotal} | ${f0(r.hardPer1000km)} |`);
    L.push('');
  }
  if (res.theory) {
    L.push('## 8. Theoretical lane capacity (veh/h per lane, car lengths)', '');
    L.push('The hybrid row assumes 10 % of followers keep an absolute gap (those behind trucks).', '');
    L.push('| Weather | Policy | 40 km/h | 60 km/h | 80 km/h | 100 km/h | 120 km/h | Capacity-optimal speed |');
    L.push('|---|---|---|---|---|---|---|---|');
    for (const r of res.theory) {
      L.push(`| ${r.weather} | SDR absolute | ${[40, 60, 80, 100, 120].map(k => f0(r[`abs@${k}`])).join(' | ')} | ${f0(r.absOpt)} km/h |`);
      L.push(`| ${r.weather} | SDR hybrid (absolute behind the 10 % trucks) | ${[40, 60, 80, 100, 120].map(k => f0(r[`hyb@${k}`])).join(' | ')} | ${f0(r.hybOpt)} km/h |`);
      L.push(`| ${r.weather} | SDR relative | ${[40, 60, 80, 100, 120].map(k => f0(r[`rel@${k}`])).join(' | ')} | ${f0(r.relOpt)} km/h |`);
      L.push(`| ${r.weather} | Human (${SDR.HUMAN.T} s headway) | ${[40, 60, 80, 100, 120].map(k => f0(r[`hum@${k}`])).join(' | ')} | – |`);
    }
    L.push('');
  }
  if (res['packet-loss']) {
    L.push('## 9. Radio packet loss', '', head('packet-loss'), '');
    L.push('SDR hybrid at 7,200 + 900 veh/h (saturated). "Fixed gaps": every vehicle keeps the standard allowance for stale authority (about two control cycles). "Widened gaps": the road measures the loss rate and adds the allowance shown, so a run of lost messages rarely outlasts it. A supervision brake is full-force braking because the last authority received is about to run out. Smallest spare = the least distance, over all vehicles and runs, between where a vehicle could still stop and the end of its authority (negative would mean an overrun).', '');
    L.push('| Packet loss | Gaps | Extra allowance (s) | Served (veh/h) | Supervision brakes per run | Safe stops per run | Hard brakes / 1000 veh-km | Collisions (all runs) | Smallest spare (m) |');
    L.push('|---|---|---|---|---|---|---|---|---|');
    for (const r of res['packet-loss']) L.push(`| ${f0(r.packetLoss * 100)} % | ${r.adaptive ? 'widened' : 'fixed'} | ${f2(r.allowance)} | ${pm(r.servedPerH, r.servedPerHSd)} | ${f0(r.supervision)} | ${f0(r.safeStops)} | ${f0(r.hardPer1000km)} | ${r.collisionsTotal} | ${f2(r.minSpare)} |`);
    L.push('');
  }
  if (res.trucks) {
    L.push('## 10. Truck share', '', head('trucks'), '');
    L.push('Main 7,200 + ramp 900 veh/h (saturated). The hybrid keeps an absolute gap behind every truck, so its cost grows with the truck share.', '');
    L.push('| Trucks | System | Served (veh/h) | Mean speed (km/h) | Trip delay (s) | Collisions (all runs) |');
    L.push('|---|---|---|---|---|---|');
    for (const r of res.trucks) L.push(`| ${f0(r.truckShare * 100)} % | ${r.system} | ${pm(r.servedPerH, r.servedPerHSd)} | ${f0(r.speedKmh)} | ${f0(r.tripDelay)} | ${r.collisionsTotal} |`);
    L.push('');
  }
  if (res.today) {
    L.push('## 11. Today\'s road on its own (calibration check)', '', head('today'), '');
    L.push('Does the human baseline behave like a real motorway? Reference values: the Highway Capacity Manual gives 2,400 passenger cars per hour per lane under ideal conditions, and queue discharge after a breakdown of about 2,000–2,300; with 10 % trucks that is roughly 6,500 veh/h (capacity) and 5,450–6,300 veh/h (discharge) for three lanes.', '');
    L.push('| Road | Demand (veh/h) | Served (veh/h) | Served % | Mean speed (km/h) | Hard brakes / 1000 veh-km | Missed exits (%) | Collisions (all runs) |');
    L.push('|---|---|---|---|---|---|---|---|');
    for (const r of res.today) L.push(`| ${r.road} | ${r.demand} | ${pm(r.servedPerH, r.servedPerHSd)} | ${f0(r.servedPct)} | ${f0(r.speedKmh)} | ${f0(r.hardPer1000km)} | ${f1(r.missedPct)} | ${r.collisionsTotal} |`);
    L.push('');
  }
  if (res.gates) {
    L.push('## 12. Gate and merge rules', '', head('gates'), '');
    L.push('SDR hybrid, ramp demand 900 veh/h. Rows 1 to 5 add one change at a time to the merge and the gates; the last four vary one rule around row 5. "Let in" shows which entry the traffic came through: about 970 vehicles an hour arrive at the on-ramp.', '');
    L.push('| Main demand (veh/h) | Rules | Served (veh/h) | Let in: main + ramp (veh/h) | Trip delay, mean (s) | Wait at main entry: median / 95th pct (s) | Wait at on-ramp: median / 95th pct (s) | Longest wait (s) | Queue at end: main + ramp | Mean speed (km/h) | Hard brakes / 1000 veh-km | Collisions (all runs) |');
    L.push('|---|---|---|---|---|---|---|---|---|---|---|---|');
    for (const r of res.gates) L.push(`| ${f0(r.demandMain)} | ${r.variant} | ${pm(r.servedPerH, r.servedPerHSd)} | ${f0(r.inMainPerH)} + ${f0(r.inRampPerH)} | ${pm(r.tripDelay, r.tripDelaySd)} | ${waits(r.waitMainP50, r.waitMainP95)} | ${waits(r.waitRampP50, r.waitRampP95)} | ${f0(r.waitMax)} | ${f0(r.queueMain)} + ${f0(r.queueRamp)} | ${f0(r.speedKmh)} | ${f1(r.hardPer1000km)} | ${r.collisionsTotal} |`);
    L.push('', WAIT_NOTE, '');
  }
  if (res.speed) {
    L.push('## 13. Speed under pressure', '', head('speed'), '');
    L.push('Ramp demand 900 veh/h. "Adaptive" lowers the speed limit to the speed at which a lane carries most in theory (about 80 km/h for the hybrid, 96 km/h for relative) once more than 8 vehicles wait at the gates, and raises it again when fewer than 3 wait. Trucks drive 90 km/h at most in every row. Trip time is from arriving at the entry to leaving the corridor, waiting at a gate included; it is used here in place of trip delay, because delay is counted against the speed limit of the row and would flatter the slow rows.', '');
    L.push('| System | Main demand (veh/h) | Speed rule | Served (veh/h) | Mean speed (km/h) | Speed limit at the end (km/h) | Trip time, mean (s) | Wait, 95th pct (s) | Queue at end: main + ramp | Hard brakes / 1000 veh-km | Braking loss (Wh/veh-km) | Collisions (all runs) |');
    L.push('|---|---|---|---|---|---|---|---|---|---|---|---|');
    for (const r of res.speed) L.push(`| ${r.system} | ${f0(r.demandMain)} | ${r.speed} | ${pm(r.servedPerH, r.servedPerHSd)} | ${f0(r.speedKmh)} | ${f0(r.vLimitKmh)} | ${pm(r.tripTime, r.tripTimeSd)} | ${f0(r.waitP95)} | ${f0(r.queueMain)} + ${f0(r.queueRamp)} | ${f1(r.hardPer1000km)} | ${f1(r.brakeWhPerKm)} | ${r.collisionsTotal} |`);
    L.push('');
  }
  if (res['truck-rule']) {
    const tr = res['truck-rule'];
    const cell = t => !t ? '' : !t.runs ? 'n/a' : `${t.runsWithCollision} of ${t.runs} / ${t.collisions} / ${f0(t.maxImpactKmh)}`;
    const cmpTR = ((res._cmp || {})['truck-rule'] || []);
    const vsToday = r => { const c = cmpTR.find(x => x.a === r.rule && x.b === TODAY && x.what === `${f0(r.truckShare * 100)} % trucks`); return c ? `${c.pct >= 0 ? '+' : '−'}${f1(Math.abs(c.pct))} % (${c.verdict})` : ''; };
    L.push('## 14. Cheaper truck rules', '', head('truck-rule'), '');
    L.push('Capacity: main 7,200 + ramp 900 veh/h (saturated), SDR hybrid with one change to the rule that keeps a brick-wall gap behind every truck. Lost load: at 4,200 + 600 veh/h an object lands just behind a truck that has a vehicle within 150 m behind it. Only the road sensors count in these tests (they see every object, after the time stated; car sensors are switched off), so that the gap is tested against the confirmation time. Each lost-load cell is: runs with a collision / collisions / worst impact (km/h).', '');
    L.push('| Trucks | Truck rule | Served (veh/h) | Against today\'s road | Mean speed (km/h) | Hard brakes / 1000 veh-km | Lost load stops dead, confirmed in 0.5 s | Stops dead, confirmed in 1 s | Slides at 6 m/s², confirmed in 1 s | Special case |');
    L.push('|---|---|---|---|---|---|---|---|---|---|');
    for (const r of tr) {
      const t = r.tests || {};
      const special = t.secure ? `enclosed truck loses a load anyway: ${cell(t.secure)}` : t.truck ? `follower is a truck: ${cell(t.truck)}` : '';
      L.push(`| ${f0(r.truckShare * 100)} % | ${r.rule} | ${pm(r.servedPerH, r.servedPerHSd)} | ${vsToday(r)} | ${f0(r.speedKmh)} | ${f1(r.hardPer1000km)} | ${cell(t.dead05)} | ${cell(t.dead10)} | ${cell(t.slide10)} | ${special} |`);
    }
    L.push('', 'The extra lost-load tests (1 s, sliding load, special cases) were run at 20 % trucks only. In the "a" rows the load falls off a truck that still has the long gap behind it; the special case shows what happens if an exempted truck loses something after all.', '');
  }
  const cmp = res._cmp || {};
  const cmpKeys = Object.keys(GROUP_TITLES).filter(k => res[k] && cmp[k] && cmp[k].length);
  if (cmpKeys.length) {
    L.push('## 15. Which differences are real', '');
    L.push('Both rows of a comparison were run with the same seeds, so they saw the same traffic. The difference is taken per seed and averaged; the interval is its 95 % confidence interval (Student\'s t). "Outside the noise" means the interval does not include zero. "Within the noise" means these runs cannot tell the two apart: the true difference is probably inside the interval, and may be zero. A comparison that was within the noise after the standard number of runs was extended once, to the number of runs shown, and is reported as it then stood. An incident row that is compared with a row extended in this way gets the same number of runs, so that collision counts are compared like against like. With this many comparisons, about one in twenty of those near the boundary will be on the wrong side by chance.', '');
    for (const k of cmpKeys) {
      L.push(`### ${GROUP_TITLES[k]}`, '');
      L.push('| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |');
      L.push('|---|---|---|---|---|---|---|---|---|---|');
      for (const c of cmp[k]) L.push(`| ${c.what} | ${c.a} | ${c.b} | ${c.measure} | ${c.n} | ${fx(c.a_)} | ${fx(c.b_)} | ${fx(c.diff)}${num(c.pct) && c.b_ > 0 ? ` (${c.pct >= 0 ? '+' : '−'}${f0(Math.abs(c.pct))} %)` : ''} | ${fx(c.lo)} to ${fx(c.hi)} | ${c.verdict} |`);
      L.push('');
    }
  }
  return L.join('\n');
}

// ------------------------------------------------------------------ main / worker
if (!isMainThread) {
  parentPort.on('message', ({ id, kind, args }) => parentPort.postMessage({ id, result: TASKS[kind](...args) }));
} else if (require.main === module) {
  const t0 = Date.now();
  const unknown = ONLY.filter(n => !GROUPS[n]);
  if (unknown.length) { console.error(`Unknown group(s): ${unknown.join(', ')}. Available: ${Object.keys(GROUPS).join(', ')}`); process.exit(1); }
  const names = Object.keys(GROUPS).filter(n => !ONLY.length || ONLY.includes(n));
  const dir = path.join(__dirname, 'results');
  fs.mkdirSync(dir, { recursive: true });
  // keep results of groups not re-run
  let res = {};
  try { if (ONLY.length) res = JSON.parse(fs.readFileSync(path.join(dir, 'results.json'), 'utf8')); } catch (e) { res = {}; }
  res._meta = res._meta || {};

  const plans = names.map(name => { const p = makePlan(); return { name, p, build: GROUPS[name](p), out: [], ran: 0 }; });
  const nWorkers = Math.max(1, os.cpus().length - 1);
  const cost = q => q.kind === 'flow' ? q.args[1] + q.args[2] : (Object.assign({}, INC_DEFAULTS, q.args[q.kind === 'incident' ? 3 : 2])).warmup + (Object.assign({}, INC_DEFAULTS, q.args[q.kind === 'incident' ? 3 : 2])).observe;

  // run every task that has been planned but not run yet, on a pool of worker threads
  const runNew = () => new Promise(resolve => {
    const queue = [];
    plans.forEach((g, gi) => { for (let ti = g.ran; ti < g.p.tasks.length; ti++) queue.push({ gi, ti, kind: g.p.tasks[ti].kind, args: g.p.tasks[ti].args }); g.ran = g.p.tasks.length; });
    queue.sort((a, b) => cost(b) - cost(a));              // long runs first, so the pool stays busy to the end
    const total = queue.length;
    if (!total) return resolve(0);
    console.error(`  ${total} simulation runs on ${Math.min(total, nWorkers)} worker threads`);
    let next = 0, done = 0, failed = false;
    const workers = [];
    const stop = () => { for (const w of workers) w.terminate(); };
    for (let k = 0; k < Math.min(total, nWorkers); k++) {
      const w = new Worker(__filename, { argv: process.argv.slice(2) });
      workers.push(w);
      let current = null;
      const feed = () => {
        if (next >= total) return;
        current = queue[next++];
        w.postMessage({ id: 0, kind: current.kind, args: current.args });
      };
      w.on('message', ({ result }) => {
        plans[current.gi].out[current.ti] = result;
        done++;
        if (done % Math.max(1, Math.floor(total / 20)) === 0) console.error(`  ${done}/${total} runs, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
        if (done === total) { stop(); resolve(total); } else feed();
      });
      w.on('error', e => { if (failed) return; failed = true; console.error(e); stop(); process.exit(1); });
      feed();
    }
  });

  const finish = () => {
    const date = new Date().toISOString().slice(0, 16).replace('T', ' ');
    res._cmp = res._cmp || {};
    for (const g of plans) {
      res[g.name] = g.build(g.out);
      res._cmp[g.name] = g.p.comparisons.flatMap(c => compareStats(c, g.out));
      res._meta[g.name] = { date, quick: QUICK, flowSeeds: SEEDS_FLOW.length, incidentSeeds: SEEDS_INC.length, moreFlow: MORE_FLOW, moreInc: MORE_INC };
    }
    fs.writeFileSync(path.join(dir, 'results.json'), JSON.stringify(res, null, 1));   // data first: a report bug must not lose a long run
    const text = report(res);
    fs.writeFileSync(path.join(dir, 'results.md'), text);
    console.log(text);
    console.error(`done in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  };

  (async () => {
    console.error(`${names.length} group(s)${QUICK ? ' (quick)' : ''}`);
    await runNew();
    // second stage: more seeds for the rows of every comparison that is within the noise (one fixed step)
    let extra = 0, within = 0;
    const open = [];                                       // judge all of them first: rows are shared between comparisons
    for (const g of plans) for (const c of g.p.comparisons) if (!c.fixed && compareStats(c, g.out).some(st => st.verdict === 'within the noise')) open.push(c);
    for (const c of open) {
      within++;
      extra += c.runsA.extendTo(c.runsA.more) + c.runsB.extendTo(c.runsB.more);
    }
    if (extra) {
      console.error(`${within} comparison(s) within the noise: adding seeds`);
      await runNew();
    }
    // third stage, incident rows only: a count of rare events from the standard number of runs can look
    // significant by chance. Where one row of a comparison now has more runs than the other (it was extended
    // for another comparison), the other row gets the same number, so the table shows like against like.
    let topped = 0;
    for (let again = true; again;) {
      again = false;
      for (const g of plans) for (const c of g.p.comparisons) {
        if (c.fixed || !c.runsA.incident || !c.runsB.incident) continue;
        const n = Math.max(c.runsA.length, c.runsB.length);
        const k = c.runsA.extendTo(n) + c.runsB.extendTo(n);
        if (k) { topped += k; again = true; }
      }
    }
    if (topped) {
      console.error(`incident rows with fewer runs than the row they are compared with: adding ${topped} seed(s)`);
      await runNew();
    }
    finish();
  })();
}

module.exports = { runFlow, runIncident, runBaseline, GROUPS, report, pairedStat };
