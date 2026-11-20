# Self Driving Road (SDR): Hybrid separation, detection layers and the safety lane

Status: simulation results and desk research, for discussion · 2026-11-19
**Figures updated (2026-11-19, review):** all simulation numbers below come from the re-run after the review: 10 runs per incident row and 5 per throughput row (was 6 and 2), and a today's road that now carries what a real motorway carries. The capacity comparison changed most: the hybrid is 9 % above today's road, not 36 %. See [SDR-04](SDR-04-Viability-Assessment.md) and the [changelog](simulator/CHANGELOG.md).
**Figures updated again (2026-11-19, roadmap section 1):** a fault in the SDR merge was fixed and the whole suite re-run. The hybrid is now 12 % above today's road at 10 % trucks and 9 % below it at 20 %. Collision counts are from 10 runs, or from 30 where a comparison needed them; the text says which differences are within the noise. Cheaper truck rules were tested and are reported in [SDR-04](SDR-04-Viability-Assessment.md) and the [roadmap report](reports/1-questions-from-latest-results.md). New desk research on lost loads is in appendix A5.
**Figures updated a third time (2026-11-20, roadmap section 2):** the whole suite was re-run with the final code. The lane-change acknowledgement is now on by default. The hybrid is 11 % above today's road at 10 % trucks. Section 2 added:
**Truck rule changed (2026-11-20, roadmap 6.1):** SDR now uses the safety criterion "clearly safer than today overall, no worse per hazard" (SDR-01 §2). Under it the long gap behind trucks is dropped for the SDR-Ready fleet, whose trucks are all enclosed. The risk model in section 6 was recounted per hazard, with today's road on the same measure. Sections that describe the hybrid with the truck gap keep their figures as measured.
- a range and a source for every input of the risk model;
- a false-alarm budget for D9;
- a radio requirement for D6;
- an ice rule.

See the [roadmap report](reports/2-make-the-model-more-trustworthy.md).
Builds on: [SDR-01](SDR-01-Concept-Architecture.md) (architecture) and the first simulation run of 2026-11-18. That run's report (SDR-02) was retired once its figures were superseded; current throughput and weather figures are in [SDR-04](SDR-04-Viability-Assessment.md).
Raw results: [simulator/results/results.md](simulator/results/results.md) · Risk model: [simulator/results/risk-model.md](simulator/results/risk-model.md)

---

## Summary

1. **Recommended hybrid separation.** Use relative separation by default, with an absolute (brick-wall) gap in three places:
   - behind trucks;
   - behind any vehicle that reports a fault;
   - where road sensors are down.

   It carries **6,000 veh/h**. That is 15 % less than pure relative (7,080), and **11 % more than the simulated today's road at its best** (5,400). Against published capacities of a real three-lane merge, the gain lies between about +5 % and −7 % ([SDR-04](SDR-04-Viability-Assessment.md)). It removes every lost-load collision we tested (65 in 30 runs without the truck rule, none with it), as long as the road confirms the load within 0.5 s. The truck rule costs more as the truck share rises: at 20 % trucks the hybrid carries 9 % less than today's road, unless trucks with an enclosed, monitored load are exempt from it.
2. **Platoon breaks don't pay off.** We tested an absolute gap for every Nth vehicle. One brick-wall stop involves only one or two followers anyway, so a break every 10 vehicles cost 8 % capacity and prevented nothing measurable.
3. **No spacing rule makes a true brick-wall stop safe at relative-level capacity.** An object that stops a car dead, with nobody seeing it in time, still causes a high-speed crash. The answer is to **make such events rare**, so the safety investment moves from spacing to sensing.
4. **Detection layers work, but speed matters more than coverage.** Road sensors that confirm an object within 0.5 s prevented every collision with lying objects, under every policy. Car sensors help only if what they see is shared: one car's report protects everyone behind it. Today's incident-detection systems take 10–60 s, which is far too slow. SDR needs roadside sensing that confirms an object within about a second.
5. **The safety lane turns a breakdown from a lane closure into a non-event.** The road steers the faulty vehicle onto the safety lane while it is still rolling. All 30 broken-down vehicles got there, with no measurable delay to other traffic. Without a safety lane, the vehicle blocked a live lane until it was towed, costing about 6 vehicle-hours on average (today's road without a hard shoulder: about 18; single runs vary a lot, but over 30 runs the difference is outside the noise). The UK's experience after removing hard shoulders points the same way.
6. **The risk model says it can work.** It needs SDR-grade sensing (≤1 s road detection, V2V) plus vehicles that report their own lost loads. Then objects cause about 3 collisions per billion vehicle-km (1.5–11 across the researched inputs; was "fewer than 1" before item 2.8 put ranges on the inputs), against about 10 debris crashes per billion vehicle-km and about 47 motorway casualties per billion vehicle-km today. **With today's detection technology, relative separation would be *worse* than human drivers for objects on the road.**

**A correction to the first simulation report.** That report gave 8 collisions after a sudden brake loss under relative separation. That was a flaw in my relative-separation formula, not physics. After a vehicle's brakes halved, the vehicle behind it assumed the weaker leader would stop more gently. So it was allowed to close up to a negative gap and bumped into it, which then caused a high-speed knock-on crash. The fix is a rule: a follower never assumes its leader stops more gently than the follower itself can. With it, brake loss causes **0 collisions under every SDR policy**.

---

## 1. What was added to the simulator

| Addition | What it does |
|---|---|
| Hybrid separation | Relative separation by default. Absolute gap behind trucks, behind vehicles that report a fault, and in or just before a segment whose road sensors are down. Platoon breaks every Nth vehicle are available but off by default. |
| Detection layers | Road sensors confirm a new object with a set probability after 0.5 s. Each car's own sensor sees it within 120 m with a set probability, rolled per car. What a car sees can stay with that car, go to the road, or also go directly to nearby cars (V2V, 50 ms). |
| New incidents | An object lands where the nearest car is about 150 m or 300 m away. A load falls off a truck just in front of the vehicle behind it. A vehicle breaks down (loses propulsion and coasts to a stop). A segment's road sensors fail. |
| Safety lane | A lane to the right of lane 1. The road sends faulty, broken-down and radio-lost vehicles there with cooperative lane changes: not across the on-ramp or the exit. On today's road the same lane is a hard shoulder that broken-down drivers pull onto. |
| Health detection delay | A brake fault is reported 0.5 s after it happens, or sooner once the vehicle tries to brake. In the first run it was reported instantly. |

Four control flaws showed up while testing breakdowns, and all four are fixed. They are design lessons for the real system, not just simulator bugs:

- **Gridlock beside a blockage.** Cars that wanted the blocked lane (to reach the exit) queued beside the stopped car, waiting for a gap behind it. That blocked their own lane too. *Rule: never queue to slot in behind a blockage; wait until you've passed it.*
- **No give in a standing queue.** At a standstill the lane-change check demanded spare room that a stopped car can never create, because it can't reverse. *Rule: in a standing queue, a small margin is enough.*
- **Late lane closure.** The road only told vehicles to leave a blocked lane 400 m before it. *Rule: close a blocked lane 1 km upstream (like a red-cross lane signal) and reroute vehicles that can no longer reach their exit.*
- **Over-eager entry gate.** The entry gate shut completely whenever merge traffic was slow, and drained the corridor. *Rule: meter on a slow merge only while the corridor is filling up.*

---

## 2. Hybrid separation

At saturated demand (7,200 + 900 veh/h), more than any variant can carry, 5 runs each. Safety: 30 runs each at 4,200 + 600 veh/h.

| Variant | Served (veh/h) | Brick-wall stop: collisions (30 runs) | Lost load: collisions (30 runs) | Follower's gap behind the truck |
|---|---|---|---|---|
| Today's road (human drivers, for scale) | 5,395 | 33 in 10 runs | 119 | 36 m |
| Relative | **7,084** | 22 | 65 | 24 m |
| + platoon break every 20 | 6,765 | 15 | 53 | 26 m |
| + platoon break every 10 | 6,549 | 31 | 57 | 28 m |
| + platoon break every 5 | 5,910 | 25 | 38 | 39 m |
| + platoon break every 3 | 5,215 | 16 | 29 | 45 m |
| **+ absolute behind trucks (recommended)** | **6,002** | 25 | **0** | 65 m |
| + absolute behind trucks + platoon break every 10 | 5,613 | 30 | 0 | 64 m |
| Absolute | 3,304 | 0 | 0 | 48 m |

*Served figures vary by ±60 to ±300 veh/h between runs. Lost-load rows use the default detection (road sensors and car sensors see everything). Today's road row: served at the same demand; incidents from the object and brick-wall tests. The brick-wall counts of all SDR variants except absolute are within the noise of each other.*

What this shows:

- **Behind trucks is where the absolute gap earns its keep.** About two-thirds of road-debris crashes involve items that fell off vehicles (AAA Foundation). With a relative gap of about 24 m the follower can't stop, whatever anyone knows. With the 65 m absolute gap, road sensors confirm the object in time and the follower stops. With 10 % trucks the rule costs 15 % of capacity. With 20–30 % trucks it costs 21–22 %, which puts the hybrid 9–20 % below today's road ([SDR-04](SDR-04-Viability-Assessment.md)). Limiting the rule to trucks whose load is not enclosed and monitored (D10) has since been tested: with at least half the trucks exempt the hybrid is back above today's road at 20 % trucks, and it is exactly as safe as that monitoring. "In time" is narrow. The gap covers a confirmation time of 0.5 s, not of 1 s, and it covers even 0.5 s only through slack in the braking, delay and margin terms. Improve any of those and lost-load collisions come back ([SDR-04](SDR-04-Viability-Assessment.md), section 1).
- **Platoon breaks buy nothing against a brick-wall stop.** Each successive follower hits later and slower, so the chain ends by itself after one or two vehicles. No platoon-break setting changed the brick-wall collisions: 22 in 30 runs without breaks, 15–31 with, and every difference is within the noise. Breaks do reduce lost-load collisions, from 65 to 38 with a break every 5 vehicles and to 29 with a break every 3. But that costs 17 % and 26 % of capacity. The truck rule costs 15 % and leaves none.
- **The brick-wall stop itself is untouched by any hybrid rule** (15–31 collisions in 30 runs, impacts up to 70 km/h). A vehicle that stops dead without warning is a physics problem, not a spacing problem, unless you accept absolute separation and half the capacity. Today's road does worse: 33 collisions in 10 runs, with impacts of up to 102 km/h.
- **Behind faulty vehicles:** after the formula fix, a brake-degraded leader is no longer dangerous to its follower. The rule stays as cheap insurance, since a vehicle with one fault is more likely to have a second.
- **Weather:** in dry and wet conditions the hybrid matches relative (about 4,200 veh/h at 3,600 + 600 demand, which is all the traffic there is). On ice it drops to 3,580, below today's road (3,960 at 60 km/h), because the gaps behind trucks become very long. That is arguably correct: on ice a lost load is far more dangerous. Roadmap 2.6 found a better rule for ice: the hybrid with a 60 km/h cap. It carries 14 % more than today's road on ice at saturated demand, and lowers the worst brick-wall impact from 69 to 45 km/h ([SDR-04](SDR-04-Viability-Assessment.md)).

---

## 3. Road safety systems: fences and cameras

### What exists today

| System | Performance | Source |
|---|---|---|
| Wildlife fencing (with crossing structures) | Large-mammal collisions down **83–84 %** on average; up to 96 % in the best schemes; no effect on large carnivores. Longer fences (>5 km) work much better than short ones (53 %). | Huijser et al. 2016; Rytwinski et al. 2016 meta-analysis; Ford et al. 2022 |
| Animal-detection systems (warning signs) | 57 % reduction | Rytwinski et al. 2016 |
| Tunnel video incident detection | Detects 95 % (open road) to 98 % (tunnels) of events, typically **within 10 s**; about 0.025 false alarms per camera per day | PIARC |
| UK smart-motorway radar for stopped vehicles | Target: 80 % detected, ≤20 s. Achieved: 60–80 % with 43–65 s average in 2022, improving to 86–89 % in 2023–24 (contested data) | ORR; Highways Magazine |
| Airport runway debris radar (Tarsier, FODetect, mm-wave) | Finds bolt-sized objects (2.5 cm) at up to 2 km, but scans take **up to about a minute** | Vendors; Flightglobal; AIN |

### What the simulation adds

Objects that would stop a car dead, at 4,200 + 600 veh/h; 30 runs per row for the hybrid, 10 for the other policies:

| Detection | Object lying 150–300 m ahead of the next car | Load falls off a truck (hybrid) | Load falls off a truck (relative) |
|---|---|---|---|
| Nobody detects it | 30 of 30 runs with a collision, 120 km/h impacts | 30 of 30, 91 km/h | 10 of 10 |
| Road sensors only (95 %, 0.5 s) | **0 collisions** (all policies) | **0** | 10 of 10 |
| Road + car sensors + V2V | **0** | **0** | 10 of 10 |

For scale, today's drivers hit a lying object in 3–4 of 30 runs and a lost load in 28 of 30. With road sensors the hybrid's zero is clearly better than today's road for lost loads; for lying objects it is within the noise, because drivers rarely hit those either. With nobody detecting the object, SDR is clearly worse than drivers, who at least see it.

### What it means

- **Fences are cheap and proven** (indicative cost: €5,000–25,000 per km per year including crossings). SDR motorways would be fully fenced anyway, because pedestrians and animals are the unpredictable element the system removes. Treat fencing as a given, not an option.
- **Roadside sensing is the most valuable safety investment in SDR.** It removed every collision with lying objects in the simulation. But only at a confirmation time of about 0.5–1 s, which is **10–60 times faster than today's operational systems**. Two reasons that gap is bridgeable:
  - SDR's road sensors do one simple job: compare the lane against what the controller already knows is there. Every vehicle position is known, so anything else in a lane is an anomaly.
  - Coverage can overlap, with sensors every 100–300 m. The UK found it had to tighten its radar spacing from 500 m to 300 m.
- Runway debris radar shows the sensing physics exists for small objects. Its minute-long scan cycle does not suit a motorway.
- **A segment with failed sensors must fall back to absolute separation.** At the on-ramp merge this cost 17 % of throughput in the simulation (4,760 → 3,970 veh/h at 4,200 + 600 demand) and 35 % at saturated demand, about a third in every layout tested. On a plain stretch it cost 1 % at that demand and 8 % at saturated demand. Sensor redundancy matters most at merges.

---

## 4. Car sensors and vehicle-to-vehicle communication

### What exists today

- **No crash-test programme measures how well cars detect road debris.** Euro NCAP, IIHS and NHTSA test only vehicles, pedestrians, cyclists and motorcycles. In AAA's 2022 tests, automatic emergency braking avoided a stopped car in only 6 of 20 runs at 40 mph. Research stereo cameras detect 5 cm-high obstacles at about 20 m, far short of motorway stopping distance. **Car detection of debris should be treated as unproven.**
- **V2V is fast enough.** C-V2X measured about 30 ms latency (95th percentile, CAMP 2019), and ITS-G5 1–100 ms. That is well within the 100 ms that emergency brake warnings need. Reliability under heavy congestion is less well documented.
- **Truck platooning** (the ENSEMBLE project) uses V2V because it is faster than radar for emergency-brake warnings. It still keeps at least 0.8 s gaps. Simulation studies find that 500 ms delays cause collisions unless the gaps grow.

### What the simulation adds

Objects lying 150–300 m ahead (hybrid, 30 runs per row; the other policies behave alike in 10 runs each):

| Car sensors (each sees it 90 % of the time) | Runs with a collision |
|---|---|
| Not shared: each car must see it for itself | 27–28 of 30, and in many runs a second car drove into it later |
| Shared via the road or V2V | 5 of 30 |
| Plus road sensors | 0 of 30 |

Today's drivers hit the same objects in 3–4 of 30 runs. Unshared car sensors are clearly worse than that; shared car sensors cannot be told apart from it.

### What it means

- **The car sensor's value is as a first witness, not as a shield.** Fifty cars each with a 90 % detector, working alone, means somebody eventually hits the object. One car that sees it and tells the road protects everyone behind it. In SDR every car already talks to the road, so sharing costs almost nothing. **Make reporting detections part of the "SDR-Ready" vehicle standard.**
- **V2V adds speed and redundancy, not much safety, while the road link works.** In SDR the road already learns about an object within one control cycle (0.1 s). V2V matters when the segment controller or its radio is down. In that case it is the only way a detection reaches the vehicles behind. Keep it as the second, independent communication path that SDR-01 already requires (D6). Roadmap 2.3 put a number on that requirement. Two paths whose losses are independent, each delivering at least 99 % of messages, cost no measurable capacity. One path with the same loss in bursts costs 62 %. If the two paths share a cause of loss, such as a dead spot or a truck shadowing both antennas, they are no better than one.
- **Cars can report their own lost load.** The simulation says lost loads are the hardest case. The vehicle carrying the load is the best-placed sensor: trailer coupling, roof-box latches, load-bed weight sensors and a rear camera can all detect a load leaving *as it happens*. That warning would reach the follower before the object lands. This is a cheap requirement with a large payoff (see the risk model below).

---

## 5. The safety lane

### What exists today

England's smart-motorway evidence is the best natural experiment available (Smart Motorway Stocktake 2020, 2017–18 averages):

- **On conventional motorways with a hard shoulder:** 20 % of breakdowns still stop in a live lane.
- **On "all-lane running" (no hard shoulder):** 40 % stop in a live lane. About 116 breakdowns per km per year, of which about 46 per km per year are in a live lane.
- **On 9 all-lane-running schemes:** collisions with vehicles stopped in a live lane rose from 3 to 19 per year, about 3 of them fatal.
- **The hard shoulder is not safe either:** 8 % of motorway deaths happen there.
- **Emergency refuge areas** (every 0.75–1 mile) have had zero fatal collisions since 2006.
- **New all-lane-running schemes were cancelled in April 2023,** citing cost and lost public confidence. About 150 extra emergency areas are being added.

### What the simulation adds

A vehicle loses propulsion around 3.7 km and coasts to a stop. It is towed 15 minutes after it stops. 4,200 + 600 veh/h, 30 runs, observed for 20 minutes. Extra delay is measured against the same traffic without the breakdown, ± the spread between runs.

| System | Vehicle stopped in a live lane | Extra delay (vehicle-hours) | Collisions |
|---|---|---|---|
| Today, no hard shoulder | 630 s on average* | 18.5 ± 12.8 | 2 (4 without the breakdown) |
| Today, with hard shoulder | 0 s | −0.5 ± 4.1 | 3 (4 without the breakdown; ≤17 km/h) |
| SDR hybrid, no safety lane | 540 s on average* | 6.3 ± 15.8 | 0 |
| SDR hybrid, with safety lane | **0 s** (30 of 30 reached the safety lane) | **0.0 ± 0.0** | 0 |

*\*900 s in the runs where the vehicle stopped inside the 5 km corridor (18 of 30 on SDR, 21 of 30 on today's road). In the other runs it coasted off the end of the corridor before stopping.*

Without a safety lane, a breakdown cost SDR about 6 vehicle-hours and today's road about 18. Single runs vary a lot, but compared run by run on the same traffic SDR loses 13 vehicle-hours less (95 % interval 6 to 19), which is outside the noise. SDR closes the lane 1 km upstream and merges traffic cooperatively, so there are no stop-and-go waves. With the lane, neither road loses anything measurable: the hard shoulder works for human drivers too, when they reach it. The collision counts on today's road are within the noise of the same traffic without the breakdown.

Brake loss caused no extra delay with or without a safety lane, and radio loss 0.3 vehicle-hours either way: a brake-degraded vehicle keeps driving, and a radio-lost vehicle restarts after 20 s.

### What it means

- **Keep the hard shoulder and give it a job.** SDR solves the safety problem that killed all-lane running: a stopped vehicle in a live lane is a known, protected obstacle that every upstream vehicle stops for. The efficiency problem remains: a stopped vehicle closes a lane for as long as the tow takes. The safety lane removes that.
- **Because SDR knows a vehicle is faulty before it stops,** it can move it while it still has speed, with the neighbours making room. A human driver often can't reach the hard shoulder from lane 3. The simulation had to make sure a vehicle without propulsion is never asked to drop back for a gap: it can't catch up again.
- **The safety lane needs gaps at the on-ramp and the exit,** where it would conflict with merging and exiting traffic. A vehicle that breaks down there can only reach it after the junction. Emergency refuge areas, as on UK motorways, cover the case where the safety lane is interrupted.
- **Radio loss:** a vehicle in lane 1 (the right-hand lane) now pulls into the safety lane as part of its pre-cleared safe stop. A vehicle in another lane still stops in its lane, which the road protects. Moving that vehicle across lanes without a radio link would need V2V or onboard side sensors.
- **Other uses:** the safety lane is also the emergency-vehicle corridor, a place to hold vehicles during a segment controller failure, and a way to keep trucks with failing brakes off the live lanes.

---

## 6. Putting it together: how often does it go wrong?

The simulation answers "what happens if…". A risk model is needed for "how often". [simulator/risk-model.js](simulator/risk-model.js) multiplies how often an object lies in a lane by the chance that each layer of protection misses it, and by the collisions per event measured in the simulation. Most inputs have never been measured, so since roadmap item 2.8 (2026-11-19) each has a low, central and high value. Sources are in appendices A4 and A5; the full table is in [the model's output](simulator/results/risk-model.md).

| Input | Low | Central | High | Source |
|---|---|---|---|---|
| Lane-blocking objects per billion veh-km | 120 | 141 | 420 | Central: 21,774 obstruction lane impacts on England's strategic road network in 2023† over 154 billion veh-km (DfT). High: every item National Highways removed from its roads in 2025, most of them never in a lane, so a ceiling. Low: an assumption that some records repeat the same object (the model's earlier value). |
| Share heavy enough to stop a car dead | 5 % | 10 % | 20 % | Assumption; no data found. |
| Share that lands right in front of a following vehicle | 17 % | 33 % | 50 % | About two-thirds of debris crashes involve items that fell off vehicles (AAA Foundation 2016). The share of those landing within the follower's stopping distance, 25–75 %, is an assumption. |
| Share of falling objects that come off a heavy truck | 30 % | 40 % | 50 % | Estimate from conflicting evidence (A5); nobody records which vehicle an object came from. Was 70 %, without a source. |
| Share of falling objects that are cargo, not tyres or parts | 40 % | 50 % | 70 % | About half and half in US and English data (A5). The high end assumes heavy objects are more often cargo. Before, the model treated everything as cargo. |
| Share of tyre and part losses that the vehicle reports | 0 % | 0 % | 50 % | Assumption. Tyre-pressure monitoring might report some tyre failures; a US field test was inconclusive. |

Since roadmap item 6.1 (2026-11-20) the model also has two inputs for the SDR-Ready fleet, both assumptions: the share of cargo losses an enclosed body still lets out (2 %, **10 %**, 25 %), and the share of truck tyre and wheel losses reported beforehand as a fault (0 %, **30 %**, 60 %), after which the road gives that truck the long gap. Detection performance is set per scenario. Collisions per event come from the simulation, per hazard and counted the same way for SDR and today's road (30 runs each): 2.4 per lost load at a relative gap, 1.5–1.9 per brick-wall stop, and 5.0 per lost load on today's road.

| Scenario | Collisions per billion veh-km | Range, researched inputs vary | Range, all inputs vary | Before item 6.1 |
|---|---|---|---|---|
| Today's road (human drivers, today's vehicles), same measure | 25 | 21–75 | 6–217 | new |
| A. Relative separation, today's detection (≈10 s, nothing shared) | 26 | 22–77 | 10–165 | 22 |
| B. Hybrid with truck gap, today's detection | 19 | 15–60 | 7.5–127 | 16 |
| C. Hybrid with truck gap, SDR-grade detection (road ≤1 s/99 %, car 90 %, V2V) | 7.2 | 5.2–25 | 1.5–73 | 4.7 |
| D. As C, plus vehicles report their own lost cargo (90 %) | 7.3 | 5.2–25 | 1.5–73 | 2.8 |
| E. Absolute separation, SDR-grade detection | 0.3 | 0.26–0.9 | 0.1–2.3 | 0.3 |
| F. Relative separation, SDR-grade detection, today's vehicles | 12 | 10–35 | 2.7–103 | new |
| **G. No truck gap, SDR-grade detection, SDR-Ready fleet (recommended since 2026-11-20)** | **9.2** | 6.7–30 | 1.7–95 | new |
| H. As G, with the truck gap | 7.3 | 5.2–25 | 1.5–73 | new |
| *For scale: debris crashes today, recorded (US, all roads)* | *≈ 10* | | | |
| *For scale: casualties on GB motorways, all causes* | *≈ 47* | | | |

"Researched inputs" are the object rate, the truck share and the cargo share; the assumptions stay at their central values. In "all inputs vary" every input is at its best or at its worst at the same time, so that range is deliberately wide.

How to read it:

- **Treat the numbers as orders of magnitude.** Two inputs set the level and move every scenario, today's road included, by the same factor: the heavy share (an assumption; a factor of 4 across its range) and the object rate (a factor of 3.5, though its high end is a ceiling, not a likely value).
- **Item 6.1 changed how lost loads are counted, and SDR looks worse for it.** At a relative gap a lost load causes 2.4 collisions in the simulation, not the 1.5 of a brick-wall stop, which raises C from 4.7 to 7.2. And a loss the vehicle reports itself no longer counts as harmless: with the road told at once, the follower about 19 m behind hit the load as often as without the report. So load monitoring as a warning adds nothing (D equals C). What it adds is the long gap behind a truck that reports a fault, and enclosed bodies that keep the load in.
- **Per hazard, G is below today's road in every combination of inputs:** lying objects 0.38 of today, truck cargo 0.05, truck tyres and parts 0.34, losses from cars and vans 0.48, all objects 0.37. This is what the safety criterion in [SDR-01](SDR-01-Concept-Architecture.md) §2 asks for, and why D1 drops the gap behind trucks. Keeping the gap (H) lowers 9.2 to 7.3.
- **The residual is cars and vans, not trucks.** About 7 of G's 9 collisions come from what falls off them; no truck rule covers those, and the hybrid with the truck gap has the same 7.
- **The ranking of A–E holds** in every combination of inputs: with today's detection close following is no better than today's road; fast roadside sensing does most of the work (B → C, 2.6×; 1.8–5.2×).
- **What could undo the comparison with today's road:** the simulated drivers brake but never swerve, so today's road may count too many collisions per lost load. SDR would lose its advantage on lost loads only if today's road had 63 % fewer than simulated. On the SDR side, what matters most for G beyond the level is the share of objects that land right in front of a follower (factor 2.6), then the truck share and the tyre and wheel warnings (1.2 each).
- This covers objects only. It excludes system failures (software faults, cyberattack, correlated failures). Those need their own analysis and could dominate.

---

## 7. Design implications

Proposed updates to [SDR-01](SDR-01-Concept-Architecture.md):

| # | Decision | Proposal |
|---|---|---|
| D1 | Separation policy | **Hybrid:** relative by default; absolute behind vehicles that report a fault and in segments with degraded sensing. No platoon breaks. ~~Absolute behind load-carrying vehicles~~: dropped on 2026-11-20 for the SDR-Ready fleet under the safety criterion "no worse than today per hazard" (SDR-01 §2, roadmap 6.1). |
| D7 | Guardian sensor scope | Unchanged (forward only). Add: **every guardian detection is reported to the road**; the guardian's main value is as a first witness. |
| D9 (new) | Roadside object detection | Overlapping radar/lidar/camera coverage with a **confirmation time of ≤1 s** for any lane-blocking object, ≥99 % detection, and at least two independent sensor types per point. Treat it as safety-critical (SIL-rated), like railway interlocking. False alarms: at most about 1 per km per hour if a re-check clears one within 10 s, 0.5 if it takes a minute (roadmap 2.4). A car's report of an object is checked by the road and does not close a lane on its own. |
| D10 (new) | Load monitoring | Required for SDR-Ready trucks, trailers and roof/rear carriers: detect load loss and broadcast it immediately (road + V2V). |
| D11 (new) | Safety lane | A continuous safety lane on SDR motorways (the current hard shoulder), with refuge areas where it is interrupted at junctions. The road sidetracks faulty vehicles while they are still moving. It doubles as the emergency-vehicle corridor. |
| D12 (new) | Fencing and access control | Full fencing with wildlife crossings on all SDR motorways; pedestrian intrusion is detected and treated as an object. |

Updates to the vehicle standard (SDR-01 §7):

- **Health reporting:** brake faults must be reported within 0.5 s, including faults found when the vehicle brakes.
- **Guardian:** detections are reported to the road.
- **Load monitoring:** new requirement (D10).
- **Safe-stop executor:** from lane 1, the safe stop includes moving into the safety lane when its own sensors see it clear.

---

## 8. Limitations

- **Worst case for objects.** Every object hit is treated as stopping the vehicle dead. Most real debris is driven over or pushed aside, so the collision counts overstate severity. The risk model's 10 % "heavy" share is meant to correct for that, but it is a guess.
- **Simple sensor model.** Detection is a single probability plus a fixed delay. There are no false alarms (which would cost capacity through needless stops), no weather or lighting effects, and no correlation between cars missing the same object. Correlated misses (a low, dark object at night) would make car sensors less useful than modelled.
- **Small samples.** Incident results are 10 runs each, 30 where a comparison needed them. They show whether something can happen and roughly how bad it is, not precise rates. Ten runs can mislead: the hybrid had 15 collisions in its first 10 brick-wall runs and relative separation 6, which looked like a real difference; after 30 runs it was 27 against 23.
- **Generous human baseline.** Human drivers reach the hard shoulder whenever they can. In reality 20 % of breakdowns on conventional motorways still end in a live lane.
- **Research quality.** Several research figures come from secondary sources or were not fully verified (marked in the sources below). The 47 casualties per billion vehicle-km figure comes from a news report of the official statistics.

---

## 9. Suggested next steps

1. **Sensor model with false alarms and correlated misses.** A false positive in SDR costs capacity (needless stops), a false negative costs safety. Find the operating point.
2. **Roadside sensing proof of concept.** Measure the time-to-confirm and miss rate for a pallet, a tyre and a deer-sized object at night, in rain, at 150 m.
3. **System-failure risk.** Extend the risk model to software faults, cyberattack and common-cause failures, which is the other half of the safety case.
4. **Network layer and cost model.** Several corridors with trip booking, plus a cost per km for sensing, fencing and the safety lane against the capacity gained.

---

## Appendix A: research data

These are the full desk-research findings behind sections 3–6. "Calc" marks a per-km figure derived here; † marks a figure seen only in a secondary source or a search snippet.

### A1. Roadside safety systems

**Wildlife fences**
- Huijser et al. 2016 review:
  - fences longer than 5 km cut large-mammal collisions by **84 %** on average;
  - fences shorter than 5 km by **53 %** (range 0–94 %).
- Rytwinski et al. 2016 meta-analysis (50 studies):
  - fencing plus crossing structures: **83 %** fewer large-mammal road-kills;
  - animal-detection systems: 57 %;
  - reflectors: about 1 %.
- Ford et al. 2022, Canadian Rockies: ungulate collisions down by up to **96 %**; no reduction for large carnivores.
- Cost (Huijser 2009 model, 2007 US$)†:
  - fence plus underpasses: about $5,860 per km per year;
  - fence plus overpasses: about $26,485 per km per year.
  - The source table's units are inconsistent, so treat these as indicative.

**Tunnel video incident detection**
- PIARC benchmark:
  - time to detect: typically **≤10 s**;
  - detection rate: **95 %** outdoors, **98 %** in tunnels;
  - false alarms: 0.025 per camera per day.
- French EVA system: 100 % detection over 1,872 h, with 1 false alarm per 84 h.
- A 2026 review found detection rates of **40–100 %**, depending on lighting, road curvature and camera angle.

**UK smart-motorway stopped-vehicle detection (radar)**
- Targets: at least **80 %** of stopped vehicles detected, under 15 % false alerts, and **≤20 s** average time to detect.
- ORR, 2022: regional detection rates of 59.6–79.6 %; average time to detect 43–65 s in 4 of 5 regions.
- 2023: "92 % within 20 s" was claimed. It is contested, because 85 % of alerts were classed "unverified" and excluded.
- 2023 → 2024: detection rate fell from 89 % to 86 % (476 events in 2024); 91 % of detected vehicles were found within 20 s.
- Radar spacing was tightened from about 500 m to about 300 m. The retrofit contract grew from £18m to £25.75m. Cost per km is not known.
- New all-lane-running schemes were cancelled on 15 April 2023, citing cost and drivers' lack of confidence. About 150 extra emergency areas are being added to existing schemes.

**Airport runway debris radar**
- Tarsier (QinetiQ): detects objects with a radar cross-section of −20 dBm² or less, at up to 2 km. Heathrow uses 2 radars on a 3,658 m runway. Detection time of 1–3 min†.
- Xsight FODetect: detects nut- and rivet-sized objects; each sensor scans its sector within 60 s.
- Plextek mm-wave radar (vendor claim): minimum object 2.5 cm, >95 % probability of detection within 1 min, range over 400 m.

**Railway obstacle detection**
- SMART2 level-crossing lidar: 60°×30° field of view, 40 m range.
- Commercial lidar vendors claim >99.9 % detection accuracy†.
- No published detection performance by object size was found.

### A2. Vehicle sensors and V2V

**Detecting debris**
- No crash-test programme (Euro NCAP, IIHS, NHTSA) tests detection of road debris such as tyres or pallets. They test only vehicle, pedestrian, cyclist and motorcycle targets.
- AAA 2022, automatic emergency braking against a stopped vehicle: crash avoided in **17 of 20** runs at 30 mph and **6 of 20** at 40 mph.
- Research stereo camera (Lost & Found dataset, 2016): detects 5 cm-high obstacles at about 20 m.

**V2X latency and reliability**
- CAMP/US DOT: emergency electronic brake light warnings need latency of **≤100 ms**.
- CAMP C-V2X tests (2019): 95th-percentile latency about **30 ms** for a 200-byte message.
- Anritsu sidelink test (vendor): maximum latency about 27.7 ms at 50 m.
- Finnish ITS-G5 pilot†: 90–98 % of safety messages delivered at 10 Hz, latency under 100 ms.
- SECUR project: average ITS-G5 latency 1.24 ms. Behaviour under congestion is not known.
- Multi-hop hazard warnings (simulation): under 300 ms with probability 0.998.
- 3GPP TS 22.186: platooning needs V2V latency of **≤10 ms** (secondary source). A 99.99 % reliability figure†.

**Platoon emergency braking**
- ENSEMBLE (ended March 2022):
  - minimum gap 0.8 s, raised to 1.5 s downhill;
  - V2V is used because it is faster than radar for emergency-brake warnings;
  - no braking-latency measurements were published.
- Simulation studies:
  - a 0.67 s headway is safe with a 150 ms communication delay†;
  - delays up to 500 ms very likely cause a collision unless the gap is enlarged (IPG, 2024).
- Cummins/DOE truck trials: 0.6 s gap.

### A3. Hard shoulder and emergency lanes (England, Smart Motorway Stocktake 2020, 2017–18 average)

| Road type | Breakdowns per year | Stopped in a live lane |
|---|---|---|
| Conventional motorway (hard shoulder) | 129,991 | 20 % (25,663) |
| All-lane running (no hard shoulder) | 22,963 | 40 % (9,206) |
| Dynamic hard shoulder | 14,215 | 27 % |
| Controlled motorway | 17,409 | 14 % |

- **Calc for all-lane running:** at end-2018 it covered 198 km carrying 8.05 billion veh-km per year. That gives:
  - about **116 breakdowns per km per year** (≈ 2.9 per million veh-km);
  - about **46 live-lane stops per km per year** (≈ 1.1 per million veh-km).
- Evidence to a Commons committee: 16 vs 62 live-lane stops per mile per year (conventional vs all-lane running)†.
- On 9 all-lane-running schemes, collisions with vehicles stopped in a live lane rose from **3 to 19 per year**: 9.1 slight, 7 serious, 2.8 fatal.
- **Calc:** about 0.2 % of live-lane stops end in an injury collision.
- 1 in 12 motorway deaths (8 %) happen on the hard shoulder: 27 deaths between 2014 and 2017.
- No fatal collisions in emergency areas since 2006.
- Emergency-area spacing: 0.3–1.6 miles existing; target 0.75 miles; maximum 1 mile.
- Traffic officers take 17 min on average to attend, against a 10 min target.
- Netherlands: Rijkswaterstaat physically protected 60,000 incidents in 2014 and 200,000 in 2024. No official breakdowns-per-km figure was found.

### A4. Base rates

**Road debris** (AAA Foundation, Tefft 2016, data 2011–14):
- **50,658 crashes per year** (95 % CI 42–59k), 9,805 injuries and **125 deaths**.
- About two-thirds involve items that fell off vehicles.
- Debris crashes are about 4 times as likely on Interstates.
- **Calc:** with about 4.8 × 10¹² veh-km per year, that is about **0.0105 debris crashes per million veh-km** (≈ 10 per billion veh-km) and about 0.026 deaths per billion veh-km.

**Animal collisions**
- US (FHWA 2008): 1–2 million collisions with large animals per year, about 26,000 injuries and about 200 deaths. **Calc:** about 0.2–0.4 per million veh-km, on all roads and mostly rural.
- Netherlands: about 10,000 per year (estimate), of which about 6,300 are reported to police.

**Falling loads and obstructions (UK)**
- More than 20,000 items fall from commercial vehicles each year (National Highways, 2021).
- More than 49,000 large objects were removed from January to September 2025, including dumped items.
- Obstructions caused **21,774 lane impacts** on the Strategic Road Network in 2023†. **Calc:** with roughly 175 billion veh-km of SRN traffic (about a third of GB's 334 billion vehicle-miles), that is about **120 per billion veh-km**. The risk model used this until item 2.8; it now uses the 141 from A5 as its central value, with 120 as the low end.

**Human error**
- NHTSA 2015: the driver was the critical reason in **94 %** (±2.2 %) of crashes. Recognition errors 41 %, decision errors 33 %, performance errors 11 %. This covers all roads, not motorways only.

**Motorway casualty rate**
- GB motorways: about **76 casualties per billion vehicle-miles in 2023** (≈ 47 per billion veh-km)†. Not yet checked against the DfT road-type tables (RAS0302).
- GB all roads: 398 casualties and 5 deaths per billion vehicle-miles; 334 billion vehicle-miles in total (DfT 2023).

**Not found:**
- debris-detection range for automatic emergency braking;
- ENSEMBLE braking-latency measurements;
- FAA FODetect test results;
- stopped-vehicle-detection cost per km;
- a motorway-only human-error share;
- Dutch breakdowns per km.

### A5. Lost loads from trucks (added 2026-11-19)

Desk research for roadmap item 1.2: how often do trucks lose loads, and what could be built into a truck to prevent it? Most figures are from secondary sources or search excerpts and were not checked against the originals (†).

**How often**
- No road operator or agency found records which kind of vehicle an object came from. The truck share is therefore an estimate.
- England: 21,774 obstruction "lane impacts" on the strategic road network in 2023†. DfT gives 95.8 billion vehicle-miles (154 billion vehicle-km) on that network in 2023, lorries about 11 % of it. **Calc:** about **141 lane impacts per billion vehicle-km** (the 120 in A4 used a rougher traffic estimate).
- Flanders: only 78 "cargo loss" events a year logged by the motorway traffic centre, 2012–2022 (Vias institute 2025). Serious cargo losses are far rarer than lane impacts, which include small debris.
- Japan: 240,000 objects handled on expressways in fiscal 2024, excluding roadkill (MLIT). Austria: about 7,200 call-outs for lost objects in 2023†.
- US: about 53,000 debris crashes and 72 deaths a year, 2018–2023 (AAA Foundation 2025). NHTSA cannot identify unsecured-load crashes as such (GAO-13-24).
- Trucks against other vehicles, conflicting evidence:
  - towards trucks: 75 % of 36 North American road agencies named commercial vehicles as the main source (an opinion survey); 64 % of roadside tyre debris was truck tyres (AAA Foundation 2004);
  - away from trucks: passenger vehicles account for 73–81 % of US crashes with improperly secured cargo (NHTSA†); in Flanders trucks are involved in about a quarter of "cargo lost before the accident" cases; England's lists include many household and garden items.
- **Estimate:** heavy trucks shed perhaps 30–50 % of lane-blocking objects while driving about 11 % of the kilometres: about **350 events per billion truck-km** (range 150–600), roughly five times the rate of light vehicles. Confidence: moderate for the total, low for the truck share.

**What is lost**
- Cargo and vehicle parts split about evenly. England, lane impacts 2023: building materials 20 %, vehicle parts 16 %, tyres 10 %†. US crash reports 2018–23: cargo 19 %, tools and building materials 9 %, tyres and parts 29 %. US fatal debris crashes: cargo 38 %, parts 38 % (AAA Foundation 2004).
- No data anywhere on open against enclosed bodies as the source. Fleet mix: in the US about 61 % of new trailers are dry vans and 15 % refrigerated; in Europe curtain-siders are the largest group (43 % of semi-trailer sales in 2016)†. A curtain does not count as load restraint unless the body is built to EN 12642 "Code XL".
- **Estimate:** a rigid enclosed load space would prevent roughly 40 % (30–50 %) of truck-origin events: nearly all the cargo, none of the tyres, wheels and parts.

**What could be made mandatory and built in**

| Measure | Status | Evidence that it reduces lost loads |
|---|---|---|
| Rigid enclosed or Code XL body with door-closed sensing | Standardised (EN 12642); mature | None measured |
| Tyre pressure and temperature monitoring, reported to the road | Mandatory on new EU trucks and heavy trailers (Regulation 2019/2144; all new registrations from July 2024) | A US field test was inconclusive on tyre failures |
| Powered sheeting for bulk loads | Covering is law in several US states and in Australia's Northern Territory; mature | None measured |
| Twist-lock status sensors for containers | Mostly patents; no mandate | None |
| Lashing-tension monitoring for open and curtain-sided loads | One product on the market (BPW iGurt); early | None |

- Inspections show how common poor securing is: cargo securement was 9.6 % and tyres 20.8 % of out-of-service violations in the North American Roadcheck 2024†; 44 % of vehicles in targeted load-securing checks in Flanders in 2024 were in violation (selective checks, so an overestimate).
- **No study was found that shows a reduction in incidents from any cargo-related device.** That is the gap load monitoring (D10) has to close before a truck can be exempted from the long gap behind it.

---

## Sources

Gathered by desk research on 2026-11-19. Items marked † are from secondary sources or could not be fully verified.

- Huijser et al. 2016, wildlife fence effectiveness; cited in Ford et al. 2022, *Frontiers in Conservation Science*: https://www.frontiersin.org/journals/conservation-science/articles/10.3389/fcosc.2022.935420/pdf
- Rytwinski et al. 2016 meta-analysis (summary): https://news.mongabay.com/2017/07/researchers-analyze-roadkill-mitigation-efforts
- Fence cost model (Huijser 2009, NCHRP)†: https://onlinepubs.trb.org/onlinepubs/nchrp/docs/NCHRP25-25Task68/section5.0-pages/mitigation-effectiveness.html
- PIARC, automatic incident detection: https://rno-its.piarc.org/en/network-monitoring-its-network-monitoring-vehicles-roadways/automatic-incident-detection
- ORR, stopped vehicle detection performance: https://www.orr.gov.uk/search-news/safety-improvements-plateau-englands-strategic-road-network
- Highways Magazine, SVD performance 2023–24: https://www.highwaysmagazine.co.uk/SVD-performance-worsening-new-data-suggests/14412
- Highways Magazine, SVD radar spacing: https://www.highwaysmagazine.co.uk/Highways-England-backtracks-on-SVD-spacing/8991
- Smart Motorway Safety Evidence Stocktake (DfT, 2020): https://assets.publishing.service.gov.uk/media/5fb67beae90e0720906df981/smart-motorway-safety-evidence-stocktake-and-action-plan.pdf
- Smart motorways, 2023 cancellation: https://en.wikipedia.org/wiki/Smart_motorway
- Runway debris radar: https://flightglobal.com/london-heathrow-airport-unveils-tarsier-fod-detection-system/80915.article, https://www.plextek.com/projects/mmwave-radar-for-foreign-object-debris-detection/†
- AAA 2022 AEB evaluation: https://newsroom.aaa.com/wp-content/uploads/2022/09/Research-Report-2022-AEB-Evaluation-FINAL-9-26-22.pdf
- Lost & Found obstacle dataset (2016): https://arxiv.org/pdf/1609.04653
- CAMP C-V2X latency tests (2019): https://pronto-core-cdn.prontomarketing.com/2/wp-content/uploads/sites/2896/2020/01/CAMP-CV2X_SAE_01152020.pdf
- CAMP/US DOT, EEBL latency requirement: https://www.nhtsa.gov/sites/nhtsa.dot.gov/files/camp3scr.pdf
- ENSEMBLE truck platooning: https://kivi.nl/_Resources/Persistent/f/2/7/1/f2713eae4c3d9f0b8a653ad7cf8344b301b2db19/ensemble-hoedemaeker-kivi.pdf
- AAA Foundation, road debris crashes 2011–14: https://aaafoundation.org/prevalence-motor-vehicle-crashes-involving-road-debris-united-states-2011-2014/
- UK obstruction lane impacts 2023†: https://www.directlinegroup.co.uk/en/news/brand-news/2024/211020240.html (no longer live: it redirected to aviva.com when checked on 2026-11-19)
- FHWA, animal-vehicle collisions: https://www.fhwa.dot.gov/publications/research/safety/08034/exec.cfm
- GB motorway casualty rate 2023†: https://www.autoexpress.co.uk/consumer-news/364466/its-official-motorways-are-safest-type-road ; DfT annual report 2023: https://www.gov.uk/government/statistics/reported-road-casualties-great-britain-annual-report-2023/reported-road-casualties-great-britain-annual-report-2023
- NHTSA, critical reasons for crashes (2015): https://crashstats.nhtsa.dot.gov/Api/Public/ViewPublication/812115
- Western Transportation Institute (fence length effect): https://westerntransportationinstitute.org/?p=6957
- SWOV, French EVA tunnel detection system: https://swov.nl/en/publicatie/autonomous-automatic-tunnel-incident-detection-equipment-using-video-image-processing
- Review of incident-detection systems (2026): https://www.preprints.org/manuscript/202608.0200
- ITV, 2022 SVD targets missed: https://www.itv.com/news/meridian/2022-12-15/smart-motorway-safety-targets-for-detecting-stranded-vehicles-missed
- Highways Magazine, 2023 SVD figures: https://www.highwaysmagazine.co.uk/Stopped-vehicle-detection-hits-targets-but-questions-remain-over-data-/13656
- RoSPA smart motorways factsheet: https://www.Rospa.com/getmedia/667a5ff2-3a66-4abb-857a-4c31940c6018/Smart-Motorways-Factsheet-revised-0224_3.pdf
- AIN 2024, FODetect: https://backend.ainonline.com/aviation-news/air-transport/2024-04-25/sensors-and-ai-combine-deal-foreign-object-debris
- SMART2 level-crossing lidar: https://cetra.grad.hr/ocs/index.php/cetra7/cetra2022/paper/download/1404/1014
- Railway Gazette, lidar at level crossings†: https://railwaygazette.com/technology/lidar-sensors-improve-traffic-flow-at-busy-level-crossing/60191.article
- Finnish ITS-G5 pilot†: https://itskrs.its.dot.gov/2025-b02002
- SECUR project, ITS-G5 latency: https://www.utac.com/fileadmin/files/SECUR_Project_%E2%80%93_Deliverables/SECUR-WP2-D2.1-Technical-Document-Report-ITSG5-based-on-802.11p.pdf
- Multi-hop hazard warnings (simulation): https://www.vehicomlab.unimore.it/site/home/publications/documento580078490.html
- ITS-G5 vs C-V2X highway field study: https://www.researchgate.net/publication/356398166
- Platooning headway and delay (simulation)†: https://www.es.mdu.se/pdf_publications/5621.pdf
- IPG Automotive 2024, platooning delay: https://www.ipg-automotive.com/fileadmin/data/know-how/publications/technical_articels_and_papers/2024/ATZhd_24-2_Platooning_sbi_EN.pdf
- Cummins/DOE truck platooning: https://www.osti.gov/servlets/purl/1861004
- UK Commons committee evidence, live-lane stops†: https://committees.parliament.uk/oralevidence/2213/pdf
- Rijkswaterstaat incident figures (ministry note, 2024): https://berthub.eu/tkconv/getraw/2025D04997
- Netherlands animal collisions (Jagersvereniging, 2021): https://www.jagersvereniging.nl/content/uploads/2021/11/Petitie-Op-weg-naar-meer-verkeersveiligheid-voor-mens-en-dier.pdf
- Items falling from commercial vehicles (BALI / National Highways): https://www.bali.org.uk/news/national-highways-seeking-to-tackle-load-insecurity/
- National Highways, objects removed in 2025: https://nationalhighways.co.uk/press/abandoned-boat-and-fairground-ride-among-more-than-49-000-items-found-alongside-motorways-and-a-roads
- FHWA, US traffic volumes 2015: https://www.fhwa.dot.gov/policyinformation/statistics/abstracts/2015/national.cfm

Added for appendix A5 (lost loads from trucks, 2026-11-19):

- DfT, road traffic estimates 2023, England's road networks: https://www.gov.uk/government/statistics/road-traffic-estimates-in-great-britain-2023/road-traffic-estimates-in-great-britain-2023-traffic-on-englands-road-networks
- MLIT Japan, objects on expressways, fiscal 2023–24: https://www.mlit.go.jp/road/sisaku/ijikanri/pdf/rakkabutu_nexco.pdf
- Vias institute 2025, load securing and road safety in Flanders (in Dutch): https://www.vias.be/publications/Impact%20van%20ladingzekering%20op%20de%20verkeersveiligheid%20in%20Vlaanderen/Impact%20van%20ladingzekering%20op%20de%20verkeersveiligheid%20in%20Vlaanderen.pdf
- ASFINAG call-outs 2023†: https://www.vienna.at/so-oft-waren-die-asfinag-teams-2023-im-einsatz/8525293
- AAA Foundation 2025, road debris 2018–2023: https://aaafoundation.org/wp-content/uploads/2026/01/202511-AAAFTS-Impact-Road-Debris.pdf
- US GAO, GAO-13-24 (2012): https://www.gao.gov/assets/gao-13-24.pdf
- Forbes & Robinson 2004, vehicle-related road debris (AAA Foundation): https://webharvest.gov/peth04/20041118034621/http://www.aaafoundation.org/pdf/vrrd.pdf
- NHTSA, Secure Your Load†: https://www.nhtsa.gov/drive-safe-secure-your-load
- ICCT 2018, heavy-duty trailers in Europe†: https://theicct.org/publications/market-analysis-hd-trailers-europe
- ACT Research, trailer types†: https://www.actresearch.net/resources/knowledge-center/what-is-the-composition-of-demand-of-trailer-types-for-the-commercial-trailer-market
- CVSA Roadcheck 2024†: https://cvsa.org/news/2024-roadcheck-results/
- HSA Ireland, curtain-sided vehicles: https://www.hsa.ie/eng/Vehicles_at_Work/Load_Securing/Guidance_and_Publications/Curtain_Sided_Info_Sheet.pdf
- WorkSafe NT, loose bulk loads: https://worksafe.nt.gov.au/forms-and-resources/safety-alerts/management-of-loose-bulk-loads
- Regulation (EU) 2019/2144, Annex II (tyre pressure monitoring): https://www.legislation.gov.uk/eur/2019/2144/annex/II/2020-12-31
- FMCSA tyre-pressure field test†: https://www.truckinginfo.com/105931/fmcsa-fleet-field-tests-show-promise-for-atis-tpms
- BPW iGurt lashing monitor: https://www.bpw.de/en/safety
