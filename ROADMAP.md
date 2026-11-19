# SDR roadmap: further work and investigations

Status: proposals from the review of 2026-11-19 · nothing here is decided · section 1 worked through on 2026-11-19 ([report](reports/1-questions-from-latest-results.md))

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
| 2.1 | Fit today's road to detector data | L | Every comparison | open |
| 2.2 | Sensitivity of the SDR assumptions | M | Confidence in all SDR figures | open |
| 2.3 | Realistic radio loss | M | The radio requirement (D6) | open |
| 2.4 | Sensor false alarms and shared misses | M | The sensing requirement (D9) | open |
| 2.5 | Check the pile-up on today's road | M | The safety comparison | open |
| 2.6 | A policy for ice | S | Weather results | open |
| 2.7 | More road layouts | M–L | How general the results are | open |
| 2.8 | Risk-model inputs from the lost-load research | S | The object-risk figures | open (new) |
| 3.1–3.6 | Engineering hygiene | S–M | Nothing; it keeps the rest reliable | open |
| 4 | Beyond the simulator | L | Viability as a whole | open |

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

### 2.2 Sensitivity of the SDR assumptions (M)

- **Why:** the SDR figures rest on assumed values: 8 m/s² braking, 0.2 s actuator delay, 0.1 s control cycle, 50 ms latency, 2.5 m margin, 120 m guardian range. Nobody has checked which of them the conclusions depend on.
- **Do:** vary each one over a plausible range and record capacity and brick-wall collisions.
- **Done when:** there is a table showing which assumptions move the result by more than 5 %, so those can be argued about first.

### 2.3 Realistic radio loss (M)

- **Why:** loss is modelled as independent per message. Real links fail in bursts and by location. The gap widening costs 6 % of capacity at 5 % loss, so it matters whether cheaper answers exist.
- **Do:**
  - model bursts and a local outage, not only random loss;
  - compare gap widening with sending every authority twice or over a second channel (D6 already requires two paths);
  - sweep the tolerance (`lossTolerance`) to show the trade between capacity and full-force braking;
  - make a lane-change grant wait until the new follower has acknowledged it. Today the simulator does not, which is a known gap.
- **Done when:** D6 can state a required delivery rate with its capacity cost.

### 2.4 Sensor false alarms and shared misses (M)

- **Why:** detection is one probability and one delay. A false alarm costs capacity through needless stops. Cars missing the same object for the same reason (low, dark, at night) would make car sensors worth less than modelled.
- **Do:** add a false-alarm rate per sensor and a shared-miss probability, then find the operating point.
- **Done when:** D9 has a false-alarm budget next to its 1 s confirmation time.

### 2.5 Check the pile-up on today's road (M)

- **Why:** after a brick-wall stop, today's road had 33 collisions in 10 runs with impacts up to 102 km/h, against 5–8 for SDR. That result depends on one assumption: about 1.25 s of perception and reaction time for an unexpected event. It should not flatter SDR.
- **Do:** compare the number of vehicles per pile-up with real multi-vehicle motorway crash records, and vary the surprise delay.
- **Done when:** the pile-up size is within the range the records show, or the model is corrected.

### 2.6 A policy for ice (S)

- **Why:** on ice, relative separation keeps 85 km/h at close spacing, which SDR-04 calls a warning sign. The hybrid drops below today's road (3,580 against 3,960 veh/h).
- **Do:** test a brick-wall stop on ice under each policy, and a weather rule such as a lower speed cap or wider gaps as grip falls.
- **Done when:** there is a recommended ice rule with its capacity cost and its effect on impact speeds.

### 2.7 More road layouts (M–L)

- **Why:** every result comes from one 5 km corridor with one on-ramp and one exit.
- **Do:** add a second on-ramp, a weaving section, a lane drop and a longer corridor. Check that the safety lane works where it is interrupted at junctions, and whether a sensor outage at a merge always costs about 17 %.
- **Done when:** the headline figures are shown for at least three layouts.

### 2.8 Risk-model inputs from the lost-load research (S) — new

- **Why:** the risk model assumes 120 lane-blocking objects per billion vehicle-km and that 70 % of falling loads come off trucks. A search for data during item 1.2 (sources in the [report](reports/1-questions-from-latest-results.md)) suggests about 140 objects per billion vehicle-km on England's network in 2023, and a truck share of 30–50 %: no road authority records which kind of vehicle an object came from, so the 70 % has no source. About half of what trucks shed is tyre and vehicle parts, which an enclosed body does not stop.
- **Do:** replace the two inputs with ranges, show how far scenario C and D move, and say which input matters most.
- **Done when:** the risk table in SDR-03 gives a range per scenario, with the sources for each input.

---

## 3. Engineering hygiene

- **3.1 Check the UI in a real browser (S).** The review could only run the UI code against a stub page. Open it, try every control, then add an automated smoke test that loads the page and fails on any console error.
- **3.2 Run the tests on GitHub (S).** A GitHub Actions workflow that runs `node --test simulator/test` on every push, so a broken engine is caught before results are regenerated.
- **3.3 Split `engine.js` (M).** It is one file of about 1,300 lines holding the road, the SDR controllers, the vehicles and the human drivers. Separate files for the human model and the SDR control would make each easier to check. The browser must keep working without a build step.
- **3.4 Make results traceable (S).** Write the git commit and the full parameter set into `results.json`, so every table can be reproduced exactly later.
- **3.5 Same number of runs in every row of a table (S; costs run time).** Since item 1.4, rows that needed more runs have 15 where their neighbours have 5, so the same setup can show slightly different means in two tables (the hybrid at 7,200 + 900 veh/h: 6,038 from 5 runs, 5,978 from 15). Comparisons are made per seed and are not affected, and incident rows are already evened out. Doing the same for throughput rows roughly doubles the run time of the suite (now 70 minutes).
- **3.6 The merge looks one vehicle ahead (S–M).** An authority is set against the first vehicle ahead. When that vehicle pulls out and a truck is next, the longer gap applies at once. With a confirmation time in the truck gap the road already looks two vehicles ahead; the general rule (plan against every vehicle within stopping distance) is not built.

---

## 4. Beyond the simulator

These decide whether SDR is viable, and no amount of simulation settles them. Most are already named in [SDR-01](SDR-01-Concept-Architecture.md) §12; they are repeated here in the order the latest results suggest.

1. **Roadside sensing proof of concept.** Measure time-to-confirm and miss rate for pallet-, tyre- and deer-sized objects at 150 m, at night and in rain. The safety case needs 1 s; operating systems take 10–60 s. Still the decisive engineering question.
2. **System-failure risk.** Software faults, cyberattack and common-cause failures: the half of the safety case the risk model does not cover. A structured hazard analysis would be the first step.
3. **Economics with the new figures.** Cost per km for sensing, radio, fencing and the safety lane, against the benefits. With a capacity gain of about 12 % instead of 36 %, the case rests mainly on fewer crashes and reliable trip times, so those need to be valued.
4. **Load monitoring (D10).** How reliably can a truck, trailer or roof carrier detect that a load is leaving? Item 1.2 depends on the answer, and now says what the answer is worth: if half the trucks can be trusted not to shed anything that stops a car, the hybrid keeps a capacity gain at 20 % trucks. What 1.2 found on the way (details and sources in the [report](reports/1-questions-from-latest-results.md)):
   - nobody measures it today: no study shows that any cargo-securing device reduces lost loads, and no road authority records which kind of vehicle an object came from;
   - an enclosed, rigid body with door sensing stops cargo from leaving, but about half of what trucks shed is tyres and vehicle parts, so "enclosed" alone is not enough to exempt a truck: tyre-pressure and wheel monitoring reported to the road has to be part of it;
   - whether a lost load stops dead or slides decides how long the gap has to be (a load sliding at 6 m/s² needs no more than the relative gap), and nobody has measured that either.
5. **Gate fairness rules.** Admission control tells some people "not now". Who waits, for how long, and can a traveller pay or book to avoid it (D5)? Item 1.1 gives the numbers; the rules are a policy question. One of them is now concrete: above capacity the on-ramp gets in almost at once (median wait 3 s) while the main entry waits about three minutes. Today's road does the same (15 s against 164 s), because merging traffic takes its turn at the merge and the queue forms upstream. SDR could choose differently; the ramp gate that would do it does not work yet (its slot prediction almost never finds a slot).
6. **Network layer.** Several corridors with trip booking and routing. A single corridor cannot show whether gates upstream simply move the queue somewhere else.
7. **Protocol specification.** The messages between vehicle and segment controller: plan, authority, acknowledgement, state, health, safe stop. Items 2.3 and the supervision rule in the simulator are inputs.
8. **Intersections and urban roads.** Where most of the value and most of the risk lie; untouched so far.

---

## Suggested order

1. ~~Items 1.1, 1.3 and 1.4 together~~ and ~~item 1.2~~: worked through on 2026-11-19.
2. Item 1.5: small, and it touches the safety case (the truck gap against a 1 s confirmation time).
3. Items 3.1 and 3.2 alongside, so later changes stay safe.
4. Item 2.1 as soon as detector data is at hand: it underlies every comparison.
5. The rest of section 2 in any order, and section 4 in parallel where other people or hardware are needed.
