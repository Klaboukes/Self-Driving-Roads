# SDR simulator: experiment results

Corridor: 5 km, 3 lanes, on-ramp merging at 2.0–2.3 km, off-ramp at 3.5 km (20 % of vehicles exit), 10 % trucks.
"Today" is the same corridor with 100 % human drivers; every SDR row is 100 % SDR-guided vehicles.
Hybrid separation (recommended, and the simulator default) = relative, plus an absolute gap behind trucks, behind any vehicle that reports a fault, and in/just before a segment whose road sensors are down. Platoon breaks are off (section 3 shows why).
"±" is the standard deviation between runs with different traffic (seeds). Whether a difference between two rows is real is worked out per seed, because both rows get the same traffic: see the last section.

## 1. Throughput and delay vs demand

*Full run of 2026-11-19 12:25: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

Ramp demand 900 veh/h in all runs. Warm-up 5 min, then measured (15 min in a full run, 5 min in a quick run).

| System | Main demand (veh/h) | Served (veh/h) | Let in: main + ramp (veh/h) | Mean speed (km/h) | Trip delay, mean (s) | Wait at main entry: median / 95th pct (s) | Wait at on-ramp: median / 95th pct (s) | Longest wait (s) | Queue at end: main + ramp | Collisions (all runs) | Hard brakes / 1000 veh-km | Braking loss (Wh/veh-km) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Today (human drivers) | 2,400 | 3,317 ± 106 | 2,409 + 897 | 109 | 10 ± 1 | 0 / 1 | 0 / 5 | 8 | 0 + 0 | 0 | 21 | 48.0 |
| Today (human drivers) | 3,600 | 4,419 ± 132 | 3,574 + 897 | 98 | 29 ± 7 | 0 / 2 | 0 / 4 | 7 | 0 + 0 | 0 | 46 | 68.3 |
| Today (human drivers) | 4,800 | 5,261 ± 72 | 4,774 + 869 | 75 | 72 ± 11 | 1 / 5 | 0 / 9 | 19 | 3 + 2 | 0 | 86 | 89.8 |
| Today (human drivers) | 6,000 | 5,249 ± 55 | 5,019 + 851 | 58 | 155 ± 17 | 62 / 160 | 5 / 39 | 177 | 282 + 6 | 0 | 75 | 77.5 |
| Today (human drivers) | 7,200 | 5,395 ± 121 | 5,178 + 852 | 61 | 212 ± 10 | 164 / 308 | 15 / 45 | 325 | 654 + 6 | 0 | 72 | 80.2 |
| SDR, absolute separation | 2,400 | 3,255 ± 80 | 2,373 + 897 | 99 | 36 ± 11 | 13 / 38 | 1 / 5 | 45 | 15 + 0 | 0 | 0 | 35.4 |
| SDR, absolute separation | 3,600 | 3,332 ± 71 | 2,460 + 874 | 98 | 173 ± 12 | 232 / 389 | 0 / 5 | 406 | 399 + 0 | 0 | 0 | 35.2 |
| SDR, absolute separation | 4,800 | 3,327 ± 73 | 2,466 + 874 | 98 | 245 ± 9 | 338 / 575 | 0 / 5 | 602 | 790 + 0 | 0 | 0 | 35.4 |
| SDR, absolute separation | 6,000 | 3,312 ± 59 | 2,451 + 874 | 98 | 286 ± 8 | 397 / 693 | 0 / 5 | 725 | 1,190 + 0 | 0 | 0 | 35.6 |
| SDR, absolute separation | 7,200 | 3,300 ± 74 | 2,447 + 874 | 98 | 314 ± 6 | 432 / 767 | 0 / 5 | 804 | 1,600 + 0 | 0 | 1 | 36.4 |
| SDR, absolute + adaptive speed | 2,400 | 3,289 ± 108 | 2,411 + 897 | 97 | 32 ± 6 | 3 / 10 | 0 / 5 | 17 | 2 + 0 | 0 | 0 | 35.7 |
| SDR, absolute + adaptive speed | 3,600 | 3,998 ± 141 | 3,509 + 727 | 56 | 168 ± 14 | 23 / 40 | 31 / 130 | 150 | 33 + 37 | 0 | 9 | 16.0 |
| SDR, absolute + adaptive speed | 4,800 | 4,048 ± 169 | 3,416 + 698 | 55 | 267 ± 13 | 193 / 320 | 66 / 158 | 330 | 433 + 45 | 0 | 12 | 15.1 |
| SDR, absolute + adaptive speed | 6,000 | 4,080 ± 144 | 3,426 + 682 | 55 | 323 ± 9 | 289 / 480 | 69 / 175 | 501 | 825 + 48 | 0 | 12 | 15.0 |
| SDR, absolute + adaptive speed | 7,200 | 4,082 ± 109 | 3,447 + 689 | 55 | 362 ± 7 | 346 / 587 | 70 / 174 | 617 | 1,233 + 47 | 0 | 9 | 14.5 |
| SDR, relative separation | 2,400 | 3,336 ± 112 | 2,464 + 875 | 112 | 7 ± 0 | 0 / 0 | 0 / 2 | 3 | 0 + 0 | 0 | 0 | 21.3 |
| SDR, relative separation | 3,600 | 4,488 ± 77 | 3,572 + 898 | 110 | 8 ± 1 | 0 / 0 | 0 / 1 | 3 | 0 + 0 | 0 | 0 | 26.8 |
| SDR, relative separation | 4,800 | 5,689 ± 110 | 4,774 + 875 | 107 | 12 ± 1 | 0 / 0 | 0 / 2 | 3 | 0 + 0 | 0 | 0 | 34.7 |
| SDR, relative separation | 6,000 | 6,878 ± 129 | 5,950 + 875 | 103 | 19 ± 2 | 0 / 1 | 0 / 2 | 4 | 0 + 0 | 0 | 1 | 42.6 |
| SDR, relative separation | 7,200 | 7,094 ± 284 | 6,195 + 857 | 98 | 93 ± 16 | 84 / 150 | 3 / 38 | 159 | 322 + 5 | 0 | 2 | 45.9 |
| SDR, hybrid separation | 2,400 | 3,315 ± 96 | 2,409 + 897 | 111 | 8 ± 1 | 0 / 0 | 0 / 2 | 4 | 0 + 0 | 0 | 0 | 24.6 |
| SDR, hybrid separation | 3,600 | 4,491 ± 86 | 3,572 + 897 | 108 | 11 ± 1 | 0 / 0 | 0 / 2 | 4 | 0 + 0 | 0 | 0 | 32.7 |
| SDR, hybrid separation | 4,800 | 5,687 ± 108 | 4,772 + 875 | 103 | 19 ± 2 | 0 / 0 | 0 / 2 | 4 | 0 + 0 | 0 | 1 | 41.3 |
| SDR, hybrid separation | 6,000 | 5,975 ± 291 | 5,086 + 848 | 98 | 95 ± 22 | 87 / 155 | 5 / 41 | 165 | 271 + 7 | 0 | 3 | 44.2 |
| SDR, hybrid separation | 7,200 | 6,038 ± 248 | 5,150 + 856 | 99 | 162 ± 17 | 182 / 314 | 3 / 33 | 328 | 662 + 5 | 0 | 4 | 44.0 |

Trip delay = time from arriving at the entry (including waiting at a gate) to leaving the corridor, minus free-flow time. Waits are those of every vehicle let in during the measuring time, plus the vehicles still waiting at the end with their wait so far; on today's road the "gate" is the queue to get onto a full road. Once demand is above what a road can carry, the queue and the waits grow for as long as the run lasts.

## 2. Incidents

*Full run of 2026-11-19 12:25: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

Main demand 4,200 veh/h + ramp 600 veh/h. Incident at t = 10 min around x = 3 km, observed for 5 min. "Brick-wall stop": a vehicle hits something no sensor saw and stops within about a second. "Sudden 50 % brake loss": the brakes of one vehicle halve; SDR health monitoring reports it after 0.5 s (sooner once it brakes); a human driver is not told. Numbers in brackets: the same traffic over the same 5 minutes without the incident.

| Incident | System | Runs | Runs with a collision | Collisions (without incident) | Worst impact (km/h) | Guardian activations | Safe stops | Supervision brakes | Hard brakes per run (without incident) |
|---|---|---|---|---|---|---|---|---|---|
| debris | Today (human drivers) | 30 | 4 | 7 (0) | 68 | 0 | 0 | 0 | 237 (63) |
| debris | SDR, absolute separation | 30 | 0 | 0 (0) | 0 | 0 | 0 | 0 | 39 (0) |
| debris | SDR, relative separation | 30 | 0 | 0 (0) | 0 | 0 | 0 | 0 | 7 (0) |
| debris | SDR, hybrid separation | 30 | 0 | 0 (0) | 0 | 0 | 0 | 0 | 11 (0) |
| brick-wall stop | Today (human drivers) | 10 | 9 | 33 (0) | 102 | 0 | 0 | 0 | 238 (69) |
| brick-wall stop | SDR, absolute separation | 10 | 0 | 0 (0) | 0 | 0 | 0 | 0 | 25 (0) |
| brick-wall stop | SDR, relative separation | 10 | 6 | 8 (0) | 60 | 9 | 0 | 11 | 10 (0) |
| brick-wall stop | SDR, hybrid separation | 10 | 4 | 5 (0) | 69 | 6 | 0 | 8 | 15 (0) |
| vehicle comms loss | Today (human drivers) | n/a | | | | | | | |
| vehicle comms loss | SDR, absolute separation | 10 | 0 | 0 (0) | 0 | 0 | 10 | 10 | 7 (0) |
| vehicle comms loss | SDR, relative separation | 10 | 0 | 0 (0) | 0 | 0 | 10 | 5 | 4 (0) |
| vehicle comms loss | SDR, hybrid separation | 10 | 0 | 0 (0) | 0 | 0 | 10 | 6 | 5 (0) |
| segment controller failure (60 s) | Today (human drivers) | n/a | | | | | | | |
| segment controller failure (60 s) | SDR, absolute separation | 10 | 0 | 0 (0) | 0 | 0 | 378 | 367 | 58 (0) |
| segment controller failure (60 s) | SDR, relative separation | 10 | 0 | 0 (0) | 0 | 0 | 496 | 362 | 62 (0) |
| segment controller failure (60 s) | SDR, hybrid separation | 10 | 0 | 0 (0) | 0 | 0 | 502 | 405 | 65 (0) |
| sudden 50 % brake loss | Today (human drivers) | 10 | 0 | 0 (0) | 0 | 0 | 0 | 0 | 69 (69) |
| sudden 50 % brake loss | SDR, absolute separation | 10 | 0 | 0 (0) | 0 | 0 | 0 | 10 | 0 (0) |
| sudden 50 % brake loss | SDR, relative separation | 10 | 0 | 0 (0) | 0 | 7 | 0 | 7 | 0 (0) |
| sudden 50 % brake loss | SDR, hybrid separation | 10 | 0 | 0 (0) | 0 | 6 | 0 | 14 | 2 (0) |

## 3. Hybrid separation variants

*Full run of 2026-11-19 12:46: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

Capacity: main 7,200 + ramp 900 veh/h (more than any variant can carry). Safety: runs at 4,200 + 600 veh/h; "load falls off a truck" drops an object just behind a truck that has a vehicle within 150 m behind it.

| Variant | Served (veh/h) | Mean speed (km/h) | Trip delay (s) | Brick-wall stop: runs with collision / collisions / worst (km/h) | Lost load: runs with collision / collisions / worst (km/h) | Lost load: mean gap of the follower (m) |
|---|---|---|---|---|---|---|
| Relative (no hybrid rules) | 7,094 ± 284 | 98 | 93 | 15 of 30 / 23 / 70 | 27 of 30 / 64 / 79 | 27 |
| Relative + absolute behind faulty vehicles only | 7,094 ± 284 | 98 | 93 | 15 of 30 / 23 / 70 | 27 of 30 / 64 / 79 | 27 |
| + platoon break every 20 | 6,797 ± 263 | 99 | 110 | 14 of 30 / 16 / 70 | 27 of 30 / 52 / 79 | 27 |
| + platoon break every 10 | 6,468 ± 273 | 100 | 137 | 18 of 30 / 27 / 70 | 24 of 30 / 55 / 79 | 28 |
| + platoon break every 5 | 5,856 ± 116 | 99 | 176 | 15 of 30 / 24 / 70 | 19 of 30 / 36 / 79 | 41 |
| + platoon break every 3 | 5,212 ± 83 | 100 | 221 | 14 of 30 / 21 / 70 | 17 of 30 / 27 / 78 | 38 |
| + absolute behind trucks (recommended hybrid) | 6,038 ± 248 | 99 | 162 | 20 of 30 / 27 / 69 | 0 of 30 / 0 / 0 | 66 |
| + absolute behind trucks + platoon break every 10 | 5,677 ± 167 | 99 | 191 | 15 of 30 / 24 / 70 | 0 of 30 / 0 / 0 | 65 |
| Absolute | 3,300 ± 74 | 98 | 314 | 0 of 30 / 0 / 0 | 0 of 30 / 0 / 0 | 53 |

## 4. Detection layers vs foreign objects

*Full run of 2026-11-19 12:46: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

An object that stops a vehicle dead (worst case) appears in lane 2 at 4,200 + 600 veh/h, observed for 4 minutes. Road cameras confirm an object after 0.5 s; each vehicle's own sensor sees it within 120 m with the stated probability (rolled per vehicle); "shared" means the detecting vehicle reports it to the road (confirmed one control cycle later) and with V2V also directly to nearby vehicles.

| Scenario | Detection layers | Policy | Runs with a collision | Collisions | Vehicles that hit the object | Worst impact (km/h) | Mean distance of first vehicle (m) |
|---|---|---|---|---|---|---|---|
| object 150 m ahead | Human drivers (see it within 150 m) | Today | 4 of 30 | 9 (2) | 3 | 72 | 136 |
| object 150 m ahead | Nobody detects it | SDR absolute | 10 of 10 | 15 | 15 | 120 | 152 |
| object 150 m ahead | Nobody detects it | SDR relative | 10 of 10 | 25 | 14 | 120 | 151 |
| object 150 m ahead | Nobody detects it | SDR hybrid | 30 of 30 | 57 | 41 | 120 | 149 |
| object 150 m ahead | Road cameras only (95 %, 0.5 s) | SDR absolute | 0 of 10 | 0 | 0 | 0 | 152 |
| object 150 m ahead | Road cameras only (95 %, 0.5 s) | SDR relative | 0 of 10 | 0 | 0 | 0 | 151 |
| object 150 m ahead | Road cameras only (95 %, 0.5 s) | SDR hybrid | 0 of 30 | 0 | 0 | 0 | 149 |
| object 150 m ahead | Car sensors only (90 %), not shared | SDR absolute | 8 of 10 | 13 | 13 | 120 | 152 |
| object 150 m ahead | Car sensors only (90 %), not shared | SDR relative | 10 of 10 | 24 | 15 | 120 | 151 |
| object 150 m ahead | Car sensors only (90 %), not shared | SDR hybrid | 30 of 30 | 63 | 43 | 120 | 149 |
| object 150 m ahead | Car sensors (90 %) + V2V | SDR absolute | 3 of 10 | 4 | 4 | 120 | 152 |
| object 150 m ahead | Car sensors (90 %) + V2V | SDR relative | 3 of 10 | 7 | 4 | 120 | 151 |
| object 150 m ahead | Car sensors (90 %) + V2V | SDR hybrid | 5 of 30 | 7 | 5 | 120 | 149 |
| object 150 m ahead | Road cameras + car sensors + V2V | SDR absolute | 0 of 10 | 0 | 0 | 0 | 152 |
| object 150 m ahead | Road cameras + car sensors + V2V | SDR relative | 0 of 10 | 0 | 0 | 0 | 151 |
| object 150 m ahead | Road cameras + car sensors + V2V | SDR hybrid | 0 of 30 | 0 | 0 | 0 | 149 |
| object 300 m ahead | Human drivers (see it within 150 m) | Today | 3 of 30 | 8 (2) | 3 | 72 | 164 |
| object 300 m ahead | Nobody detects it | SDR absolute | 10 of 10 | 14 | 14 | 120 | 253 |
| object 300 m ahead | Nobody detects it | SDR relative | 10 of 10 | 23 | 14 | 120 | 212 |
| object 300 m ahead | Nobody detects it | SDR hybrid | 30 of 30 | 57 | 40 | 120 | 234 |
| object 300 m ahead | Road cameras only (95 %, 0.5 s) | SDR absolute | 0 of 10 | 0 | 0 | 0 | 253 |
| object 300 m ahead | Road cameras only (95 %, 0.5 s) | SDR relative | 0 of 10 | 0 | 0 | 0 | 212 |
| object 300 m ahead | Road cameras only (95 %, 0.5 s) | SDR hybrid | 0 of 30 | 0 | 0 | 0 | 234 |
| object 300 m ahead | Car sensors only (90 %), not shared | SDR absolute | 9 of 10 | 17 | 17 | 120 | 253 |
| object 300 m ahead | Car sensors only (90 %), not shared | SDR relative | 10 of 10 | 28 | 16 | 120 | 212 |
| object 300 m ahead | Car sensors only (90 %), not shared | SDR hybrid | 29 of 30 | 64 | 43 | 120 | 234 |
| object 300 m ahead | Car sensors (90 %) + V2V | SDR absolute | 3 of 10 | 4 | 4 | 120 | 253 |
| object 300 m ahead | Car sensors (90 %) + V2V | SDR relative | 3 of 10 | 9 | 4 | 120 | 212 |
| object 300 m ahead | Car sensors (90 %) + V2V | SDR hybrid | 5 of 30 | 10 | 7 | 120 | 234 |
| object 300 m ahead | Road cameras + car sensors + V2V | SDR absolute | 0 of 10 | 0 | 0 | 0 | 253 |
| object 300 m ahead | Road cameras + car sensors + V2V | SDR relative | 0 of 10 | 0 | 0 | 0 | 212 |
| object 300 m ahead | Road cameras + car sensors + V2V | SDR hybrid | 0 of 30 | 0 | 0 | 0 | 234 |
| load falls off a truck | Human drivers (see it within 150 m) | Today | 28 of 30 | 119 (2) | 30 | 91 | 36 |
| load falls off a truck | Nobody detects it | SDR absolute | 10 of 10 | 18 | 18 | 105 | 59 |
| load falls off a truck | Nobody detects it | SDR relative | 10 of 10 | 34 | 16 | 91 | 17 |
| load falls off a truck | Nobody detects it | SDR hybrid | 30 of 30 | 86 | 53 | 91 | 66 |
| load falls off a truck | Road cameras only (95 %, 0.5 s) | SDR absolute | 0 of 10 | 0 | 0 | 0 | 59 |
| load falls off a truck | Road cameras only (95 %, 0.5 s) | SDR relative | 10 of 10 | 25 | 10 | 91 | 17 |
| load falls off a truck | Road cameras only (95 %, 0.5 s) | SDR hybrid | 0 of 30 | 0 | 0 | 0 | 66 |
| load falls off a truck | Car sensors only (90 %), not shared | SDR absolute | 7 of 10 | 14 | 14 | 87 | 59 |
| load falls off a truck | Car sensors only (90 %), not shared | SDR relative | 10 of 10 | 31 | 14 | 90 | 17 |
| load falls off a truck | Car sensors only (90 %), not shared | SDR hybrid | 27 of 30 | 58 | 49 | 90 | 66 |
| load falls off a truck | Car sensors (90 %) + V2V | SDR absolute | 3 of 10 | 6 | 6 | 87 | 59 |
| load falls off a truck | Car sensors (90 %) + V2V | SDR relative | 10 of 10 | 29 | 11 | 90 | 17 |
| load falls off a truck | Car sensors (90 %) + V2V | SDR hybrid | 5 of 30 | 15 | 8 | 90 | 66 |
| load falls off a truck | Road cameras + car sensors + V2V | SDR absolute | 0 of 10 | 0 | 0 | 0 | 59 |
| load falls off a truck | Road cameras + car sensors + V2V | SDR relative | 10 of 10 | 26 | 10 | 90 | 17 |
| load falls off a truck | Road cameras + car sensors + V2V | SDR hybrid | 0 of 30 | 0 | 0 | 0 | 66 |

Numbers in brackets (human rows): collisions in the same traffic without the object.

## 5. Safety lane (hard shoulder)

*Full run of 2026-11-19 12:25: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

4,200 + 600 veh/h, observed for 20 minutes (10 in a quick run). A broken-down vehicle loses propulsion and is towed 15 minutes after it stops. Extra delay = vehicle-hours spent in the system in that time minus the same traffic without the incident. Collisions in brackets: the same traffic without the incident.

| Incident | System | Runs | Collisions (without incident) | Worst impact (km/h) | Sent to safety lane (per run) | Vehicle stopped in a live lane (s per run) | Extra delay (vehicle-hours) |
|---|---|---|---|---|---|---|---|
| breakdown | Today, no hard shoulder | 30 | 2 (4) | 16 | 0.0 | 630 | 18.5 ± 12.8 |
| breakdown | Today, with hard shoulder | 30 | 3 (4) | 17 | 1.0 | 0 | -0.5 ± 4.1 |
| breakdown | SDR hybrid, no safety lane | 30 | 0 (0) | 0 | 0.0 | 540 | 6.3 ± 15.8 |
| breakdown | SDR hybrid, with safety lane | 30 | 0 (0) | 0 | 1.0 | 0 | -0.0 ± 0.0 |
| sudden 50 % brake loss | SDR hybrid, no safety lane | 10 | 0 (0) | 0 | 0.0 | 0 | 0.0 ± 0.0 |
| sudden 50 % brake loss | SDR hybrid, with safety lane | 10 | 0 (0) | 0 | 1.0 | 0 | 0.0 ± 0.0 |
| vehicle comms loss | SDR hybrid, no safety lane | 30 | 0 (0) | 0 | 0.0 | 14 | 0.3 ± 0.2 |
| vehicle comms loss | SDR hybrid, with safety lane | 30 | 0 (0) | 0 | 1.0 | 12 | 0.3 ± 0.2 |

## 6. Road-sensor outage (hybrid falls back to absolute locally)

*Full run of 2026-11-19 12:25: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

| Demand (veh/h) | Road sensors | Served (veh/h) | Trip delay (s) | Queue at gates (end) | Collisions (all runs) |
|---|---|---|---|---|---|
| 4200 + 600 | all sensors up | 4,761 ± 118 | 12 | 0 | 0 |
| 4200 + 600 | down at the on-ramp merge (2–3 km) | 3,994 ± 52 | 132 | 245 | 0 |
| 4200 + 600 | down on a plain stretch (4–5 km) | 4,727 ± 127 | 35 | 0 | 0 |
| 7200 + 900 | all sensors up | 6,038 ± 248 | 162 | 667 | 0 |
| 7200 + 900 | down at the on-ramp merge (2–3 km) | 3,896 ± 124 | 301 | 1,382 | 0 |
| 7200 + 900 | down on a plain stretch (4–5 km) | 5,528 ± 131 | 219 | 698 | 0 |

## 7. Weather

*Full run of 2026-11-19 12:25: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

Main demand 3,600 veh/h + ramp 600 veh/h.

| Weather | System | Served (veh/h) | Mean speed (km/h) | Trip delay (s) | Queue at gates (end) | Collisions (all runs) | Hard brakes / 1000 veh-km |
|---|---|---|---|---|---|---|---|
| dry | Today (human drivers) | 4,149 ± 100 | 106 | 14 | 0 | 0 | 27 |
| dry | SDR, absolute separation | 3,250 ± 52 | 101 | 159 | 326 | 0 | 0 |
| dry | SDR, absolute + adaptive speed | 3,981 ± 137 | 59 | 140 | 6 | 0 | 6 |
| dry | SDR, relative separation | 4,173 ± 98 | 111 | 8 | 0 | 0 | 0 |
| dry | SDR, hybrid separation | 4,170 ± 102 | 109 | 10 | 0 | 0 | 0 |
| wet | Today (human drivers) | 4,176 ± 119 | 95 | 33 | 0 | 0 | 15 |
| wet | SDR, absolute separation | 2,819 ± 44 | 101 | 205 | 462 | 0 | 0 |
| wet | SDR, absolute + adaptive speed | 3,764 ± 110 | 54 | 183 | 87 | 0 | 3 |
| wet | SDR, relative separation | 4,174 ± 99 | 110 | 8 | 0 | 0 | 0 |
| wet | SDR, hybrid separation | 4,172 ± 102 | 109 | 10 | 0 | 0 | 0 |
| ice | Today (human drivers) | 3,958 ± 154 | 60 | 130 | 2 | 2 | 0 |
| ice | SDR, absolute separation | 1,288 ± 15 | 80 | 301 | 973 | 0 | 0 |
| ice | SDR, absolute + adaptive speed | 2,395 ± 54 | 53 | 323 | 580 | 0 | 0 |
| ice | SDR, relative separation | 4,246 ± 70 | 85 | 52 | 0 | 0 | 0 |
| ice | SDR, hybrid separation | 3,576 ± 38 | 83 | 128 | 185 | 0 | 0 |

## 8. Theoretical lane capacity (veh/h per lane, car lengths)

The hybrid row assumes 10 % of followers keep an absolute gap (those behind trucks).

| Weather | Policy | 40 km/h | 60 km/h | 80 km/h | 100 km/h | 120 km/h | Capacity-optimal speed |
|---|---|---|---|---|---|---|---|
| dry | SDR absolute | 1,772 | 1,676 | 1,501 | 1,332 | 1,186 | 41 km/h |
| dry | SDR hybrid (absolute behind the 10 % trucks) | 2,460 | 2,780 | 2,853 | 2,807 | 2,706 | 80 km/h |
| dry | SDR relative | 2,571 | 2,999 | 3,170 | 3,201 | 3,155 | 96 km/h |
| dry | Human (1.4 s headway) | 1,814 | 2,011 | 2,127 | 2,203 | 2,257 | – |
| wet | SDR absolute | 1,632 | 1,494 | 1,310 | 1,147 | 1,012 | 37 km/h |
| wet | SDR hybrid (absolute behind the 10 % trucks) | 2,436 | 2,733 | 2,788 | 2,729 | 2,619 | 77 km/h |
| wet | SDR relative | 2,577 | 3,011 | 3,188 | 3,223 | 3,181 | 97 km/h |
| wet | Human (1.4 s headway) | 1,640 | 1,800 | 1,892 | 1,952 | 1,994 | – |
| ice | SDR absolute | 1,038 | 837 | 683 | 572 | 490 | 24 km/h |
| ice | SDR hybrid (absolute behind the 10 % trucks) | 2,035 | 2,053 | 1,922 | 1,759 | 1,602 | 50 km/h |
| ice | SDR relative | 2,278 | 2,449 | 2,408 | 2,287 | 2,142 | 64 km/h |
| ice | Human (1.4 s headway) | 1,415 | 1,532 | 1,598 | 1,641 | 1,671 | – |

## 9. Radio packet loss

*Full run of 2026-11-19 12:25: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

SDR hybrid at 7,200 + 900 veh/h (saturated). "Fixed gaps": every vehicle keeps the standard allowance for stale authority (about two control cycles). "Widened gaps": the road measures the loss rate and adds the allowance shown, so a run of lost messages rarely outlasts it. A supervision brake is full-force braking because the last authority received is about to run out. Smallest spare = the least distance, over all vehicles and runs, between where a vehicle could still stop and the end of its authority (negative would mean an overrun).

| Packet loss | Gaps | Extra allowance (s) | Served (veh/h) | Supervision brakes per run | Safe stops per run | Hard brakes / 1000 veh-km | Collisions (all runs) | Smallest spare (m) |
|---|---|---|---|---|---|---|---|---|
| 0 % | fixed | 0.00 | 5,978 ± 238 | 0 | 0 | 4 | 0 | 0.49 |
| 1 % | fixed | 0.00 | 6,011 ± 207 | 0 | 0 | 4 | 0 | 0.43 |
| 5 % | fixed | 0.00 | 6,015 ± 234 | 20 | 0 | 7 | 0 | 0.04 |
| 10 % | fixed | 0.00 | 5,947 ± 202 | 201 | 0 | 48 | 0 | 0.00 |
| 20 % | fixed | 0.00 | 5,892 ± 183 | 2,189 | 0 | 536 | 0 | 0.00 |
| 50 % | fixed | 0.00 | 5,117 ± 187 | 19,207 | 46 | 4,789 | 0 | -0.00 |
| 0 % | widened | 0.00 | 5,978 ± 238 | 0 | 0 | 4 | 0 | 0.49 |
| 1 % | widened | 0.00 | 5,972 ± 236 | 0 | 0 | 3 | 0 | 0.34 |
| 5 % | widened | 0.11 | 5,655 ± 246 | 2 | 0 | 5 | 0 | 0.27 |
| 10 % | widened | 0.20 | 5,414 ± 200 | 5 | 0 | 4 | 0 | 0.01 |
| 20 % | widened | 0.37 | 4,885 ± 205 | 8 | 0 | 5 | 0 | 0.01 |
| 50 % | widened | 1.14 | 3,411 ± 108 | 9 | 26 | 29 | 0 | 0.00 |

## 10. Truck share

*Full run of 2026-11-19 12:25: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

Main 7,200 + ramp 900 veh/h (saturated). The hybrid keeps an absolute gap behind every truck, so its cost grows with the truck share.

| Trucks | System | Served (veh/h) | Mean speed (km/h) | Trip delay (s) | Collisions (all runs) |
|---|---|---|---|---|---|
| 0 % | Today (human drivers) | 6,180 ± 102 | 70 | 158 | 0 |
| 0 % | SDR, relative separation | 7,995 ± 116 | 111 | 20 | 0 |
| 0 % | SDR, hybrid separation | 7,995 ± 116 | 111 | 20 | 0 |
| 10 % | Today (human drivers) | 5,395 ± 121 | 61 | 212 | 0 |
| 10 % | SDR, relative separation | 7,094 ± 284 | 98 | 93 | 0 |
| 10 % | SDR, hybrid separation | 6,038 ± 248 | 99 | 162 | 0 |
| 20 % | Today (human drivers) | 4,895 ± 77 | 61 | 237 | 0 |
| 20 % | SDR, relative separation | 5,577 ± 109 | 89 | 178 | 0 |
| 20 % | SDR, hybrid separation | 4,467 ± 146 | 94 | 270 | 0 |
| 30 % | Today (human drivers) | 4,587 ± 99 | 61 | 259 | 1 |
| 30 % | SDR, relative separation | 4,802 ± 153 | 81 | 220 | 0 |
| 30 % | SDR, hybrid separation | 3,576 ± 53 | 90 | 329 | 0 |

## 11. Today's road on its own (calibration check)

*Full run of 2026-11-19 12:25: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

Does the human baseline behave like a real motorway? Reference values: the Highway Capacity Manual gives 2,400 passenger cars per hour per lane under ideal conditions, and queue discharge after a breakdown of about 2,000–2,300; with 10 % trucks that is roughly 6,500 veh/h (capacity) and 5,450–6,300 veh/h (discharge) for three lanes.

| Road | Demand (veh/h) | Served (veh/h) | Served % | Mean speed (km/h) | Hard brakes / 1000 veh-km | Missed exits (%) | Collisions (all runs) |
|---|---|---|---|---|---|---|---|
| Plain road (no ramp, no exit) | 3000 | 3,072 ± 44 | 101 | 113 | 1 | 0.0 | 0 |
| Plain road (no ramp, no exit) | 4500 | 4,510 ± 71 | 101 | 107 | 7 | 0.0 | 0 |
| Plain road (no ramp, no exit) | 6000 | 5,669 ± 60 | 95 | 101 | 22 | 0.0 | 0 |
| Plain road (no ramp, no exit) | 7200 | 5,677 ± 32 | 79 | 101 | 21 | 0.0 | 0 |
| With on-ramp and exit | 2400 + 900 | 3,364 ± 118 | 101 | 110 | 20 | 0.2 | 0 |
| With on-ramp and exit | 3600 + 900 | 4,477 ± 106 | 100 | 98 | 45 | 0.5 | 0 |
| With on-ramp and exit | 4800 + 900 | 5,261 ± 72 | 93 | 75 | 86 | 0.7 | 0 |
| With on-ramp and exit | 6000 + 900 | 5,249 ± 55 | 77 | 58 | 75 | 1.6 | 0 |

## 12. Gate and merge rules

*Full run of 2026-11-19 12:25: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

SDR hybrid, ramp demand 900 veh/h. Rows 1 to 5 add one change at a time to the merge and the gates; the last four vary one rule around row 5. "Let in" shows which entry the traffic came through: about 970 vehicles an hour arrive at the on-ramp.

| Main demand (veh/h) | Rules | Served (veh/h) | Let in: main + ramp (veh/h) | Trip delay, mean (s) | Wait at main entry: median / 95th pct (s) | Wait at on-ramp: median / 95th pct (s) | Longest wait (s) | Queue at end: main + ramp | Mean speed (km/h) | Hard brakes / 1000 veh-km | Collisions (all runs) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 3,600 | Today (human drivers) | 4,477 ± 106 | 3,611 + 874 | 30 ± 9 | 0 / 2 | 0 / 4 | 7 | 0 + 0 | 98 | 44.6 | 0 |
| 3,600 | Before: merge and gates as they were | 4,319 ± 163 | 3,609 + 723 | 29 ± 11 | 0 / 0 | 102 / 207 | 222 | 0 + 50 | 109 | 0.7 | 0 |
| 3,600 | 1. Ramp vehicle keeps its place in the merge order | 4,504 ± 101 | 3,609 + 888 | 19 ± 1 | 0 / 0 | 43 / 46 | 48 | 0 + 8 | 108 | 0.4 | 0 |
| 3,600 | 2. + truck gap opened for a merging truck | 4,494 ± 103 | 3,609 + 887 | 18 ± 1 | 0 / 0 | 44 / 46 | 48 | 0 + 8 | 108 | 0.2 | 0 |
| 3,600 | 3. + right lane kept free by ramp arrivals (was: ramp queue) | 4,490 ± 98 | 3,609 + 887 | 18 ± 1 | 0 / 0 | 44 / 46 | 48 | 0 + 8 | 109 | 0.2 | 0 |
| 3,600 | 4. + ramp gate timer 15 s (was 45 s) | 4,496 ± 95 | 3,609 + 874 | 13 ± 1 | 0 / 0 | 15 / 17 | 19 | 0 + 3 | 108 | 0.3 | 0 |
| 3,600 | 5. + no ramp gate timer (the new default) | 4,507 ± 102 | 3,609 + 875 | 11 ± 1 | 0 / 0 | 0 / 2 | 4 | 0 + 0 | 108 | 0.3 | 0 |
| 3,600 | 5, corridor filled to 90 % | 4,507 ± 102 | 3,609 + 875 | 11 ± 1 | 0 / 0 | 0 / 2 | 4 | 0 + 0 | 108 | 0.3 | 0 |
| 3,600 | 5, corridor filled to 110 % | 4,507 ± 102 | 3,609 + 875 | 11 ± 1 | 0 / 0 | 0 / 2 | 4 | 0 + 0 | 108 | 0.3 | 0 |
| 3,600 | 5, right lane never kept free for the ramp | 4,503 ± 82 | 3,609 + 875 | 15 ± 1 | 0 / 0 | 0 / 2 | 4 | 0 + 0 | 106 | 0.4 | 0 |
| 3,600 | 5, right lane always kept free for the ramp | 4,508 ± 102 | 3,609 + 875 | 11 ± 1 | 0 / 0 | 0 / 2 | 4 | 0 + 0 | 108 | 0.3 | 0 |
| 4,800 | Today (human drivers) | 5,261 ± 72 | 4,774 + 869 | 72 ± 11 | 1 / 5 | 0 / 9 | 19 | 3 + 2 | 75 | 85.7 | 0 |
| 4,800 | Before: merge and gates as they were | 5,131 ± 106 | 4,772 + 338 | 37 ± 6 | 0 / 0 | 329 / 631 | 654 | 0 + 160 | 106 | 0.5 | 0 |
| 4,800 | 1. Ramp vehicle keeps its place in the merge order | 5,634 ± 139 | 4,771 + 882 | 28 ± 5 | 0 / 2 | 45 / 47 | 49 | 1 + 10 | 102 | 0.7 | 0 |
| 4,800 | 2. + truck gap opened for a merging truck | 5,650 ± 118 | 4,772 + 882 | 26 ± 2 | 0 / 0 | 45 / 47 | 49 | 0 + 10 | 103 | 0.7 | 0 |
| 4,800 | 3. + right lane kept free by ramp arrivals (was: ramp queue) | 5,644 ± 123 | 4,772 + 882 | 26 ± 2 | 0 / 0 | 45 / 47 | 49 | 0 + 10 | 103 | 0.6 | 0 |
| 4,800 | 4. + ramp gate timer 15 s (was 45 s) | 5,669 ± 97 | 4,772 + 874 | 21 ± 1 | 0 / 0 | 15 / 17 | 19 | 0 + 4 | 103 | 0.2 | 0 |
| 4,800 | 5. + no ramp gate timer (the new default) | 5,687 ± 108 | 4,772 + 875 | 19 ± 2 | 0 / 0 | 0 / 2 | 4 | 0 + 0 | 103 | 0.6 | 0 |
| 4,800 | 5, corridor filled to 90 % | 5,690 ± 110 | 4,778 + 875 | 19 ± 2 | 0 / 2 | 0 / 2 | 9 | 0 + 0 | 103 | 0.7 | 0 |
| 4,800 | 5, corridor filled to 110 % | 5,687 ± 108 | 4,772 + 875 | 19 ± 2 | 0 / 0 | 0 / 2 | 4 | 0 + 0 | 103 | 0.6 | 0 |
| 4,800 | 5, right lane never kept free for the ramp | 5,649 ± 93 | 4,774 + 875 | 30 ± 4 | 0 / 2 | 0 / 2 | 10 | 0 + 0 | 99 | 3.4 | 0 |
| 4,800 | 5, right lane always kept free for the ramp | 5,678 ± 126 | 4,772 + 875 | 20 ± 4 | 0 / 0 | 0 / 2 | 4 | 0 + 0 | 103 | 1.1 | 0 |
| 7,200 | Today (human drivers) | 5,395 ± 121 | 5,178 + 852 | 212 ± 10 | 164 / 308 | 15 / 45 | 325 | 654 + 6 | 61 | 71.8 | 0 |
| 7,200 | Before: merge and gates as they were | 5,882 ± 76 | 5,736 + 164 | 160 ± 11 | 158 / 248 | 422 / 813 | 852 | 517 + 208 | 102 | 0.3 | 0 |
| 7,200 | 1. Ramp vehicle keeps its place in the merge order | 5,904 ± 165 | 5,043 + 845 | 180 ± 15 | 199 / 333 | 45 / 81 | 349 | 705 + 19 | 99 | 2.0 | 0 |
| 7,200 | 2. + truck gap opened for a merging truck | 5,978 ± 223 | 5,060 + 858 | 174 ± 20 | 190 / 326 | 48 / 75 | 343 | 692 + 16 | 99 | 2.9 | 0 |
| 7,200 | 3. + right lane kept free by ramp arrivals (was: ramp queue) | 6,046 ± 197 | 5,118 + 870 | 162 ± 11 | 178 / 313 | 45 / 69 | 329 | 661 + 13 | 99 | 3.1 | 0 |
| 7,200 | 4. + ramp gate timer 15 s (was 45 s) | 6,014 ± 299 | 5,137 + 857 | 169 ± 14 | 187 / 319 | 19 / 45 | 333 | 672 + 8 | 98 | 2.3 | 0 |
| 7,200 | 5. + no ramp gate timer (the new default) | 6,038 ± 248 | 5,150 + 856 | 162 ± 17 | 182 / 314 | 3 / 33 | 328 | 662 + 5 | 99 | 4.1 | 0 |
| 7,200 | 5, corridor filled to 90 % | 5,948 ± 264 | 5,061 + 875 | 169 ± 10 | 200 / 335 | 0 / 2 | 351 | 709 + 0 | 100 | 2.2 | 0 |
| 7,200 | 5, corridor filled to 110 % | 6,167 ± 208 | 5,403 + 767 | 160 ± 15 | 169 / 280 | 16 / 112 | 294 | 594 + 27 | 96 | 3.0 | 0 |
| 7,200 | 5, right lane never kept free for the ramp | 5,765 ± 235 | 4,885 + 850 | 184 ± 14 | 207 / 354 | 3 / 39 | 372 | 750 + 6 | 96 | 5.8 | 0 |
| 7,200 | 5, right lane always kept free for the ramp | 6,012 ± 190 | 5,147 + 845 | 165 ± 12 | 184 / 318 | 3 / 46 | 331 | 669 + 8 | 99 | 3.4 | 0 |

Trip delay = time from arriving at the entry (including waiting at a gate) to leaving the corridor, minus free-flow time. Waits are those of every vehicle let in during the measuring time, plus the vehicles still waiting at the end with their wait so far; on today's road the "gate" is the queue to get onto a full road. Once demand is above what a road can carry, the queue and the waits grow for as long as the run lasts.

## 13. Speed under pressure

*Full run of 2026-11-19 12:25: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

Ramp demand 900 veh/h. "Adaptive" lowers the speed limit to the speed at which a lane carries most in theory (about 80 km/h for the hybrid, 96 km/h for relative) once more than 8 vehicles wait at the gates, and raises it again when fewer than 3 wait. Trucks drive 90 km/h at most in every row. Trip time is from arriving at the entry to leaving the corridor, waiting at a gate included; it is used here in place of trip delay, because delay is counted against the speed limit of the row and would flatter the slow rows.

| System | Main demand (veh/h) | Speed rule | Served (veh/h) | Mean speed (km/h) | Speed limit at the end (km/h) | Trip time, mean (s) | Wait, 95th pct (s) | Queue at end: main + ramp | Hard brakes / 1000 veh-km | Braking loss (Wh/veh-km) | Collisions (all runs) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| SDR, hybrid separation | 2,400 | fixed 120 km/h | 3,315 ± 96 | 111 | 120 | 140 ± 1 | 1 | 0 + 0 | 0.1 | 24.6 | 0 |
| SDR, hybrid separation | 2,400 | adaptive (slows down when queues build) | 3,342 ± 106 | 111 | 120 | 140 ± 1 | 1 | 0 + 0 | 0.2 | 24.0 | 0 |
| SDR, hybrid separation | 2,400 | fixed 100 km/h | 3,308 ± 101 | 97 | 100 | 158 ± 1 | 0 | 0 + 0 | 0.0 | 10.2 | 0 |
| SDR, hybrid separation | 2,400 | fixed 80 km/h | 3,305 ± 108 | 80 | 80 | 193 ± 1 | 0 | 0 + 0 | 0.0 | 5.6 | 0 |
| SDR, hybrid separation | 3,600 | fixed 120 km/h | 4,491 ± 86 | 108 | 120 | 147 ± 2 | 1 | 0 + 0 | 0.3 | 32.7 | 0 |
| SDR, hybrid separation | 3,600 | adaptive (slows down when queues build) | 4,507 ± 102 | 108 | 120 | 147 ± 2 | 1 | 0 + 0 | 0.3 | 32.3 | 0 |
| SDR, hybrid separation | 3,600 | fixed 100 km/h | 4,485 ± 89 | 96 | 100 | 164 ± 1 | 0 | 0 + 0 | 0.1 | 14.5 | 0 |
| SDR, hybrid separation | 3,600 | fixed 80 km/h | 4,491 ± 110 | 79 | 80 | 199 ± 1 | 0 | 0 + 0 | 0.0 | 8.5 | 0 |
| SDR, hybrid separation | 4,800 | fixed 120 km/h | 5,658 ± 115 | 103 | 120 | 157 ± 3 | 1 | 2 + 0 | 1.0 | 41.3 | 0 |
| SDR, hybrid separation | 4,800 | adaptive (slows down when queues build) | 5,687 ± 108 | 103 | 120 | 157 ± 2 | 1 | 0 + 0 | 0.6 | 41.3 | 0 |
| SDR, hybrid separation | 4,800 | fixed 100 km/h | 5,662 ± 116 | 93 | 100 | 173 ± 3 | 1 | 1 + 1 | 0.5 | 23.1 | 0 |
| SDR, hybrid separation | 4,800 | fixed 80 km/h | 5,629 ± 155 | 77 | 80 | 211 ± 5 | 4 | 0 + 1 | 0.6 | 17.3 | 0 |
| SDR, hybrid separation | 6,000 | fixed 120 km/h | 6,009 ± 213 | 98 | 120 | 224 ± 24 | 147 | 265 + 6 | 3.4 | 44.5 | 0 |
| SDR, hybrid separation | 6,000 | adaptive (slows down when queues build) | 5,935 ± 167 | 73 | 80 | 239 ± 24 | 129 | 104 + 60 | 1.3 | 32.1 | 0 |
| SDR, hybrid separation | 6,000 | fixed 100 km/h | 6,169 ± 150 | 87 | 100 | 230 ± 23 | 112 | 165 + 38 | 2.2 | 32.8 | 0 |
| SDR, hybrid separation | 6,000 | fixed 80 km/h | 6,051 ± 187 | 70 | 80 | 264 ± 20 | 145 | 150 + 61 | 1.3 | 26.7 | 0 |
| SDR, hybrid separation | 7,200 | fixed 120 km/h | 5,978 ± 238 | 99 | 120 | 298 ± 24 | 313 | 663 + 7 | 3.9 | 44.8 | 0 |
| SDR, hybrid separation | 7,200 | adaptive (slows down when queues build) | 6,023 ± 152 | 69 | 80 | 325 ± 24 | 254 | 532 + 70 | 1.3 | 27.2 | 0 |
| SDR, hybrid separation | 7,200 | fixed 100 km/h | 6,047 ± 245 | 86 | 100 | 309 ± 25 | 293 | 617 + 23 | 2.3 | 33.1 | 0 |
| SDR, hybrid separation | 7,200 | fixed 80 km/h | 6,111 ± 246 | 69 | 80 | 334 ± 23 | 255 | 531 + 75 | 1.5 | 26.7 | 0 |
| SDR, relative separation | 2,400 | fixed 120 km/h | 3,312 ± 96 | 112 | 120 | 138 ± 1 | 1 | 0 + 0 | 0.0 | 21.5 | 0 |
| SDR, relative separation | 2,400 | adaptive (slows down when queues build) | 3,336 ± 112 | 112 | 120 | 139 ± 1 | 1 | 0 + 0 | 0.0 | 21.3 | 0 |
| SDR, relative separation | 2,400 | fixed 100 km/h | 3,307 ± 101 | 98 | 100 | 157 ± 1 | 0 | 0 + 0 | 0.0 | 8.4 | 0 |
| SDR, relative separation | 2,400 | fixed 80 km/h | 3,305 ± 109 | 80 | 80 | 192 ± 1 | 0 | 0 + 0 | 0.0 | 4.2 | 0 |
| SDR, relative separation | 3,600 | fixed 120 km/h | 4,488 ± 77 | 110 | 120 | 144 ± 1 | 0 | 0 + 0 | 0.1 | 26.8 | 0 |
| SDR, relative separation | 3,600 | adaptive (slows down when queues build) | 4,514 ± 92 | 110 | 120 | 144 ± 1 | 0 | 0 + 0 | 0.1 | 26.7 | 0 |
| SDR, relative separation | 3,600 | fixed 100 km/h | 4,487 ± 85 | 97 | 100 | 162 ± 1 | 0 | 0 + 0 | 0.0 | 11.0 | 0 |
| SDR, relative separation | 3,600 | fixed 80 km/h | 4,495 ± 108 | 80 | 80 | 198 ± 1 | 0 | 0 + 0 | 0.0 | 5.7 | 0 |
| SDR, relative separation | 4,800 | fixed 120 km/h | 5,687 ± 111 | 107 | 120 | 150 ± 1 | 0 | 0 + 0 | 0.1 | 33.9 | 0 |
| SDR, relative separation | 4,800 | adaptive (slows down when queues build) | 5,689 ± 110 | 107 | 120 | 150 ± 1 | 0 | 0 + 0 | 0.1 | 34.7 | 0 |
| SDR, relative separation | 4,800 | fixed 100 km/h | 5,681 ± 100 | 96 | 100 | 166 ± 1 | 0 | 0 + 0 | 0.0 | 15.6 | 0 |
| SDR, relative separation | 4,800 | fixed 80 km/h | 5,680 ± 122 | 79 | 80 | 202 ± 1 | 0 | 0 + 0 | 0.0 | 9.2 | 0 |
| SDR, relative separation | 6,000 | fixed 120 km/h | 6,839 ± 117 | 102 | 120 | 160 ± 4 | 6 | 6 + 0 | 0.7 | 43.0 | 0 |
| SDR, relative separation | 6,000 | adaptive (slows down when queues build) | 6,834 ± 125 | 102 | 117 | 160 ± 5 | 2 | 2 + 0 | 0.6 | 42.9 | 0 |
| SDR, relative separation | 6,000 | fixed 100 km/h | 6,844 ± 100 | 93 | 100 | 174 ± 5 | 2 | 2 + 0 | 0.4 | 25.2 | 0 |
| SDR, relative separation | 6,000 | fixed 80 km/h | 6,760 ± 145 | 76 | 80 | 214 ± 8 | 10 | 2 + 5 | 0.5 | 18.8 | 0 |
| SDR, relative separation | 7,200 | fixed 120 km/h | 7,058 ± 281 | 98 | 120 | 225 ± 23 | 149 | 314 + 7 | 1.9 | 45.7 | 0 |
| SDR, relative separation | 7,200 | adaptive (slows down when queues build) | 7,077 ± 185 | 84 | 96 | 233 ± 21 | 116 | 230 + 31 | 1.1 | 34.3 | 0 |
| SDR, relative separation | 7,200 | fixed 100 km/h | 7,226 ± 176 | 87 | 100 | 228 ± 18 | 107 | 220 + 26 | 1.4 | 33.8 | 0 |
| SDR, relative separation | 7,200 | fixed 80 km/h | 6,943 ± 188 | 70 | 80 | 280 ± 20 | 133 | 260 + 53 | 1.1 | 27.2 | 0 |

## 14. Cheaper truck rules

*Full run of 2026-11-19 12:25: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

Capacity: main 7,200 + ramp 900 veh/h (saturated), SDR hybrid with one change to the rule that keeps a brick-wall gap behind every truck. Lost load: at 4,200 + 600 veh/h an object lands just behind a truck that has a vehicle within 150 m behind it. Only the road sensors count in these tests (they see every object, after the time stated; car sensors are switched off), so that the gap is tested against the confirmation time. Each lost-load cell is: runs with a collision / collisions / worst impact (km/h).

| Trucks | Truck rule | Served (veh/h) | Against today's road | Mean speed (km/h) | Hard brakes / 1000 veh-km | Lost load stops dead, confirmed in 0.5 s | Stops dead, confirmed in 1 s | Slides at 6 m/s², confirmed in 1 s | Special case |
|---|---|---|---|---|---|---|---|---|---|
| 10 % | Today (human drivers) | 5,364 ± 98 |  | 60 | 73.4 |  |  |  |  |
| 10 % | Brick-wall gap behind every truck (the rule as it is) | 6,038 ± 248 | +11.9 % (outside the noise) | 99 | 4.1 | 0 of 10 / 0 / 0 |  |  |  |
| 10 % | No truck rule (relative separation) | 7,094 ± 284 | +31.5 % (outside the noise) | 98 | 2.0 | 10 of 10 / 25 / 91 |  |  |  |
| 10 % | a. Not behind enclosed, monitored trucks: 25 % of trucks | 6,243 ± 194 | +15.7 % (outside the noise) | 99 | 3.4 | 0 of 10 / 0 / 0 |  |  |  |
| 10 % | a. Not behind enclosed, monitored trucks: 50 % | 6,477 ± 150 | +20.0 % (outside the noise) | 99 | 3.6 | 0 of 10 / 0 / 0 |  |  |  |
| 10 % | a. Not behind enclosed, monitored trucks: 75 % | 6,709 ± 255 | +24.3 % (outside the noise) | 98 | 2.2 | 0 of 10 / 0 / 0 |  |  |  |
| 10 % | b. Gap for a load that stops dead + 0.5 s to confirm it | 5,749 ± 199 | +6.6 % (outside the noise) | 99 | 4.2 | 0 of 10 / 0 / 0 |  |  |  |
| 10 % | b. Gap for a load that stops dead + 1 s to confirm it | 5,527 ± 214 | +3.0 % (outside the noise) | 98 | 3.6 | 0 of 10 / 0 / 0 |  |  |  |
| 10 % | b. Gap for a load that slides (6 m/s²) + 0.5 s to confirm it | 6,566 ± 196 | +21.7 % (outside the noise) | 99 | 2.5 | 10 of 10 / 22 / 77 |  |  |  |
| 10 % | b. Gap for a load that slides (6 m/s²) + 1 s to confirm it | 6,237 ± 202 | +15.6 % (outside the noise) | 99 | 2.6 | 9 of 10 / 17 / 58 |  |  |  |
| 10 % | c. Trucks follow trucks closely | 5,957 ± 182 | +10.4 % (outside the noise) | 100 | 3.2 | 2 of 10 / 2 / 82 |  |  |  |
| 10 % | d. Truck lane | 4,642 ± 278 | −14.0 % (outside the noise) | 95 | 1.3 | 0 of 10 / 0 / 0 |  |  |  |
| 10 % | c + d. Truck lane, trucks follow trucks closely | 4,646 ± 176 | −13.9 % (outside the noise) | 90 | 2.0 | 2 of 10 / 2 / 82 |  |  |  |
| 20 % | Today (human drivers) | 4,882 ± 98 |  | 59 | 54.0 |  |  |  |  |
| 20 % | Brick-wall gap behind every truck (the rule as it is) | 4,467 ± 146 | −8.7 % (outside the noise) | 94 | 3.0 | 0 of 10 / 0 / 0 | 10 of 10 / 10 / 47 | 0 of 10 / 0 / 0 |  |
| 20 % | No truck rule (relative separation) | 5,577 ± 109 | +13.9 % (outside the noise) | 89 | 2.4 | 9 of 10 / 16 / 91 | 9 of 10 / 19 / 91 | 5 of 10 / 5 / 10 |  |
| 20 % | a. Not behind enclosed, monitored trucks: 25 % of trucks | 4,770 ± 80 | −2.5 % (outside the noise) | 94 | 3.8 | 0 of 10 / 0 / 0 | 8 of 10 / 8 / 47 | 0 of 10 / 0 / 0 | enclosed truck loses a load anyway: 9 of 10 / 21 / 90 |
| 20 % | a. Not behind enclosed, monitored trucks: 50 % | 5,047 ± 56 | +3.1 % (outside the noise) | 93 | 3.2 | 0 of 10 / 0 / 0 | 9 of 10 / 9 / 47 | 0 of 10 / 0 / 0 | enclosed truck loses a load anyway: 10 of 10 / 26 / 90 |
| 20 % | a. Not behind enclosed, monitored trucks: 75 % | 5,249 ± 100 | +7.2 % (outside the noise) | 91 | 3.2 | 0 of 10 / 0 / 0 | 9 of 10 / 9 / 47 | 0 of 10 / 0 / 0 | enclosed truck loses a load anyway: 9 of 10 / 24 / 90 |
| 20 % | b. Gap for a load that stops dead + 0.5 s to confirm it | 4,170 ± 107 | −14.8 % (outside the noise) | 94 | 4.0 | 0 of 10 / 0 / 0 | 1 of 10 / 1 / 11 | 0 of 10 / 0 / 0 |  |
| 20 % | b. Gap for a load that stops dead + 1 s to confirm it | 3,929 ± 88 | −19.7 % (outside the noise) | 94 | 3.4 | 0 of 10 / 0 / 0 | 0 of 10 / 0 / 0 | 0 of 10 / 0 / 0 |  |
| 20 % | b. Gap for a load that slides (6 m/s²) + 0.5 s to confirm it | 5,090 ± 57 | +4.0 % (outside the noise) | 89 | 1.5 | 10 of 10 / 16 / 77 | 10 of 10 / 19 / 91 | 0 of 10 / 0 / 0 |  |
| 20 % | b. Gap for a load that slides (6 m/s²) + 1 s to confirm it | 4,862 ± 122 | −0.4 % (within the noise) | 91 | 1.5 | 9 of 10 / 14 / 58 | 9 of 10 / 17 / 77 | 0 of 10 / 0 / 0 |  |
| 20 % | c. Trucks follow trucks closely | 4,541 ± 60 | −7.2 % (outside the noise) | 96 | 2.0 | 0 of 10 / 0 / 0 | 8 of 10 / 8 / 47 | 0 of 10 / 0 / 0 | follower is a truck: 6 of 10 / 6 / 82 |
| 20 % | d. Truck lane | 3,932 ± 168 | −19.7 % (outside the noise) | 85 | 0.5 | 0 of 10 / 0 / 0 | 9 of 10 / 9 / 47 | 0 of 10 / 0 / 0 |  |
| 20 % | c + d. Truck lane, trucks follow trucks closely | 4,403 ± 181 | −10.1 % (outside the noise) | 83 | 2.2 | 6 of 10 / 9 / 82 | 10 of 10 / 14 / 90 | 5 of 10 / 5 / 25 | follower is a truck: 10 of 10 / 14 / 82 |
| 30 % | Today (human drivers) | 4,587 ± 99 |  | 61 | 44.6 |  |  |  |  |
| 30 % | Brick-wall gap behind every truck (the rule as it is) | 3,576 ± 53 | −21.6 % (outside the noise) | 90 | 2.3 | 0 of 10 / 0 / 0 |  |  |  |
| 30 % | No truck rule (relative separation) | 4,802 ± 153 | +4.7 % (outside the noise) | 81 | 2.4 | 10 of 10 / 24 / 90 |  |  |  |
| 30 % | a. Not behind enclosed, monitored trucks: 25 % of trucks | 3,837 ± 92 | −15.9 % (outside the noise) | 88 | 2.1 | 0 of 10 / 0 / 0 |  |  |  |
| 30 % | a. Not behind enclosed, monitored trucks: 50 % | 4,040 ± 206 | −11.5 % (outside the noise) | 86 | 2.1 | 0 of 10 / 0 / 0 |  |  |  |
| 30 % | a. Not behind enclosed, monitored trucks: 75 % | 4,394 ± 93 | −3.7 % (outside the noise) | 83 | 2.7 | 0 of 10 / 0 / 0 |  |  |  |
| 30 % | b. Gap for a load that stops dead + 0.5 s to confirm it | 3,291 ± 74 | −27.9 % (outside the noise) | 88 | 2.0 | 0 of 10 / 0 / 0 |  |  |  |
| 30 % | b. Gap for a load that stops dead + 1 s to confirm it | 3,044 ± 47 | −33.3 % (outside the noise) | 88 | 2.3 | 0 of 10 / 0 / 0 |  |  |  |
| 30 % | b. Gap for a load that slides (6 m/s²) + 0.5 s to confirm it | 4,303 ± 154 | −5.7 % (outside the noise) | 82 | 2.5 | 10 of 10 / 17 / 77 |  |  |  |
| 30 % | b. Gap for a load that slides (6 m/s²) + 1 s to confirm it | 3,916 ± 84 | −14.2 % (outside the noise) | 82 | 0.7 | 9 of 10 / 15 / 58 |  |  |  |
| 30 % | c. Trucks follow trucks closely | 3,750 ± 106 | −17.8 % (outside the noise) | 92 | 2.1 | 2 of 10 / 3 / 82 |  |  |  |
| 30 % | d. Truck lane | 3,037 ± 31 | −33.5 % (outside the noise) | 71 | 1.6 | 0 of 10 / 0 / 0 |  |  |  |
| 30 % | c + d. Truck lane, trucks follow trucks closely | 3,370 ± 43 | −26.2 % (outside the noise) | 72 | 1.4 | 2 of 10 / 2 / 82 |  |  |  |

The extra lost-load tests (1 s, sliding load, special cases) were run at 20 % trucks only. In the "a" rows the load falls off a truck that still has the long gap behind it; the special case shows what happens if an exempted truck loses something after all.

## 15. Which differences are real

Both rows of a comparison were run with the same seeds, so they saw the same traffic. The difference is taken per seed and averaged; the interval is its 95 % confidence interval (Student's t). "Outside the noise" means the interval does not include zero. "Within the noise" means these runs cannot tell the two apart: the true difference is probably inside the interval, and may be zero. A comparison that was within the noise after the standard number of runs was extended once, to the number of runs shown, and is reported as it then stood. An incident row that is compared with a row extended in this way gets the same number of runs, so that collision counts are compared like against like. With this many comparisons, about one in twenty of those near the boundary will be on the wrong side by chance.

### Throughput and delay vs demand (section 1)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 2,400 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Hard brakes / 1000 veh-km | 15 | 0.37 | 21.2 | -20.8 (−98 %) | -24.0 to -17.6 | outside the noise |
| 2,400 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Served (veh/h) | 15 | 3,255 | 3,317 | -62.4 (−2 %) | -100 to -24.7 | outside the noise |
| 2,400 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Trip delay (s) | 15 | 36.4 | 10.2 | 26.1 (+256 %) | 20.1 to 32.2 | outside the noise |
| 3,600 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.28 | 44.6 | -44.3 (−99 %) | -47.4 to -41.2 | outside the noise |
| 3,600 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Served (veh/h) | 5 | 3,332 | 4,477 | -1,145 (−26 %) | -1,289 to -1,000 | outside the noise |
| 3,600 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Trip delay (s) | 5 | 173 | 29.6 | 143 (+484 %) | 127 to 160 | outside the noise |
| 4,800 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.39 | 85.7 | -85.3 (−100 %) | -99.3 to -71.3 | outside the noise |
| 4,800 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Served (veh/h) | 5 | 3,327 | 5,261 | -1,934 (−37 %) | -2,074 to -1,793 | outside the noise |
| 4,800 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Trip delay (s) | 5 | 245 | 72.2 | 173 (+239 %) | 159 to 186 | outside the noise |
| 6,000 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.34 | 74.5 | -74.2 (−100 %) | -90.4 to -57.9 | outside the noise |
| 6,000 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Served (veh/h) | 5 | 3,312 | 5,249 | -1,937 (−37 %) | -2,065 to -1,809 | outside the noise |
| 6,000 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Trip delay (s) | 5 | 286 | 155 | 131 (+84 %) | 114 to 148 | outside the noise |
| 7,200 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.63 | 71.8 | -71.1 (−99 %) | -91.0 to -51.3 | outside the noise |
| 7,200 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Served (veh/h) | 5 | 3,300 | 5,395 | -2,095 (−39 %) | -2,304 to -1,887 | outside the noise |
| 7,200 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Trip delay (s) | 5 | 314 | 212 | 102 (+48 %) | 94.0 to 110 | outside the noise |
| 2,400 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Hard brakes / 1000 veh-km | 15 | 0.19 | 21.2 | -21.0 (−99 %) | -24.2 to -17.7 | outside the noise |
| 2,400 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Served (veh/h) | 15 | 3,289 | 3,317 | -28.0 (−1 %) | -50.1 to -5.94 | outside the noise |
| 2,400 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Trip delay (s) | 15 | 32.2 | 10.2 | 22.0 (+215 %) | 18.4 to 25.6 | outside the noise |
| 3,600 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 8.97 | 44.6 | -35.6 (−80 %) | -37.3 to -34.0 | outside the noise |
| 3,600 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Served (veh/h) | 5 | 3,998 | 4,477 | -478 (−11 %) | -613 to -344 | outside the noise |
| 3,600 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Trip delay (s) | 5 | 168 | 29.6 | 138 (+466 %) | 123 to 153 | outside the noise |
| 4,800 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 12.0 | 85.7 | -73.7 (−86 %) | -92.7 to -54.6 | outside the noise |
| 4,800 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Served (veh/h) | 5 | 4,048 | 5,261 | -1,213 (−23 %) | -1,415 to -1,011 | outside the noise |
| 4,800 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Trip delay (s) | 5 | 267 | 72.2 | 195 (+270 %) | 177 to 212 | outside the noise |
| 6,000 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 11.7 | 74.5 | -62.8 (−84 %) | -77.9 to -47.7 | outside the noise |
| 6,000 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Served (veh/h) | 5 | 4,080 | 5,249 | -1,169 (−22 %) | -1,411 to -927 | outside the noise |
| 6,000 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Trip delay (s) | 5 | 323 | 155 | 168 (+108 %) | 139 to 197 | outside the noise |
| 7,200 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 9.39 | 71.8 | -62.4 (−87 %) | -81.9 to -42.8 | outside the noise |
| 7,200 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Served (veh/h) | 5 | 4,082 | 5,395 | -1,313 (−24 %) | -1,559 to -1,067 | outside the noise |
| 7,200 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Trip delay (s) | 5 | 362 | 212 | 150 (+71 %) | 129 to 172 | outside the noise |
| 2,400 + 900 veh/h | SDR, relative separation | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.00 | 19.8 | -19.8 (−100 %) | -27.6 to -12.0 | outside the noise |
| 2,400 + 900 veh/h | SDR, relative separation | Today (human drivers) | Served (veh/h) | 5 | 3,336 | 3,364 | -28.0 (−1 %) | -46.9 to -9.09 | outside the noise |
| 2,400 + 900 veh/h | SDR, relative separation | Today (human drivers) | Trip delay (s) | 5 | 6.68 | 10.2 | -3.55 (−35 %) | -5.13 to -1.98 | outside the noise |
| 3,600 + 900 veh/h | SDR, relative separation | Today (human drivers) | Hard brakes / 1000 veh-km | 15 | 0.05 | 45.5 | -45.5 (−100 %) | -49.3 to -41.7 | outside the noise |
| 3,600 + 900 veh/h | SDR, relative separation | Today (human drivers) | Served (veh/h) | 15 | 4,488 | 4,419 | 68.5 (+2 %) | 22.4 to 115 | outside the noise |
| 3,600 + 900 veh/h | SDR, relative separation | Today (human drivers) | Trip delay (s) | 15 | 8.36 | 28.7 | -20.4 (−71 %) | -24.2 to -16.6 | outside the noise |
| 4,800 + 900 veh/h | SDR, relative separation | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.06 | 85.7 | -85.6 (−100 %) | -99.6 to -71.6 | outside the noise |
| 4,800 + 900 veh/h | SDR, relative separation | Today (human drivers) | Served (veh/h) | 5 | 5,689 | 5,261 | 428 (+8 %) | 265 to 591 | outside the noise |
| 4,800 + 900 veh/h | SDR, relative separation | Today (human drivers) | Trip delay (s) | 5 | 11.9 | 72.2 | -60.3 (−83 %) | -74.2 to -46.3 | outside the noise |
| 6,000 + 900 veh/h | SDR, relative separation | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.52 | 74.5 | -74.0 (−99 %) | -90.6 to -57.4 | outside the noise |
| 6,000 + 900 veh/h | SDR, relative separation | Today (human drivers) | Served (veh/h) | 5 | 6,878 | 5,249 | 1,630 (+31 %) | 1,430 to 1,829 | outside the noise |
| 6,000 + 900 veh/h | SDR, relative separation | Today (human drivers) | Trip delay (s) | 5 | 18.9 | 155 | -137 (−88 %) | -156 to -117 | outside the noise |
| 7,200 + 900 veh/h | SDR, relative separation | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 2.05 | 71.8 | -69.7 (−97 %) | -88.8 to -50.7 | outside the noise |
| 7,200 + 900 veh/h | SDR, relative separation | Today (human drivers) | Served (veh/h) | 5 | 7,094 | 5,395 | 1,699 (+31 %) | 1,249 to 2,149 | outside the noise |
| 7,200 + 900 veh/h | SDR, relative separation | Today (human drivers) | Trip delay (s) | 5 | 92.6 | 212 | -119 (−56 %) | -147 to -91.4 | outside the noise |
| 2,400 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Hard brakes / 1000 veh-km | 15 | 0.09 | 21.2 | -21.1 (−100 %) | -24.3 to -17.8 | outside the noise |
| 2,400 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 15 | 3,315 | 3,317 | -1.87 (−0 %) | -15.0 to 11.2 | within the noise |
| 2,400 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Trip delay (s) | 15 | 7.99 | 10.2 | -2.23 (−22 %) | -2.88 to -1.59 | outside the noise |
| 3,600 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Hard brakes / 1000 veh-km | 15 | 0.30 | 45.5 | -45.2 (−99 %) | -48.9 to -41.5 | outside the noise |
| 3,600 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 15 | 4,491 | 4,419 | 71.7 (+2 %) | 28.7 to 115 | outside the noise |
| 3,600 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Trip delay (s) | 15 | 11.2 | 28.7 | -17.5 (−61 %) | -21.3 to -13.8 | outside the noise |
| 4,800 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.60 | 85.7 | -85.1 (−99 %) | -98.6 to -71.5 | outside the noise |
| 4,800 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 5 | 5,687 | 5,261 | 426 (+8 %) | 255 to 598 | outside the noise |
| 4,800 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Trip delay (s) | 5 | 19.0 | 72.2 | -53.2 (−74 %) | -68.4 to -38.0 | outside the noise |
| 6,000 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 2.77 | 74.5 | -71.8 (−96 %) | -88.7 to -54.8 | outside the noise |
| 6,000 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 5 | 5,975 | 5,249 | 726 (+14 %) | 341 to 1,112 | outside the noise |
| 6,000 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Trip delay (s) | 5 | 94.9 | 155 | -60.4 (−39 %) | -101 to -19.8 | outside the noise |
| 7,200 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 4.08 | 71.8 | -67.7 (−94 %) | -85.8 to -49.6 | outside the noise |
| 7,200 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 5 | 6,038 | 5,395 | 643 (+12 %) | 274 to 1,013 | outside the noise |
| 7,200 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Trip delay (s) | 5 | 162 | 212 | -49.6 (−23 %) | -78.9 to -20.2 | outside the noise |

### Incidents (section 2)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| debris | SDR, absolute separation | Today (human drivers) | Collisions per run | 30 | 0.00 | 0.23 | -0.23 (−100 %) | -0.49 to 0.02 | within the noise |
| debris | SDR, relative separation | Today (human drivers) | Collisions per run | 30 | 0.00 | 0.23 | -0.23 (−100 %) | -0.49 to 0.02 | within the noise |
| debris | SDR, hybrid separation | Today (human drivers) | Collisions per run | 30 | 0.00 | 0.23 | -0.23 (−100 %) | -0.49 to 0.02 | within the noise |
| brick-wall stop | SDR, absolute separation | Today (human drivers) | Collisions per run | 10 | 0.00 | 3.30 | -3.30 (−100 %) | -4.85 to -1.75 | outside the noise |
| brick-wall stop | SDR, relative separation | Today (human drivers) | Collisions per run | 10 | 0.80 | 3.30 | -2.50 (−76 %) | -4.05 to -0.95 | outside the noise |
| brick-wall stop | SDR, hybrid separation | Today (human drivers) | Collisions per run | 10 | 0.50 | 3.30 | -2.80 (−85 %) | -4.37 to -1.23 | outside the noise |
| sudden 50 % brake loss | SDR, absolute separation | Today (human drivers) | Collisions per run | 10 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| sudden 50 % brake loss | SDR, relative separation | Today (human drivers) | Collisions per run | 10 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| sudden 50 % brake loss | SDR, hybrid separation | Today (human drivers) | Collisions per run | 10 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |

### Hybrid separation variants (section 3)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| capacity, 7,200 + 900 veh/h | Relative + absolute behind faulty vehicles only | Relative (no hybrid rules) | Served (veh/h) | 5 | 7,094 | 7,094 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| brick-wall stop | Relative + absolute behind faulty vehicles only | Relative (no hybrid rules) | Collisions per run | 30 | 0.77 | 0.77 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| load falls off a truck | Relative + absolute behind faulty vehicles only | Relative (no hybrid rules) | Collisions per run | 30 | 2.13 | 2.13 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| capacity, 7,200 + 900 veh/h | + platoon break every 20 | Relative (no hybrid rules) | Served (veh/h) | 5 | 6,797 | 7,094 | -298 (−4 %) | -584 to -11.4 | outside the noise |
| brick-wall stop | + platoon break every 20 | Relative (no hybrid rules) | Collisions per run | 30 | 0.53 | 0.77 | -0.23 (−30 %) | -0.57 to 0.10 | within the noise |
| load falls off a truck | + platoon break every 20 | Relative (no hybrid rules) | Collisions per run | 30 | 1.73 | 2.13 | -0.40 (−19 %) | -0.70 to -0.10 | outside the noise |
| capacity, 7,200 + 900 veh/h | + platoon break every 10 | Relative (no hybrid rules) | Served (veh/h) | 5 | 6,468 | 7,094 | -626 (−9 %) | -852 to -401 | outside the noise |
| brick-wall stop | + platoon break every 10 | Relative (no hybrid rules) | Collisions per run | 30 | 0.90 | 0.77 | 0.13 (+17 %) | -0.22 to 0.48 | within the noise |
| load falls off a truck | + platoon break every 10 | Relative (no hybrid rules) | Collisions per run | 30 | 1.83 | 2.13 | -0.30 (−14 %) | -0.75 to 0.15 | within the noise |
| capacity, 7,200 + 900 veh/h | + platoon break every 5 | Relative (no hybrid rules) | Served (veh/h) | 5 | 5,856 | 7,094 | -1,238 (−17 %) | -1,628 to -849 | outside the noise |
| brick-wall stop | + platoon break every 5 | Relative (no hybrid rules) | Collisions per run | 30 | 0.80 | 0.77 | 0.03 (+4 %) | -0.42 to 0.49 | within the noise |
| load falls off a truck | + platoon break every 5 | Relative (no hybrid rules) | Collisions per run | 30 | 1.20 | 2.13 | -0.93 (−44 %) | -1.39 to -0.47 | outside the noise |
| capacity, 7,200 + 900 veh/h | + platoon break every 3 | Relative (no hybrid rules) | Served (veh/h) | 5 | 5,212 | 7,094 | -1,882 (−27 %) | -2,214 to -1,551 | outside the noise |
| brick-wall stop | + platoon break every 3 | Relative (no hybrid rules) | Collisions per run | 30 | 0.70 | 0.77 | -0.07 (−9 %) | -0.49 to 0.36 | within the noise |
| load falls off a truck | + platoon break every 3 | Relative (no hybrid rules) | Collisions per run | 30 | 0.90 | 2.13 | -1.23 (−58 %) | -1.67 to -0.80 | outside the noise |
| capacity, 7,200 + 900 veh/h | + absolute behind trucks (recommended hybrid) | Relative (no hybrid rules) | Served (veh/h) | 5 | 6,038 | 7,094 | -1,056 (−15 %) | -1,361 to -751 | outside the noise |
| brick-wall stop | + absolute behind trucks (recommended hybrid) | Relative (no hybrid rules) | Collisions per run | 30 | 0.90 | 0.77 | 0.13 (+17 %) | -0.29 to 0.56 | within the noise |
| load falls off a truck | + absolute behind trucks (recommended hybrid) | Relative (no hybrid rules) | Collisions per run | 30 | 0.00 | 2.13 | -2.13 (−100 %) | -2.52 to -1.74 | outside the noise |
| capacity, 7,200 + 900 veh/h | + absolute behind trucks + platoon break every 10 | Relative (no hybrid rules) | Served (veh/h) | 5 | 5,677 | 7,094 | -1,418 (−20 %) | -1,736 to -1,099 | outside the noise |
| brick-wall stop | + absolute behind trucks + platoon break every 10 | Relative (no hybrid rules) | Collisions per run | 30 | 0.80 | 0.77 | 0.03 (+4 %) | -0.47 to 0.54 | within the noise |
| load falls off a truck | + absolute behind trucks + platoon break every 10 | Relative (no hybrid rules) | Collisions per run | 30 | 0.00 | 2.13 | -2.13 (−100 %) | -2.52 to -1.74 | outside the noise |
| capacity, 7,200 + 900 veh/h | Absolute | Relative (no hybrid rules) | Served (veh/h) | 5 | 3,300 | 7,094 | -3,794 (−53 %) | -4,077 to -3,512 | outside the noise |
| brick-wall stop | Absolute | Relative (no hybrid rules) | Collisions per run | 30 | 0.00 | 0.77 | -0.77 (−100 %) | -1.10 to -0.43 | outside the noise |
| load falls off a truck | Absolute | Relative (no hybrid rules) | Collisions per run | 30 | 0.00 | 2.13 | -2.13 (−100 %) | -2.52 to -1.74 | outside the noise |

### Object 150 m ahead (section 4)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| object 150 m ahead; Nobody detects it | SDR hybrid | Today | Collisions per run | 30 | 1.90 | 0.30 | 1.60 (+533 %) | 1.06 to 2.14 | outside the noise |
| object 150 m ahead; Road cameras only (95 %, 0.5 s) | SDR hybrid | Today | Collisions per run | 30 | 0.00 | 0.30 | -0.30 (−100 %) | -0.61 to 0.01 | within the noise |
| object 150 m ahead; Car sensors only (90 %), not shared | SDR hybrid | Today | Collisions per run | 30 | 2.10 | 0.30 | 1.80 (+600 %) | 1.14 to 2.46 | outside the noise |
| object 150 m ahead; Car sensors (90 %) + V2V | SDR hybrid | Today | Collisions per run | 30 | 0.23 | 0.30 | -0.07 (−22 %) | -0.45 to 0.31 | within the noise |
| object 150 m ahead; Road cameras + car sensors + V2V | SDR hybrid | Today | Collisions per run | 30 | 0.00 | 0.30 | -0.30 (−100 %) | -0.61 to 0.01 | within the noise |

### Object 300 m ahead (section 4)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| object 300 m ahead; Nobody detects it | SDR hybrid | Today | Collisions per run | 30 | 1.90 | 0.27 | 1.63 (+613 %) | 1.05 to 2.22 | outside the noise |
| object 300 m ahead; Road cameras only (95 %, 0.5 s) | SDR hybrid | Today | Collisions per run | 30 | 0.00 | 0.27 | -0.27 (−100 %) | -0.58 to 0.04 | within the noise |
| object 300 m ahead; Car sensors only (90 %), not shared | SDR hybrid | Today | Collisions per run | 30 | 2.13 | 0.27 | 1.87 (+700 %) | 1.31 to 2.43 | outside the noise |
| object 300 m ahead; Car sensors (90 %) + V2V | SDR hybrid | Today | Collisions per run | 30 | 0.33 | 0.27 | 0.07 (+25 %) | -0.38 to 0.52 | within the noise |
| object 300 m ahead; Road cameras + car sensors + V2V | SDR hybrid | Today | Collisions per run | 30 | 0.00 | 0.27 | -0.27 (−100 %) | -0.58 to 0.04 | within the noise |

### Load falls off a truck (section 4)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| load falls off a truck; Nobody detects it | SDR hybrid | Today | Collisions per run | 30 | 2.87 | 3.97 | -1.10 (−28 %) | -1.96 to -0.24 | outside the noise |
| load falls off a truck; Road cameras only (95 %, 0.5 s) | SDR hybrid | Today | Collisions per run | 30 | 0.00 | 3.97 | -3.97 (−100 %) | -4.87 to -3.07 | outside the noise |
| load falls off a truck; Car sensors only (90 %), not shared | SDR hybrid | Today | Collisions per run | 30 | 1.93 | 3.97 | -2.03 (−51 %) | -3.04 to -1.03 | outside the noise |
| load falls off a truck; Car sensors (90 %) + V2V | SDR hybrid | Today | Collisions per run | 30 | 0.50 | 3.97 | -3.47 (−87 %) | -4.48 to -2.45 | outside the noise |
| load falls off a truck; Road cameras + car sensors + V2V | SDR hybrid | Today | Collisions per run | 30 | 0.00 | 3.97 | -3.97 (−100 %) | -4.87 to -3.07 | outside the noise |

### Safety lane: breakdown (section 5)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| breakdown | SDR hybrid, no safety lane | Today, no hard shoulder | Extra delay (vehicle-hours) | 30 | 6.28 | 18.5 | -12.2 (−66 %) | -19.2 to -5.16 | outside the noise |
| breakdown | SDR hybrid, no safety lane | Today, no hard shoulder | Collisions per run | 30 | 0.00 | 0.07 | -0.07 (−100 %) | -0.16 to 0.03 | within the noise |
| breakdown | SDR hybrid, with safety lane | Today, with hard shoulder | Extra delay (vehicle-hours) | 30 | -0.01 | -0.54 | 0.54 | -1.01 to 2.08 | within the noise |
| breakdown | SDR hybrid, with safety lane | Today, with hard shoulder | Collisions per run | 30 | 0.00 | 0.10 | -0.10 (−100 %) | -0.30 to 0.10 | within the noise |
| breakdown | SDR hybrid, with safety lane | SDR hybrid, no safety lane | Extra delay (vehicle-hours) | 30 | -0.01 | 6.28 | -6.29 (−100 %) | -12.2 to -0.39 | outside the noise |
| breakdown | SDR hybrid, with safety lane | SDR hybrid, no safety lane | Collisions per run | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| breakdown | Today, with hard shoulder | Today, no hard shoulder | Extra delay (vehicle-hours) | 30 | -0.54 | 18.5 | -19.0 (−103 %) | -24.0 to -14.0 | outside the noise |
| breakdown | Today, with hard shoulder | Today, no hard shoulder | Collisions per run | 30 | 0.10 | 0.07 | 0.03 (+50 %) | -0.20 to 0.26 | within the noise |

### Safety lane: brake loss (section 5)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| sudden 50 % brake loss | SDR hybrid, with safety lane | SDR hybrid, no safety lane | Extra delay (vehicle-hours) | 10 | 0.03 | 0.02 | 0.01 (+36 %) | 0.01 to 0.01 | outside the noise |
| sudden 50 % brake loss | SDR hybrid, with safety lane | SDR hybrid, no safety lane | Collisions per run | 10 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |

### Safety lane: radio loss (section 5)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| vehicle comms loss | SDR hybrid, with safety lane | SDR hybrid, no safety lane | Extra delay (vehicle-hours) | 30 | 0.26 | 0.28 | -0.02 (−8 %) | -0.05 to 0.01 | within the noise |
| vehicle comms loss | SDR hybrid, with safety lane | SDR hybrid, no safety lane | Collisions per run | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |

### Gate and merge rules (section 12)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 3,600 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Served (veh/h) | 5 | 4,319 | 4,477 | -158 (−4 %) | -377 to 61.8 | within the noise |
| 3,600 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Trip delay (s) | 5 | 29.5 | 29.6 | -0.16 (−1 %) | -13.3 to 13.0 | within the noise |
| 3,600 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Wait, 95th percentile (s) | 5 | 160 | 2.58 | 158 (+6,114 %) | 5.72 to 310 | outside the noise |
| 3,600 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.69 | 44.6 | -43.9 (−98 %) | -47.1 to -40.8 | outside the noise |
| 3,600 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Served (veh/h) | 5 | 4,504 | 4,477 | 27.2 (+1 %) | -18.0 to 72.4 | within the noise |
| 3,600 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Trip delay (s) | 5 | 19.0 | 29.6 | -10.6 (−36 %) | -20.9 to -0.28 | outside the noise |
| 3,600 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Wait, 95th percentile (s) | 5 | 45.0 | 2.58 | 42.5 (+1,646 %) | 42.0 to 43.0 | outside the noise |
| 3,600 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.40 | 44.6 | -44.2 (−99 %) | -46.8 to -41.6 | outside the noise |
| 3,600 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Served (veh/h) | 5 | 4,504 | 4,319 | 185 (+4 %) | -2.18 to 372 | within the noise |
| 3,600 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Trip delay (s) | 5 | 19.0 | 29.5 | -10.4 (−35 %) | -23.5 to 2.63 | within the noise |
| 3,600 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 45.0 | 160 | -115 (−72 %) | -268 to 37.1 | within the noise |
| 3,600 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.40 | 0.69 | -0.29 (−42 %) | -1.66 to 1.08 | within the noise |
| 3,600 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Served (veh/h) | 5 | 4,494 | 4,477 | 17.6 (+0 %) | -21.9 to 57.1 | within the noise |
| 3,600 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Trip delay (s) | 5 | 18.4 | 29.6 | -11.2 (−38 %) | -22.2 to -0.30 | outside the noise |
| 3,600 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Wait, 95th percentile (s) | 5 | 45.0 | 2.58 | 42.5 (+1,646 %) | 42.0 to 43.0 | outside the noise |
| 3,600 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.20 | 44.6 | -44.4 (−100 %) | -47.3 to -41.6 | outside the noise |
| 3,600 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Served (veh/h) | 5 | 4,494 | 4,319 | 175 (+4 %) | -23.3 to 374 | within the noise |
| 3,600 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Trip delay (s) | 5 | 18.4 | 29.5 | -11.1 (−38 %) | -24.2 to 2.09 | within the noise |
| 3,600 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 45.0 | 160 | -115 (−72 %) | -268 to 37.1 | within the noise |
| 3,600 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.20 | 0.69 | -0.49 (−71 %) | -1.69 to 0.71 | within the noise |
| 3,600 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Served (veh/h) | 5 | 4,490 | 4,477 | 13.6 (+0 %) | -29.8 to 57.0 | within the noise |
| 3,600 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Trip delay (s) | 5 | 18.2 | 29.6 | -11.4 (−39 %) | -22.4 to -0.47 | outside the noise |
| 3,600 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Wait, 95th percentile (s) | 5 | 45.0 | 2.58 | 42.5 (+1,646 %) | 42.0 to 43.0 | outside the noise |
| 3,600 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.20 | 44.6 | -44.4 (−100 %) | -47.3 to -41.6 | outside the noise |
| 3,600 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Served (veh/h) | 5 | 4,490 | 4,319 | 171 (+4 %) | -10.3 to 353 | within the noise |
| 3,600 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Trip delay (s) | 5 | 18.2 | 29.5 | -11.3 (−38 %) | -24.6 to 2.07 | within the noise |
| 3,600 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 45.0 | 160 | -115 (−72 %) | -268 to 37.1 | within the noise |
| 3,600 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.20 | 0.69 | -0.49 (−71 %) | -1.69 to 0.71 | within the noise |
| 3,600 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Served (veh/h) | 5 | 4,496 | 4,477 | 19.2 (+0 %) | -33.8 to 72.2 | within the noise |
| 3,600 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Trip delay (s) | 5 | 13.3 | 29.6 | -16.3 (−55 %) | -27.5 to -5.09 | outside the noise |
| 3,600 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Wait, 95th percentile (s) | 5 | 15.1 | 2.58 | 12.5 (+485 %) | 12.0 to 13.0 | outside the noise |
| 3,600 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.32 | 44.6 | -44.3 (−99 %) | -47.0 to -41.5 | outside the noise |
| 3,600 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Served (veh/h) | 5 | 4,496 | 4,319 | 177 (+4 %) | -5.50 to 359 | within the noise |
| 3,600 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Trip delay (s) | 5 | 13.3 | 29.5 | -16.1 (−55 %) | -29.5 to -2.79 | outside the noise |
| 3,600 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 15.1 | 160 | -145 (−91 %) | -297 to 7.01 | within the noise |
| 3,600 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.32 | 0.69 | -0.37 (−53 %) | -1.56 to 0.82 | within the noise |
| 3,600 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Served (veh/h) | 5 | 4,507 | 4,477 | 30.4 (+1 %) | -18.2 to 79.0 | within the noise |
| 3,600 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Trip delay (s) | 5 | 11.4 | 29.6 | -18.2 (−61 %) | -29.8 to -6.52 | outside the noise |
| 3,600 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Wait, 95th percentile (s) | 5 | 0.62 | 2.58 | -1.96 (−76 %) | -2.28 to -1.64 | outside the noise |
| 3,600 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.29 | 44.6 | -44.3 (−99 %) | -47.3 to -41.3 | outside the noise |
| 3,600 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Served (veh/h) | 5 | 4,507 | 4,319 | 188 (+4 %) | -4.01 to 380 | within the noise |
| 3,600 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Trip delay (s) | 5 | 11.4 | 29.5 | -18.0 (−61 %) | -31.6 to -4.44 | outside the noise |
| 3,600 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 0.62 | 160 | -160 (−100 %) | -312 to -7.63 | outside the noise |
| 3,600 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.29 | 0.69 | -0.41 (−59 %) | -1.75 to 0.93 | within the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Served (veh/h) | 5 | 4,507 | 4,477 | 30.4 (+1 %) | -18.2 to 79.0 | within the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Trip delay (s) | 5 | 11.4 | 29.6 | -18.2 (−61 %) | -29.8 to -6.52 | outside the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Wait, 95th percentile (s) | 5 | 0.62 | 2.58 | -1.96 (−76 %) | -2.28 to -1.64 | outside the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.29 | 44.6 | -44.3 (−99 %) | -47.3 to -41.3 | outside the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Served (veh/h) | 5 | 4,507 | 4,319 | 188 (+4 %) | -4.01 to 380 | within the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Trip delay (s) | 5 | 11.4 | 29.5 | -18.0 (−61 %) | -31.6 to -4.44 | outside the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 0.62 | 160 | -160 (−100 %) | -312 to -7.63 | outside the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.29 | 0.69 | -0.41 (−59 %) | -1.75 to 0.93 | within the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Served (veh/h) | 5 | 4,507 | 4,477 | 30.4 (+1 %) | -18.2 to 79.0 | within the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Trip delay (s) | 5 | 11.4 | 29.6 | -18.2 (−61 %) | -29.8 to -6.52 | outside the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Wait, 95th percentile (s) | 5 | 0.62 | 2.58 | -1.96 (−76 %) | -2.28 to -1.64 | outside the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.29 | 44.6 | -44.3 (−99 %) | -47.3 to -41.3 | outside the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Served (veh/h) | 5 | 4,507 | 4,319 | 188 (+4 %) | -4.01 to 380 | within the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Trip delay (s) | 5 | 11.4 | 29.5 | -18.0 (−61 %) | -31.6 to -4.44 | outside the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 0.62 | 160 | -160 (−100 %) | -312 to -7.63 | outside the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.29 | 0.69 | -0.41 (−59 %) | -1.75 to 0.93 | within the noise |
| 3,600 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Served (veh/h) | 5 | 4,503 | 4,477 | 26.4 (+1 %) | -35.1 to 87.9 | within the noise |
| 3,600 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Trip delay (s) | 5 | 14.5 | 29.6 | -15.1 (−51 %) | -26.7 to -3.57 | outside the noise |
| 3,600 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Wait, 95th percentile (s) | 5 | 0.62 | 2.58 | -1.96 (−76 %) | -2.28 to -1.64 | outside the noise |
| 3,600 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.41 | 44.6 | -44.2 (−99 %) | -47.0 to -41.4 | outside the noise |
| 3,600 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Served (veh/h) | 5 | 4,503 | 4,319 | 184 (+4 %) | -1.47 to 369 | within the noise |
| 3,600 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Trip delay (s) | 5 | 14.5 | 29.5 | -15.0 (−51 %) | -28.5 to -1.42 | outside the noise |
| 3,600 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 0.62 | 160 | -160 (−100 %) | -312 to -7.63 | outside the noise |
| 3,600 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.41 | 0.69 | -0.29 (−41 %) | -1.69 to 1.12 | within the noise |
| 3,600 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Served (veh/h) | 5 | 4,508 | 4,477 | 31.2 (+1 %) | -15.7 to 78.1 | within the noise |
| 3,600 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Trip delay (s) | 5 | 11.4 | 29.6 | -18.2 (−61 %) | -29.9 to -6.54 | outside the noise |
| 3,600 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Wait, 95th percentile (s) | 5 | 0.62 | 2.58 | -1.96 (−76 %) | -2.28 to -1.64 | outside the noise |
| 3,600 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.29 | 44.6 | -44.3 (−99 %) | -47.3 to -41.3 | outside the noise |
| 3,600 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Served (veh/h) | 5 | 4,508 | 4,319 | 189 (+4 %) | -3.06 to 381 | within the noise |
| 3,600 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Trip delay (s) | 5 | 11.4 | 29.5 | -18.0 (−61 %) | -31.6 to -4.43 | outside the noise |
| 3,600 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 0.62 | 160 | -160 (−100 %) | -312 to -7.63 | outside the noise |
| 3,600 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.29 | 0.69 | -0.41 (−59 %) | -1.75 to 0.93 | within the noise |
| 4,800 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Served (veh/h) | 5 | 5,131 | 5,261 | -130 (−2 %) | -309 to 49.6 | within the noise |
| 4,800 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Trip delay (s) | 5 | 37.2 | 72.2 | -35.0 (−48 %) | -50.8 to -19.2 | outside the noise |
| 4,800 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Wait, 95th percentile (s) | 5 | 481 | 5.02 | 476 (+9,486 %) | 398 to 554 | outside the noise |
| 4,800 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.51 | 85.7 | -85.2 (−99 %) | -99.4 to -71.0 | outside the noise |
| 4,800 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Served (veh/h) | 5 | 5,634 | 5,261 | 374 (+7 %) | 156 to 591 | outside the noise |
| 4,800 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Trip delay (s) | 5 | 27.7 | 72.2 | -44.5 (−62 %) | -62.3 to -26.7 | outside the noise |
| 4,800 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Wait, 95th percentile (s) | 5 | 45.2 | 5.02 | 40.2 (+800 %) | 39.4 to 40.9 | outside the noise |
| 4,800 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.70 | 85.7 | -85.0 (−99 %) | -98.5 to -71.4 | outside the noise |
| 4,800 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Served (veh/h) | 5 | 5,634 | 5,131 | 503 (+10 %) | 400 to 606 | outside the noise |
| 4,800 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Trip delay (s) | 5 | 27.7 | 37.2 | -9.47 (−25 %) | -21.7 to 2.71 | within the noise |
| 4,800 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 45.2 | 481 | -436 (−91 %) | -514 to -359 | outside the noise |
| 4,800 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.70 | 0.51 | 0.19 (+38 %) | -1.36 to 1.75 | within the noise |
| 4,800 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Served (veh/h) | 5 | 5,650 | 5,261 | 390 (+7 %) | 193 to 586 | outside the noise |
| 4,800 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Trip delay (s) | 5 | 25.8 | 72.2 | -46.4 (−64 %) | -60.3 to -32.5 | outside the noise |
| 4,800 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Wait, 95th percentile (s) | 5 | 45.1 | 5.02 | 40.1 (+799 %) | 39.5 to 40.7 | outside the noise |
| 4,800 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.73 | 85.7 | -84.9 (−99 %) | -99.2 to -70.7 | outside the noise |
| 4,800 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Served (veh/h) | 5 | 5,650 | 5,131 | 519 (+10 %) | 426 to 612 | outside the noise |
| 4,800 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Trip delay (s) | 5 | 25.8 | 37.2 | -11.4 (−31 %) | -20.1 to -2.73 | outside the noise |
| 4,800 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 45.1 | 481 | -436 (−91 %) | -514 to -359 | outside the noise |
| 4,800 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.73 | 0.51 | 0.22 (+43 %) | -1.16 to 1.60 | within the noise |
| 4,800 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Served (veh/h) | 5 | 5,644 | 5,261 | 383 (+7 %) | 186 to 580 | outside the noise |
| 4,800 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Trip delay (s) | 5 | 26.1 | 72.2 | -46.1 (−64 %) | -60.1 to -32.2 | outside the noise |
| 4,800 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Wait, 95th percentile (s) | 5 | 45.1 | 5.02 | 40.1 (+799 %) | 39.5 to 40.7 | outside the noise |
| 4,800 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.60 | 85.7 | -85.1 (−99 %) | -98.9 to -71.2 | outside the noise |
| 4,800 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Served (veh/h) | 5 | 5,644 | 5,131 | 513 (+10 %) | 419 to 607 | outside the noise |
| 4,800 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Trip delay (s) | 5 | 26.1 | 37.2 | -11.1 (−30 %) | -20.0 to -2.21 | outside the noise |
| 4,800 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 45.1 | 481 | -436 (−91 %) | -514 to -359 | outside the noise |
| 4,800 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.60 | 0.51 | 0.09 (+18 %) | -1.20 to 1.39 | within the noise |
| 4,800 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Served (veh/h) | 5 | 5,669 | 5,261 | 408 (+8 %) | 252 to 564 | outside the noise |
| 4,800 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Trip delay (s) | 5 | 20.9 | 72.2 | -51.3 (−71 %) | -64.9 to -37.7 | outside the noise |
| 4,800 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Wait, 95th percentile (s) | 5 | 15.1 | 5.02 | 10.1 (+201 %) | 9.54 to 10.7 | outside the noise |
| 4,800 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.22 | 85.7 | -85.4 (−100 %) | -99.2 to -71.7 | outside the noise |
| 4,800 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Served (veh/h) | 5 | 5,669 | 5,131 | 538 (+10 %) | 452 to 624 | outside the noise |
| 4,800 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Trip delay (s) | 5 | 20.9 | 37.2 | -16.3 (−44 %) | -23.6 to -9.03 | outside the noise |
| 4,800 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 15.1 | 481 | -466 (−97 %) | -544 to -389 | outside the noise |
| 4,800 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.22 | 0.51 | -0.29 (−57 %) | -1.41 to 0.83 | within the noise |
| 4,800 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Served (veh/h) | 5 | 5,687 | 5,261 | 426 (+8 %) | 255 to 598 | outside the noise |
| 4,800 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Trip delay (s) | 5 | 19.0 | 72.2 | -53.2 (−74 %) | -68.4 to -38.0 | outside the noise |
| 4,800 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Wait, 95th percentile (s) | 5 | 0.68 | 5.02 | -4.34 (−86 %) | -5.16 to -3.52 | outside the noise |
| 4,800 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.60 | 85.7 | -85.1 (−99 %) | -98.6 to -71.5 | outside the noise |
| 4,800 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Served (veh/h) | 5 | 5,687 | 5,131 | 556 (+11 %) | 471 to 641 | outside the noise |
| 4,800 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Trip delay (s) | 5 | 19.0 | 37.2 | -18.2 (−49 %) | -27.2 to -9.17 | outside the noise |
| 4,800 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 0.68 | 481 | -481 (−100 %) | -558 to -403 | outside the noise |
| 4,800 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.60 | 0.51 | 0.09 (+18 %) | -1.16 to 1.34 | within the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Served (veh/h) | 5 | 5,690 | 5,261 | 429 (+8 %) | 256 to 602 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Trip delay (s) | 5 | 19.2 | 72.2 | -53.0 (−73 %) | -67.9 to -38.2 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Wait, 95th percentile (s) | 5 | 2.10 | 5.02 | -2.92 (−58 %) | -3.81 to -2.03 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.67 | 85.7 | -85.0 (−99 %) | -98.7 to -71.3 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Served (veh/h) | 5 | 5,690 | 5,131 | 558 (+11 %) | 470 to 647 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Trip delay (s) | 5 | 19.2 | 37.2 | -18.1 (−49 %) | -27.0 to -9.08 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 2.10 | 481 | -479 (−100 %) | -557 to -401 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.67 | 0.51 | 0.16 (+31 %) | -1.02 to 1.33 | within the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Served (veh/h) | 5 | 5,687 | 5,261 | 426 (+8 %) | 255 to 598 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Trip delay (s) | 5 | 19.0 | 72.2 | -53.2 (−74 %) | -68.4 to -38.0 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Wait, 95th percentile (s) | 5 | 0.66 | 5.02 | -4.36 (−87 %) | -5.17 to -3.55 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.60 | 85.7 | -85.1 (−99 %) | -98.6 to -71.5 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Served (veh/h) | 5 | 5,687 | 5,131 | 556 (+11 %) | 471 to 641 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Trip delay (s) | 5 | 19.0 | 37.2 | -18.2 (−49 %) | -27.2 to -9.17 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 0.66 | 481 | -481 (−100 %) | -558 to -403 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.60 | 0.51 | 0.09 (+18 %) | -1.16 to 1.34 | within the noise |
| 4,800 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Served (veh/h) | 5 | 5,649 | 5,261 | 388 (+7 %) | 263 to 513 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Trip delay (s) | 5 | 29.7 | 72.2 | -42.5 (−59 %) | -56.9 to -28.1 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Wait, 95th percentile (s) | 5 | 2.25 | 5.02 | -2.77 (−55 %) | -6.42 to 0.88 | within the noise |
| 4,800 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 3.40 | 85.7 | -82.3 (−96 %) | -95.1 to -69.4 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Served (veh/h) | 5 | 5,649 | 5,131 | 518 (+10 %) | 424 to 612 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Trip delay (s) | 5 | 29.7 | 37.2 | -7.53 (−20 %) | -18.5 to 3.40 | within the noise |
| 4,800 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 2.25 | 481 | -479 (−100 %) | -557 to -401 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 3.40 | 0.51 | 2.89 (+567 %) | 0.83 to 4.96 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Served (veh/h) | 5 | 5,678 | 5,261 | 417 (+8 %) | 226 to 607 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Trip delay (s) | 5 | 20.3 | 72.2 | -51.9 (−72 %) | -69.3 to -34.4 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Wait, 95th percentile (s) | 5 | 0.68 | 5.02 | -4.34 (−86 %) | -5.16 to -3.52 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 1.08 | 85.7 | -84.6 (−99 %) | -97.6 to -71.6 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Served (veh/h) | 5 | 5,678 | 5,131 | 546 (+11 %) | 446 to 646 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Trip delay (s) | 5 | 20.3 | 37.2 | -16.9 (−45 %) | -28.3 to -5.47 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 0.68 | 481 | -481 (−100 %) | -558 to -403 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 1.08 | 0.51 | 0.57 (+111 %) | -1.55 to 2.69 | within the noise |
| 7,200 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Served (veh/h) | 5 | 5,882 | 5,395 | 486 (+9 %) | 300 to 673 | outside the noise |
| 7,200 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Trip delay (s) | 5 | 160 | 212 | -51.6 (−24 %) | -67.8 to -35.3 | outside the noise |
| 7,200 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Wait, 95th percentile (s) | 5 | 462 | 307 | 156 (+51 %) | 105 to 206 | outside the noise |
| 7,200 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.35 | 71.8 | -71.4 (−100 %) | -91.4 to -51.4 | outside the noise |
| 7,200 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Served (veh/h) | 5 | 5,904 | 5,395 | 509 (+9 %) | 281 to 736 | outside the noise |
| 7,200 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Trip delay (s) | 5 | 180 | 212 | -31.2 (−15 %) | -58.6 to -3.87 | outside the noise |
| 7,200 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Wait, 95th percentile (s) | 5 | 331 | 307 | 24.0 (+8 %) | -10.4 to 58.5 | within the noise |
| 7,200 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 2.04 | 71.8 | -69.7 (−97 %) | -90.1 to -49.3 | outside the noise |
| 7,200 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Served (veh/h) | 5 | 5,904 | 5,882 | 22.4 (+0 %) | -99.5 to 144 | within the noise |
| 7,200 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Trip delay (s) | 5 | 180 | 160 | 20.4 (+13 %) | 5.85 to 34.9 | outside the noise |
| 7,200 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 331 | 462 | -132 (−28 %) | -201 to -61.9 | outside the noise |
| 7,200 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 2.04 | 0.35 | 1.69 (+483 %) | 0.82 to 2.56 | outside the noise |
| 7,200 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Served (veh/h) | 5 | 5,978 | 5,395 | 582 (+11 %) | 226 to 939 | outside the noise |
| 7,200 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Trip delay (s) | 5 | 174 | 212 | -37.3 (−18 %) | -69.2 to -5.51 | outside the noise |
| 7,200 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Wait, 95th percentile (s) | 5 | 324 | 307 | 17.4 (+6 %) | -31.1 to 65.8 | within the noise |
| 7,200 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 2.90 | 71.8 | -68.9 (−96 %) | -89.4 to -48.3 | outside the noise |
| 7,200 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Served (veh/h) | 5 | 5,978 | 5,882 | 96.0 (+2 %) | -109 to 301 | within the noise |
| 7,200 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Trip delay (s) | 5 | 174 | 160 | 14.2 (+9 %) | -4.17 to 32.6 | within the noise |
| 7,200 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 324 | 462 | -138 (−30 %) | -215 to -61.8 | outside the noise |
| 7,200 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 2.90 | 0.35 | 2.55 (+729 %) | 1.20 to 3.90 | outside the noise |
| 7,200 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Served (veh/h) | 5 | 6,046 | 5,395 | 650 (+12 %) | 398 to 903 | outside the noise |
| 7,200 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Trip delay (s) | 5 | 162 | 212 | -49.4 (−23 %) | -69.1 to -29.7 | outside the noise |
| 7,200 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Wait, 95th percentile (s) | 5 | 311 | 307 | 4.45 (+1 %) | -33.4 to 42.3 | within the noise |
| 7,200 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 3.06 | 71.8 | -68.7 (−96 %) | -86.2 to -51.2 | outside the noise |
| 7,200 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Served (veh/h) | 5 | 6,046 | 5,882 | 164 (+3 %) | 1.15 to 327 | outside the noise |
| 7,200 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Trip delay (s) | 5 | 162 | 160 | 2.16 (+1 %) | -4.75 to 9.06 | within the noise |
| 7,200 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 311 | 462 | -151 (−33 %) | -220 to -82.0 | outside the noise |
| 7,200 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 3.06 | 0.35 | 2.71 (+776 %) | -0.31 to 5.74 | within the noise |
| 7,200 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Served (veh/h) | 5 | 6,014 | 5,395 | 619 (+11 %) | 174 to 1,064 | outside the noise |
| 7,200 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Trip delay (s) | 5 | 169 | 212 | -43.0 (−20 %) | -69.4 to -16.6 | outside the noise |
| 7,200 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Wait, 95th percentile (s) | 5 | 317 | 307 | 10.5 (+3 %) | -35.9 to 56.9 | within the noise |
| 7,200 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 2.28 | 71.8 | -69.5 (−97 %) | -89.3 to -49.6 | outside the noise |
| 7,200 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Served (veh/h) | 5 | 6,014 | 5,882 | 133 (+2 %) | -152 to 417 | within the noise |
| 7,200 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Trip delay (s) | 5 | 169 | 160 | 8.58 (+5 %) | -4.95 to 22.1 | within the noise |
| 7,200 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 317 | 462 | -145 (−31 %) | -225 to -65.2 | outside the noise |
| 7,200 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 2.28 | 0.35 | 1.93 (+553 %) | 0.28 to 3.58 | outside the noise |
| 7,200 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Served (veh/h) | 5 | 6,038 | 5,395 | 643 (+12 %) | 274 to 1,013 | outside the noise |
| 7,200 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Trip delay (s) | 5 | 162 | 212 | -49.6 (−23 %) | -78.9 to -20.2 | outside the noise |
| 7,200 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Wait, 95th percentile (s) | 5 | 313 | 307 | 6.25 (+2 %) | -38.3 to 50.8 | within the noise |
| 7,200 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 4.08 | 71.8 | -67.7 (−94 %) | -85.8 to -49.6 | outside the noise |
| 7,200 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Served (veh/h) | 5 | 6,038 | 5,882 | 157 (+3 %) | -59.5 to 373 | within the noise |
| 7,200 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Trip delay (s) | 5 | 162 | 160 | 2.02 (+1 %) | -13.6 to 17.6 | within the noise |
| 7,200 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 313 | 462 | -149 (−32 %) | -229 to -69.8 | outside the noise |
| 7,200 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 4.08 | 0.35 | 3.73 (+1,068 %) | 1.17 to 6.29 | outside the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Served (veh/h) | 5 | 5,948 | 5,395 | 553 (+10 %) | 160 to 946 | outside the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Trip delay (s) | 5 | 169 | 212 | -42.8 (−20 %) | -64.6 to -20.9 | outside the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Wait, 95th percentile (s) | 5 | 332 | 307 | 25.5 (+8 %) | -22.5 to 73.6 | within the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 2.22 | 71.8 | -69.5 (−97 %) | -87.5 to -51.6 | outside the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Served (veh/h) | 5 | 5,948 | 5,882 | 66.4 (+1 %) | -170 to 303 | within the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Trip delay (s) | 5 | 169 | 160 | 8.80 (+6 %) | -2.31 to 19.9 | within the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 332 | 462 | -130 (−28 %) | -215 to -45.3 | outside the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 2.22 | 0.35 | 1.87 (+535 %) | -0.60 to 4.34 | within the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Served (veh/h) | 5 | 6,167 | 5,395 | 772 (+14 %) | 480 to 1,064 | outside the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Trip delay (s) | 5 | 160 | 212 | -51.4 (−24 %) | -78.5 to -24.3 | outside the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Wait, 95th percentile (s) | 5 | 279 | 307 | -28.0 (−9 %) | -57.7 to 1.75 | within the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 3.04 | 71.8 | -68.7 (−96 %) | -88.4 to -49.0 | outside the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Served (veh/h) | 5 | 6,167 | 5,882 | 286 (+5 %) | 119 to 452 | outside the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Trip delay (s) | 5 | 160 | 160 | 0.16 (+0 %) | -12.6 to 12.9 | within the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 279 | 462 | -184 (−40 %) | -254 to -114 | outside the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 3.04 | 0.35 | 2.69 (+770 %) | 1.61 to 3.78 | outside the noise |
| 7,200 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Served (veh/h) | 5 | 5,765 | 5,395 | 370 (+7 %) | 71.5 to 668 | outside the noise |
| 7,200 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Trip delay (s) | 5 | 184 | 212 | -28.0 (−13 %) | -52.6 to -3.39 | outside the noise |
| 7,200 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Wait, 95th percentile (s) | 5 | 353 | 307 | 45.7 (+15 %) | -2.03 to 93.5 | within the noise |
| 7,200 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 5.78 | 71.8 | -66.0 (−92 %) | -86.2 to -45.8 | outside the noise |
| 7,200 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Served (veh/h) | 5 | 5,765 | 5,882 | -117 (−2 %) | -331 to 97.5 | within the noise |
| 7,200 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Trip delay (s) | 5 | 184 | 160 | 23.6 (+15 %) | 13.2 to 34.0 | outside the noise |
| 7,200 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 353 | 462 | -110 (−24 %) | -183 to -36.5 | outside the noise |
| 7,200 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 5.78 | 0.35 | 5.43 (+1,552 %) | 3.11 to 7.74 | outside the noise |
| 7,200 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Served (veh/h) | 5 | 6,012 | 5,395 | 617 (+11 %) | 321 to 912 | outside the noise |
| 7,200 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Trip delay (s) | 5 | 165 | 212 | -46.3 (−22 %) | -70.5 to -22.1 | outside the noise |
| 7,200 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Wait, 95th percentile (s) | 5 | 316 | 307 | 9.43 (+3 %) | -30.2 to 49.0 | within the noise |
| 7,200 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 3.41 | 71.8 | -68.3 (−95 %) | -89.5 to -47.2 | outside the noise |
| 7,200 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Served (veh/h) | 5 | 6,012 | 5,882 | 130 (+2 %) | -16.4 to 277 | within the noise |
| 7,200 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Trip delay (s) | 5 | 165 | 160 | 5.31 (+3 %) | -8.16 to 18.8 | within the noise |
| 7,200 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 316 | 462 | -146 (−32 %) | -221 to -71.8 | outside the noise |
| 7,200 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 3.41 | 0.35 | 3.06 (+875 %) | -0.11 to 6.23 | within the noise |

### Speed under pressure (section 13)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| hybrid, 2,400 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Served (veh/h) | 5 | 3,342 | 3,342 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| hybrid, 2,400 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Trip time (s) | 5 | 140 | 140 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| hybrid, 2,400 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Hard brakes / 1000 veh-km | 5 | 0.17 | 0.17 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| hybrid, 2,400 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Served (veh/h) | 15 | 3,308 | 3,315 | -6.93 (−0 %) | -16.6 to 2.78 | within the noise |
| hybrid, 2,400 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Trip time (s) | 15 | 158 | 140 | 18.4 (+13 %) | 18.1 to 18.7 | outside the noise |
| hybrid, 2,400 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.04 | 0.09 | -0.06 (−59 %) | -0.18 to 0.07 | within the noise |
| hybrid, 2,400 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Served (veh/h) | 15 | 3,305 | 3,315 | -9.87 (−0 %) | -24.7 to 5.01 | within the noise |
| hybrid, 2,400 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Trip time (s) | 15 | 193 | 140 | 52.9 (+38 %) | 52.5 to 53.3 | outside the noise |
| hybrid, 2,400 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.00 | 0.09 | -0.09 (−100 %) | -0.19 to 0.00 | within the noise |
| hybrid, 3,600 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Served (veh/h) | 5 | 4,507 | 4,507 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| hybrid, 3,600 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Trip time (s) | 5 | 147 | 147 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| hybrid, 3,600 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Hard brakes / 1000 veh-km | 5 | 0.29 | 0.29 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| hybrid, 3,600 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Served (veh/h) | 15 | 4,485 | 4,491 | -5.60 (−0 %) | -20.6 to 9.40 | within the noise |
| hybrid, 3,600 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Trip time (s) | 15 | 164 | 147 | 17.6 (+12 %) | 17.1 to 18.0 | outside the noise |
| hybrid, 3,600 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.08 | 0.30 | -0.22 (−73 %) | -0.44 to 0.01 | within the noise |
| hybrid, 3,600 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Served (veh/h) | 15 | 4,491 | 4,491 | 0.27 (+0 %) | -32.7 to 33.3 | within the noise |
| hybrid, 3,600 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Trip time (s) | 15 | 199 | 147 | 52.6 (+36 %) | 52.0 to 53.2 | outside the noise |
| hybrid, 3,600 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.03 | 0.30 | -0.27 (−91 %) | -0.47 to -0.07 | outside the noise |
| hybrid, 4,800 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Served (veh/h) | 5 | 5,687 | 5,687 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| hybrid, 4,800 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Trip time (s) | 5 | 157 | 157 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| hybrid, 4,800 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Hard brakes / 1000 veh-km | 5 | 0.60 | 0.60 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| hybrid, 4,800 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Served (veh/h) | 15 | 5,662 | 5,658 | 3.73 (+0 %) | -17.9 to 25.3 | within the noise |
| hybrid, 4,800 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Trip time (s) | 15 | 173 | 157 | 15.7 (+10 %) | 14.9 to 16.5 | outside the noise |
| hybrid, 4,800 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.49 | 1.03 | -0.54 (−52 %) | -0.96 to -0.11 | outside the noise |
| hybrid, 4,800 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Served (veh/h) | 15 | 5,629 | 5,658 | -29.3 (−1 %) | -74.1 to 15.4 | within the noise |
| hybrid, 4,800 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Trip time (s) | 15 | 211 | 157 | 53.7 (+34 %) | 51.6 to 55.8 | outside the noise |
| hybrid, 4,800 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.59 | 1.03 | -0.44 (−43 %) | -1.07 to 0.20 | within the noise |
| hybrid, 6,000 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Served (veh/h) | 15 | 5,935 | 6,009 | -73.6 (−1 %) | -149 to 1.33 | within the noise |
| hybrid, 6,000 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Trip time (s) | 15 | 239 | 224 | 14.8 (+7 %) | 6.78 to 22.9 | outside the noise |
| hybrid, 6,000 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 1.32 | 3.36 | -2.04 (−61 %) | -3.34 to -0.74 | outside the noise |
| hybrid, 6,000 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Served (veh/h) | 15 | 6,169 | 6,009 | 160 (+3 %) | 87.6 to 233 | outside the noise |
| hybrid, 6,000 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Trip time (s) | 15 | 230 | 224 | 5.66 (+3 %) | -2.45 to 13.8 | within the noise |
| hybrid, 6,000 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 2.19 | 3.36 | -1.17 (−35 %) | -2.45 to 0.12 | within the noise |
| hybrid, 6,000 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Served (veh/h) | 15 | 6,051 | 6,009 | 41.9 (+1 %) | -92.2 to 176 | within the noise |
| hybrid, 6,000 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Trip time (s) | 15 | 264 | 224 | 40.1 (+18 %) | 29.8 to 50.5 | outside the noise |
| hybrid, 6,000 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 1.31 | 3.36 | -2.06 (−61 %) | -3.33 to -0.78 | outside the noise |
| hybrid, 7,200 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Served (veh/h) | 15 | 6,023 | 5,978 | 45.3 (+1 %) | -41.4 to 132 | within the noise |
| hybrid, 7,200 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Trip time (s) | 15 | 325 | 298 | 27.1 (+9 %) | 19.9 to 34.4 | outside the noise |
| hybrid, 7,200 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 1.27 | 3.86 | -2.59 (−67 %) | -3.78 to -1.41 | outside the noise |
| hybrid, 7,200 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Served (veh/h) | 15 | 6,047 | 5,978 | 69.1 (+1 %) | -54.6 to 193 | within the noise |
| hybrid, 7,200 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Trip time (s) | 15 | 309 | 298 | 11.0 (+4 %) | 3.64 to 18.4 | outside the noise |
| hybrid, 7,200 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 2.33 | 3.86 | -1.53 (−40 %) | -2.63 to -0.44 | outside the noise |
| hybrid, 7,200 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Served (veh/h) | 15 | 6,111 | 5,978 | 133 (+2 %) | 30.1 to 237 | outside the noise |
| hybrid, 7,200 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Trip time (s) | 15 | 334 | 298 | 36.0 (+12 %) | 28.7 to 43.2 | outside the noise |
| hybrid, 7,200 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 1.49 | 3.86 | -2.37 (−61 %) | -3.52 to -1.22 | outside the noise |
| relative, 2,400 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Served (veh/h) | 5 | 3,336 | 3,336 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| relative, 2,400 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Trip time (s) | 5 | 139 | 139 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| relative, 2,400 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Hard brakes / 1000 veh-km | 5 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| relative, 2,400 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Served (veh/h) | 15 | 3,307 | 3,312 | -4.80 (−0 %) | -14.9 to 5.32 | within the noise |
| relative, 2,400 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Trip time (s) | 15 | 157 | 138 | 18.7 (+14 %) | 18.5 to 19.0 | outside the noise |
| relative, 2,400 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.00 | 0.02 | -0.02 (−100 %) | -0.06 to 0.02 | within the noise |
| relative, 2,400 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Served (veh/h) | 15 | 3,305 | 3,312 | -6.67 (−0 %) | -23.4 to 10.1 | within the noise |
| relative, 2,400 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Trip time (s) | 15 | 192 | 138 | 53.5 (+39 %) | 53.1 to 53.9 | outside the noise |
| relative, 2,400 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.00 | 0.02 | -0.02 (−100 %) | -0.06 to 0.02 | within the noise |
| relative, 3,600 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Served (veh/h) | 5 | 4,514 | 4,514 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| relative, 3,600 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Trip time (s) | 5 | 144 | 144 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| relative, 3,600 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Hard brakes / 1000 veh-km | 5 | 0.08 | 0.08 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| relative, 3,600 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Served (veh/h) | 15 | 4,487 | 4,488 | -0.53 (−0 %) | -13.0 to 11.9 | within the noise |
| relative, 3,600 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Trip time (s) | 15 | 162 | 144 | 18.3 (+13 %) | 17.9 to 18.8 | outside the noise |
| relative, 3,600 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.00 | 0.05 | -0.05 (−100 %) | -0.11 to -0.00 | outside the noise |
| relative, 3,600 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Served (veh/h) | 15 | 4,495 | 4,488 | 6.93 (+0 %) | -22.5 to 36.3 | within the noise |
| relative, 3,600 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Trip time (s) | 15 | 198 | 144 | 54.2 (+38 %) | 53.6 to 54.7 | outside the noise |
| relative, 3,600 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.00 | 0.05 | -0.05 (−100 %) | -0.11 to -0.00 | outside the noise |
| relative, 4,800 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Served (veh/h) | 5 | 5,689 | 5,689 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| relative, 4,800 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Trip time (s) | 5 | 150 | 150 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| relative, 4,800 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Hard brakes / 1000 veh-km | 5 | 0.06 | 0.06 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| relative, 4,800 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Served (veh/h) | 15 | 5,681 | 5,687 | -6.13 (−0 %) | -26.4 to 14.1 | within the noise |
| relative, 4,800 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Trip time (s) | 15 | 166 | 150 | 16.6 (+11 %) | 16.0 to 17.1 | outside the noise |
| relative, 4,800 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.00 | 0.11 | -0.11 (−100 %) | -0.19 to -0.03 | outside the noise |
| relative, 4,800 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Served (veh/h) | 15 | 5,680 | 5,687 | -7.47 (−0 %) | -39.6 to 24.6 | within the noise |
| relative, 4,800 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Trip time (s) | 15 | 202 | 150 | 52.4 (+35 %) | 51.7 to 53.0 | outside the noise |
| relative, 4,800 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.01 | 0.11 | -0.10 (−90 %) | -0.18 to -0.01 | outside the noise |
| relative, 6,000 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Served (veh/h) | 15 | 6,834 | 6,839 | -5.60 (−0 %) | -17.6 to 6.44 | within the noise |
| relative, 6,000 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Trip time (s) | 15 | 160 | 160 | 0.10 (+0 %) | -0.38 to 0.59 | within the noise |
| relative, 6,000 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.62 | 0.68 | -0.06 (−9 %) | -0.27 to 0.15 | within the noise |
| relative, 6,000 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Served (veh/h) | 15 | 6,844 | 6,839 | 4.80 (+0 %) | -29.5 to 39.1 | within the noise |
| relative, 6,000 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Trip time (s) | 15 | 174 | 160 | 14.9 (+9 %) | 12.6 to 17.2 | outside the noise |
| relative, 6,000 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.42 | 0.68 | -0.26 (−38 %) | -0.83 to 0.32 | within the noise |
| relative, 6,000 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Served (veh/h) | 15 | 6,760 | 6,839 | -79.7 (−1 %) | -124 to -36.0 | outside the noise |
| relative, 6,000 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Trip time (s) | 15 | 214 | 160 | 54.5 (+34 %) | 52.1 to 56.9 | outside the noise |
| relative, 6,000 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.47 | 0.68 | -0.21 (−31 %) | -0.75 to 0.33 | within the noise |
| relative, 7,200 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Served (veh/h) | 15 | 7,077 | 7,058 | 19.5 (+0 %) | -110 to 149 | within the noise |
| relative, 7,200 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Trip time (s) | 15 | 233 | 225 | 8.19 (+4 %) | 2.12 to 14.3 | outside the noise |
| relative, 7,200 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 1.10 | 1.87 | -0.77 (−41 %) | -1.32 to -0.22 | outside the noise |
| relative, 7,200 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Served (veh/h) | 15 | 7,226 | 7,058 | 168 (+2 %) | 27.2 to 309 | outside the noise |
| relative, 7,200 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Trip time (s) | 15 | 228 | 225 | 2.76 (+1 %) | -4.35 to 9.88 | within the noise |
| relative, 7,200 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 1.38 | 1.87 | -0.49 (−26 %) | -1.18 to 0.20 | within the noise |
| relative, 7,200 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Served (veh/h) | 15 | 6,943 | 7,058 | -115 (−2 %) | -254 to 23.8 | within the noise |
| relative, 7,200 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Trip time (s) | 15 | 280 | 225 | 55.0 (+24 %) | 47.0 to 63.1 | outside the noise |
| relative, 7,200 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 1.06 | 1.87 | -0.81 (−43 %) | -1.37 to -0.24 | outside the noise |

### Cheaper truck rules (section 14)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 10 % trucks | Brick-wall gap behind every truck (the rule as it is) | Today (human drivers) | Served (veh/h) | 5 | 6,038 | 5,395 | 643 (+12 %) | 274 to 1,013 | outside the noise |
| 10 % trucks | No truck rule (relative separation) | Today (human drivers) | Served (veh/h) | 5 | 7,094 | 5,395 | 1,699 (+31 %) | 1,249 to 2,149 | outside the noise |
| 10 % trucks | No truck rule (relative separation) | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 7,094 | 6,038 | 1,056 (+17 %) | 751 to 1,361 | outside the noise |
| 10 % trucks | a. Not behind enclosed, monitored trucks: 25 % of trucks | Today (human drivers) | Served (veh/h) | 5 | 6,243 | 5,395 | 848 (+16 %) | 528 to 1,168 | outside the noise |
| 10 % trucks | a. Not behind enclosed, monitored trucks: 25 % of trucks | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 6,243 | 6,038 | 205 (+3 %) | 106 to 304 | outside the noise |
| 10 % trucks | a. Not behind enclosed, monitored trucks: 50 % | Today (human drivers) | Served (veh/h) | 5 | 6,477 | 5,395 | 1,082 (+20 %) | 809 to 1,354 | outside the noise |
| 10 % trucks | a. Not behind enclosed, monitored trucks: 50 % | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 6,477 | 6,038 | 438 (+7 %) | 281 to 596 | outside the noise |
| 10 % trucks | a. Not behind enclosed, monitored trucks: 75 % | Today (human drivers) | Served (veh/h) | 5 | 6,709 | 5,395 | 1,314 (+24 %) | 937 to 1,690 | outside the noise |
| 10 % trucks | a. Not behind enclosed, monitored trucks: 75 % | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 6,709 | 6,038 | 670 (+11 %) | 476 to 865 | outside the noise |
| 10 % trucks | b. Gap for a load that stops dead + 0.5 s to confirm it | Today (human drivers) | Served (veh/h) | 5 | 5,749 | 5,395 | 354 (+7 %) | 51.5 to 656 | outside the noise |
| 10 % trucks | b. Gap for a load that stops dead + 0.5 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 5,749 | 6,038 | -290 (−5 %) | -396 to -183 | outside the noise |
| 10 % trucks | b. Gap for a load that stops dead + 1 s to confirm it | Today (human drivers) | Served (veh/h) | 15 | 5,527 | 5,364 | 163 (+3 %) | 28.7 to 297 | outside the noise |
| 10 % trucks | b. Gap for a load that stops dead + 1 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 5,544 | 6,038 | -494 (−8 %) | -668 to -321 | outside the noise |
| 10 % trucks | b. Gap for a load that slides (6 m/s²) + 0.5 s to confirm it | Today (human drivers) | Served (veh/h) | 5 | 6,566 | 5,395 | 1,170 (+22 %) | 870 to 1,471 | outside the noise |
| 10 % trucks | b. Gap for a load that slides (6 m/s²) + 0.5 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 6,566 | 6,038 | 527 (+9 %) | 414 to 641 | outside the noise |
| 10 % trucks | b. Gap for a load that slides (6 m/s²) + 1 s to confirm it | Today (human drivers) | Served (veh/h) | 5 | 6,237 | 5,395 | 842 (+16 %) | 531 to 1,152 | outside the noise |
| 10 % trucks | b. Gap for a load that slides (6 m/s²) + 1 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 6,237 | 6,038 | 198 (+3 %) | 86.5 to 310 | outside the noise |
| 10 % trucks | c. Trucks follow trucks closely | Today (human drivers) | Served (veh/h) | 5 | 5,957 | 5,395 | 562 (+10 %) | 250 to 873 | outside the noise |
| 10 % trucks | c. Trucks follow trucks closely | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 5,957 | 6,038 | -81.6 (−1 %) | -283 to 120 | within the noise |
| 10 % trucks | d. Truck lane | Today (human drivers) | Served (veh/h) | 5 | 4,642 | 5,395 | -753 (−14 %) | -1,089 to -416 | outside the noise |
| 10 % trucks | d. Truck lane | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 4,642 | 6,038 | -1,396 (−23 %) | -1,627 to -1,165 | outside the noise |
| 10 % trucks | c + d. Truck lane, trucks follow trucks closely | Today (human drivers) | Served (veh/h) | 5 | 4,646 | 5,395 | -750 (−14 %) | -1,025 to -474 | outside the noise |
| 10 % trucks | c + d. Truck lane, trucks follow trucks closely | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 4,646 | 6,038 | -1,393 (−23 %) | -1,557 to -1,228 | outside the noise |
| 20 % trucks | Brick-wall gap behind every truck (the rule as it is) | Today (human drivers) | Served (veh/h) | 5 | 4,467 | 4,895 | -428 (−9 %) | -525 to -331 | outside the noise |
| 20 % trucks | No truck rule (relative separation) | Today (human drivers) | Served (veh/h) | 5 | 5,577 | 4,895 | 682 (+14 %) | 622 to 741 | outside the noise |
| 20 % trucks | No truck rule (relative separation) | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 5,577 | 4,467 | 1,110 (+25 %) | 1,055 to 1,164 | outside the noise |
| 20 % trucks | a. Not behind enclosed, monitored trucks: 25 % of trucks | Today (human drivers) | Served (veh/h) | 5 | 4,770 | 4,895 | -125 (−3 %) | -208 to -42.0 | outside the noise |
| 20 % trucks | a. Not behind enclosed, monitored trucks: 25 % of trucks | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 4,770 | 4,467 | 303 (+7 %) | 182 to 424 | outside the noise |
| 20 % trucks | a. Not behind enclosed, monitored trucks: 50 % | Today (human drivers) | Served (veh/h) | 5 | 5,047 | 4,895 | 152 (+3 %) | 61.9 to 242 | outside the noise |
| 20 % trucks | a. Not behind enclosed, monitored trucks: 50 % | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 5,047 | 4,467 | 580 (+13 %) | 424 to 736 | outside the noise |
| 20 % trucks | a. Not behind enclosed, monitored trucks: 75 % | Today (human drivers) | Served (veh/h) | 5 | 5,249 | 4,895 | 354 (+7 %) | 255 to 452 | outside the noise |
| 20 % trucks | a. Not behind enclosed, monitored trucks: 75 % | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 5,249 | 4,467 | 782 (+17 %) | 609 to 954 | outside the noise |
| 20 % trucks | b. Gap for a load that stops dead + 0.5 s to confirm it | Today (human drivers) | Served (veh/h) | 5 | 4,170 | 4,895 | -726 (−15 %) | -802 to -649 | outside the noise |
| 20 % trucks | b. Gap for a load that stops dead + 0.5 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 4,170 | 4,467 | -298 (−7 %) | -364 to -231 | outside the noise |
| 20 % trucks | b. Gap for a load that stops dead + 1 s to confirm it | Today (human drivers) | Served (veh/h) | 5 | 3,929 | 4,895 | -966 (−20 %) | -1,011 to -922 | outside the noise |
| 20 % trucks | b. Gap for a load that stops dead + 1 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 3,929 | 4,467 | -538 (−12 %) | -648 to -429 | outside the noise |
| 20 % trucks | b. Gap for a load that slides (6 m/s²) + 0.5 s to confirm it | Today (human drivers) | Served (veh/h) | 5 | 5,090 | 4,895 | 194 (+4 %) | 52.3 to 337 | outside the noise |
| 20 % trucks | b. Gap for a load that slides (6 m/s²) + 0.5 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 5,090 | 4,467 | 622 (+14 %) | 402 to 842 | outside the noise |
| 20 % trucks | b. Gap for a load that slides (6 m/s²) + 1 s to confirm it | Today (human drivers) | Served (veh/h) | 15 | 4,862 | 4,882 | -19.5 (−0 %) | -91.4 to 52.4 | within the noise |
| 20 % trucks | b. Gap for a load that slides (6 m/s²) + 1 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 4,798 | 4,467 | 330 (+7 %) | 114 to 547 | outside the noise |
| 20 % trucks | c. Trucks follow trucks closely | Today (human drivers) | Served (veh/h) | 5 | 4,541 | 4,895 | -354 (−7 %) | -512 to -197 | outside the noise |
| 20 % trucks | c. Trucks follow trucks closely | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 4,541 | 4,467 | 73.6 (+2 %) | -150 to 298 | within the noise |
| 20 % trucks | d. Truck lane | Today (human drivers) | Served (veh/h) | 5 | 3,932 | 4,895 | -963 (−20 %) | -1,097 to -830 | outside the noise |
| 20 % trucks | d. Truck lane | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 3,932 | 4,467 | -535 (−12 %) | -621 to -449 | outside the noise |
| 20 % trucks | c + d. Truck lane, trucks follow trucks closely | Today (human drivers) | Served (veh/h) | 5 | 4,403 | 4,895 | -492 (−10 %) | -666 to -318 | outside the noise |
| 20 % trucks | c + d. Truck lane, trucks follow trucks closely | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 4,403 | 4,467 | -64.0 (−1 %) | -259 to 131 | within the noise |
| 30 % trucks | Brick-wall gap behind every truck (the rule as it is) | Today (human drivers) | Served (veh/h) | 5 | 3,576 | 4,564 | -988 (−22 %) | -1,092 to -884 | outside the noise |
| 30 % trucks | No truck rule (relative separation) | Today (human drivers) | Served (veh/h) | 15 | 4,802 | 4,587 | 215 (+5 %) | 113 to 318 | outside the noise |
| 30 % trucks | No truck rule (relative separation) | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 4,714 | 3,576 | 1,138 (+32 %) | 975 to 1,300 | outside the noise |
| 30 % trucks | a. Not behind enclosed, monitored trucks: 25 % of trucks | Today (human drivers) | Served (veh/h) | 5 | 3,837 | 4,564 | -727 (−16 %) | -872 to -582 | outside the noise |
| 30 % trucks | a. Not behind enclosed, monitored trucks: 25 % of trucks | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 3,837 | 3,576 | 261 (+7 %) | 130 to 391 | outside the noise |
| 30 % trucks | a. Not behind enclosed, monitored trucks: 50 % | Today (human drivers) | Served (veh/h) | 5 | 4,040 | 4,564 | -524 (−11 %) | -726 to -322 | outside the noise |
| 30 % trucks | a. Not behind enclosed, monitored trucks: 50 % | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 4,040 | 3,576 | 464 (+13 %) | 178 to 750 | outside the noise |
| 30 % trucks | a. Not behind enclosed, monitored trucks: 75 % | Today (human drivers) | Served (veh/h) | 5 | 4,394 | 4,564 | -170 (−4 %) | -281 to -59.9 | outside the noise |
| 30 % trucks | a. Not behind enclosed, monitored trucks: 75 % | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 4,394 | 3,576 | 818 (+23 %) | 681 to 954 | outside the noise |
| 30 % trucks | b. Gap for a load that stops dead + 0.5 s to confirm it | Today (human drivers) | Served (veh/h) | 5 | 3,291 | 4,564 | -1,273 (−28 %) | -1,413 to -1,133 | outside the noise |
| 30 % trucks | b. Gap for a load that stops dead + 0.5 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 3,291 | 3,576 | -285 (−8 %) | -407 to -162 | outside the noise |
| 30 % trucks | b. Gap for a load that stops dead + 1 s to confirm it | Today (human drivers) | Served (veh/h) | 5 | 3,044 | 4,564 | -1,520 (−33 %) | -1,629 to -1,411 | outside the noise |
| 30 % trucks | b. Gap for a load that stops dead + 1 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 3,044 | 3,576 | -532 (−15 %) | -620 to -444 | outside the noise |
| 30 % trucks | b. Gap for a load that slides (6 m/s²) + 0.5 s to confirm it | Today (human drivers) | Served (veh/h) | 5 | 4,303 | 4,564 | -261 (−6 %) | -409 to -112 | outside the noise |
| 30 % trucks | b. Gap for a load that slides (6 m/s²) + 0.5 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 4,303 | 3,576 | 727 (+20 %) | 521 to 933 | outside the noise |
| 30 % trucks | b. Gap for a load that slides (6 m/s²) + 1 s to confirm it | Today (human drivers) | Served (veh/h) | 5 | 3,916 | 4,564 | -648 (−14 %) | -721 to -575 | outside the noise |
| 30 % trucks | b. Gap for a load that slides (6 m/s²) + 1 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 3,916 | 3,576 | 340 (+10 %) | 223 to 457 | outside the noise |
| 30 % trucks | c. Trucks follow trucks closely | Today (human drivers) | Served (veh/h) | 5 | 3,750 | 4,564 | -814 (−18 %) | -995 to -632 | outside the noise |
| 30 % trucks | c. Trucks follow trucks closely | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 3,750 | 3,576 | 174 (+5 %) | 21.6 to 327 | outside the noise |
| 30 % trucks | d. Truck lane | Today (human drivers) | Served (veh/h) | 5 | 3,037 | 4,564 | -1,527 (−33 %) | -1,639 to -1,415 | outside the noise |
| 30 % trucks | d. Truck lane | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 3,037 | 3,576 | -539 (−15 %) | -619 to -459 | outside the noise |
| 30 % trucks | c + d. Truck lane, trucks follow trucks closely | Today (human drivers) | Served (veh/h) | 5 | 3,370 | 4,564 | -1,194 (−26 %) | -1,296 to -1,091 | outside the noise |
| 30 % trucks | c + d. Truck lane, trucks follow trucks closely | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 3,370 | 3,576 | -206 (−6 %) | -257 to -154 | outside the noise |

### Road-sensor outage (section 6)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 4200 + 600 veh/h | sensors down at the on-ramp merge (2–3 km) | all sensors up | Served (veh/h) | 5 | 3,994 | 4,802 | -807 (−17 %) | -925 to -689 | outside the noise |
| 4200 + 600 veh/h | sensors down on a plain stretch (4–5 km) | all sensors up | Served (veh/h) | 15 | 4,727 | 4,761 | -33.9 (−1 %) | -66.7 to -1.07 | outside the noise |
| 7200 + 900 veh/h | sensors down at the on-ramp merge (2–3 km) | all sensors up | Served (veh/h) | 5 | 3,896 | 6,038 | -2,142 (−35 %) | -2,314 to -1,970 | outside the noise |
| 7200 + 900 veh/h | sensors down on a plain stretch (4–5 km) | all sensors up | Served (veh/h) | 5 | 5,528 | 6,038 | -510 (−8 %) | -729 to -292 | outside the noise |

### Weather (section 7)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| dry | SDR, absolute separation | Today (human drivers) | Served (veh/h) | 5 | 3,250 | 4,194 | -943 (−22 %) | -993 to -893 | outside the noise |
| dry | SDR, absolute separation | Today (human drivers) | Trip delay (s) | 5 | 159 | 13.6 | 145 (+1,068 %) | 136 to 154 | outside the noise |
| dry | SDR, absolute + adaptive speed | Today (human drivers) | Served (veh/h) | 5 | 3,981 | 4,194 | -213 (−5 %) | -365 to -60.8 | outside the noise |
| dry | SDR, absolute + adaptive speed | Today (human drivers) | Trip delay (s) | 5 | 140 | 13.6 | 126 (+931 %) | 109 to 144 | outside the noise |
| dry | SDR, relative separation | Today (human drivers) | Served (veh/h) | 15 | 4,173 | 4,149 | 24.5 (+1 %) | -1.68 to 50.7 | within the noise |
| dry | SDR, relative separation | Today (human drivers) | Trip delay (s) | 15 | 7.55 | 14.3 | -6.75 (−47 %) | -7.92 to -5.58 | outside the noise |
| dry | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 15 | 4,170 | 4,149 | 21.9 (+1 %) | -0.51 to 44.2 | within the noise |
| dry | SDR, hybrid separation | Today (human drivers) | Trip delay (s) | 15 | 9.66 | 14.3 | -4.64 (−32 %) | -5.85 to -3.44 | outside the noise |
| wet | SDR, absolute separation | Today (human drivers) | Served (veh/h) | 5 | 2,819 | 4,244 | -1,425 (−34 %) | -1,540 to -1,310 | outside the noise |
| wet | SDR, absolute separation | Today (human drivers) | Trip delay (s) | 5 | 205 | 33.5 | 171 (+511 %) | 163 to 179 | outside the noise |
| wet | SDR, absolute + adaptive speed | Today (human drivers) | Served (veh/h) | 5 | 3,764 | 4,244 | -480 (−11 %) | -668 to -292 | outside the noise |
| wet | SDR, absolute + adaptive speed | Today (human drivers) | Trip delay (s) | 5 | 183 | 33.5 | 150 (+447 %) | 135 to 165 | outside the noise |
| wet | SDR, relative separation | Today (human drivers) | Served (veh/h) | 15 | 4,174 | 4,176 | -1.87 (−0 %) | -36.8 to 33.0 | within the noise |
| wet | SDR, relative separation | Today (human drivers) | Trip delay (s) | 15 | 7.70 | 32.8 | -25.1 (−77 %) | -26.2 to -24.0 | outside the noise |
| wet | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 15 | 4,172 | 4,176 | -4.00 (−0 %) | -35.8 to 27.8 | within the noise |
| wet | SDR, hybrid separation | Today (human drivers) | Trip delay (s) | 15 | 9.99 | 32.8 | -22.8 (−70 %) | -23.9 to -21.7 | outside the noise |
| ice | SDR, absolute separation | Today (human drivers) | Served (veh/h) | 5 | 1,288 | 4,041 | -2,753 (−68 %) | -2,982 to -2,524 | outside the noise |
| ice | SDR, absolute separation | Today (human drivers) | Trip delay (s) | 5 | 301 | 139 | 162 (+117 %) | 135 to 189 | outside the noise |
| ice | SDR, absolute + adaptive speed | Today (human drivers) | Served (veh/h) | 5 | 2,395 | 4,041 | -1,646 (−41 %) | -1,841 to -1,450 | outside the noise |
| ice | SDR, absolute + adaptive speed | Today (human drivers) | Trip delay (s) | 5 | 323 | 139 | 184 (+132 %) | 158 to 210 | outside the noise |
| ice | SDR, relative separation | Today (human drivers) | Served (veh/h) | 5 | 4,246 | 4,041 | 205 (+5 %) | 19.8 to 390 | outside the noise |
| ice | SDR, relative separation | Today (human drivers) | Trip delay (s) | 5 | 52.1 | 139 | -87.0 (−63 %) | -110 to -63.9 | outside the noise |
| ice | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 15 | 3,576 | 3,958 | -382 (−10 %) | -467 to -297 | outside the noise |
| ice | SDR, hybrid separation | Today (human drivers) | Trip delay (s) | 15 | 128 | 130 | -2.36 (−2 %) | -12.0 to 7.28 | within the noise |

### Radio packet loss (section 9)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| fixed gaps | 1 % loss | no loss | Served (veh/h) | 15 | 6,011 | 5,978 | 32.8 (+1 %) | -27.4 to 93.0 | within the noise |
| fixed gaps | 5 % loss | no loss | Served (veh/h) | 15 | 6,015 | 5,978 | 37.3 (+1 %) | -23.9 to 98.6 | within the noise |
| fixed gaps | 10 % loss | no loss | Served (veh/h) | 15 | 5,947 | 5,978 | -30.9 (−1 %) | -81.6 to 19.8 | within the noise |
| fixed gaps | 20 % loss | no loss | Served (veh/h) | 15 | 5,892 | 5,978 | -86.4 (−1 %) | -167 to -5.48 | outside the noise |
| fixed gaps | 50 % loss | no loss | Served (veh/h) | 5 | 5,117 | 6,038 | -922 (−15 %) | -1,059 to -784 | outside the noise |
| widened gaps | 1 % loss | no loss | Served (veh/h) | 15 | 5,972 | 5,978 | -5.87 (−0 %) | -51.6 to 39.8 | within the noise |
| 1 % loss | widened gaps | fixed gaps | Supervision brakes per run | 15 | 0.27 | 0.33 | -0.07 (−20 %) | -0.60 to 0.47 | within the noise |
| widened gaps | 5 % loss | no loss | Served (veh/h) | 5 | 5,655 | 6,038 | -383 (−6 %) | -530 to -237 | outside the noise |
| 5 % loss | widened gaps | fixed gaps | Supervision brakes per run | 5 | 1.60 | 21.2 | -19.6 (−92 %) | -28.9 to -10.3 | outside the noise |
| widened gaps | 10 % loss | no loss | Served (veh/h) | 5 | 5,414 | 6,038 | -625 (−10 %) | -727 to -523 | outside the noise |
| 10 % loss | widened gaps | fixed gaps | Supervision brakes per run | 5 | 5.00 | 194 | -189 (−97 %) | -205 to -173 | outside the noise |
| widened gaps | 20 % loss | no loss | Served (veh/h) | 5 | 4,885 | 6,038 | -1,154 (−19 %) | -1,339 to -968 | outside the noise |
| 20 % loss | widened gaps | fixed gaps | Supervision brakes per run | 5 | 7.80 | 2,251 | -2,243 (−100 %) | -2,401 to -2,085 | outside the noise |
| widened gaps | 50 % loss | no loss | Served (veh/h) | 5 | 3,411 | 6,038 | -2,627 (−44 %) | -2,837 to -2,417 | outside the noise |
| 50 % loss | widened gaps | fixed gaps | Supervision brakes per run | 5 | 8.60 | 19,207 | -19,198 (−100 %) | -19,959 to -18,437 | outside the noise |

### Truck share (section 10)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 0 % trucks | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 5 | 7,995 | 6,180 | 1,815 (+29 %) | 1,612 to 2,019 | outside the noise |
| 0 % trucks | SDR, relative separation | Today (human drivers) | Served (veh/h) | 5 | 7,995 | 6,180 | 1,815 (+29 %) | 1,612 to 2,019 | outside the noise |
| 0 % trucks | SDR, hybrid separation | SDR, relative separation | Served (veh/h) | 5 | 7,995 | 7,995 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| 10 % trucks | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 5 | 6,038 | 5,395 | 643 (+12 %) | 274 to 1,013 | outside the noise |
| 10 % trucks | SDR, relative separation | Today (human drivers) | Served (veh/h) | 5 | 7,094 | 5,395 | 1,699 (+31 %) | 1,249 to 2,149 | outside the noise |
| 10 % trucks | SDR, hybrid separation | SDR, relative separation | Served (veh/h) | 5 | 6,038 | 7,094 | -1,056 (−15 %) | -1,361 to -751 | outside the noise |
| 20 % trucks | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 5 | 4,467 | 4,895 | -428 (−9 %) | -525 to -331 | outside the noise |
| 20 % trucks | SDR, relative separation | Today (human drivers) | Served (veh/h) | 5 | 5,577 | 4,895 | 682 (+14 %) | 622 to 741 | outside the noise |
| 20 % trucks | SDR, hybrid separation | SDR, relative separation | Served (veh/h) | 5 | 4,467 | 5,577 | -1,110 (−20 %) | -1,164 to -1,055 | outside the noise |
| 30 % trucks | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 5 | 3,576 | 4,564 | -988 (−22 %) | -1,092 to -884 | outside the noise |
| 30 % trucks | SDR, relative separation | Today (human drivers) | Served (veh/h) | 15 | 4,802 | 4,587 | 215 (+5 %) | 113 to 318 | outside the noise |
| 30 % trucks | SDR, hybrid separation | SDR, relative separation | Served (veh/h) | 5 | 3,576 | 4,714 | -1,138 (−24 %) | -1,300 to -975 | outside the noise |
