/*
 * Headless experiments for the SDR simulator.
 *   node experiments.js                 -> runs everything, writes results/results.md and results/results.json
 *   node experiments.js --quick         -> fewer seeds, shorter runs (smoke test)
 *   node experiments.js --only=a,b      -> only these groups (see GROUPS)
 * Groups run in parallel worker threads.
 */
'use strict';
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const path = require('path');
const os = require('os');
const SDR = require('./engine.js');
const { World } = SDR;

const QUICK = process.argv.includes('--quick');
const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const SEEDS6 = QUICK ? [1, 2] : [1, 2, 3, 4, 5, 6];

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

// ------------------------------------------------------------------ single run helpers
function runFlow(cfg, warmup, measure) {
  const w = new World(cfg);
  w.run(warmup);
  const id0 = w.nextId, done0 = w.m.completed, hard0 = w.m.hardBrakes, dist0 = w.m.vehDist, brake0 = w.m.brakeEnergy, col0 = w.m.collisions;
  let speedSum = 0, speedN = 0;
  const n = Math.round(measure / 30);
  for (let i = 0; i < n; i++) {
    w.run(30);
    const s = w.stats(30);
    if (!isNaN(s.meanSpeed)) { speedSum += s.meanSpeed; speedN++; }
  }
  const s = w.stats(measure);
  const arrived = w.nextId - id0;
  const served = w.m.completed - done0;
  const km = (w.m.vehDist - dist0) / 1000;
  return {
    flow: s.flow,
    servedPerH: served / measure * 3600,
    servedPct: arrived > 0 ? 100 * served / arrived : 100,
    speedKmh: speedN ? speedSum / speedN * 3.6 : NaN,
    tripDelay: s.tripDelay,
    queueEnd: s.mainQueue + s.rampQueue,
    maxWait: s.maxQueueWait,
    collisions: w.m.collisions - col0,
    hardPer1000km: km > 0 ? 1000 * (w.m.hardBrakes - hard0) / km : 0,
    brakeWhPerKm: km > 0 ? ((w.m.brakeEnergy - brake0) * 1500 / 3600) / km : 0,
    missedExits: s.missedExits,
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

function runIncident(cfg, kind, seed, opts) {
  const o = Object.assign({ warmup: 600, observe: 300 }, opts || {});
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

function summarise(res) {
  const sum = k => res.reduce((a, r) => a + (r[k] || 0), 0);
  return {
    runs: res.length,
    runsWithCollision: res.filter(r => r.collisions > 0).length,
    collisions: sum('collisions'),
    objectHits: sum('objectHits'),
    maxImpactKmh: res.length ? Math.max(...res.map(r => r.maxImpactKmh)) : 0,
    guardian: sum('guardian'), safeStops: sum('safeStops'), supervision: sum('supervision'),
    hardBrakes: sum('hardBrakes') / res.length,
    sidetracked: sum('sidetracked') / res.length,
    liveLaneStopS: sum('liveLaneStopS') / res.length,
    clearance: mean(res.map(r => r.clearance)),
    gap: mean(res.map(r => r.gap)),
  };
}
function mean(a) { const v = a.filter(x => typeof x === 'number' && isFinite(x)); return v.length ? v.reduce((p, q) => p + q, 0) / v.length : NaN; }

// ------------------------------------------------------------------ experiment groups
function groupDemand() {
  const seeds = QUICK ? [1] : [1, 2];
  const demands = QUICK ? [3000, 6000] : [2400, 3600, 4800, 6000];
  const rows = [];
  for (const [name, sys] of Object.entries(SYSTEMS)) for (const dm of demands) {
    const acc = [];
    for (const seed of seeds) acc.push(runFlow(Object.assign({ seed, demandMain: dm, demandRamp: 900 }, sys), 300, QUICK ? 300 : 900));
    rows.push({ system: name, demandMain: dm, demandRamp: 900, ...avg(acc) });
  }
  return rows;
}

function groupIncidents() {
  const kinds = ['debris', 'brick-wall stop', 'vehicle comms loss', 'segment controller failure (60 s)', 'sudden 50 % brake loss'];
  const rows = [];
  for (const kind of kinds) for (const [name, sys] of Object.entries(SYSTEMS)) {
    if (name.includes('adaptive')) continue;
    const res = SEEDS6.map(seed => runIncident(Object.assign({ demandMain: 4200, demandRamp: 600 }, sys), kind, seed)).filter(r => r.applicable);
    rows.push(res.length ? { incident: kind, system: name, ...summarise(res) } : { incident: kind, system: name, runs: 0 });
  }
  return rows;
}

function groupWeather() {
  const seeds = QUICK ? [1] : [1, 2];
  const rows = [];
  for (const [label, friction] of [['dry', 1.0], ['wet', 0.7], ['ice', 0.3]]) {
    for (const [name, sys] of Object.entries(SYSTEMS)) {
      const acc = seeds.map(seed => runFlow(Object.assign({ seed, friction, demandMain: 3600, demandRamp: 600 }, sys), 300, QUICK ? 300 : 900));
      rows.push({ weather: label, system: name, ...avg(acc) });
    }
  }
  return rows;
}

function groupTheory() {
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
function groupHybrid() {
  const rows = [];
  const seeds = QUICK ? [1] : [1, 2];
  for (const [name, v] of Object.entries(HYBRID_VARIANTS)) {
    const sys = Object.assign({ mode: 'sdr' }, v);
    const flow = avg(seeds.map(seed => runFlow(Object.assign({ seed, demandMain: 6000, demandRamp: 900 }, sys), 300, QUICK ? 300 : 900)));
    const brick = summarise(SEEDS6.map(seed => runIncident(Object.assign({ demandMain: 4200, demandRamp: 600 }, sys), 'brick-wall stop', seed, { warmup: 400, observe: 240 })).filter(r => r.applicable));
    const load = summarise(SEEDS6.map(seed => runIncident(Object.assign({ demandMain: 4200, demandRamp: 600 }, sys), 'load falls off a truck', seed, { warmup: 400, observe: 240 })).filter(r => r.applicable));
    rows.push({ variant: name, servedPerH: flow.servedPerH, speedKmh: flow.speedKmh, tripDelay: flow.tripDelay, queueEnd: flow.queueEnd, brick, load });
  }
  return rows;
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
  return () => {
    const rows = [];
    const human = SEEDS6.map(seed => runIncident({ mode: 'human', demandMain: 4200, demandRamp: 600 }, kind, seed, { warmup: 400, observe: 240 })).filter(r => r.applicable);
    rows.push({ scenario: kind, layers: 'Human drivers (see it within 150 m)', policy: 'Today', ...summarise(human) });
    for (const [lname, layers] of Object.entries(LAYERS)) for (const [pname, pol] of Object.entries(POLICIES)) {
      const res = SEEDS6.map(seed => runIncident(Object.assign({ demandMain: 4200, demandRamp: 600 }, pol, layers), kind, seed, { warmup: 400, observe: 240 })).filter(r => r.applicable);
      rows.push({ scenario: kind, layers: lname, policy: pname, ...summarise(res) });
    }
    return rows;
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
  return () => {
    const rows = [];
    const opts = { warmup: 400, observe: QUICK ? 600 : 1200 };
    for (const [name, sys] of Object.entries(SAFETY_SYSTEMS)) {
      if (sys.mode === 'human' && kind !== 'breakdown') continue;
      const cfg = Object.assign({ demandMain: 4200, demandRamp: 600 }, sys);
      const res = [], extra = [];
      for (const seed of SEEDS6) {
        const r = runIncident(cfg, kind, seed, opts);
        if (!r.applicable) continue;
        const base = new World(Object.assign({}, cfg, { seed }));
        base.run(opts.warmup); const t0 = base.t; base.run(opts.observe);
        extra.push((r.vehS - vehicleSeconds(base, t0)) / 3600);
        res.push(r);
      }
      rows.push({ incident: kind, system: name, ...summarise(res), extraVehH: mean(extra) });
    }
    return rows;
  };
}

// road sensors down in one segment: hybrid falls back to absolute there
function groupSensors() {
  const rows = [];
  const seeds = QUICK ? [1] : [1, 2];
  for (const [dm, dr] of [[4200, 600], [6000, 900]]) {
    for (const [label, seg] of [['all sensors up', -1], ['down at the on-ramp merge (2–3 km)', 2], ['down on a plain stretch (4–5 km)', 4]]) {
      const acc = seeds.map(seed => {
        const w = new World({ mode: 'sdr', separation: 'hybrid', demandMain: dm, demandRamp: dr, seed });
        if (seg >= 0) w.toggleSensors(seg);
        w.run(300);
        const done0 = w.m.completed; w.run(QUICK ? 300 : 900);
        const s = w.stats(QUICK ? 300 : 900);
        return { servedPerH: (w.m.completed - done0) / (QUICK ? 300 : 900) * 3600, tripDelay: s.tripDelay, queueEnd: s.mainQueue + s.rampQueue, collisions: s.collisions };
      });
      rows.push({ demand: `${dm} + ${dr}`, state: label, ...avg(acc) });
    }
  }
  return rows;
}

function avg(list) {
  const out = {};
  for (const k of Object.keys(list[0])) {
    const vals = list.map(r => r[k]).filter(v => typeof v === 'number' && isFinite(v));
    out[k] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : NaN;
  }
  return out;
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
};

// ------------------------------------------------------------------ report
const f0 = v => (v === undefined || !isFinite(v)) ? '–' : Math.round(v).toLocaleString('en-US');
const f1 = v => (v === undefined || !isFinite(v)) ? '–' : v.toFixed(1);

function report(res, seconds) {
  const L = [];
  L.push('# SDR simulator — experiment results', '');
  L.push(`Generated ${new Date().toISOString().slice(0, 16).replace('T', ' ')} · ${QUICK ? 'QUICK run' : 'full run'} · ${seconds.toFixed(0)} s compute`, '');
  L.push('Corridor: 5 km, 3 lanes, on-ramp merging at 2.0–2.3 km, off-ramp at 3.5 km (20 % of vehicles exit), 10 % trucks.');
  L.push('"Today" is the same corridor with 100 % human drivers; every SDR row is 100 % SDR-guided vehicles.');
  L.push('Hybrid separation (recommended, the default) = relative, plus an absolute gap behind trucks, behind any vehicle that reports a fault, and in/just before a segment whose road sensors are down. Platoon breaks are off (section 3 shows why).', '');

  if (res.demand) {
    L.push('## 1. Throughput and delay vs demand', '');
    L.push('Ramp demand 900 veh/h in all runs. Warm-up 5 min, measured over 15 min.', '');
    L.push('| System | Main demand (veh/h) | Served (veh/h) | Served % | Mean speed (km/h) | Trip delay (s) | Queue at gates (end) | Max gate wait (s) | Collisions | Hard brakes / 1000 veh-km | Braking loss (Wh/veh-km) |');
    L.push('|---|---|---|---|---|---|---|---|---|---|---|');
    for (const r of res.demand) L.push(`| ${r.system} | ${f0(r.demandMain)} | ${f0(r.servedPerH)} | ${f0(r.servedPct)} | ${f0(r.speedKmh)} | ${f0(r.tripDelay)} | ${f0(r.queueEnd)} | ${f0(r.maxWait)} | ${f1(r.collisions)} | ${f0(r.hardPer1000km)} | ${f1(r.brakeWhPerKm)} |`);
    L.push('', 'Trip delay = time from arriving at the entry (including waiting at a gate) to leaving the corridor, minus free-flow time.', '');
  }
  if (res.incidents) {
    L.push('## 2. Incidents', '');
    L.push('Main demand 4,200 veh/h + ramp 600 veh/h. Incident at t = 10 min around x = 3 km, observed for 5 min. "Brick-wall stop": a vehicle hits something no sensor saw and stops within about a second. "Sudden 50 % brake loss": the brakes of one vehicle halve; SDR health monitoring reports it after 0.5 s (sooner once it brakes); a human driver is not told.', '');
    L.push('| Incident | System | Runs | Runs with a collision | Collisions | Worst impact (km/h) | Guardian activations | Safe stops | Supervision brakes | Hard brakes per run |');
    L.push('|---|---|---|---|---|---|---|---|---|---|');
    for (const r of res.incidents) {
      if (!r.runs) { L.push(`| ${r.incident} | ${r.system} | n/a | | | | | | | |`); continue; }
      L.push(`| ${r.incident} | ${r.system} | ${r.runs} | ${r.runsWithCollision} | ${r.collisions} | ${f0(r.maxImpactKmh)} | ${r.guardian} | ${r.safeStops} | ${r.supervision} | ${f0(r.hardBrakes)} |`);
    }
    L.push('');
  }
  if (res.hybrid) {
    L.push('## 3. Hybrid separation variants', '');
    L.push('Capacity: main 6,000 + ramp 900 veh/h (more than any variant can carry), 2 runs. Safety: 6 runs each at 4,200 + 600 veh/h; "load falls off a truck" drops an object just behind a truck that has a vehicle within 150 m behind it.', '');
    L.push('| Variant | Served (veh/h) | Mean speed (km/h) | Trip delay (s) | Brick-wall stop: runs with collision / collisions / worst (km/h) | Lost load: runs with collision / collisions / worst (km/h) | Lost load: mean gap of the follower (m) |');
    L.push('|---|---|---|---|---|---|---|');
    for (const r of res.hybrid) L.push(`| ${r.variant} | ${f0(r.servedPerH)} | ${f0(r.speedKmh)} | ${f0(r.tripDelay)} | ${r.brick.runsWithCollision} of ${r.brick.runs} / ${r.brick.collisions} / ${f0(r.brick.maxImpactKmh)} | ${r.load.runsWithCollision} of ${r.load.runs} / ${r.load.collisions} / ${f0(r.load.maxImpactKmh)} | ${f0(r.load.gap)} |`);
    L.push('');
  }
  const objKeys = ['objects-150', 'objects-300', 'objects-truck'].filter(k => res[k]);
  if (objKeys.length) {
    L.push('## 4. Detection layers vs foreign objects', '');
    L.push('An object that stops a vehicle dead (worst case) appears in lane 2 at 4,200 + 600 veh/h; 6 runs per row, observed for 4 minutes. Road cameras confirm an object after 0.5 s; each vehicle\'s own sensor sees it within 120 m with the stated probability (rolled per vehicle); "shared" means the detecting vehicle reports it to the road (confirmed one control cycle later) and with V2V also directly to nearby vehicles.', '');
    L.push('| Scenario | Detection layers | Policy | Runs with a collision | Collisions | Vehicles that hit the object | Worst impact (km/h) | Mean distance of first vehicle (m) |');
    L.push('|---|---|---|---|---|---|---|---|');
    for (const k of objKeys) for (const r of res[k]) L.push(`| ${r.scenario} | ${r.layers} | ${r.policy} | ${r.runsWithCollision} of ${r.runs} | ${r.collisions} | ${r.objectHits} | ${f0(r.maxImpactKmh)} | ${f0(r.gap)} |`);
    L.push('');
  }
  const safKeys = ['safety-breakdown', 'safety-brakes', 'safety-comms'].filter(k => res[k]);
  if (safKeys.length) {
    L.push('## 5. Safety lane (hard shoulder)', '');
    L.push('4,200 + 600 veh/h, 6 runs per row, observed for 20 minutes. A broken-down vehicle loses propulsion and is towed 15 minutes after it stops. Extra delay = vehicle-hours spent in the system in those 20 minutes minus the same traffic without the incident.', '');
    L.push('| Incident | System | Runs | Collisions | Worst impact (km/h) | Sent to safety lane (per run) | Vehicle stopped in a live lane (s per run) | Extra delay (vehicle-hours) |');
    L.push('|---|---|---|---|---|---|---|---|');
    for (const k of safKeys) for (const r of res[k]) L.push(`| ${r.incident} | ${r.system} | ${r.runs} | ${r.collisions} | ${f0(r.maxImpactKmh)} | ${f1(r.sidetracked)} | ${f0(r.liveLaneStopS)} | ${f1(r.extraVehH)} |`);
    L.push('');
  }
  if (res.sensors) {
    L.push('## 6. Road-sensor outage (hybrid falls back to absolute locally)', '');
    L.push('| Demand (veh/h) | Road sensors | Served (veh/h) | Trip delay (s) | Queue at gates (end) | Collisions |');
    L.push('|---|---|---|---|---|---|');
    for (const r of res.sensors) L.push(`| ${r.demand} | ${r.state} | ${f0(r.servedPerH)} | ${f0(r.tripDelay)} | ${f0(r.queueEnd)} | ${f1(r.collisions)} |`);
    L.push('');
  }
  if (res.weather) {
    L.push('## 7. Weather', '');
    L.push('Main demand 3,600 veh/h + ramp 600 veh/h.', '');
    L.push('| Weather | System | Served (veh/h) | Mean speed (km/h) | Trip delay (s) | Queue at gates (end) | Collisions | Hard brakes / 1000 veh-km |');
    L.push('|---|---|---|---|---|---|---|---|');
    for (const r of res.weather) L.push(`| ${r.weather} | ${r.system} | ${f0(r.servedPerH)} | ${f0(r.speedKmh)} | ${f0(r.tripDelay)} | ${f0(r.queueEnd)} | ${f1(r.collisions)} | ${f0(r.hardPer1000km)} |`);
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
      L.push(`| ${r.weather} | Human (1.4 s headway) | ${[40, 60, 80, 100, 120].map(k => f0(r[`hum@${k}`])).join(' | ')} | – |`);
    }
    L.push('');
  }
  return L.join('\n');
}

// ------------------------------------------------------------------ main / worker
if (isMainThread) {
  const t0 = Date.now();
  const names = Object.keys(GROUPS).filter(n => !ONLY.length || ONLY.includes(n));
  const dir = path.join(__dirname, 'results');
  fs.mkdirSync(dir, { recursive: true });
  // keep results of groups not re-run
  let prev = {};
  try { if (ONLY.length) prev = JSON.parse(fs.readFileSync(path.join(dir, 'results.json'), 'utf8')); } catch (e) { prev = {}; }
  const limit = Math.max(1, os.cpus().length - 1);
  const queue = names.slice();
  const res = Object.assign({}, prev);
  let running = 0;
  const done = new Promise((resolve, reject) => {
    const next = () => {
      if (!queue.length && !running) return resolve();
      while (running < limit && queue.length) {
        const name = queue.shift(); running++;
        const w = new Worker(__filename, { workerData: { name }, argv: process.argv.slice(2) });
        const t1 = Date.now();
        w.on('message', r => { res[name] = r; running--; console.error(`  ${name} done in ${((Date.now() - t1) / 1000).toFixed(0)} s`); next(); });
        w.on('error', reject);
      }
    };
    next();
  });
  done.then(() => {
    const secs = (Date.now() - t0) / 1000;
    fs.writeFileSync(path.join(dir, 'results.json'), JSON.stringify(res, null, 1));
    fs.writeFileSync(path.join(dir, 'results.md'), report(res, secs));
    console.log(report(res, secs));
  }).catch(e => { console.error(e); process.exit(1); });
} else {
  parentPort.postMessage(GROUPS[workerData.name]());
}
