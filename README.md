# Self Driving Road (SDR)

> **The road plans. The car executes. A small onboard guardian can always say "stop."**

The idea is a road system that drives the vehicles, instead of autonomous self-driving cars that each try to understand the world on their own. A centrally guided road tells every vehicle where to be, which route to take and at what speed. Movement authorities work as on a modern railway.

## Vision and ground rules

- **Priorities, in order:** 1. safety, 2. efficiency, 3. speed.
- **End state:** 100 % of vehicles on an SDR road are guided by the road. There is no mixed traffic of guided and human-driven vehicles on SDR lanes.
- **Assumptions:**
  - the political will to build SDR exists;
  - manufacturers will build SDR-compatible ("SDR-Ready") vehicles;
  - driver behaviour adapts to SDR.
- **Ambition:** the political, infrastructural, societal and behavioural hurdles are acknowledged, but they are not a reason to think small.
- **Comparison baseline:** the simulator runs a separate copy of the same road with 100 % human drivers, called "today's road", fed identical traffic. It exists only to measure SDR against; the two are never mixed.

## Documents

| Document | What it covers |
|---|---|
| [SDR-01 Concept Architecture](SDR-01-Concept-Architecture.md) | The design: four control layers (network, segment, vehicle, road), safety principles, safety envelope, failure handling, efficiency mechanisms, vehicle standard, rollout, risks and the open design decisions D1–D12 |
| [SDR-03 Hybrid separation, detection layers and the safety lane](SDR-03-Hybrid-Detection-Safety-Lane.md) | Hybrid separation tests; fences, roadside cameras, car sensors and V2V; the safety lane; a foreign-object risk model; full research data and sources |
| [SDR-04 Viability Assessment](SDR-04-Viability-Assessment.md) | How viable and efficient SDR is, based on the simulations; confidence levels and what would change the verdict |
| [ROADMAP](ROADMAP.md) | Proposed further work and investigations, in order of priority, with the status of each item |
| [reports/](reports/) | One plain-language report per roadmap section worked through. So far: [section 1](reports/1-questions-from-latest-results.md) (gate waits, truck rules, speed, statistics) |
| [simulator/README.md](simulator/README.md) | How to run the simulator and its tests, how the model works, parameters, limitations |
| [simulator/CHANGELOG.md](simulator/CHANGELOG.md) | Development log: what was built, bugs found, design lessons |
| [simulator/results/results.md](simulator/results/results.md) | Latest raw experiment results |
| [simulator/results/risk-model.md](simulator/results/risk-model.md) | Latest risk-model output |

## Where things stand (2026-11-20)

**Decided or strongly indicated by simulation:**

| | Status |
|---|---|
| Separation policy (D1) | **Hybrid:** relative by default, absolute behind trucks/load carriers, behind faulty vehicles and where road sensing is degraded. No lost-load collisions. Platoon breaks rejected. |
| Capacity | With 10 % trucks the hybrid carries about 11 % more than the simulated today's road (6,000 against 5,400 veh/h; the interval is 6–16 %), and 29 % more with no trucks. At 20 % trucks it carries 9 % less, at 30 % trucks 20 % less. A real three-lane merge probably carries more than the simulated one: against published figures the gain is between about +5 % and −7 %. It also depends on fast vehicles: a 0.5 s actuator delay or control cycle puts the hybrid below today's road. The earlier "+36 %" was measured against a human baseline that was too weak and is withdrawn. |
| Flow quality | Above today's capacity the SDR road keeps moving at about 100 km/h where today's road drops to about 60. Trip delay is lower at every demand: 20 s against 72 s when today's road is nearly full, 167 s against 212 s when both are over capacity. |
| Admission control and merging | "Virtual vehicle" merging plus gates remove traffic breakdown: no stop-and-go and hard braking down by 94–100 %. Below capacity nobody waits at a gate for more than 4 s. Above capacity the excess waits at the main entry, about as long as in the queue on today's road. |
| Speed under pressure | Slowing to 80–100 km/h when the road fills adds 3–4 % capacity at best and makes every trip longer. Dropped as a capacity measure. |
| Ice | The hybrid with a 60 km/h cap: 14 % more than today's road on ice, and brick-wall impacts of at most 45 km/h instead of 69. |
| Fail-safe design | Radio loss (also in bursts and dead spots), segment-controller failure, brake loss, seen debris and sensor false alarms: 0 collisions in every SDR policy. No vehicle ran past its authority. After a sudden stop SDR had fewer collisions than today's road under every assumption, layout and driver reaction time tested. |
| Radio (D6) | The road widens the gaps to the loss it measures, so lost messages cost capacity instead of causing full-force braking: 6 % at 5 % random loss, but 24–70 % when the same losses come in half-second bursts. Required: two radio paths with independent losses, each delivering at least 99 %; that costs no measurable capacity. A lane change waits until both vehicles involved have acknowledged it. |
| Roadside sensing (D9) | Must confirm an object within about 1 s, with at most about 1 false alarm per km per hour. This is the decisive engineering question. Behind a truck 1 s is too slow for the gap the hybrid keeps: 0.5 s worked, and only through slack in other assumptions; 1 s did not (roadmap 1.5). A car's report of an object must not close a lane on its own. |
| Load monitoring (D10) | Now also decides capacity on freight routes: if at least half the trucks have an enclosed, monitored load and need no long gap behind them, the hybrid carries more than today's road at 20 % trucks (+3 %; +7 % at three-quarters). Unproven: nobody measures how reliably a truck can vouch for its load. |
| Safety lane (D11), full fencing (D12) | Proposed; supported by simulation and research. |

**Open:** whether the capacity gain survives against a real road (today's road needs fitting to detector data, roadmap 2.1 and 2.9), how far load monitoring can be trusted (it carries the truck rule), the truck gap against a 1 s confirmation time, system-failure risk (software, cyber, common cause), cost per km, who waits when the road is full, network-level routing, intersections and urban roads, and the operator model (D8).

The simulated today's road is checked against handbook capacities (it sits at their low end) but is not fitted to a real motorway. Throughput figures are means of 5 runs and incident figures of 10; comparisons are made run by run on the same traffic, and where the difference could not be told from noise the rows were extended to 15 and 30 runs. The documents say which differences are within the noise.

## Run the simulator

```powershell
python -m http.server 8765 --directory simulator
```

Then open http://localhost:8765, or double-click `simulator/index.html`.

| Task | Command |
|---|---|
| Regression tests (about a minute) | `node --test simulator/test` |
| All experiments (about 5 hours on 14 cores) | `node simulator/experiments.js` |
| Risk model | `node simulator/risk-model.js` |

The same commands are available as `npm test`, `npm run experiments` and `npm run risk`. Nothing needs installing.
