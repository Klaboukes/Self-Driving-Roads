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
| [SDR-02 First Simulation Findings](SDR-02-Simulation-Findings.md) | Absolute vs relative separation, incidents, weather, energy. *Contains a correction about brake loss (see SDR-03).* |
| [SDR-03 Hybrid separation, detection layers and the safety lane](SDR-03-Hybrid-Detection-Safety-Lane.md) | Hybrid separation tests; fences, roadside cameras, car sensors and V2V; the safety lane; a foreign-object risk model; full research data and sources |
| [SDR-04 Viability Assessment](SDR-04-Viability-Assessment.md) | How viable and efficient SDR is, based on the simulations; confidence levels and what would change the verdict |
| [simulator/README.md](simulator/README.md) | How to run the simulator, how the model works, parameters, limitations |
| [simulator/CHANGELOG.md](simulator/CHANGELOG.md) | Development log: what was built, bugs found, design lessons |
| [simulator/results/results.md](simulator/results/results.md) | Latest raw experiment results |
| [simulator/results/risk-model.md](simulator/results/risk-model.md) | Latest risk-model output |

## Where things stand (2026-11-19)

**Decided or strongly indicated by simulation:**

| | Status |
|---|---|
| Separation policy (D1) | **Hybrid:** relative by default, absolute behind trucks/load carriers, behind faulty vehicles and where road sensing is degraded. +36 % throughput on the simulated corridor; no lost-load collisions. Platoon breaks rejected. |
| Admission control and merging | Gates plus "virtual vehicle" merging remove traffic breakdown entirely: no stop-and-go and almost no hard braking. |
| Fail-safe design | Radio loss, segment-controller failure, brake loss and seen debris: 0 collisions in every SDR policy. |
| Roadside sensing (D9) | Must confirm an object within about 1 s. This is the decisive engineering question. |
| Load monitoring (D10), safety lane (D11), full fencing (D12) | Proposed; supported by simulation and research. |

**Open:** system-failure risk (software, cyber, common cause), sensor false alarms, cost per km, network-level routing, intersections and urban roads, and the operator model (D8).

## Run the simulator

```powershell
python -m http.server 8765 --directory simulator
```

Then open http://localhost:8765, or double-click `simulator/index.html`. Headless experiments: `node simulator/experiments.js` (about 12 minutes). Risk model: `node simulator/risk-model.js`.
