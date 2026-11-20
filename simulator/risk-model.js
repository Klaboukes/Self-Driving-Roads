/*
 * Swiss-cheese risk model for foreign objects on an SDR motorway.
 *   node risk-model.js        -> prints a markdown report (also written to results/risk-model.md)
 *
 * Every uncertain input has a low, central and high value, with its source. Where no source was found
 * the value is an ASSUMPTION and is labelled so. Rates are per billion vehicle-km (bvkm).
 * The simulator supplies the per-event outcomes (how many collisions one event causes on each road and
 * under each separation policy); the research supplies the frequencies (SDR-03, appendices A4 and A5).
 *
 * The report gives, per scenario: the central result, the range when only the researched inputs vary,
 * the range when every input varies (all at their best or all at their worst at once, so deliberately
 * wide), and the result as the model counted before roadmap item 6.1. Then the split per hazard, with
 * today's road on the same measure, a one-at-a-time sensitivity and the ratios between scenarios.
 */
'use strict';
const fs = require('fs');
const path = require('path');

// kind: 'researched' = from data (possibly derived); 'assumption' = no source found.
// previous = the value used before roadmap item 2.8 (shown for the record; undefined for inputs added later).
// fleet = only used for the SDR-Ready fleet (roadmap 6.1): every truck enclosed, tyres and wheels monitored.
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
      + '(tyre treads, small items) damages it or makes it swerve. Applied to every source alike, which is '
      + 'cautious for tyres and vehicle parts.',
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
      + 'a pallet does. Used for load monitoring and for the enclosed truck body.',
  },
  partsReported: {
    label: 'Share of tyre and part losses that the vehicle reports as they happen',
    low: 0, central: 0, high: 0.5, previous: 0, kind: 'assumption',
    source: 'Assumption. Load monitoring watches the load, not the wheels. Tyre pressure monitoring is '
      + 'mandatory on new EU trucks (Regulation 2019/2144) and might report some tyre failures, but a US '
      + 'field test was inconclusive (FMCSA†). Only matters where the vehicle reports a loss as it happens.',
  },
  enclosedEscape: {
    label: 'Share of truck cargo losses that an enclosed, monitored body still lets out',
    low: 0.02, central: 0.10, high: 0.25, kind: 'assumption', fleet: true,
    source: 'Assumption, no data found (roadmap 4.4). A closed rigid body with monitored doors holds back '
      + 'what open loads and curtain-siders lose today; what can still come out is a door that fails, a body '
      + 'damaged in a crash, or something fixed to the outside. SDR-Ready fleet only.',
  },
  partsWarned: {
    label: 'Share of truck tyre and wheel losses that monitoring reports beforehand as a fault',
    low: 0, central: 0.3, high: 0.6, kind: 'assumption', fleet: true,
    source: 'Assumption, no data found. Many truck tyre failures follow a loss of pressure that tyre pressure '
      + 'monitoring can see, and a wheel coming off follows loose wheel nuts that wheel-end sensors can see; '
      + 'how often the warning comes early enough is not known (a US field test of tyre pressure monitoring '
      + 'was inconclusive, FMCSA†). A truck that reports a fault gets the long gap behind it or is taken off '
      + 'the road (the hybrid rule for faulty vehicles), so these losses are counted as prevented. SDR-Ready fleet only.',
  },
};
// fixed, not varied: mean time between vehicles in one lane at ~1,400 veh/h/lane
const HEADWAY_S = 2.6;

const central = () => Object.fromEntries(Object.entries(INPUTS).map(([k, v]) => [k, v.central]));

// ------------------------------------------------------------------ per-event outcomes from the simulator
// brick: collisions after a brick-wall stop (the vehicle that stops dead, plus the followers that hit it).
// loadRel: collisions per lost load that lands in front of a follower at a relative gap (road confirms in 0.5 s);
// loadRelReported: the same when the truck reports the loss itself at once. today*: today's road (human drivers).
// *Hit: the chance that the event leads to at least one collision. The fallback values are from the runs of
// 2026-11-20 (results sections 2 and 4) and are used only if results/results.json lacks a group.
const PE = {
  brick: { absolute: 1.0, relative: 1.8, hybrid: 1.5 },
  brickOld: { absolute: 1.0, relative: 1.8, hybrid: 1.5 },     // as counted before item 6.1 (section 2, 10 runs)
  loadRel: 2.5, loadRelHit: 1, loadRelReported: 2.5, loadRelReportedHit: 1,
  todayLoad: 3.9, todayLoadHit: 28 / 30, todayLying: 0.23, todayLyingHit: 4 / 30,
};
const HAZ = { load: 'load falls off a truck, stops dead', brick: 'brick-wall stop', lying: 'object 150 m ahead',
  today: 'Today (human drivers)', nogap: 'SDR, no truck gap (relative behind trucks)', hybrid: 'SDR, hybrid (truck gap as it is)',
  reported: 'SDR, no truck gap, loss reported at once' };
let perEventSource = 'fallback values (no results/results.json found)';
try {
  const res = JSON.parse(fs.readFileSync(path.join(__dirname, 'results', 'results.json'), 'utf8'));
  for (const policy of Object.keys(PE.brickOld)) {
    const row = res.incidents.find(r => r.incident === 'brick-wall stop' && r.system === `SDR, ${policy} separation`);
    PE.brickOld[policy] = PE.brick[policy] = 1 + Math.max(0, row.collisions - (row.bgCollisions || 0)) / row.runs;
  }
  const m = res._meta && res._meta.incidents;
  perEventSource = `simulator results${m ? ' of ' + m.date : ''} (section 2, ${res.incidents.find(r => r.incident === 'brick-wall stop').runs} brick-wall runs per policy)`;
  if (res.hazards) {
    const h = (hz, sys) => res.hazards.find(r => r.hazard === hz && r.system === sys);
    const per = r => r.caused / r.runs, hit = r => r.runsWithCollision / r.runs;
    PE.brick.relative = 1 + per(h(HAZ.brick, HAZ.nogap));
    PE.brick.hybrid = 1 + per(h(HAZ.brick, HAZ.hybrid));
    PE.loadRel = per(h(HAZ.load, HAZ.nogap)); PE.loadRelHit = hit(h(HAZ.load, HAZ.nogap));
    PE.loadRelReported = per(h(HAZ.load, HAZ.reported)); PE.loadRelReportedHit = hit(h(HAZ.load, HAZ.reported));
    PE.todayLoad = per(h(HAZ.load, HAZ.today)); PE.todayLoadHit = hit(h(HAZ.load, HAZ.today));
    PE.todayLying = per(h(HAZ.lying, HAZ.today)); PE.todayLyingHit = hit(h(HAZ.lying, HAZ.today));
    const mh = res._meta && res._meta.hazards;
    perEventSource += `; per hazard from section 20a${mh ? ' of ' + mh.date : ''} (${h(HAZ.load, HAZ.today).runs} lost-load and ${h(HAZ.brick, HAZ.today).runs} brick-wall runs per road)`;
  }
} catch (e) { /* keep the fallback */ }

// ------------------------------------------------------------------ scenarios
const SDR_GRADE = { roadDelayS: 1, roadProb: 0.99, carMiss: 0.10, share: true };
const TODAY_DET = { roadDelayS: 10, roadProb: 0.95, carMiss: 0.30, share: false };
const SCENARIOS = [
  { id: 'T', name: 'T. Today\'s road: human drivers, today\'s vehicles', today: true },
  { id: 'T2', name: 'T2. Today\'s road with SDR-Ready trucks (enclosed bodies, tyres and wheels monitored)', today: true, ready: true },
  { id: 'A', name: 'A. Relative separation, today\'s detection (road incident detection ~10 s, 95 %; car sensor misses 30 %, nothing shared)',
    policy: 'relative', truckRule: false, ...TODAY_DET },
  { id: 'B', name: 'B. Recommended hybrid, today\'s detection', policy: 'hybrid', truckRule: true, ...TODAY_DET },
  { id: 'C', name: 'C. Recommended hybrid, SDR-grade detection (road sensors ≤1 s, 99 %; car sensor misses 10 %; V2V)',
    policy: 'hybrid', truckRule: true, ...SDR_GRADE },
  { id: 'D', name: 'D. As C, plus vehicles monitor their own load and broadcast a loss as it happens (90 % of cargo losses)',
    policy: 'hybrid', truckRule: true, ...SDR_GRADE, loadMonitor: 0.9 },
  { id: 'E', name: 'E. Absolute separation, SDR-grade detection', policy: 'absolute', truckRule: true, ...SDR_GRADE },
  { id: 'F', name: 'F. Relative separation, SDR-grade detection, today\'s vehicles', policy: 'relative', truckRule: false, ...SDR_GRADE },
  { id: 'G', name: 'G. No truck gap (relative behind trucks), SDR-grade detection, SDR-Ready fleet: every truck enclosed, tyres and wheels monitored, loads monitored as in D',
    policy: 'relative', truckRule: false, ...SDR_GRADE, ready: true, loadMonitor: 0.9 },
  { id: 'H', name: 'H. Recommended hybrid (truck gap kept), SDR-grade detection, SDR-Ready fleet as in G',
    policy: 'hybrid', truckRule: true, ...SDR_GRADE, ready: true, loadMonitor: 0.9 },
];
const NEW_IN_61 = new Set(['T', 'T2', 'F', 'G', 'H']);
const SOURCES = ['truckCargo', 'truckParts', 'other'];

// p: input values. opt.legacy: count as before item 6.1 (falling loads at a relative gap cost as many collisions as a
// brick-wall stop, and a loss the vehicle reports itself causes none). opt.roadTooSlowBehindTruck: the road's
// confirmation is too slow for the long gap (item 1.2: 1 s was too slow, 0.5 s fast enough); opt.carHelps: whether
// the follower's own sensor then saves it.
function evaluate(s, p, opt = {}) {
  const heavy = p.objectsPerBvkm * p.heavyShare;
  const lying = heavy * (1 - p.fallingShare);
  const falling = heavy * p.fallingShare;
  const truck = falling * p.fromTruckShare;
  // where the falling objects come from; an SDR-Ready truck holds its cargo back and reports some tyre and wheel faults in advance
  const src = {
    truckCargo: truck * p.cargoShare * (s.ready ? p.enclosedEscape : 1),
    truckParts: truck * (1 - p.cargoShare) * (s.ready ? 1 - p.partsWarned : 1),
    other: falling - truck,
  };
  const out = {};
  if (s.today) {
    // human drivers: collisions per object straight from the simulator (a human sees a lying object within 150 m)
    out.lying = { events: lying * PE.todayLyingHit, collisions: lying * PE.todayLying };
    for (const k of SOURCES) out[k] = { events: src[k] * PE.todayLoadHit, collisions: src[k] * PE.todayLoad };
  } else {
    const brick = (opt.legacy ? PE.brickOld : PE.brick)[s.policy];
    // lying object: the first vehicle to arrive is at risk if it arrives before the road has confirmed the object
    // (time to the next vehicle ~ exponential with mean = headway) and its own sensor misses it.
    const roadTooSlow = s.roadProb * (1 - Math.exp(-s.roadDelayS / HEADWAY_S)) + (1 - s.roadProb);
    // without sharing, every vehicle that arrives before the road confirms it rolls its own dice
    const nBefore = s.share ? 1 : Math.max(1, s.roadDelayS / HEADWAY_S * s.roadProb + (1 - s.roadProb) * 20);
    const lyingEvents = lying * roadTooSlow * (1 - Math.pow(1 - s.carMiss, nBefore));
    out.lying = { events: lyingEvents, collisions: lyingEvents * brick };
    // falling object: lands in front of the follower. With an absolute gap (~55 m) the follower can stop if someone
    // detects the object within ~0.5 s (simulator: yes with road sensors at 0.5 s; 2 of 6 runs hit with car sensors +
    // V2V only), or at once if the vehicle that lost it reports it. With a relative gap (15-25 m) it cannot stop,
    // whoever knows: the simulator's collisions per lost load apply, also when the truck reports the loss at once.
    const roadInTime = s.roadDelayS <= 1 && !opt.roadTooSlowBehindTruck;
    const carMiss = opt.roadTooSlowBehindTruck && opt.carHelps === false ? 1 : s.carMiss;
    const pMissAbs = (roadInTime ? (1 - s.roadProb) : 1) * carMiss;
    for (const k of SOURCES) {
      // share of these losses the vehicle reports itself as they happen (load monitoring)
      const mon = !s.loadMonitor ? 0 : k === 'truckCargo' ? s.loadMonitor : k === 'truckParts' ? p.partsReported
        : s.loadMonitor * p.cargoShare + p.partsReported * (1 - p.cargoShare);
      const absGap = s.policy === 'absolute' || (s.truckRule && k !== 'other');
      if (absGap || opt.legacy) {
        const e = src[k] * (1 - mon) * (absGap ? pMissAbs : 1);
        out[k] = { events: e, collisions: e * brick };
      } else {
        out[k] = { events: src[k] * ((1 - mon) * PE.loadRelHit + mon * PE.loadRelReportedHit),
          collisions: src[k] * ((1 - mon) * PE.loadRel + mon * PE.loadRelReported) };
      }
    }
  }
  out.falling = { events: SOURCES.reduce((a, k) => a + out[k].events, 0), collisions: SOURCES.reduce((a, k) => a + out[k].collisions, 0) };
  out.events = out.lying.events + out.falling.events;
  out.collisions = out.lying.collisions + out.falling.collisions;
  return out;
}

// every combination of low/high for the given inputs (the model is monotonic in each input, so the corners give the extremes)
function corners(keys, fn) {
  const vals = [];
  for (let mask = 0; mask < (1 << keys.length); mask++) {
    const p = central();
    keys.forEach((k, i) => { p[k] = (mask >> i) & 1 ? INPUTS[k].high : INPUTS[k].low; });
    vals.push(fn(p));
  }
  return [Math.min(...vals), Math.max(...vals)];
}
const used = s => Object.keys(INPUTS).filter(k => !INPUTS[k].fleet || s.ready);
const range = (s, keys) => corners(keys.filter(k => used(s).includes(k)), p => evaluate(s, p).collisions);

const f2 = v => v >= 10 ? v.toFixed(0) : v >= 1 ? v.toFixed(1) : v >= 0.1 ? v.toFixed(2) : v.toFixed(3);
const fr = ([lo, hi]) => `${f2(lo)}–${f2(hi)}`;
const fx = v => v.toFixed(v >= 10 ? 0 : v >= 1 ? 1 : 2);
const fv = (k, v) => v === undefined ? '–' : k === 'objectsPerBvkm' ? String(v) : `${Math.round(v * 100)} %`;
const researched = Object.keys(INPUTS).filter(k => INPUTS[k].kind === 'researched');
const all = Object.keys(INPUTS);
const pc = central();
const S = id => SCENARIOS.find(s => s.id === id);

const L = [];
L.push('# Foreign-object risk model (per billion vehicle-km)', '');
L.push('Generated by `node risk-model.js`. How often a vehicle hits an object hard enough to stop dead, on an SDR motorway and on today\'s road, and how many collisions follow. '
  + 'Every input that nobody has measured is given as a low, central and high value. The numbers are orders of magnitude, not predictions.', '');

L.push('## Inputs', '');
L.push('| Input | Low | Central | High | Before item 2.8 | Status | Source |');
L.push('|---|---|---|---|---|---|---|');
for (const [k, v] of Object.entries(INPUTS)) {
  L.push(`| ${v.label} | ${fv(k, v.low)} | ${fv(k, v.central)} | ${fv(k, v.high)} | ${fv(k, v.previous)} | ${v.kind} | ${v.source} |`);
}
L.push('', `Fixed: mean time between vehicles in one lane ${HEADWAY_S} s (about 1,400 vehicles per hour per lane). Detection performance is set per scenario (see the scenario names). † secondary source, not checked against the original.`, '');
L.push('Collisions per event, from the simulator (4,200 + 600 veh/h, 10 % trucks):', '');
L.push(`- after a brick-wall stop (the vehicle that stops dead plus the followers that hit it): absolute ${fx(PE.brick.absolute)}, relative ${fx(PE.brick.relative)}, hybrid ${fx(PE.brick.hybrid)};`);
L.push(`- after a lost load that stops dead in front of a follower at a relative gap: ${fx(PE.loadRel)} (a collision in ${Math.round(100 * PE.loadRelHit)} % of events); when the truck reports the loss itself at once: ${fx(PE.loadRelReported)} (${Math.round(100 * PE.loadRelReportedHit)} %);`);
L.push(`- today's road: ${fx(PE.todayLoad)} per lost load (a collision in ${Math.round(100 * PE.todayLoadHit)} % of events) and ${fx(PE.todayLying)} per object lying 150 m ahead of a driver (${Math.round(100 * PE.todayLyingHit)} %).`);
L.push('', `Source: ${perEventSource}.`, '');
L.push('Since item 6.1 a lost load followed at a relative gap counts the collisions measured for lost loads, not those of a brick-wall stop, and a loss the vehicle reports itself only prevents collisions behind a long gap: at a relative gap the follower is too close to stop, whoever knows. The last column shows each scenario as counted before.', '');

L.push('## Collisions per billion vehicle-km', '');
L.push('"Researched inputs vary": the object rate, the truck share and the cargo share move between their low and high values, the assumptions stay central. '
  + '"All inputs vary": every input moves, and each end of the range has every input at its best or at its worst at the same time, so the range is deliberately wide.', '');
L.push('| Scenario | Events with a collision, central | Collisions, central | Range, researched inputs vary | Range, all inputs vary | Before item 6.1 |');
L.push('|---|---|---|---|---|---|');
const C = {};
for (const s of SCENARIOS) {
  const r = evaluate(s, pc);
  C[s.id] = r;
  L.push(`| ${s.name} | ${f2(r.events)} | **${f2(r.collisions)}** | ${fr(range(s, researched))} | ${fr(range(s, all))} | ${NEW_IN_61.has(s.id) ? 'new' : f2(evaluate(s, pc, { legacy: true }).collisions)} |`);
}

L.push('', '## Per hazard', '');
L.push('Collisions per billion vehicle-km by where the object comes from (central inputs). "Other vehicles": cars, vans and their trailers and roof loads, which no truck rule covers.', '');
const HZ = [['lying', 'Lying objects'], ['truckCargo', 'Falling: truck cargo'], ['truckParts', 'Falling: truck tyres and parts'], ['other', 'Falling: other vehicles']];
L.push('| Scenario | ' + HZ.map(h => h[1]).join(' | ') + ' | Total |');
L.push('|---|' + HZ.map(() => '---|').join('') + '---|');
for (const s of SCENARIOS) L.push(`| ${s.id} | ${HZ.map(([k]) => f2(C[s.id][k].collisions)).join(' | ')} | ${f2(C[s.id].collisions)} |`);

// "no worse than today, per hazard": the ratio SDR ÷ today for each hazard, over every combination of inputs
const ratioOver = (a, b, k) => corners(all, p => { const x = evaluate(S(a), p)[k].collisions, y = evaluate(S(b), p)[k].collisions; return y > 0 ? x / y : Infinity; });
const verdict = ([lo, hi]) => hi < 1 ? 'below in every combination' : lo > 1 ? 'above in every combination' : 'depends on the inputs';
L.push('', '## No worse than today, per hazard?', '');
L.push('SDR ÷ today\'s road, per hazard. Central inputs, and the lowest and highest ratio over every combination of low and high inputs. Below 1: SDR has fewer collisions from that hazard.', '');
L.push('| Comparison | ' + HZ.map(h => h[1]).join(' | ') + ' | All objects |');
L.push('|---|' + HZ.map(() => '---|').join('') + '---|');
const PAIRS = [['G', 'T', 'no truck gap, SDR-Ready fleet ÷ today'], ['G', 'T2', 'no truck gap, SDR-Ready fleet ÷ today with SDR-Ready trucks'],
  ['H', 'T', 'hybrid, SDR-Ready fleet ÷ today'], ['F', 'T', 'relative, today\'s vehicles ÷ today'], ['C', 'T', 'hybrid, today\'s vehicles ÷ today']];
const keysAll = HZ.map(h => h[0]).concat(['collisions']);
const ratioCell = (a, b, k) => {
  const c = k === 'collisions' ? C[a].collisions / C[b].collisions : C[a][k].collisions / C[b][k].collisions;
  const rr = k === 'collisions' ? corners(all, p => evaluate(S(a), p).collisions / evaluate(S(b), p).collisions) : ratioOver(a, b, k);
  return { c, rr };
};
const VERDICTS = {};
for (const [a, b, what] of PAIRS) {
  const cells = keysAll.map(k => ratioCell(a, b, k));
  VERDICTS[a + b] = cells;
  L.push(`| ${a} ÷ ${b}: ${what} | ${cells.map(({ c, rr }) => `${fx(c)} (${fx(rr[0])}–${fx(rr[1])})`).join(' | ')} |`);
}
L.push('', 'Verdict for G ÷ T: ' + HZ.map(([k, n], i) => `${n.toLowerCase()} ${verdict(VERDICTS.GT[i].rr)}`).join('; ') + `; all objects ${verdict(VERDICTS.GT[HZ.length].rr)}.`, '');
// how much the no-swerving drivers of today's road could flatter SDR (roadmap 2.9): the per-event count today's road
// would need for G to equal it on falling loads
{
  const fallen = k => C.T[k].events / PE.todayLoadHit;                  // objects of that source falling in front of a follower, today
  const need = (id, keys) => keys.reduce((a, k) => a + C[id][k].collisions, 0) / keys.reduce((a, k) => a + fallen(k), 0);
  const cut = v => `${fx(v)} (${Math.round(100 * (1 - v / PE.todayLoad))} % fewer)`;
  L.push(`Today's road counts ${fx(PE.todayLoad)} collisions per lost load in the simulator, whose drivers brake but never swerve (roadmap 2.9), so it may count too many. `
    + `With central inputs, G would equal today's road on all falling loads if that dropped to ${cut(need('G', SOURCES))}; on truck tyres and parts alone at ${cut(need('G', ['truckParts']))}; `
    + `on losses from other vehicles at ${cut(need('G', ['other']))}, the same for H and C, since no truck rule covers those.`, '');
}

L.push('Where the events with a collision come from (central inputs):', '');
L.push('| Scenario | From lying objects | From falling loads | Total |');
L.push('|---|---|---|---|');
for (const s of SCENARIOS) L.push(`| ${s.id} | ${f2(C[s.id].lying.events)} | ${f2(C[s.id].falling.events)} | ${f2(C[s.id].events)} |`);

// ratios between scenarios: do they hold over every combination of inputs?
const ratioRange = (a, b) => corners(all, p => evaluate(S(a), p).collisions / evaluate(S(b), p).collisions);
L.push('', '## Ratios between scenarios', '');
L.push('The object rate and the heavy share multiply every scenario alike, so they do not change the ratios. Ranges are over every combination of low and high inputs.', '');
L.push('| Comparison | Central | Range | Before item 6.1 |');
L.push('|---|---|---|---|');
for (const [a, b, what] of [['B', 'C', 'fast roadside sensing (B ÷ C)'], ['C', 'D', 'load monitoring (C ÷ D)'], ['D', 'E', 'D against absolute separation (D ÷ E)'],
  ['F', 'C', 'dropping the truck gap, today\'s vehicles (F ÷ C)'], ['G', 'H', 'dropping the truck gap, SDR-Ready fleet (G ÷ H)'], ['C', 'H', 'SDR-Ready fleet under the hybrid (C ÷ H)']]) {
  const rr = ratioRange(a, b);
  const old = NEW_IN_61.has(a) || NEW_IN_61.has(b) ? 'new' : `${(evaluate(S(a), pc, { legacy: true }).collisions / evaluate(S(b), pc, { legacy: true }).collisions).toFixed(1)}×`;
  L.push(`| ${what} | ${(C[a].collisions / C[b].collisions).toFixed(1)}× | ${rr[0].toFixed(1)}–${rr[1].toFixed(1)}× | ${old} |`);
}

L.push('', '## Which input matters most (one at a time)', '');
L.push('Each input moved to its low and to its high value, the others central. "Factor" = the larger result divided by the smaller. A dash: the input does not apply to that scenario.', '');
const SENS = ['C', 'D', 'G'];
L.push('| Input | ' + SENS.map(id => `${id} at low | ${id} at high | Factor on ${id}`).join(' | ') + ' |');
L.push('|---|' + SENS.map(() => '---|---|---|').join('') + '');
const sens = [];
for (const [k, v] of Object.entries(INPUTS)) {
  const cells = [];
  const row = { k };
  for (const id of SENS) {
    if (!used(S(id)).includes(k)) { cells.push('– | – | –'); continue; }
    const at = x => { const p = central(); p[k] = x; return evaluate(S(id), p).collisions; };
    const lo = at(v.low), hi = at(v.high), f = Math.max(lo, hi) / Math.min(lo, hi);
    row[id] = f;
    cells.push(`${f2(lo)} | ${f2(hi)} | ${f.toFixed(2)}`);
  }
  sens.push(row);
  L.push(`| ${v.label} (${fv(k, v.low)} → ${fv(k, v.high)}) | ${cells.join(' | ')} |`);
}
L.push('');
for (const id of SENS) {
  const top = sens.filter(x => x[id]).sort((a, b) => b[id] - a[id]);
  const topR = top.find(x => INPUTS[x.k].kind === 'researched');
  L.push(`Largest effect on ${id}: ${INPUTS[top[0].k].label.toLowerCase()} (factor ${top[0][id].toFixed(1)}); of the researched inputs: ${INPUTS[topR.k].label.toLowerCase()} (factor ${topR[id].toFixed(1)}).`);
}
L.push('', 'The object rate and the heavy share move every scenario by the same factor: they set the level, not the comparison between scenarios. '
  + 'The high object rate is a ceiling (every item removed, most never in a lane), not a likely value.', '');

L.push('A design question rather than an input: C and D assume the road confirms a load falling off a truck fast enough for the long gap behind it. '
  + 'In the simulator 0.5 s was fast enough and 1 s (what design decision D9 asks for) was not. With 1 s, central inputs:', '');
L.push('| Case | C | D | H |');
L.push('|---|---|---|---|');
const slow = o => ['C', 'D', 'H'].map(id => f2(evaluate(S(id), pc, o).collisions)).join(' | ');
L.push(`| Road confirms in time (as assumed above) | ${slow({})} |`);
L.push(`| Road too slow; the follower's own sensor still catches 90 % | ${slow({ roadTooSlowBehindTruck: true })} |`);
L.push(`| Road too slow; the follower's own sensor does not help (as in the item 1.2 tests) | ${slow({ roadTooSlowBehindTruck: true, carHelps: false })} |`);

L.push('', `For scale: the model puts today's road at ${f2(C.T.collisions)} object collisions per billion vehicle-km (central; ${fr(range(S('T'), all))} over all inputs). `
  + 'Recorded: US road-debris crashes ≈ 10 per billion vehicle-km on all roads (AAA Foundation, 2011–14; a crash can hold several collisions, and most debris does not stop a car dead); '
  + 'GB motorways had about 76 casualties per billion vehicle-miles in 2023 (≈ 47 per billion vehicle-km, all causes; secondary source).', '');
const out = L.join('\n');
fs.mkdirSync(path.join(__dirname, 'results'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'results', 'risk-model.md'), out);
console.log(out);
