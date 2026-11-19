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
