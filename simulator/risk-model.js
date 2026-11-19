/*
 * Swiss-cheese risk model for foreign objects on an SDR motorway.
 *   node risk-model.js        -> prints a markdown table (also written to results/risk-model.md)
 *
 * Every number below is an ASSUMPTION or a rough derivation, listed with its source, so the
 * model can be argued with and re-run. Rates are per billion vehicle-km (bvkm).
 * The simulator supplies the per-event outcomes (how many collisions one brick-wall event causes
 * under each separation policy); the research supplies the frequencies.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const P = {
  // objects that block a lane on a busy motorway, per bvkm.
  // UK Strategic Road Network 2023: 21,774 lane impacts from obstructions (Direct Line Group / National Highways)
  // over roughly 175 bvkm of SRN traffic (about a third of GB's 334 bn vehicle-miles) -> ~120.
  objectsPerBvkm: 120,
  // share of objects that fall off a vehicle right in front of the vehicle behind it (rest: lying, or animals walking in).
  // AAA Foundation: ~2/3 of debris crashes involve items that fell from vehicles; we assume half of those land
  // within the follower's stopping distance. Unknown -> 1/3.
  fallingShare: 1 / 3,
  // of falling objects, the share that comes off a truck (covered by the "absolute behind trucks" rule). Assumption.
  fromTruckShare: 0.7,
  // share of objects heavy enough to stop a car dead if hit (pallet of goods, large animal, steel). Assumption;
  // most debris (tyre treads, small items) damages a car or makes it swerve but does not stop it dead.
  heavyShare: 0.10,
  // mean time between vehicles in one lane at ~1,400 veh/h/lane
  headwayS: 2.6,
};

// Collisions caused by one brick-wall event: the vehicle that hits the object, plus the followers that
// then hit it. The follower part is read from the latest experiment run (results/results.json, section 2,
// "brick-wall stop"); the fallback values are used only if that file is missing.
const COLLISIONS_PER_EVENT = { absolute: 1.0, relative: 1.9, hybrid: 1.9 };
let perEventSource = 'fallback values (no results/results.json found)';
try {
  const res = JSON.parse(fs.readFileSync(path.join(__dirname, 'results', 'results.json'), 'utf8'));
  for (const policy of Object.keys(COLLISIONS_PER_EVENT)) {
    const row = res.incidents.find(r => r.incident === 'brick-wall stop' && r.system === `SDR, ${policy} separation`);
    COLLISIONS_PER_EVENT[policy] = 1 + Math.max(0, row.collisions - (row.bgCollisions || 0)) / row.runs;
  }
  const m = res._meta && res._meta.incidents;
  perEventSource = `simulator results${m ? ' of ' + m.date : ''}, ${res.incidents.find(r => r.incident === 'brick-wall stop').runs} brick-wall runs per policy`;
} catch (e) { /* keep the fallback */ }

const SCENARIOS = [
  { name: 'A. Relative separation, today\'s detection (road incident detection ~10 s, 95 %; car sensor misses 30 %, nothing shared)',
    policy: 'relative', truckRule: false, roadDelayS: 10, roadProb: 0.95, carMiss: 0.30, share: false },
  { name: 'B. Recommended hybrid, today\'s detection',
    policy: 'hybrid', truckRule: true, roadDelayS: 10, roadProb: 0.95, carMiss: 0.30, share: false },
  { name: 'C. Recommended hybrid, SDR-grade detection (road sensors ≤1 s, 99 %; car sensor misses 10 %; V2V)',
    policy: 'hybrid', truckRule: true, roadDelayS: 1, roadProb: 0.99, carMiss: 0.10, share: true },
  { name: 'D. As C, plus vehicles monitor their own load and broadcast a loss as it happens (90 % of losses)',
    policy: 'hybrid', truckRule: true, roadDelayS: 1, roadProb: 0.99, carMiss: 0.10, share: true, loadMonitor: 0.9 },
  { name: 'E. Absolute separation, SDR-grade detection',
    policy: 'absolute', truckRule: true, roadDelayS: 1, roadProb: 0.99, carMiss: 0.10, share: true },
];

function evaluate(s) {
  const heavy = P.objectsPerBvkm * P.heavyShare;
  const lying = heavy * (1 - P.fallingShare);
  const falling = heavy * P.fallingShare;
  // lying object: the first vehicle to arrive is at risk if it arrives before the road has confirmed the object
  // (time to the next vehicle ~ exponential with mean = headway) and its own sensor misses it.
  const roadTooSlow = s.roadProb * (1 - Math.exp(-s.roadDelayS / P.headwayS)) + (1 - s.roadProb);
  // without sharing, every vehicle that arrives before the road confirms it rolls its own dice
  const nBefore = s.share ? 1 : Math.max(1, s.roadDelayS / P.headwayS * s.roadProb + (1 - s.roadProb) * 20);
  const lyingEvents = lying * roadTooSlow * (1 - Math.pow(1 - s.carMiss, nBefore));
  // falling object: lands in front of the follower. With a relative gap (15-20 m) it cannot stop whatever it
  // knows; with an absolute gap (~55 m) it can if someone detects the object within ~0.5 s (simulator: yes with road
  // sensors at 0.5 s; 2 of 6 runs hit with car sensors + V2V only).
  const monitored = s.loadMonitor || 0;
  const absShare = s.policy === 'absolute' ? 1 : s.truckRule ? P.fromTruckShare : 0;
  const pMissAbs = (s.roadDelayS <= 1 ? (1 - s.roadProb) : 1) * s.carMiss;
  const fallingEvents = falling * (1 - monitored) * (absShare * pMissAbs + (1 - absShare) * 1);
  const events = lyingEvents + fallingEvents;
  const perEvent = COLLISIONS_PER_EVENT[s.policy];
  return { lyingEvents, fallingEvents, events, collisions: events * perEvent };
}

const f2 = v => v >= 10 ? v.toFixed(0) : v >= 1 ? v.toFixed(1) : v.toFixed(2);
const L = [];
L.push('# Foreign-object risk model (per billion vehicle-km)', '');
L.push('Generated by `node risk-model.js`. Assumptions: ' + Object.entries(P).map(([k, v]) => `${k} = ${+v.toFixed(3)}`).join(', ') + '.', '');
L.push('Collisions per brick-wall event (the vehicle itself plus followers): ' + Object.entries(COLLISIONS_PER_EVENT).map(([k, v]) => `${k} ${v.toFixed(2)}`).join(', ') + `. Source: ${perEventSource}.`, '');
L.push('| Scenario | Brick-wall events from lying objects | Brick-wall events from falling loads | Brick-wall events, total | Collisions |');
L.push('|---|---|---|---|---|');
for (const s of SCENARIOS) {
  const r = evaluate(s);
  L.push(`| ${s.name} | ${f2(r.lyingEvents)} | ${f2(r.fallingEvents)} | ${f2(r.events)} | ${f2(r.collisions)} |`);
}
L.push('', 'For scale: GB motorways had about 76 casualties per billion vehicle-miles in 2023 (≈ 47 per billion vehicle-km, all causes; secondary source); US road-debris crashes were ≈ 10 per billion vehicle-km on all roads (AAA Foundation, 2011–14).', '');
const out = L.join('\n');
fs.mkdirSync(path.join(__dirname, 'results'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'results', 'risk-model.md'), out);
console.log(out);
