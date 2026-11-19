# SDR roadmap: further work and investigations

Status: proposals from the review of 2026-11-19 · nothing here is decided

These are ideas for what to do next, ordered by how much they could change the conclusions in [SDR-04](SDR-04-Viability-Assessment.md) and how cheap they are to try. Each item says why it matters, what to do and when it counts as done. The sizes are rough guesses: **S** is a few hours, **M** a day or two, **L** weeks or work that needs outside data or hardware.

## Overview

| # | Item | Size | Could change |
|---|---|---|---|
| 1.1 | Gate waits below capacity | S | Delay and fairness results |
| 1.2 | A cheaper truck rule | M | The capacity gain (D1) |
| 1.3 | Hybrid at its best speed | S | The capacity gain |
| 1.4 | Tighter statistics | S | Which differences are real |
| 2.1 | Fit today's road to detector data | L | Every comparison |
| 2.2 | Sensitivity of the SDR assumptions | M | Confidence in all SDR figures |
| 2.3 | Realistic radio loss | M | The radio requirement (D6) |
| 2.4 | Sensor false alarms and shared misses | M | The sensing requirement (D9) |
| 2.5 | Check the pile-up on today's road | M | The safety comparison |
| 2.6 | A policy for ice | S | Weather results |
| 2.7 | More road layouts | M–L | How general the results are |
| 3.1–3.4 | Engineering hygiene | S–M | Nothing; it keeps the rest reliable |
| 4 | Beyond the simulator | L | Viability as a whole |

---

## 1. First: questions the latest results raise

### 1.1 Gate waits below capacity (S)

- **Why:** at 4,800 + 900 veh/h the hybrid serves 5,131 veh/h and the longest gate wait is about 11 minutes. It can carry 5,880, and today's road serves 5,261 at that demand. The admission control seems to hold traffic back more than it needs to.
- **Do:**
  - record waits per gate (main entry and on-ramp) as a distribution: median, 95th percentile and maximum;
  - find out who waits: trucks waiting for the right lanes, ramp vehicles waiting for a slot, or everyone;
  - test the occupancy budget (`budgetFactor`), the ramp-gate fairness cap (`rampMaxWait`) and the rule that keeps the right lane free for the ramp.
- **Done when:** the hybrid serves at least as much as today's road at every demand below its capacity, and the 95th-percentile wait is reported next to the mean delay.

### 1.2 A cheaper truck rule (M)

- **Why:** the absolute gap behind trucks removes lost-load collisions but costs 14 % of capacity at 10 % trucks and about 20 % at 20–30 %. From 20 % trucks the hybrid carries no more than today's road.
- **Do:** simulate these variants at 10, 20 and 30 % trucks, for capacity and for lost-load collisions:
  - the absolute gap only behind trucks whose load is not enclosed and monitored (decision D10), for several shares of such trucks;
  - a gap sized to the road's confirmation time (0.5–1 s) plus stopping distance, in place of the full brick-wall gap;
  - trucks following trucks at relative separation;
  - a truck-only lane.
- **Done when:** one variant keeps lost-load collisions at zero and stays above today's road at 20 % trucks, or it is clear that none does.

### 1.3 Hybrid at its best speed (S)

- **Why:** in theory the hybrid carries most at about 80 km/h (2,850 veh/h per lane, against 2,700 at 120 km/h). Adaptive speed was only tested with absolute separation.
- **Do:** run the demand sweep for hybrid and relative with `speedPolicy: 'adaptive'`.
- **Done when:** the trade between speed and capacity is in the results. If 80–100 km/h under pressure adds 5 % capacity, that is a cheap gain; if it adds nothing, the option can be dropped.

### 1.4 Tighter statistics (S)

- **Why:** some differences are smaller than their spread. A breakdown without a safety lane costs SDR 6.0 ± 11.3 vehicle-hours and today's road 15.4 ± 14.6. Relative separation at 20–30 % trucks varies by ±650 veh/h.
- **Do:**
  - report the difference between systems per seed (both roads already get the same traffic), with a confidence interval, not two separate means;
  - add seeds only for the rows where the interval includes zero.
- **Done when:** every comparison quoted in SDR-04 states whether it is outside the noise.

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

- **Why:** loss is modelled as independent per message. Real links fail in bursts and by location. The gap widening costs 7 % of capacity at 5 % loss, so it matters whether cheaper answers exist.
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

- **Why:** after a brick-wall stop, today's road had 33 collisions in 10 runs with impacts up to 102 km/h, against 8–9 for SDR. That result depends on one assumption: about 1.25 s of perception and reaction time for an unexpected event. It should not flatter SDR.
- **Do:** compare the number of vehicles per pile-up with real multi-vehicle motorway crash records, and vary the surprise delay.
- **Done when:** the pile-up size is within the range the records show, or the model is corrected.

### 2.6 A policy for ice (S)

- **Why:** on ice, relative separation keeps 85 km/h at close spacing, which SDR-04 calls a warning sign. The hybrid drops below today's road (3,500 against 4,040 veh/h).
- **Do:** test a brick-wall stop on ice under each policy, and a weather rule such as a lower speed cap or wider gaps as grip falls.
- **Done when:** there is a recommended ice rule with its capacity cost and its effect on impact speeds.

### 2.7 More road layouts (M–L)

- **Why:** every result comes from one 5 km corridor with one on-ramp and one exit.
- **Do:** add a second on-ramp, a weaving section, a lane drop and a longer corridor. Check that the safety lane works where it is interrupted at junctions, and whether a sensor outage at a merge always costs about 16 %.
- **Done when:** the headline figures are shown for at least three layouts.

---

## 3. Engineering hygiene

- **3.1 Check the UI in a real browser (S).** The review could only run the UI code against a stub page. Open it, try every control, then add an automated smoke test that loads the page and fails on any console error.
- **3.2 Run the tests on GitHub (S).** A GitHub Actions workflow that runs `node --test simulator/test` on every push, so a broken engine is caught before results are regenerated.
- **3.3 Split `engine.js` (M).** It is one file of about 1,300 lines holding the road, the SDR controllers, the vehicles and the human drivers. Separate files for the human model and the SDR control would make each easier to check. The browser must keep working without a build step.
- **3.4 Make results traceable (S).** Write the git commit and the full parameter set into `results.json`, so every table can be reproduced exactly later.

---

## 4. Beyond the simulator

These decide whether SDR is viable, and no amount of simulation settles them. Most are already named in [SDR-01](SDR-01-Concept-Architecture.md) §12; they are repeated here in the order the latest results suggest.

1. **Roadside sensing proof of concept.** Measure time-to-confirm and miss rate for pallet-, tyre- and deer-sized objects at 150 m, at night and in rain. The safety case needs 1 s; operating systems take 10–60 s. Still the decisive engineering question.
2. **System-failure risk.** Software faults, cyberattack and common-cause failures: the half of the safety case the risk model does not cover. A structured hazard analysis would be the first step.
3. **Economics with the new figures.** Cost per km for sensing, radio, fencing and the safety lane, against the benefits. With a capacity gain of about 9 % instead of 36 %, the case rests mainly on fewer crashes and reliable trip times, so those need to be valued.
4. **Load monitoring (D10).** How reliably can a truck, trailer or roof carrier detect that a load is leaving? Item 1.2 depends on the answer.
5. **Gate fairness rules.** Admission control tells some people "not now". Who waits, for how long, and can a traveller pay or book to avoid it (D5)? Item 1.1 gives the numbers; the rules are a policy question.
6. **Network layer.** Several corridors with trip booking and routing. A single corridor cannot show whether gates upstream simply move the queue somewhere else.
7. **Protocol specification.** The messages between vehicle and segment controller: plan, authority, acknowledgement, state, health, safe stop. Items 2.3 and the supervision rule in the simulator are inputs.
8. **Intersections and urban roads.** Where most of the value and most of the risk lie; untouched so far.

---

## Suggested order

1. Items 1.1, 1.3 and 1.4 together: small, and they settle what the simulator already hints at.
2. Item 1.2: it decides whether the recommended hybrid keeps a capacity gain on freight routes.
3. Items 3.1 and 3.2 alongside, so later changes stay safe.
4. Item 2.1 as soon as detector data is at hand: it underlies every comparison.
5. The rest of section 2 in any order, and section 4 in parallel where other people or hardware are needed.
