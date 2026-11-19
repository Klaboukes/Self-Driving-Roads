# SDR simulator: development log

What was built, what went wrong and how it was fixed. Many fixes are design lessons for the real SDR, not just simulator bugs; those are marked **Lesson**.

---

## 2026-11-19 (review pass): radio loss, calibrated human baseline, statistics, tests (→ [SDR-04](../SDR-04-Viability-Assessment.md))

A review of the whole project. It changed the headline: against a human baseline that behaves like a real motorway, SDR's gain is in speed, smoothness and reliability, and only partly in vehicles per hour. All numbers in the documents were re-run.

### Fixed: SDR
- **Supervision brake fired one step late.** The check compared the authority with a stopping point that ignored commands already on their way through the actuator. A vehicle could end up needing up to one time step of travel (about 1.7 m at 120 km/h) more than it had, eating into the 2.5 m margin.
  - Fix: the check counts the commands in the pipeline and brakes one step earlier (`_stopCommitted`).
  - Result: with 0–20 % radio loss the smallest spare distance never goes below zero.
- **`minSpare` reported phantom overruns.** While a vehicle was already braking, the metric assumed a fresh actuator delay every step and showed −7 to −9 m under radio loss. The true worst case was −1.7 to −1.9 m. It now reports the true spare distance.
- **Radio loss caused full-force braking.** After four or five lost messages in a row a closely following vehicle ran out of authority and braked at 8 m/s²: hundreds of times in 10 minutes at 20 % loss. The buffer allowed for about two control cycles of staleness, whatever the radio was doing.
  - Fix: the road measures the loss rate from the acknowledgements and widens every vehicle's stale-authority allowance until a run of lost messages that outlasts it is rare (`lossAdaptive`, `lossTolerance`). Admission control and the ramp gate use the wider gap too.
  - **Lesson:** size the gaps to the radio link you measure, not the one you specified. Radio loss should cost capacity, never braking.
- **Defaults contradicted decision D1.** The engine and the browser started in absolute separation while the documents recommend hybrid. Hybrid is now the default in both.

### Fixed: today's road (the human baseline)
The baseline carried about 4,300 veh/h, slowed to 85 km/h at light traffic, braked hard about 700 times per 1,000 vehicle-km and bumped at the merge about twice an hour. Real three-lane motorways carry roughly 5,450–6,500 veh/h. Six causes, all in the model, none in the "drivers":

- **Plain IDM keeps far larger gaps than its headway near the desired speed** (about 30 % larger at 100 km/h), so a lane carried about 1,700 veh/h where the capacity chart promised 2,200.
  - Fix: IDM+ (Schakel, Knoop & van Arem 2012). The simulation now matches the theory curve.
- **The corridor entry was the bottleneck.** Vehicles entered at 80 % of their headway and as slow as half the lane speed, which sent a braking wave back into the inflow; entry speeds sank to about 60 km/h. And the waiting traffic was one single file, so a truck waiting for the right lane held up cars for the other two.
  - Fix: enter at the speed of the lane with the driver's own headway; waiting traffic is as wide as the road (both worlds).
- **Trucks spread over two lanes,** holding both at 86 km/h. Human truck drivers now enter in the right lane.
- **A merging vehicle kept braking for the end of the acceleration lane** while it was already moving into the right lane, in front of traffic doing 100 km/h. That caused the "bumps at the end of the acceleration lane". Fixed in both worlds.
- **Lane changes could force the new follower to brake at 4–8 m/s²,** and plain IDM answers a short gap with emergency braking even when nothing is closing.
  - Fix: headway relaxation after lane changes (Laval & Leclercq 2008), the constant-acceleration heuristic for cut-ins (Kesting, Treiber & Helbing 2010), and gap acceptance judged after the follower's reaction time (1.5 m/s² for optional changes).
- **Drivers at a merge didn't cooperate.** Merging drivers now line up with a gap while on the acceleration lane, and right-lane drivers move left for on-ramp traffic when they can.
- Also: the driving noise depended on the time step (now an Ornstein-Uhlenbeck process), and a driver above the desired speed could brake at 9 m/s² (now eases off).
- **On ice the rebuilt drivers crashed** (19 collisions in 5 runs): they slowed down and kept longer gaps, but still counted on braking the road could not give. All their braking habits now shrink with the grip (`_humanGrip`): 0 collisions in 5 runs.

Result (section 11 of the results, `--only=today`): the plain road carries 5,680 veh/h and the corridor with the on-ramp 5,250–5,400 (was 4,300). At 3,300 veh/h traffic flows at 110 km/h (was 85). Hard braking is 20–86 per 1,000 vehicle-km (was 700–3,200). There were no collisions in 40 runs of normal traffic (was about one every other run). Halving the time step no longer changes the result beyond the spread between runs.

### Added
- **Experiments** ([experiments.js](experiments.js)):
  - all runs share one pool of worker threads (1,525 runs in a full run);
  - 5 runs per throughput row (was 2) with the standard deviation shown, 10 per incident row (was 6);
  - incident rows are paired with the same traffic without the incident, so background events are not counted as caused by it;
  - demand sweep up to 7,200 + 900 veh/h, so every system is pushed past its capacity;
  - new groups `packet-loss`, `trucks` and `today`;
  - each report section says which run it came from, and the data file is written before the report.
- **Regression tests** ([test/engine.test.js](test/engine.test.js), `node --test simulator/test`): reproducibility, identical traffic in both worlds, no SDR collisions or authority overruns (also with radio loss), a free-flowing baseline, fail-safe incident responses.
- **Risk model** reads the collisions per brick-wall event from the latest results instead of a hand-copied number.
- `package.json` with `test`, `experiments`, `risk` and `serve` scripts; the project is now a git repository.
- **UI:** hybrid is the starting policy; the SDR header shows how much the gaps were widened for radio loss.

### Findings that changed conclusions
- **The capacity gain is smaller.** With 10 % trucks the hybrid carries 5,880 veh/h against today's 5,400: +9 %, not +36 %. Relative separation carries 6,810 (+26 %).
- **The gain depends on trucks.** Hybrid against today's road: +28 % with no trucks, +9 % at 10 %, −2 % at 20 %, −11 % at 30 %. The absolute gap behind trucks costs 14 % at 10 % trucks, not 7 %: the earlier runs stopped at a demand that relative separation could still carry, so they never showed its limit.
- **Flow quality is the robust gain.** Above today's capacity SDR keeps about 100 km/h where today's road drops to about 60, and trip delay is roughly halved. Below today's capacity the two roads perform alike.
- **Radio loss has a price.** With widened gaps the hybrid carries 7 % less at 5 % loss, 13 % less at 10 % and 21 % less at 20 %. With fixed gaps it keeps its capacity but brakes at full force 200 times per 15 minutes at 10 % loss and 2,300 times at 20 %.
- **A brick-wall stop is worse on today's road than first shown:** 33 collisions in 10 runs, against 8–9 for SDR relative and hybrid. The old baseline was crawling at 45 km/h when the incident happened, which hid this.
- **Platoon breaks are still rejected.** With 10 runs per variant they show no reduction in brick-wall collisions at all.
- **Breakdown without a safety lane:** SDR lost about 6 vehicle-hours and today's road about 15, but the spread between runs is as large as the figures, so the earlier "4 times better" is not supported.

---

## 2026-11-19: Hybrid separation, detection layers, safety lane (→ [SDR-03](../SDR-03-Hybrid-Detection-Safety-Lane.md))

### Added
- **Hybrid separation** (`separation: 'hybrid'`). Relative separation by default, with an absolute gap:
  - behind trucks (`hybridTruckAbsolute`);
  - behind vehicles that report a fault (`hybridHealthAbsolute`);
  - in and 300 m before a segment whose road sensors are down (`hybridSensorAbsolute`).

  Optional platoon breaks (`platoonBreakEvery`) were tested and are off by default. An optional speed cap where sensors are down (`sensorGapSpeed`) is off by default, because it didn't reliably help.
- **Detection layers.**
  - `roadDetectProb`: the road sees a new object at all.
  - `carDetectProb`: per-vehicle sensor detection, rolled once per vehicle-object pair from a fault RNG that is the same in both worlds.
  - `carSensorShare`: `none`, `road` (confirmed one control cycle later) or `v2v` (other vehicles' guardians know after `v2vLatency`).
  - The guardian ignores an unconfirmed object that its own sensor missed.
- **Health detection delay** (`healthDetectDelay`, 0.5 s). The planner uses the braking the vehicle *believes* it has (`bfKnown`); physics uses the true braking. A fault is detected 0.3 s after the vehicle first asks for more than 1.5 m/s² of braking, if that is sooner.
- **Breakdowns** (`breakdown(x)`). The vehicle loses propulsion and coasts at `coastDecel` (0.4 m/s²). When stopped it becomes a static obstacle, towed after `breakdownClearTime` (900 s).
- **Safety lane** (`safetyLane`). Lane index `lanes` (to the right of lane 0), reachable only from lane 0 and not near the on-ramp or exit (`_safetyAccess`).
  - SDR sidetracks faulty, broken-down and radio-lost vehicles: work right with cooperative merges, then into the safety lane, at 60 km/h. Broken-down vehicles stop there.
  - A radio-lost vehicle in lane 0 pulls into it as part of its safe stop.
  - Absolute separation always applies in the safety lane.
  - On today's road it is a hard shoulder that broken-down drivers pull onto (`_humanPullOver`). A stopped vehicle in a live lane causes the same surprise delay as a crash.
- **Road-sensor outage** (`toggleSensors(i)`): objects in that segment are only confirmed by vehicle reports.
- **Object placement** (`dropObjectAhead(x, lane, D)`): puts an object where the nearest approaching vehicle is about D metres away, and reports the actual clearance.
- **New metrics:** `sidetracked`, `liveLaneStopS` (seconds a stopped vehicle blocked a live lane); collision records now include vehicle ids.
- **Experiments:** groups `hybrid`, `objects-150`, `objects-300`, `objects-truck`, `safety-breakdown`, `safety-brakes`, `safety-comms`, `sensors`.
  - `--only=` re-runs selected groups and keeps the others.
  - A worker pool uses all cores.
  - "Extra vehicle-hours" compares each incident run with the same seed without the incident.
- **Risk model** ([risk-model.js](risk-model.js)): object frequency × detection layers × simulated collisions per event.
- **UI:**
  - Hybrid option, object-detection controls and a safety-lane toggle.
  - Breakdown and Sensors-down incidents.
  - The safety lane is drawn, with an F glyph for broken-down vehicles and a hatch for sensors-down segments.
  - Hybrid curve on the capacity chart (categorical slot 4, validated for colour-blind separation).

### Fixed
- **Relative separation behind a weak-braking leader.** The relative EoA assumed the leader stops at *its* maximum braking. Behind a brake-degraded leader (or a truck), the follower's required gap became negative, so it closed up and bumped into the leader, causing a high-speed knock-on crash. The SDR-02 brake-loss collisions came from this.
  - Fix: assume the leader brakes at least as hard as the follower's own planning deceleration.
  - **Lesson:** a weaker leader must never license a shorter gap.
- **Gridlock beside a blockage.** With a broken-down vehicle stopped in lane 0 just before the exit, exiting vehicles in lane 1 kept a soft constraint behind lane-0 vehicles that were queued behind the blockage. They stopped beside it and blocked lane 1 too.
  - Fix: no soft constraint behind a target-lane leader if that lane is blocked within 300 m.
  - **Lesson:** never queue to slot in behind a blockage.
- **Lane changes impossible in a standing queue.** The lane-change check required the full control buffer (2 m) even at standstill, which a stopped follower cannot create.
  - Fix: 0.3 m is enough when both vehicles are below 2 m/s.
- **Yielding to a vehicle alongside.** A merge request told a follower that was already alongside to fall back, which it cannot do.
  - Fix: only followers fully behind are asked to make room.
- **Moving into a blocked lane.** Vehicles changed into a lane blocked just ahead.
  - Fix: no optional lane change into a lane blocked within `laneCloseDist`, unless the current lane is blocked too.
- **Late lane closure.** Vehicles only left a blocked lane 400 m before the blockage.
  - Fix: `laneCloseDist` = 1,000 m.
  - **Lesson:** close lanes far upstream, like red-cross lane signals.
- **Unreachable exits.** If lane 0 is blocked within 300 m of the exit, exiting vehicles are rerouted (`rerouted` metric) instead of forcing a late merge.
- **Entry gate draining the road.** The main entry shut whenever the merge-zone speed ratio dropped below 0.5, even with the corridor nearly empty.
  - Fix: meter on a slow merge only while occupancy is above 60 % of the budget.
- **Broken-down vehicle asked to drop back.** When the gap was tight, a vehicle without propulsion was told to fall in behind the target-lane follower, which burned the speed it needed to reach the safety lane.
  - Fix: a broken-down vehicle never yields; the followers make room.
  - Result: 6 of 6 reached the safety lane (it was 5 of 6).

### Findings that changed defaults
- Platoon breaks every 10 vehicles cost 7 % capacity and didn't reduce brick-wall collisions, so they are now off.
- An absolute gap behind trucks cost 7 % and took lost-load collisions from 15 to 0, so it is now on.

---

## 2026-11-18: First version (→ [SDR-02](../SDR-02-Simulation-Findings.md))

### Built
- `engine.js`: 5 km, 3-lane corridor with on-ramp and exit, two worlds fed the same demand.
  - Fixed number of random draws per vehicle (2 uniforms + 4 gaussians), so both worlds see the same traffic.
  - SDR: segment controllers every 0.1 s issue movement authorities (EoA), with 50 ms latency, packet loss and a 1.5 s authority time-to-live. Vehicles run a gap controller with a 0.2 s actuator delay, a supervision brake, a safe stop and a guardian that can only brake.
  - Human baseline: Human Driver Model (IDM with reaction delay and anticipation), surprise delay for unexpected events, MOBIL lane changes, courtesy yielding and exit gap seeking.
- `experiments.js`: demand sweep, incidents, weather and theory, in worker threads.
- Browser UI:
  - both worlds side by side, with stat tiles, overview, close-up with authority envelopes, and a time-space diagram;
  - capacity-vs-speed chart, event log, incidents, light and dark themes, phone-width layout.

### Problems found and fixed
- **Collision check** skipped the last pair in each lane (loop bound).
- **Human baseline crashing too often / flowing too little.** Fixed with anticipation, shorter reaction times, conservative extrapolation and better gap acceptance.
- **SDR hard braking when approaching slower vehicles.** Added early approach braking (`_approachDecel`). The first version made relative mode string-unstable (14,000 hard brakes). The final settings (`approachMinRoom` 2 m, closing speed measured against the authority's rate, `laneChangeBufFactor` 1.0) gave 0 hard brakes. A feed-forward variant without the acceleration term was worse and was rejected.
- **Merging, four attempts:**
  1. Courtesy lane changes overloaded lane 1.
  2. A position-based zipper slowed lane 0 to ramp speed.
  3. An arrival-time zipper deadlocked a truck.
  4. Final: **virtual vehicles**. Each ramp vehicle is projected into lane 0 as a "ghost" at its predicted arrival position, so mainline traffic opens a gap early and gently. **Lesson:** order merges by predicted arrival, not current position.
- **Admission control.** Metering on the merge-speed ratio alone was too strict. Replaced by an occupancy budget at critical density (factor 1.0; 0.9 and 1.1 were tested), plus a ramp gate that releases into predicted lane-0 slots, or after 45 s for fairness.
- **Human missed exits (~40 %).** Fixed with:
  - a bounded lane-change incentive;
  - keeping right early;
  - easing off to find a gap;
  - courtesy yielding.

  Courtesy then caused gridlock, so drivers now yield only to moving vehicles clearly ahead. "No overtaking near your exit" also blocked ramp vehicles that were exiting (a queue of about 85 vehicles); it now applies to mainline vehicles only. Result: 1–2 % missed exits.
- **SDR missed exits.** The yield target sat exactly at the lane-change threshold, so the gap never qualified. Fix: aim 3 m beyond it, pre-position exiting vehicles, and no overtaking for them.
- **Human surprise delay** also triggered on ordinary hard braking in jams. It now applies only to abnormal events (stopped-dead vehicle, crash, debris).
- **Segment-controller failure** caused full braking at the failed boundary. Fix: authority already granted stays valid (it was cleared with a safe stop included). About 23 supervision brakes per failure remain, and they are physically necessary.
- **UI:**
  - the hidden browser pane throttled animation, so it now catches up harder;
  - the dark-mode caption said "dark = slow" when slow was bright; captions now switch with the theme.

---

## Known modelling gaps

- No false alarms, weather or lighting effects, or correlated misses in object detection.
- Every object hit stops the vehicle dead (worst case).
- One corridor only: no network, intersections or urban traffic.
- Human baseline is checked against handbook capacities, not fitted to loop-detector data from a real road. It sits at the low end of the handbook range.
- A lane change is granted on the follower's current state; with heavy radio loss the follower may still be driving on an older authority for a moment (the simulator does not wait for its acknowledgement).
- Human drivers always reach the hard shoulder if they can; in reality 20 % of breakdowns end in a live lane.
