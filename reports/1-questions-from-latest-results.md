# Roadmap 1: First: questions the latest results raise

Date: 2026-11-19

## The short answer

The review of the simulator left four questions. Three are settled and one is settled on a condition.

- **Why do people wait so long at the SDR gates when the road is not full?** Because of a fault in the way vehicles merge from the on-ramp, not because of the gates. It is fixed. Below capacity nobody now waits more than 4 seconds, and the recommended hybrid carries about 12 % more than today's road (it was 9 %).
- **Is there a cheaper rule than a long gap behind every truck?** One rule holds up: no long gap behind trucks with an enclosed, monitored load. If at least half the trucks qualify, SDR carries more than today's road again on a road with 20 % trucks. It is only as safe as that monitoring, which nobody has measured. Everything else that was tried fails.
- **Does driving slower when the road fills up carry more traffic?** No. It adds 3 % at best and makes every trip longer. The option is dropped.
- **Which differences in the results are real?** Every comparison now comes with a margin of error, and the documents say which differences cannot be told from chance.

Two things came out that nobody asked for. On truck-heavy roads SDR does worse than reported: 9 % below today's road at 20 % trucks, not 2 %. And the long gap behind a truck only works if the road notices a lost load within half a second; the one second the design asks for is too slow.

## At a glance

| Sub-item | Status | Result in one line |
|---|---|---|
| 1.4 Tighter statistics | done | Every comparison is made run by run on the same traffic, with a 95 % interval; several earlier statements changed |
| 1.1 Gate waits below capacity | done | The waiting was on the on-ramp and came from a merge fault; fixed, and the hybrid now serves 5,687 veh/h where it served 5,131 (today's road: 5,261) |
| 1.3 Hybrid at its best speed | done, option dropped | A lower speed adds 3 % capacity at best, below the 5 % that would have made it worth having |
| 1.2 A cheaper truck rule | partly done | Exempting trucks with an enclosed, monitored load works from half the trucks up (+3 % against today's road at 20 % trucks), if such trucks really lose nothing; three other rules fail |

Terms used below. *Today's road* is a copy of the same road with only human drivers and the same traffic; it exists for comparison. *Hybrid* is the recommended SDR rule for the distance between vehicles: close following, except a long gap behind trucks, faulty vehicles and where road sensors are down. The long gap is a *brick-wall gap*: enough to stop even if the vehicle ahead stops dead. *veh/h* is vehicles per hour. Demand is written as main road + on-ramp, for example 4,800 + 900 veh/h.

---

## 1.4 Tighter statistics

**The question.** Some reported differences were smaller than their own spread. A breakdown without a safety lane cost SDR 6.0 ± 11.3 vehicle-hours and today's road 15.4 ± 14.6: is that a difference or not? This item was done first, because the other three report with it.

**What was done.** Both roads, and every variant, already get exactly the same traffic in a run. The results now use that: two rows are compared run by run, and the average difference gets a 95 % confidence interval. If the interval does not include zero, the difference is called *outside the noise*; otherwise *within the noise*. A comparison within the noise is run more often, once: 15 runs instead of 5 for traffic flow, 30 instead of 10 for incidents. The results end with a new section that lists every comparison (more than 500).

**What came out.** Most statements stand. These changed:

- **A breakdown without a safety lane does cost SDR less.** Over 30 runs SDR loses 6 vehicle-hours and today's road 18; the difference is 12 (interval 5 to 19). Before, 10 runs could not settle it.
- **Below capacity the two roads carry the same traffic.** At 2,400 + 900 veh/h, and in dry and wet weather, the differences are within the noise.
- **For debris that the road sees, SDR's zero collisions cannot be told from today's road.** Today's road had 7 collisions in 30 runs; such objects are rarely hit at all, so even 30 runs do not separate 0 from 7.
- **Platoon breaks stay rejected.** A long gap every so many vehicles changed nothing in the collisions after a sudden stop, at any setting (30 runs each, all within the noise).
- **The wild spread of relative separation at 20–30 % trucks (±650 veh/h) was not noise.** It came from the merge fault of item 1.1 and is now ±110 to ±150.

One lesson came out of the method itself. "Run more only where the result is unclear" is lopsided: a result that looks clear after 10 runs is never checked again. The hybrid had 15 collisions in its first 10 sudden-stop runs and relative separation 6, which counted as a real difference. After 30 runs it was 27 against 23, no difference. Incident rows that are compared with a 30-run row now get 30 runs too.

**Finish line.** *"Every comparison quoted in SDR-04 states whether it is outside the noise."* Met. SDR-04 now says that every difference it quotes is outside the noise unless marked, marks the ones that are not, and has an appendix with the intervals behind its main statements.

---

## 1.1 Gate waits below capacity

**The question.** At 4,800 + 900 veh/h the hybrid served 5,131 veh/h and somebody waited 11 minutes at a gate. Yet it can carry about 6,000, and today's road served 5,261 at that demand. The gates seemed to hold traffic back for nothing. The roadmap named three settings to test.

**What was done.** First the waits were recorded per gate and per vehicle, to see who waits. Then one waiting vehicle was followed to see why. The rules were then changed one at a time, at three demands, 5 runs each, each step compared with the old rules and with today's road.

**What came out.** The people waiting were on the on-ramp. Of the 900 vehicles an hour arriving there, 338 got in. The main entry had no queue at all. There were two causes, and neither was one of the three settings:

1. **A fault in the merge.** The road gives every on-ramp vehicle a place in the right lane before it gets there, and the traffic in that lane opens a gap for it. A vehicle that ran slightly late was then told to stay behind the wrong point on the road. It braked, ran later still, and lost its gap. A few such vehicles blocked the ramp.
2. **A gate that only delayed.** The ramp gate let a vehicle go when it predicted a free place at the merge, or after 45 seconds. The prediction came true for about 1 vehicle in 100, so everybody waited 45 seconds, also on an empty road.

| Main demand (veh/h) | | Served (veh/h) | Wait at the on-ramp: half wait less than / 95 % wait less than |
|---|---|---|---|
| 3,600 | Before | 4,319 | 102 s / 207 s |
| | After | 4,507 | 0 s / 2 s |
| | Today's road | 4,477 | 0 s / 4 s |
| 4,800 | Before | 5,131 | 329 s / 631 s |
| | After | 5,687 | 0 s / 2 s |
| | Today's road | 5,261 | 0 s / 9 s |
| 7,200 (over capacity) | Before | 5,882 | 422 s / 813 s |
| | After | 6,038 | 3 s / 33 s |
| | Today's road | 5,395 | 15 s / 45 s |

At 4,800 + 900 the gain of 556 veh/h is outside the noise (interval 471 to 641), and so is the 426 veh/h over today's road (255 to 598). Fixing the merge alone gives nearly all of it.

The three settings from the roadmap hardly matter. The limit on how full the road may get does nothing below capacity. The 45-second limit was the only thing that let ramp traffic in at all. Keeping the right lane free for ramp traffic is worth keeping: without it the hybrid carried about 5 % less when the road is full (5,765 against 6,038 veh/h; this pair was not compared run by run) and braked harder.

Three more things follow:

- **Over capacity, somebody still waits, and it is the main entry.** At 7,200 + 900 half the vehicles at the main entry wait about 3 minutes or more, on SDR (182 s) as on today's road (164 s). The on-ramp gets in almost at once on both. On today's road that is how merging works out; on SDR it is a choice nobody has made yet.
- **SDR brakes hard more often than before when the road is full:** 4 times per 1,000 vehicle-km instead of 0.3. Today's road: 72. The old figure was that low because hardly anybody was merging.
- **Absolute separation carries more than reported** (3,300 veh/h, was 2,700). Its ramp traffic was held back by the same fault. It is still 39 % below today's road.

**Finish line.**

- *"The hybrid serves at least as much as today's road at every demand below its capacity."* Met. At 2,400 + 900 the two are equal (2 veh/h apart, within the noise, 15 runs). At 3,600 + 900 the hybrid serves 2 % more and at 4,800 + 900 8 % more.
- *"The 95th-percentile wait is reported next to the mean delay."* Met. Every traffic-flow table in the results now has the median, the 95th percentile and the longest wait per gate, and SDR-04 has a table of them.

---

## 1.3 Hybrid at its best speed

**The question.** In theory a hybrid lane carries most at about 80 km/h: 2,850 veh/h against 2,700 at 120 km/h. Would slowing down when the road fills up be a cheap way to carry 5 % more?

**What was done.** The whole range of demands was run for hybrid and for relative separation with four speed rules: always 120 km/h, always 100, always 80, and "adaptive" (slow down only when queues build at the gates). 5 runs each, and 15 for every comparison that was within the noise, which was most of them.

**What came out.** The best case is 3 %.

| Road full (veh/h) | Speed rule | Hybrid: served, against 120 km/h | Hybrid: trip time, against 120 km/h |
|---|---|---|---|
| 6,000 + 900 | 100 km/h | +3 % (interval +88 to +233 veh/h) | +3 % (within the noise) |
| | 80 km/h | within the noise | +18 % |
| | adaptive | within the noise | +7 % |
| 7,200 + 900 | 100 km/h | within the noise | +4 % |
| | 80 km/h | +2 % (interval +30 to +237 veh/h) | +12 % |
| | adaptive | within the noise | +9 % |

Relative separation shows the same: +2 % at 100 km/h when the road is full, and nothing or a small loss at 80 km/h. When the road is not full, a lower speed carries exactly the same traffic and every trip over the 5 km takes 18 seconds longer at 100 km/h and 53 seconds longer at 80.

The theory holds for one lane in steady flow. On the corridor the limit is the merge and the trucks, and they do not get better at 80 km/h.

A lower speed does save energy: braking losses fall by a quarter when the road is full and by more than half when it is not. That may be worth something, but it is not capacity, and the simulator does not model air drag, which is the larger part of that story.

**Finish line.**

- *"The trade between speed and capacity is in the results."* Met: section 13 of the results.
- *"If 80–100 km/h under pressure adds 5 % capacity, that is a cheap gain; if it adds nothing, the option can be dropped."* It adds 3 % at best. Dropped as a way to gain capacity.

---

## 1.2 A cheaper truck rule

**The question.** The long gap behind every truck is what stops the vehicle behind from hitting a load that falls off. It is also expensive. This item depends on something outside the simulator: how far a truck can be trusted to know its load is secure (roadmap point 4.4). It was agreed at the start to treat that as an assumption and show what each answer would be worth.

**What was done.** Twelve rules were run at 10, 20 and 30 % trucks: 5 runs each for capacity and 10 for a lost load. The four ideas from the roadmap:

- **a.** no long gap behind trucks with an enclosed, monitored load, for 25, 50 and 75 % of trucks;
- **b.** a gap sized to the lost load and to the time the road needs to confirm it (0.5 or 1 second), for a load that stops dead and for one that slides to a stop;
- **c.** trucks follow trucks closely;
- **d.** a lane for trucks only.

In the lost-load tests only the road's sensors count; the car's own sensor is switched off. That is the hard case, chosen so that the gap is tested against the confirmation time.

**What came out.** First the starting point, which moved. With the merge fixed (item 1.1), the hybrid carries 4,467 veh/h at 20 % trucks against 4,895 on today's road: 9 % less, where the last report said 2 % less. At 30 % trucks it is 22 % less. The earlier run had let almost nobody in from the on-ramp at these truck shares, which flattered the figure.

At 20 % trucks (collisions: runs with a collision, out of 10):

| Rule | Served (veh/h) | Against today's road | Lost load stops dead, road confirms in 0.5 s | The same, 1 s |
|---|---|---|---|---|
| Long gap behind every truck (as it is) | 4,467 | −9 % | 0 | 10 |
| No truck rule | 5,577 | +14 % | 9 | 9 |
| a. 25 % of trucks exempt | 4,770 | −3 % | 0 | 8 |
| a. 50 % exempt | 5,047 | +3 % | 0 | 9 |
| a. 75 % exempt | 5,249 | +7 % | 0 | 9 |
| b. Stops dead, plus 0.5 s | 4,170 | −15 % | 0 | 1 |
| b. Stops dead, plus 1 s | 3,929 | −20 % | 0 | 0 |
| b. Slides, plus 0.5 s | 5,090 | +4 % | 10 | 10 |
| b. Slides, plus 1 s | 4,862 | 0 % (within the noise) | 9 | 9 |
| c. Trucks follow trucks closely | 4,541 | −7 % | 0 | 8 |
| d. Truck lane | 3,932 | −20 % | 0 | 9 |

- **Rule a works from about half the trucks.** With 50 % exempt the hybrid is 3 % above today's road (interval +62 to +242 veh/h), with 75 % it is 7 % above. In these tests the load falls off a truck that still has the long gap. If an exempt truck loses a load after all, the vehicle behind crashes in 9 or 10 of 10 runs. So the rule is exactly as safe as the claim "this truck cannot lose anything that stops a car".
- **Rule b cuts both ways.** Sized for a load that stops dead, the gap gets longer than today's, not shorter, and capacity falls further. Sized for a load that slides, it is cheap, and safe only if loads do slide: against a sliding load it had no collision in 10 runs, against one that stops dead it crashes nearly every time.
- **Rule c gains nothing that can be told from noise,** and when the vehicle behind the unlucky truck is itself a truck, it crashed in 6 of 10 runs.
- **Rule d, the truck lane, carries less than the rule it should replace.** The right lane is also where traffic gets on and off, and one lane of trucks at long gaps carries about 1,000 trucks an hour. Part of this is a shortcoming of the simulator (see limits).

**The finding nobody asked for.** Look at the last column of the first row. The long gap as it is today covers the distance to stop, but not the distance driven while the road is still deciding that there is an object. With half a second to confirm, the vehicle behind never hit the load. With one second, which is what design decision D9 asks for, it hit the load in 10 of 10 runs, at up to 47 km/h. Only the gap that includes a full second had no collision in any test, and it costs another 12 % of capacity at 20 % trucks.

**Finish line.** *"One variant keeps lost-load collisions at zero and stays above today's road at 20 % trucks, or it is clear that none does."* Partly met.

- Rule a with at least half the trucks exempt does both, in the tests as specified: 0 collisions in 10 runs and 3–7 % above today's road.
- It holds on two conditions the simulator cannot check: exempt trucks really lose nothing dangerous, and the road confirms a lost load within half a second.
- With one second to confirm, no rule does both.

**What is known about lost loads.** During this item a search was made for data on how often trucks lose loads and what could prevent it. In short (details and sources in SDR-03, appendix A5; most figures are from secondary sources and were not checked against the originals):

- Nobody records which kind of vehicle an object came from. Trucks probably shed 30–50 % of the objects that block a lane while driving about 11 % of the kilometres: roughly 350 events per billion truck-km, about five times the rate of cars.
- About half of what trucks lose is cargo and half is tyres and vehicle parts. An enclosed body stops the first half only. So "enclosed" is not enough to exempt a truck; its tyres and wheels have to be monitored too.
- Things that could be made mandatory and built in: a rigid body with door sensing, tyre pressure and temperature monitoring reported to the road (already required on new trucks in the EU), powered covers for bulk loads, lock sensors for containers, strap-tension monitors for open loads.
- No study was found that shows any of these reducing lost loads. They are plausible, not proven.

---

## What it means together

**The verdict in SDR-04 stands, with different numbers.** SDR is still clearly better in how traffic flows, modestly better in how much the road carries, and plausibly better on safety.

- The capacity gain at 10 % trucks is 12 %, not 9 % (interval 5 to 19 %).
- The complaint about gates is gone: below capacity nobody waits, and trip delay is lower than on today's road at every demand, not only when the road is busy.
- Truck-heavy roads are a bigger problem than reported: 9 % below today's road at 20 % trucks and 22 % below at 30 %.

**The items affected each other.** Fixing the merge (1.1) is what made the truck figures worse, so the answer to 1.2 matters more than when it was asked. The statistics (1.4) removed one false alarm (hybrid against relative after a sudden stop) and settled one old doubt (the cost of a breakdown).

**Design decisions.**

| Decision | Effect |
|---|---|
| D1, separation policy | The hybrid stays. Its truck rule gets a possible exemption for trucks that can vouch for their load. Platoon breaks stay rejected, now on 30 runs. |
| D9, roadside detection within 1 s | For a load falling off a truck, 1 s is too slow for the gap the hybrid keeps; 0.5 s works. Either D9 is tightened there, or the truck warns first (D10), or the gap grows (costing 5–8 % of capacity at 10 % trucks). Open: roadmap 1.5. |
| D10, load monitoring | It was a safety extra. It now also decides whether SDR beats today's road on freight routes. It is the least proven link. |
| D5, trip booking, and fairness | When the road is full the main entry waits and the on-ramp does not. SDR could choose otherwise. A policy question: roadmap 4.5. |
| Speed under pressure | Not a decision in SDR-01, but an efficiency mechanism it lists: adds no capacity worth having. |

**Documents changed.** SDR-04 was revised throughout (figures, a section on truck rules, a new gate-wait table, an appendix of intervals). SDR-03 has the new collision counts, the breakdown result and a research appendix on lost loads. SDR-01 has the new figures and one new merge rule. The README, the simulator's README and changelog, and the roadmap (status per item, two new items 1.5 and 1.6, item 2.8, notes under 3 and 4) are in line.

---

## Limits and open questions

- **One road layout, few runs.** Everything comes from one 5 km corridor with one on-ramp and one exit. Capacity figures are means of 5 runs; the 12 % has an interval of 5 to 19 %.
- **Today's road is at the low end of what handbooks give.** If a real road carries 6,000 veh/h, the hybrid's gain is zero (roadmap 2.1). This has not changed.
- **The truck-rule tests are the hard case.** Only road sensors count, and the load lands just in front of the next vehicle. A car that sees the load itself would avoid some of these crashes.
- **Whether a lost load stops dead or slides is unknown,** and it decides between a cheap rule and an expensive one.
- **The exemption for enclosed trucks is an assumption.** Roadmap point 4.4 is still open, and the research found no evidence either way.
- **The truck lane was tested in a simulator that counts vehicles for the whole road, not per lane,** so the truck lane overfills. A fair test needs that fixed first (new roadmap item 1.6).
- **The ramp gate cannot hold ramp traffic back when the road is full.** Its prediction does not work, so it is simply open. That is right below capacity; above it, it leaves the "who waits" question to chance.
- **The risk model was not re-run with the research figures.** Two of its inputs look off (new roadmap item 2.8).
- **Throughput rows have 5 or 15 runs,** so the same setup can show slightly different means in two tables (6,038 from 5 runs, 5,978 from 15). The comparisons are not affected. About one comparison in twenty that is close to the boundary will be on the wrong side by chance.
- **The simulator's page in the browser** was only checked for loading and running with the new rules. The new truck-rule options have no controls there.

Proposed follow-ups, all in the roadmap and none started: 1.5 (the truck gap against the confirmation time), 1.6 (a truck lane with its own admission rules), 2.8 (risk-model inputs), 3.5 (the same number of runs in every row), 3.6 (looking more than one vehicle ahead), and the notes under 4.4 and 4.5.

---

## How to repeat it

Node 18 or later; nothing to install. From the project folder:

```powershell
node --test simulator/test
```

runs the 21 regression tests (about a minute).

```powershell
node simulator/experiments.js
```

runs everything (about 70 minutes on 14 cores) and writes `simulator/results/results.md` and `results.json`. To run only this item's experiments:

```powershell
node simulator/experiments.js --only=gates,speed,truck-rule
```

| Sub-item | Where the numbers are in `simulator/results/results.md` |
|---|---|
| 1.4 | Section 15, "Which differences are real" |
| 1.1 | Section 12, "Gate and merge rules", and the wait columns of section 1 |
| 1.3 | Section 13, "Speed under pressure" |
| 1.2 | Section 14, "Cheaper truck rules", and section 10, "Truck share" |

```powershell
node simulator/risk-model.js
```

regenerates the risk table in `simulator/results/risk-model.md` from the latest results.
