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

Headless experiments (Node 18+, no dependencies), about 70 minutes on a 14-core machine (2,700 runs, plus the extra runs for comparisons that are within the noise):

```powershell
node simulator/experiments.js
```

Results go to `results/results.md` and `results/results.json`. Throughput rows are the mean of 5 runs with different traffic, shown with the standard deviation between runs (±); incident rows are 10 runs each. Add `--quick` for a short smoke run, or `--only=hybrid,objects-150` to re-run selected groups (the others are kept from the previous run, and each section of the report says which run it came from). Groups: `demand`, `incidents`, `hybrid`, `objects-150`, `objects-300`, `objects-truck`, `safety-breakdown`, `safety-brakes`, `safety-comms`, `sensors`, `weather`, `theory`, `packet-loss`, `trucks`, `today`, `gates`, `speed`, `truck-rule`.

**Which differences are real.** Both roads, and every variant, get the same traffic for the same seed. The last section of the results therefore compares two rows per seed and gives the mean difference with a 95 % confidence interval, and says whether it is outside the noise (the interval does not include zero). A comparison that is within the noise after the standard number of runs gets more runs once, up to 15 per throughput row and 30 per incident row, and is reported as it then stands. An incident row compared with a row that was extended gets the same number of runs: a collision count from 10 runs can look like a real difference by chance (the hybrid had 15 collisions in its first 10 brick-wall runs against 6 for relative separation, and 27 against 23 after 30). Comparing the "±" of two rows by eye is too pessimistic, because most of that spread is traffic the two rows share.

Regression tests, about a minute:

```powershell
node --test simulator/test
```

They check that a seed reproduces exactly, that both roads get the same vehicles, that SDR has no collisions and never overruns an authority (also with 20 % radio loss, and under every truck-rule variant), that the on-ramp is served below capacity, that today's road flows freely below capacity, that the fail-safe responses work, and that the paired statistics are computed correctly. Run them after any change to `engine.js`.

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
- **Vehicles** track their authority with a gap controller, include a 0.2 s actuator delay, and plan with 90 % of their guaranteed braking. A **supervision brake** applies full braking one step before the vehicle could no longer stop inside the last authority it received. The check counts the commands already on their way through the actuator, so a granted authority is never overrun (`minSpare` in `stats()` is the smallest distance left, and stays at or above zero). If no fresh authority arrives within 1.5 s, the vehicle makes a **safe stop** before its last EoA.
- **Radio loss:** the road sees which authorities were acknowledged, so it knows the loss rate (`lossEst`). It widens the stale-authority allowance in every vehicle's buffer until a run of lost messages long enough to outlast it is rare (`lossTolerance`, 1 in 10,000 control cycles). Lost messages then cost capacity instead of causing full-force braking. Set `lossAdaptive: false` to see the difference.
- The **guardian** is an onboard sensor with 120 m range that sees only the first object ahead. It can only brake, and only when that object is closer than the vehicle can stop for. SDR speed is capped so the guardian can always stop for a static object within its range. On ice that means about 85 km/h.
- **Merging** uses *virtual vehicles*. Each ramp vehicle is projected into lane 0 as a "ghost" at the position matching its predicted arrival time, so mainline traffic opens a gap well before the merge. The ghost of a truck is a truck, so the hybrid opens the truck gap behind it. The ramp vehicle in turn keeps its place behind the right-lane vehicle ahead of its ghost; that place is carried over to where the vehicle really is on the ramp (`ghostFrame`). Exiting vehicles are pre-positioned in the right lane from the start, because trip booking tells the road where they're going.
- **Hybrid separation:** relative by default, with an absolute (brick-wall) gap where the risk is higher: every 10th vehicle keeps one (a *platoon break*), behind any vehicle that reports a fault, and in or just before a segment whose road sensors are down. Optional: also behind every truck (`hybridTruckAbsolute`), because most road debris falls off vehicles. Under relative separation a follower never assumes its leader stops more gently than it can itself, so a weak-braking leader can't license a tailgate.
- **Cheaper truck rules** (all off by default, tested in the `truck-rule` group): no long gap behind trucks with an enclosed, monitored load (`secureLoadShare`); a gap that also covers the road's confirmation time (`truckGapConfirm`, added to the follower's buffer, never to the authority); a gap for a load that slides to rest instead of stopping dead (`loadSlideDecel`); trucks following trucks at a relative gap (`truckBehindTruckRelative`); and a truck lane (`truckLane`).
- **Detection layers:** a new object is confirmed by the road sensors with probability `roadDetectProb` after 0.5 s. Each vehicle's own sensor sees it within 120 m with probability `carDetectProb` (rolled per vehicle). A detecting vehicle reports it to the road (`carSensorShare: 'road'`, confirmed one control cycle later) and optionally straight to nearby vehicles (`'v2v'`, 50 ms).
- **Faults and the safety lane:** a brake fault is reported after 0.5 s (sooner once the vehicle brakes). A faulty, broken-down or radio-lost vehicle is *sidetracked*: the road works it right lane by lane with cooperative merges, then into the safety lane where that is accessible (not across the on-ramp or the exit). There it drives at 60 km/h, or stops if it has broken down. A vehicle whose radio fails in lane 1 pulls into the safety lane as part of its safe stop. A blocked lane is closed 1 km upstream, and vehicles that can no longer reach the exit are rerouted.
- **Admission control** (network layer): the main entry admits vehicles only while the stretch up to the merge holds fewer vehicles than fit at critical (capacity) density, and lets no car into the right lane while ramp traffic is due at the merge. The ramp gate lets a vehicle in as soon as the ramp has room. (It used to wait for a predicted lane-0 slot or 45 s; the prediction found a slot about 1 % of the time, so everybody waited 45 s. `rampMaxWait: 45` brings that back.) *Adaptive speed* drops to the capacity-optimal speed (never below 60 km/h) when queues build; it was tested with every policy and buys no capacity worth having.
- **Failed segment:** its vehicles get no authority and make safe stops. Upstream vehicles get no *new* authority into it, but authority already granted stays valid, which is the concept's "every grant includes a way out" principle.

## How today's road works

- **Car following:** IDM+ (the Intelligent Driver Model in the form used by Schakel, Knoop & van Arem 2012) with reaction delay plus anticipation. Drivers vary in desired speed (about 124 km/h ± 7 for cars, 86 km/h for trucks), time headway (1.4 s ± 0.25) and reaction time (0.55 s ± 0.1). A gap that is short but not closing dangerously, typically right after someone cut in, is opened with gentle braking (the constant-acceleration heuristic of Kesting, Treiber & Helbing 2010), not with the emergency braking plain IDM asks for.
- **Headway relaxation:** right after a lane change, the driver who changed and the new follower accept a headway down to 0.6 s and relax back to their preferred headway over about 20 s (Laval & Leclercq 2008).
- **Unexpected events:** a vehicle stopping dead, a crash or debris add a **surprise delay** of 0.7 s ± 0.2, for a total perception-reaction time of about 1.25 s, in line with braking-reaction studies. Debris is only noticed within 150 m.
- **Breakdowns:** the driver puts the hazard lights on and works right, onto the hard shoulder if there is one, accepting smaller gaps than usual. A stopped vehicle in a live lane surprises the drivers behind it like a crash does.
- **Lane changes:** MOBIL-style, with keep-right, exit preparation, slowing down to find a gap to the exit, and courteous drivers who let merging traffic in 50 % of the time. An optional lane change may cost the new follower at most 1.5 m/s² of braking, judged after that driver's reaction time; a change the driver has to make (merging, reaching the exit) may cost more as the road runs out.
- **Merging:** drivers on the acceleration lane line up with the vehicle ahead in the right lane, and right-lane drivers who see traffic on the on-ramp move left if they can. Trucks enter in the right lane.
- **Entry:** vehicles enter at the speed of the lane, in equilibrium with the vehicle ahead. Waiting traffic is as wide as the road, so a truck waiting for the right lane doesn't hold up cars for the other lanes (this holds for both roads).
- **Weather:** drivers slow down and keep longer gaps in wet and icy conditions, though not by as much as physics would demand. On ice they also brake more gently in everything they do (following, changing lanes, yielding).

Calibration check (`--only=today`, section 11 of the results): on a plain road today's road carries 5,680 veh/h at about 100 km/h. With the on-ramp and exit it carries 5,250–5,400, and up to 4,500 veh/h it flows freely at 98–110 km/h. Reference: the Highway Capacity Manual's 2,400 passenger cars per hour per lane means roughly 6,500 veh/h for three lanes with 10 % trucks, and 5,450–6,300 once a queue has formed. Hard braking (over 4 m/s²) happens 1–22 times per 1,000 vehicle-km on the plain road and 20–86 times with the ramp. There were no collisions in 40 runs of normal traffic. Missed exits are 0.2–1.6 %. Stop-and-go waves form at the merge above capacity. The model sits at the low end of the handbook range, so comparisons are, if anything, still slightly favourable to SDR.

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
| SDR policy | `separation` | `'hybrid'` | `'absolute'`, `'relative'` or `'hybrid'` (the recommended policy) |
| | `hybridTruckAbsolute`, `hybridHealthAbsolute`, `hybridSensorAbsolute` | on, on, on | Where hybrid uses an absolute gap |
| | `platoonBreakEvery` | 0 (off) | Hybrid: every Nth vehicle keeps an absolute gap |
| | `sensorGapSpeed` | 0 (off) | Hybrid: speed cap where road sensors are down |
| | `speedPolicy` | `'fixed'` | `'adaptive'` drops to the capacity-optimal speed when queues build |
| Control loop | `controlPeriod`, `commsLatency`, `packetLoss` | 0.1 s, 0.05 s, 0 | Segment controller cycle and radio |
| | `authorityTTL` | 1.5 s | Authority expiry, after which the vehicle makes a safe stop |
| | `lossAdaptive`, `lossTolerance` | on, 0.0001 | Widen gaps to the measured radio loss; target chance per cycle that a run of lost messages outlasts the allowance |
| | `actuationDelay`, `margin`, `positionUncertainty` | 0.2 s, 2.0 m, 0.5 m | Vehicle and safety margins |
| | `guardianRange` | 120 m | Onboard guardian sensor; also caps speed (must stop within range) |
| | `healthDetectDelay` | 0.5 s | Time to report a silent brake fault |
| Detection | `roadDetectionDelay`, `roadDetectProb` | 0.5 s, 100 % | Road sensors confirming a new object |
| | `carDetectProb`, `carSensorShare`, `v2vLatency` | 100 %, `'road'`, 0.05 s | Car sensors and what they do with a detection |
| Safety lane | `safetyLane`, `safetyLaneSpeed` | off, 16.7 m/s | Safety lane / hard shoulder |
| | `breakdownClearTime`, `coastDecel` | 900 s, 0.4 m/s² | Breakdowns |
| SDR policy: truck rule | `secureLoadShare` | 0 | Share of trucks with an enclosed, monitored load; the hybrid keeps no absolute gap behind them |
| | `truckGapConfirm` | 0 s | The gap behind a truck also covers this confirmation time (extra buffer for the follower) |
| | `loadSlideDecel` | 0 (stops dead) | The gap behind a truck assumes a lost load slides to rest at this rate (m/s²); never less than the relative gap |
| | `truckBehindTruckRelative`, `truckLane` | off, off | A truck behind a truck keeps a relative gap; trucks keep to the right lane and cars use it only to get on and off |
| SDR tuning | `rampMaxWait`, `budgetFactor` | 0 s, 1.0 | Ramp gate: wait when no lane-0 slot is predicted; corridor fill level for admission |
| | `rampKeepLaneAbove`, `rampLaneWindow` | 2, 45 s | Main entry lets no car into the right lane while more than this many ramp vehicles are due at the merge (waiting, or arrived in the window) |
| | `ghostFrame`, `ghostType` | on, on | Merging: the ramp vehicle's place in the merge order is carried over to where it is on the ramp; a truck's ghost is a truck. Off = the rules before 2026-11-19, kept to show the difference |
| | `approachMinRoom`, `approachRef`, `laneChangeBufFactor` | 2 m, `'rate'`, 1.0 | Approach braking and lane-change margins |
| | `laneCloseDist` | 1,000 m | A blocked lane is closed this far upstream |
| Incidents | `incidentClearTime`, `commsLossDuration` | 180 s, 20 s | Clearing crashes/debris; radio outage length |
| Humans | `humanSightDebris`, `laneChangeDuration` | 150 m, 3 s | Debris visibility; lane-change time (both worlds) |

The human driver model has its own constants in `HUMAN`, just below `DEFAULTS`: mean headway (1.4 s), shortest headway after a lane change (0.6 s), relaxation time (20 s), acceptable braking for lane changes, merge courtesy and driving noise.

Vehicle types: car 4.5 m, 2.0 m/s² acceleration, 8 m/s² maximum braking, 36 m/s top speed; truck 16.5 m, 0.8 m/s², 6 m/s², 25 m/s.

`stats()` also returns `lossEst` (measured radio loss) and `staleExtra` (the allowance added for it, in seconds). `world.m.admits` holds one record per vehicle let in at a gate: time, wait, which gate, vehicle type.

Fault API: `addDebris(x, lane[, v0, slide])` (an object lying still, or one that lands at speed `v0` and slides to rest at `slide` m/s²), `dropObjectAhead(x, lane, D)`, `suddenStop(x)`, `degradeBrakes(x)`, `breakdown(x)`, `commsLoss(x)`, `toggleSegment(i)`, `toggleSensors(i)`, `clearFaults()`. Observation: `stats(windowS)`, `speedProfile(binSize)`.

The development history, including the bugs found and the design lessons, is in [CHANGELOG.md](CHANGELOG.md).

## Important limitations

- This is a **concept model, not a validated traffic model**. The human baseline is checked against handbook capacities (see above) but not fitted to loop-detector data from a real road. SDR results depend on assumed parameters (braking, delays, margins), which are all in `DEFAULTS` at the top of `engine.js`.
- A lane change is granted on the follower's current state. With heavy radio loss the follower may still be driving on an older authority for a moment; the simulator does not wait for its acknowledgement.
- One straight corridor only: no network routing, no trip booking across a network, no intersections.
- Admission control counts vehicles in the whole corridor, not per lane. That is enough for the default rules, but not for a truck lane: the right lane fills with trucks and the on-ramp can no longer merge into it.
- An authority is set against the first vehicle ahead. If that vehicle pulls out and a truck is next, the hybrid's longer gap applies at once. With the default rules the gap is already there in nearly all cases; with a confirmation time in the truck gap the road also looks one vehicle further ahead.
- Sensors are perfect apart from fixed margins and the detection probabilities above (no noise model, no false alarms). An object that is hit is treated as stopping the vehicle dead (worst case); in reality most debris is driven over or pushed aside.
- Collisions are rear-end or merge contacts in one dimension. There's no crash physics, and crashed vehicles are cleared after 3 minutes.
- Vehicle dynamics are point-mass with acceleration limits and an actuator delay. There's no steering model.

## Files

| File | Contents |
|---|---|
| `engine.js` | Simulation core (no DOM). Works in the browser and in Node. |
| `index.html`, `style.css`, `ui.js` | Browser front end |
| `experiments.js` | Headless experiment suite: all runs share one pool of worker threads |
| `test/engine.test.js` | Regression tests (`node --test simulator/test`) |
| `risk-model.js` | Foreign-object risk model: event frequencies × detection layers × simulated outcomes, per billion vehicle-km (`node risk-model.js` → `results/risk-model.md`) |
| `CHANGELOG.md` | Development log: what was built, bugs found, design lessons |
| `results/` | Output of the latest experiment run |
