# Self Driving Road (SDR): Viability and efficiency assessment

Status: assessment, for discussion · 2026-11-19
Based on: [SDR-01](SDR-01-Concept-Architecture.md) (architecture), [SDR-02](SDR-02-Simulation-Findings.md) (first simulation findings), [SDR-03](SDR-03-Hybrid-Detection-Safety-Lane.md) (hybrid separation, detection layers, safety lane)

This answers the question *"How viable and efficient is SDR, based on the simulations?"*. It was first answered after SDR-02 and is updated here with the SDR-03 results.

---

## Verdict

SDR is **clearly worthwhile on efficiency** and **plausibly, but not yet provably, better on safety**. The simulations show the idea is not fanciful. They also show what the concept depends on:

- **Separation and sensing are one decision.** Close following (relative separation) gives the capacity gain, but it is only safe if objects on the road are seen within about a second. That is much faster than any roadside system in operation today.
- **The safety case depends on how rarely something unseen stops a car dead,** not on how big the gaps are.

On motorways, with 100 % of vehicles guided, I rate SDR **technically viable and meaningfully more efficient**, provided three things hold:

1. the recommended hybrid separation is adopted (D1);
2. roadside sensing confirms objects within about 1 s (D9);
3. vehicles report their own lost loads (D10).

---

## 1. Efficiency: the strongest result

The gains come from three mechanisms. Only the second depends on the separation policy.

1. **No traffic breakdown.** In every SDR run, admission control and coordinated merging removed stop-and-go waves, even with absolute separation:
   - hard braking fell from 700–3,200 to 0–6 per 1,000 vehicle-km;
   - energy lost in braking fell by roughly half;
   - excess demand waits at the entry gate instead of jamming the road.

   This result is the most robust, because it comes from coordination, not from optimistic parameters.
2. **Closer following.** Only relative (or hybrid) separation fits more vehicles in a lane.

   | Policy | Lane capacity at 120 km/h (theory, veh/h per lane) |
   |---|---|
   | Absolute | ~1,190 |
   | Today's drivers (1.4 s headway) | ~2,250 |
   | Hybrid (10 % trucks) | ~2,700 |
   | Relative | ~3,150 |

3. **Predictable trips.** Trip delay was 14–81 s on the SDR road (relative and hybrid) against 53–255 s on today's road, at the same demand.

Measured on the simulated corridor (3 lanes, on-ramp, exit, 10 % trucks):

| System | Served at the highest demand | Compared with today's road at its best |
|---|---|---|
| Today's road (human drivers) | 4,364 veh/h (best case, 4,800 demand) | – |
| SDR absolute | 2,710 veh/h | −38 % |
| SDR absolute + adaptive speed (56 km/h) | 4,096 veh/h | −6 % |
| **SDR hybrid (recommended)** | **5,920 veh/h** | **+36 %** |
| SDR relative | 6,358 veh/h | +46 % |

**Discount the headline.** The simulated today's road tops out at about 4,300 veh/h. A real 3-lane motorway with an on-ramp probably carries 5,000–5,500 before it breaks down, so the human baseline is likely pessimistic. Against a real road I expect the hybrid to give **roughly +10–30 % capacity**, plus a much larger gain in reliability: no breakdown, and predictable trip times. That is like adding a lane without building one.

Absolute separation is not an efficiency option. At motorway speed it is below today's road. It is the safe fallback mode.

---

## 2. Safety: better, but not "eliminates accidents"

What the simulations show:

- **System failures are handled well.** Radio loss, segment-controller failure, brake loss and debris that the road sees all caused **0 collisions** under every SDR policy. The fail-safe principles from SDR-01 work: authorities expire, every grant includes a safe stop, and authority already granted stays valid.
- **A vehicle that stops dead without warning is the residual risk.** No spacing rule makes that safe at relative-level capacity. Under relative or hybrid separation, a brick-wall stop led to collisions in 2–6 of 6 runs, with impacts of up to about 70 km/h. That is as severe as on today's road, though fewer vehicles were involved.
- **Lost loads are the most likely source of brick-wall events.** An absolute gap behind trucks removed all lost-load collisions in the simulation, at a cost of about 7 % capacity.
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
| **False alarms** | A sensor that is too sensitive stops traffic for nothing, which costs capacity and public trust. | Not modelled. Next step. |
| **Cost** | Sensors, compute and redundant radio every few hundred metres, plus fencing and a safety lane, maintained forever. This has to be weighed against cheaper cars, fewer crashes and the capacity gain. | Not estimated. |
| **Cities** | Pedestrians and cyclists bring back exactly the unpredictability SDR removes on motorways. | Out of scope so far (SDR-01 phases 3–4). |

---

## 4. Confidence

| Finding | Confidence |
|---|---|
| SDR removes traffic breakdown, stop-and-go waves and hard braking | High |
| Hybrid separation gives a meaningful capacity gain (+10–30 % against a real road) | Medium-high |
| Exact percentages | Low: they depend on assumed braking, delays and baseline calibration |
| System failures (radio, controller, brakes) can be made fail-safe | High, within the failures modelled |
| SDR is safer than human driving overall | Plausible: depends on sensing speed, load monitoring and system-failure risk, none of them proven yet |
| Feasibility of ≤1 s roadside object detection | Unknown: the decisive engineering question |

---

## 5. What would change this assessment

- **Upward:** a roadside sensing prototype that confirms pallet-, tyre- and deer-sized objects within 1 s, at night and in rain, with few false alarms.
- **Downward:** evidence that heavy objects (enough to stop a car dead) are much more common than the assumed 10 % of obstructions. Or a system-failure analysis showing that common-cause failures dominate.
- **Either way:** a cost model per kilometre, and a calibrated human baseline from real loop-detector data.
