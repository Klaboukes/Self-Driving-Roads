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

const SYSTEMS = {
  'Today (human drivers)':          { mode: 'human' },
  'SDR, absolute separation':       { mode: 'sdr', separation: 'absolute' },
  'SDR, absolute + adaptive speed': { mode: 'sdr', separation: 'absolute', speedPolicy: 'adaptive' },
  'SDR, relative separation':       { mode: 'sdr', separation: 'relative' },
  'SDR, hybrid separation':         { mode: 'sdr', separation: 'hybrid' },
};
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
  return {
    flow: s.flow,
    servedPerH: served / measure * 3600,
    servedPct: arrived > 0 ? 100 * served / arrived : 100,
    speedKmh: speedN ? speedSum / speedN * 3.6 : NaN,
    tripDelay: s.tripDelay,
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
function dropFromTruck(w, x) {
  let best = null, bd = Infinity;
  for (const v of w.vehicles) {
    if (v.type !== 'truck' || v.lane < 0 || v.lane >= w.S || v.laneTo !== null || v.v < 15) continue;
    const fol = w._behind(v.lane, v.x - v.length, v, false);
    if (!fol || fol.isObstacle || v.x - v.length - fol.x > 150) continue;
    const d = Math.abs(v.x - x);
    if (d < bd) { bd = d; best = { truck: v, fol }; }
  }
  if (!best) return null;
  const o = w.addDebris(best.truck.x - best.truck.length - 2, best.truck.lane);
  return { o, gap: o.x - o.length - best.fol.x };
}

// time spent in the system (driving or waiting at a gate) by all vehicles within [t0, now]
function vehicleSeconds(w, t0) {
  let s = 0;
  for (const tr of w.m.trips) if (tr.t >= t0) s += tr.t - Math.max(tr.t - tr.time, t0);
  for (const v of w.vehicles.concat(w.mainQueue, w.rampQueue)) s += w.t - Math.max(v.tArrive, t0);
  return s;
}

function applyIncident(w, kind, cfg) {
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
    case 'load falls off a truck': { const r = dropFromTruck(w, 3000); return r ? { gap: r.gap } : null; }
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
  const info = applyIncident(w, kind, cfg);
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
  const tasks = [], seen = new Map();
  return {
    tasks,
    add(kind, ...args) { tasks.push({ kind, args }); return tasks.length - 1; },
    unique(kind, ...args) {
      const key = kind + JSON.stringify(args);
      if (!seen.has(key)) seen.set(key, this.add(kind, ...args));
      return seen.get(key);
    },
  };
}
// one table row of incident runs: every seed, optionally paired with the same traffic without the incident
function incidentRuns(p, cfg, kind, opts, paired) {
  return SEEDS_INC.map(seed => ({
    inc: p.add('incident', cfg, kind, seed, opts),
    base: paired ? p.unique('baseline', cfg, seed, opts) : -1,
  }));
}
function incidentSummary(r, runs) {
  const res = [];
  for (const { inc, base } of runs) {
    if (!r[inc].applicable) continue;
    res.push(base >= 0 ? Object.assign({ base: r[base] }, r[inc]) : r[inc]);
  }
  return res.length ? summarise(res) : { runs: 0 };
}
const flowRuns = (p, cfg, pre) => SEEDS_FLOW.map(seed => p.add('flow', Object.assign({ seed }, cfg), WARM, MEAS, pre));
const flowAvg = (r, runs) => avg(runs.map(i => r[i]));

// ------------------------------------------------------------------ experiment groups
// Each group: (plan) -> function(results) -> rows
const DEMANDS = QUICK ? [3600, 6000] : [2400, 3600, 4800, 6000, 7200];
function groupDemand(p) {
  const rows = [];
  for (const [name, sys] of Object.entries(SYSTEMS)) for (const dm of DEMANDS)
    rows.push({ system: name, demandMain: dm, demandRamp: 900, runs: flowRuns(p, Object.assign({ demandMain: dm, demandRamp: 900 }, sys)) });
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
  return r => rows.map(({ runs, ...m }) => ({ ...m, ...incidentSummary(r, runs) }));
}

function groupWeather(p) {
  const rows = [];
  for (const [label, friction] of [['dry', 1.0], ['wet', 0.7], ['ice', 0.3]])
    for (const [name, sys] of Object.entries(SYSTEMS))
      rows.push({ weather: label, system: name, runs: flowRuns(p, Object.assign({ friction, demandMain: 3600, demandRamp: 600 }, sys)) });
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
    return r => rows.map(({ runs, ...m }) => ({ ...m, ...incidentSummary(r, runs) }));
  };
}

// road sensors down in one segment: hybrid falls back to absolute there
function groupSensors(p) {
  const rows = [];
  for (const [dm, dr] of [[4200, 600], [7200, 900]])
    for (const [label, seg] of [['all sensors up', -1], ['down at the on-ramp merge (2–3 km)', 2], ['down on a plain stretch (4–5 km)', 4]])
      rows.push({ demand: `${dm} + ${dr}`, state: label, runs: flowRuns(p, { mode: 'sdr', separation: 'hybrid', demandMain: dm, demandRamp: dr }, { sensorsDown: seg }) });
  return r => rows.map(({ runs, ...m }) => ({ ...m, ...flowAvg(r, runs) }));
}

// radio packet loss: fixed gaps vs gaps the road widens to the loss it measures
function groupLoss(p) {
  const rows = [];
  for (const adaptive of [false, true]) for (const loss of QUICK ? [0, 0.2] : [0, 0.01, 0.05, 0.1, 0.2, 0.5])
    rows.push({ packetLoss: loss, adaptive, runs: flowRuns(p, Object.assign({ mode: 'sdr', separation: 'hybrid', packetLoss: loss, lossAdaptive: adaptive }, SAT)) });
  return r => rows.map(({ runs, ...m }) => ({ ...m, ...flowAvg(r, runs) }));
}

// truck share: the hybrid rule (absolute gap behind trucks) costs more the more trucks there are
function groupTrucks(p) {
  const rows = [];
  const systems = { 'Today (human drivers)': SYSTEMS['Today (human drivers)'], 'SDR, relative separation': SYSTEMS['SDR, relative separation'], 'SDR, hybrid separation': SYSTEMS['SDR, hybrid separation'] };
  for (const share of QUICK ? [0, 0.3] : [0, 0.1, 0.2, 0.3]) for (const [name, sys] of Object.entries(systems))
    rows.push({ truckShare: share, system: name, runs: flowRuns(p, Object.assign({ truckShare: share }, SAT, sys)) });
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
};

// ------------------------------------------------------------------ report
const f0 = v => num(v) ? Math.round(v).toLocaleString('en-US') : '–';
const f1 = v => num(v) ? v.toFixed(1) : '–';
const f2 = v => num(v) ? v.toFixed(2) : '–';
const pm = (v, s) => num(s) ? `${f0(v)} ± ${f0(s)}` : f0(v);          // mean ± standard deviation between runs
const pm1 = (v, s) => num(s) ? `${f1(v)} ± ${f1(s)}` : f1(v);
const bg = r => r.bgCollisions === undefined ? '' : ` (${r.bgCollisions})`;

function report(res) {
  const meta = res._meta || {};
  const L = [];
  const head = name => {       // one line saying how the section's data was produced
    const m = meta[name];
    return m ? `*${m.quick ? 'Quick run' : 'Full run'} of ${m.date}: ${m.flowSeeds} runs per throughput row, ${m.incidentSeeds} per incident row.*` : '';
  };
  L.push('# SDR simulator: experiment results', '');
  L.push('Corridor: 5 km, 3 lanes, on-ramp merging at 2.0–2.3 km, off-ramp at 3.5 km (20 % of vehicles exit), 10 % trucks.');
  L.push('"Today" is the same corridor with 100 % human drivers; every SDR row is 100 % SDR-guided vehicles.');
  L.push('Hybrid separation (recommended, and the simulator default) = relative, plus an absolute gap behind trucks, behind any vehicle that reports a fault, and in/just before a segment whose road sensors are down. Platoon breaks are off (section 3 shows why).');
  L.push('"±" is the standard deviation between runs with different traffic (seeds). Differences smaller than that are noise.', '');

  if (res.demand) {
    L.push('## 1. Throughput and delay vs demand', '', head('demand'), '');
    L.push('Ramp demand 900 veh/h in all runs. Warm-up 5 min, then measured (15 min in a full run, 5 min in a quick run).', '');
    L.push('| System | Main demand (veh/h) | Served (veh/h) | Served % | Mean speed (km/h) | Trip delay (s) | Queue at gates (end) | Max gate wait (s) | Collisions (all runs) | Hard brakes / 1000 veh-km | Braking loss (Wh/veh-km) |');
    L.push('|---|---|---|---|---|---|---|---|---|---|---|');
    for (const r of res.demand) L.push(`| ${r.system} | ${f0(r.demandMain)} | ${pm(r.servedPerH, r.servedPerHSd)} | ${f0(r.servedPct)} | ${f0(r.speedKmh)} | ${pm(r.tripDelay, r.tripDelaySd)} | ${f0(r.queueEnd)} | ${f0(r.maxWait)} | ${r.collisionsTotal} | ${f0(r.hardPer1000km)} | ${f1(r.brakeWhPerKm)} |`);
    L.push('', 'Trip delay = time from arriving at the entry (including waiting at a gate) to leaving the corridor, minus free-flow time.', '');
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

  const plans = names.map(name => { const p = makePlan(); return { name, p, build: GROUPS[name](p), out: [] }; });
  const queue = [];
  plans.forEach((g, gi) => g.p.tasks.forEach((t, ti) => queue.push({ gi, ti, kind: t.kind, args: t.args })));
  // long runs first, so the pool stays busy to the end
  const cost = q => q.kind === 'flow' ? q.args[1] + q.args[2] : (Object.assign({}, INC_DEFAULTS, q.args[q.kind === 'incident' ? 3 : 2])).warmup + (Object.assign({}, INC_DEFAULTS, q.args[q.kind === 'incident' ? 3 : 2])).observe;
  queue.sort((a, b) => cost(b) - cost(a));
  const total = queue.length;
  console.error(`${names.length} group(s), ${total} simulation runs, ${Math.min(total, Math.max(1, os.cpus().length - 1))} worker threads${QUICK ? ' (quick)' : ''}`);

  const finish = () => {
    const date = new Date().toISOString().slice(0, 16).replace('T', ' ');
    for (const g of plans) {
      res[g.name] = g.build(g.out);
      res._meta[g.name] = { date, quick: QUICK, flowSeeds: SEEDS_FLOW.length, incidentSeeds: SEEDS_INC.length };
    }
    fs.writeFileSync(path.join(dir, 'results.json'), JSON.stringify(res, null, 1));   // data first: a report bug must not lose a long run
    const text = report(res);
    fs.writeFileSync(path.join(dir, 'results.md'), text);
    console.log(text);
    console.error(`done in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  };
  if (!total) finish();
  else {
    let next = 0, done = 0, failed = false;
    const workers = [];
    const stop = () => { for (const w of workers) w.terminate(); };
    for (let k = 0; k < Math.min(total, Math.max(1, os.cpus().length - 1)); k++) {
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
        if (done === total) { stop(); finish(); } else feed();
      });
      w.on('error', e => { if (failed) return; failed = true; console.error(e); stop(); process.exit(1); });
      feed();
    }
  }
}

module.exports = { runFlow, runIncident, runBaseline, GROUPS, report };
