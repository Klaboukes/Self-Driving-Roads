# SDR roadmap: further work and investigations

Status: proposals from the review of 2026-11-19 · nothing here is decided · section 1 worked through on 2026-11-19 ([report](reports/1-questions-from-latest-results.md)) · section 2 worked through on 2026-11-19 and 20 ([report](reports/2-make-the-model-more-trustworthy.md)) · section 6 added on 2026-11-20

These are ideas for what to do next, ordered by how much they could change the conclusions in [SDR-04](SDR-04-Viability-Assessment.md) and how cheap they are to try. Each item says why it matters, what to do and when it counts as done. The sizes are rough guesses: **S** is a few hours, **M** a day or two, **L** weeks or work that needs outside data or hardware.

## Overview

| # | Item | Size | Could change | Status |
|---|---|---|---|---|
| 1.1 | Gate waits below capacity | S | Delay and fairness results | done |
| 1.2 | A cheaper truck rule | M | The capacity gain (D1) | partly done |
| 1.3 | Hybrid at its best speed | S | The capacity gain | done (option dropped) |
| 1.4 | Tighter statistics | S | Which differences are real | done |
| 1.5 | The truck gap and the confirmation time | S | The sensing requirement (D9), the truck rule (D1) | open (new) |
| 1.6 | A truck lane with its own admission rules | M | The capacity gain on freight routes | open (new) |
| 2.1 | Fit today's road to detector data | L | Every comparison | partly done |
| 2.2 | Sensitivity of the SDR assumptions | M | Confidence in all SDR figures | done |
| 2.3 | Realistic radio loss | M | The radio requirement (D6) | done |
| 2.4 | Sensor false alarms and shared misses | M | The sensing requirement (D9) | done |
| 2.5 | Check the pile-up on today's road | M | The safety comparison | partly done |
| 2.6 | A policy for ice | S | Weather results | done |
| 2.7 | More road layouts | M–L | How general the results are | partly done |
| 2.8 | Risk-model inputs from the lost-load research | S | The object-risk figures | done |
| 2.9 | Today's drivers: capacity drop and swerving | M | Every comparison, the safety comparison | open (new) |
| 2.10 | Layouts that need new geometry | M–L | How general the results are | open (new) |
| 3.1–3.7 | Engineering hygiene | S–M | Nothing; it keeps the rest reliable | open |
| 4 | Beyond the simulator | L | Viability as a whole | open |
| 5.1 | Energy per vehicle-km | M | The environmental case | open (new) |
| 5.2 | The slipstream in close formations | M | The environmental case, the truck rule (D1) | open (new) |
| 5.3 | Ride comfort | S–M | The comfort case, the control law | open (new) |
| 6.1 | Which safety criterion SDR uses | S–M | The truck rule (D1), the capacity gain on freight routes | open (new) |
| 6.2 | Coordinated braking and shorter gaps | M–L | The capacity ceiling, the brick-wall risk | open (new) |

---

## 1. First: questions the latest results raise

### 1.1 Gate waits below capacity (S)

- **Why:** at 4,800 + 900 veh/h the hybrid serves 5,131 veh/h and the longest gate wait is about 11 minutes. It can carry 5,880, and today's road serves 5,261 at that demand. The admission control seems to hold traffic back more than it needs to.
- **Do:**
  - record waits per gate (main entry and on-ramp) as a distribution: median, 95th percentile and maximum;
  - find out who waits: trucks waiting for the right lanes, ramp vehicles waiting for a slot, or everyone;
  - test the occupancy budget (`budgetFactor`), the ramp-gate fairness cap (`rampMaxWait`) and the rule that keeps the right lane free for the ramp.
- **Done when:** the hybrid serves at least as much as today's road at every demand below its capacity, and the 95th-percentile wait is reported next to the mean delay.
- **Status (2026-11-19): done.** The people waiting were on the on-ramp, and the cause was a fault in the merge order plus a ramp gate that was in effect a 45-second timer; the three settings named above hardly mattered. With both fixed the hybrid serves 5,687 veh/h at 4,800 + 900 (today's road 5,261) and nobody waits more than 4 s below capacity. See the [report](reports/1-questions-from-latest-results.md).

### 1.2 A cheaper truck rule (M)

- **Why:** the absolute gap behind trucks removes lost-load collisions but costs 14 % of capacity at 10 % trucks and about 20 % at 20–30 %. From 20 % trucks the hybrid carries no more than today's road.
- **Do:** simulate these variants at 10, 20 and 30 % trucks, for capacity and for lost-load collisions:
  - the absolute gap only behind trucks whose load is not enclosed and monitored (decision D10), for several shares of such trucks;
  - a gap sized to the road's confirmation time (0.5–1 s) plus stopping distance, in place of the full brick-wall gap;
  - trucks following trucks at relative separation;
  - a truck-only lane.
- **Done when:** one variant keeps lost-load collisions at zero and stays above today's road at 20 % trucks, or it is clear that none does.
- **Status (2026-11-19): partly done.** One variant passes, on an assumption that point 4.4 still has to prove: no long gap behind trucks with an enclosed, monitored load. If at least half the trucks qualify, the hybrid carries 3 % more than today's road at 20 % trucks (7 % more at three-quarters), with no lost-load collisions as long as the exempted trucks really lose nothing. A gap sized to the confirmation time, trucks following trucks closely and a truck lane all fail: they are below today's road or have collisions. See the [report](reports/1-questions-from-latest-results.md).

### 1.3 Hybrid at its best speed (S)

- **Why:** in theory the hybrid carries most at about 80 km/h (2,850 veh/h per lane, against 2,700 at 120 km/h). Adaptive speed was only tested with absolute separation.
- **Do:** run the demand sweep for hybrid and relative with `speedPolicy: 'adaptive'`.
- **Done when:** the trade between speed and capacity is in the results. If 80–100 km/h under pressure adds 5 % capacity, that is a cheap gain; if it adds nothing, the option can be dropped.
- **Status (2026-11-19): done; the option is dropped as a capacity measure.** A lower speed limit adds 3 % at best (hybrid at 100 km/h and 6,000 + 900 veh/h) and makes every trip longer; adaptive speed adds nothing that can be told from noise. Lower speed does halve the energy lost in braking, which is a different question (air drag is not modelled). See the [report](reports/1-questions-from-latest-results.md).

### 1.4 Tighter statistics (S)

- **Why:** some differences are smaller than their spread. A breakdown without a safety lane costs SDR 6.0 ± 11.3 vehicle-hours and today's road 15.4 ± 14.6. Relative separation at 20–30 % trucks varies by ±650 veh/h.
- **Do:**
  - report the difference between systems per seed (both roads already get the same traffic), with a confidence interval, not two separate means;
  - add seeds only for the rows where the interval includes zero.
- **Done when:** every comparison quoted in SDR-04 states whether it is outside the noise.
- **Status (2026-11-19): done.** The results now end with a section that compares two rows per seed and gives the difference with its 95 % confidence interval; comparisons within the noise get more runs once (15 per throughput row, 30 per incident row). SDR-04 marks every comparison that is within the noise. See the [report](reports/1-questions-from-latest-results.md).

### 1.5 The truck gap and the confirmation time (S) — new, from 1.2

- **Why:** the long gap behind a truck was tested with road sensors that confirm an object in 0.5 s. Decision D9 asks for "within about 1 s". With 1 s, and the road sensors as the only witness, the vehicle behind the truck hit a load that stops dead in 10 of 10 runs, at up to 47 km/h. The gap covers the stopping distance but not the distance driven while the road is still confirming.
- **Do:**
  - sweep the confirmation time between 0.5 and 1 s to find where the rule as it is stops working;
  - decide who covers the difference: a faster D9 behind trucks, the truck's own load monitoring (D10) as first witness, or a gap that includes the confirmation time (`truckGapConfirm`; it costs 5–8 % of capacity at 10 % trucks and 7–12 % at 20 %);
  - repeat with the car's own sensor switched on, which these tests left out on purpose.
- **Done when:** D9 and D10 state the confirmation time the truck rule needs, with its capacity cost.
- **Note (2026-11-19, from 2.2 and 2.4):** the rule is tighter than it looked. Even at 0.5 s the gap covers the confirmation only through slack: harder car braking (10 m/s²), a faster control cycle, lower radio latency or a smaller margin each shrink the gap enough that lost-load collisions return (16–18 of 30 runs). And no road-only sensor reaches 99 % within 0.5 s at a sensible false-alarm rate, so for lost loads the cars' own sensors (shared) or the truck itself have to be the first witness. When the car sensors see the load and share it, there were no collisions even with a 2 s road confirmation. See the [report](reports/2-make-the-model-more-trustworthy.md).

### 1.6 A truck lane with its own admission rules (M) — new, from 1.2

- **Why:** the truck lane tested in 1.2 carries 12–23 % less than the rule it should replace. Part of that is real (one lane of trucks at brick-wall gaps carries about 1,000 trucks an hour, and the right lane is also where traffic gets on and off). Part is the simulator: admission control counts vehicles in the whole corridor, not per lane, so the truck lane overfills and the on-ramp cannot merge into it.
- **Do:** give admission control a budget per lane; let trucks use the second lane past the on-ramp and the exit; test with the truck lane on the left of the merge lane (a layout question for 2.7).
- **Done when:** the truck lane is either shown to carry more than the rule as it is at 20–30 % trucks, or dropped with the reason on record.

---

## 2. Then: make the model more trustworthy

### 2.1 Fit today's road to detector data (L)

- **Why:** the human baseline now matches handbook capacities, at their low end (about 5,400 veh/h on the corridor, where handbooks give 5,450–6,500). If a real road carries 6,000, the hybrid's capacity gain is zero. This is the largest remaining uncertainty in every comparison.
- **Do:** take loop-detector data from one real three-lane motorway section with an on-ramp. Open sources include NDW (Netherlands), WebTRIS (England) and PeMS (California). Fit the speed-flow curve, the flow per lane, the capacity before breakdown and the discharge flow after it.
- **Done when:** the baseline reproduces that section's speed-flow curve, and the comparison is re-run.
- **Status (2026-11-19): partly done; no real data was fitted.** Published figures put a real three-lane merge at about 6,400 veh/h before breakdown and 5,700 after it; the model carries 5,300. Making today's drivers follow closer raises that only to about 5,900 at 1.0 s, with many collisions, because the human merge model limits it and has no capacity drop. Against a real road the hybrid's gain is therefore between about +5 % (after breakdown) and −7 % (before it); relative separation keeps +12–26 %. A script that fits a detector file is ready (`simulator/fit-detector.js`). See the [report](reports/2-make-the-model-more-trustworthy.md).

### 2.2 Sensitivity of the SDR assumptions (M)

- **Why:** the SDR figures rest on assumed values: 8 m/s² braking, 0.2 s actuator delay, 0.1 s control cycle, 50 ms latency, 2.5 m margin, 120 m guardian range. Nobody has checked which of them the conclusions depend on.
- **Do:** vary each one over a plausible range and record capacity and brick-wall collisions.
- **Done when:** there is a table showing which assumptions move the result by more than 5 %, so those can be argued about first.
- **Status (2026-11-19): done.** Actuator delay, control cycle, radio latency, the safety margin and harder braking move capacity by more than 5 % (a 0.5 s actuator delay or a 0.5 s control cycle puts the hybrid below today's road); the guardian range moves it not at all. Only weaker brakes (6 m/s²) made brick-wall stops worse outside the noise (41 collisions in 30 runs against 25). But every variant that tightens the gap (harder braking, faster control, lower latency, smaller margin) brought lost-load collisions back (16–20 of 30 runs): the truck gap covers the 0.5 s confirmation only through slack, which item 1.5 has to fix. See the [report](reports/2-make-the-model-more-trustworthy.md).

### 2.3 Realistic radio loss (M)

- **Why:** loss is modelled as independent per message. Real links fail in bursts and by location. The gap widening costs 6 % of capacity at 5 % loss, so it matters whether cheaper answers exist.
- **Do:**
  - model bursts and a local outage, not only random loss;
  - compare gap widening with sending every authority twice or over a second channel (D6 already requires two paths);
  - sweep the tolerance (`lossTolerance`) to show the trade between capacity and full-force braking;
  - make a lane-change grant wait until the new follower has acknowledged it. Today the simulator does not, which is a known gap.
- **Done when:** D6 can state a required delivery rate with its capacity cost.
- **Status (2026-11-20): done.** How the losses come matters more than how many: 5 % random loss costs 6 % of capacity, the same loss in half-second bursts 24–70 %. Two paths with independent losses remove nearly all of it (1 % each: −1 %, within the noise), a common cause makes them no better than one, and sending twice over one path helps only against random loss. D6 now requires two independent paths that each deliver at least 99 %, with coverage planned so that no place loses both (a permanent dead spot stops traffic). A lane change now waits for the changer's and the new follower's acknowledgement (`laneChangeAck`, the new default); a fault in it that could jam a merge for good was found in the final run and fixed. No radio loss caused a collision. See the [report](reports/2-make-the-model-more-trustworthy.md).

### 2.4 Sensor false alarms and shared misses (M)

- **Why:** detection is one probability and one delay. A false alarm costs capacity through needless stops. Cars missing the same object for the same reason (low, dark, at night) would make car sensors worth less than modelled.
- **Do:** add a false-alarm rate per sensor and a shared-miss probability, then find the operating point.
- **Done when:** D9 has a false-alarm budget next to its 1 s confirmation time.
- **Status (2026-11-19): done.** At most 1 road false alarm per km per hour if a re-check clears it within 10 s, or 0.5 if it takes a minute, keeps the capacity cost below 1 %; false alarms caused no collision. A car's report must not close a lane on its own: reported car false targets are the largest cost (−3 % to −47 %). Shared misses do not make car sensors worth less as long as what they see is shared; they matter when the road misses the same objects. For a lost load the road alone is too slow at 1 s, as in item 1.5. A lane-change fault near a confirmed object was found and fixed on the way. See the [report](reports/2-make-the-model-more-trustworthy.md).

### 2.5 Check the pile-up on today's road (M)

- **Why:** after a brick-wall stop, today's road had 33 collisions in 10 runs with impacts up to 102 km/h, against 5–8 for SDR. That result depends on one assumption: about 1.25 s of perception and reaction time for an unexpected event. It should not flatter SDR.
- **Do:** compare the number of vehicles per pile-up with real multi-vehicle motorway crash records, and vary the surprise delay.
- **Done when:** the pile-up size is within the range the records show, or the model is corrected.
- **Status (2026-11-19): partly done.** The mean pile-up (2.4 vehicles at moderate traffic, 4.2 in dense traffic) is within the range of real multi-vehicle rear-end crashes, at its upper end, but pile-ups of five or more are too common, because the model's drivers never swerve. SDR has fewer collisions than today's road at every surprise delay tested (0.3–1.0 s), so the safety comparison does not rest on that assumption. The model is not corrected. See the [report](reports/2-make-the-model-more-trustworthy.md).

### 2.6 A policy for ice (S)

- **Why:** on ice, relative separation keeps 85 km/h at close spacing, which SDR-04 calls a warning sign. The hybrid drops below today's road (3,580 against 3,960 veh/h).
- **Do:** test a brick-wall stop on ice under each policy, and a weather rule such as a lower speed cap or wider gaps as grip falls.
- **Done when:** there is a recommended ice rule with its capacity cost and its effect on impact speeds.
- **Status (2026-11-19): done.** Recommended: the hybrid with a 60 km/h cap on ice. It carries 4,840 veh/h, 14 % more than today's road on ice (the hybrid without a cap carries 14 % less), and brick-wall impacts top out at 45 km/h instead of 69. Planning with less grip than measured costs half the capacity and is not worth it. With 20 % less grip than the road measured (black ice), SDR had no collisions in normal traffic. See the [report](reports/2-make-the-model-more-trustworthy.md).

### 2.7 More road layouts (M–L)

- **Why:** every result comes from one 5 km corridor with one on-ramp and one exit.
- **Do:** add a second on-ramp, a weaving section, a lane drop and a longer corridor. Check that the safety lane works where it is interrupted at junctions, and whether a sensor outage at a merge always costs about 17 %.
- **Done when:** the headline figures are shown for at least three layouts.
- **Status (2026-11-19): partly done.** Six layouts by parameter (2, 3 and 4 lanes, a short and a long acceleration lane, a 10 km corridor). The hybrid's gain comes from the merge: +26 % on two lanes, +11 % on three, +3 % on four. A sensor outage at the merge costs 34–36 % at saturation in every layout (the 17 % is at moderate demand). SDR had 69–77 % fewer brick-wall collisions in every layout. A second on-ramp, weaving, a lane drop and the safety lane at junctions need new road geometry and are still open. See the [report](reports/2-make-the-model-more-trustworthy.md).

### 2.8 Risk-model inputs from the lost-load research (S) — new

- **Why:** the risk model assumes 120 lane-blocking objects per billion vehicle-km and that 70 % of falling loads come off trucks. A search for data during item 1.2 (sources in the [report](reports/1-questions-from-latest-results.md)) suggests about 140 objects per billion vehicle-km on England's network in 2023, and a truck share of 30–50 %: no road authority records which kind of vehicle an object came from, so the 70 % has no source. About half of what trucks shed is tyre and vehicle parts, which an enclosed body does not stop.
- **Do:** replace the two inputs with ranges, show how far scenario C and D move, and say which input matters most.
- **Done when:** the risk table in SDR-03 gives a range per scenario, with the sources for each input.
- **Status (2026-11-19): done.** Each input has a low, central and high value with its source. The hybrid with SDR-grade sensing and load reporting rises from about 0.6 to about 3 collisions per billion vehicle-km (1.5–11), mostly because fewer lost loads come off trucks than assumed and half of what falls is tyres and parts. The ranking of the scenarios holds in all 64 combinations of inputs. See the [report](reports/2-make-the-model-more-trustworthy.md).

### 2.9 Today's drivers: capacity drop and swerving (M) — new, from 2.1 and 2.5

- **Why:** two gaps in the human driver model showed up in item 2. Real merges carry more before they break down than after (a capacity drop of 7–15 %); the model has no drop and breaks down at a lower flow than it then discharges. And real drivers swerve in an emergency (11 of 51 real shockwaves in one study had swerves); the model's drivers only brake, which makes pile-ups of five or more vehicles too common.
- **Do:** give the human merge model a capacity drop (for example a shorter accepted gap before breakdown and a slower departure from the queue after it), and an emergency lane change into a free adjacent lane. Recalibrate against the figures collected in 2.1 and 2.5, and against detector data once 2.1 has some.
- **Done when:** today's road shows a capacity before breakdown and a lower discharge, within the published ranges, and the share of pile-ups with five or more vehicles is within the records; the comparisons are re-run.

### 2.10 Layouts that need new geometry (M–L) — new, from 2.7

- **Why:** item 2.7 varied the corridor by its parameters only. A second on-ramp, a weaving section (an on-ramp shortly before an exit) and a lane drop need road geometry the simulator does not have; the safety lane where it is interrupted at junctions was not tested either.
- **Do:** add several ramps per corridor and a lane drop to the engine, then run the headline comparison and a brick-wall stop on each; test a breakdown next to a junction where the safety lane ends.
- **Done when:** the headline figures are shown for these layouts too, and the safety lane's behaviour at junctions is known.

---

## 3. Engineering hygiene

- **3.1 Check the UI in a real browser (S).** The review could only run the UI code against a stub page. Open it, try every control, then add an automated smoke test that loads the page and fails on any console error.
- **3.2 Run the tests on GitHub (S).** A GitHub Actions workflow that runs `node --test simulator/test` on every push, so a broken engine is caught before results are regenerated.
- **3.3 Split `engine.js` (M).** It is one file of about 1,300 lines holding the road, the SDR controllers, the vehicles and the human drivers. Separate files for the human model and the SDR control would make each easier to check. The browser must keep working without a build step.
- **3.4 Make results traceable (S).** Write the git commit and the full parameter set into `results.json`, so every table can be reproduced exactly later.
- **3.5 Same number of runs in every row of a table (S; costs run time).** Since item 1.4, rows that needed more runs have 15 where their neighbours have 5, so the same setup can show slightly different means in two tables (the hybrid at 7,200 + 900 veh/h: 6,002 from 5 runs, 5,957 from 15). Comparisons are made per seed and are not affected, and incident rows are already evened out. Doing the same for throughput rows roughly doubles the run time of the suite (now about 5 hours).
- **3.6 The merge looks one vehicle ahead (S–M).** An authority is set against the first vehicle ahead. When that vehicle pulls out and a truck is next, the longer gap applies at once. With a confirmation time in the truck gap the road already looks two vehicles ahead; the general rule (plan against every vehicle within stopping distance) is not built.
- **3.7 A core set of experiments (S).** The full suite now has 25 groups and takes 5–6 hours, and every change to the core forces a full re-run. Split it: a core set (demand sweep, truck share, brick-wall stop, lost load; about 30 minutes) run after every change to the core, and an extended set (weather, radio, layouts, false alarms, sensitivity and the rest) run at milestones. `--core` and `--extended` flags, or a list in `experiments.js`; the report says which set each section came from. Added 2026-11-19.

---

## 4. Beyond the simulator

These decide whether SDR is viable, and no amount of simulation settles them. Most are already named in [SDR-01](SDR-01-Concept-Architecture.md) §12; they are repeated here in the order the latest results suggest.

1. **Roadside sensing proof of concept.** Measure time-to-confirm and miss rate for pallet-, tyre- and deer-sized objects at 150 m, at night and in rain. The safety case needs 1 s; operating systems take 10–60 s. Still the decisive engineering question.
2. **System-failure risk.** Software faults, cyberattack and common-cause failures: the half of the safety case the risk model does not cover. A structured hazard analysis would be the first step.
3. **Economics with the new figures.** Cost per km for sensing, radio, fencing and the safety lane, against the benefits. With a capacity gain of about 11 % at best instead of 36 % (and between +5 % and −7 % against a real merge), the case rests mainly on fewer crashes and reliable trip times, so those need to be valued.
4. **Load monitoring (D10).** How reliably can a truck, trailer or roof carrier detect that a load is leaving? Item 1.2 depends on the answer, and now says what the answer is worth: if half the trucks can be trusted not to shed anything that stops a car, the hybrid keeps a capacity gain at 20 % trucks. What 1.2 found on the way (details and sources in the [report](reports/1-questions-from-latest-results.md)):
   - nobody measures it today: no study shows that any cargo-securing device reduces lost loads, and no road authority records which kind of vehicle an object came from;
   - an enclosed, rigid body with door sensing stops cargo from leaving, but about half of what trucks shed is tyres and vehicle parts, so "enclosed" alone is not enough to exempt a truck: tyre-pressure and wheel monitoring reported to the road has to be part of it;
   - whether a lost load stops dead or slides decides how long the gap has to be (a load sliding at 6 m/s² needs no more than the relative gap), and nobody has measured that either.
   - Since 2026-11-20 an enclosed, monitored body is required on every truck and trailer (SDR-01 §7, D10), so the question narrows: how often does an enclosed truck still shed something that stops a car, and how early do tyre and wheel monitoring see a tyre or wheel coming off? Item 6.1 depends on the answer.
5. **Gate fairness rules.** Admission control tells some people "not now". Who waits, for how long, and can a traveller pay or book to avoid it (D5)? Item 1.1 gives the numbers; the rules are a policy question. One of them is now concrete: above capacity the on-ramp gets in almost at once (median wait 3 s) while the main entry waits about three minutes. Today's road does the same (15 s against 164 s), because merging traffic takes its turn at the merge and the queue forms upstream. SDR could choose differently; the ramp gate that would do it does not work yet (its slot prediction almost never finds a slot).
6. **Network layer.** Several corridors with trip booking and routing. A single corridor cannot show whether gates upstream simply move the queue somewhere else.
7. **Protocol specification.** The messages between vehicle and segment controller: plan, authority, acknowledgement, state, health, safe stop. Items 2.3 and the supervision rule in the simulator are inputs.
8. **Intersections and urban roads.** Where most of the value and most of the risk lie; untouched so far.

---

## 5. Environment and comfort — new, 2026-11-19

Two factors added to the design principles after safety, efficiency and speed ([SDR-01](SDR-01-Concept-Architecture.md) §2, principles 11–16). They come last in priority, so they never buy back safety margin or capacity; but they are part of the case for SDR and have hardly been measured. What the simulator records today: hard brakes (stronger than 4 m/s²) per 1,000 vehicle-km, and the energy lost in braking, counted as if every vehicle weighed 1,500 kg.

### 5.1 Energy per vehicle-km (M)

- **Why:** SDR loses about half as much energy in braking as today's road (25–44 against 48–90 Wh per vehicle-km) and brakes hard 94–100 % less often. That is the only energy figure there is, and it leaves out most of the energy a vehicle uses. Above capacity SDR keeps traffic at about 100 km/h where today's road crawls at 60. Air drag per kilometre grows with the square of speed: for a typical car roughly 75 Wh/km at 100 km/h against 30 at 60 (an estimate, not modelled). That difference is about as large as the braking saving, so above capacity the net gain is unknown and could be negative. Electric vehicles recover a large part of their braking energy, which shrinks SDR's advantage further.
- **Do:**
  - give each vehicle type an energy model: rolling resistance, air drag, acceleration, drivetrain efficiency, and the share of braking energy recovered (a parameter: none for combustion engines, about 60 % for electric);
  - count the energy of vehicles waiting at a gate or standing in a queue;
  - report Wh per vehicle-km in the demand sweep, the truck-share sweep and the speed table (item 1.3), for a combustion and an electric fleet;
  - compare per seed with today's road, as in item 1.4.
- **Done when:** SDR-04 states the net energy difference per vehicle-km at each demand, for both fleets, with its interval, and says at which demand the higher speed eats the gain from smooth flow.

### 5.2 The slipstream in close formations (M)

- **Why:** a vehicle in the slipstream of the one ahead meets less air drag; truck-platooning trials report savings for the following truck at gaps of about 10–15 m. SDR's gaps are much longer than that: under relative separation about 30 m between bumpers at 100–120 km/h (from the gap formula in `engine.js`), and the hybrid keeps its longest gaps behind trucks, where the slipstream is largest. The gain at the gaps SDR actually keeps may be small, and shortening gaps for it would trade safety for energy.
- **Do:**
  - collect published figures for drag reduction as a function of the gap, per pair (car behind car, car behind truck, truck behind truck), and add them to the energy model of 5.1;
  - record the distribution of gaps per pair in the simulator, and report the slipstream saving at those gaps;
  - work out what lining up vehicles of the same type would save (the road chooses who follows whom at the merge and at lane changes), without shortening any gap;
  - state what shorter gaps would save, next to what they cost in safety, for when load monitoring (4.4) or the confirmation time (1.5) changes the gap behind trucks.
- **Done when:** the slipstream saving at SDR's gaps is known, and it is clear whether any ordering or gap rule is worth adopting for energy alone.

### 5.3 Ride comfort (S–M)

- **Why:** "sit back and enjoy the ride" is a promise of SDR, but only hard brakes are measured. Everyday smoothness (acceleration, jerk, lane changes) is not, and neither is how often the events SDR adds itself interrupt a trip: supervision brakes after lost messages (2.3), safe stops, guardian activations, stops for false alarms (2.4) and waiting at a gate. The SDR control law has no jerk limit that anyone has checked.
- **Do:**
  - record per trip the RMS acceleration (weighted as in ISO 2631-1 if practical), the largest jerk, lane changes per km, and the number of events above comfort limits (for example braking stronger than 2 m/s², jerk above 2 m/s³);
  - count the SDR-specific interruptions per 1,000 trips, by cause;
  - if SDR plans exceed the limits in normal traffic, add comfort limits to the control law (principle 15) and measure what they cost in capacity.
- **Done when:** there is a comfort table per system and demand, and SDR-04 says whether an SDR trip is smoother than today's in normal traffic, and how often an SDR trip is interrupted by a hard event.

---

## 6. The safety criterion and the capacity ceiling — new, 2026-11-20

The capacity gain is smaller than hoped: the hybrid carries 11 % more than today's road at 10 % trucks and less from 20 % trucks. Two questions follow. Is the one expensive safety rule, the long gap behind trucks, stricter than SDR needs to be? And what would it take to get well past +30 %, which even relative separation does not exceed on the corridor?

Both items assume that vehicles are built for SDR (decided 2026-11-20, [SDR-01](SDR-01-Concept-Architecture.md) §7). Every truck and trailer has an enclosed body with monitored doors, tyres and wheels. Every vehicle has coordinated braking. The questions are therefore what these features are worth and what they leave uncovered, not whether vehicles will have them.

### 6.1 Which safety criterion SDR uses (S–M)

- **Why:** the long gap behind trucks is the only safety rule that costs much capacity. Relative separation, which has no such gap, carries 31 % more than today's road at 10 % trucks (the hybrid 11 %) and 16 % more at 20 % trucks (the hybrid 9 % less). The rule follows from reading "safety first" as "safe against each foreseeable event". Today's drivers keep no such gap behind trucks, and the simulated today's road also hits lost loads. A different reading is possible: clearly safer than today overall, and no worse than today for any single kind of hazard. That is close to the "positive risk balance" the German ethics commission on automated driving asked for in 2017. Whether relative separation meets it is unknown. The risk model has relative separation only with today's detection (about 22 object collisions per billion vehicle-km, worse than human drivers at about 10). The row with SDR-grade sensing and vehicles reporting their own lost loads was never computed.

  With every truck enclosed (D10), this question gets narrower and sharper. Cargo should no longer fall off; what trucks still shed is tyres, wheels and other parts, which is about half of what they shed today. If that is not enough to justify the long gap behind trucks, the gap can go for every truck. The hybrid then follows trucks as relative separation does: +31 % at 10 % trucks, +16 % at 20 %, +3 % at 30 %.
- **Do:**
  - add risk-model rows for relative separation with SDR-grade sensing (≤1 s, V2V) and the SDR-Ready fleet: every truck enclosed, tyres and wheels monitored and reported, using the input ranges of item 2.8. Give the residual risk from tyres and parts separately, and how much tyre and wheel monitoring takes off it (a pressure loss is often reported before the tread leaves);
  - compare SDR and today's road per hazard (lost load, brick-wall stop, lying debris, breakdown) on the same measure: collisions and impact speeds per event in the simulator, collisions per billion vehicle-km in the risk model. The lost-load figures in SDR-04 are counted differently for the two roads (65 collisions in 30 runs for SDR without the truck gap, collisions in 28 of 30 runs for today's road), so count them the same way first;
  - write down both criteria and what each means for D1: "safe against each event" keeps the truck gap; "no worse per hazard, clearly safer overall" could drop it wherever the per-hazard comparison allows;
  - note what the second criterion asks of the public and of liability. A machine-run road will likely be judged more strictly than human drivers, and the road operator chose the gap, which a human driver did not.
- **Done when:** SDR-01 states which safety criterion SDR uses (the user's decision, not the simulator's), and SDR-04 shows per hazard whether relative separation with SDR-grade sensing meets "no worse than today", next to its capacity.

### 6.2 Coordinated braking and shorter gaps (M–L)

- **Why:** even without the truck gap the corridor gains about 30 %. The relative gap itself is only about 20 % shorter than a human's: about 38 m or 1.14 s at 120 km/h, against 1.4 s (`sdrGapTerms` in `engine.js`). It is made of:
  - about 9 m fixed: the car's length, the margin, position uncertainty and a control buffer;
  - about 15 m of reaction: 0.45 s of actuator delay, control cycle, radio latency and the allowance for a stale authority;
  - about 14 m of braking mismatch: each vehicle plans as if the vehicle ahead brakes 1.1 × its rated braking, while counting on only 0.9 × its own.

  None of this is about brick walls; it is the ordinary case of the vehicle ahead braking hard. A much larger gain needs much shorter gaps (truck-platooning trials run at about 0.3–0.5 s). Coordinated braking, now required in every SDR-Ready vehicle (D13), removes most of the last two terms:
  - a braking command sent to a string of vehicles at once (by the road or V2V), so followers start braking with the leader instead of after it;
  - a braking cap per string: no vehicle brakes harder than the weakest one behind it can match, except when its own guardian sees an obstacle.

  With about 0.15 s of reaction left and no mismatch, the gap would be about 14 m, or about 8,500 veh/h per lane in theory against about 3,150 (an estimate, not modelled). Two things limit this. Anything that stops a vehicle dead (a brick-wall stop, a lost load, a crash ahead) would then hit more vehicles, though at lower speed differences. And the merge, not the lane, limits the corridor (item 2.7), so the corridor would gain much less than the lane.
- **Do:**
  - add a coordinated braking mode to the engine: braking broadcast to a string of vehicles (with latency and the radio loss of item 2.3), a braking cap per string, string length bounded by platoon breaks (`platoonBreakEvery`), and a gap rule that uses them. The gap behind trucks keeps its own rule (items 1.5, 6.1);
  - run the demand sweep and the layouts of item 2.7, and find the gap at which the merge, not the gap, limits the corridor;
  - repeat the brick-wall stop, the lost load and a string member that brakes less than announced (a silent brake fault), and record collisions and impact speeds;
  - check the result against the criterion of item 6.1, and report the slipstream saving (item 5.2) at the shorter gaps.
- **Done when:** SDR-04 states how much capacity coordinated braking adds on the corridor, what it does to brick-wall and lost-load outcomes, and whether it meets the criterion of item 6.1.

---

## Suggested order

Agreed on 2026-11-19: **settle the foundations first, then the factors.** The incident, weather and radio tests are what decided the separation policy, so they stay in the model; but until the foundations below are settled they are re-run at milestones only, not after every change.

1. ~~Items 1.1, 1.3 and 1.4 together~~ and ~~item 1.2~~: worked through on 2026-11-19.
2. ~~Section 2~~: worked through on 2026-11-19 and 20, except the parts that need real data (2.1) or new road geometry (2.10).
3. **Foundations.** These decide whether the hybrid's capacity gain survives and whether its truck rule is safe:
   - item 2.9, then item 2.1 as soon as detector data is at hand: today's road as a real merge (the baseline every comparison rests on);
   - item 1.5: the confirmation time built into the gap behind trucks (section 2 showed it covers even 0.5 s only through slack).
4. **Alongside, so the foundation work is fast and safe:** item 3.7 (a 30-minute core set of experiments for every core change) and item 3.2 (tests on GitHub); item 3.1 with them.
5. **Then the factors again:** a full run of the extended set once the foundations are settled, and new factor work (2.10, 1.6, 3.6) after that.
6. Section 4 in parallel throughout, where other people or hardware are needed.
7. **Section 5 (environment and comfort)** can start at any time: it adds measurements and does not change how the road drives, except for a jerk limit if 5.3 finds one is needed. Item 5.1 first, since 5.2 builds on its energy model. Its tables belong in the extended set (3.7).
8. **Section 6 (safety criterion and capacity ceiling)**, added on 2026-11-20. The risk-model part of item 6.1 can start at any time, since it needs no engine change; the choice of criterion is the user's to make once the per-hazard comparison is there. Item 6.2 changes how the road drives, so it comes after the foundations (step 3) and the core set (3.7).
