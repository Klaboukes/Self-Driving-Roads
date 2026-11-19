# Self Driving Road (SDR) — First Simulation Findings

Status: first results, for discussion · 2026-11-18
**Correction (2026-11-19):** the brake-loss results for relative separation below were caused by a flaw in the simulator's relative-separation formula. Behind a brake-degraded vehicle, the follower was allowed to close up to a negative gap. With the fix (a follower never assumes its leader stops more gently than it can itself), brake loss causes 0 collisions under every SDR policy. Follow-up results, including hybrid separation, are in [SDR-03](SDR-03-Hybrid-Detection-Safety-Lane.md). The raw results file now holds the newer run.
**Superseded figures (2026-11-19, review):** the human driver model behind the "Today's road" columns in this document was too weak. It carried about 4,300 veh/h, slowed to 85 km/h in light traffic and braked hard far too often; a real three-lane motorway carries roughly 5,450–6,500 veh/h. The model was rebuilt and now carries about 5,400. Every comparison with today's road below is therefore too favourable to SDR: "relative carries ~45 % more" is now +26 %, and the hybrid that followed carries +9 %. The SDR columns changed little. This document is kept as the record of the first run; current figures are in [SDR-04](SDR-04-Viability-Assessment.md) and the raw results.
Simulator: [simulator/](simulator/README.md) · Raw results: [simulator/results/results.md](simulator/results/results.md)

---

## What was simulated

The simulated road is a **5 km, 3-lane motorway** with an on-ramp (merge at 2.0–2.3 km), an off-ramp (3.5 km, 20 % of traffic exits) and 10 % trucks. It runs as two separate copies fed with *identical* traffic:

- **SDR:** 100 % of vehicles guided by roadside segment controllers using movement authorities, safe stops and an onboard guardian, as in [SDR-01](SDR-01-Concept-Architecture.md).
- **Today's road:** 100 % human drivers (a standard human-driver model with reaction times, surprise delays, lane-changing and courtesy). It serves only as the comparison baseline.

Each number below is an average over 2 runs (flow tests) or summed over 6 runs (incident tests). The model is a concept tool, not a validated traffic model (see *Limitations*).

---

## Headline results

### 1. Separation policy (decision D1) decides almost everything

Served vehicles per hour on the 3-lane corridor (ramp demand 900 veh/h):

| Main demand (veh/h) | Today's road | SDR absolute | SDR absolute + adaptive speed | SDR relative |
|---|---|---|---|---|
| 2,400 | 3,292 · 85 km/h | 2,728 · 104 km/h | 3,236 · 59 km/h | **3,384 · 112 km/h** |
| 3,600 | 4,146 · 64 km/h | 2,702 · 105 km/h | 3,972 · 57 km/h | **4,580 · 110 km/h** |
| 4,800 | 4,364 · 45 km/h | 2,730 · 105 km/h | 4,068 · 56 km/h | **5,694 · 107 km/h** |
| 6,000 | 4,204 · 43 km/h | 2,708 · 105 km/h | 4,092 · 56 km/h | **6,272 · 105 km/h** |

*Served = vehicles that completed their trip, per hour. Speed = mean speed on the road.*

- **Absolute separation** (assume the vehicle ahead could stop instantly) is **about 35 % below today's road** at motorway speed. At 120 km/h every car needs ~100 m of empty road in front of it. Once demand exceeds that capacity, the extra vehicles wait at the gates (up to 13 minutes).
- **Absolute separation plus adaptive speed** (drop to ~56 km/h under pressure) only *matches* today's road. Under brick-wall rules capacity peaks at ~40 km/h, so efficiency can only be bought with speed.
- **Relative separation** (assume the vehicle ahead brakes at most at its certified maximum) carries **~45 % more than today's road's maximum, at 105–110 km/h, with trip delays of 14–32 s instead of 53–255 s**.

Theory agrees: lane capacity at 120 km/h is ~1,190 veh/h (absolute), ~3,150 (relative) and ~2,250 (human, 1.4 s headway).

### 2. Relative separation brings back the crash type SDR was meant to eliminate

Incidents injected at 10 minutes into the run, around 3 km (6 runs each):

| Incident | Today's road | SDR absolute | SDR relative |
|---|---|---|---|
| Debris on the road | 1 of 6 runs with a collision (10 km/h) | **0** | **0** |
| Brick-wall stop (a vehicle hits something unseen) | 4 of 6 runs, worst impact 80 km/h | **0** | 3 of 6 runs, worst impact 67 km/h |
| Sudden 50 % brake loss in one vehicle | 2 of 6 runs, 9 km/h | **0** | ~~3 of 6 runs, 8 collisions, worst 81 km/h~~ **0 after the formula fix** (see correction above) |
| Radio loss in one vehicle | n/a | 0 | 0 |
| Segment controller failure (60 s) | n/a | 0 | 0 |

- **Absolute separation had zero collisions in every scenario.** That is the design working as intended.
- **Relative separation is as exposed as today's road to a vehicle stopping dead.** Close following is safe only while every vehicle brakes within its certified limits. A vehicle that hits an unseen object, or one whose brakes suddenly fail, breaks that assumption, and the vehicles behind cannot stop in time. Impacts are as severe as on today's road, although in these runs fewer followers were involved.
- ~~**Brake loss is worse in relative SDR than on today's road** (8 collisions vs 2).~~ *Retracted (2026-11-19):* this was a simulator flaw. The follower of a brake-degraded vehicle was allowed to close up to a negative gap. With the fix, brake loss causes 0 collisions in every SDR policy ([SDR-03](SDR-03-Hybrid-Detection-Safety-Lane.md)).

### 3. The fail-safe design works for system failures

- **Radio loss:** the vehicle's authority expired after 1.5 s and it made a safe stop. Traffic flowed around it. No collisions.
- **Segment controller failure (60 s):** about 31 vehicles per failure made safe stops and ~23 needed full braking at their authority limit. **No collisions.** One design rule mattered here: *upstream vehicles keep the authority they were already granted*, because it was cleared with a safe stop included. Without that rule, upstream vehicles had to brake as hard as possible at the failed boundary.
- **Debris:** road sensors confirm debris within 0.5 s and every vehicle's authority stops it in time. Absolute and relative both had 0 collisions.

### 4. Smoothness and energy

| | Today's road | SDR (absolute or relative) |
|---|---|---|
| Hard brakes (>4 m/s²) per 1,000 veh-km | 700–3,200 | 0–5 |
| Energy lost in braking (Wh per veh-km, 1.5 t car) | 71–81 | 23–42 (7–14 at adaptive 56 km/h) |
| Stop-and-go waves | Yes, visible in the time-space diagram from the on-ramp backwards | None |

### 5. Weather shows a hidden risk in relative separation

| Weather | Today's road | SDR absolute | SDR relative |
|---|---|---|---|
| Dry | 3,768 · 64 km/h | 2,756 · 104 km/h | 4,276 · 110 km/h |
| Wet | 3,854 · 58 km/h | 2,554 · 104 km/h | 4,276 · 110 km/h |
| Ice | 3,102 · 35 km/h | 1,198 · 81 km/h | 4,288 · 85 km/h |

*Served veh/h at 3,600 + 600 veh/h demand.*

- Absolute separation collapses on ice, because braking distances triple and the gaps with them.
- Relative separation barely notices ice, because both vehicles brake equally badly. **That is a warning sign, not a strength.** On ice, a brick-wall event becomes much more severe, and relative spacing gives no protection against it. The only thing that slowed relative SDR on ice was a design rule added during this work: *never drive faster than the guardian sensor can stop for within its range* (≈85 km/h on ice).

---

## What this means for the design

1. **Decision D1 can't be "absolute first".** At motorway speeds absolute separation makes the road *less* efficient than today. That fails priority 2 and won't win public or political support. Its value is as the **safe fallback mode**.
2. **Relative separation is the only route to the efficiency promise.** Its safety depends on one thing: **how rarely a vehicle stops dead**. That turns the safety question from "how big are the gaps?" into **"how good is the road at seeing everything before vehicles reach it, and how reliable are the brakes?"** The investment moves to road sensing and vehicle health monitoring.
3. **A hybrid policy is the obvious next design**, for example:
   - relative separation by default, switching **instantly to absolute** around any vehicle that reports degraded health and in any segment with an unconfirmed object or sensor gap;
   - **cooperative braking limits**: a vehicle may not brake harder than the weakest vehicle directly behind it can follow, except in a true emergency;
   - **platoon breaks**: an absolute-size gap every N vehicles to cap how many vehicles one brick-wall event can involve;
   - weather-dependent speed caps based on the guardian's sensing range.
4. **Admission control works.** Gates kept the SDR road free of jams in every run. Excess demand waited *before* entering instead of creating stop-and-go traffic. With absolute separation the waits became very long (up to 13 min), which shows that gates can hide a capacity problem from the people on the road, but not from the people waiting at the gate.
5. **Merging needed design work.** The first merge logic deadlocked twice in simulation. What worked: project each ramp vehicle onto the main lane as a *virtual vehicle placed by its predicted arrival time*, so mainline traffic opens a gap long before the merge. Exits work best when the system pre-positions vehicles (it knows their destination from trip booking).

---

## Limitations: what these numbers are not

- **Concept model, not calibrated.** The human baseline behaves plausibly (no crashes in normal flow except occasional low-speed bumps at the end of the acceleration lane, stop-and-go waves at the merge, 1–2 % missed exits, ~4,300 veh/h corridor capacity), but it has not been fitted to real loop-detector data.
- **SDR parameters are assumptions.** These are braking (8 m/s² cars, 6 m/s² trucks), 0.2 s actuator delay, 0.1 s control cycle, 50 ms radio latency, 2.5 m margin and 0.5 s debris detection. All live in `simulator/engine.js` → `DEFAULTS`, and the conclusions are sensitive to them.
- **Small samples.** Incident results are 6 runs each, which shows *whether* something can happen and roughly how badly, not how often.
- **One corridor.** No network routing, no intersections, no urban traffic, no pedestrians.

---

## Suggested next steps

1. **Implement and test the hybrid separation policies** above. The aim: relative-level throughput with absolute-level safety for brake loss and degraded vehicles.
2. **Model road-sensor misses.** Make "unseen object" a probability per km. That puts a number on the brick-wall risk that decides D1.
3. **Sensitivity analysis.** Sweep braking, latency and margins to see which assumptions the conclusions depend on.
4. **Network layer.** Several corridors with trip booking, to test admission control and routing at scale.
