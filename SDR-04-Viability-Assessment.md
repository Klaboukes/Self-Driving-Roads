# Self Driving Road (SDR): Viability and efficiency assessment

Status: assessment, for discussion · 2026-11-19, revised the same day after a review of the simulator
Based on: [SDR-01](SDR-01-Concept-Architecture.md) (architecture), [SDR-02](SDR-02-Simulation-Findings.md) (first simulation findings), [SDR-03](SDR-03-Hybrid-Detection-Safety-Lane.md) (hybrid separation, detection layers, safety lane)
Data: [simulator/results/results.md](simulator/results/results.md)

This answers the question *"How viable and efficient is SDR, based on the simulations?"*.

**What changed in this revision.** The review found that the simulated today's road was too weak: it carried about 4,300 veh/h where a real three-lane motorway carries roughly 5,450–6,500. The human driver model was rebuilt and checked against handbook values ([CHANGELOG](simulator/CHANGELOG.md)). It now carries about 5,400 veh/h on the test corridor. The earlier headline, "+36 % throughput", was measured against the weak baseline and is withdrawn. Every number below comes from the new run: 5 runs per throughput figure, 10 per incident.

---

## Verdict

SDR is **clearly better in how traffic flows** and **modestly better in how much traffic the road carries**. It is **plausibly, but not yet provably, better on safety**.

- **Flow quality is the strong result.** When demand exceeds what today's road can carry, today's road drops to about 60 km/h in stop-and-go traffic. The SDR road keeps moving at about 100 km/h and the excess waits at the entry. Hard braking almost disappears.
- **Capacity is a smaller gain than first reported, and it depends on trucks.** With 10 % trucks the recommended hybrid carries about 9 % more than today's road. With no trucks it carries 28 % more. From about 20 % trucks the gain is gone, because the hybrid keeps a brick-wall gap behind every truck.
- **Below today's capacity there is little to gain.** Up to about 4,500 veh/h both roads deliver the same trips with similar delay.
- **Separation and sensing are one decision.** Close following is only safe if objects on the road are seen within about a second, which is much faster than any roadside system in operation today.

On motorways, with 100 % of vehicles guided, I rate SDR **technically viable, and worthwhile mainly for reliability and safety**, provided three things hold:

1. the recommended hybrid separation is adopted (D1), with a way to limit its cost on truck-heavy roads;
2. roadside sensing confirms objects within about 1 s (D9);
3. vehicles report their own lost loads (D10).

---

## 1. Efficiency

Measured on the simulated corridor (3 lanes, on-ramp, exit, 10 % trucks). Ramp demand is 900 veh/h; "served" is vehicles that completed their trip, per hour, followed by the mean speed on the road.

| Main demand (veh/h) | Today's road | SDR hybrid (recommended) | SDR relative | SDR absolute |
|---|---|---|---|---|
| 2,400 | 3,364 · 110 km/h | 3,356 · 111 km/h | 3,338 · 111 km/h | 2,685 · 105 km/h |
| 3,600 | 4,477 · 98 km/h | 4,319 · 109 km/h | 4,507 · 110 km/h | 2,691 · 105 km/h |
| 4,800 | 5,261 · 75 km/h | 5,131 · 106 km/h | 5,510 · 107 km/h | 2,721 · 105 km/h |
| 6,000 | 5,249 · 58 km/h | 5,842 · 102 km/h | 6,313 · 105 km/h | 2,738 · 105 km/h |
| 7,200 | 5,395 · 61 km/h | **5,882** · 102 km/h | **6,807** · 102 km/h | 2,696 · 105 km/h |

The spread between runs is about ±100 veh/h, so differences of that size are noise.

| System | Most it carried | Compared with today's road |
|---|---|---|
| Today's road (human drivers) | 5,395 veh/h at about 60 km/h | – |
| SDR absolute | 2,738 veh/h | −49 % |
| SDR absolute + adaptive speed (57 km/h) | 4,117 veh/h | −24 % |
| **SDR hybrid (recommended)** | **5,882 veh/h at 102 km/h** | **+9 %** |
| SDR relative | 6,807 veh/h at 102 km/h | +26 % |

The gains come from three mechanisms. Only the second depends on the separation policy.

1. **No traffic breakdown.** In every SDR run, admission control and coordinated merging removed stop-and-go waves, even with absolute separation:
   - hard braking was 0–2 per 1,000 vehicle-km, against 20–86 on today's road;
   - energy lost in braking was about half (23–44 Wh per vehicle-km against 47–90);
   - above today's capacity, speed on the road stayed above 100 km/h instead of dropping to about 60;
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
3. **Shorter trips when the road is busy.** Mean trip delay, including waiting at a gate:

   | Main demand (veh/h) | Today's road | SDR hybrid | SDR relative |
   |---|---|---|---|
   | 2,400 | 10 s | 17 s | 13 s |
   | 3,600 | 30 s | 29 s | 15 s |
   | 4,800 | 72 s | 37 s | 29 s |
   | 6,000 | 155 s | 69 s | 27 s |
   | 7,200 | 212 s | 160 s | 68 s |

   Below today's capacity the hybrid is no faster than today's road: the gate holds vehicles back a little to keep the road stable. Above it, delay is roughly halved until the hybrid reaches its own limit.

**Trucks decide the capacity gain.** At saturated demand (7,200 + 900 veh/h):

| Trucks | Today's road | SDR hybrid | SDR relative |
|---|---|---|---|
| 0 % | 6,180 | 7,926 (+28 %) | 7,926 (+28 %) |
| 10 % | 5,395 | 5,882 (+9 %) | 6,807 (+26 %) |
| 20 % | 4,895 | 4,810 (−2 %) | 6,038 (+23 %) |
| 30 % | 4,564 | 4,082 (−11 %) | 4,978 (+9 %) |

The absolute gap behind trucks costs the hybrid 14 % of capacity at 10 % trucks and about 20 % at 20–30 %. That rule is what removes lost-load collisions (section 2), so it cannot simply be dropped. Ways to limit the cost that have not been simulated yet: exempt trucks whose load is enclosed and monitored (D10), give trucks their own lane, or let trucks follow trucks closely. The relative figures at 20–30 % trucks vary a lot between runs (±650 veh/h).

Absolute separation is not an efficiency option. At motorway speed it carries half of today's road. It is the safe fallback mode.

**Radio quality costs capacity.** If authority messages are lost, the road widens every gap so that a run of lost messages rarely leaves a vehicle without authority. At 5 % loss the hybrid carries 7 % less, at 10 % loss 13 % less, at 20 % loss 21 % less. Without the widening, capacity stays the same but vehicles brake at full force: about 200 times per 15 minutes at 10 % loss and 2,300 times at 20 %. A reliable radio link is therefore an efficiency requirement, not only a safety one.

---

## 2. Safety: better, but not "eliminates accidents"

What the simulations show (10 runs per case):

- **System failures are handled well.** Radio loss, segment-controller failure, brake loss and debris that the road sees all caused **0 collisions** under every SDR policy. The fail-safe principles from SDR-01 work: authorities expire, every grant includes a safe stop, and authority already granted stays valid. A vehicle never ran past its authority in any run, also with 20 % of messages lost.
- **A vehicle that stops dead without warning is the residual risk.** No spacing rule makes that safe at relative-level capacity. Under relative or hybrid separation a brick-wall stop led to a collision in 5–6 of 10 runs, with impacts of up to 70 km/h. On today's road it led to a collision in 9 of 10 runs, with more vehicles involved (33 collisions against 8–9) and impacts of up to 102 km/h.
- **Lost loads are the most likely source of brick-wall events.** An absolute gap behind trucks removed all lost-load collisions in the simulation (25 → 0 in 10 runs). Today's road had collisions in 9 of 10 runs.
- **Detection layers decide the frequency.** Road sensors that confirm an object within 0.5 s prevented every collision with lying objects. Car sensors only help when they share what they see.

What the simulations cannot show is *how often* things go wrong. That is where I think SDR wins:

- The simulated human drivers are idealised: always attentive, never drunk, never on their phone. On real roads the driver is the critical reason in about 94 % of crashes (NHTSA). SDR removes those by design.
- What remains is a narrower class: unseen objects, sudden mechanical failure and system faults.

The foreign-object risk model in SDR-03 puts orders of magnitude on the first of these:

| Setup | Object collisions per billion vehicle-km |
|---|---|
| Relative separation, today's detection technology (~10 s) | ~20: **worse than human drivers** |
| Recommended hybrid, SDR-grade sensing (≤1 s, V2V) | ~3 |
| Same, plus vehicles reporting their own lost loads | **< 1** |
| *For scale: debris crashes today (US, all roads)* | *~10* |
| *For scale: GB motorway casualties, all causes* | *~47* |

These numbers rest on unmeasured assumptions (especially how many objects are heavy enough to stop a car dead). The ranking is robust; the values are not.

---

## 3. Viability: the real risks are outside the simulation

| Risk | Why it matters | Status |
|---|---|---|
| **Transition to 100 % guided vehicles** | The end state (every vehicle guided, no mixed traffic) is coherent. But replacing a national fleet takes 15–20 years even with mandates. The path is harder than the destination. | Not modelled. Rollout per SDR-01 §9: dedicated, physically separated SDR lanes first. |
| **Correlated failure and cyberattack** | One software bug or one attack could affect thousands of vehicles at once. I only simulated the failures I thought of. | Not modelled. Next step: system-failure risk analysis. |
| **Roadside sensing performance** | The safety case needs ≤1 s object confirmation. Operational systems today take 10–60 s, and the UK's stopped-vehicle radar misses 10–40 %. | Requirement set (D9). Needs a proof of concept. |
| **Radio link quality** | Lost messages cost capacity (7 % at 5 % loss) or, if ignored, cause full-force braking. | Modelled for random loss only. Bursts and jamming are not. |
| **Truck-heavy corridors** | The hybrid's capacity gain disappears from about 20 % trucks. | Measured. Mitigations not yet simulated. |
| **False alarms** | A sensor that is too sensitive stops traffic for nothing, which costs capacity and public trust. | Not modelled. Next step. |
| **Cost** | Sensors, compute and redundant radio every few hundred metres, plus fencing and a safety lane, maintained forever. With a capacity gain of about 9 % instead of 36 %, the case rests more on safety and reliability than on avoided road building. | Not estimated. |
| **Cities** | Pedestrians and cyclists bring back exactly the unpredictability SDR removes on motorways. | Out of scope so far (SDR-01 phases 3–4). |

---

## 4. Confidence

| Finding | Confidence |
|---|---|
| SDR removes traffic breakdown, stop-and-go waves and hard braking | High |
| Above today's capacity, SDR keeps speed at about 100 km/h and roughly halves delay | High |
| Hybrid separation carries about 9 % more than today's road at 10 % trucks | Medium: the human baseline now matches handbook capacities, at their low end, but is not fitted to a real road |
| The capacity gain shrinks with the truck share and is gone at about 20 % | Medium-high |
| Exact percentages | Low: they depend on assumed braking, delays and one corridor layout |
| System failures (radio, controller, brakes) can be made fail-safe | High, within the failures modelled |
| SDR is safer than human driving overall | Plausible: depends on sensing speed, load monitoring and system-failure risk, none of them proven yet |
| Feasibility of ≤1 s roadside object detection | Unknown: the decisive engineering question |

---

## 5. What would change this assessment

- **Upward:** a roadside sensing prototype that confirms pallet-, tyre- and deer-sized objects within 1 s, at night and in rain, with few false alarms. A truck rule that keeps lost-load safety at a lower capacity cost.
- **Downward:** evidence that heavy objects (enough to stop a car dead) are much more common than the assumed 10 % of obstructions. A system-failure analysis showing that common-cause failures dominate. A real road that carries clearly more than the simulated baseline: at 6,000 veh/h the hybrid's capacity gain would be zero.
- **Either way:** a cost model per kilometre, and a human baseline fitted to loop-detector data from a real motorway.
