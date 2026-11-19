# SDR Simulator

A traffic simulator for the Self Driving Road concept ([../SDR-01-Concept-Architecture.md](../SDR-01-Concept-Architecture.md)).
It runs **two copies of the same motorway corridor side by side, fed with exactly the same traffic**:

| Copy | Who drives | Purpose |
|---|---|---|
| **Self Driving Road** | 100 % of vehicles are guided by the road's segment controllers | The design under test |
| **Today's road** | 100 % human drivers | Reference: how much better (or worse) is SDR? |

Guided and human-driven vehicles never share a road in this simulator.

## Run it

Open `index.html` in a browser (double-click works, no server or install needed), or serve the folder:

```powershell
python -m http.server 8765 --directory simulator
```

Then browse to http://localhost:8765.

Headless experiments (Node 18+, no dependencies), about 10–15 minutes on a multi-core machine:

```powershell
node simulator/experiments.js
```

Results go to `results/results.md` and `results/results.json`. Add `--quick` for a short smoke run, or `--only=hybrid,objects-150` to re-run selected groups (the others are kept from the previous run).

## What you can do in the browser

- **Traffic demand:** vehicles per hour at the main entry and the on-ramp, and the truck share.
- **Weather:** dry / wet / ice (changes tyre grip, so braking distances).
- **SDR policy:** separation *absolute*, *relative* or *hybrid* (decision D1 in the concept), fixed vs adaptive speed, speed limit, radio packet loss.
- **Object detection:** how often the road cameras and each car's own sensor see a foreign object, and whether a car that sees one keeps it to itself, tells the road, or also tells nearby cars directly (V2V).
- **Safety lane:** a lane right of lane 1 where SDR sidetracks faulty vehicles (on today's road: a hard shoulder that broken-down drivers pull onto).
- **Incidents** at a chosen location, applied to both roads at once: debris, a brick-wall stop (a vehicle hits something no sensor saw), a sudden 50 % brake loss, a breakdown (loss of propulsion), plus SDR-only radio loss, segment-controller failure and road-sensor outage.
- **Views per road:** stat tiles, the whole 5 km corridor, a close-up that shows each SDR vehicle's movement authority, a time-space diagram (stop-and-go waves show up as stripes running backwards), and a lane-capacity-vs-speed chart with live measured points.

## The corridor

5 km, 3 lanes, split into five 1 km SDR segments. Acceleration lane at 2.0–2.3 km (on-ramp traffic appears at 1.65 km), off-ramp at 3.5 km (20 % of vehicles exit there), throughput detector at 4.5 km. 10 % trucks by default.

## How the SDR copy works ([engine.js](engine.js))

The architecture follows the concept document:

- **Segment controllers** (every 0.1 s) give each vehicle a **movement authority**: an *end of authority* (EoA) point it may not pass. Messages take 50 ms to arrive and can be lost.
  - *Absolute* separation: EoA = rear of the vehicle ahead − margin. The leader is assumed able to stop instantly.
  - *Relative* separation: EoA = the leader's earliest possible stopping point − margin. The leader is assumed to brake at most at its certified maximum.
  - Both are "stale-safe": an old authority never becomes unsafe while the vehicle ahead behaves physically.
- **Vehicles** track their authority with a gap controller, include a 0.2 s actuator delay, and plan with 90 % of their guaranteed braking. If the authority is about to be violated, a supervision brake applies full braking. If no fresh authority arrives within 1.5 s, the vehicle makes a **safe stop** before its last EoA.
- The **guardian** is an onboard sensor with 120 m range that sees only the first object ahead. It can only brake, and only when that object is closer than the vehicle can stop for. SDR speed is capped so the guardian can always stop for a static object within its range. On ice that means about 85 km/h.
- **Merging** uses *virtual vehicles*. Each ramp vehicle is projected into lane 0 as a "ghost" at the position matching its predicted arrival time, so mainline traffic opens a gap well before the merge. Exiting vehicles are pre-positioned in the right lane from the start, because trip booking tells the road where they're going.
- **Hybrid separation:** relative by default, with an absolute (brick-wall) gap where the risk is higher: every 10th vehicle keeps one (a *platoon break*), behind any vehicle that reports a fault, and in or just before a segment whose road sensors are down. Optional: also behind every truck (`hybridTruckAbsolute`), because most road debris falls off vehicles. Under relative separation a follower never assumes its leader stops more gently than it can itself, so a weak-braking leader can't license a tailgate.
- **Detection layers:** a new object is confirmed by the road sensors with probability `roadDetectProb` after 0.5 s. Each vehicle's own sensor sees it within 120 m with probability `carDetectProb` (rolled per vehicle). A detecting vehicle reports it to the road (`carSensorShare: 'road'`, confirmed one control cycle later) and optionally straight to nearby vehicles (`'v2v'`, 50 ms).
- **Faults and the safety lane:** a brake fault is reported after 0.5 s (sooner once the vehicle brakes). A faulty, broken-down or radio-lost vehicle is *sidetracked*: the road works it right lane by lane with cooperative merges, then into the safety lane where that is accessible (not across the on-ramp or the exit). There it drives at 60 km/h, or stops if it has broken down. A vehicle whose radio fails in lane 1 pulls into the safety lane as part of its safe stop. A blocked lane is closed 1 km upstream, and vehicles that can no longer reach the exit are rerouted.
- **Admission control** (network layer): the main entry admits vehicles only while the stretch up to the merge holds fewer vehicles than fit at critical (capacity) density. The ramp gate releases a vehicle only when a lane-0 slot is predicted at the merge, or after 45 s for fairness. *Adaptive speed* drops to the capacity-optimal speed (never below 60 km/h) when queues build.
- **Failed segment:** its vehicles get no authority and make safe stops. Upstream vehicles get no *new* authority into it, but authority already granted stays valid, which is the concept's "every grant includes a way out" principle.

## How today's road works

- **Car following:** the Intelligent Driver Model with reaction delay plus anticipation ("Human Driver Model"). Drivers vary in desired speed (about 124 km/h ± 7 for cars, 86 km/h for trucks), time headway (1.4 s ± 0.25) and reaction time (0.55 s ± 0.1).
- **Unexpected events:** a vehicle stopping dead, a crash or debris add a **surprise delay** of 0.7 s ± 0.2, for a total perception-reaction time of about 1.25 s, in line with braking-reaction studies. Debris is only noticed within 150 m.
- **Breakdowns:** the driver puts the hazard lights on and works right, onto the hard shoulder if there is one, accepting smaller gaps than usual. A stopped vehicle in a live lane surprises the drivers behind it like a crash does.
- **Lane changes:** MOBIL-style, with keep-right, exit preparation, slowing down to find a gap to the exit, and courteous drivers who let merging traffic in 50 % of the time.
- **Weather:** drivers slow down and keep longer gaps in wet and icy conditions, though not by as much as physics would demand.

Calibration checks: no collisions in normal traffic apart from occasional low-speed bumps at the end of the acceleration lane. Stop-and-go waves form at the merge. Missed exits are 1–2 %.

## Parameters

All parameters are in `DEFAULTS` at the top of [engine.js](engine.js). Pass overrides to `new World({...})`, or change them live with `world.setConfig({...})`.

| Group | Parameter | Default | Meaning |
|---|---|---|---|
| Geometry | `length`, `lanes`, `segmentLength` | 5,000 m, 3, 1,000 m | Corridor; SDR segment size |
| | `rampStartX`, `mergeStart`, `mergeEnd` | 1,650 / 2,000 / 2,300 m | On-ramp gate and acceleration lane |
| | `offRampX`, `exitPrepDist`, `detectorX` | 3,500 / 1,500 / 4,500 m | Exit, exit preparation zone, flow detector |
| Demand | `demandMain`, `demandRamp` | 4,500 / 900 veh/h | Arrivals (Poisson) |
| | `truckShare`, `exitShare` | 10 %, 20 % | |
| Road | `speedLimit`, `friction` | 33.3 m/s, 1.0 | Friction 0.7 = wet, 0.3 = ice |
| SDR policy | `separation` | `'absolute'` | `'absolute'`, `'relative'` or `'hybrid'` |
| | `hybridTruckAbsolute`, `hybridHealthAbsolute`, `hybridSensorAbsolute` | on, on, on | Where hybrid uses an absolute gap |
| | `platoonBreakEvery` | 0 (off) | Hybrid: every Nth vehicle keeps an absolute gap |
| | `sensorGapSpeed` | 0 (off) | Hybrid: speed cap where road sensors are down |
| | `speedPolicy` | `'fixed'` | `'adaptive'` drops to the capacity-optimal speed when queues build |
| Control loop | `controlPeriod`, `commsLatency`, `packetLoss` | 0.1 s, 0.05 s, 0 | Segment controller cycle and radio |
| | `authorityTTL` | 1.5 s | Authority expiry, after which the vehicle makes a safe stop |
| | `actuationDelay`, `margin`, `positionUncertainty` | 0.2 s, 2.0 m, 0.5 m | Vehicle and safety margins |
| | `guardianRange` | 120 m | Onboard guardian sensor; also caps speed (must stop within range) |
| | `healthDetectDelay` | 0.5 s | Time to report a silent brake fault |
| Detection | `roadDetectionDelay`, `roadDetectProb` | 0.5 s, 100 % | Road sensors confirming a new object |
| | `carDetectProb`, `carSensorShare`, `v2vLatency` | 100 %, `'road'`, 0.05 s | Car sensors and what they do with a detection |
| Safety lane | `safetyLane`, `safetyLaneSpeed` | off, 16.7 m/s | Safety lane / hard shoulder |
| | `breakdownClearTime`, `coastDecel` | 900 s, 0.4 m/s² | Breakdowns |
| SDR tuning | `rampMaxWait`, `budgetFactor` | 45 s, 1.0 | Ramp-gate fairness; corridor fill level for admission |
| | `approachMinRoom`, `approachRef`, `laneChangeBufFactor` | 2 m, `'rate'`, 1.0 | Approach braking and lane-change margins |
| | `laneCloseDist` | 1,000 m | A blocked lane is closed this far upstream |
| Incidents | `incidentClearTime`, `commsLossDuration` | 180 s, 20 s | Clearing crashes/debris; radio outage length |
| Humans | `humanSightDebris`, `laneChangeDuration` | 150 m, 3 s | Debris visibility; lane-change time (both worlds) |

Vehicle types: car 4.5 m, 2.0 m/s² acceleration, 8 m/s² maximum braking, 36 m/s top speed; truck 16.5 m, 0.8 m/s², 6 m/s², 25 m/s.

Fault API: `addDebris(x, lane)`, `dropObjectAhead(x, lane, D)`, `suddenStop(x)`, `degradeBrakes(x)`, `breakdown(x)`, `commsLoss(x)`, `toggleSegment(i)`, `toggleSensors(i)`, `clearFaults()`. Observation: `stats(windowS)`, `speedProfile(binSize)`.

The development history, including the bugs found and the design lessons, is in [CHANGELOG.md](CHANGELOG.md).

## Important limitations

- This is a **concept model, not a validated traffic model**. The human baseline is plausible but not calibrated against real loop-detector data. SDR results depend on assumed parameters (braking, delays, margins), which are all in `DEFAULTS` at the top of `engine.js`.
- One straight corridor only: no network routing, no trip booking across a network, no intersections.
- Sensors are perfect apart from fixed margins and the detection probabilities above (no noise model, no false alarms). An object that is hit is treated as stopping the vehicle dead (worst case); in reality most debris is driven over or pushed aside.
- Collisions are rear-end or merge contacts in one dimension. There's no crash physics, and crashed vehicles are cleared after 3 minutes.
- Vehicle dynamics are point-mass with acceleration limits and an actuator delay. There's no steering model.

## Files

| File | Contents |
|---|---|
| `engine.js` | Simulation core (no DOM). Works in the browser and in Node. |
| `index.html`, `style.css`, `ui.js` | Browser front end |
| `experiments.js` | Headless experiment suite, run in parallel worker threads |
| `risk-model.js` | Foreign-object risk model: event frequencies × detection layers × simulated outcomes, per billion vehicle-km (`node risk-model.js` → `results/risk-model.md`) |
| `CHANGELOG.md` | Development log: what was built, bugs found, design lessons |
| `results/` | Output of the latest experiment run |
