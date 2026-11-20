/*
 * Self-check for fit-detector.js: synthetic detector data with a known free-flow speed, capacity and
 * queue discharge flow, which the fit must recover.
 *   node --test simulator/test/fit-detector.test.js      (a few seconds, most of it a short simulator run)
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { readRecords, fit, toMarkdown, simulate } = require('../fit-detector.js');

const FFS = 115, CAP = 6300, DIS = 5500, DAYS = 4, SHARES = [0.30, 0.35, 0.35], TRUCKS = 0.12;

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// One row per minute. Each "day": flow rises from 2,000 to capacity over 60 min, holds capacity for 20 min,
// breaks down (45 min of queue discharge, slow upstream), then recovers. Day 1 has a 5-minute dip in the
// upstream speed that is too short to count as a breakdown.
function synthetic(seed) {
  const rng = mulberry32(seed), noise = f => 1 + f * (2 * rng() - 1);
  const speedAt = q => q < 3500 ? FFS : FFS - 25 * ((q - 3500) / (CAP - 3500)) ** 2;
  const rows = [];
  for (let d = 0; d < DAYS; d++) {
    const t0 = Date.UTC(2024, 2, 4 + d, 6, 0, 0);
    for (let m = 0; m < 155; m++) {
      let q, v, up;
      if (m < 60) { q = 2000 + (CAP - 2000) * m / 60; v = speedAt(q); up = v; }
      else if (m < 80) { q = CAP; v = speedAt(q); up = v; }
      else if (m < 125) { q = DIS; v = 70; up = 25; }
      else { q = 3500; v = FFS; up = FFS; }
      if (d === 0 && m >= 30 && m < 35) up = 60;
      q *= noise(0.02); v *= noise(0.01); up *= noise(0.01);
      rows.push({ t: t0 + m * 60000, lanes: SHARES.map(s => q * s), v, up, trucks: TRUCKS * noise(0.1) });
    }
  }
  return rows;
}

// per-lane flows in veh/h, ISO timestamps, a separate upstream speed column, truck share as a fraction
function csvPerLane(rows) {
  const head = 'timestamp,q_r,q_m,q_l,v_r,v_m,v_l,v_upstream,hgv';
  return [head, ...rows.map(r => [new Date(r.t).toISOString(), ...r.lanes.map(q => q.toFixed(0)), r.v, r.v, r.v, r.up, r.trucks].join(','))].join('\n');
}
// one count column per minute, numeric seconds, ';' separator, truck share in %, speed only (no upstream column)
function csvCounts(rows) {
  return ['sec;count;speed;trucks_pct', ...rows.map(r => [r.t / 1000, (r.lanes.reduce((a, b) => a + b) / 60).toFixed(2), r.up.toFixed(1), (100 * r.trucks).toFixed(1)].join(';'))].join('\n');
}

const near = (got, want, tol, what) => assert.ok(Math.abs(got - want) <= tol, `${what}: got ${got}, expected ${want} ± ${tol}`);

test('recovers capacity, discharge, drop and free-flow speed from per-lane data', () => {
  const recs = readRecords(csvPerLane(synthetic(1)), {
    time: 'timestamp', flow: 'q_r,q_m,q_l', speed: 'v_r,v_m,v_l', state: 'v_upstream', trucks: 'hgv',
  });
  const r = fit(recs);
  assert.equal(r.events.length, DAYS, 'one breakdown per day; the short dip does not count');
  near(r.capacity, CAP, 0.02 * CAP, 'capacity');
  near(r.discharge, DIS, 0.02 * DIS, 'discharge');
  near(r.drop, 1 - DIS / CAP, 0.02, 'capacity drop');
  near(r.freeFlowSpeed, FFS, 2, 'free-flow speed');
  near(r.truckShare, TRUCKS, 0.01, 'truck share');
  assert.equal(r.lanes.length, 3);
  r.lanes.forEach((l, i) => near(l.capacity, CAP * SHARES[i], 0.03 * CAP * SHARES[i], `lane ${i} capacity`));
  // the speed-flow curve: congested intervals sit at the discharge flow, free ones span the whole range
  const congAt = (lo, hi) => r.bins.filter(b => b.from >= lo && b.to <= hi).reduce((n, b) => n + b.cong.length, 0);
  assert.ok(congAt(5000, 6000) >= DAYS * 8, 'congested intervals at the discharge flow');
  assert.ok(r.bins[0].free.length > 0 && r.bins[r.bins.length - 1].free.length > 0, 'free intervals from low flow up to capacity');
  const md = toMarkdown(r, 'synthetic');
  assert.match(md, /Capacity before breakdown/);
  assert.match(md, /Flow per lane/);
});

test('reads counts with a computed interval, percentages and another separator', () => {
  const recs = readRecords(csvCounts(synthetic(2)), { sep: ';', time: 'sec', count: 'count', speed: 'speed', trucks: 'trucks_pct' });
  const r = fit(recs);
  assert.equal(r.events.length, DAYS);
  near(r.capacity, CAP, 0.02 * CAP, 'capacity');
  near(r.discharge, DIS, 0.02 * DIS, 'discharge');
  near(r.truckShare, TRUCKS, 0.01, 'truck share');
  // conversion to 10 % trucks with a truck = 2 pcu: (1 + 0.12) / (1 + 0.10)
  near(r.capacity * r.toRef, r.capacity * 1.12 / 1.10, 0.005 * CAP, 'converted capacity');
});

test('no breakdown in free-flowing data gives no capacity, not a wrong one', () => {
  const rows = synthetic(3).filter((_, i) => i % 155 < 60);   // only the rising part of each day
  const r = fit(readRecords(csvPerLane(rows), { time: 'timestamp', flow: 'q_r,q_m,q_l', speed: 'v_r,v_m,v_l', state: 'v_upstream' }));
  assert.equal(r.events.length, 0);
  assert.ok(Number.isNaN(r.capacity) && Number.isNaN(r.discharge));
  assert.ok(r.q95free > 5000);
});

test('the simulator sampler writes the same CSV format (short smoke run)', () => {
  const sim = simulate({ warm: 7, rise: 0, hold: 0, 'main-from': 3000, seed: 4 });
  const lines = sim.csv.trim().split('\n');
  assert.equal(lines[0], 'time,flow_0,flow_1,flow_2,speed_0,speed_1,speed_2,speed_up,truck_share');
  assert.equal(lines.length, 1 + 2, 'one row per minute after the 5-minute fill');
  const recs = readRecords(sim.csv, sim.columns);
  assert.equal(recs.length, 2);
  for (const r of recs) {
    assert.ok(r.flow > 2000 && r.flow < 5500, `flow ${r.flow}`);       // 3,000 main + 900 ramp
    assert.ok(r.speed > 80 && r.speed < 140, `speed ${r.speed}`);
  }
});
