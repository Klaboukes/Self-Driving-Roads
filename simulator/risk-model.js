/*
 * Swiss-cheese risk model for foreign objects on an SDR motorway.
 *   node risk-model.js        -> prints a markdown report (also written to results/risk-model.md)
 *
 * Every uncertain input has a low, central and high value, with its source. Where no source was found
 * the value is an ASSUMPTION and is labelled so. Rates are per billion vehicle-km (bvkm).
 * The simulator supplies the per-event outcomes (how many collisions one brick-wall event causes
 * under each separation policy); the research supplies the frequencies (SDR-03, appendices A4 and A5).
 *
 * The report gives, per scenario: the central result, the range when only the researched inputs vary,
 * the range when every input varies (all at their best or all at their worst at once, so deliberately
 * wide), and the result with the inputs the model used before roadmap item 2.8. Then a one-at-a-time
 * sensitivity: each input moved to its low and high value with the others central.
 */
'use strict';
const fs = require('fs');
const path = require('path');

// kind: 'researched' = from data (possibly derived); 'assumption' = no source found.
// previous = the value used before roadmap item 2.8; with all previous values the old table is reproduced.
const INPUTS = {
  objectsPerBvkm: {
    label: 'Lane-blocking objects per billion veh-km',
    low: 120, central: 141, high: 420, previous: 120, kind: 'researched',
    source: 'Central: 21,774 obstruction "lane impacts" on England\'s strategic road network in 2023 '
      + '(National Highways data via FOI, reported by Direct Line Group 2024†) over 154 billion veh-km on that network '
      + '(DfT road traffic estimates 2023). Low: the same count over the rougher traffic estimate used before '
      + '(assumption that some records repeat the same object). High: every item National Highways removed '
      + 'from its roads, including beside the road and dumped items (over 49,000 in January–September 2025, '
      + 'about 65,000 a year) — an upper bound, since most of these never blocked a lane.',
  },
  heavyShare: {
    label: 'Share of objects heavy enough to stop a car dead',
    low: 0.05, central: 0.10, high: 0.20, previous: 0.10, kind: 'assumption',
    source: 'Assumption, no data found. Pallets of goods, steel, large animals stop a car; most debris '
      + '(tyre treads, small items) damages it or makes it swerve.',
  },
  fallingShare: {
    label: 'Share of objects that land right in front of a following vehicle',
    low: 1 / 6, central: 1 / 3, high: 1 / 2, previous: 1 / 3, kind: 'assumption',
    source: 'About two-thirds of US debris crashes involve items that fell off vehicles (AAA Foundation 2016). '
      + 'The share of those that land within the follower\'s stopping distance is an assumption: '
      + '25 %, 50 % (central), 75 %.',
  },
  fromTruckShare: {
    label: 'Share of falling objects that come off a heavy truck (covered by the truck rule)',
    low: 0.30, central: 0.40, high: 0.50, previous: 0.70, kind: 'researched',
    source: 'Estimate from conflicting evidence (SDR-03 A5): no road authority records which kind of vehicle '
      + 'an object came from. Towards trucks: 64 % of roadside tyre debris was truck tyres (AAA Foundation 2004); '
      + '75 % of 36 road agencies named commercial vehicles as the main source (opinion survey). Away from trucks: '
      + 'passenger vehicles in 73–81 % of US unsecured-cargo crashes (NHTSA†); trucks in about a quarter of '
      + 'Flemish "cargo lost" cases (Vias 2025). The previous 70 % had no source.',
  },
  cargoShare: {
    label: 'Share of falling objects that are cargo (rest: tyres and vehicle parts)',
    low: 0.40, central: 0.50, high: 0.70, previous: 1.0, kind: 'researched',
    source: 'Cargo and vehicle parts split about evenly: US crash reports 2018–23, cargo plus tools and '
      + 'building materials 28 % against tyres and parts 29 % (AAA Foundation 2025); US fatal debris crashes '
      + '38 % against 38 % (AAA Foundation 2004); England 2023 lane impacts, building materials 20 % against '
      + 'parts and tyres 26 %†. High raised to 70 % as an assumption: a tyre tread rarely stops a car dead, '
      + 'a pallet does. Only matters for load monitoring (scenario D); the previous model let it catch '
      + 'tyres and parts as well (100 %).',
  },
  partsReported: {
    label: 'Share of tyre and part losses that the vehicle reports as they happen',
    low: 0, central: 0, high: 0.5, previous: 0, kind: 'assumption',
    source: 'Assumption. Load monitoring watches the load, not the wheels. Tyre pressure monitoring is '
      + 'mandatory on new EU trucks (Regulation 2019/2144) and might report some tyre failures, but a US '
      + 'field test was inconclusive (FMCSA†). Only matters for scenario D.',
  },
};
// fixed, not varied: mean time between vehicles in one lane at ~1,400 veh/h/lane
const HEADWAY_S = 2.6;

const central = () => Object.fromEntries(Object.entries(INPUTS).map(([k, v]) => [k, v.central]));
const previous = () => Object.fromEntries(Object.entries(INPUTS).map(([k, v]) => [k, v.previous]));

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
  { id: 'A', name: 'A. Relative separation, today\'s detection (road incident detection ~10 s, 95 %; car sensor misses 30 %, nothing shared)',
    policy: 'relative', truckRule: false, roadDelayS: 10, roadProb: 0.95, carMiss: 0.30, share: false },
  { id: 'B', name: 'B. Recommended hybrid, today\'s detection',
    policy: 'hybrid', truckRule: true, roadDelayS: 10, roadProb: 0.95, carMiss: 0.30, share: false },
  { id: 'C', name: 'C. Recommended hybrid, SDR-grade detection (road sensors ≤1 s, 99 %; car sensor misses 10 %; V2V)',
    policy: 'hybrid', truckRule: true, roadDelayS: 1, roadProb: 0.99, carMiss: 0.10, share: true },
  { id: 'D', name: 'D. As C, plus vehicles monitor their own load and broadcast a loss as it happens (90 % of cargo losses)',
    policy: 'hybrid', truckRule: true, roadDelayS: 1, roadProb: 0.99, carMiss: 0.10, share: true, loadMonitor: 0.9 },
  { id: 'E', name: 'E. Absolute separation, SDR-grade detection',
    policy: 'absolute', truckRule: true, roadDelayS: 1, roadProb: 0.99, carMiss: 0.10, share: true },
];

// p: input values; opt.roadTooSlowBehindTruck: the road's confirmation is too slow for the long gap
// (item 1.2: 1 s was too slow, 0.5 s fast enough); opt.carHelps: whether the follower's own sensor then saves it.
function evaluate(s, p, opt = {}) {
  const heavy = p.objectsPerBvkm * p.heavyShare;
  const lying = heavy * (1 - p.fallingShare);
  const falling = heavy * p.fallingShare;
  // lying object: the first vehicle to arrive is at risk if it arrives before the road has confirmed the object
  // (time to the next vehicle ~ exponential with mean = headway) and its own sensor misses it.
  const roadTooSlow = s.roadProb * (1 - Math.exp(-s.roadDelayS / HEADWAY_S)) + (1 - s.roadProb);
  // without sharing, every vehicle that arrives before the road confirms it rolls its own dice
  const nBefore = s.share ? 1 : Math.max(1, s.roadDelayS / HEADWAY_S * s.roadProb + (1 - s.roadProb) * 20);
  const lyingEvents = lying * roadTooSlow * (1 - Math.pow(1 - s.carMiss, nBefore));
  // falling object: lands in front of the follower. With a relative gap (15-20 m) it cannot stop whatever it
  // knows; with an absolute gap (~55 m) it can if someone detects the object within ~0.5 s (simulator: yes with road
  // sensors at 0.5 s; 2 of 6 runs hit with car sensors + V2V only).
  // Load monitoring reports cargo losses, not tyres and parts (unless partsReported > 0).
  const monitored = s.loadMonitor ? s.loadMonitor * p.cargoShare + p.partsReported * (1 - p.cargoShare) : 0;
  const absShare = s.policy === 'absolute' ? 1 : s.truckRule ? p.fromTruckShare : 0;
  const roadInTime = s.roadDelayS <= 1 && !opt.roadTooSlowBehindTruck;
  const carMiss = opt.roadTooSlowBehindTruck && opt.carHelps === false ? 1 : s.carMiss;
  const pMissAbs = (roadInTime ? (1 - s.roadProb) : 1) * carMiss;
  const fallingEvents = falling * (1 - monitored) * (absShare * pMissAbs + (1 - absShare) * 1);
  const events = lyingEvents + fallingEvents;
  const perEvent = COLLISIONS_PER_EVENT[s.policy];
  return { lyingEvents, fallingEvents, events, collisions: events * perEvent };
}

// min and max of a scenario's collisions over every combination of low/high for the given inputs
// (the model is monotonic in each input, so the corners give the extremes).
function range(s, keys) {
  let lo = Infinity, hi = -Infinity;
  for (let mask = 0; mask < (1 << keys.length); mask++) {
    const p = central();
    keys.forEach((k, i) => { p[k] = (mask >> i) & 1 ? INPUTS[k].high : INPUTS[k].low; });
    const c = evaluate(s, p).collisions;
    lo = Math.min(lo, c); hi = Math.max(hi, c);
  }
  return [lo, hi];
}

const f2 = v => v >= 10 ? v.toFixed(0) : v >= 1 ? v.toFixed(1) : v >= 0.1 ? v.toFixed(2) : v.toFixed(3);
const fr = ([lo, hi]) => `${f2(lo)}–${f2(hi)}`;
const fv = (k, v) => k === 'objectsPerBvkm' ? String(v) : `${Math.round(v * 100)} %`;
const researched = Object.keys(INPUTS).filter(k => INPUTS[k].kind === 'researched');
const all = Object.keys(INPUTS);
const pc = central();

const L = [];
L.push('# Foreign-object risk model (per billion vehicle-km)', '');
L.push('Generated by `node risk-model.js`. How often a vehicle on an SDR motorway hits an object hard enough to stop dead (a "brick-wall event"), and how many collisions follow. '
  + 'Every input that nobody has measured is given as a low, central and high value. The numbers are orders of magnitude, not predictions.', '');

L.push('## Inputs', '');
L.push('| Input | Low | Central | High | Before item 2.8 | Status | Source |');
L.push('|---|---|---|---|---|---|---|');
for (const [k, v] of Object.entries(INPUTS)) {
  L.push(`| ${v.label} | ${fv(k, v.low)} | ${fv(k, v.central)} | ${fv(k, v.high)} | ${fv(k, v.previous)} | ${v.kind} | ${v.source} |`);
}
L.push('', `Fixed: mean time between vehicles in one lane ${HEADWAY_S} s (about 1,400 vehicles per hour per lane). Detection performance is set per scenario (see the scenario names). † secondary source, not checked against the original.`, '');
L.push('Collisions per brick-wall event (the vehicle itself plus followers): ' + Object.entries(COLLISIONS_PER_EVENT).map(([k, v]) => `${k} ${v.toFixed(2)}`).join(', ') + `. Source: ${perEventSource}.`, '');

L.push('## Collisions per billion vehicle-km', '');
L.push('"Researched inputs vary": the object rate, the truck share and the cargo share move between their low and high values, the assumptions stay central. '
  + '"All inputs vary": every input moves, and each end of the range has every input at its best or at its worst at the same time, so the range is deliberately wide.', '');
L.push('| Scenario | Brick-wall events, central | Collisions, central | Range, researched inputs vary | Range, all inputs vary | Before item 2.8 |');
L.push('|---|---|---|---|---|---|');
const C = {}, PREV = {};
for (const s of SCENARIOS) {
  const r = evaluate(s, pc);
  C[s.id] = r; PREV[s.id] = evaluate(s, previous());
  L.push(`| ${s.name} | ${f2(r.events)} | **${f2(r.collisions)}** | ${fr(range(s, researched))} | ${fr(range(s, all))} | ${f2(PREV[s.id].collisions)} |`);
}
// what changed since the previous model, one input at a time (cumulative)
L.push('', 'What moved the central result since the model before item 2.8 (each step adds one change to the one before):', '');
L.push('| Step | ' + SCENARIOS.map(s => s.id).join(' | ') + ' |');
L.push('|---|' + SCENARIOS.map(() => '---').join('|') + '|');
{
  const p = previous();
  L.push('| Before item 2.8 | ' + SCENARIOS.map(s => f2(evaluate(s, p).collisions)).join(' | ') + ' |');
  for (const k of Object.keys(INPUTS)) {
    if (INPUTS[k].previous === INPUTS[k].central) continue;
    p[k] = INPUTS[k].central;
    L.push(`| + ${INPUTS[k].label.toLowerCase()}: ${fv(k, INPUTS[k].previous)} → ${fv(k, INPUTS[k].central)} | ` + SCENARIOS.map(s => f2(evaluate(s, p).collisions)).join(' | ') + ' |');
  }
}
L.push('', 'Where the brick-wall events come from (central inputs):', '');
L.push('| Scenario | From lying objects | From falling loads | Total |');
L.push('|---|---|---|---|');
for (const s of SCENARIOS) L.push(`| ${s.id} | ${f2(C[s.id].lyingEvents)} | ${f2(C[s.id].fallingEvents)} | ${f2(C[s.id].events)} |`);

// ratios between scenarios: do they hold over every combination of inputs?
const ratioRange = (a, b) => {
  let lo = Infinity, hi = -Infinity;
  for (let mask = 0; mask < (1 << all.length); mask++) {
    const p = central();
    all.forEach((k, i) => { p[k] = (mask >> i) & 1 ? INPUTS[k].high : INPUTS[k].low; });
    const x = evaluate(SCENARIOS.find(s => s.id === a), p).collisions / evaluate(SCENARIOS.find(s => s.id === b), p).collisions;
    lo = Math.min(lo, x); hi = Math.max(hi, x);
  }
  return [lo, hi];
};
L.push('', '## Ratios between scenarios', '');
L.push('The object rate and the heavy share multiply every scenario alike, so they do not change the ratios. Ranges are over every combination of low and high inputs.', '');
L.push('| Comparison | Central | Range | Before item 2.8 |');
L.push('|---|---|---|---|');
for (const [a, b, what] of [['B', 'C', 'fast roadside sensing (B ÷ C)'], ['C', 'D', 'load monitoring (C ÷ D)'], ['D', 'E', 'D against absolute separation (D ÷ E)']]) {
  const rr = ratioRange(a, b);
  L.push(`| ${what} | ${(C[a].collisions / C[b].collisions).toFixed(1)}× | ${rr[0].toFixed(1)}–${rr[1].toFixed(1)}× | ${(PREV[a].collisions / PREV[b].collisions).toFixed(1)}× |`);
}

L.push('', '## Which input matters most for C and D (one at a time)', '');
L.push('Each input moved to its low and to its high value, the others central. "Factor" = the larger result divided by the smaller.', '');
L.push('| Input | C at low | C at high | Factor on C | D at low | D at high | Factor on D |');
L.push('|---|---|---|---|---|---|---|');
const sC = SCENARIOS.find(s => s.id === 'C'), sD = SCENARIOS.find(s => s.id === 'D');
const sens = [];
for (const [k, v] of Object.entries(INPUTS)) {
  const at = (s, x) => { const p = central(); p[k] = x; return evaluate(s, p).collisions; };
  const cl = at(sC, v.low), ch = at(sC, v.high), dl = at(sD, v.low), dh = at(sD, v.high);
  const fc = Math.max(cl, ch) / Math.min(cl, ch), fd = Math.max(dl, dh) / Math.min(dl, dh);
  sens.push({ k, fc, fd });
  L.push(`| ${v.label} (${fv(k, v.low)} → ${fv(k, v.high)}) | ${f2(cl)} | ${f2(ch)} | ${fc.toFixed(2)} | ${f2(dl)} | ${f2(dh)} | ${fd.toFixed(2)} |`);
}
const topC = [...sens].sort((a, b) => b.fc - a.fc), topD = [...sens].sort((a, b) => b.fd - a.fd);
const topR = list => list.find(x => INPUTS[x.k].kind === 'researched');
L.push('', `Largest effect on C: ${INPUTS[topC[0].k].label.toLowerCase()} (factor ${topC[0].fc.toFixed(1)}); of the researched inputs: ${INPUTS[topR(topC).k].label.toLowerCase()} (factor ${topR(topC).fc.toFixed(1)}).`);
L.push(`Largest effect on D: ${INPUTS[topD[0].k].label.toLowerCase()} (factor ${topD[0].fd.toFixed(1)}); of the researched inputs: ${INPUTS[topR(topD).k].label.toLowerCase()} (factor ${topR(topD).fd.toFixed(1)}).`, '');
L.push('The object rate and the heavy share move every scenario by the same factor: they set the level, not the comparison between scenarios. '
  + 'The high object rate is a ceiling (every item removed, most never in a lane), not a likely value.', '');

L.push('A design question rather than an input: C and D assume the road confirms a load falling off a truck fast enough for the long gap behind it. '
  + 'In the simulator 0.5 s was fast enough and 1 s (what design decision D9 asks for) was not. With 1 s, central inputs:', '');
L.push('| Case | C | D |');
L.push('|---|---|---|');
L.push(`| Road confirms in time (as assumed above) | ${f2(C.C.collisions)} | ${f2(C.D.collisions)} |`);
L.push(`| Road too slow; the follower's own sensor still catches 90 % | ${f2(evaluate(sC, pc, { roadTooSlowBehindTruck: true }).collisions)} | ${f2(evaluate(sD, pc, { roadTooSlowBehindTruck: true }).collisions)} |`);
L.push(`| Road too slow; the follower's own sensor does not help (as in the item 1.2 tests) | ${f2(evaluate(sC, pc, { roadTooSlowBehindTruck: true, carHelps: false }).collisions)} | ${f2(evaluate(sD, pc, { roadTooSlowBehindTruck: true, carHelps: false }).collisions)} |`);

L.push('', 'For scale: GB motorways had about 76 casualties per billion vehicle-miles in 2023 (≈ 47 per billion vehicle-km, all causes; secondary source); US road-debris crashes were ≈ 10 per billion vehicle-km on all roads (AAA Foundation, 2011–14).', '');
const out = L.join('\n');
fs.mkdirSync(path.join(__dirname, 'results'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'results', 'risk-model.md'), out);
console.log(out);
