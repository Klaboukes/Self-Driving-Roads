/* SDR simulator — browser UI. Depends on engine.js (window.SDR). */
(function () {
  'use strict';
  const { World, sdrCapacity, humanCapacity, sdrOptimalSpeed } = window.SDR;
  const $ = id => document.getElementById(id);
  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);

  // ------------------------------------------------------------------ colour
  // Sequential blue ramp (reference palette). Light mode: light = free flow, dark = slow.
  // Dark mode is stepped the other way so "nothing happening" recedes into the dark surface.
  const RAMP = ['#cde2fb', '#b7d3f6', '#9ec5f4', '#86b6ef', '#6da7ec', '#5598e7', '#3987e5', '#2a78d6', '#256abf', '#1c5cab', '#184f95', '#104281', '#0d366b'];
  const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const RAMP_RGB = RAMP.map(hexRgb);
  let C = {};      // resolved CSS tokens
  let dark = false;

  function isDark() {
    const t = document.documentElement.dataset.theme;
    if (t === 'dark') return true;
    if (t === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function readTheme() {
    dark = isDark();
    const cs = getComputedStyle(document.documentElement);
    for (const k of ['surface', 'surface-2', 'ink', 'ink-2', 'muted', 'grid', 'axis', 'road', 'lane-line', 'series-1', 'series-2', 'series-3', 'series-4', 'shoulder',
      'warning', 'serious', 'critical', 'envelope', 'border']) C[k] = cs.getPropertyValue('--' + k).trim();
    tsDirty = true;
    document.querySelectorAll('.slowWord').forEach(e => { e.textContent = dark ? 'bright' : 'dark'; });
    document.querySelectorAll('.fastWord').forEach(e => { e.textContent = dark ? 'dark' : 'light'; });
  }
  // congestion 0 (free flow) .. 1 (stopped) -> ramp index
  function rampIndex(cong, lo, hi) {
    const i = Math.round(lo + clamp(cong, 0, 1) * (hi - lo));
    return dark ? RAMP.length - 1 - i : i;
  }
  const congestion = v => 1 - v / 33.3;
  const vehColor = v => RAMP[rampIndex(congestion(v), 4, 12)];

  // ------------------------------------------------------------------ state
  const state = {
    running: true, speed: 5, focus: 3000, compare: true, seed: 1,
    weather: 1.0, separation: 'absolute', speedPolicy: 'fixed', carSensorShare: 'road',
  };
  let worlds = {}, ts = {}, acc = 0, prev = {};
  let tsDirty = true;
  const events = [];

  function baseCfg() {
    return {
      seed: state.seed,
      demandMain: +$('demandMain').value,
      demandRamp: +$('demandRamp').value,
      truckShare: +$('truckShare').value / 100,
      friction: state.weather,
      speedLimit: +$('speedLimit').value / 3.6,
      safetyLane: $('safetyLane').checked,
    };
  }
  function sdrCfg() {
    return {
      separation: state.separation, speedPolicy: state.speedPolicy, packetLoss: +$('packetLoss').value / 100,
      roadDetectProb: +$('roadDetect').value / 100, carDetectProb: +$('carDetect').value / 100, carSensorShare: state.carSensorShare,
    };
  }
  function makeWorlds() {
    worlds = {
      sdr: new World(Object.assign(baseCfg(), sdrCfg(), { mode: 'sdr' })),
      human: new World(Object.assign(baseCfg(), { mode: 'human' })),
    };
    ts = { sdr: new TimeSpace(), human: new TimeSpace() };
    prev = {};
    acc = 0;
    events.length = 0;
    renderEvents();
    logEvent('info', null, `Started: ${fmtDemand()}`);
  }
  const fmtDemand = () => `${(+$('demandMain').value).toLocaleString('en-US')} veh/h main + ${(+$('demandRamp').value).toLocaleString('en-US')} veh/h on-ramp`;
  function activeWorlds() { return state.compare ? ['sdr', 'human'] : ['sdr']; }

  // ------------------------------------------------------------------ time-space buffer
  function TimeSpace() {
    this.rows = 300; this.bins = 100; this.binSize = 50; this.every = 2;
    this.data = new Float32Array(this.rows * this.bins).fill(NaN);
    this.head = 0; this.next = 0;
    this.img = null;
  }
  TimeSpace.prototype.sample = function (w) {
    if (w.t < this.next) return;
    this.next = w.t + this.every;
    const prof = w.speedProfile(this.binSize);
    this.data.set(prof, this.head * this.bins);
    this.head = (this.head + 1) % this.rows;
    this.dirty = true;
  };
  TimeSpace.prototype.image = function (ctx) {
    if (this.img && !this.dirty && !tsDirty) return this.img;
    const { rows, bins } = this;
    const id = ctx.createImageData(bins, rows);
    const bg = hexRgb(C.surface.length === 7 ? C.surface : '#fcfcfb');
    for (let r = 0; r < rows; r++) {
      const src = ((this.head - 1 - r) % rows + rows) % rows;
      for (let b = 0; b < bins; b++) {
        const v = this.data[src * bins + b];
        const rgb = isNaN(v) ? bg : RAMP_RGB[rampIndex(congestion(v), 0, 12)];
        const o = (r * bins + b) * 4;
        id.data[o] = rgb[0]; id.data[o + 1] = rgb[1]; id.data[o + 2] = rgb[2]; id.data[o + 3] = 255;
      }
    }
    const off = this.img || document.createElement('canvas');
    off.width = bins; off.height = rows;
    off.getContext('2d').putImageData(id, 0, 0);
    this.img = off; this.dirty = false;
    return off;
  };

  // ------------------------------------------------------------------ canvas helpers
  function fit(canvas) {
    const r = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx, w, h };
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  }
  function hatch(ctx, x, y, w, h, color) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.strokeStyle = color; ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
    for (let i = -h; i < w; i += 6) { ctx.beginPath(); ctx.moveTo(x + i, y + h); ctx.lineTo(x + i + h, y); ctx.stroke(); }
    ctx.restore();
  }
  function glyph(ctx, x, y, ch, bg, fg) {
    ctx.fillStyle = bg;
    roundRect(ctx, x - 6, y - 6, 12, 12, 3); ctx.fill();
    ctx.fillStyle = fg; ctx.font = '700 9px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(ch, x, y + 0.5);
  }
  function statusOf(w, v) {
    if (v.crashed || v.disabled) return ['✕', C.critical, '#fff'];
    if (v.broken) return ['F', C.serious, '#fff'];
    if (v.guardianOn) return ['G', C.critical, '#fff'];
    if (v.mode === 'safestop') return ['S', C.warning, '#0b0b0b'];
    if (w.t < v.commsDownUntil) return ['R', C.serious, '#fff'];
    if (v.brakeFactor < 1) return ['B', C.serious, '#fff'];
    return null;
  }

  const PAD = 8; // horizontal padding shared by overview and time-space so x positions line up

  // ------------------------------------------------------------------ overview strip
  function drawOverview(key) {
    const w = worlds[key], cfg = w.cfg;
    const { ctx, w: W, h: H } = fit($('ov-' + key));
    const X = x => PAD + x / cfg.length * (W - 2 * PAD);
    const laneH = 8, top = 14, nL = cfg.lanes;
    const laneY = L => L === nL ? top + (nL + 1) * laneH + 2 : L >= 0 ? top + (nL - 1 - L) * laneH : top + nL * laneH + 1;

    // road
    ctx.fillStyle = C.road;
    ctx.fillRect(X(0), top, X(cfg.length) - X(0), nL * laneH);
    ctx.fillRect(X(cfg.rampStartX), laneY(-1), X(cfg.mergeEnd) - X(cfg.rampStartX), laneH - 1);
    if (cfg.safetyLane) {
      ctx.fillStyle = C.shoulder; ctx.fillRect(X(0), laneY(nL), X(cfg.length) - X(0), laneH - 1);
      ctx.strokeStyle = C.axis; ctx.setLineDash([3, 3]); ctx.strokeRect(X(0) + 0.5, laneY(nL) + 0.5, X(cfg.length) - X(0) - 1, laneH - 2); ctx.setLineDash([]);
    }
    // segments
    ctx.font = '10px system-ui, sans-serif'; ctx.textBaseline = 'top'; ctx.textAlign = 'center';
    w.segments.forEach((s, i) => {
      if (key === 'sdr' && s.failed) hatch(ctx, X(s.start), top, X(s.end) - X(s.start), nL * laneH, C.critical);
      else if (key === 'sdr' && s.sensorsDown) hatch(ctx, X(s.start), top, X(s.end) - X(s.start), nL * laneH, C.warning);
      ctx.fillStyle = key === 'sdr' && s.failed ? C.critical : C.muted;
      const note = s.failed ? ' failed' : s.sensorsDown ? ' sensors down' : '';
      ctx.fillText(key === 'sdr' ? `S${i + 1}${note}` : `${s.start / 1000}–${s.end / 1000} km`, (X(s.start) + X(s.end)) / 2, 1);
    });
    ctx.strokeStyle = C['lane-line']; ctx.lineWidth = 1;
    for (let L = 1; L < nL; L++) { const y = top + L * laneH + 0.5; ctx.beginPath(); ctx.moveTo(X(0), y); ctx.lineTo(X(cfg.length), y); ctx.stroke(); }
    if (key === 'sdr') {
      ctx.strokeStyle = C.axis;
      for (const s of w.segments.slice(1)) { const x = Math.round(X(s.start)) + 0.5; ctx.beginPath(); ctx.moveTo(x, top - 2); ctx.lineTo(x, top + nL * laneH + 2); ctx.stroke(); }
    }
    // markers
    ctx.fillStyle = C.muted; ctx.textBaseline = 'top';
    const by = (cfg.safetyLane ? laneY(nL) : laneY(-1)) + laneH + 2;
    ctx.fillText('on-ramp', X((cfg.rampStartX + cfg.mergeEnd) / 2), by);
    ctx.fillText('exit', X(cfg.offRampX), by);
    ctx.fillText('detector', X(cfg.detectorX), by);
    ctx.fillStyle = C.muted;
    ctx.fillRect(Math.round(X(cfg.offRampX)), top + (nL - 1) * laneH + laneH, 1, 4);
    ctx.fillRect(Math.round(X(cfg.detectorX)), top - 2, 1, nL * laneH + 4);

    // vehicles
    for (const v of w.vehicles) {
      const lanes = v.laneTo !== null ? [v.lane, v.laneTo] : [v.lane];
      ctx.fillStyle = (v.crashed || v.disabled) ? C.critical : v.broken ? C.serious : vehColor(v.v);
      const x1 = X(v.x - v.length), x2 = X(v.x);
      const y = lanes.length === 2 ? (laneY(v.lane) + laneY(v.laneTo)) / 2 : laneY(v.lane);
      ctx.fillRect(x1, y + 1.5, Math.max(2, x2 - x1), laneH - 3);
    }
    // obstacles
    for (const o of w.obstacles) {
      ctx.fillStyle = C.critical; ctx.globalAlpha = key === 'sdr' && !o.known ? 0.4 : 1;
      const x = X(o.x), y = laneY(o.lane) + laneH / 2;
      ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x + 4, y + 3); ctx.lineTo(x - 4, y + 3); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
    // close-up window
    const win = zoomWindow(W);
    const x0 = clamp(state.focus - win / 2, 0, cfg.length - win);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.strokeRect(X(x0), top - 3, X(x0 + win) - X(x0), (nL + (cfg.safetyLane ? 2 : 1)) * laneH + 5);
  }

  function zoomWindow(W) { return W < 520 ? 220 : W < 900 ? 320 : 420; }

  // ------------------------------------------------------------------ close-up
  function drawZoom(key) {
    const w = worlds[key], cfg = w.cfg;
    const { ctx, w: W, h: H } = fit($('zoom-' + key));
    const win = zoomWindow(W);
    const x0 = clamp(state.focus - win / 2, 0, cfg.length - win);
    const s = W / win;
    const X = x => (x - x0) * s;
    const top = 18, nL = cfg.lanes;
    const laneH = Math.min(30, (H - top - 4) / (nL + (cfg.safetyLane ? 2 : 1)));
    const laneY = L => L === nL ? top + (nL + 1) * laneH : L >= 0 ? top + (nL - 1 - L) * laneH : top + nL * laneH;
    $('zoomLabel-' + key).textContent = `· ${(x0 / 1000).toFixed(2)}–${((x0 + win) / 1000).toFixed(2)} km`;

    // distance ticks
    ctx.font = '10px system-ui, sans-serif'; ctx.textBaseline = 'top'; ctx.textAlign = 'center';
    ctx.fillStyle = C.muted;
    for (let x = Math.ceil(x0 / 50) * 50; x <= x0 + win; x += 50) {
      ctx.fillRect(Math.round(X(x)), top - 4, 1, 3);
      if (x % 100 === 0) ctx.fillText(`${(x / 1000).toFixed(1)} km`, X(x), 1);
    }
    // road
    ctx.fillStyle = C.road;
    ctx.fillRect(0, top, W, nL * laneH);
    const r0 = Math.max(x0, cfg.rampStartX), r1 = Math.min(x0 + win, cfg.mergeEnd);
    if (r1 > r0) ctx.fillRect(X(r0), laneY(-1), X(r1) - X(r0), laneH);
    if (cfg.safetyLane) {
      ctx.fillStyle = C.shoulder; ctx.fillRect(0, laneY(nL), W, laneH);
      ctx.strokeStyle = C.axis; ctx.lineWidth = 1; ctx.setLineDash([6, 4]);
      ctx.strokeRect(0.5, laneY(nL) + 0.5, W - 1, laneH - 1); ctx.setLineDash([]);
      ctx.fillStyle = C.muted; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(key === 'sdr' ? 'safety lane' : 'hard shoulder', 4, laneY(nL) + laneH / 2); ctx.textAlign = 'center';
    }
    // lane markings
    ctx.strokeStyle = C['lane-line']; ctx.lineWidth = 1.5;
    ctx.setLineDash([10, 10]); ctx.lineDashOffset = x0 * s % 20;
    for (let L = 1; L < nL; L++) { const y = top + L * laneH; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    if (r1 > r0) {
      const y = laneY(-1);
      const m0 = Math.max(r0, cfg.mergeStart);
      if (m0 < r1) { ctx.beginPath(); ctx.moveTo(X(m0), y); ctx.lineTo(X(r1), y); ctx.stroke(); }
      ctx.setLineDash([]);
      if (r0 < cfg.mergeStart) { ctx.beginPath(); ctx.moveTo(X(r0), y); ctx.lineTo(X(Math.min(r1, cfg.mergeStart)), y); ctx.stroke(); }
    }
    ctx.setLineDash([]);
    // off-ramp marker
    if (cfg.offRampX > x0 && cfg.offRampX < x0 + win) {
      ctx.fillStyle = C.ink_2 || C['ink-2']; ctx.textBaseline = 'bottom';
      ctx.fillText('exit ↘', X(cfg.offRampX), H - 1);
      ctx.fillStyle = C.axis; ctx.fillRect(Math.round(X(cfg.offRampX)), top + nL * laneH, 1, 6);
    }
    // segments
    if (key === 'sdr') {
      for (let i = 0; i < w.segments.length; i++) {
        const sg = w.segments[i];
        const a = Math.max(sg.start, x0), b = Math.min(sg.end, x0 + win);
        if (b <= a) continue;
        if (sg.failed) hatch(ctx, X(a), top, X(b) - X(a), nL * laneH, C.critical);
        else if (sg.sensorsDown) hatch(ctx, X(a), top, X(b) - X(a), nL * laneH, C.warning);
        if (sg.start > x0 && sg.start < x0 + win) {
          ctx.strokeStyle = C.ink; ctx.globalAlpha = 0.35; ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.moveTo(X(sg.start), top); ctx.lineTo(X(sg.start), top + nL * laneH); ctx.stroke();
          ctx.setLineDash([]); ctx.globalAlpha = 1;
          ctx.fillStyle = C.muted; ctx.textBaseline = 'bottom'; ctx.textAlign = 'left';
          ctx.fillText(`S${i} | S${i + 1}`, X(sg.start) + 3, H - 1); ctx.textAlign = 'center';
        }
      }
    }

    const inView = v => v.x > x0 - 20 && v.x - v.length < x0 + win + 20;
    const yOf = v => {
      if (v.laneTo === null) return laneY(v.lane) + laneH / 2;
      const p = clamp(v.lcT / cfg.laneChangeDuration, 0, 1);
      return laneY(v.lane) + laneH / 2 + (laneY(v.laneTo) - laneY(v.lane)) * p;
    };
    // movement authorities
    if (key === 'sdr') {
      for (const v of w.vehicles) {
        if (!inView(v) || !v.plan || v.crashed || v.disabled) continue;
        const e = v.mode === 'safestop' ? v.plan.eoa : v.plan.eoa;
        const xa = X(v.x), xb = X(Math.min(e, x0 + win + 50));
        if (xb <= xa) continue;
        const y = yOf(v), hh = laneH * 0.24;
        ctx.fillStyle = C.envelope;
        ctx.fillRect(xa, y - hh, xb - xa, hh * 2);
        if (e < x0 + win) { ctx.fillStyle = C['series-1']; ctx.fillRect(Math.round(xb) - 1, y - hh - 2, 2, hh * 2 + 4); }
      }
    }
    // obstacles
    for (const o of w.obstacles) {
      if (o.x < x0 || o.x > x0 + win + 5) continue;
      const x = X(o.x - o.length / 2), y = laneY(o.lane) + laneH / 2;
      ctx.globalAlpha = key === 'sdr' && !o.known ? 0.35 : 1;
      ctx.fillStyle = C.critical;
      ctx.beginPath(); ctx.moveTo(x, y - 7); ctx.lineTo(x + 7, y + 6); ctx.lineTo(x - 7, y + 6); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
    // vehicles
    for (const v of w.vehicles) {
      if (!inView(v)) continue;
      const y = yOf(v);
      const hh = laneH * (v.type === 'truck' ? 0.62 : 0.5);
      const xa = X(v.x - v.length), len = Math.max(3, v.length * s);
      ctx.fillStyle = (v.crashed || v.disabled) ? C.critical : v.broken ? C.serious : vehColor(v.v);
      roundRect(ctx, xa, y - hh / 2, len, hh, 2); ctx.fill();
      ctx.strokeStyle = C.surface; ctx.lineWidth = 1; ctx.stroke();
      const st = statusOf(w, v);
      if (st) glyph(ctx, xa + len / 2, y - hh / 2 - 7, st[0], st[1], st[2]);
    }
  }

  // ------------------------------------------------------------------ time-space diagram
  function drawTimeSpace(key) {
    const w = worlds[key], cfg = w.cfg;
    const { ctx, w: W, h: H } = fit($('ts-' + key));
    const img = ts[key].image(ctx);
    ctx.imageSmoothingEnabled = false;
    const x0 = PAD, x1 = W - PAD;
    ctx.drawImage(img, x0, 0, x1 - x0, H - 12);
    const X = x => PAD + x / cfg.length * (W - 2 * PAD);
    ctx.font = '10px system-ui, sans-serif'; ctx.textBaseline = 'bottom'; ctx.textAlign = 'center';
    ctx.fillStyle = C.muted;
    for (const [x, label] of [[cfg.mergeStart, 'on-ramp'], [cfg.offRampX, 'exit'], [0, '0 km'], [cfg.length, '5 km']]) {
      ctx.textAlign = x === 0 ? 'left' : x === cfg.length ? 'right' : 'center';
      ctx.fillText(label, X(x), H);
      if (x > 0 && x < cfg.length) { ctx.globalAlpha = 0.5; ctx.fillRect(Math.round(X(x)), 0, 1, H - 12); ctx.globalAlpha = 1; }
    }
    // time labels
    ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    label(ctx, 'now', x1 - 3, 2);
    ctx.textBaseline = 'bottom';
    label(ctx, '−10 min', x1 - 3, H - 14);
  }
  function label(ctx, text, x, y) {
    const m = ctx.measureText(text).width;
    ctx.fillStyle = C.surface; ctx.globalAlpha = 0.85;
    const yy = ctx.textBaseline === 'top' ? y - 1 : y - 12;
    ctx.fillRect(x - m - 3, yy, m + 6, 13);
    ctx.globalAlpha = 1; ctx.fillStyle = C['ink-2'];
    ctx.fillText(text, x, y);
  }

  // ------------------------------------------------------------------ stat tiles
  const fmt0 = v => (v === undefined || !isFinite(v)) ? '–' : Math.round(v).toLocaleString('en-US');
  function tile(k, v, u, alert) {
    return `<div class="tile${alert ? ' alert' : ''}"><div class="k">${k}</div><div class="v">${v}<span class="u">${u || ''}</span></div></div>`;
  }
  function updateStats() {
    for (const key of ['sdr', 'human']) {
      const w = worlds[key];
      const s = w.stats(300);
      let html = tile('Throughput', fmt0(s.flow), ' veh/h') +
        tile('Mean speed', fmt0(s.meanSpeed * 3.6), ' km/h') +
        tile('Trip delay', fmt0(s.tripDelay), ' s') +
        tile('Waiting to enter', fmt0(s.mainQueue + s.rampQueue), ' veh') +
        tile('Collisions', fmt0(s.collisions), '', s.collisions > 0) +
        tile('Hard brakes', fmt0(s.hardBrakes), '');
      if (key === 'sdr') html += tile('Guardian', fmt0(s.guardian), '') + tile('Safe stops', fmt0(s.safeStops), '');
      $('tiles-' + key).innerHTML = html;
      watchEvents(key, w, s);
      w._lastStats = s;
    }
    const sw = worlds.sdr;
    const lim = Math.round(sw.vLimit * 3.6);
    $('sdrPolicyLabel').textContent = `· ${state.separation} separation · ${state.speedPolicy} speed · driving ${lim} km/h`;
    const t = Math.floor(sw.t);
    $('clock').textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
    $('incSegment').innerHTML = (sw.segments[sw._segmentIndex(state.focus)].failed ? 'Restore segment' : 'Fail segment') + ` S${sw._segmentIndex(state.focus) + 1} <span class="tag">SDR</span>`;
    $('incSensors').innerHTML = (sw.segments[sw._segmentIndex(state.focus)].sensorsDown ? 'Restore sensors' : 'Sensors down') + ` S${sw._segmentIndex(state.focus) + 1} <span class="tag">SDR</span>`;
  }

  // ------------------------------------------------------------------ events
  const NAME = { sdr: 'SDR', human: "Today's road" };
  function watchEvents(key, w, s) {
    const p = prev[key] || (prev[key] = { inc: 0, guardian: 0, safeStops: 0, supervision: 0, side: 0 });
    const inc = w.m.incidents;
    for (let i = p.inc; i < inc.length; i++) {
      const c = inc[i];
      const what = c.other === 'debris' ? 'hit an object' : c.other === 'wall' ? 'hit the end of the ramp' : c.other === 'disabled' ? 'hit a vehicle that stopped dead' : 'rear-end collision';
      logEvent('crit', key, `${what} at ${(c.x / 1000).toFixed(2)} km, impact ${Math.round(c.dv * 3.6)} km/h`, c.t);
    }
    p.inc = inc.length;
    if (s.guardian > p.guardian) logEvent('warn', key, `guardian sensor braked (${s.guardian - p.guardian}×)`, w.t);
    if (s.safeStops > p.safeStops) logEvent('warn', key, `${s.safeStops - p.safeStops} vehicle(s) lost authority and made a safe stop`, w.t);
    if (s.supervision > p.supervision) logEvent('info', key, `${s.supervision - p.supervision} authority-limit brake(s)`, w.t);
    if (w.m.sidetracked > p.side) logEvent('info', key, `${w.m.sidetracked - p.side} vehicle(s) moved onto the ${key === 'sdr' ? 'safety lane' : 'hard shoulder'}`, w.t);
    p.guardian = s.guardian; p.safeStops = s.safeStops; p.supervision = s.supervision; p.side = w.m.sidetracked;
  }
  function logEvent(kind, key, text, t) {
    const tt = t !== undefined ? t : (worlds.sdr ? worlds.sdr.t : 0);
    events.unshift({ kind, key, text, t: tt });
    if (events.length > 60) events.pop();
    renderEvents();
  }
  function renderEvents() {
    const mm = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    $('eventLog').innerHTML = events.map(e =>
      `<li class="${e.kind}"><span class="t">${mm(e.t)}</span>${e.key ? `<b>${NAME[e.key]}:</b> ` : ''}${e.text}</li>`).join('');
  }

  // ------------------------------------------------------------------ capacity chart
  const SPEEDS = []; for (let k = 20; k <= 130; k += 2) SPEEDS.push(k);
  let capHover = null;
  function capSeries() {
    const cfg = Object.assign({}, worlds.sdr.cfg);
    return [
      { key: 'absolute', name: 'SDR absolute', color: C['series-1'], f: kmh => sdrCapacity(cfg, 'absolute', kmh / 3.6) },
      { key: 'relative', name: 'SDR relative', color: C['series-3'], f: kmh => sdrCapacity(cfg, 'relative', kmh / 3.6) },
      { key: 'hybrid', name: 'SDR hybrid', color: C['series-4'], f: kmh => sdrCapacity(cfg, 'hybrid', kmh / 3.6) },
      { key: 'human', name: "Today's road", color: C['series-2'], f: kmh => humanCapacity(cfg, kmh / 3.6) },
    ];
  }
  function drawCap() {
    const canvas = $('capChart');
    const { ctx, w: W, h: H } = fit(canvas);
    const series = capSeries();
    const m = { l: 52, r: W < 520 ? 12 : 96, t: 12, b: 34 };
    const xMin = 20, xMax = 130;
    let yMax = 0;
    for (const sr of series) for (const k of SPEEDS) yMax = Math.max(yMax, sr.f(k));
    yMax = Math.ceil(yMax / 500) * 500;
    const X = k => m.l + (k - xMin) / (xMax - xMin) * (W - m.l - m.r);
    const Y = q => H - m.b - q / yMax * (H - m.t - m.b);

    ctx.font = '11px system-ui, sans-serif';
    // grid + axes
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.fillStyle = C.muted;
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let q = 0; q <= yMax; q += 500) {
      const y = Math.round(Y(q)) + 0.5;
      ctx.beginPath(); ctx.moveTo(m.l, y); ctx.lineTo(W - m.r, y); ctx.stroke();
      if (q % 1000 === 0) ctx.fillText(q.toLocaleString('en-US'), m.l - 6, y);
    }
    ctx.strokeStyle = C.axis;
    ctx.beginPath(); ctx.moveTo(m.l, Y(0) + 0.5); ctx.lineTo(W - m.r, Y(0) + 0.5); ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (let k = 20; k <= 130; k += 20) ctx.fillText(k, X(k), H - m.b + 6);
    ctx.fillText('speed (km/h)', (m.l + W - m.r) / 2, H - 14);
    ctx.save(); ctx.translate(12, (m.t + H - m.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textBaseline = 'middle';
    ctx.fillText('veh/h per lane', 0, 0); ctx.restore();

    // speed limit
    const lim = +$('speedLimit').value;
    ctx.strokeStyle = C.muted; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(X(lim) + 0.5, m.t); ctx.lineTo(X(lim) + 0.5, Y(0)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.muted; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('limit', X(lim) + 4, m.t);

    // lines
    const ends = [];
    for (const sr of series) {
      const active = sr.key === 'human' || sr.key === state.separation;
      ctx.strokeStyle = sr.color; ctx.lineWidth = 2; ctx.globalAlpha = active ? 1 : 0.4;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.beginPath();
      SPEEDS.forEach((k, i) => { const x = X(k), y = Y(sr.f(k)); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
      ctx.stroke(); ctx.globalAlpha = 1;
      ends.push({ sr, y: Y(sr.f(xMax)), active });
    }
    // direct labels at the right end, nudged apart
    if (m.r > 40) {
      ends.sort((a, b) => a.y - b.y);
      for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 14) ends[i].y = ends[i - 1].y + 14;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = '12px system-ui, sans-serif';
      for (const e of ends) { ctx.fillStyle = e.active ? C.ink : C.muted; ctx.fillText(e.sr.name, X(xMax) + 8, e.y); }
    }
    // measured operating points
    for (const key of activeWorlds()) {
      const w = worlds[key], s = w._lastStats;
      if (!s || w.t < 180 || !isFinite(s.meanSpeed)) continue;
      const x = X(clamp(s.meanSpeed * 3.6, xMin, xMax)), y = Y(Math.min(yMax, s.flow / w.cfg.lanes));
      ctx.fillStyle = key === 'sdr' ? C[{ absolute: 'series-1', relative: 'series-3', hybrid: 'series-4' }[state.separation]] : C['series-2'];
      ctx.strokeStyle = C.surface; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 5.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = '11px system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      ctx.fillText(key === 'sdr' ? 'SDR now' : 'today now', x + 8, y - 2);
    }
    // hover crosshair
    const tip = $('capTip');
    if (capHover !== null && capHover >= m.l && capHover <= W - m.r) {
      const k = Math.round(xMin + (capHover - m.l) / (W - m.l - m.r) * (xMax - xMin));
      ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X(k) + 0.5, m.t); ctx.lineTo(X(k) + 0.5, Y(0)); ctx.stroke();
      for (const sr of series) {
        ctx.fillStyle = sr.color; ctx.strokeStyle = C.surface; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(X(k), Y(sr.f(k)), 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      tip.hidden = false;
      tip.innerHTML = `<div><b>${k} km/h</b></div>` + series.map(sr =>
        `<div class="row"><span><i style="background:${sr.color}"></i>${sr.name}</span><b>${fmt0(sr.f(k))}</b></div>`).join('') +
        `<div class="muted small">veh/h per lane</div>`;
      const left = X(k) + 14 + 170 > W ? X(k) - 14 - tip.offsetWidth : X(k) + 14;
      tip.style.left = left + 'px'; tip.style.top = m.t + 'px';
    } else tip.hidden = true;
  }
  function capLegendAndTable() {
    const series = capSeries();
    const opt = sdrOptimalSpeed(worlds.sdr.cfg, state.separation) * 3.6;
    $('capWeather').textContent = `· ${{ '1': 'dry', '0.7': 'wet', '0.3': 'ice' }[String(state.weather)]} road · SDR ${state.separation} is densest at ${Math.round(opt)} km/h`;
    $('capLegend').innerHTML = series.map(sr => `<span><i style="background:${sr.color}"></i>${sr.name}</span>`).join('') +
      `<span><i class="dot" style="background:${C['ink-2']}"></i>measured now</span>`;
    const ks = [40, 60, 80, 100, 120];
    $('capTable').innerHTML = `<table><thead><tr><th>veh/h per lane</th>${ks.map(k => `<th>${k} km/h</th>`).join('')}</tr></thead><tbody>` +
      series.map(sr => `<tr><td>${sr.name}</td>${ks.map(k => `<td>${fmt0(sr.f(k))}</td>`).join('')}</tr>`).join('') + '</tbody></table>';
  }

  // ------------------------------------------------------------------ main loop
  let last = performance.now(), lastStats = 0;
  function frame(now) {
    const dtReal = Math.min(0.5, (now - last) / 1000);   // catch up after slow frames, but not after a long pause
    last = now;
    if (state.running) {
      const dt = worlds.sdr.cfg.dt;
      acc += dtReal * state.speed;
      let n = 0;
      while (acc >= dt && n < 1500) {
        worlds.sdr.step(); ts.sdr.sample(worlds.sdr);
        worlds.human.step(); ts.human.sample(worlds.human);
        acc -= dt; n++;
      }
      if (n >= 1500) acc = 0;
    }
    if (now - lastStats > 300) { updateStats(); lastStats = now; }
    for (const key of activeWorlds()) { drawOverview(key); drawZoom(key); drawTimeSpace(key); }
    tsDirty = false;
    drawCap();
    requestAnimationFrame(frame);
  }

  // ------------------------------------------------------------------ controls
  function bindSlider(id, fmt, apply) {
    const el = $(id), out = $(id + 'Out');
    const upd = () => { out.textContent = fmt(+el.value); };
    el.addEventListener('input', () => { upd(); apply && apply(+el.value); });
    upd();
  }
  function applyBoth(patch) { worlds.sdr.setConfig(patch); worlds.human.setConfig(patch); }

  function init() {
    readTheme();
    makeWorlds();

    bindSlider('demandMain', v => `${v.toLocaleString('en-US')} veh/h`, v => applyBoth({ demandMain: v }));
    bindSlider('demandRamp', v => `${v.toLocaleString('en-US')} veh/h`, v => applyBoth({ demandRamp: v }));
    bindSlider('truckShare', v => `${v} %`, v => applyBoth({ truckShare: v / 100 }));
    bindSlider('speedLimit', v => `${v} km/h`, v => { applyBoth({ speedLimit: v / 3.6 }); capLegendAndTable(); });
    bindSlider('packetLoss', v => `${v} %`, v => worlds.sdr.setConfig({ packetLoss: v / 100 }));
    bindSlider('focus', v => `${(v / 1000).toFixed(2)} km`, v => { state.focus = v; });
    bindSlider('roadDetect', v => `${v} %`, v => worlds.sdr.setConfig({ roadDetectProb: v / 100 }));
    bindSlider('carDetect', v => `${v} %`, v => worlds.sdr.setConfig({ carDetectProb: v / 100 }));
    $('safetyLane').addEventListener('change', e => {
      applyBoth({ safetyLane: e.target.checked });
      document.querySelectorAll('.overview').forEach(el => el.classList.toggle('with-shoulder', e.target.checked));
      logEvent('info', null, e.target.checked ? "Safety lane opened (hard shoulder on today's road)" : 'Safety lane closed');
    });

    document.querySelectorAll('.seg').forEach(seg => {
      seg.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        seg.querySelectorAll('button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); });
        const name = seg.dataset.name, val = b.dataset.value;
        if (name === 'weather') { state.weather = +val; applyBoth({ friction: +val }); logEvent('info', null, `Weather: ${b.textContent.toLowerCase()}`); }
        if (name === 'separation') { state.separation = val; worlds.sdr.setConfig({ separation: val }); logEvent('info', 'sdr', `separation policy → ${val}`); }
        if (name === 'carSensorShare') { state.carSensorShare = val; worlds.sdr.setConfig({ carSensorShare: val }); logEvent('info', 'sdr', `car detections: ${b.textContent.toLowerCase()}`); }
        if (name === 'speedPolicy') { state.speedPolicy = val; worlds.sdr.setConfig({ speedPolicy: val }); logEvent('info', 'sdr', `speed policy → ${val}`); }
        capLegendAndTable();
      });
      seg.querySelectorAll('button').forEach(x => { x.setAttribute('role', 'radio'); x.setAttribute('aria-checked', x.classList.contains('on')); });
    });

    $('playPause').addEventListener('click', () => {
      state.running = !state.running;
      $('playPause').textContent = state.running ? 'Pause' : 'Play';
      $('playPause').setAttribute('aria-label', state.running ? 'Pause' : 'Play');
    });
    $('simSpeed').addEventListener('change', e => { state.speed = +e.target.value; });
    $('reset').addEventListener('click', () => { makeWorlds(); capLegendAndTable(); });
    $('newTraffic').addEventListener('click', () => { state.seed++; makeWorlds(); });
    $('compare').addEventListener('change', e => {
      state.compare = e.target.checked;
      $('world-human').hidden = !state.compare;
    });
    $('themeToggle').addEventListener('click', () => {
      document.documentElement.dataset.theme = isDark() ? 'light' : 'dark';
      readTheme(); capLegendAndTable();
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { readTheme(); capLegendAndTable(); });

    // incidents
    const at = () => `${(state.focus / 1000).toFixed(2)} km`;
    $('incDebris').addEventListener('click', () => {
      const lane = +$('debrisLane').value;
      for (const k of ['sdr', 'human']) worlds[k].addDebris(state.focus, lane);
      logEvent('info', null, `Debris dropped in lane ${lane + 1} at ${at()}`);
    });
    $('incBrick').addEventListener('click', () => {
      for (const k of ['sdr', 'human']) worlds[k].suddenStop(state.focus);
      logEvent('info', null, `A vehicle near ${at()} stopped dead (brick-wall stop)`);
    });
    $('incBrakes').addEventListener('click', () => {
      for (const k of ['sdr', 'human']) worlds[k].degradeBrakes(state.focus);
      logEvent('info', null, `A vehicle near ${at()} lost half its braking`);
    });
    $('incBreakdown').addEventListener('click', () => {
      for (const k of ['sdr', 'human']) worlds[k].breakdown(state.focus);
      logEvent('info', null, `A vehicle near ${at()} broke down (no propulsion)`);
    });
    $('incSensors').addEventListener('click', () => {
      const i = worlds.sdr._segmentIndex(state.focus);
      worlds.sdr.toggleSensors(i);
      logEvent('info', 'sdr', `road sensors in S${i + 1} ${worlds.sdr.segments[i].sensorsDown ? 'DOWN' : 'restored'}`);
      updateStats();
    });
    $('incComms').addEventListener('click', () => {
      const v = worlds.sdr.commsLoss(state.focus);
      if (v) logEvent('info', 'sdr', `a vehicle near ${at()} lost its radio for ${worlds.sdr.cfg.commsLossDuration} s`);
    });
    $('incSegment').addEventListener('click', () => {
      const i = worlds.sdr._segmentIndex(state.focus);
      worlds.sdr.toggleSegment(i);
      logEvent('info', 'sdr', `segment controller S${i + 1} ${worlds.sdr.segments[i].failed ? 'FAILED' : 'restored'}`);
      updateStats();
    });
    $('incClear').addEventListener('click', () => {
      for (const k of ['sdr', 'human']) worlds[k].clearFaults();
      logEvent('info', null, 'All incidents cleared');
    });

    // overview click -> focus
    for (const key of ['sdr', 'human']) {
      $('ov-' + key).addEventListener('click', e => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = clamp((e.clientX - r.left - PAD) / (r.width - 2 * PAD) * worlds.sdr.cfg.length, 100, 4900);
        state.focus = Math.round(x / 10) * 10;
        $('focus').value = state.focus; $('focusOut').textContent = `${(state.focus / 1000).toFixed(2)} km`;
      });
    }
    // chart hover
    const cap = $('capChart');
    cap.addEventListener('mousemove', e => { capHover = e.clientX - cap.getBoundingClientRect().left; });
    cap.addEventListener('mouseleave', () => { capHover = null; });

    capLegendAndTable();
    updateStats();
    requestAnimationFrame(frame);
  }

  init();
  // debugging handle (console): sdrSim.worlds.sdr.stats(), sdrSim.advance(300)
  window.sdrSim = {
    get worlds() { return worlds; }, state,
    advance(seconds) { const n = Math.round(seconds / worlds.sdr.cfg.dt); for (let i = 0; i < n; i++) { worlds.sdr.step(); ts.sdr.sample(worlds.sdr); worlds.human.step(); ts.human.sample(worlds.human); } updateStats(); },
  };
})();
