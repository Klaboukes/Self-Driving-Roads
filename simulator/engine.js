/*
 * SDR simulator — core engine.
 *
 * One motorway corridor (default 5 km, 3 lanes) with an on-ramp and an off-ramp.
 * Two driving modes share the same demand stream:
 *   'sdr'   – Self Driving Road: segment controllers issue movement authorities
 *             (end-of-authority, EoA) to vehicles; vehicles track them; a guardian
 *             sensor may only brake.
 *   'human' – Baseline ("today's road"): IDM+ car following with reaction delay, headway
 *             relaxation after lane changes and a MOBIL-style lane change model.
 *
 * Pure JS, no DOM. Works in the browser (window.SDR) and in Node (require).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SDR = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const G = 9.81;

  // ---------------------------------------------------------------- helpers
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(rng) {
    const u = 1 - rng(), v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function upperBound(list, x) { // first index with list[i].x > x
    let lo = 0, hi = list.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (list[m].x <= x) lo = m + 1; else hi = m; }
    return lo;
  }

  // ---------------------------------------------------------------- config
  const DEFAULTS = {
    mode: 'sdr',              // 'sdr' | 'human'
    seed: 1,
    dt: 0.05,                 // physics step (s)

    // geometry (m). Lane 0 is the rightmost lane, lane -1 the on-ramp.
    length: 5000,
    lanes: 3,
    segmentLength: 1000,
    rampStartX: 1650,         // where ramp vehicles appear (SDR: the ramp gate)
    mergeStart: 2000,         // acceleration lane, merging allowed in [mergeStart, mergeEnd]
    mergeEnd: 2300,
    offRampX: 3500,
    exitPrepDist: 1500,       // exiting vehicles start moving right this far before the exit
    detectorX: 4500,          // throughput is measured here

    // demand
    demandMain: 4500,         // veh/h arriving at the main entry (all lanes)
    demandRamp: 900,          // veh/h arriving at the on-ramp
    truckShare: 0.10,
    exitShare: 0.20,

    // road / environment
    speedLimit: 33.3,         // m/s (120 km/h)
    friction: 1.0,            // 1.0 dry, 0.7 wet, 0.3 ice
    frictionActual: 0,        // grip the tyres really have, if it is less than the road measured (black ice); 0 = as measured
    carBrake: 8.0,            // maximum braking of a car on a dry road (m/s²), certified and physical

    // SDR policy
    separation: 'hybrid',     // 'absolute' (brick-wall) | 'relative' | 'hybrid' (the recommended policy, decision D1)
    // hybrid = relative by default, absolute (brick-wall) gap where the risk is higher:
    platoonBreakEvery: 0,     //   every Nth vehicle keeps an absolute gap to its leader (0 = off; tested, did not pay off)
    hybridHealthAbsolute: true, // behind a vehicle that reports a fault
    hybridSensorAbsolute: true, // in and just upstream of a segment whose road sensors are down
    hybridTruckAbsolute: true,  // behind trucks (most road debris falls off vehicles)
    // cheaper versions of the truck rule (roadmap 1.2); the defaults leave the rule as it is
    secureLoadShare: 0,       //   share of trucks whose load is enclosed and monitored (D10): no absolute gap behind those
    truckGapConfirm: 0,       //   the gap behind a truck also covers the distance driven until the road has confirmed a lost load (s)
    loadSlideDecel: 0,        //   the gap behind a truck assumes a lost load slides to rest at this rate (m/s²) instead of stopping dead (0 = stops dead)
    truckBehindTruckRelative: false, // a truck following a truck keeps a relative gap
    truckLane: false,         //   trucks keep to the right lane and cars use it only to get on and off the road
    gripPlanShare: 1.0,       // SDR plans with this share of the measured grip (a weather rule: wider gaps and a lower speed as grip falls)
    sensorGapSpeed: 0,        // optional speed cap (m/s, 70 km/h) in and before a segment whose road sensors are down (hybrid; 0 = none)
    speedPolicy: 'fixed',     // 'fixed' | 'adaptive' (drop to capacity-optimal speed under pressure)
    controlPeriod: 0.1,       // segment controller cycle (s)
    commsLatency: 0.05,       // one-way message latency (s)
    packetLoss: 0.0,          // probability a plan message is lost
    authorityTTL: 1.5,        // authority expires this long after it was computed (s)
    lossAdaptive: true,       // the road measures radio loss and widens every vehicle's stale-authority allowance to match
    lossTolerance: 1e-4,      //   target chance per control cycle that a run of lost messages outlasts the allowance
    lossBurstAware: false,    //   the road also measures how often a lost message follows a lost one, and sizes the allowance for runs of that
                              //   kind (false: it assumes every message is lost independently)
    // radio link model (roadmap 2.3). With these defaults every message is lost independently with probability packetLoss.
    lossBurst: 0,             // mean length of a burst of lost messages (s), at the same long-run loss rate (two-state Gilbert–Elliott chain; 0 = independent)
    radioPaths: 1,            // radio paths each authority is sent over (D6: two); it is lost only if it is lost on every path
    lossCommon: 0,            //   share of each path's loss whose cause hits every path at once (same burst state: a truck shadowing both antennas). 0 = independent paths
    repeatGap: 0,             // every authority is sent a second time this much later over the same path(s) (s; 0 = sent once)
    outageX0: 0, outageX1: 0, // radio dead spot from x0 to x1 (m) where every message is lost (x1 <= x0: none) ...
    outageT0: 0, outageT1: 1e9, //   ... from t0 to t1 (s)
    outageAllPaths: true,     //   the dead spot hits every path (false: only the first)
    laneChangeAck: true,      // a lane change starts only once the changer holds the instruction (with an authority that also keeps behind its
                              //   new leader) and the new follower holds an authority that already keeps behind the changer
                              //   (on since roadmap 2.3; false = the rule before, kept to show the difference)
    actuationDelay: 0.2,      // vehicle actuator delay (s)
    margin: 2.0,              // fixed safety margin (m)
    positionUncertainty: 0.5, // positioning error allowance (m)
    roadDetectionDelay: 0.5,  // time for road sensors to confirm a new object (s)
    guardianRange: 120,       // onboard guardian sensor range (m)
    healthDetectDelay: 0.5,   // a silent brake fault is reported after this long (sooner once the vehicle brakes)

    // detection layers for foreign objects (debris, animals, lost loads)
    roadDetectProb: 1.0,      // chance the road sensors (cameras/radar) see a new object at all
    carDetectProb: 1.0,       // chance one vehicle's own sensor sees an object within guardian range
    carSensorShare: 'road',   // what a vehicle does with a detection: 'none' (only brakes itself),
                              //   'road' (reports it to the segment controller), 'v2v' (also tells nearby vehicles directly)
    v2vLatency: 0.05,         // direct vehicle-to-vehicle message latency (s)
    // false alarms and shared misses (roadmap 2.4); the defaults switch them off
    roadFalseAlarmRate: 0,    // road sensors confirm an object that is not there: false alarms per km of road per hour (SDR)
    carFalseAlarmRate: 0,     // a vehicle's own sensor sees a false target within its range: per vehicle-hour (both roads;
                              //   today's road: driver-assistance braking). SDR reports it like a real detection (carSensorShare)
    carFalseAlarmDur: 1.0,    //   how long the false target is seen (s); the vehicle brakes at full force while it is within stopping distance
    falseAlarmClearTime: 60,  // the road clears an object that is not there after this re-check time (s)
    sharedMissProb: 0,        // share of objects that are hard to see (low, dark, at night) for every car alike
    sharedMissDetect: 0,      //   each car's chance to see such an object (instead of carDetectProb)
    sharedMissRoadDetect: null, //   the road sensors' chance to see such an object (null: roadDetectProb, they are not affected)

    // safety lane (hard shoulder that the road uses to sidetrack faulty vehicles)
    safetyLane: false,
    safetyLaneSpeed: 16.7,    // m/s (60 km/h) for vehicles sent to the safety lane
    breakdownClearTime: 900,  // a broken-down vehicle is towed away after (s)
    coastDecel: 0.4,          // deceleration of a vehicle that lost propulsion (m/s²)

    // SDR tuning (admission, merging, lane changes)
    rampMaxWait: 0,           // ramp gate: a vehicle that finds no predicted slot in the right lane is let in after this long (s). The slot
                              //   prediction almost never finds one, so 45 s was a 45 s wait for everybody; 0 = let in as soon as the ramp has room
    budgetFactor: 1.0,        // admission: fill the corridor up to this fraction of critical density
    rampKeepLaneAbove: 2,     // main entry lets no car into the right lane while more than this many vehicles are due at the merge (-1 = never lets one in, 1e9 = rule off)
    rampLaneWindow: 45,       //   "due at the merge": waiting at the ramp gate, or arrived at the ramp in the last so many seconds (0 = only those waiting)
    ghostFrame: true,         // merging: a ramp vehicle's place behind its right-lane leader is carried over to where it is on the ramp (false: the old, faulty rule)
    ghostType: true,          // merging: the virtual vehicle of a ramp truck is a truck, so the hybrid opens the truck gap behind it before it arrives
    approachMinRoom: 2,       // approach braking only beyond this spare distance (m)
    approachRef: 'rate',      // closing speed measured against the EoA rate ('rate') or leader speed ('lead')
    laneChangeBufFactor: 1.0, // lane change needs this fraction of the control buffer for both vehicles
    laneCloseDist: 1000,      // a blocked lane is closed (vehicles must leave it) this far upstream (m)

    // incidents
    incidentClearTime: 180,   // crashed/disabled vehicles and debris are cleared after (s)
    commsLossDuration: 20,
    laneChangeDuration: 3.0,
    humanSightDebris: 150,    // distance at which a driver notices small debris (m)
    humanT: 1.4,              // mean preferred time headway of human drivers (s); sets the capacity of today's road
    humanSurprise: 0.7,       // mean extra perception time of a human driver for an unexpected event (s), on top of the reaction time
  };

  const TYPES = {
    car:   { length: 4.5,  aMax: 2.0, bMax: 8.0, bComfort: 3.0, vMax: 36.1 },
    truck: { length: 16.5, aMax: 0.8, bMax: 6.0, bComfort: 2.0, vMax: 25.0 },
  };

  // Human driver model constants (today's road). IDM+ and headway relaxation after lane changes follow
  // Schakel, Knoop & van Arem (2012, LMRS) and Laval & Leclercq (2008).
  const HUMAN = {
    Tmin: 0.6,        // shortest headway accepted right after a lane change (s)
    relaxTime: 20,    // time constant for relaxing back to the preferred headway (s)
    T: 1.4,           // mean preferred time headway (s); the engine uses DEFAULTS.humanT, so it can be changed per run
    bDisc: 1.5,       // braking an optional lane change may cause for the new follower or the changer (m/s²)
    bSafe: 3.0,       // same for a lane change the driver has to make (merging, reaching the exit); rises with urgency
    bSync: 1.5,       // braking a merging driver uses to line up with a gap (m/s²), +1.5 at the end of the lane
    syncDist: 100,    // starts lining up this far before the acceleration lane (m)
    mergeCourtesy: 0.6, // extra pull to the left for right-lane drivers who see traffic coming down the on-ramp (m/s²)
    bYield: 3.0,      // braking a courteous driver uses to let someone in (m/s²)
    noise: 0.1,       // standard deviation of the acceleration error (m/s²)
    noiseTime: 1.5,   // its correlation time (s)
    entryT: 1.0,      // headway at the corridor entry, as a fraction of the driver's preferred headway
    gripRef: 5.0,     // braking habits are scaled down once the road offers less than this (m/s²): not in the wet, clearly on ice
    plus: true,       // IDM+ (false: plain IDM, for comparison)
    bOpen: 1.0,       //   braking beyond what the kinematics need, used to open such a gap again (m/s²)
    cool: 0.99,       // weight of the constant-acceleration heuristic (0 = plain IDM reaction to short gaps)
    exitSync: 600,    // an exiting driver starts lining up with the lane to the right when this much road is left per lane change (m)
  };

  // ---------------------------------------------------------------- theory
  // Steady-state lane capacity (veh/h) for SDR at speed v (m/s), cars only.
  function sdrGapTerms(cfg, separation, extraTau) {
    const bMax = cfg.carBrake || TYPES.car.bMax;
    const bEff = Math.min(bMax, cfg.friction * G * 0.95 * (cfg.gripPlanShare || 1));
    const bOwn = 0.9 * bEff;
    const bLead = Math.min(1.1 * bMax, cfg.friction * G);
    const cAbs = 1 / (2 * bOwn), cRel = 1 / (2 * bOwn) - 1 / (2 * bLead);
    // hybrid: share of followers that keep an absolute gap (platoon breaks, and vehicles behind trucks)
    const n = cfg.platoonBreakEvery || 0;
    const breakShare = n > 0 ? 1 / n : 0;
    const truckShare = Math.min(1 - breakShare, cfg.hybridTruckAbsolute ? (cfg.truckShare || 0) * (1 - (cfg.secureLoadShare || 0)) : 0);   // followers that keep the truck gap
    const cTruck = cfg.loadSlideDecel > 0 ? Math.max(cRel, 1 / (2 * bOwn) - 1 / (2 * cfg.loadSlideDecel)) : cAbs;
    const c = separation === 'relative' ? cRel
            : separation === 'hybrid' ? cRel + (cAbs - cRel) * breakShare + (cTruck - cRel) * truckShare
            : cAbs;
    const fixed = TYPES.car.length + cfg.margin + cfg.positionUncertainty + 2;          // + 2 m control buffer
    const tau = cfg.actuationDelay + cfg.controlPeriod + cfg.commsLatency + 0.1 + (extraTau || 0)  // reaction + stale-authority allowance
              + (separation === 'hybrid' ? truckShare * (cfg.truckGapConfirm || 0) : 0);
    return { c, fixed, tau };
  }
  function sdrCapacity(cfg, separation, v) {
    const g = sdrGapTerms(cfg, separation);
    return 3600 * v / (g.fixed + g.tau * v + g.c * v * v);
  }
  function sdrOptimalSpeed(cfg, separation) {
    const g = sdrGapTerms(cfg, separation);
    if (g.c <= 0) return cfg.speedLimit;
    return Math.sqrt(g.fixed / g.c);
  }
  function humanCapacity(cfg, v) {
    // IDM+ steady state: gap = s0 + v*T, mean T = HUMAN.T (longer in bad weather)
    const T = (cfg.humanT || HUMAN.T) * (cfg.friction < 0.5 ? 1.4 : cfg.friction < 0.9 ? 1.15 : 1);
    return 3600 * v / (TYPES.car.length + 2 + v * T);
  }

  // ---------------------------------------------------------------- world
  class World {
    constructor(opts) {
      this.cfg = Object.assign({}, DEFAULTS, opts || {});
      this.reset();
    }

    reset() {
      const c = this.cfg;
      this.t = 0;
      this.mainRng = mulberry32(c.seed);
      this.rampRng = mulberry32(c.seed + 101);
      this.rng = mulberry32(c.seed * 7919 + (c.mode === 'sdr' ? 1 : 2));
      this.faultRng = mulberry32(c.seed * 31 + 7);   // same in both worlds: who sees which object
      this.faRng = mulberry32(c.seed * 7727 + 13);   // false alarms (only drawn from when they are switched on)
      this.missRng = mulberry32(c.seed * 4111 + 29); // which objects are hard to see (only when sharedMissProb > 0)
      this.nextRoadFA = null;
      this.radioRng = mulberry32(c.seed * 6007 + 3); // radio link model (bursts, paths, dead spots), so that it leaves this.rng alone
      this.nextId = 1;
      this.vehicles = [];
      this.obstacles = [];
      this.mainQueue = [];
      this.rampQueue = [];
      this.rampArrivals = [];  // arrival times at the ramp within the last rampLaneWindow seconds
      this.nextMain = this._nextArrival(this.mainRng, c.demandMain);
      this.nextRamp = this._nextArrival(this.rampRng, c.demandRamp);
      this.nextControl = 0;
      this.vLimit = c.speedLimit;
      this.bottleneckRatio = 1;
      this.occupancy = 0; this.occupancyBudget = Infinity;
      this.lossEst = 0;        // radio loss rate as measured by the road (share of authority messages not acknowledged)
      this.staleExtra = 0;     // extra stale-authority allowance (s) the road adds to every buffer because of it
      this.lossStay = 0;       // measured chance that a message is lost when the one before it to the same vehicle was lost (bursts)
      this._lossSent = 0; this._lossLost = 0; this._lossPrev = 0; this._lossBoth = 0;   // counts smoothed over ~60 s (lossStay, burst-aware allowance)
      this.segments = [];
      for (let s = 0; s * c.segmentLength < c.length; s++) {
        this.segments.push({ start: s * c.segmentLength, end: Math.min(c.length, (s + 1) * c.segmentLength), failed: false, sensorsDown: false });
      }
      this.rampWall = { isObstacle: true, isWall: true, known: true, lane: -1, x: c.mergeEnd, length: 0.01, v: 0, a: 0 };
      this.lists = [];
      this.m = {
        collisions: 0, impacts: [], guardian: 0, supervision: 0, safeStops: 0, hardBrakes: 0,
        missedExits: 0, completed: 0, trips: [], detTimes: [], brakeEnergy: 0, vehDist: 0,
        minSpare: Infinity, rampReleasesForced: 0, incidents: [], hardBrakeLog: [],
        sidetracked: 0, liveLaneStopS: 0, objectHits: 0,
        admits: [],              // one record per vehicle let in at a gate: time, how long it waited, which gate, vehicle type
        roadFalseAlarms: 0, carFalseAlarms: 0, falseBrakes: 0,   // false alarms raised; vehicles braking for a false target
        // radio (roadmap 2.3): vehicle-cycles whose authority was 3 or more messages old; lane changes the road started,
        // how many times the changer or the new follower drove on, for longer than the normal latency, on an authority not
        // computed for the change, the longest such time (s), and the least spare then against the changer or the new leader (m)
        staleCycles: 0, laneChangesSdr: 0, lcExposed: 0, lcExposureMax: 0, lcMinSpare: Infinity,
        radioSent: 0, radioLost: 0,   // authorities sent and lost (all paths and copies lost)
      };
      this._buildLanes();
    }

    setConfig(patch) {
      const c = this.cfg;
      const demandChanged = ('demandMain' in patch && patch.demandMain !== c.demandMain) ||
                            ('demandRamp' in patch && patch.demandRamp !== c.demandRamp);
      Object.assign(c, patch);
      if ('speedLimit' in patch && c.speedPolicy === 'fixed') this.vLimit = c.speedLimit;
      if (demandChanged) {
        this.nextMain = this.t + this._nextArrival(this.mainRng, c.demandMain);
        this.nextRamp = this.t + this._nextArrival(this.rampRng, c.demandRamp);
      }
    }

    _nextArrival(rng, perHour) {
      const u = rng();
      if (perHour <= 0) return Infinity;
      return -Math.log(1 - u) / (perHour / 3600);
    }

    _makeVehicle(rng, origin) {
      const c = this.cfg;
      // fixed number of draws per vehicle so both worlds see the same stream
      const isTruck = rng() < c.truckShare;
      const exits = rng() < c.exitShare;
      const g1 = gauss(rng), g2 = gauss(rng), g3 = gauss(rng), g4 = gauss(rng);
      const type = isTruck ? 'truck' : 'car';
      const T = TYPES[type];
      const id = this.nextId++;
      return {
        id, type, origin, exits,
        secure: isTruck && c.secureLoadShare > 0 && mulberry32(c.seed * 9973 + id * 7919)() < c.secureLoadShare,   // enclosed, monitored load
        length: T.length, aMax: T.aMax, bMax: isTruck ? T.bMax : c.carBrake, bComfort: T.bComfort, vMaxType: T.vMax,
        hv0: isTruck ? clamp(24 + g1, 22, 25.5) : clamp(34.5 + 2 * g1, 29, 40),
        hT: clamp(c.humanT + 0.25 * g2, c.humanT - 0.5, c.humanT + 0.8),
        hTc: 0, hNoise: 0,                            // current (relaxing) headway; correlated acceleration noise
        hReact: clamp(0.55 + 0.1 * g3, 0.35, 0.8),
        hSurprise: Math.max(0, clamp(0.7 + 0.2 * g4, 0.4, 1.2) + (c.humanSurprise - 0.7)),   // extra perception time for unexpected events
        tArrive: this.t, tEnter: null, xEnter: 0,
        x: 0, v: 0, a: 0, lane: 0, laneTo: null, lcT: 0, lcCooldown: 0, nextLaneEval: 0,
        buf: null, plan: null, inbox: [], mode: 'auto', commsDownUntil: -1, brakeFactor: 1, bfKnown: 1, bfDetectAt: Infinity,
        broken: false, stalled: false, sidetrack: false,
        crashed: false, disabled: false, clearAt: Infinity, guardianOn: false, supervising: false,
        hardBraking: false, _soft: null, yieldTo: null, yieldUntil: 0,
        surpriseFor: null, surpriseUntil: 0, frozenCmd: 0, lastCmd: 0, _granted: -Infinity,
      };
    }

    // ------------------------------------------------------------ physics helpers
    // braking the vehicle (and the road) *believes* it has; physics uses _bTrue
    _bEff(v) {
      const c = this.cfg, plan = c.mode === 'sdr' ? c.gripPlanShare : 1;    // a weather rule of the road: plan with part of the grip
      return Math.min(v.bMax * (v.bfKnown === undefined ? v.brakeFactor : v.bfKnown), c.friction * G * 0.95 * plan);
    }
    _bTrue(v) { const c = this.cfg; return Math.min(v.bMax * v.brakeFactor, (c.frictionActual > 0 ? c.frictionActual : c.friction) * G * 0.95); }
    _bOwn(v) { return 0.9 * this._bEff(v); }
    _bLead(o) { return Math.min(1.1 * o.bMax * (o.bfKnown === undefined ? o.brakeFactor : o.bfKnown), this.cfg.friction * G); }
    _isStatic(o) { return o.isObstacle || o.crashed || o.disabled || o.stalled; }
    get S() { return this.cfg.lanes; }                // index of the safety lane (right of lane 0)
    _vLimit(v) {
      let lim = Math.min(this.vLimit, v.vMaxType, this._sightSpeed(v));
      const c = this.cfg;
      // hybrid fallback where road sensors are down: absolute gaps, at a speed where they cost less capacity
      if (c.separation === 'hybrid' && c.hybridSensorAbsolute && c.sensorGapSpeed && this._sensorGap(v.x, 700)) lim = Math.min(lim, c.sensorGapSpeed);
      return v.lane === this.S || v.laneTo === this.S ? Math.min(lim, this.cfg.safetyLaneSpeed) : lim;
    }
    // where a vehicle may move between lane 0 and the safety lane (not across the ramp or the exit)
    _safetyAccess(x) {
      const c = this.cfg;
      if (!c.safetyLane) return false;
      if (x > c.rampStartX - 50 && x < c.mergeEnd + 50) return false;
      if (x > c.offRampX - 150 && x < c.offRampX + 30) return false;
      return x < c.length - 100;
    }
    _hasFault(o) { return !o.isObstacle && ((o.bfKnown !== undefined && o.bfKnown < 1) || o.broken); }
    // highest speed at which the vehicle can stop for a static object within guardian range
    _sightSpeed(v) {
      const c = this.cfg, b = this._bOwn(v), tau = c.actuationDelay;
      const d = c.guardianRange - c.margin;
      return b * (-tau + Math.sqrt(tau * tau + 2 * d / b));
    }
    // control buffer: 2 m plus the distance covered while an authority may be stale. `allow` is the extra
    // allowance for radio loss (the vehicle uses the value sent with its authority, the road its current one)
    _buffer(v, allow) { const c = this.cfg; return 2 + v * (c.controlPeriod + c.commsLatency + 0.1 + (allow === undefined ? this.staleExtra : allow)); }

    // Where the vehicle comes to rest if it commands full braking (b) from now on. Commands already in
    // the actuator pipeline still execute first; `next` is an optional command issued this step before
    // the braking starts.
    _stopCommitted(v, b, next) {
      const dt = this.cfg.dt, buf = v.buf, n = buf.length + (next === undefined ? 0 : 1);
      let x = v.x, s = v.v;
      for (let i = 0; i < n; i++) {
        const a = clamp(i < buf.length ? buf[i] : next, -b, v.aMax);
        const sn = Math.max(0, s + a * dt);
        x += (s + sn) / 2 * dt; s = sn;
      }
      return x + s * s / (2 * b);
    }

    _stopPoint(v, b) {
      const tau = this.cfg.actuationDelay;
      const vE = v.v + Math.max(0, v.a) * tau;
      return v.x + (v.v + vE) / 2 * tau + vE * vE / (2 * b);
    }

    // which separation applies between follower f and leader o
    _absoluteGap(o, f) {
      const c = this.cfg;
      if (c.separation === 'absolute') return true;
      if (f && f.lane === this.S) return true;                       // safety lane: always brick-wall
      if (c.separation !== 'hybrid') return false;
      if (f && c.platoonBreakEvery > 0 && f.id % c.platoonBreakEvery === 0) return true;   // platoon break
      if (c.hybridHealthAbsolute && this._hasFault(o)) return true;
      if (this._truckRule(o, f)) return true;                        // lost loads land right in front of the follower
      if (c.hybridSensorAbsolute && this._sensorGap(f ? f.x : o.x)) return true;
      return false;
    }
    // hybrid: does the gap behind o have to allow for a load falling off it?
    _truckRule(o, f) {
      const c = this.cfg;
      if (c.separation !== 'hybrid' || !c.hybridTruckAbsolute || o.type !== 'truck' || o.secure) return false;
      return !(c.truckBehindTruckRelative && f && f.type === 'truck');
    }
    // true if the truck rule is the only reason for an absolute gap between f and o
    _truckRuleOnly(o, f) {
      const c = this.cfg;
      if (!f || f.isObstacle || !this._truckRule(o, f)) return false;
      if (f.lane === this.S || f.laneTo === this.S) return false;
      if (c.platoonBreakEvery > 0 && f.id % c.platoonBreakEvery === 0) return false;
      if (c.hybridHealthAbsolute && this._hasFault(o)) return false;
      return !(c.hybridSensorAbsolute && this._sensorGap(f.x));
    }
    // road sensors down in this segment, or in the next one within 300 m
    _sensorGap(x, ahead) {
      const segs = this.segments;
      const i = this._segmentIndex(x);
      if (segs[i].sensorsDown) return true;
      const j = this._segmentIndex(x + (ahead || 300));
      return j !== i && segs[j].sensorsDown;
    }

    // EoA a follower f may be given behind occupant o (vehicle, obstacle or wall)
    _eoaBehind(o, f) {
      const c = this.cfg;
      const m = c.margin + c.positionUncertainty;
      const rear = o.x - o.length;
      if (this._isStatic(o)) return { e: rear - m, r: 0, lv: 0 };
      // relative: the leader's earliest stop. Never assume it stops more gently than the follower
      // itself can, or a weak-braking leader would license a tailgate (negative steady-state gap).
      let bL = this._bLead(o);
      if (f && !f.isObstacle && f.bMax) bL = Math.max(bL, this._bOwn(f));
      const rel = { e: rear + o.v * o.v / (2 * bL) - m, r: Math.max(0, o.v * (1 + o.a / bL)), lv: o.v };
      if (!this._absoluteGap(o, f)) return rel;
      // Behind a truck the gap can also cover the time the road needs to confirm a lost load (`conf`,
      // seconds). That time is added to the follower's own buffer, like the allowance for a stale
      // authority; putting it into the authority would make the authority depend on the follower's speed.
      const conf = c.truckGapConfirm > 0 && this._truckRule(o, f) ? c.truckGapConfirm : 0;
      if (c.loadSlideDecel > 0 && this._truckRuleOnly(o, f)) {
        // the lost load is assumed to slide to rest instead of stopping dead; never closer than relative
        const bS = c.loadSlideDecel;
        const e = rear + o.v * o.v / (2 * bS) - m;
        if (e < rel.e) return { e, r: Math.max(0, o.v * (1 + o.a / bS)), lv: o.v, conf };
        return { e: rel.e, r: rel.r, lv: rel.lv, conf };
      }
      return { e: rear - m, r: Math.max(0, o.v), lv: o.v, conf };
    }

    // ------------------------------------------------------------ lanes
    _buildLanes() {
      const n = this.cfg.lanes;
      const lists = [];
      for (let i = 0; i <= n + 1; i++) lists.push([]);   // ramp, lanes 0..n-1, safety lane
      for (const v of this.vehicles) {
        lists[v.lane + 1].push(v);
        if (v.laneTo !== null) lists[v.laneTo + 1].push(v);
      }
      for (const o of this.obstacles) lists[o.lane + 1].push(o);
      lists[0].push(this.rampWall);
      for (const l of lists) l.sort((a, b) => a.x - b.x);
      this.lists = lists;
    }
    _insert(lane, o) {
      const list = this.lists[lane + 1];
      list.splice(upperBound(list, o.x), 0, o);
    }
    _ahead(lane, x, self, knownOnly) {
      const list = this.lists[lane + 1];
      if (!list) return null;
      for (let i = upperBound(list, x); i < list.length; i++) {
        const o = list[i];
        if (o === self) continue;
        if (knownOnly && o.isObstacle && !o.known) continue;
        return o;
      }
      return null;
    }
    _behind(lane, x, self, knownOnly) {
      const list = this.lists[lane + 1];
      if (!list) return null;
      for (let i = upperBound(list, x) - 1; i >= 0; i--) {
        const o = list[i];
        if (o === self) continue;
        if (knownOnly && o.isObstacle && !o.known) continue;
        return o;
      }
      return null;
    }
    _lanesOf(v) { return v.laneTo !== null ? [v.lane, v.laneTo] : [v.lane]; }

    _segmentIndex(x) { return clamp(Math.floor(x / this.cfg.segmentLength), 0, this.segments.length - 1); }
    _segmentAlive(x) { return !this.segments[this._segmentIndex(x)].failed; }
    _failedBoundaryAhead(x) {
      for (let i = this._segmentIndex(x) + 1; i < this.segments.length; i++) {
        const s = this.segments[i];
        if (s.start - x > 3000) break;
        if (s.failed) return s.start;
      }
      return null;
    }

    // first blocking object (obstacle, crashed, disabled, stopped-in-safe-stop) in lane within range
    _blockedDist(lane, x, range, knownOnly) {
      const list = this.lists[lane + 1];
      for (let i = upperBound(list, x); i < list.length; i++) {
        const o = list[i];
        if (o.x - x > range) break;
        if (o.isWall) continue;
        if (o.isObstacle && knownOnly && !o.known) continue;
        if (o.isObstacle || o.crashed || o.disabled || o.stalled || (o.broken && o.v < 8) || (o.mode === 'safestop' && o.v < 1)) return o.x - o.length - x;
      }
      return Infinity;
    }

    // ------------------------------------------------------------ main loop
    step() {
      const c = this.cfg;
      const dt = c.dt;
      this.t += dt;
      this._arrivals();
      this._buildLanes();
      this._spawn();

      const sdr = c.mode === 'sdr';
      if (sdr && c.roadFalseAlarmRate > 0) this._roadFalseAlarms();
      if (c.carFalseAlarmRate > 0) this._carFalseAlarms();
      if (sdr && this.t >= this.nextControl) {
        this._controlCycle();
        this.nextControl += c.controlPeriod;
      }

      // commands
      for (const v of this.vehicles) {
        if (v.crashed || v.disabled || v.stalled) continue;
        let cmd = sdr ? this._sdrCommand(v) : this._humanCommand(v);
        if (sdr) cmd = this._guardian(v, cmd);
        v.buf.push(cmd);
        v._cmd = v.buf.shift();
        if (!sdr && v.falseTarget) this._falseBrakeHuman(v);
      }

      // integrate
      for (const v of this.vehicles) {
        const x0 = v.x;
        if (v.crashed || v.stalled) {
          v.v = 0; v.a = 0;
          if (v.stalled && v.lane >= 0 && v.lane < this.S) this.m.liveLaneStopS += dt;
          continue;
        }
        if (v.disabled) {
          // hit something undetectable: near-instant stop ("brick wall")
          const vn = Math.max(0, v.v - 30 * dt);
          v.x += (v.v + vn) / 2 * dt; v.v = vn; v.a = -30;
          continue;
        }
        // a silent brake fault shows up quickly once the vehicle asks for real braking
        if (v.brakeFactor < v.bfKnown) {
          if (v._cmd < -1.5) v.bfDetectAt = Math.min(v.bfDetectAt, this.t + 0.3);
          if (sdr && this.t >= v.bfDetectAt) { v.bfKnown = v.brakeFactor; this._onFault(v); }
        }
        const bE = this._bTrue(v);
        const a = clamp(v._cmd, -bE, v.broken ? -c.coastDecel : v.aMax);
        const vn = v.v + a * dt;
        let dx;
        if (vn < 0) { dx = v.v * v.v / (2 * -a); v.v = 0; }
        else { dx = (v.v + vn) / 2 * dt; v.v = vn; }
        v.x += dx;
        v.a = a;
        if (v.broken && v.v < 0.05) { v.stalled = true; v.v = 0; v.clearAt = this.t + c.breakdownClearTime; }
        if (v.mode === 'safestop' && v.v < 1 && v.lane >= 0 && v.lane < this.S) this.m.liveLaneStopS += dt;
        if (a < 0) this.m.brakeEnergy += -a * v.v * dt;
        this.m.vehDist += dx;
        if (a < -4) {
          if (!v.hardBraking) {
            this.m.hardBrakes++; v.hardBraking = true;
            if (this.m.hardBrakeLog.length < 500) this.m.hardBrakeLog.push({ t: this.t, x: Math.round(v.x), lane: v.lane, laneTo: v.laneTo, origin: v.origin, mode: v.mode, guardian: v.guardianOn, sup: v.supervising, v: +v.v.toFixed(1) });
          }
        }
        else if (a > -2) v.hardBraking = false;
        if (x0 < c.detectorX && v.x >= c.detectorX) this.m.detTimes.push(this.t);
        if (v.laneTo !== null) {
          v.lcT += dt;
          if (v.lcT >= c.laneChangeDuration) {
            v.lane = v.laneTo; v.laneTo = null; v.lcCooldown = this.t + 3;
            if (v.lane === this.S) { this.m.sidetracked++; v.exits = false; v.sidetrack = true; }
          }
        }
      }

      for (const o of this.obstacles) {                 // a lost load that is still sliding
        if (!(o.v > 0)) continue;
        const vn = Math.max(0, o.v - o.slide * dt);
        o.x += (o.v + vn) / 2 * dt; o.v = vn;
      }

      this._buildLanes();
      this._collisions();
      this._removals();
    }

    run(seconds) { const n = Math.round(seconds / this.cfg.dt); for (let i = 0; i < n; i++) this.step(); }

    // ------------------------------------------------------------ demand
    _arrivals() {
      const c = this.cfg;
      while (this.t >= this.nextMain) {
        this.mainQueue.push(this._makeVehicle(this.mainRng, 'main'));
        this.nextMain += this._nextArrival(this.mainRng, c.demandMain);
      }
      while (this.t >= this.nextRamp) {
        this.rampQueue.push(this._makeVehicle(this.rampRng, 'ramp'));
        this.rampArrivals.push(this.t);
        this.nextRamp += this._nextArrival(this.rampRng, c.demandRamp);
      }
    }

    _initVehicle(v, x, lane, speed) {
      const c = this.cfg;
      v.x = x; v.lane = lane; v.v = speed; v.a = 0;
      v.tEnter = this.t; v.xEnter = x - v.length;
      const adm = this.m.admits;
      adm.push({ t: this.t, wait: this.t - v.tArrive, ramp: v.origin === 'ramp', truck: v.type === 'truck' });
      if (adm.length > 20000) adm.splice(0, 5000);
      v.hTc = v.hT;
      const delay = c.mode === 'sdr' ? c.actuationDelay : v.hReact;
      v.buf = new Array(Math.max(1, Math.round(delay / c.dt))).fill(0);
      v.nextLaneEval = this.t + this.rng() * 0.5;
      this.vehicles.push(v);
      this._insert(lane, v);
      if (c.mode === 'sdr') v.plan = this._computePlan(v);
    }

    // highest safe entry speed given what is ahead in a lane
    _entrySpeed(v, x, lane) {
      const c = this.cfg;
      const lead = this._ahead(lane, x - 1e-6, null, c.mode === 'sdr');
      const behind = this._behind(lane, x, null, false);
      if (behind && behind.x > x - v.length - 1) return -1;
      const vTarget = c.mode === 'sdr' ? this._vLimit(v) : this._humanV0(v);
      if (!lead) return vTarget;
      const gap = lead.x - lead.length - x;
      if (gap < 3) return -1;
      if (c.mode === 'sdr') {
        const k = this._eoaBehind(lead, v);
        let e = k.e;
        const fb = this._failedBoundaryAhead(x);
        if (fb !== null) e = Math.min(e, fb - c.margin);
        const b = this._bOwn(v);
        const tau = c.actuationDelay + c.controlPeriod + c.commsLatency + 0.1 + this.staleExtra + (k.conf || 0);
        const d = e - x - 2;
        if (d <= 0) return -1;
        const vs = b * (-tau + Math.sqrt(tau * tau + 2 * d / b));
        const v0 = Math.min(vTarget, vs);
        return v0 >= Math.min(0.5 * vTarget, lead.v) && v0 > 0.5 ? v0 : -1;
      }
      // enter in equilibrium with the vehicle ahead (its speed, the driver's own headway), so the entry
      // itself does not send a braking wave back into the inflow
      const T = v.hT * this._humanTFactor() * HUMAN.entryT;
      const v0 = Math.min(vTarget, lead.v + 1, Math.max(0, (gap - 2.5) / T));
      return v0 >= Math.min(vTarget, lead.v) - 0.5 && v0 > 0.5 ? v0 : -1;
    }

    _spawn() {
      const c = this.cfg;
      const sdr = c.mode === 'sdr';
      // main entry
      const reserve = Math.min(this.rampQueue.length, 4);   // leave room for vehicles waiting at the ramp
      // hold the main entry when the corridor is full, or when the merge is slow and the corridor is
      // filling (never drain an emptying road because of a local slowdown)
      const metered = sdr && (this.occupancy >= this.occupancyBudget - reserve ||
                              (this.bottleneckRatio < 0.5 && this.occupancy > 0.6 * this.occupancyBudget));
      if (this.mainQueue.length && (!sdr || this._segmentAlive(0)) && !metered) {
        // The waiting traffic is as wide as the road: a vehicle that has to wait for its lane (a truck
        // for the right lanes) does not hold up the vehicles behind it, which may use the other lanes.
        // The lanes it is waiting for are kept for it, so it cannot be overtaken forever.
        const reserved = [];
        const scan = Math.min(this.mainQueue.length, 6);
        const truckLanes = sdr && !c.truckLane ? 2 : 1;      // lanes a truck may enter in
        // ramp vehicles that will want a place in the right lane by the time a vehicle entering now gets to the merge
        const recent = this.rampArrivals;
        while (recent.length && recent[0] < this.t - c.rampLaneWindow) recent.shift();
        const rampDue = Math.max(this.rampQueue.length, recent.length);
        for (let qi = 0; qi < scan; qi++) {
          const v = this.mainQueue[qi];
          const x0 = v.length;
          let best = -1, bestV = -1, restricted = false;
          for (let L = 0; L < c.lanes; L++) {
            if (v.type === 'truck' && L > truckLanes - 1) { restricted = true; continue; }   // trucks keep right (human drivers: right lane)
            if (reserved[L]) continue;
            if (sdr && c.truckLane && L === 0 && v.type === 'car') continue;                 // truck lane: cars enter in the other lanes
            // network-level admission: keep lane 0 free for the ramp when its queue builds up
            if (sdr && L === 0 && rampDue > c.rampKeepLaneAbove && v.type === 'car') continue;
            let s = this._entrySpeed(v, x0, L);
            if (v.exits && L === 0 && s > 0) s *= 1.15;     // pre-position exiting traffic (SDR: trip booking; humans: know their exit)
            if (s > bestV + 0.01) { bestV = s; best = L; }
          }
          if (best >= 0) {
            bestV = Math.min(bestV, this._entrySpeed(v, x0, best));
            this.mainQueue.splice(qi, 1); this._initVehicle(v, x0, best, bestV);
            break;
          }
          if (!restricted) break;                           // no lane has room for a car: nobody behind it gets in either
          for (let L = 0; L < truckLanes; L++) reserved[L] = true;
        }
      }
      // on-ramp
      if (this.rampQueue.length && (!sdr || this._segmentAlive(c.rampStartX))) {
        const v = this.rampQueue[0];
        const x0 = c.rampStartX + v.length;
        const s = this._entrySpeed(v, x0, -1);
        if (s > 0) {
          const v0 = Math.min(15, s);
          let ok = true;
          if (sdr) {
            const waited = this.t - v.tArrive;
            ok = this._rampSlotFree(v, x0, v0) || waited >= c.rampMaxWait;
            if (ok && waited >= c.rampMaxWait && !this._rampSlotFree(v, x0, v0)) this.m.rampReleasesForced++;
          }
          if (ok) { this.rampQueue.shift(); this._initVehicle(v, x0, -1, v0); }
        }
      }
    }

    // SDR ramp gate: release a vehicle only if a slot in lane 0 is predicted at the merge point
    _rampSlotFree(v, x0, v0) {
      const c = this.cfg;
      const vL = this._vLimit(v);
      const a = v.aMax * 0.6;
      const xm = (c.mergeStart + c.mergeEnd) / 2;
      const dist = xm - x0;
      const dAcc = Math.max(0, (vL * vL - v0 * v0) / (2 * a));
      const tArr = dist <= dAcc ? (-v0 + Math.sqrt(v0 * v0 + 2 * a * dist)) / a : (vL - v0) / a + (dist - dAcc) / vL;
      const vArr = Math.min(vL, Math.sqrt(v0 * v0 + 2 * a * dist));
      const g = sdrGapTerms(c, c.separation, this.staleExtra);
      const need = g.fixed + g.tau * vArr + g.c * vArr * vArr + 5;
      for (const L of [0, -1]) {
        for (const o of this.lists[L + 1]) {
          if (o.isWall || o === v) continue;
          let p = o.x + (this._isStatic(o) ? 0 : o.v * tArr);
          if (L === -1) p = Math.min(p, c.mergeEnd);
          if (Math.abs(p - xm) < need + Math.max(o.length || 0, v.length)) return false;
        }
      }
      return true;
    }

    // ------------------------------------------------------------ SDR: segment controllers
    _controlCycle() {
      const c = this.cfg;
      for (const o of this.obstacles) {
        if (o.known || this.t < o.detectAt) continue;
        if (o.reported || !this.segments[this._segmentIndex(o.x)].sensorsDown) o.known = true;
      }
      this._updateSpeedPolicy();
      for (const v of this.vehicles) { v._soft = null; v._yieldFor = null; v._lcWant = null; }
      for (const v of this.vehicles) {
        if (v.crashed || v.disabled || v.stalled || !this._segmentAlive(v.x) || this.t < v.commsDownUntil) continue;
        this._sdrLaneDecision(v);
      }
      this._virtualMerge();
      this._monitorBottleneck();
      let sent = 0, lost = 0, prevLost = 0, both = 0;
      const radio = this._radioModelOn();
      for (const v of this.vehicles) {
        if (v.crashed || v.disabled || v.stalled) continue;
        if (!this._segmentAlive(v.x)) continue;       // no controller → no authority
        const plan = this._computePlan(v);
        if (this.t < v.commsDownUntil) continue;      // message never arrives
        sent++;
        const u = this.rng();                         // drawn in every case, so the rest of the run sees the same random numbers
        const delay = radio ? this._radioDeliver(v) : u < c.packetLoss ? -1 : 0;
        // the road sees which authorities were acknowledged: runs of lost messages per vehicle
        const run = v._lostRun || 0;
        if (run > 0) { prevLost++; if (delay < 0) both++; }
        v._lostRun = delay < 0 ? run + 1 : 0;
        if (v._lostRun >= 3) this.m.staleCycles++;
        if (delay < 0) { lost++; continue; }
        v.inbox.push({ deliverAt: this.t + c.commsLatency + delay, plan });
      }
      this.m.radioSent += sent; this.m.radioLost += lost;
      this._measureLoss(sent, lost, prevLost, both);
    }

    // ------------------------------------------------------------ SDR: radio link model (roadmap 2.3)
    _radioModelOn() {
      const c = this.cfg;
      return c.lossBurst > 0 || c.radioPaths > 1 || c.lossCommon > 0 || c.repeatGap > 0 || c.outageX1 > c.outageX0;
    }
    // State of one two-state loss chain (Gilbert–Elliott, in continuous time) for vehicle v at time t: true = in a
    // loss burst. `pi` is its long-run share of time in a burst, cfg.lossBurst the mean length of a burst (s).
    // With lossBurst 0 every sample is independent. Chain 0 is the cause common to all paths, chain i path i.
    _lossChain(v, i, pi, t) {
      const R = v._radio || (v._radio = []);
      let s = R[i];
      if (!s) { s = R[i] = { bad: this.radioRng() < pi, t }; return s.bad; }
      const B = this.cfg.lossBurst;
      let pBad = pi;
      if (B > 0 && pi < 1) {
        const e = Math.exp(-(t - s.t) / (B * (1 - pi)));      // leaves a burst at rate 1/B, enters one at rate pi/((1 - pi)·B)
        pBad = s.bad ? pi + (1 - pi) * e : pi * (1 - e);
      }
      s.bad = this.radioRng() < pBad; s.t = t;
      return s.bad;
    }
    // Sends this cycle's authority to v over every path (and again after repeatGap if set). Returns the extra delay
    // of the first copy that gets through (0 or repeatGap), or -1 if every copy is lost.
    _radioDeliver(v) {
      const c = this.cfg, p = c.packetLoss;
      const pc = clamp(c.lossCommon || 0, 0, 1) * p;            // loss from the common cause
      const pi = pc < 1 ? 1 - (1 - p) / (1 - pc) : 0;           // loss of each path on its own; together each path loses p
      const n = Math.max(1, Math.round(c.radioPaths));
      const dead = c.outageX1 > c.outageX0 && this.t >= c.outageT0 && this.t < c.outageT1 && v.x >= c.outageX0 && v.x < c.outageX1;
      const copies = c.repeatGap > 0 ? [0, Math.min(c.repeatGap, 0.9 * c.controlPeriod)] : [0];
      for (const d of copies) {
        const t = this.t + d;
        const common = pc > 0 ? this._lossChain(v, 0, pc, t) : false;
        let ok = false;
        for (let i = 1; i <= n; i++) {
          const lostHere = (pi > 0 ? this._lossChain(v, i, pi, t) : false) || common || (dead && (c.outageAllPaths || i === 1));
          if (!lostHere) ok = true;
        }
        if (ok) return d;
      }
      return -1;
    }

    // The road sees which authorities were acknowledged, so it knows the radio loss rate. It sizes the
    // stale-authority allowance so that a run of lost messages long enough to outlast it is rare
    // (lossTolerance per cycle): radio loss then costs capacity instead of causing full-force braking.
    // About two cycles of slack are already in every buffer.
    // With independent loss a run of k lost messages has the chance p^k. In bursts a lost message is followed by
    // another one more often (lossStay = q > p), and a run of k has the chance p·q^(k-1); with lossBurstAware the
    // road sizes the allowance for that (for independent loss the two are the same).
    _measureLoss(sent, lost, prevLost, both) {
      const c = this.cfg;
      if (sent) this.lossEst += 0.02 * (lost / sent - this.lossEst);      // ~5 s smoothing
      // The burst-aware estimate rests on rare events (runs of lost messages), so it uses counts smoothed over about
      // 60 s; with 5 s every rare burst made the allowance jump and the gaps open with hard braking.
      if (sent) {
        const ws = Math.min(1, c.controlPeriod / 60);
        this._lossSent += ws * (sent - this._lossSent); this._lossLost += ws * (lost - this._lossLost);
        this._lossPrev += ws * ((prevLost || 0) - this._lossPrev); this._lossBoth += ws * ((both || 0) - this._lossBoth);
      }
      this.lossStay = this._lossPrev > 0 ? this._lossBoth / this._lossPrev : 0;
      const p = this.lossEst;
      let k = Math.log(c.lossTolerance) / Math.log(Math.min(p, 0.99));
      let on = p > 0.002;
      if (c.lossBurstAware) {
        // (no lower limit on the loss rate needed here: below the tolerance it gives no allowance by itself)
        const ps = this._lossSent > 0 ? this._lossLost / this._lossSent : 0;
        on = ps > 0;
        if (on) k = 1 + Math.log(c.lossTolerance / ps) / Math.log(clamp(Math.max(ps, this.lossStay), 1e-6, 0.99));
      }
      this.staleExtra = c.lossAdaptive && on
        ? Math.min(3, c.controlPeriod * Math.max(0, k - 2))
        : 0;
    }

    _updateSpeedPolicy() {
      const c = this.cfg;
      let target = this.vLimit;
      if (c.speedPolicy === 'adaptive') {
        const pressure = this.mainQueue.length + this.rampQueue.length;
        if (pressure > 8) target = clamp(sdrOptimalSpeed(c, c.separation), 16.7, c.speedLimit);
        else if (pressure < 3) target = c.speedLimit;
      } else target = c.speedLimit;
      const maxD = 0.5 * c.controlPeriod; // 0.5 m/s per second
      this.vLimit += clamp(target - this.vLimit, -maxD, maxD);
    }

    _computePlan(v) {
      const c = this.cfg;
      let e = Infinity, r = 0, lv = 0, conf = 0;
      const hard = [];
      for (const L of this._lanesOf(v)) {
        const o = this._ahead(L, v.x, v, true);
        if (o && !(o.isWall && v.laneTo !== null)) { const k = this._eoaBehind(o, v); hard.push(k); if (k.e < e) { e = k.e; r = k.r; lv = k.lv; conf = k.conf || 0; } }
      }
      // laneChangeAck: a vehicle that wants to change into this vehicle's lane, just ahead of it, is waiting for this
      // vehicle to acknowledge an authority that already keeps behind it
      const y = v._yieldFor;
      if (y) { const k = this._eoaBehind(y, v); hard.push(k); if (k.e < e) { e = k.e; r = k.r; lv = k.lv; conf = k.conf || 0; } }
      // ... and a vehicle about to change lanes gets the instruction with an authority that also keeps behind the
      // leader in the lane it is going to. Only while the change is still possible: another vehicle may have moved
      // into that lane alongside it in this cycle, and an authority behind that one could not be kept.
      const W = v._lcWant !== null && v._lcWant !== undefined && this._sdrLaneChangeFeasible(v, v._lcWant) ? v._lcWant : null;
      if (W !== null) {
        const o = this._ahead(W, v.x, v, true);
        if (o && !o.isWall) { const k = this._eoaBehind(o, v); hard.push(k); if (k.e < e) { e = k.e; r = k.r; lv = k.lv; conf = k.conf || 0; } }
      }
      const fb = this._failedBoundaryAhead(v.x);
      if (fb !== null) {
        // no new authority into a failed segment, but what was already granted stays valid
        // (it was cleared with a safe stop included), so nobody needs to emergency-brake
        const wall = Math.max(fb - c.margin, v._granted);
        if (wall < e) { e = wall; r = 0; lv = 0; conf = 0; }
      }
      if (!isFinite(e)) { e = v.x + 2000; r = lv = this._vLimit(v); }
      v._granted = e;
      // the soft constraint that asks for most room: its end point less the extra buffer that goes with it
      // (with no confirmation time in play that is simply the nearest end point)
      let se = e, sr = r, slv = lv, sconf = conf;
      const consider = s => { const cf = s.conf || 0; if (s.e - cf * v.v < se - sconf * v.v) { se = s.e; sr = s.r; slv = s.lv; sconf = cf; } };
      if (v._soft) for (const s of v._soft) consider(s);
      // while changing lanes: the leader that is further away may still ask for more room (a truck with its longer buffer)
      for (const k of hard) if (k.conf) consider(k);
      if (c.truckGapConfirm > 0 || c.loadSlideDecel > 0) {
        // A truck one vehicle further ahead: if the vehicle in between pulls out, the truck's longer gap
        // applies at once. Make room for it early and gently instead of braking hard at that moment.
        for (const L of this._lanesOf(v)) {
          const o1 = this._ahead(L, v.x, v, true);
          const o2 = o1 && !o1.isObstacle ? this._ahead(L, o1.x, v, true) : null;
          if (o2 && !o2.isObstacle && this._truckRule(o2, v)) consider(this._eoaBehind(o2, v));
        }
      }
      return { tMeas: this.t, eoa: e, rate: r, leadV: lv, softEoa: se, softRate: sr, softLeadV: slv, vLimit: this._vLimit(v),
        allow: this.staleExtra + conf, softAllow: this.staleExtra + sconf, yieldId: y ? y.id : 0, lcTo: W };
    }

    _rampNear(x, range) {
      for (const o of this.lists[0]) if (!o.isObstacle && Math.abs(o.x - x) < range) return true;
      return false;
    }

    // Virtual-vehicle merging: every ramp vehicle is projected onto lane 0 as a "ghost" placed
    // by its predicted arrival time at the merge point (it is still accelerating on the ramp).
    // Lane 0 and the ramp then form one zipped queue ordered by arrival time; mainline vehicles
    // softly follow the ghost ahead of them, so gaps open early and gently.
    _virtualMerge() {
      const c = this.cfg, xm = c.mergeStart;
      const items = [];
      for (const r of this.lists[0]) {
        if (r.isObstacle || r.laneTo !== null || this._isStatic(r)) continue;
        const vL = this._vLimit(r), a = Math.max(0.3, r.aMax * 0.8);
        const d = Math.max(0, xm - r.x);
        const dAcc = Math.max(0, (vL * vL - r.v * r.v) / (2 * a));
        let eta, vArr;
        if (d <= dAcc) { vArr = Math.sqrt(r.v * r.v + 2 * a * d); eta = (vArr - r.v) / a; }
        else { vArr = vL; eta = (vL - r.v) / a + (d - dAcc) / vL; }
        const gx = r.x >= xm ? r.x : xm - eta * vArr;      // ghost position in lane-0 coordinates
        items.push({ veh: r, ramp: true, gx, ghost: r.x >= xm ? r : { x: gx, length: r.length, v: vArr, a: 0, bMax: r.bMax, brakeFactor: r.brakeFactor, bfKnown: r.bfKnown, id: r.id, type: c.ghostType ? r.type : undefined, secure: r.secure, broken: r.broken } });
      }
      if (!items.length) return;
      for (const o of this.lists[1]) {
        if (o.isObstacle || this._isStatic(o) || o.x < c.rampStartX - 600 || o.x > c.mergeEnd + 100) continue;
        items.push({ veh: o, ramp: false, gx: o.x, ghost: o });
      }
      items.sort((a, b) => a.gx - b.gx);
      for (let i = 0; i + 1 < items.length; i++) {
        const f = items[i], l = items[i + 1];
        if (l.ramp === f.ramp) continue;
        let k = null;
        if (!f.ramp) k = this._eoaBehind(l.ghost, f.veh);                        // mainline makes room for the ghost
        else if (f.veh.x >= xm - 200) {                                           // ramp vehicle slots in behind
          k = this._eoaBehind(l.veh, f.veh);
          // The zip order is in lane-0 coordinates, where the ramp vehicle is at its ghost. Its place
          // behind the leader has to be carried over to where it really is on the ramp. Without this a
          // ramp vehicle that has slowed down is told to stay behind a vehicle that is already alongside
          // or behind it, brakes for that, falls further back and ends up standing on the ramp.
          if (c.ghostFrame) k = { e: k.e + (f.veh.x - f.gx), r: k.r, lv: k.lv, conf: k.conf };
        }
        if (k) (f.veh._soft || (f.veh._soft = [])).push(k);
      }
    }

    // Network layer: watch the merge bottleneck; the main gate holds traffic when it degrades
    _monitorBottleneck() {
      const c = this.cfg;
      let s = 0, n = 0;
      for (let L = 0; L < c.lanes; L++) for (const o of this.lists[L + 1]) {
        if (o.isObstacle || o.x < c.mergeStart - 500 || o.x > c.mergeEnd + 300) continue;
        s += o.v / Math.min(this.vLimit, o.vMaxType); n++;
      }
      this.bottleneckRatio = n ? s / n : 1;
      // occupancy budget for the stretch from the entry to just past the merge: vehicles that
      // fit at the critical (capacity) density for the current speed and separation policy
      const g = sdrGapTerms(c, c.separation, this.staleExtra);
      const v = this.vLimit;
      const meanLen = TYPES.car.length + c.truckShare * (TYPES.truck.length - TYPES.car.length);
      const spacing = g.fixed - TYPES.car.length + meanLen + g.tau * v + g.c * v * v;
      const zoneLen = c.mergeEnd + 300;
      let occ = 0;
      for (const o of this.vehicles) if (o.x < zoneLen && !o.crashed && !o.disabled) occ++;
      this.occupancy = occ;
      this.occupancyBudget = c.budgetFactor * c.lanes * zoneLen / spacing;
      if (c.truckLane && c.lanes > 1) {
        // one lane of trucks at their own speed and gap, the other lanes cars at relative separation
        const gc = sdrGapTerms(c, 'relative', this.staleExtra);
        const T = TYPES.truck, vt = Math.min(v, T.vMax);
        const bOwn = 0.9 * Math.min(T.bMax, c.friction * G * 0.95), bLead = Math.min(1.1 * T.bMax, c.friction * G);
        const abs = c.separation === 'absolute' || (c.separation === 'hybrid' && c.hybridTruckAbsolute && !c.truckBehindTruckRelative);
        const ct = c.separation === 'relative' || !abs ? Math.max(0, 1 / (2 * bOwn) - 1 / (2 * Math.max(bLead, bOwn))) : 1 / (2 * bOwn);
        const sTruck = g.fixed - TYPES.car.length + T.length + (gc.tau + (abs ? c.truckGapConfirm : 0)) * vt + ct * vt * vt;
        const sCar = gc.fixed + gc.tau * v + gc.c * v * v;
        this.occupancyBudget = c.budgetFactor * zoneLen * ((c.lanes - 1) / sCar + 1 / sTruck);
      }
    }

    _sdrLaneDecision(v) {
      if (v.laneTo !== null || this.t < v.lcCooldown) return;
      const c = this.cfg;
      if (v.lane === this.S) return;                     // stays in the safety lane
      let want = null, mandatory = false;
      if (v.sidetrack && v.lane >= 0) {
        // faulty vehicle: work right, then into the safety lane where it is accessible
        if (v.lane > 0) want = v.lane - 1;
        else if (this._safetyAccess(v.x)) want = this.S;
        else return;
        mandatory = true;
      } else if (v.lane === -1) {
        if (v.x < c.mergeStart) return;
        want = 0; mandatory = true;
      } else {
        const blockedHere = this._blockedDist(v.lane, v.x, c.laneCloseDist, true);
        if (isFinite(blockedHere)) {
          let bestD = blockedHere;
          for (const L of [v.lane - 1, v.lane + 1]) {
            if (L < 0 || L >= c.lanes) continue;
            const d = this._blockedDist(L, v.x, c.laneCloseDist, true);
            if (d > bestD) { bestD = d; want = L; }
          }
          mandatory = want !== null;
        }
        if (v.exits && v.lane > 0 && v.x < c.offRampX) {
          // the right lane is closed just before the exit: reroute instead of forcing a late merge
          const bl = this._blockedDist(0, v.x, c.offRampX - v.x, true);
          if (isFinite(bl) && c.offRampX - (v.x + bl) < 300) { v.exits = false; this.m.rerouted = (this.m.rerouted || 0) + 1; }
        }
        const exitSoon = v.exits && v.x > c.offRampX - c.exitPrepDist && v.x < c.offRampX;
        // truck lane: a car uses the right lane only to get on (it leaves it again) and to get off
        const carOut = c.truckLane && v.type === 'car';
        if (want === null && carOut && v.lane === 0 && !exitSoon && c.lanes > 1) { want = 1; mandatory = true; }
        if (want === null && v.exits && v.lane > 0 && v.x < c.offRampX && !(carOut && v.lane === 1 && !exitSoon)) {
          want = v.lane - 1; mandatory = v.x > c.offRampX - c.exitPrepDist;
        }
        if (want === null) {
          const nearMerge = v.x > c.mergeStart - 600 && v.x < c.mergeEnd + 100;
          const lead = this._ahead(v.lane, v.x, v, true);
          if (v.type === 'car' && !v.exits && lead && !lead.isObstacle && lead.x - v.x < 150 &&
              this._vLimit(lead) < this._vLimit(v) - 2 && v.lane + 1 < c.lanes && !(v.exits && v.x > c.offRampX - c.exitPrepDist)) {
            want = v.lane + 1;                                   // overtake slower vehicle
          } else if (v.lane === 0 && nearMerge && !v.exits && v.type === 'car' && this._rampNear(v.x, 250)) {
            want = 1;                                            // courtesy: free lane 0 for merging traffic
          } else if (v.lane > (carOut ? 1 : 0) && !(v.lane === 1 && nearMerge && this._rampNear(v.x, 400))) {
            const rl = this._ahead(v.lane - 1, v.x, v, true);
            if (v.type === 'truck' || !rl || (rl.x - v.x > 200 && this._vLimit(rl) >= this._vLimit(v) - 1)) want = v.lane - 1;
          }
        }
      }
      if (want === null) return;
      // don't move into a lane that is blocked just ahead (unless the current lane is blocked too)
      if (!v.sidetrack && want >= 0 && want < c.lanes && isFinite(this._blockedDist(want, v.x, c.laneCloseDist, true)) &&
          !isFinite(this._blockedDist(v.lane, v.x, c.laneCloseDist, true))) return;
      if (this._sdrLaneChangeFeasible(v, want)) { if (!c.laneChangeAck || this._laneChangeAcked(v, want)) this._sdrStartLaneChange(v, want); return; }
      if (mandatory) this._requestMerge(v, want);
    }

    // laneChangeAck: do the changer and the new follower both hold an authority computed for the change (the changer:
    // the instruction, with an authority that also keeps behind its new leader; the follower: one that keeps behind
    // the changer)? If not, their next authorities will be (the road sees acknowledgements one control cycle later,
    // so the change starts a cycle later at best)
    // Both requests are renewed every cycle while the change is pending: renewing only the one that is missing lets
    // the two fall out of step (one cycle the changer holds its instruction, the next the follower its yield) and
    // the change never starts (a gridlock at the end of the acceleration lane, found in roadmap 2.3)
    _laneChangeAcked(v, L) {
      const ok = !!(v.plan && v.plan.lcTo === L);
      v._lcWant = L;
      const fol = this._behind(L, v.x, v, true);
      if (!fol || fol.isObstacle || this._isStatic(fol) || !fol.buf) return ok;
      if (!fol._yieldFor) fol._yieldFor = v;
      return ok && !!(fol.plan && fol.plan.yieldId === v.id);
    }

    // a lane change the road grants. Records whether the changer or the new follower is left driving on an authority
    // that was not computed for the change (each gets one with the next message that arrives)
    _sdrStartLaneChange(v, L) {
      this.m.laneChangesSdr++;
      const fol = this._behind(L, v.x, v, true);
      if (fol && !fol.isObstacle && !this._isStatic(fol) && fol.buf && !(fol.plan && fol.plan.yieldId === v.id)) fol._lcExp = { by: v, t0: this.t, L };
      if (!(v.plan && v.plan.lcTo === L)) v._lcExp = { by: null, t0: this.t, L };
      this._startLaneChange(v, L);
    }
    // While a vehicle is exposed: its true spare against the changer (follower) or against the leader in the target
    // lane (changer), until an authority computed after the change arrives
    _trackLaneChangeExposure(f, bE) {
      const x = f._lcExp, p = f.plan;
      if ((p && p.tMeas >= x.t0) || (x.by && (x.by.gone || x.by.crashed || !this._lanesOf(x.by).includes(x.L))) || !this._lanesOf(f).includes(x.L)) {
        const d = this.t - x.t0;
        if (d > 1.5 * this.cfg.commsLatency + 1e-9) this.m.lcExposed++;
        if (d > this.m.lcExposureMax) this.m.lcExposureMax = d;
        f._lcExp = null;
        return;
      }
      const o = x.by || this._ahead(x.L, f.x, f, true);
      if (!o || o.isWall) return;
      const spare = this._eoaBehind(o, f).e - this._stopCommitted(f, bE);
      if (spare < this.m.lcMinSpare) this.m.lcMinSpare = spare;
    }

    _sdrLaneChangeFeasible(v, L) {
      const c = this.cfg;
      if (L === this.S) { if (v.lane !== 0 || !this._safetyAccess(v.x)) return false; }
      else if (L < 0 || L >= c.lanes) return false;
      if (v.lane === -1 && (v.x < c.mergeStart || v.x > c.mergeEnd)) return false;
      if (!this._segmentAlive(v.x)) return false;
      const lead = this._ahead(L, v.x, v, true);
      if (lead) {
        if (lead.x - lead.length <= v.x) return false;
        const k = this._eoaBehind(lead, v);
        if (k.e - this._stopPoint(v, this._bOwn(v)) < c.laneChangeBufFactor * this._buffer(v.v, this.staleExtra + (k.conf || 0))) return false;
      }
      let fol = this._behind(L, v.x, v, true);
      if (fol && fol.isObstacle && !fol.isWall) {
        if (fol.x >= v.x - v.length) return false;                   // the object is still beside the vehicle
        // A vehicle that can no longer stop before a confirmed object comes through it if nothing is there (a false
        // alarm) or if it drives over it, so it is the follower that counts, not the object.
        const f2 = this._behind(L, fol.x - 1e-6, v, true);
        if (f2 && !f2.isObstacle && !this._isStatic(f2) && this._stopPoint(f2, this._bEff(f2)) > fol.x - fol.length - c.margin) fol = f2;
      }
      if (fol) {
        if (fol.x >= v.x - v.length) return false;
        if (!fol.isObstacle && !this._isStatic(fol)) {
          // in a standing queue a small spare is enough (a stopped follower cannot back off to make more)
          const k = this._eoaBehind(v, fol);
          const need = fol.v < 2 && v.v < 2 ? 0.3 : c.laneChangeBufFactor * this._buffer(fol.v, this.staleExtra + (k.conf || 0));
          if (k.e - this._stopPoint(fol, this._bOwn(fol)) < need) return false;
        }
      }
      return true;
    }

    // cooperative merge: ask the target-lane follower to open a gap, or make the requester drop back
    _requestMerge(v, L) {
      if (L < 0 || L > this.S) return;
      const lead = this._ahead(L, v.x, v, true);
      const fol = this._behind(L, v.x, v, true);
      const extra = 3; // aim a little beyond the lane-change threshold so the gap actually qualifies
      const shift = k => ({ e: k.e - extra, r: k.r, lv: k.lv, conf: k.conf });
      // never queue up beside a blockage to slot in behind it: that blocks the requester's lane too
      // (gridlock); a vehicle wanting a blocked lane waits until it has passed the blockage
      const leadBlocked = lead && (this._isStatic(lead) || isFinite(this._blockedDist(L, v.x, 300, true)));
      if (lead && !leadBlocked) (v._soft || (v._soft = [])).push(shift(this._eoaBehind(lead, v)));
      // a follower already alongside cannot make room by braking: let it pass instead
      if (fol && !fol.isObstacle && !this._isStatic(fol) && v.x - fol.x < 250 && fol.x < v.x - v.length - 1) {
        const ghost = shift(this._eoaBehind(v, fol));
        const spare = ghost.e - this._stopPoint(fol, this._bOwn(fol));
        // a vehicle without propulsion cannot drop back and catch up again: the others make room
        if (spare > -30 || v.broken) (fol._soft || (fol._soft = [])).push(ghost);
        else (v._soft || (v._soft = [])).push(this._eoaBehind(fol, v));
      }
    }

    _startLaneChange(v, L) {
      v.laneTo = L; v.lcT = 0;
      this._insert(L, v);
    }

    // ------------------------------------------------------------ SDR: vehicle
    _sdrCommand(v) {
      const c = this.cfg, t = this.t;
      while (v.inbox.length && v.inbox[0].deliverAt <= t) v.plan = v.inbox.shift().plan;
      const p = v.plan;
      const bE = this._bEff(v), bO = 0.9 * bE;
      if (v._lcExp) this._trackLaneChangeExposure(v, bE);
      const fresh = p && t - p.tMeas <= c.authorityTTL;
      if (!fresh) {
        // authority expired: run the pre-cleared safe stop (stop before the last EoA)
        if (v.mode !== 'safestop') { v.mode = 'safestop'; this.m.safeStops++; }
        if (this.t < v.commsDownUntil) v.sidetrack = true;   // the road sends it to the safety lane once it hears it again
        // part of the pre-cleared safe stop: from lane 0, pull into the (normally empty) safety lane
        if (v.lane === 0 && v.laneTo === null && v.v > 3 && this._sdrLaneChangeFeasible(v, this.S)) this._startLaneChange(v, this.S);
        if (v.v <= 0.01) return 0;
        const avail = (p ? p.eoa : v.x) - v.x - v.v * c.actuationDelay;
        const req = avail > 0.5 ? v.v * v.v / (2 * avail) : bE;
        return -Math.min(bE, Math.max(2.0, req * 1.15));
      }
      v.mode = 'auto';
      const age = t - p.tMeas;
      const sp = this._stopPoint(v, bO);
      const buf = this._buffer(v.v, p.allow);
      const denom = c.actuationDelay + v.v / bO + 0.05;
      const k = 0.6;
      const eH = p.eoa + p.rate * age, eS = p.softEoa + p.softRate * age;
      const spH = eH - sp, spS = eS - sp;
      let aH = (p.rate - v.v + k * (spH - buf)) / denom;
      aH = Math.min(aH, this._approachDecel(v.v, p.leadV, p.rate, spH - buf));
      aH = Math.max(aH, spH < buf ? -bO : -v.bComfort);
      const bufS = p.softAllow === p.allow ? buf : this._buffer(v.v, p.softAllow);
      let aS = (p.softRate - v.v + k * (spS - bufS)) / denom;
      aS = Math.min(aS, this._approachDecel(v.v, p.softLeadV, p.softRate, spS - bufS));
      aS = Math.max(aS, -v.bComfort);
      const aF = clamp(0.5 * (p.vLimit - v.v), -v.bComfort, v.aMax);
      let a = Math.min(aF, aH, aS, v.aMax);
      if (v.broken && v.lane === this.S) a = Math.min(a, -1.5);     // broken down: stop in the safety lane
      // supervision: the stale (non-extrapolated) authority must always be respected with guaranteed
      // braking. `spare` is the true distance left: commands already in the actuator pipeline are
      // counted, then full braking. If issuing `a` now would leave no way to stop next step, brake now,
      // so the granted authority is never overrun (not even by one time step).
      const spare = p.eoa - this._stopCommitted(v, bE);
      if (spare < this.m.minSpare && v.x > 50) this.m.minSpare = spare;
      if (p.eoa - this._stopCommitted(v, bE, a) < 0) {
        a = -bE;
        if (!v.supervising) { this.m.supervision++; v.supervising = true; }
      } else v.supervising = false;
      return a;
    }

    // early, gentle braking when closing in on a slower authority limit:
    // decel needed to match its speed within the remaining spare distance
    _approachDecel(v, leadV, rate, room) {
      const c = this.cfg;
      if (room < c.approachMinRoom) return Infinity;          // close following is left to the gap controller
      const closing = v - (c.approachRef === 'rate' ? rate : leadV);
      if (closing <= 0) return Infinity;
      const dReq = closing * closing / (2 * Math.max(0.5, room + closing * 0.5));
      return dReq > 0.3 ? -1.2 * dReq : Infinity;
    }

    // onboard guardian: independent sensor, sees only the first object ahead, may only brake
    _guardian(v, a) {
      const c = this.cfg;
      let trigger = false;
      const bE = this._bEff(v);
      const own = v.x + v.v * c.actuationDelay + v.v * v.v / (2 * bE);
      for (const L of this._lanesOf(v)) {
        let o = this._ahead(L, v.x, v, false);
        // a false alarm is not there for the vehicle's own sensor; only a V2V message about it makes the guardian brake
        while (o && o.phantom && !(o.v2vAt !== undefined && this.t >= o.v2vAt)) o = this._ahead(L, o.x, v, false);
        if (!o || o.isWall) continue;
        const rear = o.x - o.length;
        if (rear - v.x > c.guardianRange) continue;
        if (o.isObstacle && !o.known) {
          if (!this._carSees(v, o)) continue;          // this vehicle's sensor missed it
          this._reportObject(o);
        }
        const objStop = (this._isStatic(o) || o.v < 0.5) ? rear : rear + o.v * o.v / (2 * this._bLead(o));
        if (own > objStop - 0.5) trigger = true;
      }
      if (v.falseTarget && this._falseTargetBrakes(v, own)) trigger = true;
      if (trigger) {
        if (!v.guardianOn) { this.m.guardian++; v.guardianOn = true; }
        return -bE;
      }
      v.guardianOn = false;
      return a;
    }

    // does vehicle v's own sensor see object o? (rolled once per vehicle-object pair; V2V shares a detection)
    _carSees(v, o) {
      if (o.v2vAt !== undefined && this.t >= o.v2vAt) return true;
      if (!o.seen) o.seen = new Map();
      let r = o.seen.get(v.id);
      if (r === undefined) { r = this.faultRng() < (o.hard ? this.cfg.sharedMissDetect : this.cfg.carDetectProb); o.seen.set(v.id, r); }
      return r;
    }
    _reportObject(o) {
      const c = this.cfg;
      if (c.carSensorShare === 'none' || o.reported) return;
      o.reported = true;
      o.detectAt = Math.min(o.detectAt, this.t + c.commsLatency + c.controlPeriod);   // road confirms from the vehicle report
      if (c.carSensorShare === 'v2v') o.v2vAt = this.t + c.v2vLatency;
    }
    _onFault(v) { v.sidetrack = true; }

    // ------------------------------------------------------------ false alarms (roadmap 2.4)
    // A false alarm of the road sensors: an object the road treats as confirmed where nothing is. The road closes
    // the lane and gives authorities short of it, as for real debris, until a re-check clears it. Nobody can hit it.
    falseAlarm(x, lane) {
      const c = this.cfg;
      const o = { isObstacle: true, phantom: true, x: x + 1, length: 1, lane, v: 0, a: 0, slide: 0, known: true, roadSees: true,
        detectAt: this.t, clearAt: this.t + c.falseAlarmClearTime };
      this.obstacles.push(o);
      this._insert(lane, o);
      this.m.roadFalseAlarms++;
      return o;
    }
    // a road false alarm at a random place in a running lane, between x0 and x1, where no vehicle is
    // (a detection on a vehicle the road already knows is that vehicle)
    randomFalseAlarm(x0, x1) {
      const c = this.cfg, r = this.faRng;
      const lo = x0 === undefined ? 100 : x0, hi = x1 === undefined ? c.length - 100 : x1;
      for (let k = 0; k < 20; k++) {
        const x = lo + (hi - lo) * r(), lane = Math.min(c.lanes - 1, Math.floor(r() * c.lanes));
        let free = true;
        for (const v of this.lists[lane + 1]) if (!v.isObstacle && v.x > x - 2 && v.x - v.length < x + 3) { free = false; break; }
        if (free) return this.falseAlarm(x, lane);
      }
      return null;
    }
    _roadFalseAlarms() {
      const c = this.cfg, r = this.faRng;
      const perS = c.roadFalseAlarmRate * c.length / 1000 / 3600;
      if (this.nextRoadFA === null) this.nextRoadFA = this.t - Math.log(1 - r()) / perS;
      while (this.t >= this.nextRoadFA) {
        this.randomFalseAlarm();
        this.nextRoadFA += -Math.log(1 - r()) / perS;
      }
    }
    _carFalseAlarms() {
      const c = this.cfg, r = this.faRng, n = this.vehicles.length;
      const lam = c.carFalseAlarmRate / 3600 * c.dt * n;
      let u = r(), p = Math.exp(-lam), s = p, k = 0;           // number of false targets in this step (Poisson)
      while (u > s && k < 50) { k++; p *= lam / k; s += p; }
      for (let i = 0; i < k; i++) {
        const v = this.vehicles[Math.floor(r() * n)], u = r();
        if (v.crashed || v.disabled || v.stalled) continue;
        // the sensor sees only up to the first real object ahead, so the false target is in the free road before it
        let o = this._ahead(v.lane, v.x, v, false);
        while (o && o.phantom) o = this._ahead(v.lane, o.x, v, false);
        const free = o && !o.isWall ? Math.max(0, o.x - o.length - v.x) : Infinity;
        this.carFalseTarget(v, u * Math.min(c.guardianRange, free));
      }
    }
    // Vehicle v's own sensor sees a false target d metres ahead in its lane for carFalseAlarmDur seconds, and brakes at
    // full force while it is within stopping distance. In SDR the vehicle also reports it (carSensorShare), and the road
    // treats the report like a real detection until a re-check clears it.
    carFalseTarget(v, d) {
      const c = this.cfg, x = v.x + d;
      this.m.carFalseAlarms++;
      v.falseTarget = { x, lane: v.lane, until: this.t + c.carFalseAlarmDur, braked: false };
      if (c.mode !== 'sdr' || c.carSensorShare === 'none' || x >= c.length) return null;
      const o = { isObstacle: true, phantom: true, x: x + 1, length: 1, lane: v.lane, v: 0, a: 0, slide: 0, known: false, roadSees: false,
        reported: true, detectAt: this.t + c.commsLatency + c.controlPeriod, clearAt: this.t + c.falseAlarmClearTime };
      if (c.carSensorShare === 'v2v') o.v2vAt = this.t + c.v2vLatency;
      this.obstacles.push(o);
      this._insert(v.lane, o);
      return o;
    }
    // does vehicle v brake for its false target? (`own`: where it would stop with full braking)
    _falseTargetBrakes(v, own) {
      const ft = v.falseTarget;
      if (this.t >= ft.until || ft.x <= v.x) { v.falseTarget = null; return false; }
      if (!this._lanesOf(v).includes(ft.lane) || own <= ft.x - 0.5) return false;
      if (!ft.braked) { ft.braked = true; this.m.falseBrakes++; }
      return true;
    }
    // Today's road: driver assistance (automatic emergency braking) brakes for the false target after the actuator
    // delay, without waiting for the driver; the driver's own commands are still in the pipeline after it.
    _falseBrakeHuman(v) {
      const c = this.cfg, bE = this._bEff(v);
      if (!this._falseTargetBrakes(v, v.x + v.v * c.actuationDelay + v.v * v.v / (2 * bE))) return;
      const k = Math.min(v.buf.length - 1, Math.max(0, Math.round(c.actuationDelay / c.dt) - 1));
      v.buf[k] = Math.min(v.buf[k], -bE);
    }

    // ------------------------------------------------------------ human baseline
    _humanSpeedFactor() { const f = this.cfg.friction; return f < 0.5 ? 0.65 : f < 0.9 ? 0.9 : 1; }
    // drivers' desired speed: personal preference around the limit, slower in bad weather; trucks are governed
    _humanV0(v) { return v.hv0 * this._humanSpeedFactor() * (v.type === 'truck' ? 1 : this.cfg.speedLimit / 33.3); }
    _humanTFactor() { const f = this.cfg.friction; return f < 0.5 ? 1.4 : f < 0.9 ? 1.15 : 1; }
    // on a slippery road drivers also brake more gently: every "acceptable braking" habit (comfortable
    // braking, what a lane change may cost someone, yielding) shrinks with the grip that is left
    _humanGrip() { return clamp(this.cfg.friction * G * 0.95 / HUMAN.gripRef, 0.3, 1); }

    // Human Driver Model: IDM evaluated on states extrapolated over the driver's reaction
    // time (the command is applied that much later), i.e. drivers anticipate.
    // IDM+ (Schakel et al.): acceleration is the smaller of the free-road and the car-following term, so
    // the steady-state gap is s0 + v·T at any speed (plain IDM adds the two and keeps far larger gaps
    // near the desired speed). T is the driver's *current* headway, which relaxes back to the preferred
    // one after a lane change; `Tover` overrides it (gap acceptance, yielding, synchronising).
    _idm(v, o, noAnticipation, Tover) {
      const v0 = this._humanV0(v);
      const T = (Tover !== undefined ? Tover : v.hTc || v.hT) * this._humanTFactor();
      const grip = this._humanGrip();
      const aM = v.aMax, b = 2.0 * grip;
      // constant-velocity extrapolation of both vehicles; own acceleration is only
      // extrapolated when speeding up (never assumes it will "brake its way out")
      let v0x = v0;
      const c = this.cfg;
      if (v.exits && v.lane > 0 && v.x > c.offRampX - c.exitPrepDist && v.x < c.offRampX) {
        // ease off to drop back into a gap in the lane to the right
        v0x = v0 * (1 - 0.35 * (v.x - (c.offRampX - c.exitPrepDist)) / c.exitPrepDist);
      }
      const tau = noAnticipation ? 0 : v.hReact;
      const aUp = Math.max(0, v.a);
      const vp = v.v + aUp * tau;
      const free = Math.max(-b / aM, 1 - Math.pow(vp / v0x, 4));   // above the desired speed: ease off, no hard braking
      if (!o) return aM * free;
      const vl = o.isObstacle ? 0 : o.v;
      const s = Math.max(0.1, o.x - o.length - v.x - (v.v - vl) * tau - 0.5 * aUp * tau * tau);
      const dv = vp - vl;
      const sStar = 2 + Math.max(0, vp * T + vp * dv / (2 * Math.sqrt(aM * b)));
      const inter = (sStar / s) * (sStar / s);
      let acc = HUMAN.plus ? aM * Math.min(free, 1 - inter) : aM * (free - inter);
      if (HUMAN.cool > 0) {
        // Constant-acceleration heuristic (Kesting, Treiber & Helbing 2010): a gap that is short but not
        // closing dangerously (typically right after someone cut in) is opened with comfortable braking,
        // not with the emergency braking plain IDM would ask for.
        const al = Math.min(o.isObstacle ? 0 : (o.a || 0), aM), dvp = Math.max(0, dv);
        const cah = al < 0 && vl * dv <= -2 * s * al ? vp * vp * al / (vl * vl - 2 * s * al) : al - dvp * dvp / (2 * s);
        const bOpen = HUMAN.bOpen * grip;
        if (acc < cah) acc = (1 - HUMAN.cool) * acc + HUMAN.cool * (cah + bOpen * Math.tanh((acc - cah) / bOpen));
      }
      return acc;
    }

    // headway a driver would hold right after ending up `gap` metres behind a new leader: drivers accept
    // a short gap for a while after a lane change and then relax back (Laval & Leclercq; Schakel et al.)
    _relaxedT(f, gap) { return clamp((gap - 2) / Math.max(f.v, 1), HUMAN.Tmin, f.hTc || f.hT); }
    // can follower f, reacting after `react` s, match the speed of leader l with moderate braking b?
    _kinOk(f, l, gap, react, b) {
      const dv = f.v - (l.isObstacle ? 0 : l.v);
      if (dv <= 0) return gap > 0.5;
      const room = gap - dv * react - 1;
      return room > 0 && dv * dv / (2 * room) < b;
    }
    _humanStartLaneChange(v, L, lead, fol) {
      if (lead) v.hTc = this._relaxedT(v, lead.x - lead.length - v.x);
      if (fol && !fol.isObstacle && fol.hT) fol.hTc = this._relaxedT(fol, v.x - v.length - fol.x);
      this._startLaneChange(v, L);
    }

    // what a human driver perceives ahead: debris is only noticed within sight distance
    _humanAhead(lane, v) {
      const o = this._ahead(lane, v.x, v, false);
      if (o && o.isWall && v.laneTo !== null) return null;     // already moving out of the acceleration lane
      if (o && o.isObstacle && !o.isWall && o.x - o.length - v.x > this.cfg.humanSightDebris) return null;
      return o;
    }

    _humanCommand(v) {
      const c = this.cfg;
      v.hTc += (v.hT - v.hTc) * c.dt / HUMAN.relaxTime;
      if (v.broken) {
        // lost propulsion: hazard lights, work right and onto the hard shoulder if there is one
        if (this.t >= v.nextLaneEval) { v.nextLaneEval = this.t + 0.5; this._humanPullOver(v); }
        let a = -this.cfg.coastDecel;
        for (const L of this._lanesOf(v)) a = Math.min(a, this._idm(v, this._humanAhead(L, v)));
        if (v.lane === this.S) a = Math.min(a, -1.5);
        return (v.lastCmd = clamp(a, -this._bEff(v), 0));
      }
      if (this.t >= v.nextLaneEval) { v.nextLaneEval = this.t + 0.5; this._humanLaneDecision(v); }
      // unexpected event ahead (vehicle stopping dead, crash, debris coming into view): the driver needs extra
      // time to notice and decide; until then they keep doing what they were doing
      const lead = this._humanAhead(v.lane, v);
      const abrupt = lead && (lead.disabled || lead.crashed || lead.stalled || (lead.isObstacle && !lead.isWall));
      if (abrupt && v.surpriseFor !== lead) { v.surpriseFor = lead; v.surpriseUntil = this.t + v.hSurprise; v.frozenCmd = v.lastCmd; }
      if (this.t < v.surpriseUntil) return v.frozenCmd;
      let a = Infinity;
      for (const L of this._lanesOf(v)) a = Math.min(a, this._idm(v, this._humanAhead(L, v)));
      // on the acceleration lane: adjust speed to slot in behind the vehicle ahead in the right lane
      if (v.lane === -1 && v.laneTo === null && v.x > c.mergeStart - HUMAN.syncDist) {
        const tl = this._humanAhead(0, v);
        if (tl && !tl.isObstacle && !this._isStatic(tl) && tl.v < v.v + 1) {    // a faster vehicle pulls away by itself
          const urg = clamp((v.x - c.mergeStart) / (c.mergeEnd - c.mergeStart), 0, 1);
          a = Math.min(a, Math.max(-(HUMAN.bSync + 1.5 * urg) * this._humanGrip(), this._idm(v, tl, false, HUMAN.Tmin)));
        }
      }
      // close to the exit and still not in the right lane: line up with the lane to the right
      if (v.exits && v.lane > 0 && v.laneTo === null && v.x < c.offRampX) {
        const per = (c.offRampX - v.x) / v.lane;
        if (per < HUMAN.exitSync) {
          const tl = this._humanAhead(v.lane - 1, v);
          if (tl && !tl.isObstacle && !this._isStatic(tl) && tl.v < v.v + 1) a = Math.min(a, Math.max(-(0.5 + HUMAN.bSync * (1 - per / HUMAN.exitSync)) * this._humanGrip(), this._idm(v, tl, false, HUMAN.Tmin)));
        }
      }
      // courteous driver letting a signalling vehicle in
      const y = v.yieldTo;
      if (y && this.t < v.yieldUntil && !y.crashed && y.v > 3 && y.x - y.length > v.x && !y.gone) a = Math.min(a, Math.max(-HUMAN.bYield * this._humanGrip(), this._idm(v, y, false, HUMAN.Tmin)));
      else v.yieldTo = null;
      // imperfect driving: slowly varying acceleration error (Ornstein-Uhlenbeck, independent of the time step)
      v.hNoise += -v.hNoise * c.dt / HUMAN.noiseTime + HUMAN.noise * Math.sqrt(2 * c.dt / HUMAN.noiseTime) * gauss(this.rng);
      a += v.hNoise;
      v.lastCmd = clamp(a, -this._bEff(v), v.aMax);
      return v.lastCmd;
    }

    _humanPullOver(v) {
      if (v.laneTo !== null || v.lane < 0 || v.lane === this.S || this.t < v.lcCooldown) return;
      const L = v.lane > 0 ? v.lane - 1 : (this._safetyAccess(v.x) ? this.S : null);
      if (L === null) return;
      const lead = this._humanAhead(L, v), fol = this._behind(L, v.x, v, false);
      let ok = !(lead && lead.x - lead.length < v.x + 2 + 0.3 * v.v);
      if (ok && fol && fol.x > v.x - v.length - 2 - 0.3 * (fol.v || 0)) ok = false;
      if (ok && fol && !fol.isObstacle && !this._isStatic(fol) && this._idm(fol, v, true) < -6 * this._humanGrip()) ok = false;
      if (ok) { this._humanStartLaneChange(v, L, lead, fol); return; }
      if (fol && !fol.isObstacle && !fol.yieldTo && v.v > 3 && v.x - fol.x < 60 && this.rng() < 0.5) { fol.yieldTo = v; fol.yieldUntil = this.t + 5; }
    }

    _humanLaneDecision(v) {
      if (v.laneTo !== null || this.t < v.lcCooldown) return;
      const c = this.cfg;
      if (v.lane === this.S) return;
      const cands = [];
      if (v.lane === -1) { if (v.x >= c.mergeStart && v.x <= c.mergeEnd) cands.push(0); else return; }
      else {
        if (v.lane > 0) cands.push(v.lane - 1);
        if (v.lane < c.lanes - 1 && !(v.type === 'truck' && v.lane >= 1)) cands.push(v.lane + 1);
      }
      const aCur = this._idm(v, this._humanAhead(v.lane, v));
      let best = null, bestScore = 0.25, wanted = null, bestLead = null, bestFol = null;
      const mandatoryFor = L => v.lane === -1 || (v.exits && L < v.lane && v.x > c.offRampX - c.exitPrepDist && v.x < c.offRampX);
      for (const L of cands) {
        if (v.exits && v.lane >= 0 && L > v.lane && v.x > c.offRampX - c.exitPrepDist - 1000) continue; // no overtaking close to your exit
        const lead = this._humanAhead(L, v), fol = this._behind(L, v.x, v, false);
        if (mandatoryFor(L)) wanted = { L, fol };
        // gap acceptance shrinks for a driver running out of acceleration lane
        let forced = v.lane === -1 ? clamp((v.x - c.mergeStart) / (c.mergeEnd - c.mergeStart), 0, 1) : 0;
        if (v.exits && L < v.lane && v.x > c.offRampX - c.exitPrepDist) forced = 0.5 * clamp(1 - (c.offRampX - v.x) / c.exitPrepDist, 0, 1);
        const hw = HUMAN.Tmin * (1 - 0.5 * forced);
        const gLead = lead ? lead.x - lead.length - v.x : Infinity;
        const gFol = fol ? v.x - v.length - fol.x : Infinity;
        if (gLead < 2 + hw * v.v) continue;
        if (fol && gFol < 2 + hw * (fol.v || 0)) continue;
        let bSafe = HUMAN.bDisc, bias = 0;
        if (v.lane === -1) {
          bSafe = HUMAN.bSafe + 2 * forced; bias = 5;
        } else {
          bias += L < v.lane ? 0.2 : -0.2; // keep right
          // make room for merging traffic: drivers in the right lane who see vehicles on the on-ramp move over if they can
          if (v.lane === 0 && L === 1 && v.type === 'car' && !v.exits && v.x > c.mergeStart - 400 && v.x < c.mergeEnd && this._rampNear(v.x + 60, 160)) bias += HUMAN.mergeCourtesy;
          if (v.exits && v.x <= c.offRampX - c.exitPrepDist) bias += L < v.lane ? 0.5 : -0.5; // keep right early
          if (v.exits && v.x > c.offRampX - c.exitPrepDist && v.x < c.offRampX) {
            const urg = 1 - (c.offRampX - v.x) / c.exitPrepDist;
            bias += (L < v.lane ? 1 : -1) * (1 + 4 * urg);
            if (L < v.lane) bSafe = HUMAN.bDisc + (HUMAN.bSafe + 1.5 - HUMAN.bDisc) * urg;
          }
        }
        // MOBIL safety criterion on the current situation (no anticipation), at the headway each driver
        // would accept right after the change; plus a kinematic check that includes the reaction time
        bSafe *= this._humanGrip();
        const moving = fol && !fol.isObstacle && !fol.crashed && !fol.disabled && !fol.stalled;
        if (moving) {
          // judge the follower's situation as it will be once that driver has reacted
          const gReact = gFol - Math.max(0, fol.v - v.v) * fol.hReact;
          if (gReact < 2 || !this._kinOk(fol, v, gFol, fol.hReact, bSafe)) continue;
          const vSelf = { x: fol.x + gReact + v.length, length: v.length, v: v.v, a: v.a };
          if (this._idm(fol, vSelf, true, this._relaxedT(fol, gReact)) < -bSafe) continue;
        }
        if (lead && (this._idm(v, lead, true, this._relaxedT(v, gLead)) < -bSafe || !this._kinOk(v, lead, gLead, 0.3, bSafe))) continue;
        // incentive is bounded so that mandatory changes (exit, ramp) are limited by safety only
        const score = clamp(this._idm(v, lead, false, lead ? this._relaxedT(v, gLead) : undefined) - aCur, -2, 2) + bias;
        if (score > bestScore) { bestScore = score; best = L; bestLead = lead; bestFol = fol; }
      }
      if (best !== null) { this._humanStartLaneChange(v, best, bestLead, bestFol); return; }
      // signal: a following driver in the target lane may let us in (politeness 50 %)
      if (wanted && wanted.fol && !wanted.fol.isObstacle && !wanted.fol.yieldTo && v.v > 3 && v.x - wanted.fol.x < 60 && this.rng() < 0.5) {
        wanted.fol.yieldTo = v; wanted.fol.yieldUntil = this.t + 5;
      }
    }

    // ------------------------------------------------------------ collisions & removals
    _collisions() {
      const phantoms = this.obstacles.some(o => o.phantom);         // false alarms: nothing there to hit
      for (const all of this.lists) {
        const list = phantoms ? all.filter(o => !o.phantom) : all;
        for (let i = 0; i < list.length - 1; i++) {
          const a = list[i], b = list[i + 1];
          if (a === b) continue;
          if (a.isObstacle && b.isObstacle) continue;
          if ((b.isWall && a.laneTo !== null) || (a.isWall && b.laneTo !== null)) continue;   // already moving out of the acceleration lane
          if (a.x > b.x - b.length) {
            // a's front is inside b: a hit b from behind (or merged into it)
            const hitter = a.isObstacle ? b : a;
            const other = hitter === a ? b : a;
            if (hitter.crashed && (other.crashed || other.isObstacle || other.disabled)) continue;
            const dv = Math.abs((hitter.v || 0) - (other.v || 0));
            this.m.collisions++;
            this.m.impacts.push(dv);
            this.m.incidents.push({ t: this.t, x: hitter.x, dv, hid: hitter.id, oid: other.id, hbf: hitter.brakeFactor, hv: hitter.v, ov: other.v || 0, lane: hitter.lane, laneTo: hitter.laneTo, otherLane: other.lane, otherTo: other.laneTo, other: other.isObstacle ? (other.isWall ? 'wall' : 'debris') : other.disabled ? 'disabled' : 'vehicle' });
            for (const o of [a, b]) {
              if (o.isObstacle) continue;
              if (!o.crashed) { o.crashed = true; o.clearAt = this.t + this.cfg.incidentClearTime; }
              o.v = 0; o.a = 0;
            }
            if (!a.isObstacle) a.x = Math.min(a.x, b.x - b.length - 0.01);
          }
        }
      }
    }

    _removals() {
      const c = this.cfg;
      const keep = [];
      for (const v of this.vehicles) {
        let done = false;
        if ((v.crashed || v.disabled || v.stalled) && this.t >= v.clearAt) done = true;
        else if (v.x >= c.length) { done = true; this._complete(v, c.length); }
        else if (v.exits && v.x >= c.offRampX) {
          if (v.lane === 0 && v.laneTo === null) { done = true; this._complete(v, c.offRampX); }
          else { v.exits = false; this.m.missedExits++; }
        }
        if (!done) keep.push(v); else v.gone = true;
      }
      this.vehicles = keep;
      this.obstacles = this.obstacles.filter(o => this.t < o.clearAt);
    }

    _complete(v, xEnd) {
      const c = this.cfg;
      const dist = xEnd - v.xEnter;
      const vRef = Math.min(c.speedLimit, v.vMaxType);
      const trip = { t: this.t, time: this.t - v.tArrive, wait: v.tEnter - v.tArrive, free: dist / vRef, dist };
      this.m.completed++;
      this.m.trips.push(trip);
      if (this.m.trips.length > 5000) this.m.trips.splice(0, 1000);
    }

    // ------------------------------------------------------------ faults
    _nearestVehicle(x, minSpeed) {
      let best = null, bd = Infinity;
      for (const v of this.vehicles) {
        if (v.crashed || v.disabled || v.stalled || v.broken || v.lane < 0 || v.lane >= this.S || v.v < (minSpeed || 0)) continue;
        const d = Math.abs(v.x - x);
        if (d < bd) { bd = d; best = v; }
      }
      return best;
    }
    // v0, slide: the object is moving at v0 (m/s) when it lands and slides to rest at `slide` m/s² (default: it lies still)
    addDebris(x, lane, v0, slide) {
      const c = this.cfg;
      // hard to see (low, dark, at night): every car's sensor (and optionally the road's) is worse at it alike
      const hard = c.sharedMissProb > 0 && this.missRng() < c.sharedMissProb;
      const roadSees = this.faultRng() < (hard && c.sharedMissRoadDetect !== null ? c.sharedMissRoadDetect : c.roadDetectProb);
      const o = {
        isObstacle: true, x: x + 1, length: 1, lane, v: slide > 0 ? (v0 || 0) : 0, a: 0, slide: slide || 0, known: false, roadSees,
        detectAt: roadSees ? this.t + c.roadDetectionDelay : Infinity, clearAt: this.t + c.incidentClearTime,
      };
      if (hard) o.hard = true;
      this.obstacles.push(o);
      return o;
    }
    // an object lands in this lane (2.2–4.2 km) where the nearest vehicle coming towards it is
    // about D metres away (as close to D as traffic allows); returns the object with .clearance
    dropObjectAhead(x, lane, D) {
      let best = null, bestErr = Infinity;
      for (let p = 4200; p >= 2200; p -= 5) {
        let clear = Infinity, blocked = false;
        for (const v of this.vehicles) {
          if (v.lane !== lane && v.laneTo !== lane) continue;
          if (v.x - v.length < p + 2 && v.x > p - 1) { blocked = true; break; }
          if (v.x <= p - 1) clear = Math.min(clear, p - v.x);
        }
        if (blocked || !isFinite(clear)) continue;
        const err = Math.abs(clear - D) + (clear < D ? 1000 : 0) + Math.abs(p - x) * 0.001;
        if (err < bestErr) { bestErr = err; best = { p, clear }; }
      }
      if (!best) return null;
      const o = this.addDebris(best.p, lane);
      o.clearance = best.clear;
      return o;
    }
    breakdown(x) {
      const v = this._nearestVehicle(x, 5);
      if (v) { v.broken = true; v.exits = false; if (this.cfg.mode === 'sdr') this._onFault(v); }
      return v;
    }
    toggleSensors(i) { if (this.segments[i]) this.segments[i].sensorsDown = !this.segments[i].sensorsDown; }
    suddenStop(x) {
      const v = this._nearestVehicle(x, 5);
      if (v) { v.disabled = true; v.clearAt = this.t + this.cfg.incidentClearTime; }
      return v;
    }
    commsLoss(x) {
      const v = this._nearestVehicle(x, 0);
      if (v) { v.commsDownUntil = this.t + this.cfg.commsLossDuration; if (this.cfg.mode === 'sdr') v.sidetrack = true; }
      return v;
    }
    degradeBrakes(x) {
      const v = this._nearestVehicle(x, 0);
      if (v) { v.brakeFactor = 0.5; v.bfDetectAt = this.t + this.cfg.healthDetectDelay; }
      return v;
    }
    toggleSegment(i) { if (this.segments[i]) this.segments[i].failed = !this.segments[i].failed; }
    clearFaults() {
      this.obstacles = [];
      for (const s of this.segments) { s.failed = false; s.sensorsDown = false; }
      for (const v of this.vehicles) {
        v.commsDownUntil = -1; v.brakeFactor = 1; v.bfKnown = 1; v.bfDetectAt = Infinity;
        if (v.disabled || v.crashed || v.stalled) v.clearAt = this.t;
        if (v.broken && !v.stalled) v.broken = false;
      }
    }

    // ------------------------------------------------------------ observation
    speedProfile(binSize) {
      const c = this.cfg;
      const n = Math.ceil(c.length / binSize);
      const sum = new Float32Array(n), cnt = new Uint16Array(n), out = new Float32Array(n);
      for (const v of this.vehicles) {
        if (v.lane < 0 || v.lane >= this.S) continue;
        const i = Math.min(n - 1, Math.floor(v.x / binSize));
        sum[i] += v.v; cnt[i]++;
      }
      for (let i = 0; i < n; i++) out[i] = cnt[i] ? sum[i] / cnt[i] : NaN;
      return out;
    }

    stats(windowS) {
      const w = windowS || 300;
      const t = this.t;
      const m = this.m;
      while (m.detTimes.length && m.detTimes[0] < t - 1800) m.detTimes.shift();
      let n = 0; for (const x of m.detTimes) if (x > t - w) n++;
      const span = Math.min(w, t);
      const flow = span > 0 ? n / span * 3600 : 0;
      let vs = 0, nv = 0;
      for (const v of this.vehicles) if (v.lane >= 0 && v.lane < this.S) { vs += v.v; nv++; }
      const recent = m.trips.filter(tr => tr.t > t - w);
      const mean = f => recent.length ? recent.reduce((s, tr) => s + f(tr), 0) / recent.length : NaN;
      const waits = this.mainQueue.concat(this.rampQueue).map(v => t - v.tArrive);
      return {
        t, mode: this.cfg.mode,
        vehicles: this.vehicles.length,
        mainQueue: this.mainQueue.length,
        rampQueue: this.rampQueue.length,
        flow,
        meanSpeed: nv ? vs / nv : NaN,
        tripTime: mean(tr => tr.time),
        tripDelay: mean(tr => tr.time - tr.free),
        entryWait: mean(tr => tr.wait),
        maxQueueWait: waits.length ? Math.max(...waits) : 0,
        collisions: m.collisions,
        maxImpactKmh: m.impacts.length ? Math.max(...m.impacts) * 3.6 : 0,
        guardian: m.guardian,
        supervision: m.supervision,
        safeStops: m.safeStops,
        hardBrakes: m.hardBrakes,
        missedExits: m.missedExits,
        completed: m.completed,
        brakeWhPerVehKm: m.vehDist > 0 ? (m.brakeEnergy * 1500 / 3600) / (m.vehDist / 1000) : 0,
        minSpare: m.minSpare,
        vLimit: this.vLimit,
        rampForced: m.rampReleasesForced,
        occupancy: this.occupancy, occupancyBudget: this.occupancyBudget,
        lossEst: this.lossEst, staleExtra: this.staleExtra, lossStay: this.lossStay,
      };
    }
  }

  return { World, DEFAULTS, TYPES, HUMAN, sdrCapacity, sdrOptimalSpeed, humanCapacity, mulberry32 };
});
