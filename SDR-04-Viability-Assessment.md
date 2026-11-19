# Self Driving Road (SDR): Viability and efficiency assessment

Status: assessment, for discussion · 2026-11-19, revised twice the same day: after a review of the simulator, and after roadmap section 1
Based on: [SDR-01](SDR-01-Concept-Architecture.md) (architecture) and [SDR-03](SDR-03-Hybrid-Detection-Safety-Lane.md) (hybrid separation, detection layers, safety lane). It also replaces the first simulation report (SDR-02), which was retired when its figures were superseded.
Data: [simulator/results/results.md](simulator/results/results.md)

This answers the question *"How viable and efficient is SDR, based on the simulations?"*.

**What changed in the first revision (review).** The review found that the simulated today's road was too weak: it carried about 4,300 veh/h where a real three-lane motorway carries roughly 5,450–6,500. The human driver model was rebuilt and checked against handbook values ([CHANGELOG](simulator/CHANGELOG.md)). It now carries about 5,400 veh/h on the test corridor. The earlier headline, "+36 % throughput", was measured against the weak baseline and is withdrawn.

**What changed in the second revision (roadmap section 1, [report](reports/1-questions-from-latest-results.md)).**

- **A fault in the SDR merge was fixed, and the ramp gate no longer delays everybody.** The long waits at the gates below capacity are gone, and the hybrid carries about 12 % more than today's road instead of 9 %.
- **The figures for truck-heavy roads got worse.** The earlier run reached its figures at 20–30 % trucks by leaving the on-ramp unserved. With the ramp served, the hybrid carries 9 % less than today's road at 20 % trucks (was 2 % less).
- **Cheaper truck rules, and a lower speed under pressure, were tested** (section 1).
- **Every comparison is now made run by run on the same traffic,** with a 95 % confidence interval.

**How to read the figures.** A throughput figure is the mean of 5 runs and an incident figure the result of 10 runs. Where a difference could not be told from noise, the rows were run 15 and 30 times. Every difference quoted below is outside the noise (its interval does not include zero) unless it says "within the noise". The intervals behind the main statements are in the appendix; all of them are in section 15 of the results.

---

## Verdict

SDR is **clearly better in how traffic flows** and **modestly better in how much traffic the road carries**. It is **plausibly, but not yet provably, better on safety**.

- **Flow quality is the strong result.** When demand exceeds what today's road can carry, today's road drops to about 60 km/h in stop-and-go traffic. The SDR road keeps moving at about 100 km/h and the excess waits at the entry. Hard braking falls by 94–100 %. Trip delay is lower at every demand.
- **Capacity is a smaller gain than first reported, and it depends on trucks.** With 10 % trucks the recommended hybrid carries about 12 % more than today's road (the interval is 5–19 %). With no trucks it carries 29 % more. With 20 % trucks it carries 9 % less and with 30 % trucks 22 % less, because the hybrid keeps a brick-wall gap behind every truck.
- **One way to limit that cost holds up, and it rests on load monitoring.** If trucks with an enclosed, monitored load need no long gap behind them, and at least half the trucks qualify, the hybrid carries more than today's road at 20 % trucks again. A gap sized to the confirmation time, trucks following trucks closely, a truck lane and a lower speed do not help.
- **Below today's capacity both roads carry all the traffic.** SDR does it with less delay (11 s against 29 s at 3,600 + 900 veh/h) and nobody waits at a gate.
- **Separation and sensing are one decision.** Close following is only safe if objects on the road are seen within about a second, which is much faster than any roadside system in operation today. Behind a truck, one second is already too slow for the gap the hybrid keeps.

On motorways, with 100 % of vehicles guided, I rate SDR **technically viable, and worthwhile mainly for reliability and safety**, provided three things hold:

1. the recommended hybrid separation is adopted (D1), with the long gap limited to trucks that cannot vouch for their load;
2. roadside sensing confirms objects within about 1 s (D9), and a load falling off a truck within about 0.5 s, or the truck reports it itself;
3. vehicles report their own lost loads (D10).

---

## 1. Efficiency

Measured on the simulated corridor (3 lanes, on-ramp, exit, 10 % trucks). Ramp demand is 900 veh/h; "served" is vehicles that completed their trip, per hour, followed by the mean speed on the road.

| Main demand (veh/h) | Today's road | SDR hybrid (recommended) | SDR relative | SDR absolute |
|---|---|---|---|---|
| 2,400 | 3,317 · 109 km/h | 3,315 · 111 km/h | 3,336 · 112 km/h | 3,255 · 99 km/h |
| 3,600 | 4,419 · 98 km/h | 4,491 · 108 km/h | 4,488 · 110 km/h | 3,332 · 98 km/h |
| 4,800 | 5,261 · 75 km/h | 5,687 · 103 km/h | 5,689 · 107 km/h | 3,327 · 98 km/h |
| 6,000 | 5,249 · 58 km/h | 5,975 · 98 km/h | 6,878 · 103 km/h | 3,312 · 98 km/h |
| 7,200 | 5,395 · 61 km/h | **6,038** · 99 km/h | **7,094** · 98 km/h | 3,300 · 98 km/h |

The spread between runs is ±70 to ±290 veh/h. The hybrid against today's road, run by run: no difference at 2,400 (−2 veh/h, within the noise), then +2 %, +8 %, +14 % and +12 %.

| System | Carried at saturated demand (7,200 + 900 veh/h) | Compared with today's road |
|---|---|---|
| Today's road (human drivers) | 5,395 veh/h at about 60 km/h | – |
| SDR absolute | 3,300 veh/h at 98 km/h | −39 % |
| SDR absolute + adaptive speed (55 km/h) | 4,082 veh/h | −24 % |
| **SDR hybrid (recommended)** | **6,038 veh/h at 99 km/h** | **+12 %** (interval +5 to +19 %) |
| SDR relative | 7,094 veh/h at 98 km/h | +31 % (interval +23 to +40 %) |

Run 15 times instead of 5, the hybrid carries 5,978 and today's road 5,364 veh/h: +11 %.

The gains come from three mechanisms. Only the second depends on the separation policy.

1. **No traffic breakdown.** In every SDR run, coordinated merging and admission control removed stop-and-go waves, even with absolute separation:
   - hard braking was 0–4 per 1,000 vehicle-km, against 21–86 on today's road;
   - energy lost in braking was about half (25–44 Wh per vehicle-km against 48–90);
   - above today's capacity, speed on the road stayed at about 100 km/h instead of dropping to about 60;
   - excess demand waits at the entry gate instead of jamming the road.

   This result is the most robust, because it comes from coordination, not from optimistic parameters.
2. **Closer following.** Only relative (or hybrid) separation fits more vehicles in a lane.

   | Policy | Lane capacity at 120 km/h (theory, veh/h per lane) |
   |---|---|
   | Absolute | ~1,190 |
   | Today's drivers (1.4 s headway) | ~2,250 |
   | Hybrid (10 % trucks) | ~2,700 |
   | Relative | ~3,150 |

   The corridor does not reach these theoretical gains. The merge, the trucks and the lane changes limit both roads.
3. **Shorter trips.** Mean trip delay, including waiting at a gate:

   | Main demand (veh/h) | Today's road | SDR hybrid | SDR relative |
   |---|---|---|---|
   | 2,400 | 10 s | 8 s | 7 s |
   | 3,600 | 29 s | 11 s | 8 s |
   | 4,800 | 72 s | 19 s | 12 s |
   | 6,000 | 155 s | 95 s | 19 s |
   | 7,200 | 212 s | 162 s | 93 s |

   The gain is largest where today's road is nearly full and the hybrid is not (4,800 + 900 veh/h: a quarter of the delay). Once the hybrid is over its own limit too, delay grows on both roads for as long as the demand lasts.

**Trucks decide the capacity gain.** At saturated demand (7,200 + 900 veh/h):

| Trucks | Today's road | SDR hybrid | SDR relative |
|---|---|---|---|
| 0 % | 6,180 | 7,995 (+29 %) | 7,995 (+29 %) |
| 10 % | 5,395 | 6,038 (+12 %) | 7,094 (+31 %) |
| 20 % | 4,895 | 4,467 (−9 %) | 5,577 (+14 %) |
| 30 % | 4,564 | 3,576 (−22 %) | 4,802 (+5 %) |

The absolute gap behind trucks costs the hybrid 15 % of capacity at 10 % trucks, 20 % at 20 % and 24 % at 30 %. Somewhere between 10 and 20 % trucks the hybrid's gain over today's road is gone. That rule is what removes lost-load collisions (section 2), so it cannot simply be dropped.

These figures are worse than in the first revision (−2 % at 20 % trucks, −11 % at 30 %). The earlier run let almost nobody in from the on-ramp at these truck shares (0–30 of the 900 veh/h), which left the road free of merging traffic and flattered the hybrid.

**Cheaper truck rules.** Twelve rules were tested at 10, 20 and 30 % trucks. The table shows 20 % trucks, where today's road carries 4,895 veh/h. "Lost load" is a load that falls off a truck just in front of the vehicle behind it and stops dead; only the road sensors see it, after the time stated; the cell gives the runs with a collision out of 10.

| Rule behind a truck | Served (veh/h) | Against today's road | Lost load, seen in 0.5 s | Lost load, seen in 1 s |
|---|---|---|---|---|
| Brick-wall gap behind every truck (the rule as it is) | 4,467 | −9 % | 0 | 10 (up to 47 km/h) |
| No truck rule (relative separation) | 5,577 | +14 % | 9 | 9 |
| a. No long gap behind trucks with an enclosed, monitored load: 25 % of trucks | 4,770 | −3 % | 0 | 8 |
| a. The same, 50 % of trucks | 5,047 | **+3 %** | 0 | 9 |
| a. The same, 75 % of trucks | 5,249 | **+7 %** | 0 | 9 |
| b. Gap for a load that stops dead, plus 0.5 s to confirm it | 4,170 | −15 % | 0 | 1 |
| b. The same, plus 1 s | 3,929 | −20 % | 0 | **0** |
| b. Gap for a load that slides to rest (6 m/s²), plus 0.5 s | 5,090 | +4 % | 10 | 10 |
| b. The same, plus 1 s | 4,862 | −0.4 % (within the noise) | 9 | 9 |
| c. Trucks follow trucks closely | 4,541 | −7 % | 0 | 8 |
| d. Truck lane | 3,932 | −20 % | 0 | 9 |

What this shows:

- **Only rule a stays above today's road without lost-load collisions, from about half the trucks exempt.** In these rows the load falls off a truck that still has the long gap behind it. If an exempt truck loses a load after all, the vehicle behind it crashes in 9–10 of 10 runs. So the rule is exactly as safe as the claim that an enclosed, monitored truck sheds nothing that stops a car, and nobody has measured that ([roadmap](ROADMAP.md) 4.4). About half of what trucks shed is tyres and vehicle parts, which an enclosed body does not hold back.
- **The sliding-load rules are safe only if loads slide.** Against a load that slides to rest they had no collisions in 10 runs; against one that stops dead they crash almost every time. Whether real lost loads slide or stop is not known.
- **Trucks following trucks closely** gains nothing that can be told from noise (+2 % against the rule as it is, within the noise), and a truck behind the truck that loses its load crashed in 6 of 10 runs.
- **A truck lane carries less, not more.** The right lane is also where traffic gets on and off, and one lane of trucks at brick-wall gaps carries about 1,000 trucks an hour. Part of the loss is the simulator's (admission control has no budget per lane; [roadmap](ROADMAP.md) 1.6).
- **The rule as it is assumes the road confirms a lost load in 0.5 s.** With 1 s, which is what D9 asks for, the vehicle behind the truck hit the load in 10 of 10 runs, at up to 47 km/h. A gap that covers 1 s of confirmation is the only rule that had no collision in any test, and it costs another 12 % of capacity at 20 % trucks (8 % at 10 % trucks, where the hybrid then carries 3 % more than today's road). These tests switch the car's own sensor off, so they are the hard case ([roadmap](ROADMAP.md) 1.5).

**A lower speed under pressure adds no capacity worth having.** In theory a hybrid lane carries most at about 80 km/h. On the corridor a limit of 100 km/h added 3 % for the hybrid at 6,000 + 900 veh/h and 2 % for relative at 7,200 + 900; 80 km/h added 2 % for the hybrid at 7,200 + 900. Every other case is within the noise or a loss, and at 80 km/h a trip takes 12–34 % longer even when the road is full. Adaptive speed (slow down only when queues build) changed the throughput by nothing that can be told from noise and made trips up to 9 % longer. Below capacity a lower limit only makes trips longer: 18 s more at 100 km/h and 53 s more at 80 km/h over the 5 km. It does cut the energy lost in braking, by a quarter when the road is full and by more than half when it is not, which is a different argument (air drag is not modelled). The option is dropped as a capacity measure.

Absolute separation is not an efficiency option. At motorway speed it carries about 60 % of today's road. It is the safe fallback mode.

**Gates: nobody waits below capacity; above it the wait is the same as today's queue.** Median and 95th-percentile wait to get onto the road, at the main entry and at the on-ramp. On today's road the "gate" is the queue to get onto a full road.

| Main demand (veh/h) | Today's road: main entry | Today's road: on-ramp | SDR hybrid: main entry | SDR hybrid: on-ramp |
|---|---|---|---|---|
| 2,400 | 0 / 1 s | 0 / 5 s | 0 / 0 s | 0 / 2 s |
| 3,600 | 0 / 2 s | 0 / 4 s | 0 / 0 s | 0 / 2 s |
| 4,800 | 1 / 5 s | 0 / 9 s | 0 / 0 s | 0 / 2 s |
| 6,000 | 62 / 160 s | 5 / 39 s | 87 / 155 s | 5 / 41 s |
| 7,200 | 164 / 308 s | 15 / 45 s | 182 / 314 s | 3 / 33 s |

- Up to 4,800 + 900 veh/h the longest wait of any vehicle on the SDR road was 4 s. The first revision reported waits of up to 11 minutes here. They were on the on-ramp and had two causes, both fixed: a fault in the merge order that stranded ramp vehicles, and a ramp gate that made every vehicle wait 45 s.
- Above capacity a gate does not remove the wait. People wait about as long as they queue on today's road, and the wait grows for as long as demand stays above capacity (these are 20-minute runs). The difference is what follows: after the gate the SDR trip runs at about 100 km/h, after today's queue at about 60.
- On both roads the wait falls on the main entry, not on the on-ramp. On today's road that is how merging works out. On SDR it is a choice that has not been made yet ([roadmap](ROADMAP.md) 4.5).

**Weather.** At 3,600 + 600 veh/h, a demand every system except absolute can carry when dry:

| Weather | Today's road | SDR hybrid | SDR relative | SDR absolute |
|---|---|---|---|---|
| Dry | 4,149 · 106 km/h | 4,170 · 109 km/h | 4,173 · 111 km/h | 3,250 · 101 km/h |
| Wet | 4,176 · 95 km/h | 4,172 · 109 km/h | 4,174 · 110 km/h | 2,819 · 101 km/h |
| Ice | 3,958 · 60 km/h | 3,576 · 83 km/h | 4,246 · 85 km/h | 1,288 · 80 km/h |

- Dry and wet: hybrid, relative and today's road carry the same traffic (differences within the noise). Trip delay on SDR is a third to three-quarters lower.
- Absolute separation collapses on ice, because braking distances triple and the gaps with them. The hybrid loses capacity for the same reason behind every truck, and ends up 10 % below today's road, with the same trip delay (within the noise).
- Today's road had 2 collisions on ice in 15 runs. No SDR policy had any.
- **Relative separation barely notices ice, and that is a warning sign, not a strength.** It keeps its capacity because both vehicles brake equally badly. But on ice a brick-wall event is far more severe, and relative spacing gives no protection against it. The only thing that slows relative SDR on ice is one design rule: never drive faster than the guardian sensor can stop for within its range (about 85 km/h on ice). Whether 85 km/h at close spacing is acceptable on ice is a safety decision the simulation cannot make.

**Radio quality costs capacity.** If authority messages are lost, the road widens every gap so that a run of lost messages rarely leaves a vehicle without authority. At 1 % loss nothing changes (within the noise). At 5 % loss the hybrid carries 6 % less, at 10 % loss 10 % less, at 20 % loss 19 % less. Without the widening, capacity stays within 1 % up to 20 % loss, but vehicles brake at full force: about 200 times per 15 minutes at 10 % loss and 2,200 times at 20 %. A reliable radio link is therefore an efficiency requirement, not only a safety one.

**Road sensors down.** Where road sensors fail the hybrid falls back to absolute separation. At the on-ramp merge that costs 17 % of throughput at 4,200 + 600 veh/h and 35 % at saturated demand. On a plain stretch it costs 1 % and 8 %.

---

## 2. Safety: better, but not "eliminates accidents"

What the simulations show (10 runs per case, 30 where the difference was within the noise):

- **System failures are handled well.** Radio loss, segment-controller failure, brake loss and debris that the road sees all caused **0 collisions** under every SDR policy. The fail-safe principles from SDR-01 work: authorities expire, every grant includes a safe stop, and authority already granted stays valid. A vehicle never ran past its authority in any run, also with 20 % of messages lost. On today's road seen debris led to 7 collisions in 30 runs; that difference from SDR's zero is within the noise.
- **A vehicle that stops dead without warning is the residual risk.** No spacing rule makes that safe at relative-level capacity. Under relative or hybrid separation a brick-wall stop led to a collision in 4–6 of 10 runs, with impacts of up to 70 km/h. On today's road it led to a collision in 9 of 10 runs, with more vehicles involved (33 collisions against 5–8) and impacts of up to 102 km/h. Hybrid and relative do not differ here: in a second test of 30 runs each they had 27 and 23 collisions (within the noise).
- **Lost loads are the most likely source of brick-wall events.** An absolute gap behind trucks removed all lost-load collisions in the simulation (64 in 30 runs without it, none with it). Today's road had collisions in 28 of 30 runs. This holds when the road confirms the load within 0.5 s; with 1 s the gap is too short (section 1).
- **Detection layers decide the frequency.** Road sensors that confirm an object within 0.5 s prevented every collision with lying objects (0 in 30 runs; today's road 8–9, a difference that is still within the noise because such objects are rarely hit at all). With nobody detecting the object, SDR is worse than human drivers, who at least see it. Car sensors only help when they share what they see.
- **A breakdown costs less.** Without a safety lane a broken-down vehicle cost the SDR road 6 vehicle-hours and today's road 18 (30 runs). With the safety lane or hard shoulder it cost neither road anything measurable.

What the simulations cannot show is *how often* things go wrong. That is where I think SDR wins:

- The simulated human drivers are idealised: always attentive, never drunk, never on their phone. On real roads the driver is the critical reason in about 94 % of crashes (NHTSA). SDR removes those by design.
- What remains is a narrower class: unseen objects, sudden mechanical failure and system faults.

The foreign-object risk model in SDR-03 puts orders of magnitude on the first of these:

| Setup | Object collisions per billion vehicle-km |
|---|---|
| Relative separation, today's detection technology (~10 s) | ~19: **worse than human drivers** |
| Recommended hybrid, SDR-grade sensing (≤1 s, V2V) | ~2 |
| Same, plus vehicles reporting their own lost loads | **< 1** |
| *For scale: debris crashes today (US, all roads)* | *~10* |
| *For scale: GB motorway casualties, all causes* | *~47* |

These numbers rest on unmeasured assumptions (especially how many objects are heavy enough to stop a car dead, and how many come off trucks: [roadmap](ROADMAP.md) 2.8). The ranking is robust; the values are not.

---

## 3. Viability: the real risks are outside the simulation

| Risk | Why it matters | Status |
|---|---|---|
| **Transition to 100 % guided vehicles** | The end state (every vehicle guided, no mixed traffic) is coherent. But replacing a national fleet takes 15–20 years even with mandates. The path is harder than the destination. | Not modelled. Rollout per SDR-01 §9: dedicated, physically separated SDR lanes first. |
| **Correlated failure and cyberattack** | One software bug or one attack could affect thousands of vehicles at once. I only simulated the failures I thought of. | Not modelled. Next step: system-failure risk analysis. |
| **Roadside sensing performance** | The safety case needs ≤1 s object confirmation, and about 0.5 s for a load falling off a truck. Operational systems today take 10–60 s, and the UK's stopped-vehicle radar misses 10–40 %. | Requirement set (D9). Needs a proof of concept. |
| **Radio link quality** | Lost messages cost capacity (6 % at 5 % loss) or, if ignored, cause full-force braking. | Modelled for random loss only. Bursts and jamming are not. |
| **Truck-heavy corridors** | From somewhere between 10 and 20 % trucks the hybrid carries less than today's road (−9 % at 20 %, −22 % at 30 %). | Measured. One mitigation holds up on paper: no long gap behind trucks with an enclosed, monitored load, if at least half the trucks qualify. |
| **Load monitoring** | It now carries two things: the warning that a load is leaving (D10), and the exemption that keeps freight routes above today's capacity. Nobody measures how often trucks lose loads by body type, and no study shows any cargo device reducing lost loads. | Not proven. [Roadmap](ROADMAP.md) 4.4. |
| **False alarms** | A sensor that is too sensitive stops traffic for nothing, which costs capacity and public trust. | Not modelled. Next step. |
| **Who waits when the road is full** | Above capacity somebody waits, on SDR as today. SDR can choose who; today it is the main entry. | Measured. The rule is a policy question. |
| **Cost** | Sensors, compute and redundant radio every few hundred metres, plus fencing and a safety lane, maintained forever. With a capacity gain of about 12 % instead of 36 %, the case rests more on safety and reliability than on avoided road building. | Not estimated. |
| **Cities** | Pedestrians and cyclists bring back exactly the unpredictability SDR removes on motorways. | Out of scope so far (SDR-01 phases 3–4). |

---

## 4. Confidence

| Finding | Confidence |
|---|---|
| SDR removes traffic breakdown, stop-and-go waves and hard braking | High |
| Above today's capacity, SDR keeps speed at about 100 km/h; trip delay is lower at every demand | High |
| Below capacity nobody waits at a gate; above it people wait about as long as in today's queue | High for this corridor |
| Hybrid separation carries about 12 % more than today's road at 10 % trucks | Medium: the interval from 5 runs is 5–19 %, and the human baseline matches handbook capacities at their low end but is not fitted to a real road |
| The capacity gain shrinks with the truck share and is gone before 20 % | Medium-high |
| Exempting trucks with an enclosed, monitored load brings the gain back from about half the trucks | Medium for the arithmetic; unknown for the assumption that such trucks lose nothing dangerous |
| A lower speed under pressure adds at most 3 % capacity | Medium-high, for this corridor |
| Exact percentages | Low: they depend on assumed braking, delays and one corridor layout |
| System failures (radio, controller, brakes) can be made fail-safe | High, within the failures modelled |
| SDR is safer than human driving overall | Plausible: depends on sensing speed, load monitoring and system-failure risk, none of them proven yet |
| Feasibility of ≤1 s roadside object detection | Unknown: the decisive engineering question |

---

## 5. What would change this assessment

- **Upward:** a roadside sensing prototype that confirms pallet-, tyre- and deer-sized objects within 1 s, at night and in rain, with few false alarms. Evidence that a truck with an enclosed, monitored load sheds nothing that stops a car, so that the long gap can be dropped behind it.
- **Downward:** evidence that heavy objects (enough to stop a car dead) are much more common than the assumed 10 % of obstructions. A system-failure analysis showing that common-cause failures dominate. A real road that carries clearly more than the simulated baseline: at 6,000 veh/h the hybrid's capacity gain would be zero. Roadside sensing that needs a full second for a load falling off a truck, with no warning from the truck itself: the gap behind trucks then has to grow, and the gain at 10 % trucks shrinks from 12 % to 3 %.
- **Either way:** a cost model per kilometre, a human baseline fitted to loop-detector data from a real motorway, and data on what trucks lose and how it moves when it lands.

---

## Appendix: which differences are real

Both rows of a comparison were run on the same traffic, run by run. The interval is the 95 % confidence interval of the difference. The full list is in section 15 of the [results](simulator/results/results.md).

| Statement | Difference | 95 % interval | Runs | Outside the noise? |
|---|---|---|---|---|
| Hybrid against today's road, served, 2,400 + 900 veh/h | −2 veh/h | −15 to +11 | 15 | no |
| The same, 3,600 + 900 | +72 veh/h (+2 %) | +29 to +115 | 15 | yes |
| The same, 4,800 + 900 | +426 veh/h (+8 %) | +255 to +598 | 5 | yes |
| The same, 6,000 + 900 | +726 veh/h (+14 %) | +341 to +1,112 | 5 | yes |
| The same, 7,200 + 900 (the capacity gain) | +643 veh/h (+12 %) | +274 to +1,013 | 5 | yes |
| Relative against today's road, served, 7,200 + 900 | +1,699 veh/h (+31 %) | +1,249 to +2,149 | 5 | yes |
| Absolute against today's road, served, 7,200 + 900 | −2,095 veh/h (−39 %) | −2,304 to −1,887 | 5 | yes |
| Hybrid against today's road, trip delay, 4,800 + 900 | −53 s (−74 %) | −68 to −38 | 5 | yes |
| The same, 7,200 + 900 | −50 s (−23 %) | −79 to −20 | 5 | yes |
| Hybrid against today's road, hard brakes, every demand | −94 to −100 % | | 5–15 | yes |
| Hybrid against today's road, served, 20 % trucks | −428 veh/h (−9 %) | −525 to −331 | 5 | yes |
| The same, 30 % trucks | −988 veh/h (−22 %) | −1,092 to −884 | 5 | yes |
| Hybrid against relative, served, 10 % trucks (cost of the truck rule) | −1,056 veh/h (−15 %) | −1,361 to −751 | 5 | yes |
| Half the trucks exempt, against today's road, 20 % trucks | +152 veh/h (+3 %) | +62 to +242 | 5 | yes |
| Sliding-load gap plus 1 s, against today's road, 20 % trucks | −20 veh/h | −91 to +52 | 15 | no |
| Trucks follow trucks closely, against the rule as it is, 20 % trucks | +74 veh/h (+2 %) | −150 to +298 | 5 | no |
| Truck lane, against the rule as it is, 20 % trucks | −535 veh/h (−12 %) | −621 to −449 | 5 | yes |
| Hybrid at 100 km/h against 120 km/h, served, 6,000 + 900 | +160 veh/h (+3 %) | +88 to +233 | 15 | yes |
| Hybrid with adaptive speed against 120 km/h, served, 7,200 + 900 | +45 veh/h | −41 to +132 | 15 | no |
| Merge and gates fixed, against before, served, 4,800 + 900 | +556 veh/h (+11 %) | +471 to +641 | 5 | yes |
| The same, 7,200 + 900 | +157 veh/h | −60 to +373 | 5 | no |
| Hybrid against today's road, served, dry | +22 veh/h | −1 to +44 | 15 | no |
| The same, ice | −382 veh/h (−10 %) | −467 to −297 | 15 | yes |
| Widened gaps at 5 % radio loss, against no loss, served | −383 veh/h (−6 %) | −530 to −237 | 5 | yes |
| Sensors down at the merge, against all up, served, 4,200 + 600 | −807 veh/h (−17 %) | −925 to −689 | 5 | yes |
| Hybrid against today's road, collisions after a brick-wall stop | −2.8 per run | −4.4 to −1.2 | 10 | yes |
| SDR against today's road, collisions with debris the road sees | −0.23 per run | −0.49 to +0.02 | 30 | no |
| Breakdown without a safety lane: SDR against today's road, extra delay | −12 vehicle-hours | −19 to −5 | 30 | yes |
