/*
 * Regression tests for the SDR simulator engine.
 *   node --test simulator/test        (about a minute)
 *
 * They pin the properties the documents rely on: reproducibility, identical traffic in both worlds,
 * no SDR collisions in normal traffic, authority never overrun (also with radio loss), a human
 * baseline that flows freely below capacity, and the fail-safe incident responses.
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const SDR = require('../engine.js');
const { World } = SDR;

const DEMAND = { demandMain: 4200, demandRamp: 600 };
function run(cfg, seconds) {
  const w = new World(cfg);
  w.run(seconds);
  return w;
}
// measure after a warm-up, so the entry transient does not count
function measure(cfg, warm, seconds) {
  const w = run(cfg, warm);
  const done0 = w.m.completed, hard0 = w.m.hardBrakes, col0 = w.m.collisions, km0 = w.m.vehDist;
  w.m.minSpare = Infinity;
  w.run(seconds);
  const s = w.stats(seconds);
  return {
    w, served: (w.m.completed - done0) / seconds * 3600, speedKmh: s.meanSpeed * 3.6,
    collisions: w.m.collisions - col0, hardPer1000km: 1000 * (w.m.hardBrakes - hard0) / ((w.m.vehDist - km0) / 1000),
    minSpare: w.m.minSpare, queue: s.mainQueue + s.rampQueue,
  };
}

test('the same seed gives exactly the same run', () => {
  for (const mode of ['sdr', 'human']) {
    const a = run({ mode, seed: 3, ...DEMAND }, 200).stats(200);
    const b = run({ mode, seed: 3, ...DEMAND }, 200).stats(200);
    assert.deepEqual(a, b, mode);
  }
});

test('both worlds are fed exactly the same vehicles', () => {
  const stream = mode => {
    const w = new World({ mode, seed: 5 });
    const out = [];
    const make = w._makeVehicle.bind(w);
    w._makeVehicle = (rng, origin) => { const v = make(rng, origin); out.push([v.id, v.type, v.exits, origin, v.tArrive.toFixed(3)].join()); return v; };
    w.run(200);
    return out;
  };
  const sdr = stream('sdr'), human = stream('human');
  assert.ok(sdr.length > 200);
  assert.deepEqual(sdr, human);
});

test('hybrid separation is the default', () => {
  assert.equal(SDR.DEFAULTS.separation, 'hybrid');
});

test('theory: absolute < hybrid < relative capacity at motorway speed', () => {
  const v = 100 / 3.6, c = SDR.DEFAULTS;
  const abs = SDR.sdrCapacity(c, 'absolute', v), hyb = SDR.sdrCapacity(c, 'hybrid', v), rel = SDR.sdrCapacity(c, 'relative', v);
  assert.ok(abs < hyb && hyb < rel, `${abs} < ${hyb} < ${rel}`);
  assert.ok(SDR.humanCapacity(c, v) > 1800 && SDR.humanCapacity(c, v) < 2600);
});

test('SDR: no collisions and no authority overrun in normal traffic, every policy', () => {
  for (const separation of ['absolute', 'relative', 'hybrid']) for (const seed of [1, 8]) {
    const r = measure({ mode: 'sdr', separation, seed, ...DEMAND }, 100, 250);
    assert.equal(r.collisions, 0, `${separation} seed ${seed}: collisions`);
    assert.ok(r.minSpare >= 0, `${separation} seed ${seed}: spare ${r.minSpare}`);
    assert.equal(r.w.m.supervision, 0, `${separation} seed ${seed}: supervision brakes`);
  }
});

test('SDR hybrid equals relative when there are no trucks', () => {
  const cfg = { mode: 'sdr', seed: 2, truckShare: 0, ...DEMAND };
  const a = run({ ...cfg, separation: 'hybrid' }, 250).stats(250), b = run({ ...cfg, separation: 'relative' }, 250).stats(250);
  assert.equal(a.completed, b.completed);
  assert.equal(a.flow, b.flow);
});

test('SDR with 20 % radio loss: authority is never overrun and nobody collides', () => {
  for (const lossAdaptive of [true, false]) {
    const r = measure({ mode: 'sdr', seed: 1, packetLoss: 0.2, lossAdaptive, ...DEMAND }, 100, 250);
    assert.equal(r.collisions, 0);
    assert.ok(r.minSpare >= -1e-6, `adaptive ${lossAdaptive}: spare ${r.minSpare}`);
  }
});

test('SDR widens gaps for radio loss, which removes the full-force braking', () => {
  const cfg = { mode: 'sdr', seed: 1, packetLoss: 0.2, ...DEMAND };
  const fixed = measure({ ...cfg, lossAdaptive: false }, 100, 250), adaptive = measure({ ...cfg, lossAdaptive: true }, 100, 250);
  assert.ok(adaptive.w.staleExtra > 0.2 && adaptive.w.staleExtra < 0.6, `allowance ${adaptive.w.staleExtra}`);
  assert.equal(fixed.w.staleExtra, 0);
  assert.ok(Math.abs(adaptive.w.lossEst - 0.2) < 0.05, `measured loss ${adaptive.w.lossEst}`);
  assert.ok(fixed.w.m.supervision > 50, `fixed gaps: ${fixed.w.m.supervision} supervision brakes`);
  assert.ok(adaptive.w.m.supervision < fixed.w.m.supervision / 10, `widened gaps: ${adaptive.w.m.supervision} vs ${fixed.w.m.supervision}`);
});

test("today's road flows freely below capacity, without collisions", () => {
  for (const seed of [1, 2]) {
    const r = measure({ mode: 'human', seed, demandMain: 3000, demandRamp: 600 }, 200, 400);
    assert.equal(r.collisions, 0, `seed ${seed}`);
    assert.ok(r.speedKmh > 95, `seed ${seed}: mean speed ${r.speedKmh.toFixed(0)} km/h`);
    assert.ok(r.served > 0.9 * 3600, `seed ${seed}: served ${r.served.toFixed(0)}`);
    assert.ok(r.hardPer1000km < 80, `seed ${seed}: ${r.hardPer1000km.toFixed(0)} hard brakes per 1000 veh-km`);
    assert.ok(r.queue < 20, `seed ${seed}: ${r.queue} waiting`);
  }
});

test("today's road carries a realistic flow on a plain stretch", () => {
  // handbook range for three lanes with 10 % trucks: roughly 5,450–6,500 veh/h
  const r = measure({ mode: 'human', seed: 1, demandMain: 7200, demandRamp: 0, exitShare: 0 }, 200, 400);
  assert.equal(r.collisions, 0);
  assert.ok(r.served > 5300 && r.served < 6600, `served ${r.served.toFixed(0)}`);
});

test('SDR fail-safe responses: no collisions after seen debris, radio loss, brake loss, segment failure', () => {
  const incidents = {
    // debris must land clear of traffic to be avoidable at all, so look for such a spot
    debris: w => assert.ok(w.dropObjectAhead(3000, 1, 150), 'no free spot for the debris'),
    'radio loss': w => w.commsLoss(3000),
    'brake loss': w => w.degradeBrakes(3000),
    'segment failure': w => { w.toggleSegment(2); w.run(30); w.toggleSegment(2); },
  };
  for (const [name, apply] of Object.entries(incidents)) {
    const w = run({ mode: 'sdr', seed: 4, ...DEMAND }, 200);
    apply(w);
    w.run(120);
    assert.equal(w.m.collisions, 0, name);
  }
});

test('SDR sends a broken-down vehicle to the safety lane', () => {
  const w = run({ mode: 'sdr', seed: 1, safetyLane: true, ...DEMAND }, 200);
  assert.ok(w.breakdown(3700));
  w.run(200);
  assert.equal(w.m.collisions, 0);
  assert.equal(w.m.sidetracked, 1);
  assert.ok(w.m.liveLaneStopS < 1, `stopped in a live lane for ${w.m.liveLaneStopS} s`);
});

test('SDR: the on-ramp is served below capacity, and nobody ends up standing on the ramp', () => {
  // 4,800 + 900 veh/h is less than the hybrid can carry. Before the merge order was corrected, a ramp
  // vehicle that had slowed down was told to stay behind a right-lane vehicle that was already beside
  // it; it braked for that and stopped on the ramp, with the rest of the ramp traffic behind it.
  const cfg = { mode: 'sdr', seed: 1, demandMain: 4800, demandRamp: 900 };
  const waits = w => w.m.admits.filter(a => a.ramp && a.t > 200).map(a => a.wait).sort((a, b) => a - b);
  const now = measure(cfg, 200, 400);
  assert.equal(now.collisions, 0);
  assert.ok(now.w.rampQueue.length < 10, `${now.w.rampQueue.length} waiting at the ramp`);
  const wNow = waits(now.w);
  assert.ok(wNow.length > 80, `${wNow.length} ramp vehicles let in`);
  assert.ok(wNow[Math.floor(0.95 * wNow.length)] < 20, `95th percentile ramp wait ${wNow[Math.floor(0.95 * wNow.length)].toFixed(0)} s`);
  const old = measure({ ...cfg, ghostFrame: false, ghostType: false, rampLaneWindow: 0, rampMaxWait: 45 }, 200, 400);
  assert.ok(old.w.rampQueue.length > 3 * now.w.rampQueue.length + 20, `old rule: ${old.w.rampQueue.length} waiting at the ramp`);
});

test('every vehicle let in at a gate is recorded with its wait', () => {
  for (const mode of ['sdr', 'human']) {
    const w = run({ mode, seed: 2, ...DEMAND }, 150);
    assert.equal(w.m.admits.length, w.nextId - 1 - w.mainQueue.length - w.rampQueue.length, mode);
    assert.ok(w.m.admits.every(a => a.wait >= 0 && a.t <= w.t), mode);
    assert.ok(w.m.admits.some(a => a.ramp) && w.m.admits.some(a => a.truck), mode);
  }
});

test('paired comparison: the traffic both rows share drops out of the difference', () => {
  const { pairedStat } = require('../experiments.js');
  // five seeds with very different traffic; B is always exactly 10 above A
  const a = [100, 300, 200, 500, 400], b = a.map(x => x + 10);
  const same = pairedStat(b, a);
  assert.equal(same.diff, 10);
  assert.equal(same.verdict, 'outside the noise');
  assert.ok(Math.abs(same.lo - 10) < 1e-9 && Math.abs(same.hi - 10) < 1e-9);
  // a difference that changes sign from seed to seed is within the noise
  const noisy = pairedStat([110, 290, 210, 490, 405], a);
  assert.equal(noisy.verdict, 'within the noise');
  assert.ok(noisy.lo < 0 && noisy.hi > 0);
  // known case: differences 1..5 -> mean 3, sd 1.5811, t(4) = 2.776 -> half-width 1.963
  const k = pairedStat([1, 2, 3, 4, 5], [0, 0, 0, 0, 0]);
  assert.ok(Math.abs(k.diff - 3) < 1e-9 && Math.abs(k.hi - 4.963) < 0.001 && Math.abs(k.lo - 1.037) < 0.001, JSON.stringify(k));
  assert.equal(pairedStat([0, 0, 0], [0, 0, 0]).verdict, 'identical');
  assert.equal(pairedStat([1, NaN, 3], [1, 2, NaN]).n, 1);
});

// ---- cheaper truck rules (roadmap 1.2)
const TRUCKS = { mode: 'sdr', separation: 'hybrid', truckShare: 0.2, ...DEMAND };

test('truck-rule options are off by default', () => {
  const d = SDR.DEFAULTS;
  assert.deepEqual([d.secureLoadShare, d.truckGapConfirm, d.loadSlideDecel, d.truckBehindTruckRelative, d.truckLane], [0, 0, 0, false, false]);
});

test('the gap behind a truck: brick wall, sliding load or relative, and the confirmation time is extra buffer', () => {
  const truck = { type: 'truck', x: 200, length: 16.5, v: 25, a: 0, bMax: 6, brakeFactor: 1, bfKnown: 1 };
  const car = { type: 'car', id: 7, x: 100, v: 25, a: 0, bMax: 8, brakeFactor: 1, bfKnown: 1, lane: 1, laneTo: null };
  const behind = cfg => new World({ mode: 'sdr', separation: 'hybrid', ...cfg })._eoaBehind(truck, car);
  const wall = behind({}), rel = behind({ hybridTruckAbsolute: false }), slide = behind({ loadSlideDecel: 12 });
  assert.ok(Math.abs(wall.e - (200 - 16.5 - 2.5)) < 1e-9, `brick wall: ${wall.e}`);
  // a load that slides to rest at 12 m/s² travels 26 m: the gap may be that much shorter than a brick wall
  assert.ok(rel.e > slide.e && slide.e > wall.e, `${rel.e} > ${slide.e} > ${wall.e}`);
  assert.ok(Math.abs(slide.e - (wall.e + 25 * 25 / 24)) < 1e-9);
  // a load that slows more gently than the follower can brake (6 m/s², against 7.2) never licenses less than the relative gap
  assert.equal(behind({ loadSlideDecel: 6 }).e, rel.e);
  assert.equal(behind({ loadSlideDecel: 6, truckGapConfirm: 1 }).conf, 1);
  assert.equal(behind({ truckGapConfirm: 1 }).e, wall.e);
  assert.equal(behind({ truckGapConfirm: 1 }).conf, 1);
  assert.equal(wall.conf, 0);
  // enclosed, monitored load, and a truck following a truck
  assert.equal(new World({ mode: 'sdr' })._eoaBehind({ ...truck, secure: true }, car).e, rel.e);
  const lorry = { ...car, type: 'truck', bMax: 6 };
  const w = new World({ mode: 'sdr', truckBehindTruckRelative: true });
  assert.ok(w._eoaBehind(truck, lorry).e > wall.e);
  assert.equal(w._eoaBehind(truck, car).e, wall.e);
});

test('no truck rule behind enclosed trucks: with every truck enclosed the hybrid is relative separation', () => {
  const a = run({ ...TRUCKS, seed: 2, secureLoadShare: 1 }, 250).stats(250), b = run({ ...TRUCKS, seed: 2, hybridTruckAbsolute: false }, 250).stats(250);
  assert.equal(a.completed, b.completed);
  assert.equal(a.flow, b.flow);
  // and the share is honoured without changing who the vehicles are
  const w = run({ ...TRUCKS, seed: 2, secureLoadShare: 0.5 }, 250);
  const trucks = w.vehicles.filter(v => v.type === 'truck');
  const share = trucks.filter(v => v.secure).length / trucks.length;
  assert.ok(trucks.length > 20 && share > 0.25 && share < 0.75, `${trucks.length} trucks, ${share.toFixed(2)} enclosed`);
  assert.ok(w.vehicles.every(v => v.type === 'truck' || !v.secure));
});

test('every truck-rule variant: no collisions, no authority overrun, no full-force braking in normal traffic', () => {
  const variants = [{ secureLoadShare: 0.5 }, { truckGapConfirm: 1 }, { loadSlideDecel: 6, truckGapConfirm: 1 }, { truckBehindTruckRelative: true }, { truckLane: true }];
  for (const v of variants) {
    const r = measure({ ...TRUCKS, seed: 3, ...v }, 100, 250);
    const name = JSON.stringify(v);
    assert.equal(r.collisions, 0, name);
    assert.ok(r.minSpare >= 0, `${name}: spare ${r.minSpare}`);
    assert.equal(r.w.m.supervision, 0, `${name}: supervision brakes`);
  }
});

test('truck lane: trucks stay in the right lane and cars do not enter in it', () => {
  const w = run({ ...TRUCKS, seed: 1, truckLane: true }, 300);
  const live = w.vehicles.filter(v => v.lane >= 0 && v.lane < w.S);
  assert.ok(live.filter(v => v.type === 'truck').length > 20);
  assert.ok(live.filter(v => v.type === 'truck').every(v => v.lane === 0), 'a truck outside the right lane');
  // before the on-ramp nobody has had a reason to use the right lane except trucks
  assert.equal(live.filter(v => v.type === 'car' && v.lane === 0 && v.x < w.cfg.rampStartX).length, 0);
});

test('a lost load can slide to rest', () => {
  const w = new World({ mode: 'sdr', demandMain: 0, demandRamp: 0 });
  const still = w.addDebris(1000, 1), sliding = w.addDebris(2000, 1, 24, 6);
  w.run(6);
  assert.equal(still.x, 1001);
  assert.equal(sliding.v, 0);
  assert.ok(Math.abs(sliding.x - (2001 + 24 * 24 / 12)) < 0.5, `came to rest at ${sliding.x}`);
});

// ---- roadmap 2: sensitivity, ice rule, human calibration
test('the new assumption parameters default to the values used before', () => {
  const d = SDR.DEFAULTS;
  assert.equal(d.carBrake, SDR.TYPES.car.bMax);
  assert.equal(d.humanT, SDR.HUMAN.T);
  assert.deepEqual([d.humanSurprise, d.gripPlanShare, d.frictionActual], [0.7, 1, 0]);
});

test('car braking, human headway and surprise delay are drawn per vehicle from the settings', () => {
  const v = cfg => { const w = new World({ mode: 'human', seed: 4, ...cfg }); return [0, 1, 2, 3, 4, 5].map(() => w._makeVehicle(w.mainRng, 'main')); };
  const a = v({}), b = v({ carBrake: 6, humanT: 1.0, humanSurprise: 0.3 });
  for (let i = 0; i < a.length; i++) {
    assert.equal(b[i].type, a[i].type);                              // the same traffic
    assert.equal(b[i].bMax, a[i].type === 'car' ? 6 : a[i].bMax);
    assert.ok(b[i].hT < a[i].hT);
    assert.ok(Math.abs(b[i].hSurprise - Math.max(0, a[i].hSurprise - 0.4)) < 1e-12);
  }
  // theory follows: weaker brakes cost capacity, shorter human headways raise today's capacity
  const cfg = SDR.DEFAULTS;
  assert.ok(SDR.sdrCapacity({ ...cfg, carBrake: 6 }, 'hybrid', 30) < SDR.sdrCapacity(cfg, 'hybrid', 30));
  assert.ok(SDR.humanCapacity({ ...cfg, humanT: 1.0 }, 30) > SDR.humanCapacity(cfg, 30));
});

test('ice: planning with part of the grip widens the gap and lowers the speed, for SDR only', () => {
  const ice = { friction: 0.3 };
  const car = { bMax: 8, brakeFactor: 1, bfKnown: 1 };
  const sdr = new World({ mode: 'sdr', ...ice, gripPlanShare: 0.6 }), full = new World({ mode: 'sdr', ...ice }), human = new World({ mode: 'human', ...ice, gripPlanShare: 0.6 });
  assert.ok(Math.abs(sdr._bEff(car) - 0.6 * full._bEff(car)) < 1e-9);
  assert.equal(human._bEff(car), full._bEff(car));
  assert.equal(sdr._bLead(car), full._bLead(car));                   // the leader may still brake with all the grip there is
  assert.ok(sdr._sightSpeed(car) < full._sightSpeed(car));
  assert.ok(SDR.sdrCapacity({ ...SDR.DEFAULTS, ...ice, gripPlanShare: 0.6 }, 'relative', 20) < SDR.sdrCapacity({ ...SDR.DEFAULTS, ...ice }, 'relative', 20));
  // black ice: the tyres give less than the road measured, the road does not know
  const black = new World({ mode: 'sdr', ...ice, frictionActual: 0.24 });
  assert.equal(black._bEff(car), full._bEff(car));
  assert.ok(black._bTrue(car) < full._bTrue(car));
});

test('SDR on ice: no collisions in normal traffic with the speed cap, also on black ice', () => {
  const r = measure({ mode: 'sdr', seed: 2, friction: 0.3, frictionActual: 0.24, speedLimit: 60 / 3.6, demandMain: 3000, demandRamp: 600 }, 100, 300);
  assert.equal(r.collisions, 0);
  assert.ok(r.minSpare >= 0, `spare ${r.minSpare}`);
});

test('false alarms and shared misses are off by default', () => {
  const d = SDR.DEFAULTS;
  assert.equal(d.roadFalseAlarmRate, 0);
  assert.equal(d.carFalseAlarmRate, 0);
  assert.equal(d.sharedMissProb, 0);
  assert.equal(d.sharedMissRoadDetect, null);
});

test('a road false alarm closes the lane like debris; nobody hits it, and the re-check clears it', () => {
  const w = run({ mode: 'sdr', seed: 1, ...DEMAND }, 200);
  const o = w.falseAlarm(3000, 1);
  // vehicles 300–1,000 m upstream in that lane stop before it or leave the lane: none drives past it in that lane
  const upstream = new Set(w.vehicles.filter(v => v.lane === 1 && v.laneTo === null && v.x > 2000 && v.x < 2700).map(v => v.id));
  assert.ok(upstream.size > 3, `${upstream.size} vehicles upstream`);
  const spot = o.x - o.length, before = new Map(w.vehicles.map(v => [v.id, v.x]));
  let passed = 0, left = 0;
  for (let i = 0; i < Math.round(50 / w.cfg.dt); i++) {
    w.step();
    for (const v of w.vehicles) {
      const crossed = upstream.has(v.id) && before.get(v.id) <= spot && v.x > spot;
      if (crossed && (v.lane === 1 || v.laneTo === 1)) passed++;
      if (crossed) left++;
      before.set(v.id, v.x);
    }
  }
  assert.equal(passed, 0, 'a vehicle drove past the closed spot in its lane');
  assert.ok(left > 3, `only ${left} of them got past it in another lane`);
  assert.ok(w.obstacles.includes(o), 'cleared too early');
  w.run(w.cfg.falseAlarmClearTime);
  assert.ok(!w.obstacles.includes(o), 'not cleared');
  assert.equal(w.m.collisions, 0);
  assert.equal(w.m.roadFalseAlarms, 1);
});

test('road false alarms arrive at the set rate, and SDR stays collision-free', () => {
  // 10 per km per hour on 5 km for 12 minutes: 10 expected
  const w = run({ mode: 'sdr', seed: 2, ...DEMAND, roadFalseAlarmRate: 10, falseAlarmClearTime: 10 }, 720);
  assert.ok(w.m.roadFalseAlarms >= 3 && w.m.roadFalseAlarms <= 20, `${w.m.roadFalseAlarms} false alarms`);
  assert.equal(w.m.collisions, 0);
});

test('a false target makes the vehicle brake hard; SDR reports it unless told not to; today\'s road brakes by driver assistance', () => {
  for (const [mode, share] of [['sdr', 'road'], ['sdr', 'none'], ['human', 'road']]) {
    const w = run({ mode, seed: 3, ...DEMAND, carSensorShare: share }, 200);
    const v = w.vehicles.find(u => u.lane === 1 && u.x > 1500 && u.x < 2500 && u.v > 25 && u.type === 'car');
    assert.ok(v, mode);
    const n0 = w.obstacles.length;
    w.carFalseTarget(v, 30);
    let aMin = 0;
    for (let i = 0; i < 10; i++) { w.step(); aMin = Math.min(aMin, v.a); }
    assert.ok(aMin < -6, `${mode}/${share}: braked at ${aMin.toFixed(1)} m/s²`);
    assert.equal(w.m.falseBrakes, 1, `${mode}/${share}`);
    const reported = w.obstacles.filter(o => o.phantom);
    if (mode === 'sdr' && share === 'road') assert.ok(reported.length === 1 && reported[0].known, 'not reported to the road');
    else assert.equal(w.obstacles.length, n0, `${mode}/${share}: reported`);
    w.run(60);
    assert.equal(w.m.collisions, 0, `${mode}/${share}: collision`);
  }
});

test('shared misses: a hard-to-see object is missed by every car alike, and by the road if set', () => {
  const w = run({ mode: 'sdr', seed: 1, ...DEMAND, carDetectProb: 1, sharedMissProb: 1, sharedMissDetect: 0, sharedMissRoadDetect: 0 }, 100);
  const o = w.addDebris(3000, 1);
  assert.ok(o.hard && !o.roadSees);
  assert.ok(w.vehicles.slice(0, 20).every(v => !w._carSees(v, o)));
  const easy = run({ mode: 'sdr', seed: 1, ...DEMAND, carDetectProb: 1, sharedMissProb: 0, sharedMissDetect: 0, sharedMissRoadDetect: 0 }, 100);
  const e = easy.addDebris(3000, 1);
  assert.ok(!e.hard && e.roadSees);
  assert.ok(easy.vehicles.slice(0, 20).every(v => easy._carSees(v, e)));
});

test('a vehicle that cannot stop before a false alarm still counts as the follower for a lane change in front of it', () => {
  // Found with car false targets reported to the road: a false alarm appeared 20 m in front of a car at 110 km/h; the
  // road let a slow vehicle change into that lane just past the "object", the car came through it and hit the vehicle.
  const setup = (xb, xa) => {
    const w = new World({ mode: 'sdr', demandMain: 0, demandRamp: 0, truckShare: 0 });
    w.run(1);
    const mk = (x, lane, speed) => { const v = w._makeVehicle(w.mainRng, 'main'); w._initVehicle(v, x, lane, speed); return v; };
    mk(xb, 2, 30);
    const a = mk(xa || 3010, 1, 9);
    w._buildLanes();
    w.falseAlarm(2999, 2);
    return w._sdrLaneChangeFeasible(a, 2);
  };
  assert.equal(setup(2980), false, 'lane change granted in front of a car that cannot stop before the false alarm');
  assert.equal(setup(2850), true, 'a car that can stop before the object does not count');
  // and the object itself still has to be clear of the vehicle's body (a first version of the fix forgot this)
  assert.equal(setup(2850, 3002), false, 'lane change granted with the object beside the vehicle');
});

test('a car\'s false target lies in the free road before the vehicle ahead', () => {
  const w = run({ mode: 'sdr', seed: 1, ...DEMAND, carFalseAlarmRate: 20, carSensorShare: 'none' }, 300);
  let n = 0;
  for (let i = 0; i < 200; i++) {
    w.step();
    for (const v of w.vehicles) {
      if (!v.falseTarget || v.falseTarget.checked) continue;
      v.falseTarget.checked = true; n++;
      const o = w._ahead(v.falseTarget.lane, v.x, v, false);
      if (o && !o.phantom && !o.isWall) assert.ok(v.falseTarget.x <= o.x - o.length + 0.5, `false target beyond the vehicle ahead`);
    }
  }
  assert.ok(n > 10, `${n} false targets`);
});

test('radio model options are off by default', () => {
  const d = SDR.DEFAULTS;
  assert.equal(d.lossBurst, 0);
  assert.equal(d.radioPaths, 1);
  assert.equal(d.lossCommon, 0);
  assert.equal(d.repeatGap, 0);
  assert.ok(!(d.outageX1 > d.outageX0));
  assert.equal(d.lossBurstAware, false);
  assert.equal(d.laneChangeAck, true);   // the one radio option that is on: lane changes wait for the acknowledgement
  assert.equal(new World({})._radioModelOn(), false);
});

// send one authority per control cycle to a vehicle standing at x, n times; returns the loss rate and the
// chance that a message is lost when the one before it was
function sendMany(cfg, n, x) {
  const w = new World({ mode: 'sdr', demandMain: 0, demandRamp: 0, ...cfg });
  const v = { x: x || 1000 };
  let lost = 0, prev = false, after = 0, both = 0;
  for (let i = 0; i < n; i++) {
    w.t += w.cfg.controlPeriod;
    const l = w._radioDeliver(v) < 0;
    if (prev) { after++; if (l) both++; }
    if (l) lost++;
    prev = l;
  }
  return { rate: lost / n, stay: after ? both / after : 0 };
}

test('radio bursts keep the long-run loss rate; a second independent path squares it, a common cause does not', () => {
  const N = 50000;
  const ind = sendMany({ packetLoss: 0.1 }, N);   // independent, through the new model
  const burst = sendMany({ packetLoss: 0.1, lossBurst: 0.5 }, N);
  assert.ok(Math.abs(ind.rate - 0.1) < 0.01 && Math.abs(burst.rate - 0.1) < 0.02, `rates ${ind.rate} ${burst.rate}`);
  // in bursts of 0.5 s mean, a lost message is followed by another one with chance 0.1 + 0.9·exp(-0.1 / (0.5·0.9)) = 0.82
  assert.ok(Math.abs(burst.stay - 0.82) < 0.03, `burst: lost after lost ${burst.stay}`);
  const two = sendMany({ packetLoss: 0.1, lossBurst: 0.5, radioPaths: 2 }, N);
  assert.ok(Math.abs(two.rate - 0.01) < 0.004, `two independent paths: ${two.rate}`);
  const common = sendMany({ packetLoss: 0.1, lossBurst: 0.5, radioPaths: 2, lossCommon: 1 }, N);
  assert.ok(Math.abs(common.rate - 0.1) < 0.02, `two paths, all loss common: ${common.rate}`);
  const half = sendMany({ packetLoss: 0.1, lossBurst: 0.5, radioPaths: 2, lossCommon: 0.5 }, N);
  assert.ok(half.rate > 0.04 && half.rate < 0.08, `two paths, half the loss common: ${half.rate}`);   // 0.05 + 0.95·0.053² ≈ 0.053
});

test('a radio dead spot loses every message, unless a second path is not affected', () => {
  const dead = { outageX0: 900, outageX1: 1100 };
  assert.equal(sendMany(dead, 100, 1000).rate, 1);
  assert.equal(sendMany(dead, 100, 1200).rate, 0);
  assert.equal(sendMany({ ...dead, radioPaths: 2, outageAllPaths: false }, 100, 1000).rate, 0);
  const timed = sendMany({ ...dead, outageT0: 5, outageT1: 8 }, 100, 1000).rate;   // 3 s of 10 s
  assert.ok(timed >= 0.29 && timed <= 0.31, `timed dead spot: ${timed}`);
  assert.ok(Math.abs(sendMany({ packetLoss: 0.1, repeatGap: 0.05 }, 20000).rate - 0.01) < 0.004, 'independent loss, sent twice');
  // with the second path covering it, the dead spot changes nothing at all
  const a = run({ mode: 'sdr', seed: 4, ...DEMAND }, 200).stats(200);
  const b = run({ mode: 'sdr', seed: 4, ...DEMAND, outageX0: 2700, outageX1: 2720, radioPaths: 2, outageAllPaths: false }, 200).stats(200);
  assert.deepEqual(a, b);
});

test('burst-aware allowance: the same as before for independent loss, wider for bursts', () => {
  const allowance = (aware, both) => {
    const w = new World({ mode: 'sdr', demandMain: 0, demandRamp: 0, lossBurstAware: aware });
    for (let i = 0; i < 2000; i++) w._measureLoss(1000, 50, 50, both);   // 5 % loss; `both` of the 50 follow a lost message
    return w.staleExtra;
  };
  const old = allowance(false, 2.5);
  assert.ok(old > 0.1 && old < 0.12, `independent-loss allowance ${old}`);
  assert.ok(Math.abs(allowance(true, 2.5) - old) < 1e-9, 'aware, independent loss');
  assert.equal(allowance(false, 40), old, 'the old estimate ignores bursts');
  // 5 % loss, 80 % of lost messages followed by another: runs of k have the chance 0.05·0.8^(k-1)
  const k = 1 + Math.log(1e-4 / 0.05) / Math.log(0.8);
  assert.ok(Math.abs(allowance(true, 40) - Math.min(3, 0.1 * (k - 2))) < 1e-6, `aware, bursts: ${allowance(true, 40)}`);
  // below 0.2 % loss the old estimate adds nothing; bursts can still need an allowance (0.1 % loss, 66 % lost after lost)
  const low = aware => { const w = new World({ mode: 'sdr', demandMain: 0, demandRamp: 0, lossBurstAware: aware }); for (let i = 0; i < 2000; i++) w._measureLoss(1000, 1, 1, 0.66); return w.staleExtra; };
  assert.equal(low(false), 0);
  assert.ok(Math.abs(low(true) - 0.1 * (Math.log(1e-4 / 0.001) / Math.log(0.66) - 1)) < 1e-6, `aware, low loss in bursts: ${low(true)}`);
});

test('lane change acknowledgement: neither the changer nor the new follower is left on an authority not computed for the change', () => {
  const cfg = { mode: 'sdr', seed: 1, ...DEMAND, packetLoss: 0.05, lossBurst: 0.5 };
  // every change starts with the instruction at the changer and an authority behind the changer at the follower
  const w = new World({ ...cfg, laneChangeAck: true });
  const start = w._sdrStartLaneChange.bind(w);
  let n = 0, bad = 0;
  w._sdrStartLaneChange = (v, L) => {
    n++;
    if (!(v.plan && v.plan.lcTo === L)) bad++;
    const f = w._behind(L, v.x, v, true);
    if (f && !f.isObstacle && !w._isStatic(f) && f.buf && !(f.plan && f.plan.yieldId === v.id)) bad++;
    return start(v, L);
  };
  w.run(200);
  assert.ok(n > 100 && bad === 0, `${n} lane changes, ${bad} without acknowledgement`);
  const off = measure({ ...cfg, laneChangeAck: false }, 100, 250), on = measure({ ...cfg, laneChangeAck: true }, 100, 250);
  assert.ok(off.w.m.lcExposed > 0, `without acknowledgement: ${off.w.m.lcExposed} vehicles left on an old authority`);
  assert.ok(on.w.m.laneChangesSdr > 200, `${on.w.m.laneChangesSdr} lane changes`);
  assert.equal(on.w.m.lcExposed, 0);
  assert.equal(on.w.m.lcMinSpare, Infinity);
  assert.equal(on.collisions, 0);
  // a few millimetres at crawling speed come from the conservative sum in _stopCommitted, not from an overrun
  assert.ok(on.minSpare > -0.01, `spare ${on.minSpare}`);
});

test('lane change acknowledgement: both requests are renewed while the change waits, so they cannot fall out of step', () => {
  // Regression: only the missing request was renewed. With the changer holding its instruction and the follower not
  // (or the other way round) the two alternated for ever and a ramp vehicle stood at the end of the acceleration lane:
  // gridlock in 1 of 15 runs at 3,600 + 600 veh/h (relative separation) and in 2 of 5 with a 0.5 s control cycle.
  const w = run({ mode: 'sdr', seed: 1, ...DEMAND, laneChangeAck: true }, 200);
  let v = null, L = -1, fol = null;
  for (const c of w.vehicles) {
    if (c.isObstacle || c.laneTo !== null || c.lane < 0 || c.lane + 1 >= w.cfg.lanes || !c.plan) continue;
    const f = w._behind(c.lane + 1, c.x, c, true);
    if (f && !f.isObstacle && !w._isStatic(f) && f.buf && f.plan) { v = c; L = c.lane + 1; fol = f; break; }
  }
  assert.ok(v, 'a vehicle with a follower in the next lane');
  const ask = (changerHas, followerHas) => {
    v.plan = { ...v.plan, lcTo: changerHas ? L : null }; fol.plan = { ...fol.plan, yieldId: followerHas ? v.id : 0 };
    v._lcWant = null; fol._yieldFor = null;
    const ok = w._laneChangeAcked(v, L);
    return { ok, changer: v._lcWant === L, follower: fol._yieldFor === v };
  };
  for (const [c, f] of [[false, false], [true, false], [false, true]]) {
    assert.deepEqual(ask(c, f), { ok: false, changer: true, follower: true }, `changer ${c}, follower ${f}`);
  }
  assert.equal(ask(true, true).ok, true);
});

test('lane change acknowledgement: the instruction never asks for an authority the changer cannot keep', () => {
  // Regression: a vehicle waiting to move into a lane was given an authority behind the leader there, even after
  // another vehicle had moved into that lane alongside it in the same cycle (here at t = 578.75 s): a 16 m overrun.
  const w = run({ mode: 'sdr', seed: 1, demandMain: 7200, demandRamp: 900, packetLoss: 0.1, laneChangeAck: true }, 590);
  assert.ok(w.m.minSpare > -0.01, `spare ${w.m.minSpare}`);
  assert.equal(w.m.collisions, 0);
});
