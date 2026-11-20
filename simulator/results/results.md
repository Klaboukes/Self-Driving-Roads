# SDR simulator: experiment results

Corridor: 5 km, 3 lanes, on-ramp merging at 2.0–2.3 km, off-ramp at 3.5 km (20 % of vehicles exit), 10 % trucks.
"Today" is the same corridor with 100 % human drivers; every SDR row is 100 % SDR-guided vehicles.
Hybrid separation (recommended, and the simulator default) = relative, plus an absolute gap behind trucks, behind any vehicle that reports a fault, and in/just before a segment whose road sensors are down. Platoon breaks are off (section 3 shows why).
"±" is the standard deviation between runs with different traffic (seeds). Whether a difference between two rows is real is worked out per seed, because both rows get the same traffic: see the last section.

## 1. Throughput and delay vs demand

*Full run of 2026-11-20 04:05: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

Ramp demand 900 veh/h in all runs. Warm-up 5 min, then measured (15 min in a full run, 5 min in a quick run).

| System | Main demand (veh/h) | Served (veh/h) | Let in: main + ramp (veh/h) | Mean speed (km/h) | Trip delay, mean (s) | Wait at main entry: median / 95th pct (s) | Wait at on-ramp: median / 95th pct (s) | Longest wait (s) | Queue at end: main + ramp | Collisions (all runs) | Hard brakes / 1000 veh-km | Braking loss (Wh/veh-km) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Today (human drivers) | 2,400 | 3,317 ± 106 | 2,409 + 897 | 109 | 10 ± 1 | 0 / 1 | 0 / 5 | 8 | 0 + 0 | 0 | 21 | 48.0 |
| Today (human drivers) | 3,600 | 4,419 ± 132 | 3,574 + 897 | 98 | 29 ± 7 | 0 / 2 | 0 / 4 | 7 | 0 + 0 | 0 | 46 | 68.3 |
| Today (human drivers) | 4,800 | 5,261 ± 72 | 4,774 + 869 | 75 | 72 ± 11 | 1 / 5 | 0 / 9 | 19 | 3 + 2 | 0 | 86 | 89.8 |
| Today (human drivers) | 6,000 | 5,249 ± 55 | 5,019 + 851 | 58 | 155 ± 17 | 62 / 160 | 5 / 39 | 177 | 282 + 6 | 0 | 75 | 77.5 |
| Today (human drivers) | 7,200 | 5,395 ± 121 | 5,178 + 852 | 61 | 212 ± 10 | 164 / 308 | 15 / 45 | 325 | 654 + 6 | 0 | 72 | 80.2 |
| SDR, absolute separation | 2,400 | 3,262 ± 81 | 2,376 + 897 | 99 | 36 ± 11 | 14 / 36 | 1 / 5 | 43 | 14 + 0 | 0 | 0 | 35.2 |
| SDR, absolute separation | 3,600 | 3,301 ± 50 | 2,441 + 874 | 98 | 173 ± 12 | 235 / 392 | 0 / 5 | 411 | 403 + 0 | 0 | 0 | 35.6 |
| SDR, absolute separation | 4,800 | 3,309 ± 69 | 2,459 + 874 | 98 | 243 ± 7 | 339 / 580 | 0 / 5 | 606 | 794 + 0 | 0 | 0 | 36.2 |
| SDR, absolute separation | 6,000 | 3,312 ± 70 | 2,432 + 874 | 98 | 286 ± 6 | 396 / 692 | 0 / 5 | 727 | 1,194 + 0 | 0 | 0 | 36.8 |
| SDR, absolute separation | 7,200 | 3,304 ± 77 | 2,450 + 874 | 98 | 314 ± 7 | 432 / 766 | 0 / 5 | 803 | 1,598 + 0 | 0 | 0 | 36.4 |
| SDR, absolute + adaptive speed | 2,400 | 3,295 ± 110 | 2,410 + 897 | 97 | 32 ± 6 | 3 / 10 | 0 / 5 | 18 | 2 + 0 | 0 | 0 | 35.3 |
| SDR, absolute + adaptive speed | 3,600 | 3,966 ± 154 | 3,499 + 698 | 56 | 171 ± 15 | 26 / 43 | 53 / 160 | 176 | 35 + 45 | 0 | 11 | 16.6 |
| SDR, absolute + adaptive speed | 4,800 | 4,059 ± 169 | 3,425 + 682 | 55 | 268 ± 11 | 193 / 313 | 65 / 171 | 329 | 430 + 48 | 0 | 15 | 15.0 |
| SDR, absolute + adaptive speed | 6,000 | 4,079 ± 129 | 3,442 + 665 | 55 | 321 ± 9 | 286 / 477 | 69 / 190 | 496 | 816 + 53 | 0 | 13 | 14.5 |
| SDR, absolute + adaptive speed | 7,200 | 4,053 ± 171 | 3,421 + 679 | 55 | 365 ± 12 | 349 / 594 | 66 / 173 | 621 | 1,241 + 49 | 0 | 11 | 14.2 |
| SDR, relative separation | 2,400 | 3,337 ± 109 | 2,464 + 875 | 112 | 7 ± 0 | 0 / 0 | 0 / 2 | 3 | 0 + 0 | 0 | 0 | 21.3 |
| SDR, relative separation | 3,600 | 4,488 ± 77 | 3,572 + 898 | 110 | 8 ± 1 | 0 / 0 | 0 / 1 | 3 | 0 + 0 | 0 | 0 | 26.7 |
| SDR, relative separation | 4,800 | 5,690 ± 111 | 4,774 + 875 | 107 | 12 ± 1 | 0 / 0 | 0 / 2 | 3 | 0 + 0 | 0 | 0 | 34.5 |
| SDR, relative separation | 6,000 | 6,859 ± 83 | 5,950 + 875 | 103 | 20 ± 4 | 0 / 1 | 0 / 2 | 5 | 0 + 0 | 0 | 1 | 42.7 |
| SDR, relative separation | 7,200 | 7,084 ± 255 | 6,194 + 862 | 99 | 90 ± 14 | 82 / 146 | 6 / 33 | 154 | 315 + 4 | 0 | 1 | 48.0 |
| SDR, hybrid separation | 2,400 | 3,315 ± 96 | 2,409 + 897 | 111 | 8 ± 1 | 0 / 0 | 0 / 2 | 4 | 0 + 0 | 0 | 0 | 24.6 |
| SDR, hybrid separation | 3,600 | 4,491 ± 87 | 3,572 + 897 | 108 | 11 ± 1 | 0 / 0 | 0 / 2 | 4 | 0 + 0 | 0 | 0 | 33.0 |
| SDR, hybrid separation | 4,800 | 5,680 ± 123 | 4,772 + 875 | 103 | 20 ± 2 | 0 / 0 | 0 / 2 | 4 | 0 + 0 | 0 | 1 | 41.5 |
| SDR, hybrid separation | 6,000 | 5,896 ± 213 | 5,070 + 857 | 98 | 102 ± 21 | 99 / 171 | 4 / 34 | 182 | 293 + 5 | 0 | 2 | 42.4 |
| SDR, hybrid separation | 7,200 | 6,002 ± 179 | 5,147 + 854 | 98 | 167 ± 10 | 187 / 320 | 2 / 27 | 334 | 672 + 5 | 0 | 4 | 44.9 |

Trip delay = time from arriving at the entry (including waiting at a gate) to leaving the corridor, minus free-flow time. Waits are those of every vehicle let in during the measuring time, plus the vehicles still waiting at the end with their wait so far; on today's road the "gate" is the queue to get onto a full road. Once demand is above what a road can carry, the queue and the waits grow for as long as the run lasts.

## 2. Incidents

*Full run of 2026-11-20 04:05: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

Main demand 4,200 veh/h + ramp 600 veh/h. Incident at t = 10 min around x = 3 km, observed for 5 min. "Brick-wall stop": a vehicle hits something no sensor saw and stops within about a second. "Sudden 50 % brake loss": the brakes of one vehicle halve; SDR health monitoring reports it after 0.5 s (sooner once it brakes); a human driver is not told. Numbers in brackets: the same traffic over the same 5 minutes without the incident.

| Incident | System | Runs | Runs with a collision | Collisions (without incident) | Worst impact (km/h) | Guardian activations | Safe stops | Supervision brakes | Hard brakes per run (without incident) |
|---|---|---|---|---|---|---|---|---|---|
| debris | Today (human drivers) | 30 | 4 | 7 (0) | 68 | 0 | 0 | 0 | 237 (63) |
| debris | SDR, absolute separation | 30 | 0 | 0 (0) | 0 | 1 | 0 | 1 | 40 (0) |
| debris | SDR, relative separation | 30 | 0 | 0 (0) | 0 | 0 | 0 | 0 | 7 (0) |
| debris | SDR, hybrid separation | 30 | 0 | 0 (0) | 0 | 0 | 0 | 0 | 13 (1) |
| brick-wall stop | Today (human drivers) | 10 | 9 | 33 (0) | 102 | 0 | 0 | 0 | 238 (69) |
| brick-wall stop | SDR, absolute separation | 10 | 0 | 0 (0) | 0 | 0 | 0 | 0 | 23 (0) |
| brick-wall stop | SDR, relative separation | 10 | 6 | 8 (0) | 60 | 10 | 0 | 11 | 9 (0) |
| brick-wall stop | SDR, hybrid separation | 10 | 5 | 5 (0) | 69 | 7 | 0 | 10 | 14 (1) |
| vehicle comms loss | Today (human drivers) | n/a | | | | | | | |
| vehicle comms loss | SDR, absolute separation | 10 | 0 | 0 (0) | 0 | 0 | 10 | 8 | 6 (0) |
| vehicle comms loss | SDR, relative separation | 10 | 0 | 0 (0) | 0 | 0 | 10 | 4 | 3 (0) |
| vehicle comms loss | SDR, hybrid separation | 10 | 0 | 0 (0) | 0 | 0 | 10 | 7 | 6 (1) |
| segment controller failure (60 s) | Today (human drivers) | n/a | | | | | | | |
| segment controller failure (60 s) | SDR, absolute separation | 10 | 0 | 0 (0) | 0 | 0 | 380 | 365 | 56 (0) |
| segment controller failure (60 s) | SDR, relative separation | 10 | 0 | 0 (0) | 0 | 0 | 497 | 371 | 63 (0) |
| segment controller failure (60 s) | SDR, hybrid separation | 10 | 0 | 0 (0) | 0 | 0 | 509 | 418 | 66 (1) |
| sudden 50 % brake loss | Today (human drivers) | 10 | 0 | 0 (0) | 0 | 0 | 0 | 0 | 69 (69) |
| sudden 50 % brake loss | SDR, absolute separation | 10 | 0 | 0 (0) | 0 | 0 | 0 | 7 | 0 (0) |
| sudden 50 % brake loss | SDR, relative separation | 10 | 0 | 0 (0) | 0 | 7 | 0 | 7 | 0 (0) |
| sudden 50 % brake loss | SDR, hybrid separation | 10 | 0 | 0 (0) | 0 | 5 | 0 | 17 | 2 (1) |

## 3. Hybrid separation variants

*Full run of 2026-11-20 04:05: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

Capacity: main 7,200 + ramp 900 veh/h (more than any variant can carry). Safety: runs at 4,200 + 600 veh/h; "load falls off a truck" drops an object just behind a truck that has a vehicle within 150 m behind it.

| Variant | Served (veh/h) | Mean speed (km/h) | Trip delay (s) | Brick-wall stop: runs with collision / collisions / worst (km/h) | Lost load: runs with collision / collisions / worst (km/h) | Lost load: mean gap of the follower (m) |
|---|---|---|---|---|---|---|
| Relative (no hybrid rules) | 7,084 ± 255 | 99 | 90 | 15 of 30 / 22 / 69 | 28 of 30 / 65 / 79 | 24 |
| Relative + absolute behind faulty vehicles only | 7,084 ± 255 | 99 | 90 | 15 of 30 / 22 / 69 | 28 of 30 / 65 / 79 | 24 |
| + platoon break every 20 | 6,765 ± 195 | 99 | 113 | 14 of 30 / 15 / 69 | 27 of 30 / 53 / 79 | 26 |
| + platoon break every 10 | 6,549 ± 304 | 99 | 135 | 20 of 30 / 31 / 70 | 24 of 30 / 57 / 79 | 28 |
| + platoon break every 5 | 5,910 ± 60 | 100 | 174 | 16 of 30 / 25 / 69 | 20 of 30 / 38 / 79 | 39 |
| + platoon break every 3 | 5,215 ± 90 | 100 | 220 | 13 of 30 / 16 / 64 | 15 of 30 / 29 / 78 | 45 |
| + absolute behind trucks (recommended hybrid) | 6,002 ± 179 | 98 | 167 | 19 of 30 / 25 / 70 | 0 of 30 / 0 / 0 | 65 |
| + absolute behind trucks + platoon break every 10 | 5,613 ± 207 | 99 | 196 | 21 of 30 / 30 / 70 | 0 of 30 / 0 / 0 | 64 |
| Absolute | 3,304 ± 77 | 98 | 314 | 0 of 30 / 0 / 0 | 0 of 30 / 0 / 0 | 48 |

## 4. Detection layers vs foreign objects

*Full run of 2026-11-20 04:05: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

An object that stops a vehicle dead (worst case) appears in lane 2 at 4,200 + 600 veh/h, observed for 4 minutes. Road cameras confirm an object after 0.5 s; each vehicle's own sensor sees it within 120 m with the stated probability (rolled per vehicle); "shared" means the detecting vehicle reports it to the road (confirmed one control cycle later) and with V2V also directly to nearby vehicles.

| Scenario | Detection layers | Policy | Runs with a collision | Collisions | Vehicles that hit the object | Worst impact (km/h) | Mean distance of first vehicle (m) |
|---|---|---|---|---|---|---|---|
| object 150 m ahead | Human drivers (see it within 150 m) | Today | 4 of 30 | 9 (2) | 3 | 72 | 136 |
| object 150 m ahead | Nobody detects it | SDR absolute | 10 of 10 | 10 | 10 | 120 | 146 |
| object 150 m ahead | Nobody detects it | SDR relative | 10 of 10 | 22 | 10 | 120 | 150 |
| object 150 m ahead | Nobody detects it | SDR hybrid | 30 of 30 | 48 | 32 | 120 | 149 |
| object 150 m ahead | Road cameras only (95 %, 0.5 s) | SDR absolute | 0 of 10 | 0 | 0 | 0 | 146 |
| object 150 m ahead | Road cameras only (95 %, 0.5 s) | SDR relative | 0 of 10 | 0 | 0 | 0 | 150 |
| object 150 m ahead | Road cameras only (95 %, 0.5 s) | SDR hybrid | 0 of 30 | 0 | 0 | 0 | 149 |
| object 150 m ahead | Car sensors only (90 %), not shared | SDR absolute | 7 of 10 | 7 | 7 | 120 | 146 |
| object 150 m ahead | Car sensors only (90 %), not shared | SDR relative | 9 of 10 | 14 | 9 | 120 | 150 |
| object 150 m ahead | Car sensors only (90 %), not shared | SDR hybrid | 27 of 30 | 46 | 28 | 120 | 149 |
| object 150 m ahead | Car sensors (90 %) + V2V | SDR absolute | 2 of 10 | 2 | 2 | 120 | 146 |
| object 150 m ahead | Car sensors (90 %) + V2V | SDR relative | 3 of 10 | 8 | 3 | 120 | 150 |
| object 150 m ahead | Car sensors (90 %) + V2V | SDR hybrid | 5 of 30 | 12 | 6 | 120 | 149 |
| object 150 m ahead | Road cameras + car sensors + V2V | SDR absolute | 0 of 10 | 0 | 0 | 0 | 146 |
| object 150 m ahead | Road cameras + car sensors + V2V | SDR relative | 0 of 10 | 0 | 0 | 0 | 150 |
| object 150 m ahead | Road cameras + car sensors + V2V | SDR hybrid | 0 of 30 | 0 | 0 | 0 | 149 |
| object 300 m ahead | Human drivers (see it within 150 m) | Today | 3 of 30 | 8 (2) | 3 | 72 | 164 |
| object 300 m ahead | Nobody detects it | SDR absolute | 10 of 10 | 10 | 10 | 120 | 229 |
| object 300 m ahead | Nobody detects it | SDR relative | 10 of 10 | 21 | 11 | 120 | 217 |
| object 300 m ahead | Nobody detects it | SDR hybrid | 30 of 30 | 56 | 36 | 120 | 231 |
| object 300 m ahead | Road cameras only (95 %, 0.5 s) | SDR absolute | 0 of 10 | 0 | 0 | 0 | 229 |
| object 300 m ahead | Road cameras only (95 %, 0.5 s) | SDR relative | 0 of 10 | 0 | 0 | 0 | 217 |
| object 300 m ahead | Road cameras only (95 %, 0.5 s) | SDR hybrid | 0 of 30 | 0 | 0 | 0 | 231 |
| object 300 m ahead | Car sensors only (90 %), not shared | SDR absolute | 8 of 10 | 8 | 8 | 120 | 229 |
| object 300 m ahead | Car sensors only (90 %), not shared | SDR relative | 10 of 10 | 18 | 11 | 120 | 217 |
| object 300 m ahead | Car sensors only (90 %), not shared | SDR hybrid | 28 of 30 | 44 | 29 | 120 | 231 |
| object 300 m ahead | Car sensors (90 %) + V2V | SDR absolute | 3 of 10 | 3 | 3 | 120 | 229 |
| object 300 m ahead | Car sensors (90 %) + V2V | SDR relative | 3 of 10 | 9 | 4 | 120 | 217 |
| object 300 m ahead | Car sensors (90 %) + V2V | SDR hybrid | 5 of 30 | 14 | 6 | 120 | 231 |
| object 300 m ahead | Road cameras + car sensors + V2V | SDR absolute | 0 of 10 | 0 | 0 | 0 | 229 |
| object 300 m ahead | Road cameras + car sensors + V2V | SDR relative | 0 of 10 | 0 | 0 | 0 | 217 |
| object 300 m ahead | Road cameras + car sensors + V2V | SDR hybrid | 0 of 30 | 0 | 0 | 0 | 231 |
| load falls off a truck | Human drivers (see it within 150 m) | Today | 28 of 30 | 119 (2) | 30 | 91 | 36 |
| load falls off a truck | Nobody detects it | SDR absolute | 10 of 10 | 10 | 10 | 90 | 46 |
| load falls off a truck | Nobody detects it | SDR relative | 10 of 10 | 26 | 10 | 97 | 18 |
| load falls off a truck | Nobody detects it | SDR hybrid | 30 of 30 | 60 | 31 | 91 | 65 |
| load falls off a truck | Road cameras only (95 %, 0.5 s) | SDR absolute | 0 of 10 | 0 | 0 | 0 | 46 |
| load falls off a truck | Road cameras only (95 %, 0.5 s) | SDR relative | 10 of 10 | 25 | 10 | 91 | 18 |
| load falls off a truck | Road cameras only (95 %, 0.5 s) | SDR hybrid | 0 of 30 | 0 | 0 | 0 | 65 |
| load falls off a truck | Car sensors only (90 %), not shared | SDR absolute | 6 of 10 | 6 | 6 | 85 | 46 |
| load falls off a truck | Car sensors only (90 %), not shared | SDR relative | 10 of 10 | 26 | 10 | 90 | 18 |
| load falls off a truck | Car sensors only (90 %), not shared | SDR hybrid | 26 of 30 | 31 | 26 | 90 | 65 |
| load falls off a truck | Car sensors (90 %) + V2V | SDR absolute | 3 of 10 | 3 | 3 | 85 | 46 |
| load falls off a truck | Car sensors (90 %) + V2V | SDR relative | 10 of 10 | 26 | 10 | 90 | 18 |
| load falls off a truck | Car sensors (90 %) + V2V | SDR hybrid | 5 of 30 | 10 | 5 | 90 | 65 |
| load falls off a truck | Road cameras + car sensors + V2V | SDR absolute | 0 of 10 | 0 | 0 | 0 | 46 |
| load falls off a truck | Road cameras + car sensors + V2V | SDR relative | 10 of 10 | 25 | 10 | 90 | 18 |
| load falls off a truck | Road cameras + car sensors + V2V | SDR hybrid | 0 of 30 | 0 | 0 | 0 | 65 |

Numbers in brackets (human rows): collisions in the same traffic without the object.

## 5. Safety lane (hard shoulder)

*Full run of 2026-11-20 04:05: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

4,200 + 600 veh/h, observed for 20 minutes (10 in a quick run). A broken-down vehicle loses propulsion and is towed 15 minutes after it stops. Extra delay = vehicle-hours spent in the system in that time minus the same traffic without the incident. Collisions in brackets: the same traffic without the incident.

| Incident | System | Runs | Collisions (without incident) | Worst impact (km/h) | Sent to safety lane (per run) | Vehicle stopped in a live lane (s per run) | Extra delay (vehicle-hours) |
|---|---|---|---|---|---|---|---|
| breakdown | Today, no hard shoulder | 30 | 2 (4) | 16 | 0.0 | 630 | 18.5 ± 12.8 |
| breakdown | Today, with hard shoulder | 30 | 3 (4) | 17 | 1.0 | 0 | -0.5 ± 4.1 |
| breakdown | SDR hybrid, no safety lane | 30 | 0 (0) | 0 | 0.0 | 570 | 5.9 ± 14.9 |
| breakdown | SDR hybrid, with safety lane | 30 | 0 (0) | 0 | 1.0 | 0 | -0.0 ± 0.0 |
| sudden 50 % brake loss | SDR hybrid, no safety lane | 10 | 0 (0) | 0 | 0.0 | 0 | 0.0 ± 0.0 |
| sudden 50 % brake loss | SDR hybrid, with safety lane | 10 | 0 (0) | 0 | 1.0 | 0 | 0.0 ± 0.0 |
| vehicle comms loss | SDR hybrid, no safety lane | 30 | 0 (0) | 0 | 0.0 | 14 | 0.3 ± 0.1 |
| vehicle comms loss | SDR hybrid, with safety lane | 30 | 0 (0) | 0 | 1.0 | 12 | 0.2 ± 0.1 |

## 6. Road-sensor outage (hybrid falls back to absolute locally)

*Full run of 2026-11-20 04:05: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

| Demand (veh/h) | Road sensors | Served (veh/h) | Trip delay (s) | Queue at gates (end) | Collisions (all runs) |
|---|---|---|---|---|---|
| 4200 + 600 | all sensors up | 4,763 ± 117 | 12 | 0 | 0 |
| 4200 + 600 | down at the on-ramp merge (2–3 km) | 3,974 ± 66 | 133 | 244 | 0 |
| 4200 + 600 | down on a plain stretch (4–5 km) | 4,735 ± 129 | 35 | 0 | 0 |
| 7200 + 900 | all sensors up | 6,002 ± 179 | 167 | 678 | 0 |
| 7200 + 900 | down at the on-ramp merge (2–3 km) | 3,890 ± 130 | 302 | 1,376 | 0 |
| 7200 + 900 | down on a plain stretch (4–5 km) | 5,542 ± 114 | 220 | 679 | 0 |

## 7. Weather

*Full run of 2026-11-20 04:05: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

Main demand 3,600 veh/h + ramp 600 veh/h.

| Weather | System | Served (veh/h) | Mean speed (km/h) | Trip delay (s) | Queue at gates (end) | Collisions (all runs) | Hard brakes / 1000 veh-km |
|---|---|---|---|---|---|---|---|
| dry | Today (human drivers) | 4,149 ± 100 | 106 | 14 | 0 | 0 | 27 |
| dry | SDR, absolute separation | 3,246 ± 44 | 101 | 158 | 325 | 0 | 0 |
| dry | SDR, absolute + adaptive speed | 3,902 ± 161 | 58 | 141 | 11 | 0 | 9 |
| dry | SDR, relative separation | 4,173 ± 98 | 111 | 8 | 0 | 0 | 0 |
| dry | SDR, hybrid separation | 4,172 ± 103 | 109 | 10 | 0 | 0 | 0 |
| wet | Today (human drivers) | 4,176 ± 119 | 95 | 33 | 0 | 0 | 15 |
| wet | SDR, absolute separation | 2,830 ± 40 | 101 | 203 | 459 | 0 | 0 |
| wet | SDR, absolute + adaptive speed | 3,742 ± 81 | 54 | 187 | 90 | 0 | 3 |
| wet | SDR, relative separation | 4,175 ± 98 | 110 | 8 | 0 | 0 | 0 |
| wet | SDR, hybrid separation | 4,173 ± 103 | 109 | 10 | 0 | 0 | 0 |
| ice | Today (human drivers) | 3,958 ± 154 | 60 | 130 | 2 | 2 | 0 |
| ice | SDR, absolute separation | 1,286 ± 24 | 80 | 301 | 972 | 0 | 0 |
| ice | SDR, absolute + adaptive speed | 2,398 ± 44 | 53 | 324 | 580 | 0 | 0 |
| ice | SDR, relative separation | 4,251 ± 73 | 85 | 52 | 0 | 0 | 0 |
| ice | SDR, hybrid separation | 3,580 ± 39 | 83 | 128 | 185 | 0 | 0 |

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

*Full run of 2026-11-20 04:05: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

SDR hybrid at 7,200 + 900 veh/h (saturated). "Fixed gaps": every vehicle keeps the standard allowance for stale authority (about two control cycles). "Widened gaps": the road measures the loss rate and adds the allowance shown, so a run of lost messages rarely outlasts it. A supervision brake is full-force braking because the last authority received is about to run out. Smallest spare = the least distance, over all vehicles and runs, between where a vehicle could still stop and the end of its authority (negative would mean an overrun).

| Packet loss | Gaps | Extra allowance (s) | Served (veh/h) | Supervision brakes per run | Safe stops per run | Hard brakes / 1000 veh-km | Collisions (all runs) | Smallest spare (m) |
|---|---|---|---|---|---|---|---|---|
| 0 % | fixed | 0.00 | 5,957 ± 184 | 0 | 0 | 4 | 0 | 0.35 |
| 1 % | fixed | 0.00 | 5,974 ± 196 | 0 | 0 | 3 | 0 | 0.33 |
| 5 % | fixed | 0.00 | 5,965 ± 177 | 18 | 0 | 7 | 0 | 0.01 |
| 10 % | fixed | 0.00 | 5,997 ± 220 | 216 | 0 | 49 | 0 | 0.00 |
| 20 % | fixed | 0.00 | 5,923 ± 198 | 2,172 | 0 | 524 | 0 | 0.00 |
| 50 % | fixed | 0.00 | 5,086 ± 252 | 19,269 | 47 | 4,866 | 0 | -0.00 |
| 0 % | widened | 0.00 | 5,957 ± 184 | 0 | 0 | 4 | 0 | 0.35 |
| 1 % | widened | 0.00 | 5,946 ± 217 | 0 | 0 | 4 | 0 | 0.51 |
| 5 % | widened | 0.11 | 5,617 ± 237 | 1 | 0 | 3 | 0 | 0.29 |
| 10 % | widened | 0.20 | 5,394 ± 187 | 4 | 0 | 3 | 0 | 0.05 |
| 20 % | widened | 0.37 | 4,915 ± 148 | 9 | 0 | 4 | 0 | 0.01 |
| 50 % | widened | 1.13 | 3,390 ± 129 | 8 | 26 | 28 | 0 | 0.02 |

## 9a. Realistic radio loss

*Full run of 2026-11-20 04:05: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

SDR hybrid at 7,200 + 900 veh/h (saturated). "Loss" is per path: the share of authority messages a path loses over the long run. In bursts, a two-state chain (Gilbert–Elliott) loses every message while it is in a burst; bursts last the time stated on average and the long-run rate is the same as with independent loss. With two paths an authority is lost only if both lose it; "common" loss hits both paths at once (the same burst, e.g. a truck shadowing both antennas). "Sent twice": a second copy 50 ms later on the same path. The dead spots lie at 2.6–2.8 km (for 60 s, from 10 min into the run) and 2.70–2.72 km (permanent). Unless stated, the road measures the loss and widens every gap so that a run of lost messages outlasts the allowance in at most 1 control cycle in 10,000 (the tolerance). "Road measures bursts": it also measures how often a lost message follows a lost one and sizes the allowance for runs of that kind; otherwise it assumes independent loss, as in section 9.

Lost per message: authorities lost on every path, measured over the run. Lost after a lost one: the road's estimate of that chance at the end of the run. Old authority: control cycles in which a vehicle's latest authority was lost three or more times in a row (0.3 s or older), per million. Left on an old authority: times the changer or the new follower of a lane change drove on for more than the normal 50 ms on an authority that was not computed for the change (the changer's did not yet keep behind its new leader, the follower's not behind the changer); least spare = the smallest distance by which such a vehicle could still stop behind that vehicle's end of authority (negative: it could not). Smallest spare (m) is over all vehicles; values of a few millimetres below zero come from the conservative way the stopping distance is added up at crawling speed, not from an overrun.

**A. Same loss rate, different pattern (one path; the road assumes independent loss, as it does by default)**

| Case | Lost per message (%) | Lost after a lost one | Extra allowance (s) | Served (veh/h) | Against no loss | Supervision brakes per run | Safe stops per run (most in one run) | Old authority (per million) | Hard brakes / 1000 veh-km | Collisions (all runs) | Smallest spare (m) | Lane changes per hour | Left on an old authority at a lane change, per run / longest (s) / least spare (m) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| No loss | 0.00 | 0.00 | 0.00 | 5,957 ± 184 |  | 0 | 0.0 (0) | 0 | 4 | 0 | 0.35 | 6,210 | 0.0 / 0.00 / – |
| 5 %, independent | 5.00 | 0.05 | 0.11 | 5,620 ± 207 | −6 % (outside the noise) | 1 | 0.0 (0) | 127 | 3 | 0 | 0.14 | 5,875 | 0.0 / 0.00 / – |
| 5 %, bursts of 0.2 s | 5.01 | 0.61 | 0.10 | 5,425 ± 221 | −10 % (outside the noise) | 3,677 | 55.6 (71) | 18,702 | 1,467 | 0 | 0.00 | 5,648 | 0.0 / 0.00 / – |
| 5 %, bursts of 0.5 s | 5.03 | 0.82 | 0.11 | 4,526 ± 119 | −24 % (outside the noise) | 5,067 | 1282.7 (1,380) | 33,760 | 2,229 | 0 | 0.00 | 5,884 | 0.0 / 0.00 / – |
| 5 %, bursts of 2 s | 5.02 | 0.95 | 0.13 | 2,645 ± 54 | −56 % (outside the noise) | 2,175 | 2063.8 (2,158) | 45,425 | 1,742 | 0 | 0.00 | 18,558 | 0.0 / 0.00 / – |

**B. The road also measures bursts and widens the gaps for them**

| Case | Lost per message (%) | Lost after a lost one | Extra allowance (s) | Served (veh/h) | Against no loss | Supervision brakes per run | Safe stops per run (most in one run) | Old authority (per million) | Hard brakes / 1000 veh-km | Collisions (all runs) | Smallest spare (m) | Lane changes per hour | Left on an old authority at a lane change, per run / longest (s) / least spare (m) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 5 %, independent, road measures bursts | 5.00 | 0.05 | 0.11 | 5,627 ± 234 | −6 % (outside the noise) | 2 | 0.0 (0) | 129 | 3 | 0 | 0.16 | 5,903 | 0.0 / 0.00 / – |
| 5 %, bursts of 0.2 s, road measures bursts | 5.00 | 0.61 | 1.17 | 3,395 ± 107 | −43 % (outside the noise) | 5 | 32.2 (40) | 18,619 | 23 | 0 | 0.01 | 3,489 | 0.0 / 0.00 / – |
| 5 %, bursts of 0.5 s, road measures bursts | 5.04 | 0.82 | 2.94 | 1,826 ± 67 | −70 % (outside the noise) | 0 | 470.4 (492) | 33,887 | 364 | 0 | 7.45 | 1,950 | 0.0 / 0.00 / – |
| 5 %, bursts of 2 s, road measures bursts | 5.04 | 0.95 | 3.00 | 1,639 ± 60 | −73 % (outside the noise) | 0 | 956.8 (995) | 45,569 | 595 | 0 | 2.73 | 2,172 | 0.0 / 0.00 / – |

**C. Loss tolerance: capacity against full-force braking**

| Case | Lost per message (%) | Lost after a lost one | Extra allowance (s) | Served (veh/h) | Against no loss | Supervision brakes per run | Safe stops per run (most in one run) | Old authority (per million) | Hard brakes / 1000 veh-km | Collisions (all runs) | Smallest spare (m) | Lane changes per hour | Left on an old authority at a lane change, per run / longest (s) / least spare (m) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 10 %, independent, fixed gaps | 10.00 | 0.10 | 0.00 | 6,038 ± 194 |  | 223 | 0.0 (0) | 990 | 51 | 0 | 0.00 | 6,283 | 0.0 / 0.00 / – |
| 10 %, independent, tolerance 0.01 | 10.00 | 0.10 | 0.00 | 5,966 ± 203 |  | 212 | 0.0 (0) | 1,007 | 50 | 0 | 0.00 | 6,246 | 0.0 / 0.00 / – |
| 10 %, independent, tolerance 0.001 | 10.00 | 0.10 | 0.10 | 5,637 ± 240 |  | 22 | 0.0 (0) | 1,002 | 8 | 0 | 0.01 | 5,929 | 0.0 / 0.00 / – |
| 10 %, independent, tolerance 0.0001 | 10.00 | 0.10 | 0.20 | 5,354 ± 166 |  | 4 | 0.0 (0) | 999 | 4 | 0 | 0.00 | 5,563 | 0.0 / 0.00 / – |
| 10 %, independent, tolerance 0.00001 | 10.00 | 0.10 | 0.30 | 5,101 ± 167 |  | 0 | 0.0 (0) | 991 | 3 | 0 | 0.34 | 5,155 | 0.0 / 0.00 / – |
| 10 %, independent, tolerance 0.000001 | 10.00 | 0.10 | 0.40 | 4,847 ± 158 |  | 0 | 0.0 (0) | 997 | 2 | 0 | 0.17 | 4,959 | 0.0 / 0.00 / – |
| two paths, 10 % each, tolerance 0.01 | 1.00 | 0.67 | 0.00 | 5,940 ± 206 |  | 1,719 | 35.2 (43) | 4,509 | 716 | 0 | 0.00 | 6,179 | 0.0 / 0.00 / – |
| two paths, 10 % each, tolerance 0.001 | 0.99 | 0.67 | 0.48 | 4,661 ± 206 |  | 218 | 23.8 (30) | 4,453 | 126 | 0 | 0.00 | 4,690 | 0.0 / 0.00 / – |
| two paths, 10 % each, tolerance 0.0001 | 1.00 | 0.67 | 1.06 | 3,477 ± 122 |  | 10 | 20.4 (29) | 4,526 | 15 | 0 | 0.00 | 3,673 | 0.0 / 0.00 / – |

**D. One path, two paths, sending twice (bursts of 0.5 s on every path; the road measures bursts)**

| Case | Lost per message (%) | Lost after a lost one | Extra allowance (s) | Served (veh/h) | Against no loss | Supervision brakes per run | Safe stops per run (most in one run) | Old authority (per million) | Hard brakes / 1000 veh-km | Collisions (all runs) | Smallest spare (m) | Lane changes per hour | Left on an old authority at a lane change, per run / longest (s) / least spare (m) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| one path, 1 % | 0.99 | 0.81 | 2.08 | 2,270 ± 59 | −62 % (outside the noise) | 0 | 107.0 (125) | 6,631 | 102 | 0 | 4.42 | 2,500 | 0.0 / 0.00 / – |
| one path, 2 % | 2.00 | 0.82 | 2.58 | 2,068 ± 79 | −66 % (outside the noise) | 0 | 200.2 (211) | 13,353 | 199 | 0 | 5.27 | 2,278 | 0.0 / 0.00 / – |
| one path, 5 % | 5.04 | 0.82 | 2.94 | 1,826 ± 67 | −70 % (outside the noise) | 0 | 470.4 (492) | 33,887 | 364 | 0 | 7.45 | 1,950 | 0.0 / 0.00 / – |
| one path, 10 % | 10.06 | 0.82 | 3.00 | 1,785 ± 41 | −70 % (outside the noise) | 0 | 934.1 (985) | 67,735 | 496 | 0 | 5.36 | 1,930 | 0.0 / 0.00 / – |
| two paths, 1 % each | 0.01 | 0.60 | 0.00 | 5,914 ± 249 | −1 % (within the noise) | 17 | 0.4 (2) | 44 | 11 | 0 | 0.00 | 6,209 | 0.0 / 0.00 / – |
| two paths, 2 % each | 0.04 | 0.69 | 0.26 | 5,146 ± 222 | −14 % (outside the noise) | 26 | 1.0 (2) | 185 | 17 | 0 | 0.00 | 5,242 | 0.0 / 0.00 / – |
| two paths, 5 % each | 0.25 | 0.66 | 0.68 | 4,177 ± 181 | −30 % (outside the noise) | 19 | 4.6 (10) | 1,107 | 15 | 0 | 0.00 | 4,197 | 0.0 / 0.00 / – |
| two paths, 10 % each | 1.00 | 0.67 | 1.06 | 3,477 ± 122 | −42 % (outside the noise) | 10 | 20.4 (29) | 4,526 | 15 | 0 | 0.00 | 3,673 | 0.0 / 0.00 / – |
| two paths, 20 % each | 4.00 | 0.68 | 1.43 | 2,984 ± 83 | −50 % (outside the noise) | 1 | 69.8 (72) | 18,345 | 42 | 0 | 0.09 | 3,122 | 0.0 / 0.00 / – |
| two paths, 2 % each, half of it common to both | 1.01 | 0.82 | 2.30 | 2,309 ± 92 |  | 0 | 117.0 (137) | 6,735 | 101 | 0 | 3.06 | 2,445 | 0.0 / 0.00 / – |
| two paths, 10 % each, half of it common to both | 5.32 | 0.82 | 2.93 | 1,858 ± 84 |  | 0 | 475.0 (497) | 35,209 | 369 | 0 | 6.46 | 2,000 | 0.0 / 0.00 / – |
| two paths, 10 % each, all of it common to both | 10.06 | 0.82 | 3.00 | 1,789 ± 61 |  | 0 | 943.6 (985) | 67,827 | 497 | 0 | 6.35 | 1,972 | 0.0 / 0.00 / – |
| one path, 10 %, every authority sent twice | 9.08 | 0.82 | 3.00 | 1,781 ± 50 |  | 0 | 888.5 (939) | 60,990 | 502 | 0 | 5.03 | 1,897 | 0.0 / 0.00 / – |
| one path, 10 % independent | 10.00 | 0.10 | 0.20 | 5,419 ± 221 |  | 3 | 0.0 (0) | 1,006 | 4 | 0 | 0.21 | 5,474 | 0.0 / 0.00 / – |
| one path, 10 % independent, every authority sent twice | 1.00 | 0.01 | 0.00 | 5,959 ± 204 |  | 0 | 0.0 (0) | 1 | 4 | 0 | 0.31 | 6,290 | 0.0 / 0.00 / – |
| two paths, 10 % independent each | 1.00 | 0.01 | 0.00 | 5,974 ± 212 |  | 0 | 0.0 (0) | 1 | 3 | 0 | 0.30 | 6,342 | 0.0 / 0.00 / – |

**E. Dead spot (no other loss)**

| Case | Lost per message (%) | Lost after a lost one | Extra allowance (s) | Served (veh/h) | Against no loss | Supervision brakes per run | Safe stops per run (most in one run) | Old authority (per million) | Hard brakes / 1000 veh-km | Collisions (all runs) | Smallest spare (m) | Lane changes per hour | Left on an old authority at a lane change, per run / longest (s) / least spare (m) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| No loss | 0.00 | 0.00 | 0.00 | 5,957 ± 184 |  | 0 | 0.0 (0) | 0 | 4 | 0 | 0.35 | 6,210 | 0.0 / 0.00 / – |
| 200 m dead spot for 60 s | 0.58 | 1.00 | 0.00 | 5,002 ± 1,058 | −16 % (outside the noise) | 16 | 26.5 (32) | 5,783 | 12 | 0 | 0.00 | 5,989 | 0.0 / 0.00 / – |
| 200 m dead spot for 60 s, second path not affected | 0.00 | 0.00 | 0.00 | 5,957 ± 184 |  | 0 | 0.0 (0) | 0 | 4 | 0 | 0.35 | 6,210 | 0.0 / 0.00 / – |
| 20 m dead spot, permanent | 2.62 | 1.00 | 0.05 | 0 ± 0 | −100 % (outside the noise) | 0 | 0.0 (0) | 26,176 | 179 | 0 | 0.38 | 686 | 0.0 / 0.00 / – |
| 20 m dead spot, permanent, second path not affected | 0.00 | 0.00 | 0.00 | 6,002 ± 179 |  | 0 | 0.0 (0) | 0 | 4 | 0 | 1.39 | 6,180 | 0.0 / 0.00 / – |

**F. Lane change without the acknowledgement of the changer and the new follower (the rule before; the acknowledgement is the default now, in every other row)**

| Case | Lost per message (%) | Lost after a lost one | Extra allowance (s) | Served (veh/h) | Against no loss | Supervision brakes per run | Safe stops per run (most in one run) | Old authority (per million) | Hard brakes / 1000 veh-km | Collisions (all runs) | Smallest spare (m) | Lane changes per hour | Left on an old authority at a lane change, per run / longest (s) / least spare (m) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| No loss, without acknowledgement | 0.00 | 0.00 | 0.00 | 5,978 ± 238 |  | 0 | 0.0 (0) | 0 | 4 | 0 | 0.49 | 6,418 | 0.0 / 0.05 / 0.54 |
| No loss | 0.00 | 0.00 | 0.00 | 5,957 ± 184 |  | 0 | 0.0 (0) | 0 | 4 | 0 | 0.35 | 6,210 | 0.0 / 0.00 / – |
| 10 %, independent, tolerance 0.0001, without acknowledgement | 10.00 | 0.10 | 0.20 | 5,351 ± 217 |  | 4 | 0.0 (0) | 997 | 4 | 0 | 0.01 | 5,694 | 253.0 / 0.55 / 1.16 |
| 10 %, independent, tolerance 0.0001 | 10.00 | 0.10 | 0.20 | 5,354 ± 166 |  | 4 | 0.0 (0) | 999 | 4 | 0 | 0.00 | 5,563 | 0.0 / 0.00 / – |
| 5 %, bursts of 0.5 s, without acknowledgement | 5.01 | 0.82 | 0.11 | 4,528 ± 149 |  | 5,049 | 1273.7 (1,365) | 33,613 | 2,247 | 0 | -1.57 | 6,454 | 152.9 / 3.95 / -3.04 |
| 5 %, bursts of 0.5 s | 5.03 | 0.82 | 0.11 | 4,526 ± 119 | −24 % (outside the noise) | 5,067 | 1282.7 (1,380) | 33,760 | 2,229 | 0 | 0.00 | 5,884 | 0.0 / 0.00 / – |
| two paths, 10 % each, without acknowledgement | 1.01 | 0.67 | 1.07 | 3,469 ± 106 |  | 8 | 20.3 (31) | 4,588 | 16 | 0 | 0.00 | 3,700 | 14.1 / 1.25 / 5.43 |
| two paths, 10 % each | 1.00 | 0.67 | 1.06 | 3,477 ± 122 | −42 % (outside the noise) | 10 | 20.4 (29) | 4,526 | 15 | 0 | 0.00 | 3,673 | 0.0 / 0.00 / – |
| 200 m dead spot for 60 s, without acknowledgement | 0.56 | 1.00 | 0.00 | 5,180 ± 914 |  | 18 | 26.1 (31) | 5,530 | 11 | 0 | -1.66 | 6,438 | 19.9 / 56.75 / -1.67 |
| 200 m dead spot for 60 s | 0.58 | 1.00 | 0.00 | 5,002 ± 1,058 | −16 % (outside the noise) | 16 | 26.5 (32) | 5,783 | 12 | 0 | 0.00 | 5,989 | 0.0 / 0.00 / – |

## 10. Truck share

*Full run of 2026-11-20 04:05: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

Main 7,200 + ramp 900 veh/h (saturated). The hybrid keeps an absolute gap behind every truck, so its cost grows with the truck share.

| Trucks | System | Served (veh/h) | Mean speed (km/h) | Trip delay (s) | Collisions (all runs) |
|---|---|---|---|---|---|
| 0 % | Today (human drivers) | 6,180 ± 102 | 70 | 158 | 0 |
| 0 % | SDR, relative separation | 7,991 ± 129 | 112 | 20 | 0 |
| 0 % | SDR, hybrid separation | 7,991 ± 129 | 112 | 20 | 0 |
| 10 % | Today (human drivers) | 5,395 ± 121 | 61 | 212 | 0 |
| 10 % | SDR, relative separation | 7,084 ± 255 | 99 | 90 | 0 |
| 10 % | SDR, hybrid separation | 6,002 ± 179 | 98 | 167 | 0 |
| 20 % | Today (human drivers) | 4,895 ± 77 | 61 | 237 | 0 |
| 20 % | SDR, relative separation | 5,684 ± 138 | 90 | 179 | 0 |
| 20 % | SDR, hybrid separation | 4,438 ± 64 | 94 | 274 | 0 |
| 30 % | Today (human drivers) | 4,587 ± 99 | 61 | 259 | 1 |
| 30 % | SDR, relative separation | 4,741 ± 235 | 81 | 221 | 0 |
| 30 % | SDR, hybrid separation | 3,630 ± 48 | 90 | 324 | 0 |

## 11. Today's road on its own (calibration check)

*Full run of 2026-11-20 04:05: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

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

*Full run of 2026-11-20 04:05: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

SDR hybrid, ramp demand 900 veh/h. Rows 1 to 5 add one change at a time to the merge and the gates; the last four vary one rule around row 5. "Let in" shows which entry the traffic came through: about 970 vehicles an hour arrive at the on-ramp.

| Main demand (veh/h) | Rules | Served (veh/h) | Let in: main + ramp (veh/h) | Trip delay, mean (s) | Wait at main entry: median / 95th pct (s) | Wait at on-ramp: median / 95th pct (s) | Longest wait (s) | Queue at end: main + ramp | Mean speed (km/h) | Hard brakes / 1000 veh-km | Collisions (all runs) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 3,600 | Today (human drivers) | 4,477 ± 106 | 3,611 + 874 | 30 ± 9 | 0 / 2 | 0 / 4 | 7 | 0 + 0 | 98 | 44.6 | 0 |
| 3,600 | Before: merge and gates as they were | 4,330 ± 97 | 3,609 + 718 | 30 ± 9 | 0 / 0 | 89 / 196 | 209 | 0 + 52 | 109 | 1.2 | 0 |
| 3,600 | 1. Ramp vehicle keeps its place in the merge order | 4,506 ± 103 | 3,609 + 889 | 19 ± 1 | 0 / 0 | 44 / 46 | 49 | 0 + 8 | 108 | 0.2 | 0 |
| 3,600 | 2. + truck gap opened for a merging truck | 4,502 ± 109 | 3,609 + 888 | 19 ± 1 | 0 / 0 | 44 / 46 | 48 | 0 + 8 | 108 | 0.2 | 0 |
| 3,600 | 3. + right lane kept free by ramp arrivals (was: ramp queue) | 4,492 ± 96 | 3,609 + 888 | 18 ± 1 | 0 / 0 | 44 / 46 | 48 | 0 + 8 | 108 | 0.2 | 0 |
| 3,600 | 4. + ramp gate timer 15 s (was 45 s) | 4,498 ± 97 | 3,609 + 874 | 13 ± 1 | 0 / 0 | 15 / 17 | 19 | 0 + 3 | 108 | 0.2 | 0 |
| 3,600 | 5. + no ramp gate timer (the new default) | 4,510 ± 102 | 3,609 + 875 | 11 ± 1 | 0 / 0 | 0 / 2 | 4 | 0 + 0 | 108 | 0.2 | 0 |
| 3,600 | 5, corridor filled to 90 % | 4,510 ± 102 | 3,609 + 875 | 11 ± 1 | 0 / 0 | 0 / 2 | 4 | 0 + 0 | 108 | 0.2 | 0 |
| 3,600 | 5, corridor filled to 110 % | 4,510 ± 102 | 3,609 + 875 | 11 ± 1 | 0 / 0 | 0 / 2 | 4 | 0 + 0 | 108 | 0.2 | 0 |
| 3,600 | 5, right lane never kept free for the ramp | 4,504 ± 82 | 3,609 + 875 | 15 ± 1 | 0 / 0 | 0 / 2 | 4 | 0 + 0 | 106 | 0.4 | 0 |
| 3,600 | 5, right lane always kept free for the ramp | 4,510 ± 102 | 3,609 + 875 | 11 ± 1 | 0 / 0 | 0 / 2 | 4 | 0 + 0 | 108 | 0.2 | 0 |
| 4,800 | Today (human drivers) | 5,261 ± 72 | 4,774 + 869 | 72 ± 11 | 1 / 5 | 0 / 9 | 19 | 3 + 2 | 75 | 85.7 | 0 |
| 4,800 | Before: merge and gates as they were | 5,132 ± 55 | 4,772 + 326 | 38 ± 7 | 0 / 0 | 347 / 626 | 655 | 0 + 164 | 106 | 0.2 | 0 |
| 4,800 | 1. Ramp vehicle keeps its place in the merge order | 5,642 ± 126 | 4,770 + 882 | 29 ± 4 | 0 / 4 | 45 / 50 | 56 | 1 + 10 | 102 | 1.2 | 0 |
| 4,800 | 2. + truck gap opened for a merging truck | 5,669 ± 130 | 4,773 + 882 | 27 ± 3 | 0 / 0 | 45 / 47 | 49 | 0 + 10 | 103 | 0.5 | 0 |
| 4,800 | 3. + right lane kept free by ramp arrivals (was: ramp queue) | 5,650 ± 123 | 4,772 + 882 | 26 ± 2 | 0 / 0 | 45 / 47 | 49 | 0 + 10 | 103 | 0.8 | 0 |
| 4,800 | 4. + ramp gate timer 15 s (was 45 s) | 5,672 ± 101 | 4,772 + 874 | 21 ± 1 | 0 / 0 | 15 / 17 | 19 | 0 + 4 | 103 | 0.5 | 0 |
| 4,800 | 5. + no ramp gate timer (the new default) | 5,680 ± 123 | 4,772 + 875 | 20 ± 2 | 0 / 0 | 0 / 2 | 4 | 0 + 0 | 103 | 0.7 | 0 |
| 4,800 | 5, corridor filled to 90 % | 5,671 ± 116 | 4,779 + 875 | 20 ± 4 | 0 / 4 | 0 / 2 | 11 | 0 + 0 | 103 | 1.3 | 0 |
| 4,800 | 5, corridor filled to 110 % | 5,680 ± 123 | 4,772 + 875 | 20 ± 2 | 0 / 0 | 0 / 2 | 4 | 0 + 0 | 103 | 0.7 | 0 |
| 4,800 | 5, right lane never kept free for the ramp | 5,657 ± 100 | 4,774 + 875 | 30 ± 5 | 0 / 6 | 0 / 3 | 12 | 0 + 0 | 99 | 2.9 | 0 |
| 4,800 | 5, right lane always kept free for the ramp | 5,685 ± 122 | 4,772 + 875 | 20 ± 3 | 0 / 0 | 0 / 2 | 4 | 0 + 0 | 103 | 0.7 | 0 |
| 7,200 | Today (human drivers) | 5,395 ± 121 | 5,178 + 852 | 212 ± 10 | 164 / 308 | 15 / 45 | 325 | 654 + 6 | 61 | 71.8 | 0 |
| 7,200 | Before: merge and gates as they were | 5,887 ± 158 | 5,674 + 218 | 168 ± 13 | 163 / 258 | 378 / 730 | 768 | 537 + 191 | 102 | 0.5 | 0 |
| 7,200 | 1. Ramp vehicle keeps its place in the merge order | 5,943 ± 199 | 5,074 + 818 | 176 ± 13 | 192 / 327 | 51 / 103 | 345 | 695 + 26 | 100 | 2.1 | 0 |
| 7,200 | 2. + truck gap opened for a merging truck | 6,000 ± 224 | 5,120 + 861 | 170 ± 15 | 186 / 322 | 45 / 71 | 336 | 678 + 15 | 99 | 2.9 | 0 |
| 7,200 | 3. + right lane kept free by ramp arrivals (was: ramp queue) | 6,045 ± 250 | 5,154 + 868 | 166 ± 19 | 181 / 315 | 45 / 68 | 330 | 666 + 13 | 99 | 4.1 | 0 |
| 7,200 | 4. + ramp gate timer 15 s (was 45 s) | 5,953 ± 224 | 5,137 + 857 | 171 ± 19 | 191 / 326 | 17 / 37 | 340 | 683 + 8 | 99 | 2.5 | 0 |
| 7,200 | 5. + no ramp gate timer (the new default) | 6,002 ± 179 | 5,147 + 854 | 167 ± 10 | 187 / 320 | 2 / 27 | 334 | 672 + 5 | 98 | 3.9 | 0 |
| 7,200 | 5, corridor filled to 90 % | 5,895 ± 128 | 5,007 + 875 | 173 ± 11 | 203 / 346 | 0 / 2 | 360 | 728 + 0 | 100 | 1.6 | 0 |
| 7,200 | 5, corridor filled to 110 % | 6,046 ± 252 | 5,287 + 784 | 170 ± 26 | 183 / 300 | 23 / 81 | 314 | 631 + 23 | 96 | 3.3 | 0 |
| 7,200 | 5, right lane never kept free for the ramp | 5,806 ± 171 | 4,935 + 870 | 179 ± 13 | 205 / 347 | 0 / 14 | 363 | 733 + 1 | 96 | 5.7 | 0 |
| 7,200 | 5, right lane always kept free for the ramp | 6,022 ± 184 | 5,140 + 842 | 162 ± 12 | 180 / 313 | 1 / 40 | 328 | 665 + 8 | 99 | 4.2 | 0 |

Trip delay = time from arriving at the entry (including waiting at a gate) to leaving the corridor, minus free-flow time. Waits are those of every vehicle let in during the measuring time, plus the vehicles still waiting at the end with their wait so far; on today's road the "gate" is the queue to get onto a full road. Once demand is above what a road can carry, the queue and the waits grow for as long as the run lasts.

## 13. Speed under pressure

*Full run of 2026-11-20 04:05: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

Ramp demand 900 veh/h. "Adaptive" lowers the speed limit to the speed at which a lane carries most in theory (about 80 km/h for the hybrid, 96 km/h for relative) once more than 8 vehicles wait at the gates, and raises it again when fewer than 3 wait. Trucks drive 90 km/h at most in every row. Trip time is from arriving at the entry to leaving the corridor, waiting at a gate included; it is used here in place of trip delay, because delay is counted against the speed limit of the row and would flatter the slow rows.

| System | Main demand (veh/h) | Speed rule | Served (veh/h) | Mean speed (km/h) | Speed limit at the end (km/h) | Trip time, mean (s) | Wait, 95th pct (s) | Queue at end: main + ramp | Hard brakes / 1000 veh-km | Braking loss (Wh/veh-km) | Collisions (all runs) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| SDR, hybrid separation | 2,400 | fixed 120 km/h | 3,315 ± 96 | 111 | 120 | 140 ± 1 | 1 | 0 + 0 | 0.1 | 24.6 | 0 |
| SDR, hybrid separation | 2,400 | adaptive (slows down when queues build) | 3,342 ± 106 | 111 | 120 | 140 ± 1 | 1 | 0 + 0 | 0.1 | 23.9 | 0 |
| SDR, hybrid separation | 2,400 | fixed 100 km/h | 3,309 ± 101 | 97 | 100 | 158 ± 1 | 0 | 0 + 0 | 0.0 | 10.2 | 0 |
| SDR, hybrid separation | 2,400 | fixed 80 km/h | 3,305 ± 108 | 80 | 80 | 193 ± 1 | 0 | 0 + 0 | 0.0 | 5.5 | 0 |
| SDR, hybrid separation | 3,600 | fixed 120 km/h | 4,491 ± 87 | 108 | 120 | 147 ± 2 | 1 | 0 + 0 | 0.2 | 33.0 | 0 |
| SDR, hybrid separation | 3,600 | adaptive (slows down when queues build) | 4,510 ± 102 | 108 | 120 | 147 ± 2 | 1 | 0 + 0 | 0.2 | 32.8 | 0 |
| SDR, hybrid separation | 3,600 | fixed 100 km/h | 4,485 ± 91 | 96 | 100 | 164 ± 1 | 0 | 0 + 0 | 0.0 | 14.5 | 0 |
| SDR, hybrid separation | 3,600 | fixed 80 km/h | 4,491 ± 110 | 79 | 80 | 199 ± 1 | 0 | 0 + 0 | 0.0 | 8.6 | 0 |
| SDR, hybrid separation | 4,800 | fixed 120 km/h | 5,658 ± 121 | 103 | 120 | 158 ± 4 | 1 | 1 + 0 | 1.0 | 41.4 | 0 |
| SDR, hybrid separation | 4,800 | adaptive (slows down when queues build) | 5,680 ± 123 | 103 | 120 | 157 ± 2 | 1 | 0 + 0 | 0.7 | 41.5 | 0 |
| SDR, hybrid separation | 4,800 | fixed 100 km/h | 5,658 ± 111 | 93 | 100 | 173 ± 3 | 1 | 0 + 1 | 0.5 | 23.6 | 0 |
| SDR, hybrid separation | 4,800 | fixed 80 km/h | 5,638 ± 149 | 77 | 80 | 211 ± 5 | 1 | 0 + 0 | 0.6 | 17.7 | 0 |
| SDR, hybrid separation | 6,000 | fixed 120 km/h | 5,918 ± 194 | 98 | 120 | 229 ± 24 | 158 | 282 + 10 | 2.7 | 43.6 | 0 |
| SDR, hybrid separation | 6,000 | adaptive (slows down when queues build) | 5,949 ± 210 | 74 | 80 | 238 ± 24 | 125 | 103 + 62 | 1.7 | 31.4 | 0 |
| SDR, hybrid separation | 6,000 | fixed 100 km/h | 6,174 ± 213 | 87 | 100 | 230 ± 25 | 109 | 169 + 36 | 2.5 | 32.7 | 0 |
| SDR, hybrid separation | 6,000 | fixed 80 km/h | 6,032 ± 155 | 69 | 80 | 269 ± 18 | 139 | 170 + 56 | 1.4 | 27.0 | 0 |
| SDR, hybrid separation | 7,200 | fixed 120 km/h | 5,957 ± 184 | 99 | 120 | 300 ± 21 | 319 | 676 + 7 | 3.7 | 44.6 | 0 |
| SDR, hybrid separation | 7,200 | adaptive (slows down when queues build) | 5,991 ± 246 | 69 | 80 | 330 ± 28 | 255 | 531 + 70 | 1.5 | 27.0 | 0 |
| SDR, hybrid separation | 7,200 | fixed 100 km/h | 6,157 ± 227 | 86 | 100 | 308 ± 25 | 271 | 570 + 34 | 2.1 | 32.4 | 0 |
| SDR, hybrid separation | 7,200 | fixed 80 km/h | 6,039 ± 202 | 70 | 80 | 339 ± 22 | 259 | 537 + 69 | 1.2 | 26.5 | 0 |
| SDR, relative separation | 2,400 | fixed 120 km/h | 3,313 ± 95 | 112 | 120 | 138 ± 1 | 1 | 0 + 0 | 0.0 | 21.5 | 0 |
| SDR, relative separation | 2,400 | adaptive (slows down when queues build) | 3,337 ± 109 | 112 | 120 | 139 ± 1 | 1 | 0 + 0 | 0.0 | 21.3 | 0 |
| SDR, relative separation | 2,400 | fixed 100 km/h | 3,307 ± 101 | 98 | 100 | 157 ± 1 | 0 | 0 + 0 | 0.0 | 8.4 | 0 |
| SDR, relative separation | 2,400 | fixed 80 km/h | 3,305 ± 109 | 80 | 80 | 192 ± 1 | 0 | 0 + 0 | 0.0 | 4.2 | 0 |
| SDR, relative separation | 3,600 | fixed 120 km/h | 4,488 ± 77 | 110 | 120 | 144 ± 1 | 0 | 0 + 0 | 0.1 | 26.7 | 0 |
| SDR, relative separation | 3,600 | adaptive (slows down when queues build) | 4,513 ± 93 | 110 | 120 | 144 ± 1 | 0 | 0 + 0 | 0.1 | 26.7 | 0 |
| SDR, relative separation | 3,600 | fixed 100 km/h | 4,487 ± 85 | 97 | 100 | 162 ± 1 | 0 | 0 + 0 | 0.0 | 11.0 | 0 |
| SDR, relative separation | 3,600 | fixed 80 km/h | 4,493 ± 107 | 80 | 80 | 198 ± 1 | 0 | 0 + 0 | 0.0 | 5.8 | 0 |
| SDR, relative separation | 4,800 | fixed 120 km/h | 5,684 ± 109 | 107 | 120 | 150 ± 1 | 0 | 0 + 0 | 0.1 | 33.8 | 0 |
| SDR, relative separation | 4,800 | adaptive (slows down when queues build) | 5,690 ± 111 | 107 | 120 | 150 ± 1 | 0 | 0 + 0 | 0.0 | 34.5 | 0 |
| SDR, relative separation | 4,800 | fixed 100 km/h | 5,680 ± 102 | 96 | 100 | 166 ± 1 | 0 | 0 + 0 | 0.0 | 15.8 | 0 |
| SDR, relative separation | 4,800 | fixed 80 km/h | 5,679 ± 121 | 79 | 80 | 202 ± 1 | 0 | 0 + 0 | 0.0 | 9.3 | 0 |
| SDR, relative separation | 6,000 | fixed 120 km/h | 6,812 ± 122 | 102 | 120 | 160 ± 6 | 9 | 11 + 1 | 0.7 | 42.9 | 0 |
| SDR, relative separation | 6,000 | adaptive (slows down when queues build) | 6,798 ± 135 | 102 | 116 | 161 ± 7 | 5 | 1 + 1 | 0.8 | 42.6 | 0 |
| SDR, relative separation | 6,000 | fixed 100 km/h | 6,840 ± 98 | 93 | 100 | 174 ± 4 | 2 | 0 + 0 | 0.3 | 25.4 | 0 |
| SDR, relative separation | 6,000 | fixed 80 km/h | 6,755 ± 134 | 76 | 80 | 216 ± 8 | 14 | 5 + 6 | 0.8 | 19.6 | 0 |
| SDR, relative separation | 7,200 | fixed 120 km/h | 7,056 ± 301 | 98 | 120 | 224 ± 24 | 146 | 310 + 7 | 1.9 | 47.0 | 0 |
| SDR, relative separation | 7,200 | adaptive (slows down when queues build) | 7,069 ± 210 | 84 | 96 | 234 ± 22 | 117 | 236 + 30 | 1.2 | 34.5 | 0 |
| SDR, relative separation | 7,200 | fixed 100 km/h | 7,234 ± 169 | 87 | 100 | 230 ± 18 | 106 | 220 + 27 | 1.4 | 34.3 | 0 |
| SDR, relative separation | 7,200 | fixed 80 km/h | 6,964 ± 177 | 70 | 80 | 278 ± 20 | 131 | 254 + 52 | 0.8 | 27.1 | 0 |

## 14. Cheaper truck rules

*Full run of 2026-11-20 04:05: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

Capacity: main 7,200 + ramp 900 veh/h (saturated), SDR hybrid with one change to the rule that keeps a brick-wall gap behind every truck. Lost load: at 4,200 + 600 veh/h an object lands just behind a truck that has a vehicle within 150 m behind it. Only the road sensors count in these tests (they see every object, after the time stated; car sensors are switched off), so that the gap is tested against the confirmation time. Each lost-load cell is: runs with a collision / collisions / worst impact (km/h).

| Trucks | Truck rule | Served (veh/h) | Against today's road | Mean speed (km/h) | Hard brakes / 1000 veh-km | Lost load stops dead, confirmed in 0.5 s | Stops dead, confirmed in 1 s | Slides at 6 m/s², confirmed in 1 s | Special case |
|---|---|---|---|---|---|---|---|---|---|
| 10 % | Today (human drivers) | 5,364 ± 98 |  | 60 | 73.4 |  |  |  |  |
| 10 % | Brick-wall gap behind every truck (the rule as it is) | 6,002 ± 179 | +11.3 % (outside the noise) | 98 | 3.9 | 0 of 10 / 0 / 0 |  |  |  |
| 10 % | No truck rule (relative separation) | 7,084 ± 255 | +31.3 % (outside the noise) | 99 | 1.4 | 10 of 10 / 25 / 91 |  |  |  |
| 10 % | a. Not behind enclosed, monitored trucks: 25 % of trucks | 6,145 ± 257 | +13.9 % (outside the noise) | 98 | 2.4 | 0 of 10 / 0 / 0 |  |  |  |
| 10 % | a. Not behind enclosed, monitored trucks: 50 % | 6,504 ± 167 | +20.6 % (outside the noise) | 99 | 2.9 | 0 of 10 / 0 / 0 |  |  |  |
| 10 % | a. Not behind enclosed, monitored trucks: 75 % | 6,754 ± 260 | +25.2 % (outside the noise) | 98 | 2.4 | 0 of 10 / 0 / 0 |  |  |  |
| 10 % | b. Gap for a load that stops dead + 0.5 s to confirm it | 5,792 ± 176 | +7.4 % (outside the noise) | 99 | 4.6 | 0 of 10 / 0 / 0 |  |  |  |
| 10 % | b. Gap for a load that stops dead + 1 s to confirm it | 5,513 ± 207 | +2.8 % (outside the noise) | 98 | 3.3 | 0 of 10 / 0 / 0 |  |  |  |
| 10 % | b. Gap for a load that slides (6 m/s²) + 0.5 s to confirm it | 6,613 ± 197 | +22.6 % (outside the noise) | 98 | 1.7 | 10 of 10 / 21 / 77 |  |  |  |
| 10 % | b. Gap for a load that slides (6 m/s²) + 1 s to confirm it | 6,295 ± 207 | +16.7 % (outside the noise) | 98 | 2.8 | 10 of 10 / 17 / 58 |  |  |  |
| 10 % | c. Trucks follow trucks closely | 5,928 ± 158 | +9.9 % (outside the noise) | 100 | 3.4 | 2 of 10 / 2 / 82 |  |  |  |
| 10 % | d. Truck lane | 4,644 ± 218 | −13.9 % (outside the noise) | 95 | 1.7 | 0 of 10 / 0 / 0 |  |  |  |
| 10 % | c + d. Truck lane, trucks follow trucks closely | 4,713 ± 151 | −12.6 % (outside the noise) | 90 | 2.2 | 2 of 10 / 3 / 82 |  |  |  |
| 20 % | Today (human drivers) | 4,882 ± 98 |  | 59 | 54.0 |  |  |  |  |
| 20 % | Brick-wall gap behind every truck (the rule as it is) | 4,438 ± 64 | −9.3 % (outside the noise) | 94 | 4.6 | 0 of 10 / 0 / 0 | 8 of 10 / 8 / 47 | 0 of 10 / 0 / 0 |  |
| 20 % | No truck rule (relative separation) | 5,684 ± 138 | +16.1 % (outside the noise) | 90 | 2.1 | 9 of 10 / 19 / 90 | 9 of 10 / 21 / 93 | 6 of 10 / 6 / 10 |  |
| 20 % | a. Not behind enclosed, monitored trucks: 25 % of trucks | 4,672 ± 175 | −4.6 % (outside the noise) | 93 | 2.6 | 0 of 10 / 0 / 0 | 10 of 10 / 10 / 47 | 0 of 10 / 0 / 0 | enclosed truck loses a load anyway: 10 of 10 / 19 / 90 |
| 20 % | a. Not behind enclosed, monitored trucks: 50 % | 4,986 ± 133 | +2.1 % (outside the noise) | 93 | 3.3 | 0 of 10 / 0 / 0 | 8 of 10 / 8 / 47 | 0 of 10 / 0 / 0 | enclosed truck loses a load anyway: 10 of 10 / 23 / 90 |
| 20 % | a. Not behind enclosed, monitored trucks: 75 % | 5,302 ± 103 | +8.3 % (outside the noise) | 91 | 1.9 | 0 of 10 / 0 / 0 | 9 of 10 / 9 / 47 | 0 of 10 / 0 / 0 | enclosed truck loses a load anyway: 9 of 10 / 21 / 90 |
| 20 % | b. Gap for a load that stops dead + 0.5 s to confirm it | 4,190 ± 83 | −14.4 % (outside the noise) | 94 | 2.4 | 0 of 10 / 0 / 0 | 1 of 10 / 1 / 2 | 0 of 10 / 0 / 0 |  |
| 20 % | b. Gap for a load that stops dead + 1 s to confirm it | 3,921 ± 93 | −19.9 % (outside the noise) | 94 | 2.7 | 0 of 10 / 0 / 0 | 0 of 10 / 0 / 0 | 0 of 10 / 0 / 0 |  |
| 20 % | b. Gap for a load that slides (6 m/s²) + 0.5 s to confirm it | 5,105 ± 116 | +4.3 % (outside the noise) | 90 | 1.8 | 9 of 10 / 16 / 77 | 9 of 10 / 15 / 91 | 0 of 10 / 0 / 0 |  |
| 20 % | b. Gap for a load that slides (6 m/s²) + 1 s to confirm it | 4,784 ± 94 | −2.3 % (outside the noise) | 90 | 2.2 | 9 of 10 / 12 / 58 | 9 of 10 / 15 / 77 | 0 of 10 / 0 / 0 |  |
| 20 % | c. Trucks follow trucks closely | 4,532 ± 90 | −7.4 % (outside the noise) | 96 | 2.0 | 2 of 10 / 2 / 82 | 9 of 10 / 9 / 90 | 1 of 10 / 1 / 25 | follower is a truck: 9 of 10 / 10 / 82 |
| 20 % | d. Truck lane | 3,908 ± 87 | −20.2 % (outside the noise) | 84 | 0.4 | 0 of 10 / 0 / 0 | 9 of 10 / 9 / 47 | 0 of 10 / 0 / 0 |  |
| 20 % | c + d. Truck lane, trucks follow trucks closely | 4,218 ± 219 | −13.8 % (outside the noise) | 84 | 0.5 | 1 of 10 / 1 / 82 | 9 of 10 / 9 / 90 | 1 of 10 / 1 / 25 | follower is a truck: 8 of 10 / 10 / 82 |
| 30 % | Today (human drivers) | 4,587 ± 99 |  | 61 | 44.6 |  |  |  |  |
| 30 % | Brick-wall gap behind every truck (the rule as it is) | 3,630 ± 48 | −20.5 % (outside the noise) | 90 | 1.5 | 0 of 10 / 0 / 0 |  |  |  |
| 30 % | No truck rule (relative separation) | 4,741 ± 235 | +3.4 % (outside the noise) | 81 | 3.3 | 10 of 10 / 22 / 90 |  |  |  |
| 30 % | a. Not behind enclosed, monitored trucks: 25 % of trucks | 3,823 ± 85 | −16.2 % (outside the noise) | 88 | 1.6 | 0 of 10 / 0 / 0 |  |  |  |
| 30 % | a. Not behind enclosed, monitored trucks: 50 % | 4,126 ± 93 | −9.6 % (outside the noise) | 86 | 1.5 | 0 of 10 / 0 / 0 |  |  |  |
| 30 % | a. Not behind enclosed, monitored trucks: 75 % | 4,280 ± 94 | −6.2 % (outside the noise) | 82 | 2.7 | 0 of 10 / 0 / 0 |  |  |  |
| 30 % | b. Gap for a load that stops dead + 0.5 s to confirm it | 3,286 ± 61 | −28.0 % (outside the noise) | 89 | 2.0 | 0 of 10 / 0 / 0 |  |  |  |
| 30 % | b. Gap for a load that stops dead + 1 s to confirm it | 3,059 ± 59 | −33.0 % (outside the noise) | 88 | 1.7 | 0 of 10 / 0 / 0 |  |  |  |
| 30 % | b. Gap for a load that slides (6 m/s²) + 0.5 s to confirm it | 4,286 ± 173 | −6.1 % (outside the noise) | 82 | 1.9 | 9 of 10 / 13 / 77 |  |  |  |
| 30 % | b. Gap for a load that slides (6 m/s²) + 1 s to confirm it | 3,963 ± 62 | −13.2 % (outside the noise) | 83 | 1.3 | 10 of 10 / 13 / 58 |  |  |  |
| 30 % | c. Trucks follow trucks closely | 3,774 ± 43 | −17.3 % (outside the noise) | 92 | 1.6 | 2 of 10 / 5 / 82 |  |  |  |
| 30 % | d. Truck lane | 3,058 ± 99 | −33.0 % (outside the noise) | 71 | 1.1 | 0 of 10 / 0 / 0 |  |  |  |
| 30 % | c + d. Truck lane, trucks follow trucks closely | 3,429 ± 34 | −24.9 % (outside the noise) | 73 | 1.4 | 3 of 10 / 5 / 82 |  |  |  |

The extra lost-load tests (1 s, sliding load, special cases) were run at 20 % trucks only. In the "a" rows the load falls off a truck that still has the long gap behind it; the special case shows what happens if an exempted truck loses something after all.

## 15. Sensitivity of the SDR assumptions

*Full run of 2026-11-20 04:05: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

SDR hybrid with one assumption changed at a time; everything else as in the other sections. Capacity: main 7,200 + ramp 900 veh/h (saturated). Brick-wall stop and lost load: 4,200 + 600 veh/h; in the lost-load test only the road sensors count (they confirm the object after 0.5 s; car sensors off). Each incident cell is: runs with a collision / collisions / worst impact (km/h). "Against as assumed" is the change in capacity from the first SDR row, per seed; a change of more than 5 % is in bold. Car braking also changes what the leader can do: relative separation assumes a leader brakes at most 10 % harder than its certified braking.

| Assumption | Value | Served (veh/h) | Against as assumed | Against today's road | Mean speed (km/h) | Supervision brakes per run | Smallest spare (m) | Brick-wall stop | Lost load |
|---|---|---|---|---|---|---|---|---|---|
| Today (human drivers) | | 5,364 ± 98 | | | 60 | | | | |
|  | As assumed | 5,957 ± 184 |  | +11.1 % (outside the noise) | 99 | 0.0 | 0.35 | 19 of 30 / 25 / 70 | 0 of 30 / 0 / 0 |
| Car braking (8 m/s²) | 6 m/s² | 5,698 ± 224 | −4.3 % (outside the noise) | +6.2 % (outside the noise) | 99 | 0.0 | 0.30 | 20 of 30 / 41 / 81 | 0 of 30 / 0 / 0 |
| Car braking (8 m/s²) | 7 m/s² | 5,880 ± 233 | −1.3 % (outside the noise) | +9.6 % (outside the noise) | 98 | 0.0 | 0.36 | 17 of 30 / 30 / 76 | 0 of 30 / 0 / 0 |
| Car braking (8 m/s²) | 9 m/s² | 6,142 ± 178 | +3.1 % (outside the noise) | +14.5 % (outside the noise) | 98 | 0.0 | 0.67 | 17 of 30 / 20 / 65 | 2 of 30 / 2 / 4 |
| Car braking (8 m/s²) | 10 m/s² | 6,330 ± 154 | **+5.5 % (outside the noise)** | +17.3 % (outside the noise) | 98 | 0.0 | 1.00 | 15 of 30 / 19 / 66 | 17 of 30 / 17 / 6 |
| Actuator delay (0.2 s) | 0.1 s | 6,431 ± 178 | **+7.1 % (outside the noise)** | +19.2 % (outside the noise) | 98 | 0.0 | 0.33 | 14 of 30 / 18 / 69 | 0 of 30 / 0 / 0 |
| Actuator delay (0.2 s) | 0.3 s | 5,605 ± 188 | **−5.9 % (outside the noise)** | +4.5 % (outside the noise) | 99 | 0.0 | 0.37 | 19 of 30 / 25 / 70 | 0 of 30 / 0 / 0 |
| Actuator delay (0.2 s) | 0.5 s | 4,862 ± 179 | **−19.0 % (outside the noise)** | −9.9 % (outside the noise) | 100 | 0.0 | 1.46 | 23 of 30 / 30 / 71 | 0 of 30 / 0 / 0 |
| Control cycle (0.1 s) | 0.05 s | 6,160 ± 241 | +2.6 % (outside the noise) | +14.2 % (outside the noise) | 98 | 0.0 | 1.83 | 17 of 30 / 25 / 72 | 16 of 30 / 16 / 12 |
| Control cycle (0.1 s) | 0.2 s | 5,567 ± 238 | **−6.5 % (outside the noise)** | +3.8 % (outside the noise) | 99 | 0.0 | 1.03 | 14 of 30 / 15 / 65 | 1 of 30 / 1 / 6 |
| Control cycle (0.1 s) | 0.5 s | 4,766 ± 139 | **−20.6 % (outside the noise)** | −11.7 % (outside the noise) | 99 | 0.0 | 1.68 | 11 of 30 / 11 / 47 | 0 of 30 / 0 / 0 |
| Radio latency (50 ms) | 20 ms | 6,094 ± 240 | +2.3 % (outside the noise) | +13.6 % (outside the noise) | 98 | 0.0 | 0.34 | 14 of 30 / 18 / 71 | 17 of 30 / 17 / 8 |
| Radio latency (50 ms) | 100 ms | 5,781 ± 141 | −3.7 % (outside the noise) | +7.1 % (outside the noise) | 99 | 0.0 | 1.11 | 15 of 30 / 17 / 68 | 0 of 30 / 0 / 0 |
| Radio latency (50 ms) | 200 ms | 5,413 ± 196 | **−9.1 % (outside the noise)** | +0.9 % (within the noise) | 99 | 0.0 | 0.59 | 17 of 30 / 18 / 62 | 0 of 30 / 0 / 0 |
| Safety margin (2.0 + 0.5 m) | 1.0 + 0.5 m | 6,229 ± 233 | +4.6 % (outside the noise) | +16.1 % (outside the noise) | 98 | 0.0 | 0.39 | 15 of 30 / 20 / 72 | 20 of 30 / 20 / 11 |
| Safety margin (2.0 + 0.5 m) | 3.0 + 0.5 m | 5,806 ± 170 | −3.3 % (outside the noise) | +7.6 % (outside the noise) | 99 | 0.0 | 1.12 | 15 of 30 / 21 / 69 | 0 of 30 / 0 / 0 |
| Safety margin (2.0 + 0.5 m) | 5.0 + 0.5 m | 5,489 ± 192 | **−7.8 % (outside the noise)** | +2.3 % (within the noise) | 99 | 0.0 | 0.31 | 17 of 30 / 18 / 65 | 0 of 30 / 0 / 0 |
| Guardian range (120 m) | 60 m | 5,871 ± 226 | −1.4 % (outside the noise) | +9.5 % (outside the noise) | 89 | 0.0 | 0.51 | 19 of 30 / 19 / 53 | 0 of 30 / 0 / 0 |
| Guardian range (120 m) | 80 m | 5,936 ± 175 | −0.3 % (within the noise) | +10.7 % (outside the noise) | 97 | 0.0 | 0.47 | 20 of 30 / 25 / 67 | 0 of 30 / 0 / 0 |
| Guardian range (120 m) | 160 m | 6,002 ± 179 | +0.0 % (identical) | +11.3 % (outside the noise) | 98 | 0.0 | 1.39 | 19 of 30 / 25 / 70 | 0 of 30 / 0 / 0 |

## 16. A policy for ice

*Full run of 2026-11-20 04:05: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

Friction 0.3 (ice) on both roads. Capacity: main 7,200 + ramp 900 veh/h (saturated). Brick-wall stop: 3,000 + 600 veh/h. "Black ice": the tyres have 20 % less grip than the road measured (0.24 instead of 0.3), and neither the road nor the drivers know; it is tested in normal traffic (5 runs of 20 minutes at 3,000 + 600 veh/h) and with a brick-wall stop. "Plans with 80 % of the grip": the road and the vehicles assume only that share of the measured grip for their own braking (not for the leader's), which widens gaps and lowers the speed. Each incident cell is: runs with a collision / collisions / worst impact (km/h).

| Policy | Served (veh/h) | Against today's road | Mean speed (km/h) | Brick-wall stop | Black ice: brick-wall stop | Black ice, normal traffic: collisions (runs) | Black ice: smallest spare (m) |
|---|---|---|---|---|---|---|---|
| Today (human drivers) | 4,226 ± 80 |  | 51 | 28 of 30 / 101 / 68 | 30 of 30 / 118 / 74 | 1 (5) |  |
| SDR absolute | 1,326 ± 46 | −68.6 % (outside the noise) | 78 | 0 of 30 / 0 / 0 | 0 of 30 / 0 / 0 | 0 (5) | 3.02 |
| SDR relative | 4,842 ± 40 | +14.6 % (outside the noise) | 84 | 22 of 30 / 46 / 69 | 23 of 30 / 62 / 73 | 0 (5) | 4.37 |
| SDR hybrid (rules as they are) | 3,650 ± 56 | −13.6 % (outside the noise) | 82 | 17 of 30 / 42 / 69 | 17 of 30 / 39 / 73 | 0 (5) | 3.12 |
| Hybrid, speed cap 70 km/h | 4,725 ± 121 | +11.8 % (outside the noise) | 62 | 19 of 30 / 39 / 54 | 23 of 30 / 60 / 58 | 0 (5) | 3.17 |
| Hybrid, speed cap 60 km/h | 4,836 ± 182 | +14.4 % (outside the noise) | 54 | 22 of 30 / 31 / 45 | 24 of 30 / 48 / 48 | 0 (5) | 2.98 |
| Hybrid, plans with 80 % of the grip | 2,175 ± 18 | −48.5 % (outside the noise) | 75 | 12 of 30 / 16 / 53 | 10 of 30 / 13 / 53 | 0 (5) | 3.61 |
| Hybrid, plans with 60 % of the grip | 1,346 ± 36 | −68.2 % (outside the noise) | 64 | 18 of 30 / 22 / 38 | 14 of 30 / 14 / 37 | 0 (5) | 3.26 |
| Relative, speed cap 60 km/h | 6,044 ± 93 | +43.0 % (outside the noise) | 54 | 21 of 30 / 29 / 45 | 22 of 30 / 38 / 48 | 0 (5) | 4.28 |
| Relative, plans with 60 % of the grip | 1,470 ± 34 | −65.2 % (outside the noise) | 65 | 18 of 30 / 24 / 37 | 17 of 30 / 25 / 37 | 0 (5) | 3.47 |

Smallest spare: the least distance, over all vehicles and runs, between where a vehicle could still stop and the end of its authority; negative means an authority was overrun because the brakes gave less than the road counted on.

## 17. The pile-up on today's road

*Full run of 2026-11-20 04:05: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

A vehicle stops dead within about a second at x = 3 km, observed for 5 minutes (as in section 2). Human drivers react after 0.55 s ± 0.1 and, for an unexpected event, need a surprise delay on top (the mean is varied here; ± 0.2 s between drivers). Vehicles involved = the stopped vehicle and every vehicle in a collision after it, counted per event. Collisions in brackets: the same traffic without the incident.

| Demand | System | Surprise delay, mean (s) | Runs | Collisions (without incident) | Vehicles involved per event: mean / most | Events with 1 / 2 / 3–4 / 5+ vehicles | Impact speed, median (km/h) | Impacts above 30 km/h | Worst impact (km/h) |
|---|---|---|---|---|---|---|---|---|---|
| 3,000 + 600 veh/h | Today (human drivers) | 0.3 | 30 | 41 (0) | 1.9 / 8 | 13 / 6 / 9 / 2 | 54 | 36 | 119 |
| 3,000 + 600 veh/h | Today (human drivers) | 0.5 | 30 | 47 (0) | 2.2 / 9 | 12 / 5 / 9 / 4 | 60 | 44 | 124 |
| 3,000 + 600 veh/h | Today (human drivers) | 0.7 | 30 | 52 (0) | 2.4 / 9 | 12 / 5 / 8 / 5 | 71 | 47 | 126 |
| 3,000 + 600 veh/h | Today (human drivers) | 1.0 | 30 | 71 (0) | 3.0 / 10 | 11 / 4 / 6 / 9 | 78 | 66 | 126 |
| 3,000 + 600 veh/h | SDR, hybrid separation | – | 30 | 15 (0) | 0.9 / 3 | 19 / 7 / 4 / 0 | 47 | 13 | 70 |
| 4,200 + 600 veh/h | Today (human drivers) | 0.3 | 10 | 24 (0) | 3.2 / 7 | 2 / 1 / 5 / 2 | 54 | 18 | 89 |
| 4,200 + 600 veh/h | Today (human drivers) | 0.5 | 10 | 28 (0) | 3.6 / 7 | 2 / 0 / 5 / 3 | 53 | 24 | 95 |
| 4,200 + 600 veh/h | Today (human drivers) | 0.7 | 10 | 33 (0) | 4.2 / 8 | 1 / 1 / 5 / 3 | 61 | 28 | 102 |
| 4,200 + 600 veh/h | Today (human drivers) | 1.0 | 10 | 55 (0) | 6.5 / 18 | 0 / 2 / 1 / 7 | 80 | 50 | 111 |
| 4,200 + 600 veh/h | SDR, hybrid separation | – | 10 | 5 (0) | 1.0 / 2 | 5 / 5 / 0 / 0 | 41 | 5 | 69 |

## 18. Break-even with a faster today's road

*Full run of 2026-11-20 04:05: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

Today's road with shorter headways: the mean preferred time headway of human drivers is varied (1.4 s in every other section; ± 0.25 s between drivers). Plain road: 9,000 veh/h demand, no ramp, no exit. With on-ramp and exit: main 8,400 + ramp 900 veh/h (more than any row carries). The SDR rows do not depend on the headway of human drivers; the last columns compare them with today's road at each headway, per seed.

| Road | System | Headway, mean (s) | Served (veh/h) | Mean speed (km/h) | Hard brakes / 1000 veh-km | Collisions (all runs) | Hybrid against it | Relative against it |
|---|---|---|---|---|---|---|---|---|
| Plain road (no ramp, no exit) | Today (human drivers) | 1.4 | 5,695 ± 56 | 101 | 25 | 0 |  |  |
| With on-ramp and exit | Today (human drivers) | 1.4 | 5,275 ± 60 | 58 | 77 | 0 | +13.5 % (outside the noise) | +35.9 % (outside the noise) |
| Plain road (no ramp, no exit) | Today (human drivers) | 1.2 | 6,423 ± 44 | 100 | 41 | 0 |  |  |
| With on-ramp and exit | Today (human drivers) | 1.2 | 5,506 ± 267 | 56 | 157 | 1 | +8.8 % (outside the noise) | +30.2 % (outside the noise) |
| Plain road (no ramp, no exit) | Today (human drivers) | 1.1 | 6,922 ± 60 | 99 | 77 | 0 |  |  |
| With on-ramp and exit | Today (human drivers) | 1.1 | 5,775 ± 215 | 56 | 326 | 14 | +3.4 % (outside the noise) | +27.7 % (outside the noise) |
| Plain road (no ramp, no exit) | Today (human drivers) | 1.0 | 7,490 ± 47 | 99 | 136 | 0 |  |  |
| With on-ramp and exit | Today (human drivers) | 1.0 | 5,879 ± 293 | 57 | 696 | 71 | +1.5 % (within the noise) | +23.9 % (outside the noise) |
| Plain road (no ramp, no exit) | Today (human drivers) | 0.9 | 8,111 ± 86 | 97 | 271 | 0 |  |  |
| With on-ramp and exit | Today (human drivers) | 0.9 | 5,367 ± 476 | 56 | 859 | 109 | +11.6 % (outside the noise) | +33.5 % (outside the noise) |
| With on-ramp and exit | SDR, hybrid separation | – | 5,970 ± 197 | 98 | 3 | 0 |  |  |
| With on-ramp and exit | SDR, relative separation | – | 7,166 ± 270 | 99 | 1 | 0 |  |  |

## 19. Road layouts

*Full run of 2026-11-20 04:05: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

The standard corridor and five variations of it, each with one on-ramp and one exit. Demand scales with the number of lanes: capacity at 2,400 veh/h per lane on the main entry + 900 on the ramp (saturated); "busy" at 1,600 per lane + 900; brick-wall stop at 1,400 per lane + 600. "Sensors down at the merge": road sensors off in the segment of the merge (2–3 km), so the hybrid keeps absolute gaps there. Each incident cell is: runs with a collision / collisions / worst impact (km/h).

| Layout | Capacity: today's road (veh/h) | Capacity: SDR hybrid (veh/h) | Hybrid against today | Sensors down at the merge (veh/h) | Against sensors up | Busy: trip delay today / hybrid (s) | Brick-wall stop: today | Brick-wall stop: hybrid |
|---|---|---|---|---|---|---|---|---|
| 3 lanes, 300 m acceleration lane, 5 km (standard) | 5,395 ± 121 | 6,002 ± 179 | +11.3 % (outside the noise) | 3,890 ± 130 | −35.2 % (outside the noise) | 72 / 20 | 24 of 30 / 81 / 103 | 19 of 30 / 25 / 70 |
| 2 lanes | 3,511 ± 31 | 4,414 ± 96 | +25.7 % (outside the noise) | 2,931 ± 14 | −33.6 % (outside the noise) | 107 / 28 | 21 of 30 / 64 / 103 | 14 of 30 / 17 / 69 |
| 4 lanes | 7,122 ± 163 | 7,321 ± 96 | +2.8 % (outside the noise) | 4,667 ± 71 | −36.2 % (outside the noise) | 58 / 31 | 25 of 30 / 115 / 114 | 22 of 30 / 27 / 69 |
| 3 lanes, short acceleration lane (150 m) | 5,081 ± 99 | 5,931 ± 193 | +16.7 % (outside the noise) | 3,899 ± 104 | −34.3 % (outside the noise) | 108 / 23 | 21 of 30 / 76 / 108 | 17 of 30 / 22 / 69 |
| 3 lanes, long acceleration lane (600 m) | 5,539 ± 86 | 6,098 ± 203 | +10.1 % (outside the noise) | 3,878 ± 98 | −36.4 % (outside the noise) | 44 / 18 | 9 of 10 / 35 / 80 | 7 of 10 / 9 / 69 |
| 3 lanes, 10 km corridor | 5,172 ± 109 | 5,865 ± 116 | +13.4 % (outside the noise) | 3,810 ± 120 | −35.0 % (outside the noise) | 81 / 29 | 22 of 30 / 100 / 106 | 19 of 30 / 25 / 70 |

## 20. Sensor false alarms and shared misses

*Full run of 2026-11-20 04:05: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

SDR hybrid unless stated. A road false alarm is an object the road treats as confirmed where nothing is, at a random place in a running lane where no vehicle is. The road closes the lane 1 km upstream and gives authorities short of it, as for real debris, until a re-check clears it after the time stated. Nobody can hit it. A car's false target is something its own sensor sees for 1 s, at a random distance in the free road ahead, within its 120 m range: it brakes at full force while the target is within its stopping distance, and in SDR it reports the target to the road (unless stated otherwise), which treats the report like a real detection. On today's road the same false target makes driver assistance brake at full force; the driver does not report anything. Throughput rows: 15 minutes measured after a 5-minute warm-up.

### Road sensors: what false alarms cost

| Demand (veh/h) | False alarms per km per hour | Cleared after (s) | False alarms per run | Served (veh/h) | Change in served | Trip delay (s) | Change in delay | Cost per false alarm | Hard brakes / 1000 veh-km | Supervision brakes per run | Collisions (all runs) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 7,200 + 900 (saturated) | 0 | – | 0 | 5,957 ± 184 |  | 161 ± 21 |  |  | 3.7 | 0.0 | 0 |
| 7,200 + 900 (saturated) | 1.00 | 10 | 1.5 | 5,930 ± 194 | −26.1 (−0.4 %), within the noise | 164 ± 22 | +3.31 (+2.1 %), within the noise | 5.2 vehicles not served | 5.1 | 2.7 | 0 |
| 7,200 + 900 (saturated) | 3.00 | 10 | 4.2 | 5,916 ± 199 | −40.5 (−0.7 %), within the noise | 167 ± 18 | +5.86 (+3.6 %) | 2.7 vehicles not served | 6.4 | 5.9 | 0 |
| 7,200 + 900 (saturated) | 10.0 | 10 | 10.8 | 5,794 ± 240 | −209 (−3.5 %) | 185 ± 20 | +18.2 (+11.0 %) | 4.2 vehicles not served | 10.8 | 13.8 | 0 |
| 7,200 + 900 (saturated) | 1.00 | 60 | 1.5 | 5,874 ± 199 | −82.9 (−1.4 %) | 168 ± 18 | +7.45 (+4.6 %) | 16.6 vehicles not served | 5.0 | 2.8 | 0 |
| 7,200 + 900 (saturated) | 3.00 | 60 | 3.5 | 5,637 ± 224 | −319 (−5.4 %) | 185 ± 19 | +24.4 (+15.1 %) | 21.3 vehicles not served | 6.9 | 5.5 | 0 |
| 7,200 + 900 (saturated) | 10.0 | 60 | 12.0 | 4,922 ± 302 | −1,081 (−18.0 %) | 220 ± 33 | +53.4 (+32.0 %) | 21.6 vehicles not served | 18.7 | 13.4 | 0 |
| 4,200 + 600 | 0 | – | 0 | 4,763 ± 117 |  | 12 ± 1 |  |  | 0.3 | 0.0 | 0 |
| 4,200 + 600 | 1.00 | 10 | 1.4 | 4,754 ± 115 | −8.53 (−0.2 %), within the noise | 13 ± 1 | +0.24 (+1.9 %) | 0.06 vehicle-hours | 1.2 | 1.4 | 0 |
| 4,200 + 600 | 3.00 | 10 | 4.3 | 4,759 ± 119 | −4.27 (−0.1 %), within the noise | 13 ± 1 | +1.00 (+8.1 %) | 0.09 vehicle-hours | 3.4 | 6.5 | 0 |
| 4,200 + 600 | 10.0 | 10 | 13.1 | 4,749 ± 117 | −13.6 (−0.3 %), within the noise | 16 ± 2 | +3.43 (+27.8 %) | 0.09 vehicle-hours | 9.7 | 16.1 | 0 |
| 4,200 + 600 | 1.00 | 60 | 1.4 | 4,745 ± 108 | −17.6 (−0.4 %), within the noise | 13 ± 2 | +0.95 (+7.7 %) | 0.25 vehicle-hours | 1.4 | 1.4 | 0 |
| 4,200 + 600 | 3.00 | 60 | 4.1 | 4,745 ± 122 | −18.1 (−0.4 %), within the noise | 17 ± 3 | +5.14 (+41.6 %) | 0.45 vehicle-hours | 4.7 | 5.2 | 0 |
| 4,200 + 600 | 10.0 | 60 | 11.7 | 4,643 ± 223 | −120 (−2.5 %) | 45 ± 20 | +33.0 (+267.6 %) | 0.87 vehicle-hours | 14.9 | 14.0 | 0 |

- Cleared after 10 s: at saturation each false alarm costs about 4.1 vehicles not served (fit through zero over the rates tested). False alarms cost 1 % of capacity at about **2.93 per km per hour**, and 2 % at 5.86.
- Cleared after 60 s: at saturation each false alarm costs about 21.5 vehicles not served (fit through zero over the rates tested). False alarms cost 1 % of capacity at about **0.55 per km per hour**, and 2 % at 1.11.

One false alarm at a random place, against the same traffic without it, at 4,200 + 600 veh/h, observed for 10 minutes. Brackets: the same traffic without the false alarm.

| Cleared after (s) | Runs | Extra delay (vehicle-hours) | Hard brakes per run | Supervision brakes per run | Collisions |
|---|---|---|---|---|---|
| 10 | 10 | 0.1 ± 0.1 | 5.0 (0.8) | 1.4 | 0 (0) |
| 60 | 10 | 0.9 ± 1.2 | 7.3 (0.8) | 1.4 | 0 (0) |

### Cars' own sensors: what false targets cost

| Demand (veh/h) | Road | False targets per vehicle-hour | What happens | False targets per run (per km per hour) | Vehicles braking for one, per run | Served (veh/h) | Change in served | Trip delay (s) | Change in delay | Hard brakes / 1000 veh-km | Collisions (all runs) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 7,200 + 900 (saturated) | Today | 0 | no false targets | 0 | 0 | 5,364 ± 98 |  | 204 ± 14 |  | 73.4 | 0 |
| 7,200 + 900 (saturated) | SDR hybrid | 0 | no false targets | 0 | 0 | 5,957 ± 184 |  | 161 ± 21 |  | 3.7 | 0 |
| 7,200 + 900 (saturated) | Today | 0.10 | driver assistance brakes | 11.2 (9.0) | 10.5 | 5,325 ± 131 | −38.9 (−0.7 %), within the noise | 205 ± 17 | +0.55 (+0.3 %), within the noise | 77.2 | 0 |
| 7,200 + 900 (saturated) | SDR hybrid | 0.10 | brakes; not reported | 7.2 (5.8) | 6.7 | 5,948 ± 190 | −8.53 (−0.1 %), within the noise | 163 ± 22 | +1.61 (+1.0 %) | 7.4 | 0 |
| 7,200 + 900 (saturated) | SDR hybrid | 0.10 | brakes; reported, cleared after 10 s | 6.9 (5.5) | 6.4 | 5,788 ± 224 | −169 (−2.8 %) | 176 ± 24 | +15.0 (+9.3 %) | 9.2 | 0 |
| 7,200 + 900 (saturated) | SDR hybrid | 0.10 | brakes; reported, cleared after 60 s | 5.0 (4.0) | 3.8 | 5,269 ± 444 | −734 (−12.2 %) | 217 ± 31 | +50.3 (+30.2 %) | 10.6 | 0 |
| 7,200 + 900 (saturated) | Today | 1.00 | driver assistance brakes | 107.2 (85.8) | 99.9 | 5,316 ± 109 | −48.0 (−0.9 %), within the noise | 207 ± 13 | +2.37 (+1.2 %), within the noise | 101.4 | 0 |
| 7,200 + 900 (saturated) | SDR hybrid | 1.00 | brakes; not reported | 70.1 (56.1) | 67.1 | 5,959 ± 216 | +2.13 (+0.0 %), within the noise | 163 ± 26 | +1.69 (+1.1 %), within the noise | 39.9 | 0 |
| 7,200 + 900 (saturated) | SDR hybrid | 1.00 | brakes; reported, cleared after 10 s | 70.2 (56.2) | 64.6 | 4,969 ± 158 | −1,034 (−17.2 %) | 242 ± 15 | +75.7 (+45.5 %) | 70.5 | 0 |
| 7,200 + 900 (saturated) | SDR hybrid | 1.00 | brakes; reported, cleared after 60 s | 54.0 (43.2) | 39.0 | 3,161 ± 391 | −2,842 (−47.3 %) | 369 ± 36 | +202 (+121.4 %) | 91.6 | 0 |
| 4,200 + 600 | Today | 0 | no false targets | 0 | 0 | 4,706 ± 107 |  | 27 ± 11 |  | 41.0 | 1 |
| 4,200 + 600 | SDR hybrid | 0 | no false targets | 0 | 0 | 4,763 ± 117 |  | 12 ± 1 |  | 0.3 | 0 |
| 4,200 + 600 | Today | 0.10 | driver assistance brakes | 5.3 (4.3) | 5.1 | 4,696 ± 111 | −9.87 (−0.2 %), within the noise | 26 ± 8 | −0.41 (−1.6 %), within the noise | 37.9 | 1 |
| 4,200 + 600 | SDR hybrid | 0.10 | brakes; not reported | 4.7 (3.8) | 4.5 | 4,763 ± 117 | +0.27 (+0.0 %), within the noise | 12 ± 1 | +0.02 (+0.2 %), within the noise | 2.8 | 0 |
| 4,200 + 600 | SDR hybrid | 0.10 | brakes; reported, cleared after 10 s | 4.9 (3.9) | 4.3 | 4,769 ± 125 | +5.60 (+0.1 %), within the noise | 14 ± 2 | +1.37 (+11.1 %) | 5.2 | 0 |
| 4,200 + 600 | SDR hybrid | 0.10 | brakes; reported, cleared after 60 s | 5.2 (4.2) | 4.5 | 4,773 ± 193 | +9.60 (+0.2 %), within the noise | 25 ± 11 | +13.0 (+105.0 %) | 8.8 | 0 |
| 4,200 + 600 | Today | 1.00 | driver assistance brakes | 52.3 (41.8) | 50.1 | 4,733 ± 106 | +26.4 (+0.6 %), within the noise | 23 ± 4 | −3.40 (−12.8 %), within the noise | 52.4 | 0 |
| 4,200 + 600 | SDR hybrid | 1.00 | brakes; not reported | 48.9 (39.1) | 47.1 | 4,764 ± 116 | +0.80 (+0.0 %), within the noise | 12 ± 1 | −0.01 (−0.1 %), within the noise | 23.2 | 0 |
| 4,200 + 600 | SDR hybrid | 1.00 | brakes; reported, cleared after 10 s | 58.5 (46.8) | 53.3 | 4,667 ± 163 | −95.7 (−2.0 %) | 43 ± 13 | +31.1 (+251.6 %) | 58.4 | 0 |
| 4,200 + 600 | SDR hybrid | 1.00 | brakes; reported, cleared after 60 s | 50.6 (40.5) | 37.2 | 2,929 ± 725 | −1,874 (−39.0 %) | 211 ± 26 | +199 (+1613.9 %) | 91.4 | 0 |

### What detection buys, and what shared misses do

An object that stops a vehicle dead, at 4,200 + 600 veh/h, observed for 4 minutes (as in section 4). "Road confirms in t" means the road sensors see every object, after t. "Shared misses" means 10 % of objects are hard to see and no car sees those, while every car sees the others: on average each car still sees 90 % of objects, as in the "independently" row, but the misses fall on the same objects. In the last row the road also sees only half of the hard-to-see objects (95 % on average).

| Object | Detection | Runs with a collision | Collisions | Vehicles that hit the object | Worst impact (km/h) |
|---|---|---|---|---|---|
| object 150 m ahead | Road confirms in 0.5 s; car sensors off | 0 of 30 | 0 | 0 | 0 |
| object 150 m ahead | Road confirms in 1 s; car sensors off | 0 of 30 | 0 | 0 | 0 |
| object 150 m ahead | Road confirms in 2 s; car sensors off | 1 of 30 | 2 | 1 | 72 |
| object 150 m ahead | Road confirms in 0.5 s; every car sees it (V2V) | 0 of 10 | 0 | 0 | 0 |
| object 150 m ahead | Road confirms in 1 s; every car sees it (V2V) | 0 of 30 | 0 | 0 | 0 |
| object 150 m ahead | Road confirms in 2 s; every car sees it (V2V) | 0 of 10 | 0 | 0 | 0 |
| object 150 m ahead | Road misses; no car sees it | 10 of 10 | 19 | 11 | 120 |
| object 150 m ahead | Road misses; every car sees it (V2V) | 0 of 10 | 0 | 0 | 0 |
| object 150 m ahead | Road misses; each car 90 %, independently (V2V) | 5 of 30 | 12 | 6 | 120 |
| object 150 m ahead | Road misses; cars 90 % on average, shared misses (V2V) | 1 of 30 | 1 | 1 | 90 |
| object 150 m ahead | Road misses; each car 90 %, independently, not shared | 27 of 30 | 46 | 28 | 120 |
| object 150 m ahead | Road misses; cars 90 % on average, shared misses, not shared | 27 of 30 | 42 | 27 | 120 |
| object 150 m ahead | Road 95 % in 1 s, cars 90 %, all misses independent (V2V) | 0 of 10 | 0 | 0 | 0 |
| object 150 m ahead | Road 95 % in 1 s, cars 90 %, road and cars miss the same objects (V2V) | 0 of 10 | 0 | 0 | 0 |
| load falls off a truck | Road confirms in 0.5 s; car sensors off | 0 of 10 | 0 | 0 | 0 |
| load falls off a truck | Road confirms in 1 s; car sensors off | 9 of 10 | 9 | 9 | 47 |
| load falls off a truck | Road confirms in 2 s; car sensors off | 10 of 10 | 21 | 11 | 86 |
| load falls off a truck | Road confirms in 0.5 s; every car sees it (V2V) | 0 of 10 | 0 | 0 | 0 |
| load falls off a truck | Road confirms in 1 s; every car sees it (V2V) | 0 of 10 | 0 | 0 | 0 |
| load falls off a truck | Road confirms in 2 s; every car sees it (V2V) | 0 of 10 | 0 | 0 | 0 |
| load falls off a truck | Road misses; no car sees it | 10 of 10 | 21 | 11 | 90 |
| load falls off a truck | Road misses; every car sees it (V2V) | 0 of 10 | 0 | 0 | 0 |
| load falls off a truck | Road misses; each car 90 %, independently (V2V) | 5 of 30 | 10 | 5 | 90 |
| load falls off a truck | Road misses; cars 90 % on average, shared misses (V2V) | 1 of 30 | 3 | 1 | 90 |
| load falls off a truck | Road misses; each car 90 %, independently, not shared | 26 of 30 | 31 | 26 | 90 |
| load falls off a truck | Road misses; cars 90 % on average, shared misses, not shared | 25 of 30 | 27 | 25 | 90 |
| load falls off a truck | Road 95 % in 1 s, cars 90 %, all misses independent (V2V) | 4 of 30 | 4 | 4 | 47 |
| load falls off a truck | Road 95 % in 1 s, cars 90 %, road and cars miss the same objects (V2V) | 1 of 30 | 3 | 1 | 90 |

### Operating point

A detector trades detection against false alarms: a lower threshold sees more objects, sooner, and raises more false alarms. No roadside detector has been measured for this, so the trade is illustrated with a simple model (an assumption): Gaussian sensor noise, a sensitivity d′ that grows with the square root of the time the sensor may look before it confirms (d′ = d1 · √(t / 1 s)), and one independent look per 10 m of lane per confirmation time. The false-alarm budget sets the threshold, and the threshold sets the detection probability. For scale, today's tunnel video detection (95 % within about 10 s, about 0.01 false alarms per km per hour with a camera every 100 m) corresponds to d1 ≈ 2.2. D9's 99 % within 1 s needs d1 ≈ 7.2 at the budget below, 6.7 with ten times the false alarms and 7.6 with a tenth.

Chance of a collision per object (in %) combines the incident runs above: the road sees the object (with the detection probability) and confirms it after the time stated, or it misses it. "Cars 90 %" counts 90 % of the "every car sees it" row and 10 % of the "car sensors off" row, which holds for the first car to reach the object; misses use the "each car 90 %, independently" row. Capacity cost at saturation, false alarms cleared after 60 s, from the fit above. The budget used: 0.55 false alarms per km per hour (1 % of capacity).

| Sensor d1 | Confirms in (s) | Detects, at 0.1 / 1 / 10 false alarms per km per hour | Detects, at the budget | object 150 m ahead: cars off / cars 90 % (% collisions) | load falls off a truck: cars off / cars 90 % (% collisions) |
|---|---|---|---|---|---|
| 2.2 (today's tunnel video) | 0.5 | 0.0 % / 0.0 % / 0.2 % | 0.0 % | 100.0 / 16.7 | 100.0 / 16.7 |
| 2.2 (today's tunnel video) | 1 | 0.1 % / 0.5 % / 1.7 % | 0.3 % | 99.7 / 16.6 | 100.0 / 16.6 |
| 2.2 (today's tunnel video) | 2 | 2.2 % / 5.9 % / 14.4 % | 4.6 % | 95.6 / 15.9 | 100.0 / 16.4 |
| 6.0 | 0.5 | 13.6 % / 25.3 % / 42.4 % | 21.8 % | 78.2 / 13.0 | 78.2 / 13.0 |
| 6.0 | 1 | 78.4 % / 89.1 % / 95.7 % | 86.7 % | 13.3 / 2.2 | 91.3 / 10.0 |
| 6.0 | 2 | 100.0 % / 100.0 % / 100.0 % | 100.0 % | 3.3 / 0.3 | 100.0 / 10.0 |
| 7.0 | 0.5 | 34.8 % / 51.7 % / 69.7 % | 47.1 % | 52.9 / 8.8 | 52.9 / 8.8 |
| 7.0 | 1 | 96.3 % / 98.7 % / 99.7 % | 98.3 % | 1.7 / 0.3 | 90.2 / 9.1 |
| 7.0 | 2 | 100.0 % / 100.0 % / 100.0 % | 100.0 % | 3.3 / 0.3 | 100.0 / 10.0 |
| 8.0 | 0.5 | 62.4 % / 77.3 % / 88.9 % | 73.7 % | 26.3 / 4.4 | 26.3 / 4.4 |
| 8.0 | 1 | 99.7 % / 99.9 % / 100.0 % | 99.9 % | 0.1 / 0.0 | 90.0 / 9.0 |
| 8.0 | 2 | 100.0 % / 100.0 % / 100.0 % | 100.0 % | 3.3 / 0.3 | 100.0 / 10.0 |

Capacity cost of the false-alarm rates in the third column (saturated, cleared after 60 s): 0.1 per km per hour → 0.2 %, 1 per km per hour → 1.8 %, 10 per km per hour → 18.1 %. A collision chance of 0 means none in the runs above (10 runs resolve about 10 %, 30 runs about 3 %).

## 20a. Per hazard, counted the same way

*Full run of 2026-11-20 16:22: 5 runs per throughput row, 10 per incident row. Rows in a comparison that was within the noise were extended to 15 and 30 runs (last section).*

Each hazard on today's road and on SDR, counted the same way: 4,200 + 600 veh/h, 10 % trucks, the same seeds on every road, the hazard at t = 10 min around x = 3 km, observed for 5 minutes. "Collisions caused" = collisions minus those in the same traffic without the hazard (in brackets). SDR sensing as designed: road sensors confirm an object after 0.5 s, and every car's own sensor sees it within range and reports it to the road. "No truck gap" is the hybrid without the long gap behind trucks: it follows trucks as relative separation does. "Loss reported at once": the same, but the road knows of the lost load with no delay, as if the truck reported it itself (load monitoring, D10). A lost load that slides slows at 6 m/s² instead of stopping dead. Vehicles involved = every vehicle in a collision after the hazard (the stopped or broken-down vehicle counts once something hits it), per event. An event is a run in which the hazard could be placed (a lost load needs a vehicle within 150 m behind a truck).

| Hazard | System | Events | Events with a collision | Collisions caused (background) | Collisions caused per event | Vehicles involved per event: mean / events with 5+ | Impact speed, median (km/h) | Impacts above 30 km/h | Worst impact (km/h) | Mean gap of the follower (m) |
|---|---|---|---|---|---|---|---|---|---|---|
| load falls off a truck, stops dead | Today (human drivers) | 30 | 28 | 150 (0) | 5.00 | 5.1 / 11 | 65 | 135 | 92 | 41 |
| load falls off a truck, stops dead | SDR, no truck gap (relative behind trucks) | 30 | 30 | 72 (0) | 2.40 | 2.4 / 0 | 58 | 55 | 79 | 19 |
| load falls off a truck, stops dead | SDR, hybrid (truck gap as it is) | 30 | 0 | 0 (0) | 0.00 | 0.0 / 0 | – | 0 | 0 | 62 |
| load falls off a truck, stops dead | SDR, no truck gap, loss reported at once | 30 | 30 | 73 (0) | 2.43 | 2.4 / 0 | 58 | 56 | 79 | 19 |
| load falls off a truck, slides at 6 m/s² | Today (human drivers) | 30 | 3 | 4 (0) | 0.13 | 0.2 / 0 | 15 | 0 | 26 | 41 |
| load falls off a truck, slides at 6 m/s² | SDR, no truck gap (relative behind trucks) | 30 | 0 | 0 (0) | 0.00 | 0.0 / 0 | – | 0 | 0 | 19 |
| load falls off a truck, slides at 6 m/s² | SDR, hybrid (truck gap as it is) | 30 | 0 | 0 (0) | 0.00 | 0.0 / 0 | – | 0 | 0 | 62 |
| brick-wall stop | Today (human drivers) | 30 | 26 | 103 (0) | 3.43 | 4.3 / 11 | 63 | 89 | 110 | – |
| brick-wall stop | SDR, no truck gap (relative behind trucks) | 30 | 19 | 28 (0) | 0.93 | 1.6 / 0 | 45 | 22 | 69 | – |
| brick-wall stop | SDR, hybrid (truck gap as it is) | 30 | 15 | 16 (0) | 0.53 | 1.0 / 0 | 47 | 16 | 69 | – |
| object 150 m ahead | Today (human drivers) | 30 | 3 | 5 (0) | 0.17 | 0.2 / 0 | 51 | 3 | 55 | 140 |
| object 150 m ahead | SDR, no truck gap (relative behind trucks) | 30 | 0 | 0 (0) | 0.00 | 0.0 / 0 | – | 0 | 0 | 149 |
| object 150 m ahead | SDR, hybrid (truck gap as it is) | 30 | 0 | 0 (0) | 0.00 | 0.0 / 0 | – | 0 | 0 | 152 |
| breakdown | Today (human drivers) | 30 | 0 | 0 (0) | 0.00 | 0.0 / 0 | – | 0 | 0 | – |
| breakdown | SDR, no truck gap (relative behind trucks) | 30 | 0 | 0 (0) | 0.00 | 0.0 / 0 | – | 0 | 0 | – |
| breakdown | SDR, hybrid (truck gap as it is) | 30 | 0 | 0 (0) | 0.00 | 0.0 / 0 | – | 0 | 0 | – |

## 21. Which differences are real

Both rows of a comparison were run with the same seeds, so they saw the same traffic. The difference is taken per seed and averaged; the interval is its 95 % confidence interval (Student's t). "Outside the noise" means the interval does not include zero. "Within the noise" means these runs cannot tell the two apart: the true difference is probably inside the interval, and may be zero. A comparison that was within the noise after the standard number of runs was extended once, to the number of runs shown, and is reported as it then stood. An incident row that is compared with a row extended in this way gets the same number of runs, so that collision counts are compared like against like. With this many comparisons, about one in twenty of those near the boundary will be on the wrong side by chance.

### Throughput and delay vs demand (section 1)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 2,400 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Hard brakes / 1000 veh-km | 15 | 0.21 | 21.2 | -20.9 (−99 %) | -24.1 to -17.7 | outside the noise |
| 2,400 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Served (veh/h) | 15 | 3,262 | 3,317 | -55.2 (−2 %) | -94.4 to -16.0 | outside the noise |
| 2,400 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Trip delay (s) | 15 | 36.1 | 10.2 | 25.8 (+253 %) | 19.9 to 31.8 | outside the noise |
| 3,600 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.34 | 44.6 | -44.3 (−99 %) | -47.3 to -41.3 | outside the noise |
| 3,600 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Served (veh/h) | 5 | 3,301 | 4,477 | -1,176 (−26 %) | -1,313 to -1,039 | outside the noise |
| 3,600 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Trip delay (s) | 5 | 173 | 29.6 | 144 (+486 %) | 128 to 160 | outside the noise |
| 4,800 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.23 | 85.7 | -85.4 (−100 %) | -99.7 to -71.1 | outside the noise |
| 4,800 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Served (veh/h) | 5 | 3,309 | 5,261 | -1,952 (−37 %) | -2,049 to -1,855 | outside the noise |
| 4,800 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Trip delay (s) | 5 | 243 | 72.2 | 171 (+237 %) | 158 to 184 | outside the noise |
| 6,000 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.17 | 74.5 | -74.3 (−100 %) | -90.7 to -58.0 | outside the noise |
| 6,000 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Served (veh/h) | 5 | 3,312 | 5,249 | -1,937 (−37 %) | -2,077 to -1,796 | outside the noise |
| 6,000 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Trip delay (s) | 5 | 286 | 155 | 131 (+84 %) | 115 to 147 | outside the noise |
| 7,200 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.35 | 71.8 | -71.4 (−100 %) | -91.2 to -51.6 | outside the noise |
| 7,200 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Served (veh/h) | 5 | 3,304 | 5,395 | -2,091 (−39 %) | -2,303 to -1,880 | outside the noise |
| 7,200 + 900 veh/h | SDR, absolute separation | Today (human drivers) | Trip delay (s) | 5 | 314 | 212 | 102 (+48 %) | 94.9 to 109 | outside the noise |
| 2,400 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Hard brakes / 1000 veh-km | 15 | 0.36 | 21.2 | -20.8 (−98 %) | -24.1 to -17.5 | outside the noise |
| 2,400 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Served (veh/h) | 15 | 3,295 | 3,317 | -22.1 (−1 %) | -40.9 to -3.32 | outside the noise |
| 2,400 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Trip delay (s) | 15 | 32.4 | 10.2 | 22.2 (+217 %) | 18.7 to 25.8 | outside the noise |
| 3,600 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 11.5 | 44.6 | -33.1 (−74 %) | -38.4 to -27.8 | outside the noise |
| 3,600 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Served (veh/h) | 5 | 3,966 | 4,477 | -510 (−11 %) | -691 to -329 | outside the noise |
| 3,600 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Trip delay (s) | 5 | 171 | 29.6 | 142 (+478 %) | 126 to 157 | outside the noise |
| 4,800 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 15.4 | 85.7 | -70.3 (−82 %) | -80.9 to -59.6 | outside the noise |
| 4,800 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Served (veh/h) | 5 | 4,059 | 5,261 | -1,202 (−23 %) | -1,434 to -969 | outside the noise |
| 4,800 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Trip delay (s) | 5 | 268 | 72.2 | 196 (+271 %) | 175 to 216 | outside the noise |
| 6,000 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 13.0 | 74.5 | -61.6 (−83 %) | -77.9 to -45.2 | outside the noise |
| 6,000 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Served (veh/h) | 5 | 4,079 | 5,249 | -1,170 (−22 %) | -1,370 to -969 | outside the noise |
| 6,000 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Trip delay (s) | 5 | 321 | 155 | 166 (+107 %) | 143 to 189 | outside the noise |
| 7,200 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 11.5 | 71.8 | -60.3 (−84 %) | -80.8 to -39.8 | outside the noise |
| 7,200 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Served (veh/h) | 5 | 4,053 | 5,395 | -1,342 (−25 %) | -1,666 to -1,019 | outside the noise |
| 7,200 + 900 veh/h | SDR, absolute + adaptive speed | Today (human drivers) | Trip delay (s) | 5 | 365 | 212 | 153 (+73 %) | 128 to 179 | outside the noise |
| 2,400 + 900 veh/h | SDR, relative separation | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.00 | 19.8 | -19.8 (−100 %) | -27.6 to -12.0 | outside the noise |
| 2,400 + 900 veh/h | SDR, relative separation | Today (human drivers) | Served (veh/h) | 5 | 3,337 | 3,364 | -27.2 (−1 %) | -46.2 to -8.16 | outside the noise |
| 2,400 + 900 veh/h | SDR, relative separation | Today (human drivers) | Trip delay (s) | 5 | 6.67 | 10.2 | -3.56 (−35 %) | -5.18 to -1.95 | outside the noise |
| 3,600 + 900 veh/h | SDR, relative separation | Today (human drivers) | Hard brakes / 1000 veh-km | 15 | 0.07 | 45.5 | -45.5 (−100 %) | -49.3 to -41.7 | outside the noise |
| 3,600 + 900 veh/h | SDR, relative separation | Today (human drivers) | Served (veh/h) | 15 | 4,488 | 4,419 | 68.5 (+2 %) | 21.5 to 116 | outside the noise |
| 3,600 + 900 veh/h | SDR, relative separation | Today (human drivers) | Trip delay (s) | 15 | 8.37 | 28.7 | -20.4 (−71 %) | -24.2 to -16.6 | outside the noise |
| 4,800 + 900 veh/h | SDR, relative separation | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.00 | 85.7 | -85.7 (−100 %) | -99.7 to -71.6 | outside the noise |
| 4,800 + 900 veh/h | SDR, relative separation | Today (human drivers) | Served (veh/h) | 5 | 5,690 | 5,261 | 430 (+8 %) | 267 to 592 | outside the noise |
| 4,800 + 900 veh/h | SDR, relative separation | Today (human drivers) | Trip delay (s) | 5 | 11.9 | 72.2 | -60.3 (−84 %) | -74.3 to -46.4 | outside the noise |
| 6,000 + 900 veh/h | SDR, relative separation | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.99 | 74.5 | -73.5 (−99 %) | -90.1 to -57.0 | outside the noise |
| 6,000 + 900 veh/h | SDR, relative separation | Today (human drivers) | Served (veh/h) | 5 | 6,859 | 5,249 | 1,610 (+31 %) | 1,462 to 1,759 | outside the noise |
| 6,000 + 900 veh/h | SDR, relative separation | Today (human drivers) | Trip delay (s) | 5 | 19.8 | 155 | -136 (−87 %) | -154 to -117 | outside the noise |
| 7,200 + 900 veh/h | SDR, relative separation | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 1.43 | 71.8 | -70.3 (−98 %) | -89.8 to -50.8 | outside the noise |
| 7,200 + 900 veh/h | SDR, relative separation | Today (human drivers) | Served (veh/h) | 5 | 7,084 | 5,395 | 1,689 (+31 %) | 1,254 to 2,123 | outside the noise |
| 7,200 + 900 veh/h | SDR, relative separation | Today (human drivers) | Trip delay (s) | 5 | 90.1 | 212 | -121 (−57 %) | -144 to -98.6 | outside the noise |
| 2,400 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Hard brakes / 1000 veh-km | 15 | 0.08 | 21.2 | -21.1 (−100 %) | -24.3 to -17.8 | outside the noise |
| 2,400 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 15 | 3,315 | 3,317 | -1.60 (−0 %) | -14.7 to 11.5 | within the noise |
| 2,400 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Trip delay (s) | 15 | 8.02 | 10.2 | -2.21 (−22 %) | -2.84 to -1.57 | outside the noise |
| 3,600 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Hard brakes / 1000 veh-km | 15 | 0.21 | 45.5 | -45.3 (−100 %) | -49.1 to -41.6 | outside the noise |
| 3,600 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 15 | 4,491 | 4,419 | 71.7 (+2 %) | 29.5 to 114 | outside the noise |
| 3,600 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Trip delay (s) | 15 | 11.3 | 28.7 | -17.4 (−61 %) | -21.2 to -13.7 | outside the noise |
| 4,800 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.66 | 85.7 | -85.0 (−99 %) | -98.7 to -71.3 | outside the noise |
| 4,800 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 5 | 5,680 | 5,261 | 419 (+8 %) | 231 to 608 | outside the noise |
| 4,800 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Trip delay (s) | 5 | 19.6 | 72.2 | -52.6 (−73 %) | -67.4 to -37.8 | outside the noise |
| 6,000 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 2.22 | 74.5 | -72.3 (−97 %) | -88.7 to -55.9 | outside the noise |
| 6,000 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 5 | 5,896 | 5,249 | 647 (+12 %) | 365 to 929 | outside the noise |
| 6,000 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Trip delay (s) | 5 | 102 | 155 | -53.2 (−34 %) | -82.4 to -24.1 | outside the noise |
| 7,200 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 3.85 | 71.8 | -67.9 (−95 %) | -86.5 to -49.3 | outside the noise |
| 7,200 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 5 | 6,002 | 5,395 | 607 (+11 %) | 333 to 881 | outside the noise |
| 7,200 + 900 veh/h | SDR, hybrid separation | Today (human drivers) | Trip delay (s) | 5 | 167 | 212 | -45.1 (−21 %) | -64.6 to -25.6 | outside the noise |

### Incidents (section 2)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| debris | SDR, absolute separation | Today (human drivers) | Collisions per run | 30 | 0.00 | 0.23 | -0.23 (−100 %) | -0.49 to 0.02 | within the noise |
| debris | SDR, relative separation | Today (human drivers) | Collisions per run | 30 | 0.00 | 0.23 | -0.23 (−100 %) | -0.49 to 0.02 | within the noise |
| debris | SDR, hybrid separation | Today (human drivers) | Collisions per run | 30 | 0.00 | 0.23 | -0.23 (−100 %) | -0.49 to 0.02 | within the noise |
| brick-wall stop | SDR, absolute separation | Today (human drivers) | Collisions per run | 10 | 0.00 | 3.30 | -3.30 (−100 %) | -4.85 to -1.75 | outside the noise |
| brick-wall stop | SDR, relative separation | Today (human drivers) | Collisions per run | 10 | 0.80 | 3.30 | -2.50 (−76 %) | -4.05 to -0.95 | outside the noise |
| brick-wall stop | SDR, hybrid separation | Today (human drivers) | Collisions per run | 10 | 0.50 | 3.30 | -2.80 (−85 %) | -4.34 to -1.26 | outside the noise |
| sudden 50 % brake loss | SDR, absolute separation | Today (human drivers) | Collisions per run | 10 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| sudden 50 % brake loss | SDR, relative separation | Today (human drivers) | Collisions per run | 10 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| sudden 50 % brake loss | SDR, hybrid separation | Today (human drivers) | Collisions per run | 10 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |

### Hybrid separation variants (section 3)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| capacity, 7,200 + 900 veh/h | Relative + absolute behind faulty vehicles only | Relative (no hybrid rules) | Served (veh/h) | 5 | 7,084 | 7,084 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| brick-wall stop | Relative + absolute behind faulty vehicles only | Relative (no hybrid rules) | Collisions per run | 30 | 0.73 | 0.73 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| load falls off a truck | Relative + absolute behind faulty vehicles only | Relative (no hybrid rules) | Collisions per run | 30 | 2.17 | 2.17 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| capacity, 7,200 + 900 veh/h | + platoon break every 20 | Relative (no hybrid rules) | Served (veh/h) | 5 | 6,765 | 7,084 | -319 (−5 %) | -592 to -46.8 | outside the noise |
| brick-wall stop | + platoon break every 20 | Relative (no hybrid rules) | Collisions per run | 30 | 0.50 | 0.73 | -0.23 (−32 %) | -0.58 to 0.12 | within the noise |
| load falls off a truck | + platoon break every 20 | Relative (no hybrid rules) | Collisions per run | 30 | 1.77 | 2.17 | -0.40 (−18 %) | -0.69 to -0.11 | outside the noise |
| capacity, 7,200 + 900 veh/h | + platoon break every 10 | Relative (no hybrid rules) | Served (veh/h) | 5 | 6,549 | 7,084 | -535 (−8 %) | -905 to -165 | outside the noise |
| brick-wall stop | + platoon break every 10 | Relative (no hybrid rules) | Collisions per run | 30 | 1.03 | 0.73 | 0.30 (+41 %) | -0.04 to 0.64 | within the noise |
| load falls off a truck | + platoon break every 10 | Relative (no hybrid rules) | Collisions per run | 30 | 1.90 | 2.17 | -0.27 (−12 %) | -0.66 to 0.12 | within the noise |
| capacity, 7,200 + 900 veh/h | + platoon break every 5 | Relative (no hybrid rules) | Served (veh/h) | 5 | 5,910 | 7,084 | -1,174 (−17 %) | -1,501 to -848 | outside the noise |
| brick-wall stop | + platoon break every 5 | Relative (no hybrid rules) | Collisions per run | 30 | 0.83 | 0.73 | 0.10 (+14 %) | -0.31 to 0.51 | within the noise |
| load falls off a truck | + platoon break every 5 | Relative (no hybrid rules) | Collisions per run | 30 | 1.27 | 2.17 | -0.90 (−42 %) | -1.31 to -0.49 | outside the noise |
| capacity, 7,200 + 900 veh/h | + platoon break every 3 | Relative (no hybrid rules) | Served (veh/h) | 5 | 5,215 | 7,084 | -1,869 (−26 %) | -2,161 to -1,576 | outside the noise |
| brick-wall stop | + platoon break every 3 | Relative (no hybrid rules) | Collisions per run | 30 | 0.53 | 0.73 | -0.20 (−27 %) | -0.64 to 0.24 | within the noise |
| load falls off a truck | + platoon break every 3 | Relative (no hybrid rules) | Collisions per run | 30 | 0.97 | 2.17 | -1.20 (−55 %) | -1.64 to -0.76 | outside the noise |
| capacity, 7,200 + 900 veh/h | + absolute behind trucks (recommended hybrid) | Relative (no hybrid rules) | Served (veh/h) | 5 | 6,002 | 7,084 | -1,082 (−15 %) | -1,443 to -721 | outside the noise |
| brick-wall stop | + absolute behind trucks (recommended hybrid) | Relative (no hybrid rules) | Collisions per run | 30 | 0.83 | 0.73 | 0.10 (+14 %) | -0.36 to 0.56 | within the noise |
| load falls off a truck | + absolute behind trucks (recommended hybrid) | Relative (no hybrid rules) | Collisions per run | 30 | 0.00 | 2.17 | -2.17 (−100 %) | -2.52 to -1.81 | outside the noise |
| capacity, 7,200 + 900 veh/h | + absolute behind trucks + platoon break every 10 | Relative (no hybrid rules) | Served (veh/h) | 5 | 5,613 | 7,084 | -1,471 (−21 %) | -1,868 to -1,074 | outside the noise |
| brick-wall stop | + absolute behind trucks + platoon break every 10 | Relative (no hybrid rules) | Collisions per run | 30 | 1.00 | 0.73 | 0.27 (+36 %) | -0.17 to 0.70 | within the noise |
| load falls off a truck | + absolute behind trucks + platoon break every 10 | Relative (no hybrid rules) | Collisions per run | 30 | 0.00 | 2.17 | -2.17 (−100 %) | -2.52 to -1.81 | outside the noise |
| capacity, 7,200 + 900 veh/h | Absolute | Relative (no hybrid rules) | Served (veh/h) | 5 | 3,304 | 7,084 | -3,780 (−53 %) | -4,059 to -3,501 | outside the noise |
| brick-wall stop | Absolute | Relative (no hybrid rules) | Collisions per run | 30 | 0.00 | 0.73 | -0.73 (−100 %) | -1.06 to -0.41 | outside the noise |
| load falls off a truck | Absolute | Relative (no hybrid rules) | Collisions per run | 30 | 0.00 | 2.17 | -2.17 (−100 %) | -2.52 to -1.81 | outside the noise |

### Object 150 m ahead (section 4)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| object 150 m ahead; Nobody detects it | SDR hybrid | Today | Collisions per run | 30 | 1.60 | 0.30 | 1.30 (+433 %) | 0.82 to 1.78 | outside the noise |
| object 150 m ahead; Road cameras only (95 %, 0.5 s) | SDR hybrid | Today | Collisions per run | 30 | 0.00 | 0.30 | -0.30 (−100 %) | -0.61 to 0.01 | within the noise |
| object 150 m ahead; Car sensors only (90 %), not shared | SDR hybrid | Today | Collisions per run | 30 | 1.53 | 0.30 | 1.23 (+411 %) | 0.65 to 1.82 | outside the noise |
| object 150 m ahead; Car sensors (90 %) + V2V | SDR hybrid | Today | Collisions per run | 30 | 0.40 | 0.30 | 0.10 (+33 %) | -0.40 to 0.60 | within the noise |
| object 150 m ahead; Road cameras + car sensors + V2V | SDR hybrid | Today | Collisions per run | 30 | 0.00 | 0.30 | -0.30 (−100 %) | -0.61 to 0.01 | within the noise |

### Object 300 m ahead (section 4)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| object 300 m ahead; Nobody detects it | SDR hybrid | Today | Collisions per run | 30 | 1.87 | 0.27 | 1.60 (+600 %) | 1.03 to 2.17 | outside the noise |
| object 300 m ahead; Road cameras only (95 %, 0.5 s) | SDR hybrid | Today | Collisions per run | 30 | 0.00 | 0.27 | -0.27 (−100 %) | -0.58 to 0.04 | within the noise |
| object 300 m ahead; Car sensors only (90 %), not shared | SDR hybrid | Today | Collisions per run | 30 | 1.47 | 0.27 | 1.20 (+450 %) | 0.63 to 1.77 | outside the noise |
| object 300 m ahead; Car sensors (90 %) + V2V | SDR hybrid | Today | Collisions per run | 30 | 0.47 | 0.27 | 0.20 (+75 %) | -0.37 to 0.77 | within the noise |
| object 300 m ahead; Road cameras + car sensors + V2V | SDR hybrid | Today | Collisions per run | 30 | 0.00 | 0.27 | -0.27 (−100 %) | -0.58 to 0.04 | within the noise |

### Load falls off a truck (section 4)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| load falls off a truck; Nobody detects it | SDR hybrid | Today | Collisions per run | 30 | 2.00 | 3.97 | -1.97 (−50 %) | -2.85 to -1.08 | outside the noise |
| load falls off a truck; Road cameras only (95 %, 0.5 s) | SDR hybrid | Today | Collisions per run | 30 | 0.00 | 3.97 | -3.97 (−100 %) | -4.87 to -3.07 | outside the noise |
| load falls off a truck; Car sensors only (90 %), not shared | SDR hybrid | Today | Collisions per run | 30 | 1.03 | 3.97 | -2.93 (−74 %) | -3.87 to -2.00 | outside the noise |
| load falls off a truck; Car sensors (90 %) + V2V | SDR hybrid | Today | Collisions per run | 30 | 0.33 | 3.97 | -3.63 (−92 %) | -4.58 to -2.69 | outside the noise |
| load falls off a truck; Road cameras + car sensors + V2V | SDR hybrid | Today | Collisions per run | 30 | 0.00 | 3.97 | -3.97 (−100 %) | -4.87 to -3.07 | outside the noise |

### Safety lane: breakdown (section 5)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| breakdown | SDR hybrid, no safety lane | Today, no hard shoulder | Extra delay (vehicle-hours) | 30 | 5.89 | 18.5 | -12.6 (−68 %) | -19.1 to -6.09 | outside the noise |
| breakdown | SDR hybrid, no safety lane | Today, no hard shoulder | Collisions per run | 30 | 0.00 | 0.07 | -0.07 (−100 %) | -0.16 to 0.03 | within the noise |
| breakdown | SDR hybrid, with safety lane | Today, with hard shoulder | Extra delay (vehicle-hours) | 30 | -0.01 | -0.54 | 0.53 | -1.01 to 2.08 | within the noise |
| breakdown | SDR hybrid, with safety lane | Today, with hard shoulder | Collisions per run | 30 | 0.00 | 0.10 | -0.10 (−100 %) | -0.30 to 0.10 | within the noise |
| breakdown | SDR hybrid, with safety lane | SDR hybrid, no safety lane | Extra delay (vehicle-hours) | 30 | -0.01 | 5.89 | -5.89 (−100 %) | -11.5 to -0.33 | outside the noise |
| breakdown | SDR hybrid, with safety lane | SDR hybrid, no safety lane | Collisions per run | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| breakdown | Today, with hard shoulder | Today, no hard shoulder | Extra delay (vehicle-hours) | 30 | -0.54 | 18.5 | -19.0 (−103 %) | -24.0 to -14.0 | outside the noise |
| breakdown | Today, with hard shoulder | Today, no hard shoulder | Collisions per run | 30 | 0.10 | 0.07 | 0.03 (+50 %) | -0.20 to 0.26 | within the noise |

### Safety lane: brake loss (section 5)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| sudden 50 % brake loss | SDR hybrid, with safety lane | SDR hybrid, no safety lane | Extra delay (vehicle-hours) | 10 | 0.02 | 0.01 | 0.01 (+74 %) | 0.00 to 0.01 | outside the noise |
| sudden 50 % brake loss | SDR hybrid, with safety lane | SDR hybrid, no safety lane | Collisions per run | 10 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |

### Safety lane: radio loss (section 5)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| vehicle comms loss | SDR hybrid, with safety lane | SDR hybrid, no safety lane | Extra delay (vehicle-hours) | 30 | 0.23 | 0.26 | -0.03 (−11 %) | -0.06 to 0.01 | within the noise |
| vehicle comms loss | SDR hybrid, with safety lane | SDR hybrid, no safety lane | Collisions per run | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |

### Gate and merge rules (section 12)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 3,600 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Served (veh/h) | 5 | 4,330 | 4,477 | -147 (−3 %) | -307 to 12.2 | within the noise |
| 3,600 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Trip delay (s) | 5 | 30.2 | 29.6 | 0.62 (+2 %) | -12.6 to 13.9 | within the noise |
| 3,600 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Wait, 95th percentile (s) | 5 | 144 | 2.58 | 141 (+5,481 %) | 54.9 to 228 | outside the noise |
| 3,600 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 1.21 | 44.6 | -43.4 (−97 %) | -47.0 to -39.8 | outside the noise |
| 3,600 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Served (veh/h) | 5 | 4,506 | 4,477 | 28.8 (+1 %) | -28.0 to 85.6 | within the noise |
| 3,600 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Trip delay (s) | 5 | 19.2 | 29.6 | -10.4 (−35 %) | -20.8 to 0.01 | within the noise |
| 3,600 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Wait, 95th percentile (s) | 5 | 45.1 | 2.58 | 42.5 (+1,648 %) | 42.0 to 43.0 | outside the noise |
| 3,600 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.24 | 44.6 | -44.4 (−99 %) | -47.2 to -41.6 | outside the noise |
| 3,600 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Served (veh/h) | 5 | 4,506 | 4,330 | 176 (+4 %) | 49.2 to 303 | outside the noise |
| 3,600 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Trip delay (s) | 5 | 19.2 | 30.2 | -11.0 (−36 %) | -21.4 to -0.61 | outside the noise |
| 3,600 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 45.1 | 144 | -98.9 (−69 %) | -186 to -12.2 | outside the noise |
| 3,600 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.24 | 1.21 | -0.97 (−80 %) | -2.24 to 0.30 | within the noise |
| 3,600 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Served (veh/h) | 5 | 4,502 | 4,477 | 25.6 (+1 %) | -27.7 to 78.9 | within the noise |
| 3,600 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Trip delay (s) | 5 | 18.8 | 29.6 | -10.9 (−37 %) | -21.8 to 0.13 | within the noise |
| 3,600 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Wait, 95th percentile (s) | 5 | 45.0 | 2.58 | 42.5 (+1,646 %) | 42.0 to 43.0 | outside the noise |
| 3,600 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.24 | 44.6 | -44.4 (−99 %) | -47.3 to -41.4 | outside the noise |
| 3,600 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Served (veh/h) | 5 | 4,502 | 4,330 | 173 (+4 %) | 40.6 to 305 | outside the noise |
| 3,600 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Trip delay (s) | 5 | 18.8 | 30.2 | -11.5 (−38 %) | -22.1 to -0.89 | outside the noise |
| 3,600 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 45.0 | 144 | -98.9 (−69 %) | -186 to -12.2 | outside the noise |
| 3,600 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.24 | 1.21 | -0.96 (−80 %) | -2.29 to 0.36 | within the noise |
| 3,600 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Served (veh/h) | 5 | 4,492 | 4,477 | 15.2 (+0 %) | -38.4 to 68.8 | within the noise |
| 3,600 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Trip delay (s) | 5 | 18.4 | 29.6 | -11.2 (−38 %) | -22.0 to -0.36 | outside the noise |
| 3,600 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Wait, 95th percentile (s) | 5 | 45.0 | 2.58 | 42.5 (+1,646 %) | 42.0 to 43.0 | outside the noise |
| 3,600 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.16 | 44.6 | -44.4 (−100 %) | -47.4 to -41.5 | outside the noise |
| 3,600 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Served (veh/h) | 5 | 4,492 | 4,330 | 162 (+4 %) | 43.2 to 282 | outside the noise |
| 3,600 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Trip delay (s) | 5 | 18.4 | 30.2 | -11.8 (−39 %) | -22.2 to -1.37 | outside the noise |
| 3,600 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 45.0 | 144 | -98.9 (−69 %) | -186 to -12.2 | outside the noise |
| 3,600 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.16 | 1.21 | -1.05 (−87 %) | -2.25 to 0.15 | within the noise |
| 3,600 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Served (veh/h) | 5 | 4,498 | 4,477 | 21.6 (+0 %) | -33.2 to 76.4 | within the noise |
| 3,600 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Trip delay (s) | 5 | 13.5 | 29.6 | -16.2 (−55 %) | -27.2 to -5.12 | outside the noise |
| 3,600 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Wait, 95th percentile (s) | 5 | 15.1 | 2.58 | 12.5 (+486 %) | 12.1 to 13.0 | outside the noise |
| 3,600 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.24 | 44.6 | -44.4 (−99 %) | -47.2 to -41.6 | outside the noise |
| 3,600 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Served (veh/h) | 5 | 4,498 | 4,330 | 169 (+4 %) | 36.6 to 301 | outside the noise |
| 3,600 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Trip delay (s) | 5 | 13.5 | 30.2 | -16.8 (−56 %) | -27.6 to -5.92 | outside the noise |
| 3,600 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 15.1 | 144 | -129 (−89 %) | -216 to -42.2 | outside the noise |
| 3,600 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.24 | 1.21 | -0.97 (−80 %) | -2.27 to 0.34 | within the noise |
| 3,600 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Served (veh/h) | 5 | 4,510 | 4,477 | 32.8 (+1 %) | -13.3 to 78.9 | within the noise |
| 3,600 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Trip delay (s) | 5 | 11.5 | 29.6 | -18.1 (−61 %) | -29.7 to -6.61 | outside the noise |
| 3,600 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Wait, 95th percentile (s) | 5 | 0.61 | 2.58 | -1.97 (−76 %) | -2.28 to -1.66 | outside the noise |
| 3,600 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.21 | 44.6 | -44.4 (−100 %) | -47.5 to -41.3 | outside the noise |
| 3,600 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Served (veh/h) | 5 | 4,510 | 4,330 | 180 (+4 %) | 39.0 to 321 | outside the noise |
| 3,600 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Trip delay (s) | 5 | 11.5 | 30.2 | -18.8 (−62 %) | -29.9 to -7.60 | outside the noise |
| 3,600 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 0.61 | 144 | -143 (−100 %) | -230 to -56.8 | outside the noise |
| 3,600 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.21 | 1.21 | -1.00 (−83 %) | -2.44 to 0.43 | within the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Served (veh/h) | 5 | 4,510 | 4,477 | 32.8 (+1 %) | -13.3 to 78.9 | within the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Trip delay (s) | 5 | 11.5 | 29.6 | -18.1 (−61 %) | -29.7 to -6.61 | outside the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Wait, 95th percentile (s) | 5 | 0.61 | 2.58 | -1.97 (−76 %) | -2.28 to -1.66 | outside the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.21 | 44.6 | -44.4 (−100 %) | -47.5 to -41.3 | outside the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Served (veh/h) | 5 | 4,510 | 4,330 | 180 (+4 %) | 39.0 to 321 | outside the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Trip delay (s) | 5 | 11.5 | 30.2 | -18.8 (−62 %) | -29.9 to -7.60 | outside the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 0.61 | 144 | -143 (−100 %) | -230 to -56.8 | outside the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.21 | 1.21 | -1.00 (−83 %) | -2.44 to 0.43 | within the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Served (veh/h) | 5 | 4,510 | 4,477 | 32.8 (+1 %) | -13.3 to 78.9 | within the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Trip delay (s) | 5 | 11.5 | 29.6 | -18.1 (−61 %) | -29.7 to -6.61 | outside the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Wait, 95th percentile (s) | 5 | 0.61 | 2.58 | -1.97 (−76 %) | -2.28 to -1.66 | outside the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.21 | 44.6 | -44.4 (−100 %) | -47.5 to -41.3 | outside the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Served (veh/h) | 5 | 4,510 | 4,330 | 180 (+4 %) | 39.0 to 321 | outside the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Trip delay (s) | 5 | 11.5 | 30.2 | -18.8 (−62 %) | -29.9 to -7.60 | outside the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 0.61 | 144 | -143 (−100 %) | -230 to -56.8 | outside the noise |
| 3,600 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.21 | 1.21 | -1.00 (−83 %) | -2.44 to 0.43 | within the noise |
| 3,600 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Served (veh/h) | 5 | 4,504 | 4,477 | 27.2 (+1 %) | -25.8 to 80.2 | within the noise |
| 3,600 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Trip delay (s) | 5 | 14.8 | 29.6 | -14.9 (−50 %) | -26.4 to -3.33 | outside the noise |
| 3,600 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Wait, 95th percentile (s) | 5 | 0.62 | 2.58 | -1.96 (−76 %) | -2.28 to -1.64 | outside the noise |
| 3,600 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.41 | 44.6 | -44.2 (−99 %) | -47.1 to -41.3 | outside the noise |
| 3,600 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Served (veh/h) | 5 | 4,504 | 4,330 | 174 (+4 %) | 51.4 to 297 | outside the noise |
| 3,600 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Trip delay (s) | 5 | 14.8 | 30.2 | -15.5 (−51 %) | -26.3 to -4.64 | outside the noise |
| 3,600 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 0.62 | 144 | -143 (−100 %) | -230 to -56.8 | outside the noise |
| 3,600 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.41 | 1.21 | -0.80 (−66 %) | -2.67 to 1.07 | within the noise |
| 3,600 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Served (veh/h) | 5 | 4,510 | 4,477 | 32.8 (+1 %) | -13.3 to 78.9 | within the noise |
| 3,600 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Trip delay (s) | 5 | 11.5 | 29.6 | -18.2 (−61 %) | -29.7 to -6.62 | outside the noise |
| 3,600 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Wait, 95th percentile (s) | 5 | 0.61 | 2.58 | -1.97 (−76 %) | -2.28 to -1.66 | outside the noise |
| 3,600 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.21 | 44.6 | -44.4 (−100 %) | -47.5 to -41.3 | outside the noise |
| 3,600 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Served (veh/h) | 5 | 4,510 | 4,330 | 180 (+4 %) | 39.0 to 321 | outside the noise |
| 3,600 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Trip delay (s) | 5 | 11.5 | 30.2 | -18.8 (−62 %) | -30.0 to -7.60 | outside the noise |
| 3,600 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 0.61 | 144 | -143 (−100 %) | -230 to -56.8 | outside the noise |
| 3,600 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.21 | 1.21 | -1.00 (−83 %) | -2.44 to 0.43 | within the noise |
| 4,800 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Served (veh/h) | 5 | 5,132 | 5,261 | -129 (−2 %) | -238 to -19.3 | outside the noise |
| 4,800 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Trip delay (s) | 5 | 37.9 | 72.2 | -34.3 (−47 %) | -56.4 to -12.1 | outside the noise |
| 4,800 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Wait, 95th percentile (s) | 5 | 492 | 5.02 | 487 (+9,697 %) | 391 to 582 | outside the noise |
| 4,800 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.24 | 85.7 | -85.4 (−100 %) | -99.5 to -71.3 | outside the noise |
| 4,800 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Served (veh/h) | 5 | 5,642 | 5,261 | 382 (+7 %) | 194 to 569 | outside the noise |
| 4,800 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Trip delay (s) | 5 | 28.5 | 72.2 | -43.7 (−60 %) | -57.4 to -29.9 | outside the noise |
| 4,800 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Wait, 95th percentile (s) | 5 | 45.2 | 5.02 | 40.2 (+801 %) | 39.6 to 40.8 | outside the noise |
| 4,800 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 1.24 | 85.7 | -84.4 (−99 %) | -98.9 to -69.9 | outside the noise |
| 4,800 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Served (veh/h) | 5 | 5,642 | 5,132 | 510 (+10 %) | 403 to 617 | outside the noise |
| 4,800 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Trip delay (s) | 5 | 28.5 | 37.9 | -9.41 (−25 %) | -20.8 to 1.99 | within the noise |
| 4,800 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 45.2 | 492 | -447 (−91 %) | -542 to -351 | outside the noise |
| 4,800 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 1.24 | 0.24 | 1.00 (+416 %) | 0.29 to 1.70 | outside the noise |
| 4,800 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Served (veh/h) | 5 | 5,669 | 5,261 | 408 (+8 %) | 199 to 617 | outside the noise |
| 4,800 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Trip delay (s) | 5 | 26.6 | 72.2 | -45.6 (−63 %) | -58.2 to -33.0 | outside the noise |
| 4,800 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Wait, 95th percentile (s) | 5 | 45.1 | 5.02 | 40.1 (+799 %) | 39.5 to 40.7 | outside the noise |
| 4,800 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.51 | 85.7 | -85.2 (−99 %) | -99.3 to -71.0 | outside the noise |
| 4,800 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Served (veh/h) | 5 | 5,669 | 5,132 | 537 (+10 %) | 423 to 650 | outside the noise |
| 4,800 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Trip delay (s) | 5 | 26.6 | 37.9 | -11.3 (−30 %) | -22.3 to -0.37 | outside the noise |
| 4,800 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 45.1 | 492 | -447 (−91 %) | -542 to -351 | outside the noise |
| 4,800 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.51 | 0.24 | 0.27 (+111 %) | -0.48 to 1.01 | within the noise |
| 4,800 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Served (veh/h) | 5 | 5,650 | 5,261 | 389 (+7 %) | 198 to 579 | outside the noise |
| 4,800 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Trip delay (s) | 5 | 26.1 | 72.2 | -46.1 (−64 %) | -60.3 to -31.8 | outside the noise |
| 4,800 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Wait, 95th percentile (s) | 5 | 45.1 | 5.02 | 40.1 (+799 %) | 39.5 to 40.7 | outside the noise |
| 4,800 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.76 | 85.7 | -84.9 (−99 %) | -98.7 to -71.1 | outside the noise |
| 4,800 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Served (veh/h) | 5 | 5,650 | 5,132 | 518 (+10 %) | 418 to 617 | outside the noise |
| 4,800 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Trip delay (s) | 5 | 26.1 | 37.9 | -11.8 (−31 %) | -21.2 to -2.44 | outside the noise |
| 4,800 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 45.1 | 492 | -447 (−91 %) | -542 to -351 | outside the noise |
| 4,800 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.76 | 0.24 | 0.52 (+217 %) | -0.40 to 1.45 | within the noise |
| 4,800 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Served (veh/h) | 5 | 5,672 | 5,261 | 411 (+8 %) | 251 to 572 | outside the noise |
| 4,800 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Trip delay (s) | 5 | 21.1 | 72.2 | -51.1 (−71 %) | -64.6 to -37.6 | outside the noise |
| 4,800 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Wait, 95th percentile (s) | 5 | 15.1 | 5.02 | 10.1 (+202 %) | 9.56 to 10.7 | outside the noise |
| 4,800 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.47 | 85.7 | -85.2 (−99 %) | -99.5 to -70.9 | outside the noise |
| 4,800 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Served (veh/h) | 5 | 5,672 | 5,132 | 540 (+11 %) | 472 to 608 | outside the noise |
| 4,800 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Trip delay (s) | 5 | 21.1 | 37.9 | -16.8 (−44 %) | -25.9 to -7.80 | outside the noise |
| 4,800 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 15.1 | 492 | -477 (−97 %) | -572 to -381 | outside the noise |
| 4,800 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.47 | 0.24 | 0.23 (+97 %) | -0.63 to 1.09 | within the noise |
| 4,800 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Served (veh/h) | 5 | 5,680 | 5,261 | 419 (+8 %) | 231 to 608 | outside the noise |
| 4,800 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Trip delay (s) | 5 | 19.6 | 72.2 | -52.6 (−73 %) | -67.4 to -37.8 | outside the noise |
| 4,800 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Wait, 95th percentile (s) | 5 | 0.70 | 5.02 | -4.32 (−86 %) | -5.12 to -3.52 | outside the noise |
| 4,800 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.66 | 85.7 | -85.0 (−99 %) | -98.7 to -71.3 | outside the noise |
| 4,800 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Served (veh/h) | 5 | 5,680 | 5,132 | 548 (+11 %) | 449 to 647 | outside the noise |
| 4,800 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Trip delay (s) | 5 | 19.6 | 37.9 | -18.3 (−48 %) | -27.1 to -9.54 | outside the noise |
| 4,800 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 0.70 | 492 | -491 (−100 %) | -586 to -396 | outside the noise |
| 4,800 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.66 | 0.24 | 0.42 (+176 %) | -0.29 to 1.13 | within the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Served (veh/h) | 5 | 5,671 | 5,261 | 410 (+8 %) | 221 to 600 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Trip delay (s) | 5 | 20.4 | 72.2 | -51.8 (−72 %) | -67.8 to -35.8 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Wait, 95th percentile (s) | 5 | 3.57 | 5.02 | -1.45 (−29 %) | -4.68 to 1.78 | within the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 1.27 | 85.7 | -84.4 (−99 %) | -97.0 to -71.8 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Served (veh/h) | 5 | 5,671 | 5,132 | 539 (+11 %) | 445 to 633 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Trip delay (s) | 5 | 20.4 | 37.9 | -17.6 (−46 %) | -26.6 to -8.46 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 3.57 | 492 | -488 (−99 %) | -585 to -392 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 1.27 | 0.24 | 1.03 (+427 %) | -1.44 to 3.50 | within the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Served (veh/h) | 5 | 5,680 | 5,261 | 419 (+8 %) | 231 to 608 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Trip delay (s) | 5 | 19.5 | 72.2 | -52.7 (−73 %) | -67.4 to -37.9 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Wait, 95th percentile (s) | 5 | 0.65 | 5.02 | -4.37 (−87 %) | -5.20 to -3.54 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.73 | 85.7 | -84.9 (−99 %) | -98.5 to -71.3 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Served (veh/h) | 5 | 5,680 | 5,132 | 548 (+11 %) | 449 to 647 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Trip delay (s) | 5 | 19.5 | 37.9 | -18.4 (−48 %) | -27.2 to -9.61 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 0.65 | 492 | -491 (−100 %) | -586 to -396 | outside the noise |
| 4,800 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.73 | 0.24 | 0.49 (+202 %) | -0.35 to 1.32 | within the noise |
| 4,800 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Served (veh/h) | 5 | 5,657 | 5,261 | 396 (+8 %) | 261 to 531 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Trip delay (s) | 5 | 30.4 | 72.2 | -41.8 (−58 %) | -56.9 to -26.8 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Wait, 95th percentile (s) | 5 | 5.71 | 5.02 | 0.69 (+14 %) | -7.88 to 9.26 | within the noise |
| 4,800 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 2.87 | 85.7 | -82.8 (−97 %) | -97.0 to -68.6 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Served (veh/h) | 5 | 5,657 | 5,132 | 525 (+10 %) | 466 to 584 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Trip delay (s) | 5 | 30.4 | 37.9 | -7.55 (−20 %) | -18.9 to 3.78 | within the noise |
| 4,800 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 5.71 | 492 | -486 (−99 %) | -579 to -393 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 2.87 | 0.24 | 2.63 (+1,093 %) | 1.11 to 4.14 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Served (veh/h) | 5 | 5,685 | 5,261 | 424 (+8 %) | 238 to 610 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Trip delay (s) | 5 | 20.0 | 72.2 | -52.2 (−72 %) | -67.2 to -37.2 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Wait, 95th percentile (s) | 5 | 0.69 | 5.02 | -4.33 (−86 %) | -5.15 to -3.51 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.69 | 85.7 | -85.0 (−99 %) | -98.6 to -71.3 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Served (veh/h) | 5 | 5,685 | 5,132 | 553 (+11 %) | 457 to 649 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Trip delay (s) | 5 | 20.0 | 37.9 | -17.9 (−47 %) | -26.8 to -9.03 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 0.69 | 492 | -491 (−100 %) | -586 to -396 | outside the noise |
| 4,800 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 0.69 | 0.24 | 0.45 (+189 %) | -0.36 to 1.27 | within the noise |
| 7,200 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Served (veh/h) | 5 | 5,887 | 5,395 | 492 (+9 %) | 255 to 729 | outside the noise |
| 7,200 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Trip delay (s) | 5 | 168 | 212 | -43.3 (−20 %) | -51.4 to -35.2 | outside the noise |
| 7,200 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Wait, 95th percentile (s) | 5 | 433 | 307 | 126 (+41 %) | -6.47 to 259 | within the noise |
| 7,200 + 900 veh/h | Before: merge and gates as they were | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 0.47 | 71.8 | -71.3 (−99 %) | -91.5 to -51.1 | outside the noise |
| 7,200 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Served (veh/h) | 5 | 5,943 | 5,395 | 548 (+10 %) | 272 to 824 | outside the noise |
| 7,200 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Trip delay (s) | 5 | 176 | 212 | -36.0 (−17 %) | -49.7 to -22.3 | outside the noise |
| 7,200 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Wait, 95th percentile (s) | 5 | 326 | 307 | 18.7 (+6 %) | -15.6 to 53.0 | within the noise |
| 7,200 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 2.13 | 71.8 | -69.6 (−97 %) | -89.1 to -50.1 | outside the noise |
| 7,200 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Served (veh/h) | 5 | 5,943 | 5,887 | 56.0 (+1 %) | -104 to 216 | within the noise |
| 7,200 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Trip delay (s) | 5 | 176 | 168 | 7.32 (+4 %) | -7.89 to 22.5 | within the noise |
| 7,200 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 326 | 433 | -108 (−25 %) | -211 to -4.23 | outside the noise |
| 7,200 + 900 veh/h | 1. Ramp vehicle keeps its place in the merge order | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 2.13 | 0.47 | 1.67 (+355 %) | 0.72 to 2.61 | outside the noise |
| 7,200 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Served (veh/h) | 5 | 6,000 | 5,395 | 605 (+11 %) | 267 to 942 | outside the noise |
| 7,200 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Trip delay (s) | 5 | 170 | 212 | -41.6 (−20 %) | -66.5 to -16.7 | outside the noise |
| 7,200 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Wait, 95th percentile (s) | 5 | 319 | 307 | 12.4 (+4 %) | -31.0 to 55.8 | within the noise |
| 7,200 + 900 veh/h | 2. + truck gap opened for a merging truck | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 2.89 | 71.8 | -68.9 (−96 %) | -87.0 to -50.8 | outside the noise |
| 7,200 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Served (veh/h) | 5 | 6,000 | 5,887 | 113 (+2 %) | -13.9 to 240 | within the noise |
| 7,200 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Trip delay (s) | 5 | 170 | 168 | 1.75 (+1 %) | -24.4 to 27.9 | within the noise |
| 7,200 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 319 | 433 | -114 (−26 %) | -206 to -21.6 | outside the noise |
| 7,200 + 900 veh/h | 2. + truck gap opened for a merging truck | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 2.89 | 0.47 | 2.42 (+515 %) | 0.19 to 4.65 | outside the noise |
| 7,200 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Served (veh/h) | 5 | 6,045 | 5,395 | 650 (+12 %) | 274 to 1,025 | outside the noise |
| 7,200 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Trip delay (s) | 5 | 166 | 212 | -45.2 (−21 %) | -77.9 to -12.6 | outside the noise |
| 7,200 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Wait, 95th percentile (s) | 5 | 313 | 307 | 6.05 (+2 %) | -42.4 to 54.5 | within the noise |
| 7,200 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 4.07 | 71.8 | -67.7 (−94 %) | -85.9 to -49.5 | outside the noise |
| 7,200 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Served (veh/h) | 5 | 6,045 | 5,887 | 158 (+3 %) | 18.0 to 297 | outside the noise |
| 7,200 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Trip delay (s) | 5 | 166 | 168 | -1.91 (−1 %) | -39.0 to 35.2 | within the noise |
| 7,200 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 313 | 433 | -120 (−28 %) | -211 to -29.6 | outside the noise |
| 7,200 + 900 veh/h | 3. + right lane kept free by ramp arrivals (was: ramp queue) | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 4.07 | 0.47 | 3.60 (+766 %) | 1.39 to 5.80 | outside the noise |
| 7,200 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Served (veh/h) | 5 | 5,953 | 5,395 | 558 (+10 %) | 234 to 881 | outside the noise |
| 7,200 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Trip delay (s) | 5 | 171 | 212 | -40.5 (−19 %) | -67.9 to -13.1 | outside the noise |
| 7,200 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Wait, 95th percentile (s) | 5 | 323 | 307 | 16.6 (+5 %) | -30.3 to 63.5 | within the noise |
| 7,200 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 2.50 | 71.8 | -69.3 (−97 %) | -89.3 to -49.2 | outside the noise |
| 7,200 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Served (veh/h) | 5 | 5,953 | 5,887 | 65.6 (+1 %) | -95.1 to 226 | within the noise |
| 7,200 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Trip delay (s) | 5 | 171 | 168 | 2.84 (+2 %) | -30.1 to 35.8 | within the noise |
| 7,200 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 323 | 433 | -110 (−25 %) | -198 to -21.1 | outside the noise |
| 7,200 + 900 veh/h | 4. + ramp gate timer 15 s (was 45 s) | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 2.50 | 0.47 | 2.03 (+434 %) | 1.08 to 2.99 | outside the noise |
| 7,200 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Served (veh/h) | 5 | 6,002 | 5,395 | 607 (+11 %) | 333 to 881 | outside the noise |
| 7,200 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Trip delay (s) | 5 | 167 | 212 | -45.1 (−21 %) | -64.6 to -25.6 | outside the noise |
| 7,200 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Wait, 95th percentile (s) | 5 | 318 | 307 | 11.6 (+4 %) | -19.0 to 42.3 | within the noise |
| 7,200 + 900 veh/h | 5. + no ramp gate timer (the new default) | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 3.85 | 71.8 | -67.9 (−95 %) | -86.5 to -49.3 | outside the noise |
| 7,200 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Served (veh/h) | 5 | 6,002 | 5,887 | 115 (+2 %) | -19.7 to 250 | within the noise |
| 7,200 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Trip delay (s) | 5 | 167 | 168 | -1.77 (−1 %) | -24.5 to 20.9 | within the noise |
| 7,200 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 318 | 433 | -115 (−26 %) | -221 to -8.88 | outside the noise |
| 7,200 + 900 veh/h | 5. + no ramp gate timer (the new default) | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 3.85 | 0.47 | 3.38 (+721 %) | 1.70 to 5.07 | outside the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Served (veh/h) | 5 | 5,895 | 5,395 | 500 (+9 %) | 248 to 752 | outside the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Trip delay (s) | 5 | 173 | 212 | -39.1 (−18 %) | -57.0 to -21.2 | outside the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Wait, 95th percentile (s) | 5 | 344 | 307 | 37.5 (+12 %) | 3.58 to 71.4 | outside the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 90 % | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 1.57 | 71.8 | -70.2 (−98 %) | -90.2 to -50.2 | outside the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Served (veh/h) | 5 | 5,895 | 5,887 | 8.00 (+0 %) | -96.9 to 113 | within the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Trip delay (s) | 5 | 173 | 168 | 4.23 (+3 %) | -16.9 to 25.3 | within the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 344 | 433 | -88.8 (−21 %) | -189 to 11.3 | within the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 90 % | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 1.57 | 0.47 | 1.10 (+233 %) | 0.06 to 2.13 | outside the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Served (veh/h) | 5 | 6,046 | 5,395 | 650 (+12 %) | 248 to 1,053 | outside the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Trip delay (s) | 5 | 170 | 212 | -41.2 (−19 %) | -74.2 to -8.25 | outside the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Wait, 95th percentile (s) | 5 | 300 | 307 | -7.29 (−2 %) | -56.4 to 41.9 | within the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 110 % | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 3.32 | 71.8 | -68.4 (−95 %) | -86.5 to -50.4 | outside the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Served (veh/h) | 5 | 6,046 | 5,887 | 158 (+3 %) | -50.8 to 368 | within the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Trip delay (s) | 5 | 170 | 168 | 2.10 (+1 %) | -36.8 to 41.0 | within the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 300 | 433 | -134 (−31 %) | -224 to -43.2 | outside the noise |
| 7,200 + 900 veh/h | 5, corridor filled to 110 % | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 3.32 | 0.47 | 2.85 (+608 %) | -0.09 to 5.80 | within the noise |
| 7,200 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Served (veh/h) | 5 | 5,806 | 5,395 | 411 (+8 %) | 149 to 674 | outside the noise |
| 7,200 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Trip delay (s) | 5 | 179 | 212 | -32.1 (−15 %) | -51.7 to -12.5 | outside the noise |
| 7,200 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Wait, 95th percentile (s) | 5 | 346 | 307 | 38.9 (+13 %) | -2.63 to 80.5 | within the noise |
| 7,200 + 900 veh/h | 5, right lane never kept free for the ramp | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 5.66 | 71.8 | -66.1 (−92 %) | -86.5 to -45.7 | outside the noise |
| 7,200 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Served (veh/h) | 5 | 5,806 | 5,887 | -80.8 (−1 %) | -147 to -14.8 | outside the noise |
| 7,200 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Trip delay (s) | 5 | 179 | 168 | 11.2 (+7 %) | -8.67 to 31.1 | within the noise |
| 7,200 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 346 | 433 | -87.4 (−20 %) | -183 to 8.21 | within the noise |
| 7,200 + 900 veh/h | 5, right lane never kept free for the ramp | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 5.66 | 0.47 | 5.19 (+1,106 %) | 2.24 to 8.14 | outside the noise |
| 7,200 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Served (veh/h) | 5 | 6,022 | 5,395 | 626 (+12 %) | 363 to 890 | outside the noise |
| 7,200 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Trip delay (s) | 5 | 162 | 212 | -49.3 (−23 %) | -73.1 to -25.4 | outside the noise |
| 7,200 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Wait, 95th percentile (s) | 5 | 312 | 307 | 4.75 (+2 %) | -32.3 to 41.8 | within the noise |
| 7,200 + 900 veh/h | 5, right lane always kept free for the ramp | Today (human drivers) | Hard brakes / 1000 veh-km | 5 | 4.18 | 71.8 | -67.6 (−94 %) | -88.0 to -47.2 | outside the noise |
| 7,200 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Served (veh/h) | 5 | 6,022 | 5,887 | 134 (+2 %) | 58.9 to 210 | outside the noise |
| 7,200 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Trip delay (s) | 5 | 162 | 168 | -5.95 (−4 %) | -31.7 to 19.8 | within the noise |
| 7,200 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Wait, 95th percentile (s) | 5 | 312 | 433 | -122 (−28 %) | -224 to -19.0 | outside the noise |
| 7,200 + 900 veh/h | 5, right lane always kept free for the ramp | Before: merge and gates as they were | Hard brakes / 1000 veh-km | 5 | 4.18 | 0.47 | 3.71 (+791 %) | 2.70 to 4.72 | outside the noise |

### Speed under pressure (section 13)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| hybrid, 2,400 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Served (veh/h) | 5 | 3,342 | 3,342 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| hybrid, 2,400 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Trip time (s) | 5 | 140 | 140 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| hybrid, 2,400 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Hard brakes / 1000 veh-km | 5 | 0.11 | 0.11 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| hybrid, 2,400 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Served (veh/h) | 15 | 3,309 | 3,315 | -6.93 (−0 %) | -16.5 to 2.67 | within the noise |
| hybrid, 2,400 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Trip time (s) | 15 | 158 | 140 | 18.4 (+13 %) | 18.0 to 18.7 | outside the noise |
| hybrid, 2,400 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.02 | 0.08 | -0.06 (−74 %) | -0.14 to 0.03 | within the noise |
| hybrid, 2,400 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Served (veh/h) | 15 | 3,305 | 3,315 | -10.4 (−0 %) | -25.1 to 4.27 | within the noise |
| hybrid, 2,400 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Trip time (s) | 15 | 193 | 140 | 52.8 (+38 %) | 52.4 to 53.2 | outside the noise |
| hybrid, 2,400 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.00 | 0.08 | -0.08 (−100 %) | -0.15 to -0.00 | outside the noise |
| hybrid, 3,600 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Served (veh/h) | 5 | 4,510 | 4,510 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| hybrid, 3,600 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Trip time (s) | 5 | 147 | 147 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| hybrid, 3,600 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Hard brakes / 1000 veh-km | 5 | 0.21 | 0.21 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| hybrid, 3,600 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Served (veh/h) | 15 | 4,485 | 4,491 | -5.60 (−0 %) | -20.6 to 9.35 | within the noise |
| hybrid, 3,600 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Trip time (s) | 15 | 164 | 147 | 17.4 (+12 %) | 17.0 to 17.9 | outside the noise |
| hybrid, 3,600 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.01 | 0.21 | -0.19 (−93 %) | -0.33 to -0.06 | outside the noise |
| hybrid, 3,600 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Served (veh/h) | 15 | 4,491 | 4,491 | 0.27 (+0 %) | -33.1 to 33.7 | within the noise |
| hybrid, 3,600 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Trip time (s) | 15 | 199 | 147 | 52.5 (+36 %) | 51.9 to 53.2 | outside the noise |
| hybrid, 3,600 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.01 | 0.21 | -0.19 (−93 %) | -0.33 to -0.06 | outside the noise |
| hybrid, 4,800 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Served (veh/h) | 5 | 5,680 | 5,680 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| hybrid, 4,800 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Trip time (s) | 5 | 157 | 157 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| hybrid, 4,800 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Hard brakes / 1000 veh-km | 5 | 0.66 | 0.66 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| hybrid, 4,800 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Served (veh/h) | 15 | 5,658 | 5,658 | 0.80 (+0 %) | -21.3 to 22.9 | within the noise |
| hybrid, 4,800 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Trip time (s) | 15 | 173 | 158 | 15.4 (+10 %) | 14.2 to 16.7 | outside the noise |
| hybrid, 4,800 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.49 | 0.96 | -0.47 (−49 %) | -0.85 to -0.10 | outside the noise |
| hybrid, 4,800 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Served (veh/h) | 15 | 5,638 | 5,658 | -19.2 (−0 %) | -61.1 to 22.7 | within the noise |
| hybrid, 4,800 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Trip time (s) | 15 | 211 | 158 | 53.4 (+34 %) | 51.2 to 55.7 | outside the noise |
| hybrid, 4,800 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.59 | 0.96 | -0.37 (−39 %) | -0.88 to 0.13 | within the noise |
| hybrid, 6,000 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Served (veh/h) | 15 | 5,949 | 5,918 | 30.4 (+1 %) | -76.6 to 137 | within the noise |
| hybrid, 6,000 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Trip time (s) | 15 | 238 | 229 | 8.44 (+4 %) | 4.16 to 12.7 | outside the noise |
| hybrid, 6,000 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 1.67 | 2.74 | -1.07 (−39 %) | -1.93 to -0.22 | outside the noise |
| hybrid, 6,000 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Served (veh/h) | 15 | 6,174 | 5,918 | 256 (+4 %) | 178 to 333 | outside the noise |
| hybrid, 6,000 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Trip time (s) | 15 | 230 | 229 | 0.91 (+0 %) | -5.77 to 7.58 | within the noise |
| hybrid, 6,000 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 2.46 | 2.74 | -0.28 (−10 %) | -1.50 to 0.94 | within the noise |
| hybrid, 6,000 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Served (veh/h) | 15 | 6,032 | 5,918 | 114 (+2 %) | 21.1 to 206 | outside the noise |
| hybrid, 6,000 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Trip time (s) | 15 | 269 | 229 | 40.2 (+18 %) | 33.3 to 47.2 | outside the noise |
| hybrid, 6,000 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 1.44 | 2.74 | -1.30 (−47 %) | -2.22 to -0.38 | outside the noise |
| hybrid, 7,200 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Served (veh/h) | 15 | 5,991 | 5,957 | 34.4 (+1 %) | -68.1 to 137 | within the noise |
| hybrid, 7,200 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Trip time (s) | 15 | 330 | 300 | 30.3 (+10 %) | 18.8 to 41.9 | outside the noise |
| hybrid, 7,200 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 1.47 | 3.68 | -2.20 (−60 %) | -3.02 to -1.39 | outside the noise |
| hybrid, 7,200 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Served (veh/h) | 15 | 6,157 | 5,957 | 200 (+3 %) | 124 to 277 | outside the noise |
| hybrid, 7,200 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Trip time (s) | 15 | 308 | 300 | 8.46 (+3 %) | 0.61 to 16.3 | outside the noise |
| hybrid, 7,200 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 2.08 | 3.68 | -1.60 (−43 %) | -2.36 to -0.83 | outside the noise |
| hybrid, 7,200 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Served (veh/h) | 15 | 6,039 | 5,957 | 82.7 (+1 %) | 1.10 to 164 | outside the noise |
| hybrid, 7,200 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Trip time (s) | 15 | 339 | 300 | 38.9 (+13 %) | 30.7 to 47.1 | outside the noise |
| hybrid, 7,200 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 1.17 | 3.68 | -2.51 (−68 %) | -3.25 to -1.76 | outside the noise |
| relative, 2,400 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Served (veh/h) | 5 | 3,337 | 3,337 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| relative, 2,400 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Trip time (s) | 5 | 139 | 139 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| relative, 2,400 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Hard brakes / 1000 veh-km | 5 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| relative, 2,400 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Served (veh/h) | 15 | 3,307 | 3,313 | -6.13 (−0 %) | -16.6 to 4.32 | within the noise |
| relative, 2,400 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Trip time (s) | 15 | 157 | 138 | 18.7 (+14 %) | 18.5 to 19.0 | outside the noise |
| relative, 2,400 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| relative, 2,400 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Served (veh/h) | 15 | 3,305 | 3,313 | -8.27 (−0 %) | -25.2 to 8.70 | within the noise |
| relative, 2,400 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Trip time (s) | 15 | 192 | 138 | 53.5 (+39 %) | 53.1 to 53.9 | outside the noise |
| relative, 2,400 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| relative, 3,600 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Served (veh/h) | 5 | 4,513 | 4,513 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| relative, 3,600 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Trip time (s) | 5 | 144 | 144 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| relative, 3,600 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Hard brakes / 1000 veh-km | 5 | 0.08 | 0.08 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| relative, 3,600 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Served (veh/h) | 15 | 4,487 | 4,488 | -0.53 (−0 %) | -13.2 to 12.1 | within the noise |
| relative, 3,600 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Trip time (s) | 15 | 162 | 144 | 18.3 (+13 %) | 17.9 to 18.7 | outside the noise |
| relative, 3,600 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.00 | 0.07 | -0.07 (−100 %) | -0.12 to -0.01 | outside the noise |
| relative, 3,600 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Served (veh/h) | 15 | 4,493 | 4,488 | 5.07 (+0 %) | -24.3 to 34.4 | within the noise |
| relative, 3,600 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Trip time (s) | 15 | 198 | 144 | 54.2 (+38 %) | 53.6 to 54.7 | outside the noise |
| relative, 3,600 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.00 | 0.07 | -0.07 (−100 %) | -0.12 to -0.01 | outside the noise |
| relative, 4,800 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Served (veh/h) | 5 | 5,690 | 5,690 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| relative, 4,800 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Trip time (s) | 5 | 150 | 150 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| relative, 4,800 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Hard brakes / 1000 veh-km | 5 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| relative, 4,800 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Served (veh/h) | 15 | 5,680 | 5,684 | -4.00 (−0 %) | -23.3 to 15.3 | within the noise |
| relative, 4,800 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Trip time (s) | 15 | 166 | 150 | 16.6 (+11 %) | 16.1 to 17.1 | outside the noise |
| relative, 4,800 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.00 | 0.06 | -0.06 (−100 %) | -0.14 to 0.01 | within the noise |
| relative, 4,800 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Served (veh/h) | 15 | 5,679 | 5,684 | -5.60 (−0 %) | -34.8 to 23.6 | within the noise |
| relative, 4,800 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Trip time (s) | 15 | 202 | 150 | 52.4 (+35 %) | 51.7 to 53.0 | outside the noise |
| relative, 4,800 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.01 | 0.06 | -0.05 (−83 %) | -0.13 to 0.03 | within the noise |
| relative, 6,000 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Served (veh/h) | 15 | 6,798 | 6,812 | -13.9 (−0 %) | -27.2 to -0.58 | outside the noise |
| relative, 6,000 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Trip time (s) | 15 | 161 | 160 | 0.43 (+0 %) | -0.26 to 1.12 | within the noise |
| relative, 6,000 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.78 | 0.65 | 0.13 (+19 %) | -0.08 to 0.34 | within the noise |
| relative, 6,000 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Served (veh/h) | 15 | 6,840 | 6,812 | 28.0 (+0 %) | -23.4 to 79.4 | within the noise |
| relative, 6,000 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Trip time (s) | 15 | 174 | 160 | 13.8 (+9 %) | 11.2 to 16.3 | outside the noise |
| relative, 6,000 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.29 | 0.65 | -0.36 (−55 %) | -0.63 to -0.09 | outside the noise |
| relative, 6,000 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Served (veh/h) | 15 | 6,755 | 6,812 | -57.3 (−1 %) | -109 to -5.68 | outside the noise |
| relative, 6,000 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Trip time (s) | 15 | 216 | 160 | 55.3 (+34 %) | 52.9 to 57.6 | outside the noise |
| relative, 6,000 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.80 | 0.65 | 0.14 (+22 %) | -0.24 to 0.52 | within the noise |
| relative, 7,200 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Served (veh/h) | 15 | 7,069 | 7,056 | 13.1 (+0 %) | -110 to 136 | within the noise |
| relative, 7,200 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Trip time (s) | 15 | 234 | 224 | 10.6 (+5 %) | 4.37 to 16.9 | outside the noise |
| relative, 7,200 + 900 veh/h | adaptive (slows down when queues build) | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 1.19 | 1.92 | -0.73 (−38 %) | -1.60 to 0.14 | within the noise |
| relative, 7,200 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Served (veh/h) | 15 | 7,234 | 7,056 | 178 (+3 %) | 28.6 to 327 | outside the noise |
| relative, 7,200 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Trip time (s) | 15 | 230 | 224 | 6.42 (+3 %) | -1.28 to 14.1 | within the noise |
| relative, 7,200 + 900 veh/h | fixed 100 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 1.42 | 1.92 | -0.50 (−26 %) | -1.34 to 0.35 | within the noise |
| relative, 7,200 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Served (veh/h) | 15 | 6,964 | 7,056 | -91.5 (−1 %) | -218 to 35.4 | within the noise |
| relative, 7,200 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Trip time (s) | 15 | 278 | 224 | 54.6 (+24 %) | 47.4 to 61.8 | outside the noise |
| relative, 7,200 + 900 veh/h | fixed 80 km/h | fixed 120 km/h | Hard brakes / 1000 veh-km | 15 | 0.80 | 1.92 | -1.12 (−58 %) | -2.04 to -0.20 | outside the noise |

### Cheaper truck rules (section 14)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 10 % trucks | Brick-wall gap behind every truck (the rule as it is) | Today (human drivers) | Served (veh/h) | 5 | 6,002 | 5,395 | 607 (+11 %) | 333 to 881 | outside the noise |
| 10 % trucks | No truck rule (relative separation) | Today (human drivers) | Served (veh/h) | 5 | 7,084 | 5,395 | 1,689 (+31 %) | 1,254 to 2,123 | outside the noise |
| 10 % trucks | No truck rule (relative separation) | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 7,084 | 6,002 | 1,082 (+18 %) | 721 to 1,443 | outside the noise |
| 10 % trucks | a. Not behind enclosed, monitored trucks: 25 % of trucks | Today (human drivers) | Served (veh/h) | 5 | 6,145 | 5,395 | 750 (+14 %) | 376 to 1,123 | outside the noise |
| 10 % trucks | a. Not behind enclosed, monitored trucks: 25 % of trucks | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 6,145 | 6,002 | 142 (+2 %) | -50.5 to 335 | within the noise |
| 10 % trucks | a. Not behind enclosed, monitored trucks: 50 % | Today (human drivers) | Served (veh/h) | 5 | 6,504 | 5,395 | 1,109 (+21 %) | 822 to 1,396 | outside the noise |
| 10 % trucks | a. Not behind enclosed, monitored trucks: 50 % | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 6,504 | 6,002 | 502 (+8 %) | 350 to 654 | outside the noise |
| 10 % trucks | a. Not behind enclosed, monitored trucks: 75 % | Today (human drivers) | Served (veh/h) | 5 | 6,754 | 5,395 | 1,359 (+25 %) | 906 to 1,812 | outside the noise |
| 10 % trucks | a. Not behind enclosed, monitored trucks: 75 % | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 6,754 | 6,002 | 752 (+13 %) | 453 to 1,051 | outside the noise |
| 10 % trucks | b. Gap for a load that stops dead + 0.5 s to confirm it | Today (human drivers) | Served (veh/h) | 5 | 5,792 | 5,395 | 397 (+7 %) | 120 to 674 | outside the noise |
| 10 % trucks | b. Gap for a load that stops dead + 0.5 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 5,792 | 6,002 | -210 (−4 %) | -358 to -62.5 | outside the noise |
| 10 % trucks | b. Gap for a load that stops dead + 1 s to confirm it | Today (human drivers) | Served (veh/h) | 15 | 5,513 | 5,364 | 149 (+3 %) | 26.2 to 272 | outside the noise |
| 10 % trucks | b. Gap for a load that stops dead + 1 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 5,551 | 6,002 | -451 (−8 %) | -644 to -258 | outside the noise |
| 10 % trucks | b. Gap for a load that slides (6 m/s²) + 0.5 s to confirm it | Today (human drivers) | Served (veh/h) | 5 | 6,613 | 5,395 | 1,218 (+23 %) | 929 to 1,506 | outside the noise |
| 10 % trucks | b. Gap for a load that slides (6 m/s²) + 0.5 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 6,613 | 6,002 | 610 (+10 %) | 472 to 749 | outside the noise |
| 10 % trucks | b. Gap for a load that slides (6 m/s²) + 1 s to confirm it | Today (human drivers) | Served (veh/h) | 5 | 6,295 | 5,395 | 900 (+17 %) | 606 to 1,194 | outside the noise |
| 10 % trucks | b. Gap for a load that slides (6 m/s²) + 1 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 6,295 | 6,002 | 293 (+5 %) | 220 to 366 | outside the noise |
| 10 % trucks | c. Trucks follow trucks closely | Today (human drivers) | Served (veh/h) | 5 | 5,928 | 5,395 | 533 (+10 %) | 284 to 781 | outside the noise |
| 10 % trucks | c. Trucks follow trucks closely | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 5,928 | 6,002 | -74.4 (−1 %) | -269 to 120 | within the noise |
| 10 % trucks | d. Truck lane | Today (human drivers) | Served (veh/h) | 5 | 4,644 | 5,395 | -751 (−14 %) | -1,062 to -440 | outside the noise |
| 10 % trucks | d. Truck lane | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 4,644 | 6,002 | -1,358 (−23 %) | -1,612 to -1,105 | outside the noise |
| 10 % trucks | c + d. Truck lane, trucks follow trucks closely | Today (human drivers) | Served (veh/h) | 5 | 4,713 | 5,395 | -682 (−13 %) | -968 to -397 | outside the noise |
| 10 % trucks | c + d. Truck lane, trucks follow trucks closely | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 4,713 | 6,002 | -1,290 (−21 %) | -1,461 to -1,119 | outside the noise |
| 20 % trucks | Brick-wall gap behind every truck (the rule as it is) | Today (human drivers) | Served (veh/h) | 5 | 4,438 | 4,895 | -457 (−9 %) | -511 to -403 | outside the noise |
| 20 % trucks | No truck rule (relative separation) | Today (human drivers) | Served (veh/h) | 5 | 5,684 | 4,895 | 789 (+16 %) | 688 to 890 | outside the noise |
| 20 % trucks | No truck rule (relative separation) | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 5,684 | 4,438 | 1,246 (+28 %) | 1,091 to 1,401 | outside the noise |
| 20 % trucks | a. Not behind enclosed, monitored trucks: 25 % of trucks | Today (human drivers) | Served (veh/h) | 5 | 4,672 | 4,895 | -223 (−5 %) | -380 to -66.3 | outside the noise |
| 20 % trucks | a. Not behind enclosed, monitored trucks: 25 % of trucks | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 4,672 | 4,438 | 234 (+5 %) | 79.1 to 388 | outside the noise |
| 20 % trucks | a. Not behind enclosed, monitored trucks: 50 % | Today (human drivers) | Served (veh/h) | 15 | 4,986 | 4,882 | 105 (+2 %) | 9.14 to 200 | outside the noise |
| 20 % trucks | a. Not behind enclosed, monitored trucks: 50 % | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 4,888 | 4,438 | 450 (+10 %) | 343 to 556 | outside the noise |
| 20 % trucks | a. Not behind enclosed, monitored trucks: 75 % | Today (human drivers) | Served (veh/h) | 5 | 5,302 | 4,895 | 406 (+8 %) | 257 to 556 | outside the noise |
| 20 % trucks | a. Not behind enclosed, monitored trucks: 75 % | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 5,302 | 4,438 | 863 (+19 %) | 761 to 965 | outside the noise |
| 20 % trucks | b. Gap for a load that stops dead + 0.5 s to confirm it | Today (human drivers) | Served (veh/h) | 5 | 4,190 | 4,895 | -705 (−14 %) | -786 to -623 | outside the noise |
| 20 % trucks | b. Gap for a load that stops dead + 0.5 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 4,190 | 4,438 | -248 (−6 %) | -336 to -160 | outside the noise |
| 20 % trucks | b. Gap for a load that stops dead + 1 s to confirm it | Today (human drivers) | Served (veh/h) | 5 | 3,921 | 4,895 | -974 (−20 %) | -1,092 to -856 | outside the noise |
| 20 % trucks | b. Gap for a load that stops dead + 1 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 3,921 | 4,438 | -518 (−12 %) | -611 to -424 | outside the noise |
| 20 % trucks | b. Gap for a load that slides (6 m/s²) + 0.5 s to confirm it | Today (human drivers) | Served (veh/h) | 5 | 5,105 | 4,895 | 210 (+4 %) | 113 to 306 | outside the noise |
| 20 % trucks | b. Gap for a load that slides (6 m/s²) + 0.5 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 5,105 | 4,438 | 666 (+15 %) | 560 to 773 | outside the noise |
| 20 % trucks | b. Gap for a load that slides (6 m/s²) + 1 s to confirm it | Today (human drivers) | Served (veh/h) | 5 | 4,784 | 4,895 | -111 (−2 %) | -176 to -46.9 | outside the noise |
| 20 % trucks | b. Gap for a load that slides (6 m/s²) + 1 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 4,784 | 4,438 | 346 (+8 %) | 277 to 415 | outside the noise |
| 20 % trucks | c. Trucks follow trucks closely | Today (human drivers) | Served (veh/h) | 5 | 4,532 | 4,895 | -363 (−7 %) | -426 to -301 | outside the noise |
| 20 % trucks | c. Trucks follow trucks closely | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 4,532 | 4,438 | 93.6 (+2 %) | 2.80 to 184 | outside the noise |
| 20 % trucks | d. Truck lane | Today (human drivers) | Served (veh/h) | 5 | 3,908 | 4,895 | -987 (−20 %) | -1,075 to -900 | outside the noise |
| 20 % trucks | d. Truck lane | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 3,908 | 4,438 | -530 (−12 %) | -614 to -447 | outside the noise |
| 20 % trucks | c + d. Truck lane, trucks follow trucks closely | Today (human drivers) | Served (veh/h) | 5 | 4,218 | 4,895 | -677 (−14 %) | -942 to -411 | outside the noise |
| 20 % trucks | c + d. Truck lane, trucks follow trucks closely | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 4,218 | 4,438 | -220 (−5 %) | -524 to 83.7 | within the noise |
| 30 % trucks | Brick-wall gap behind every truck (the rule as it is) | Today (human drivers) | Served (veh/h) | 5 | 3,630 | 4,564 | -934 (−20 %) | -1,028 to -841 | outside the noise |
| 30 % trucks | No truck rule (relative separation) | Today (human drivers) | Served (veh/h) | 15 | 4,741 | 4,587 | 154 (+3 %) | 26.5 to 282 | outside the noise |
| 30 % trucks | No truck rule (relative separation) | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 4,618 | 3,630 | 988 (+27 %) | 710 to 1,266 | outside the noise |
| 30 % trucks | a. Not behind enclosed, monitored trucks: 25 % of trucks | Today (human drivers) | Served (veh/h) | 5 | 3,823 | 4,564 | -741 (−16 %) | -831 to -651 | outside the noise |
| 30 % trucks | a. Not behind enclosed, monitored trucks: 25 % of trucks | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 3,823 | 3,630 | 194 (+5 %) | 116 to 272 | outside the noise |
| 30 % trucks | a. Not behind enclosed, monitored trucks: 50 % | Today (human drivers) | Served (veh/h) | 5 | 4,126 | 4,564 | -438 (−10 %) | -491 to -386 | outside the noise |
| 30 % trucks | a. Not behind enclosed, monitored trucks: 50 % | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 4,126 | 3,630 | 496 (+14 %) | 388 to 604 | outside the noise |
| 30 % trucks | a. Not behind enclosed, monitored trucks: 75 % | Today (human drivers) | Served (veh/h) | 5 | 4,280 | 4,564 | -284 (−6 %) | -375 to -193 | outside the noise |
| 30 % trucks | a. Not behind enclosed, monitored trucks: 75 % | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 4,280 | 3,630 | 650 (+18 %) | 566 to 735 | outside the noise |
| 30 % trucks | b. Gap for a load that stops dead + 0.5 s to confirm it | Today (human drivers) | Served (veh/h) | 5 | 3,286 | 4,564 | -1,278 (−28 %) | -1,349 to -1,208 | outside the noise |
| 30 % trucks | b. Gap for a load that stops dead + 0.5 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 3,286 | 3,630 | -344 (−9 %) | -429 to -259 | outside the noise |
| 30 % trucks | b. Gap for a load that stops dead + 1 s to confirm it | Today (human drivers) | Served (veh/h) | 5 | 3,059 | 4,564 | -1,505 (−33 %) | -1,594 to -1,415 | outside the noise |
| 30 % trucks | b. Gap for a load that stops dead + 1 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 3,059 | 3,630 | -570 (−16 %) | -646 to -494 | outside the noise |
| 30 % trucks | b. Gap for a load that slides (6 m/s²) + 0.5 s to confirm it | Today (human drivers) | Served (veh/h) | 5 | 4,286 | 4,564 | -278 (−6 %) | -407 to -150 | outside the noise |
| 30 % trucks | b. Gap for a load that slides (6 m/s²) + 0.5 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 4,286 | 3,630 | 656 (+18 %) | 458 to 854 | outside the noise |
| 30 % trucks | b. Gap for a load that slides (6 m/s²) + 1 s to confirm it | Today (human drivers) | Served (veh/h) | 5 | 3,963 | 4,564 | -601 (−13 %) | -687 to -514 | outside the noise |
| 30 % trucks | b. Gap for a load that slides (6 m/s²) + 1 s to confirm it | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 3,963 | 3,630 | 334 (+9 %) | 283 to 384 | outside the noise |
| 30 % trucks | c. Trucks follow trucks closely | Today (human drivers) | Served (veh/h) | 5 | 3,774 | 4,564 | -790 (−17 %) | -911 to -669 | outside the noise |
| 30 % trucks | c. Trucks follow trucks closely | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 3,774 | 3,630 | 145 (+4 %) | 89.3 to 200 | outside the noise |
| 30 % trucks | d. Truck lane | Today (human drivers) | Served (veh/h) | 5 | 3,058 | 4,564 | -1,506 (−33 %) | -1,675 to -1,338 | outside the noise |
| 30 % trucks | d. Truck lane | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 3,058 | 3,630 | -572 (−16 %) | -650 to -494 | outside the noise |
| 30 % trucks | c + d. Truck lane, trucks follow trucks closely | Today (human drivers) | Served (veh/h) | 5 | 3,429 | 4,564 | -1,135 (−25 %) | -1,220 to -1,050 | outside the noise |
| 30 % trucks | c + d. Truck lane, trucks follow trucks closely | Brick-wall gap behind every truck (the rule as it is) | Served (veh/h) | 5 | 3,429 | 3,630 | -201 (−6 %) | -292 to -110 | outside the noise |

### Sensitivity of the SDR assumptions (section 15)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| capacity, 7,200 + 900 veh/h | As assumed | Today (human drivers) | Served (veh/h) | 15 | 5,957 | 5,364 | 593 (+11 %) | 468 to 718 | outside the noise |
| capacity, 7,200 + 900 veh/h | Car braking (8 m/s²): 6 m/s² | Today (human drivers) | Served (veh/h) | 15 | 5,698 | 5,364 | 335 (+6 %) | 185 to 485 | outside the noise |
| capacity, 7,200 + 900 veh/h | Car braking (8 m/s²): 6 m/s² | As assumed | Served (veh/h) | 15 | 5,698 | 5,957 | -258 (−4 %) | -329 to -187 | outside the noise |
| brick-wall stop | Car braking (8 m/s²): 6 m/s² | As assumed | Collisions per run | 30 | 1.37 | 0.83 | 0.53 (+64 %) | 0.02 to 1.05 | outside the noise |
| load falls off a truck, road confirms in 0.5 s | Car braking (8 m/s²): 6 m/s² | As assumed | Collisions per run | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| capacity, 7,200 + 900 veh/h | Car braking (8 m/s²): 7 m/s² | Today (human drivers) | Served (veh/h) | 15 | 5,880 | 5,364 | 516 (+10 %) | 358 to 674 | outside the noise |
| capacity, 7,200 + 900 veh/h | Car braking (8 m/s²): 7 m/s² | As assumed | Served (veh/h) | 15 | 5,880 | 5,957 | -76.8 (−1 %) | -143 to -10.5 | outside the noise |
| brick-wall stop | Car braking (8 m/s²): 7 m/s² | As assumed | Collisions per run | 30 | 1.00 | 0.83 | 0.17 (+20 %) | -0.26 to 0.59 | within the noise |
| load falls off a truck, road confirms in 0.5 s | Car braking (8 m/s²): 7 m/s² | As assumed | Collisions per run | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| capacity, 7,200 + 900 veh/h | Car braking (8 m/s²): 9 m/s² | Today (human drivers) | Served (veh/h) | 15 | 6,142 | 5,364 | 778 (+15 %) | 660 to 897 | outside the noise |
| capacity, 7,200 + 900 veh/h | Car braking (8 m/s²): 9 m/s² | As assumed | Served (veh/h) | 15 | 6,142 | 5,957 | 186 (+3 %) | 136 to 235 | outside the noise |
| brick-wall stop | Car braking (8 m/s²): 9 m/s² | As assumed | Collisions per run | 30 | 0.67 | 0.83 | -0.17 (−20 %) | -0.56 to 0.23 | within the noise |
| load falls off a truck, road confirms in 0.5 s | Car braking (8 m/s²): 9 m/s² | As assumed | Collisions per run | 30 | 0.07 | 0.00 | 0.07 | -0.03 to 0.16 | within the noise |
| capacity, 7,200 + 900 veh/h | Car braking (8 m/s²): 10 m/s² | Today (human drivers) | Served (veh/h) | 5 | 6,330 | 5,395 | 935 (+17 %) | 702 to 1,168 | outside the noise |
| capacity, 7,200 + 900 veh/h | Car braking (8 m/s²): 10 m/s² | As assumed | Served (veh/h) | 5 | 6,330 | 6,002 | 328 (+5 %) | 175 to 481 | outside the noise |
| brick-wall stop | Car braking (8 m/s²): 10 m/s² | As assumed | Collisions per run | 30 | 0.63 | 0.83 | -0.20 (−24 %) | -0.57 to 0.17 | within the noise |
| load falls off a truck, road confirms in 0.5 s | Car braking (8 m/s²): 10 m/s² | As assumed | Collisions per run | 30 | 0.57 | 0.00 | 0.57 | 0.38 to 0.75 | outside the noise |
| capacity, 7,200 + 900 veh/h | Actuator delay (0.2 s): 0.1 s | Today (human drivers) | Served (veh/h) | 5 | 6,431 | 5,395 | 1,036 (+19 %) | 800 to 1,272 | outside the noise |
| capacity, 7,200 + 900 veh/h | Actuator delay (0.2 s): 0.1 s | As assumed | Served (veh/h) | 5 | 6,431 | 6,002 | 429 (+7 %) | 309 to 549 | outside the noise |
| brick-wall stop | Actuator delay (0.2 s): 0.1 s | As assumed | Collisions per run | 30 | 0.60 | 0.83 | -0.23 (−28 %) | -0.54 to 0.07 | within the noise |
| load falls off a truck, road confirms in 0.5 s | Actuator delay (0.2 s): 0.1 s | As assumed | Collisions per run | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| capacity, 7,200 + 900 veh/h | Actuator delay (0.2 s): 0.3 s | Today (human drivers) | Served (veh/h) | 15 | 5,605 | 5,364 | 242 (+5 %) | 119 to 365 | outside the noise |
| capacity, 7,200 + 900 veh/h | Actuator delay (0.2 s): 0.3 s | As assumed | Served (veh/h) | 15 | 5,605 | 5,957 | -351 (−6 %) | -410 to -292 | outside the noise |
| brick-wall stop | Actuator delay (0.2 s): 0.3 s | As assumed | Collisions per run | 30 | 0.83 | 0.83 | 0.00 (+0 %) | -0.42 to 0.42 | within the noise |
| load falls off a truck, road confirms in 0.5 s | Actuator delay (0.2 s): 0.3 s | As assumed | Collisions per run | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| capacity, 7,200 + 900 veh/h | Actuator delay (0.2 s): 0.5 s | Today (human drivers) | Served (veh/h) | 5 | 4,862 | 5,395 | -533 (−10 %) | -853 to -213 | outside the noise |
| capacity, 7,200 + 900 veh/h | Actuator delay (0.2 s): 0.5 s | As assumed | Served (veh/h) | 5 | 4,862 | 6,002 | -1,140 (−19 %) | -1,327 to -953 | outside the noise |
| brick-wall stop | Actuator delay (0.2 s): 0.5 s | As assumed | Collisions per run | 30 | 1.00 | 0.83 | 0.17 (+20 %) | -0.17 to 0.51 | within the noise |
| load falls off a truck, road confirms in 0.5 s | Actuator delay (0.2 s): 0.5 s | As assumed | Collisions per run | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| capacity, 7,200 + 900 veh/h | Control cycle (0.1 s): 0.05 s | Today (human drivers) | Served (veh/h) | 5 | 6,160 | 5,395 | 765 (+14 %) | 446 to 1,084 | outside the noise |
| capacity, 7,200 + 900 veh/h | Control cycle (0.1 s): 0.05 s | As assumed | Served (veh/h) | 5 | 6,160 | 6,002 | 158 (+3 %) | 1.29 to 314 | outside the noise |
| brick-wall stop | Control cycle (0.1 s): 0.05 s | As assumed | Collisions per run | 30 | 0.83 | 0.83 | 0.00 (+0 %) | -0.39 to 0.39 | within the noise |
| load falls off a truck, road confirms in 0.5 s | Control cycle (0.1 s): 0.05 s | As assumed | Collisions per run | 30 | 0.53 | 0.00 | 0.53 | 0.34 to 0.72 | outside the noise |
| capacity, 7,200 + 900 veh/h | Control cycle (0.1 s): 0.2 s | Today (human drivers) | Served (veh/h) | 15 | 5,567 | 5,364 | 204 (+4 %) | 48.0 to 359 | outside the noise |
| capacity, 7,200 + 900 veh/h | Control cycle (0.1 s): 0.2 s | As assumed | Served (veh/h) | 15 | 5,567 | 5,957 | -389 (−7 %) | -440 to -338 | outside the noise |
| brick-wall stop | Control cycle (0.1 s): 0.2 s | As assumed | Collisions per run | 30 | 0.50 | 0.83 | -0.33 (−40 %) | -0.68 to 0.01 | within the noise |
| load falls off a truck, road confirms in 0.5 s | Control cycle (0.1 s): 0.2 s | As assumed | Collisions per run | 30 | 0.03 | 0.00 | 0.03 | -0.03 to 0.10 | within the noise |
| capacity, 7,200 + 900 veh/h | Control cycle (0.1 s): 0.5 s | Today (human drivers) | Served (veh/h) | 5 | 4,766 | 5,395 | -630 (−12 %) | -864 to -395 | outside the noise |
| capacity, 7,200 + 900 veh/h | Control cycle (0.1 s): 0.5 s | As assumed | Served (veh/h) | 5 | 4,766 | 6,002 | -1,237 (−21 %) | -1,432 to -1,042 | outside the noise |
| brick-wall stop | Control cycle (0.1 s): 0.5 s | As assumed | Collisions per run | 30 | 0.37 | 0.83 | -0.47 (−56 %) | -0.84 to -0.09 | outside the noise |
| load falls off a truck, road confirms in 0.5 s | Control cycle (0.1 s): 0.5 s | As assumed | Collisions per run | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| capacity, 7,200 + 900 veh/h | Radio latency (50 ms): 20 ms | Today (human drivers) | Served (veh/h) | 15 | 6,094 | 5,364 | 731 (+14 %) | 568 to 893 | outside the noise |
| capacity, 7,200 + 900 veh/h | Radio latency (50 ms): 20 ms | As assumed | Served (veh/h) | 15 | 6,094 | 5,957 | 138 (+2 %) | 61.9 to 214 | outside the noise |
| brick-wall stop | Radio latency (50 ms): 20 ms | As assumed | Collisions per run | 30 | 0.60 | 0.83 | -0.23 (−28 %) | -0.51 to 0.04 | within the noise |
| load falls off a truck, road confirms in 0.5 s | Radio latency (50 ms): 20 ms | As assumed | Collisions per run | 30 | 0.57 | 0.00 | 0.57 | 0.38 to 0.75 | outside the noise |
| capacity, 7,200 + 900 veh/h | Radio latency (50 ms): 100 ms | Today (human drivers) | Served (veh/h) | 5 | 5,781 | 5,395 | 386 (+7 %) | 181 to 591 | outside the noise |
| capacity, 7,200 + 900 veh/h | Radio latency (50 ms): 100 ms | As assumed | Served (veh/h) | 5 | 5,781 | 6,002 | -222 (−4 %) | -350 to -93.3 | outside the noise |
| brick-wall stop | Radio latency (50 ms): 100 ms | As assumed | Collisions per run | 30 | 0.57 | 0.83 | -0.27 (−32 %) | -0.61 to 0.07 | within the noise |
| load falls off a truck, road confirms in 0.5 s | Radio latency (50 ms): 100 ms | As assumed | Collisions per run | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| capacity, 7,200 + 900 veh/h | Radio latency (50 ms): 200 ms | Today (human drivers) | Served (veh/h) | 15 | 5,413 | 5,364 | 49.1 (+1 %) | -75.0 to 173 | within the noise |
| capacity, 7,200 + 900 veh/h | Radio latency (50 ms): 200 ms | As assumed | Served (veh/h) | 15 | 5,413 | 5,957 | -544 (−9 %) | -598 to -490 | outside the noise |
| brick-wall stop | Radio latency (50 ms): 200 ms | As assumed | Collisions per run | 30 | 0.60 | 0.83 | -0.23 (−28 %) | -0.57 to 0.10 | within the noise |
| load falls off a truck, road confirms in 0.5 s | Radio latency (50 ms): 200 ms | As assumed | Collisions per run | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| capacity, 7,200 + 900 veh/h | Safety margin (2.0 + 0.5 m): 1.0 + 0.5 m | Today (human drivers) | Served (veh/h) | 15 | 6,229 | 5,364 | 865 (+16 %) | 718 to 1,012 | outside the noise |
| capacity, 7,200 + 900 veh/h | Safety margin (2.0 + 0.5 m): 1.0 + 0.5 m | As assumed | Served (veh/h) | 15 | 6,229 | 5,957 | 272 (+5 %) | 193 to 351 | outside the noise |
| brick-wall stop | Safety margin (2.0 + 0.5 m): 1.0 + 0.5 m | As assumed | Collisions per run | 30 | 0.67 | 0.83 | -0.17 (−20 %) | -0.41 to 0.08 | within the noise |
| load falls off a truck, road confirms in 0.5 s | Safety margin (2.0 + 0.5 m): 1.0 + 0.5 m | As assumed | Collisions per run | 30 | 0.67 | 0.00 | 0.67 | 0.49 to 0.85 | outside the noise |
| capacity, 7,200 + 900 veh/h | Safety margin (2.0 + 0.5 m): 3.0 + 0.5 m | Today (human drivers) | Served (veh/h) | 5 | 5,806 | 5,395 | 411 (+8 %) | 116 to 706 | outside the noise |
| capacity, 7,200 + 900 veh/h | Safety margin (2.0 + 0.5 m): 3.0 + 0.5 m | As assumed | Served (veh/h) | 5 | 5,806 | 6,002 | -196 (−3 %) | -289 to -103 | outside the noise |
| brick-wall stop | Safety margin (2.0 + 0.5 m): 3.0 + 0.5 m | As assumed | Collisions per run | 30 | 0.70 | 0.83 | -0.13 (−16 %) | -0.37 to 0.10 | within the noise |
| load falls off a truck, road confirms in 0.5 s | Safety margin (2.0 + 0.5 m): 3.0 + 0.5 m | As assumed | Collisions per run | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| capacity, 7,200 + 900 veh/h | Safety margin (2.0 + 0.5 m): 5.0 + 0.5 m | Today (human drivers) | Served (veh/h) | 15 | 5,489 | 5,364 | 125 (+2 %) | -12.5 to 263 | within the noise |
| capacity, 7,200 + 900 veh/h | Safety margin (2.0 + 0.5 m): 5.0 + 0.5 m | As assumed | Served (veh/h) | 15 | 5,489 | 5,957 | -467 (−8 %) | -531 to -404 | outside the noise |
| brick-wall stop | Safety margin (2.0 + 0.5 m): 5.0 + 0.5 m | As assumed | Collisions per run | 30 | 0.60 | 0.83 | -0.23 (−28 %) | -0.58 to 0.12 | within the noise |
| load falls off a truck, road confirms in 0.5 s | Safety margin (2.0 + 0.5 m): 5.0 + 0.5 m | As assumed | Collisions per run | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| capacity, 7,200 + 900 veh/h | Guardian range (120 m): 60 m | Today (human drivers) | Served (veh/h) | 15 | 5,871 | 5,364 | 507 (+9 %) | 362 to 652 | outside the noise |
| capacity, 7,200 + 900 veh/h | Guardian range (120 m): 60 m | As assumed | Served (veh/h) | 15 | 5,871 | 5,957 | -85.6 (−1 %) | -140 to -31.6 | outside the noise |
| brick-wall stop | Guardian range (120 m): 60 m | As assumed | Collisions per run | 30 | 0.63 | 0.83 | -0.20 (−24 %) | -0.55 to 0.15 | within the noise |
| load falls off a truck, road confirms in 0.5 s | Guardian range (120 m): 60 m | As assumed | Collisions per run | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| capacity, 7,200 + 900 veh/h | Guardian range (120 m): 80 m | Today (human drivers) | Served (veh/h) | 15 | 5,936 | 5,364 | 572 (+11 %) | 455 to 690 | outside the noise |
| capacity, 7,200 + 900 veh/h | Guardian range (120 m): 80 m | As assumed | Served (veh/h) | 15 | 5,936 | 5,957 | -20.5 (−0 %) | -76.6 to 35.6 | within the noise |
| brick-wall stop | Guardian range (120 m): 80 m | As assumed | Collisions per run | 30 | 0.83 | 0.83 | 0.00 (+0 %) | -0.42 to 0.42 | within the noise |
| load falls off a truck, road confirms in 0.5 s | Guardian range (120 m): 80 m | As assumed | Collisions per run | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| capacity, 7,200 + 900 veh/h | Guardian range (120 m): 160 m | Today (human drivers) | Served (veh/h) | 5 | 6,002 | 5,395 | 607 (+11 %) | 333 to 881 | outside the noise |
| capacity, 7,200 + 900 veh/h | Guardian range (120 m): 160 m | As assumed | Served (veh/h) | 5 | 6,002 | 6,002 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| brick-wall stop | Guardian range (120 m): 160 m | As assumed | Collisions per run | 30 | 0.83 | 0.83 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| load falls off a truck, road confirms in 0.5 s | Guardian range (120 m): 160 m | As assumed | Collisions per run | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |

### A policy for ice (section 16)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| ice, capacity | SDR absolute | Today (human drivers) | Served (veh/h) | 5 | 1,326 | 4,226 | -2,899 (−69 %) | -3,004 to -2,794 | outside the noise |
| ice, brick-wall stop | SDR absolute | Today (human drivers) | Collisions per run | 30 | 0.00 | 3.37 | -3.37 (−100 %) | -4.25 to -2.48 | outside the noise |
| black ice, brick-wall stop | SDR absolute | Today (human drivers) | Collisions per run | 30 | 0.00 | 3.93 | -3.93 (−100 %) | -4.95 to -2.92 | outside the noise |
| ice, capacity | SDR absolute | SDR hybrid (rules as they are) | Served (veh/h) | 5 | 1,326 | 3,650 | -2,324 (−64 %) | -2,419 to -2,229 | outside the noise |
| ice, brick-wall stop | SDR absolute | SDR hybrid (rules as they are) | Collisions per run | 30 | 0.00 | 1.40 | -1.40 (−100 %) | -2.00 to -0.80 | outside the noise |
| ice, capacity | SDR relative | Today (human drivers) | Served (veh/h) | 5 | 4,842 | 4,226 | 617 (+15 %) | 544 to 690 | outside the noise |
| ice, brick-wall stop | SDR relative | Today (human drivers) | Collisions per run | 30 | 1.53 | 3.37 | -1.83 (−54 %) | -2.87 to -0.80 | outside the noise |
| black ice, brick-wall stop | SDR relative | Today (human drivers) | Collisions per run | 30 | 2.07 | 3.93 | -1.87 (−47 %) | -2.96 to -0.78 | outside the noise |
| ice, capacity | SDR relative | SDR hybrid (rules as they are) | Served (veh/h) | 5 | 4,842 | 3,650 | 1,192 (+33 %) | 1,127 to 1,257 | outside the noise |
| ice, brick-wall stop | SDR relative | SDR hybrid (rules as they are) | Collisions per run | 30 | 1.53 | 1.40 | 0.13 (+10 %) | -0.54 to 0.81 | within the noise |
| ice, capacity | SDR hybrid (rules as they are) | Today (human drivers) | Served (veh/h) | 5 | 3,650 | 4,226 | -575 (−14 %) | -632 to -519 | outside the noise |
| ice, brick-wall stop | SDR hybrid (rules as they are) | Today (human drivers) | Collisions per run | 30 | 1.40 | 3.37 | -1.97 (−58 %) | -3.18 to -0.76 | outside the noise |
| black ice, brick-wall stop | SDR hybrid (rules as they are) | Today (human drivers) | Collisions per run | 30 | 1.30 | 3.93 | -2.63 (−67 %) | -3.77 to -1.49 | outside the noise |
| ice, capacity | Hybrid, speed cap 70 km/h | Today (human drivers) | Served (veh/h) | 5 | 4,725 | 4,226 | 499 (+12 %) | 404 to 594 | outside the noise |
| ice, brick-wall stop | Hybrid, speed cap 70 km/h | Today (human drivers) | Collisions per run | 30 | 1.30 | 3.37 | -2.07 (−61 %) | -3.06 to -1.07 | outside the noise |
| black ice, brick-wall stop | Hybrid, speed cap 70 km/h | Today (human drivers) | Collisions per run | 30 | 2.00 | 3.93 | -1.93 (−49 %) | -3.04 to -0.83 | outside the noise |
| ice, capacity | Hybrid, speed cap 70 km/h | SDR hybrid (rules as they are) | Served (veh/h) | 5 | 4,725 | 3,650 | 1,074 (+29 %) | 952 to 1,197 | outside the noise |
| ice, brick-wall stop | Hybrid, speed cap 70 km/h | SDR hybrid (rules as they are) | Collisions per run | 30 | 1.30 | 1.40 | -0.10 (−7 %) | -0.89 to 0.69 | within the noise |
| ice, capacity | Hybrid, speed cap 60 km/h | Today (human drivers) | Served (veh/h) | 5 | 4,836 | 4,226 | 610 (+14 %) | 473 to 747 | outside the noise |
| ice, brick-wall stop | Hybrid, speed cap 60 km/h | Today (human drivers) | Collisions per run | 30 | 1.03 | 3.37 | -2.33 (−69 %) | -3.22 to -1.45 | outside the noise |
| black ice, brick-wall stop | Hybrid, speed cap 60 km/h | Today (human drivers) | Collisions per run | 30 | 1.60 | 3.93 | -2.33 (−59 %) | -3.37 to -1.29 | outside the noise |
| ice, capacity | Hybrid, speed cap 60 km/h | SDR hybrid (rules as they are) | Served (veh/h) | 5 | 4,836 | 3,650 | 1,186 (+32 %) | 1,020 to 1,351 | outside the noise |
| ice, brick-wall stop | Hybrid, speed cap 60 km/h | SDR hybrid (rules as they are) | Collisions per run | 30 | 1.03 | 1.40 | -0.37 (−26 %) | -1.03 to 0.29 | within the noise |
| ice, capacity | Hybrid, plans with 80 % of the grip | Today (human drivers) | Served (veh/h) | 5 | 2,175 | 4,226 | -2,050 (−49 %) | -2,145 to -1,956 | outside the noise |
| ice, brick-wall stop | Hybrid, plans with 80 % of the grip | Today (human drivers) | Collisions per run | 30 | 0.53 | 3.37 | -2.83 (−84 %) | -3.74 to -1.92 | outside the noise |
| black ice, brick-wall stop | Hybrid, plans with 80 % of the grip | Today (human drivers) | Collisions per run | 30 | 0.43 | 3.93 | -3.50 (−89 %) | -4.60 to -2.40 | outside the noise |
| ice, capacity | Hybrid, plans with 80 % of the grip | SDR hybrid (rules as they are) | Served (veh/h) | 5 | 2,175 | 3,650 | -1,475 (−40 %) | -1,546 to -1,404 | outside the noise |
| ice, brick-wall stop | Hybrid, plans with 80 % of the grip | SDR hybrid (rules as they are) | Collisions per run | 30 | 0.53 | 1.40 | -0.87 (−62 %) | -1.57 to -0.17 | outside the noise |
| ice, capacity | Hybrid, plans with 60 % of the grip | Today (human drivers) | Served (veh/h) | 5 | 1,346 | 4,226 | -2,880 (−68 %) | -2,968 to -2,792 | outside the noise |
| ice, brick-wall stop | Hybrid, plans with 60 % of the grip | Today (human drivers) | Collisions per run | 30 | 0.73 | 3.37 | -2.63 (−78 %) | -3.57 to -1.70 | outside the noise |
| black ice, brick-wall stop | Hybrid, plans with 60 % of the grip | Today (human drivers) | Collisions per run | 30 | 0.47 | 3.93 | -3.47 (−88 %) | -4.43 to -2.51 | outside the noise |
| ice, capacity | Hybrid, plans with 60 % of the grip | SDR hybrid (rules as they are) | Served (veh/h) | 5 | 1,346 | 3,650 | -2,305 (−63 %) | -2,384 to -2,226 | outside the noise |
| ice, brick-wall stop | Hybrid, plans with 60 % of the grip | SDR hybrid (rules as they are) | Collisions per run | 30 | 0.73 | 1.40 | -0.67 (−48 %) | -1.21 to -0.13 | outside the noise |
| ice, capacity | Relative, speed cap 60 km/h | Today (human drivers) | Served (veh/h) | 5 | 6,044 | 4,226 | 1,818 (+43 %) | 1,750 to 1,887 | outside the noise |
| ice, brick-wall stop | Relative, speed cap 60 km/h | Today (human drivers) | Collisions per run | 30 | 0.97 | 3.37 | -2.40 (−71 %) | -3.34 to -1.46 | outside the noise |
| black ice, brick-wall stop | Relative, speed cap 60 km/h | Today (human drivers) | Collisions per run | 30 | 1.27 | 3.93 | -2.67 (−68 %) | -3.72 to -1.62 | outside the noise |
| ice, capacity | Relative, speed cap 60 km/h | SDR hybrid (rules as they are) | Served (veh/h) | 5 | 6,044 | 3,650 | 2,394 (+66 %) | 2,299 to 2,489 | outside the noise |
| ice, brick-wall stop | Relative, speed cap 60 km/h | SDR hybrid (rules as they are) | Collisions per run | 30 | 0.97 | 1.40 | -0.43 (−31 %) | -1.05 to 0.18 | within the noise |
| ice, capacity | Relative, plans with 60 % of the grip | Today (human drivers) | Served (veh/h) | 5 | 1,470 | 4,226 | -2,755 (−65 %) | -2,835 to -2,675 | outside the noise |
| ice, brick-wall stop | Relative, plans with 60 % of the grip | Today (human drivers) | Collisions per run | 30 | 0.80 | 3.37 | -2.57 (−76 %) | -3.46 to -1.67 | outside the noise |
| black ice, brick-wall stop | Relative, plans with 60 % of the grip | Today (human drivers) | Collisions per run | 30 | 0.83 | 3.93 | -3.10 (−79 %) | -4.14 to -2.06 | outside the noise |
| ice, capacity | Relative, plans with 60 % of the grip | SDR hybrid (rules as they are) | Served (veh/h) | 5 | 1,470 | 3,650 | -2,180 (−60 %) | -2,256 to -2,104 | outside the noise |
| ice, brick-wall stop | Relative, plans with 60 % of the grip | SDR hybrid (rules as they are) | Collisions per run | 30 | 0.80 | 1.40 | -0.60 (−43 %) | -1.32 to 0.12 | within the noise |

### The pile-up on today's road (section 17)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 3,000 + 600 veh/h, surprise delay 0.3 s | SDR, hybrid separation | Today (human drivers) | Collisions per run | 30 | 0.50 | 1.37 | -0.87 (−63 %) | -1.61 to -0.13 | outside the noise |
| 3,000 + 600 veh/h, surprise delay 0.5 s | SDR, hybrid separation | Today (human drivers) | Collisions per run | 30 | 0.50 | 1.57 | -1.07 (−68 %) | -1.86 to -0.27 | outside the noise |
| 3,000 + 600 veh/h, surprise delay 0.7 s | SDR, hybrid separation | Today (human drivers) | Collisions per run | 30 | 0.50 | 1.73 | -1.23 (−71 %) | -2.09 to -0.38 | outside the noise |
| 3,000 + 600 veh/h, surprise delay 1.0 s | SDR, hybrid separation | Today (human drivers) | Collisions per run | 30 | 0.50 | 2.37 | -1.87 (−79 %) | -2.97 to -0.77 | outside the noise |
| 4,200 + 600 veh/h, surprise delay 0.3 s | SDR, hybrid separation | Today (human drivers) | Collisions per run | 10 | 0.50 | 2.40 | -1.90 (−79 %) | -3.27 to -0.53 | outside the noise |
| 4,200 + 600 veh/h, surprise delay 0.5 s | SDR, hybrid separation | Today (human drivers) | Collisions per run | 10 | 0.50 | 2.80 | -2.30 (−82 %) | -3.73 to -0.87 | outside the noise |
| 4,200 + 600 veh/h, surprise delay 0.7 s | SDR, hybrid separation | Today (human drivers) | Collisions per run | 10 | 0.50 | 3.30 | -2.80 (−85 %) | -4.34 to -1.26 | outside the noise |
| 4,200 + 600 veh/h, surprise delay 1.0 s | SDR, hybrid separation | Today (human drivers) | Collisions per run | 10 | 0.50 | 5.50 | -5.00 (−91 %) | -8.41 to -1.59 | outside the noise |

### Break-even with a faster today's road (section 18)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| today's road at 1.4 s headway | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 5 | 5,989 | 5,275 | 714 (+14 %) | 591 to 836 | outside the noise |
| today's road at 1.4 s headway | SDR, relative separation | Today (human drivers) | Served (veh/h) | 5 | 7,166 | 5,275 | 1,891 (+36 %) | 1,622 to 2,161 | outside the noise |
| today's road at 1.2 s headway | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 5 | 5,989 | 5,506 | 483 (+9 %) | 158 to 809 | outside the noise |
| today's road at 1.2 s headway | SDR, relative separation | Today (human drivers) | Served (veh/h) | 5 | 7,166 | 5,506 | 1,661 (+30 %) | 1,162 to 2,160 | outside the noise |
| today's road at 1.1 s headway | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 15 | 5,970 | 5,775 | 194 (+3 %) | 30.0 to 359 | outside the noise |
| today's road at 1.1 s headway | SDR, relative separation | Today (human drivers) | Served (veh/h) | 5 | 7,166 | 5,612 | 1,554 (+28 %) | 941 to 2,167 | outside the noise |
| today's road at 1.0 s headway | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 15 | 5,970 | 5,879 | 90.7 (+2 %) | -102 to 283 | within the noise |
| today's road at 1.0 s headway | SDR, relative separation | Today (human drivers) | Served (veh/h) | 5 | 7,166 | 5,782 | 1,384 (+24 %) | 829 to 1,939 | outside the noise |
| today's road at 0.9 s headway | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 5 | 5,989 | 5,367 | 622 (+12 %) | 93.4 to 1,150 | outside the noise |
| today's road at 0.9 s headway | SDR, relative separation | Today (human drivers) | Served (veh/h) | 5 | 7,166 | 5,367 | 1,799 (+34 %) | 1,299 to 2,300 | outside the noise |

### Road layouts (section 19)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 3 lanes, 300 m acceleration lane, 5 km (standard): capacity | SDR hybrid | Today (human drivers) | Served (veh/h) | 5 | 6,002 | 5,395 | 607 (+11 %) | 333 to 881 | outside the noise |
| 3 lanes, 300 m acceleration lane, 5 km (standard): 4,800 + 900 veh/h | SDR hybrid | Today (human drivers) | Served (veh/h) | 5 | 5,680 | 5,261 | 419 (+8 %) | 231 to 608 | outside the noise |
| 3 lanes, 300 m acceleration lane, 5 km (standard): 4,800 + 900 veh/h | SDR hybrid | Today (human drivers) | Trip delay (s) | 5 | 19.6 | 72.2 | -52.6 (−73 %) | -67.4 to -37.8 | outside the noise |
| 3 lanes, 300 m acceleration lane, 5 km (standard): capacity | SDR hybrid, sensors down at the merge | SDR hybrid | Served (veh/h) | 5 | 3,890 | 6,002 | -2,112 (−35 %) | -2,280 to -1,944 | outside the noise |
| 3 lanes, 300 m acceleration lane, 5 km (standard): brick-wall stop | SDR hybrid | Today (human drivers) | Collisions per run | 30 | 0.83 | 2.70 | -1.87 (−69 %) | -2.77 to -0.96 | outside the noise |
| 2 lanes: capacity | SDR hybrid | Today (human drivers) | Served (veh/h) | 5 | 4,414 | 3,511 | 902 (+26 %) | 818 to 987 | outside the noise |
| 2 lanes: 3,200 + 900 veh/h | SDR hybrid | Today (human drivers) | Served (veh/h) | 5 | 4,145 | 3,487 | 658 (+19 %) | 515 to 801 | outside the noise |
| 2 lanes: 3,200 + 900 veh/h | SDR hybrid | Today (human drivers) | Trip delay (s) | 5 | 28.2 | 107 | -78.7 (−74 %) | -89.4 to -68.1 | outside the noise |
| 2 lanes: capacity | SDR hybrid, sensors down at the merge | SDR hybrid | Served (veh/h) | 5 | 2,931 | 4,414 | -1,482 (−34 %) | -1,596 to -1,369 | outside the noise |
| 2 lanes: brick-wall stop | SDR hybrid | Today (human drivers) | Collisions per run | 30 | 0.57 | 2.13 | -1.57 (−73 %) | -2.35 to -0.78 | outside the noise |
| 4 lanes: capacity | SDR hybrid | Today (human drivers) | Served (veh/h) | 5 | 7,321 | 7,122 | 199 (+3 %) | 13.1 to 385 | outside the noise |
| 4 lanes: 6,400 + 900 veh/h | SDR hybrid | Today (human drivers) | Served (veh/h) | 15 | 7,052 | 6,789 | 262 (+4 %) | 159 to 365 | outside the noise |
| 4 lanes: 6,400 + 900 veh/h | SDR hybrid | Today (human drivers) | Trip delay (s) | 15 | 31.1 | 58.3 | -27.2 (−47 %) | -32.9 to -21.5 | outside the noise |
| 4 lanes: capacity | SDR hybrid, sensors down at the merge | SDR hybrid | Served (veh/h) | 5 | 4,667 | 7,321 | -2,654 (−36 %) | -2,715 to -2,592 | outside the noise |
| 4 lanes: brick-wall stop | SDR hybrid | Today (human drivers) | Collisions per run | 30 | 0.90 | 3.83 | -2.93 (−77 %) | -4.24 to -1.63 | outside the noise |
| 3 lanes, short acceleration lane (150 m): capacity | SDR hybrid | Today (human drivers) | Served (veh/h) | 5 | 5,931 | 5,081 | 850 (+17 %) | 543 to 1,158 | outside the noise |
| 3 lanes, short acceleration lane (150 m): 4,800 + 900 veh/h | SDR hybrid | Today (human drivers) | Served (veh/h) | 5 | 5,652 | 4,970 | 682 (+14 %) | 469 to 894 | outside the noise |
| 3 lanes, short acceleration lane (150 m): 4,800 + 900 veh/h | SDR hybrid | Today (human drivers) | Trip delay (s) | 5 | 23.4 | 108 | -84.2 (−78 %) | -105 to -63.7 | outside the noise |
| 3 lanes, short acceleration lane (150 m): capacity | SDR hybrid, sensors down at the merge | SDR hybrid | Served (veh/h) | 5 | 3,899 | 5,931 | -2,032 (−34 %) | -2,158 to -1,906 | outside the noise |
| 3 lanes, short acceleration lane (150 m): brick-wall stop | SDR hybrid | Today (human drivers) | Collisions per run | 30 | 0.73 | 2.53 | -1.80 (−71 %) | -2.90 to -0.70 | outside the noise |
| 3 lanes, long acceleration lane (600 m): capacity | SDR hybrid | Today (human drivers) | Served (veh/h) | 5 | 6,098 | 5,539 | 558 (+10 %) | 230 to 887 | outside the noise |
| 3 lanes, long acceleration lane (600 m): 4,800 + 900 veh/h | SDR hybrid | Today (human drivers) | Served (veh/h) | 5 | 5,680 | 5,459 | 221 (+4 %) | 35.3 to 406 | outside the noise |
| 3 lanes, long acceleration lane (600 m): 4,800 + 900 veh/h | SDR hybrid | Today (human drivers) | Trip delay (s) | 5 | 18.2 | 44.0 | -25.8 (−59 %) | -37.3 to -14.4 | outside the noise |
| 3 lanes, long acceleration lane (600 m): capacity | SDR hybrid, sensors down at the merge | SDR hybrid | Served (veh/h) | 5 | 3,878 | 6,098 | -2,219 (−36 %) | -2,398 to -2,041 | outside the noise |
| 3 lanes, long acceleration lane (600 m): brick-wall stop | SDR hybrid | Today (human drivers) | Collisions per run | 10 | 0.90 | 3.50 | -2.60 (−74 %) | -4.63 to -0.57 | outside the noise |
| 3 lanes, 10 km corridor: capacity | SDR hybrid | Today (human drivers) | Served (veh/h) | 5 | 5,865 | 5,172 | 693 (+13 %) | 578 to 807 | outside the noise |
| 3 lanes, 10 km corridor: 4,800 + 900 veh/h | SDR hybrid | Today (human drivers) | Served (veh/h) | 5 | 5,542 | 4,959 | 583 (+12 %) | 328 to 838 | outside the noise |
| 3 lanes, 10 km corridor: 4,800 + 900 veh/h | SDR hybrid | Today (human drivers) | Trip delay (s) | 5 | 29.0 | 80.6 | -51.6 (−64 %) | -57.6 to -45.6 | outside the noise |
| 3 lanes, 10 km corridor: capacity | SDR hybrid, sensors down at the merge | SDR hybrid | Served (veh/h) | 5 | 3,810 | 5,865 | -2,054 (−35 %) | -2,156 to -1,953 | outside the noise |
| 3 lanes, 10 km corridor: brick-wall stop | SDR hybrid | Today (human drivers) | Collisions per run | 30 | 0.83 | 3.33 | -2.50 (−75 %) | -3.74 to -1.26 | outside the noise |

### Sensor false alarms and shared misses (section 20)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 1 per km per hour, cleared after 10 s | no false alarms | Collisions per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 1 per km per hour, cleared after 10 s | no false alarms | Hard brakes / 1000 veh-km | 15 | 5.12 | 3.68 | 1.45 (+39 %) | 0.75 to 2.15 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 1 per km per hour, cleared after 10 s | no false alarms | Served (veh/h) | 15 | 5,930 | 5,957 | -26.1 (−0 %) | -63.7 to 11.5 | within the noise |
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 1 per km per hour, cleared after 10 s | no false alarms | Trip delay (s) | 15 | 164 | 161 | 3.31 (+2 %) | -1.43 to 8.04 | within the noise |
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 3 per km per hour, cleared after 10 s | no false alarms | Collisions per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 3 per km per hour, cleared after 10 s | no false alarms | Hard brakes / 1000 veh-km | 15 | 6.44 | 3.68 | 2.77 (+75 %) | 1.30 to 4.23 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 3 per km per hour, cleared after 10 s | no false alarms | Served (veh/h) | 15 | 5,916 | 5,957 | -40.5 (−1 %) | -96.6 to 15.5 | within the noise |
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 3 per km per hour, cleared after 10 s | no false alarms | Trip delay (s) | 15 | 167 | 161 | 5.86 (+4 %) | 0.52 to 11.2 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 10 per km per hour, cleared after 10 s | no false alarms | Collisions per run | 5 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 10 per km per hour, cleared after 10 s | no false alarms | Hard brakes / 1000 veh-km | 5 | 10.8 | 3.85 | 6.98 (+181 %) | 2.38 to 11.6 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 10 per km per hour, cleared after 10 s | no false alarms | Served (veh/h) | 5 | 5,794 | 6,002 | -209 (−3 %) | -408 to -9.75 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 10 per km per hour, cleared after 10 s | no false alarms | Trip delay (s) | 5 | 185 | 167 | 18.2 (+11 %) | 2.33 to 34.1 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 1 per km per hour, cleared after 60 s | no false alarms | Collisions per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 1 per km per hour, cleared after 60 s | no false alarms | Hard brakes / 1000 veh-km | 15 | 4.98 | 3.68 | 1.31 (+36 %) | 0.62 to 1.99 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 1 per km per hour, cleared after 60 s | no false alarms | Served (veh/h) | 15 | 5,874 | 5,957 | -82.9 (−1 %) | -143 to -23.3 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 1 per km per hour, cleared after 60 s | no false alarms | Trip delay (s) | 15 | 168 | 161 | 7.45 (+5 %) | 1.68 to 13.2 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 3 per km per hour, cleared after 60 s | no false alarms | Collisions per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 3 per km per hour, cleared after 60 s | no false alarms | Hard brakes / 1000 veh-km | 15 | 6.92 | 3.68 | 3.24 (+88 %) | 1.72 to 4.77 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 3 per km per hour, cleared after 60 s | no false alarms | Served (veh/h) | 15 | 5,637 | 5,957 | -319 (−5 %) | -450 to -188 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 3 per km per hour, cleared after 60 s | no false alarms | Trip delay (s) | 15 | 185 | 161 | 24.4 (+15 %) | 14.2 to 34.5 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 10 per km per hour, cleared after 60 s | no false alarms | Collisions per run | 5 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 10 per km per hour, cleared after 60 s | no false alarms | Hard brakes / 1000 veh-km | 5 | 18.7 | 3.85 | 14.9 (+386 %) | 8.17 to 21.6 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 10 per km per hour, cleared after 60 s | no false alarms | Served (veh/h) | 5 | 4,922 | 6,002 | -1,081 (−18 %) | -1,445 to -717 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | road sensors: 10 per km per hour, cleared after 60 s | no false alarms | Trip delay (s) | 5 | 220 | 167 | 53.4 (+32 %) | 17.8 to 88.9 | outside the noise |
| 7,200 + 900 (saturated), today's road | cars: 0.1 per vehicle-hour, driver assistance brakes | no false alarms | Collisions per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 7,200 + 900 (saturated), today's road | cars: 0.1 per vehicle-hour, driver assistance brakes | no false alarms | Hard brakes / 1000 veh-km | 15 | 77.2 | 73.4 | 3.74 (+5 %) | -6.06 to 13.5 | within the noise |
| 7,200 + 900 (saturated), today's road | cars: 0.1 per vehicle-hour, driver assistance brakes | no false alarms | Served (veh/h) | 15 | 5,325 | 5,364 | -38.9 (−1 %) | -129 to 50.8 | within the noise |
| 7,200 + 900 (saturated), today's road | cars: 0.1 per vehicle-hour, driver assistance brakes | no false alarms | Trip delay (s) | 15 | 205 | 204 | 0.55 (+0 %) | -4.93 to 6.03 | within the noise |
| 7,200 + 900 (saturated), SDR hybrid | cars: 0.1 per vehicle-hour, guardian brakes, not reported | no false alarms | Collisions per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 7,200 + 900 (saturated), SDR hybrid | cars: 0.1 per vehicle-hour, guardian brakes, not reported | no false alarms | Hard brakes / 1000 veh-km | 15 | 7.40 | 3.68 | 3.72 (+101 %) | 2.63 to 4.82 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | cars: 0.1 per vehicle-hour, guardian brakes, not reported | no false alarms | Served (veh/h) | 15 | 5,948 | 5,957 | -8.53 (−0 %) | -42.7 to 25.6 | within the noise |
| 7,200 + 900 (saturated), SDR hybrid | cars: 0.1 per vehicle-hour, guardian brakes, not reported | no false alarms | Trip delay (s) | 15 | 163 | 161 | 1.61 (+1 %) | 0.30 to 2.91 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | cars: 0.1 per vehicle-hour, reported to the road, cleared after 10 s | no false alarms | Collisions per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 7,200 + 900 (saturated), SDR hybrid | cars: 0.1 per vehicle-hour, reported to the road, cleared after 10 s | no false alarms | Hard brakes / 1000 veh-km | 15 | 9.20 | 3.68 | 5.52 (+150 %) | 3.96 to 7.09 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | cars: 0.1 per vehicle-hour, reported to the road, cleared after 10 s | no false alarms | Served (veh/h) | 15 | 5,788 | 5,957 | -169 (−3 %) | -242 to -95.8 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | cars: 0.1 per vehicle-hour, reported to the road, cleared after 10 s | no false alarms | Trip delay (s) | 15 | 176 | 161 | 15.0 (+9 %) | 9.08 to 20.9 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | cars: 0.1 per vehicle-hour, reported to the road, cleared after 60 s | no false alarms | Collisions per run | 5 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 7,200 + 900 (saturated), SDR hybrid | cars: 0.1 per vehicle-hour, reported to the road, cleared after 60 s | no false alarms | Hard brakes / 1000 veh-km | 5 | 10.6 | 3.85 | 6.71 (+174 %) | 2.15 to 11.3 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | cars: 0.1 per vehicle-hour, reported to the road, cleared after 60 s | no false alarms | Served (veh/h) | 5 | 5,269 | 6,002 | -734 (−12 %) | -1,290 to -177 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | cars: 0.1 per vehicle-hour, reported to the road, cleared after 60 s | no false alarms | Trip delay (s) | 5 | 217 | 167 | 50.3 (+30 %) | 14.1 to 86.6 | outside the noise |
| 7,200 + 900 (saturated), today's road | cars: 1 per vehicle-hour, driver assistance brakes | no false alarms | Collisions per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 7,200 + 900 (saturated), today's road | cars: 1 per vehicle-hour, driver assistance brakes | no false alarms | Hard brakes / 1000 veh-km | 15 | 101 | 73.4 | 27.9 (+38 %) | 17.4 to 38.4 | outside the noise |
| 7,200 + 900 (saturated), today's road | cars: 1 per vehicle-hour, driver assistance brakes | no false alarms | Served (veh/h) | 15 | 5,316 | 5,364 | -48.0 (−1 %) | -114 to 17.9 | within the noise |
| 7,200 + 900 (saturated), today's road | cars: 1 per vehicle-hour, driver assistance brakes | no false alarms | Trip delay (s) | 15 | 207 | 204 | 2.37 (+1 %) | -0.75 to 5.49 | within the noise |
| 7,200 + 900 (saturated), SDR hybrid | cars: 1 per vehicle-hour, guardian brakes, not reported | no false alarms | Collisions per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 7,200 + 900 (saturated), SDR hybrid | cars: 1 per vehicle-hour, guardian brakes, not reported | no false alarms | Hard brakes / 1000 veh-km | 15 | 39.9 | 3.68 | 36.2 (+986 %) | 32.9 to 39.6 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | cars: 1 per vehicle-hour, guardian brakes, not reported | no false alarms | Served (veh/h) | 15 | 5,959 | 5,957 | 2.13 (+0 %) | -64.9 to 69.2 | within the noise |
| 7,200 + 900 (saturated), SDR hybrid | cars: 1 per vehicle-hour, guardian brakes, not reported | no false alarms | Trip delay (s) | 15 | 163 | 161 | 1.69 (+1 %) | -3.81 to 7.20 | within the noise |
| 7,200 + 900 (saturated), SDR hybrid | cars: 1 per vehicle-hour, reported to the road, cleared after 10 s | no false alarms | Collisions per run | 5 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 7,200 + 900 (saturated), SDR hybrid | cars: 1 per vehicle-hour, reported to the road, cleared after 10 s | no false alarms | Hard brakes / 1000 veh-km | 5 | 70.5 | 3.85 | 66.6 (+1,728 %) | 50.0 to 83.2 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | cars: 1 per vehicle-hour, reported to the road, cleared after 10 s | no false alarms | Served (veh/h) | 5 | 4,969 | 6,002 | -1,034 (−17 %) | -1,276 to -791 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | cars: 1 per vehicle-hour, reported to the road, cleared after 10 s | no false alarms | Trip delay (s) | 5 | 242 | 167 | 75.7 (+45 %) | 68.8 to 82.6 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | cars: 1 per vehicle-hour, reported to the road, cleared after 60 s | no false alarms | Collisions per run | 5 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 7,200 + 900 (saturated), SDR hybrid | cars: 1 per vehicle-hour, reported to the road, cleared after 60 s | no false alarms | Hard brakes / 1000 veh-km | 5 | 91.6 | 3.85 | 87.7 (+2,276 %) | 64.3 to 111 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | cars: 1 per vehicle-hour, reported to the road, cleared after 60 s | no false alarms | Served (veh/h) | 5 | 3,161 | 6,002 | -2,842 (−47 %) | -3,433 to -2,250 | outside the noise |
| 7,200 + 900 (saturated), SDR hybrid | cars: 1 per vehicle-hour, reported to the road, cleared after 60 s | no false alarms | Trip delay (s) | 5 | 369 | 167 | 202 (+121 %) | 147 to 257 | outside the noise |
| 4,200 + 600, SDR hybrid | road sensors: 1 per km per hour, cleared after 10 s | no false alarms | Collisions per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 4,200 + 600, SDR hybrid | road sensors: 1 per km per hour, cleared after 10 s | no false alarms | Hard brakes / 1000 veh-km | 15 | 1.17 | 0.29 | 0.88 (+307 %) | 0.45 to 1.31 | outside the noise |
| 4,200 + 600, SDR hybrid | road sensors: 1 per km per hour, cleared after 10 s | no false alarms | Served (veh/h) | 15 | 4,754 | 4,763 | -8.53 (−0 %) | -20.5 to 3.42 | within the noise |
| 4,200 + 600, SDR hybrid | road sensors: 1 per km per hour, cleared after 10 s | no false alarms | Trip delay (s) | 15 | 12.6 | 12.4 | 0.24 (+2 %) | 0.08 to 0.39 | outside the noise |
| 4,200 + 600, SDR hybrid | road sensors: 3 per km per hour, cleared after 10 s | no false alarms | Collisions per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 4,200 + 600, SDR hybrid | road sensors: 3 per km per hour, cleared after 10 s | no false alarms | Hard brakes / 1000 veh-km | 15 | 3.42 | 0.29 | 3.13 (+1,093 %) | 2.15 to 4.12 | outside the noise |
| 4,200 + 600, SDR hybrid | road sensors: 3 per km per hour, cleared after 10 s | no false alarms | Served (veh/h) | 15 | 4,759 | 4,763 | -4.27 (−0 %) | -10.2 to 1.62 | within the noise |
| 4,200 + 600, SDR hybrid | road sensors: 3 per km per hour, cleared after 10 s | no false alarms | Trip delay (s) | 15 | 13.4 | 12.4 | 1.00 (+8 %) | 0.60 to 1.41 | outside the noise |
| 4,200 + 600, SDR hybrid | road sensors: 10 per km per hour, cleared after 10 s | no false alarms | Collisions per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 4,200 + 600, SDR hybrid | road sensors: 10 per km per hour, cleared after 10 s | no false alarms | Hard brakes / 1000 veh-km | 15 | 9.67 | 0.29 | 9.39 (+3,272 %) | 7.86 to 10.9 | outside the noise |
| 4,200 + 600, SDR hybrid | road sensors: 10 per km per hour, cleared after 10 s | no false alarms | Served (veh/h) | 15 | 4,749 | 4,763 | -13.6 (−0 %) | -30.7 to 3.49 | within the noise |
| 4,200 + 600, SDR hybrid | road sensors: 10 per km per hour, cleared after 10 s | no false alarms | Trip delay (s) | 15 | 15.8 | 12.4 | 3.43 (+28 %) | 2.51 to 4.35 | outside the noise |
| 4,200 + 600, SDR hybrid | road sensors: 1 per km per hour, cleared after 60 s | no false alarms | Collisions per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 4,200 + 600, SDR hybrid | road sensors: 1 per km per hour, cleared after 60 s | no false alarms | Hard brakes / 1000 veh-km | 15 | 1.39 | 0.29 | 1.10 (+384 %) | 0.54 to 1.66 | outside the noise |
| 4,200 + 600, SDR hybrid | road sensors: 1 per km per hour, cleared after 60 s | no false alarms | Served (veh/h) | 15 | 4,745 | 4,763 | -17.6 (−0 %) | -43.8 to 8.56 | within the noise |
| 4,200 + 600, SDR hybrid | road sensors: 1 per km per hour, cleared after 60 s | no false alarms | Trip delay (s) | 15 | 13.3 | 12.4 | 0.95 (+8 %) | 0.42 to 1.47 | outside the noise |
| 4,200 + 600, SDR hybrid | road sensors: 3 per km per hour, cleared after 60 s | no false alarms | Collisions per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 4,200 + 600, SDR hybrid | road sensors: 3 per km per hour, cleared after 60 s | no false alarms | Hard brakes / 1000 veh-km | 15 | 4.70 | 0.29 | 4.41 (+1,539 %) | 3.11 to 5.71 | outside the noise |
| 4,200 + 600, SDR hybrid | road sensors: 3 per km per hour, cleared after 60 s | no false alarms | Served (veh/h) | 15 | 4,745 | 4,763 | -18.1 (−0 %) | -44.7 to 8.45 | within the noise |
| 4,200 + 600, SDR hybrid | road sensors: 3 per km per hour, cleared after 60 s | no false alarms | Trip delay (s) | 15 | 17.5 | 12.4 | 5.14 (+42 %) | 3.41 to 6.87 | outside the noise |
| 4,200 + 600, SDR hybrid | road sensors: 10 per km per hour, cleared after 60 s | no false alarms | Collisions per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 4,200 + 600, SDR hybrid | road sensors: 10 per km per hour, cleared after 60 s | no false alarms | Hard brakes / 1000 veh-km | 15 | 14.9 | 0.29 | 14.6 (+5,099 %) | 11.1 to 18.1 | outside the noise |
| 4,200 + 600, SDR hybrid | road sensors: 10 per km per hour, cleared after 60 s | no false alarms | Served (veh/h) | 15 | 4,643 | 4,763 | -120 (−3 %) | -216 to -23.1 | outside the noise |
| 4,200 + 600, SDR hybrid | road sensors: 10 per km per hour, cleared after 60 s | no false alarms | Trip delay (s) | 15 | 45.4 | 12.4 | 33.0 (+268 %) | 21.9 to 44.2 | outside the noise |
| 4,200 + 600, today's road | cars: 0.1 per vehicle-hour, driver assistance brakes | no false alarms | Collisions per run | 15 | 0.07 | 0.07 | 0.00 (+0 %) | -0.21 to 0.21 | within the noise |
| 4,200 + 600, today's road | cars: 0.1 per vehicle-hour, driver assistance brakes | no false alarms | Hard brakes / 1000 veh-km | 15 | 37.9 | 41.0 | -3.12 (−8 %) | -7.91 to 1.67 | within the noise |
| 4,200 + 600, today's road | cars: 0.1 per vehicle-hour, driver assistance brakes | no false alarms | Served (veh/h) | 15 | 4,696 | 4,706 | -9.87 (−0 %) | -65.5 to 45.8 | within the noise |
| 4,200 + 600, today's road | cars: 0.1 per vehicle-hour, driver assistance brakes | no false alarms | Trip delay (s) | 15 | 26.2 | 26.6 | -0.41 (−2 %) | -7.31 to 6.49 | within the noise |
| 4,200 + 600, SDR hybrid | cars: 0.1 per vehicle-hour, guardian brakes, not reported | no false alarms | Collisions per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 4,200 + 600, SDR hybrid | cars: 0.1 per vehicle-hour, guardian brakes, not reported | no false alarms | Hard brakes / 1000 veh-km | 15 | 2.78 | 0.29 | 2.49 (+870 %) | 1.80 to 3.19 | outside the noise |
| 4,200 + 600, SDR hybrid | cars: 0.1 per vehicle-hour, guardian brakes, not reported | no false alarms | Served (veh/h) | 15 | 4,763 | 4,763 | 0.27 (+0 %) | -0.31 to 0.84 | within the noise |
| 4,200 + 600, SDR hybrid | cars: 0.1 per vehicle-hour, guardian brakes, not reported | no false alarms | Trip delay (s) | 15 | 12.4 | 12.4 | 0.02 (+0 %) | -0.01 to 0.05 | within the noise |
| 4,200 + 600, SDR hybrid | cars: 0.1 per vehicle-hour, reported to the road, cleared after 10 s | no false alarms | Collisions per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 4,200 + 600, SDR hybrid | cars: 0.1 per vehicle-hour, reported to the road, cleared after 10 s | no false alarms | Hard brakes / 1000 veh-km | 15 | 5.19 | 0.29 | 4.91 (+1,711 %) | 3.59 to 6.22 | outside the noise |
| 4,200 + 600, SDR hybrid | cars: 0.1 per vehicle-hour, reported to the road, cleared after 10 s | no false alarms | Served (veh/h) | 15 | 4,769 | 4,763 | 5.60 (+0 %) | -7.12 to 18.3 | within the noise |
| 4,200 + 600, SDR hybrid | cars: 0.1 per vehicle-hour, reported to the road, cleared after 10 s | no false alarms | Trip delay (s) | 15 | 13.7 | 12.4 | 1.37 (+11 %) | 0.78 to 1.96 | outside the noise |
| 4,200 + 600, SDR hybrid | cars: 0.1 per vehicle-hour, reported to the road, cleared after 60 s | no false alarms | Collisions per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 4,200 + 600, SDR hybrid | cars: 0.1 per vehicle-hour, reported to the road, cleared after 60 s | no false alarms | Hard brakes / 1000 veh-km | 15 | 8.82 | 0.29 | 8.54 (+2,976 %) | 5.74 to 11.3 | outside the noise |
| 4,200 + 600, SDR hybrid | cars: 0.1 per vehicle-hour, reported to the road, cleared after 60 s | no false alarms | Served (veh/h) | 15 | 4,773 | 4,763 | 9.60 (+0 %) | -53.7 to 72.9 | within the noise |
| 4,200 + 600, SDR hybrid | cars: 0.1 per vehicle-hour, reported to the road, cleared after 60 s | no false alarms | Trip delay (s) | 15 | 25.3 | 12.4 | 13.0 (+105 %) | 6.47 to 19.5 | outside the noise |
| 4,200 + 600, today's road | cars: 1 per vehicle-hour, driver assistance brakes | no false alarms | Collisions per run | 15 | 0.00 | 0.07 | -0.07 (−100 %) | -0.21 to 0.08 | within the noise |
| 4,200 + 600, today's road | cars: 1 per vehicle-hour, driver assistance brakes | no false alarms | Hard brakes / 1000 veh-km | 15 | 52.4 | 41.0 | 11.4 (+28 %) | 4.22 to 18.6 | outside the noise |
| 4,200 + 600, today's road | cars: 1 per vehicle-hour, driver assistance brakes | no false alarms | Served (veh/h) | 15 | 4,733 | 4,706 | 26.4 (+1 %) | -12.2 to 65.0 | within the noise |
| 4,200 + 600, today's road | cars: 1 per vehicle-hour, driver assistance brakes | no false alarms | Trip delay (s) | 15 | 23.2 | 26.6 | -3.40 (−13 %) | -8.75 to 1.94 | within the noise |
| 4,200 + 600, SDR hybrid | cars: 1 per vehicle-hour, guardian brakes, not reported | no false alarms | Collisions per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 4,200 + 600, SDR hybrid | cars: 1 per vehicle-hour, guardian brakes, not reported | no false alarms | Hard brakes / 1000 veh-km | 15 | 23.2 | 0.29 | 22.9 (+7,980 %) | 20.8 to 25.0 | outside the noise |
| 4,200 + 600, SDR hybrid | cars: 1 per vehicle-hour, guardian brakes, not reported | no false alarms | Served (veh/h) | 15 | 4,764 | 4,763 | 0.80 (+0 %) | -3.57 to 5.17 | within the noise |
| 4,200 + 600, SDR hybrid | cars: 1 per vehicle-hour, guardian brakes, not reported | no false alarms | Trip delay (s) | 15 | 12.3 | 12.4 | -0.01 (−0 %) | -0.11 to 0.08 | within the noise |
| 4,200 + 600, SDR hybrid | cars: 1 per vehicle-hour, reported to the road, cleared after 10 s | no false alarms | Collisions per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 4,200 + 600, SDR hybrid | cars: 1 per vehicle-hour, reported to the road, cleared after 10 s | no false alarms | Hard brakes / 1000 veh-km | 15 | 58.4 | 0.29 | 58.1 (+20,255 %) | 51.6 to 64.6 | outside the noise |
| 4,200 + 600, SDR hybrid | cars: 1 per vehicle-hour, reported to the road, cleared after 10 s | no false alarms | Served (veh/h) | 15 | 4,667 | 4,763 | -95.7 (−2 %) | -176 to -16.0 | outside the noise |
| 4,200 + 600, SDR hybrid | cars: 1 per vehicle-hour, reported to the road, cleared after 10 s | no false alarms | Trip delay (s) | 15 | 43.4 | 12.4 | 31.1 (+252 %) | 24.1 to 38.0 | outside the noise |
| 4,200 + 600, SDR hybrid | cars: 1 per vehicle-hour, reported to the road, cleared after 60 s | no false alarms | Collisions per run | 5 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| 4,200 + 600, SDR hybrid | cars: 1 per vehicle-hour, reported to the road, cleared after 60 s | no false alarms | Hard brakes / 1000 veh-km | 5 | 91.4 | 0.34 | 91.0 (+27,017 %) | 64.2 to 118 | outside the noise |
| 4,200 + 600, SDR hybrid | cars: 1 per vehicle-hour, reported to the road, cleared after 60 s | no false alarms | Served (veh/h) | 5 | 2,929 | 4,803 | -1,874 (−39 %) | -2,815 to -934 | outside the noise |
| 4,200 + 600, SDR hybrid | cars: 1 per vehicle-hour, reported to the road, cleared after 60 s | no false alarms | Trip delay (s) | 5 | 211 | 12.3 | 199 (+1,614 %) | 166 to 232 | outside the noise |
| object 150 m ahead | Road confirms in 1 s; car sensors off | Road confirms in 0.5 s; car sensors off | Collisions per run | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| object 150 m ahead | Road confirms in 1 s; car sensors off | Road confirms in 0.5 s; car sensors off | Vehicles that hit the object | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| object 150 m ahead | Road confirms in 2 s; car sensors off | Road confirms in 0.5 s; car sensors off | Collisions per run | 30 | 0.07 | 0.00 | 0.07 | -0.07 to 0.20 | within the noise |
| object 150 m ahead | Road confirms in 2 s; car sensors off | Road confirms in 0.5 s; car sensors off | Vehicles that hit the object | 30 | 0.03 | 0.00 | 0.03 | -0.03 to 0.10 | within the noise |
| object 150 m ahead | Road confirms in 1 s; every car sees it (V2V) | Road confirms in 1 s; car sensors off | Collisions per run | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| object 150 m ahead | Road confirms in 1 s; every car sees it (V2V) | Road confirms in 1 s; car sensors off | Vehicles that hit the object | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| object 150 m ahead | Road misses; cars 90 % on average, shared misses (V2V) | Road misses; each car 90 %, independently (V2V) | Collisions per run | 30 | 0.03 | 0.40 | -0.37 (−92 %) | -0.75 to 0.02 | within the noise |
| object 150 m ahead | Road misses; cars 90 % on average, shared misses (V2V) | Road misses; each car 90 %, independently (V2V) | Vehicles that hit the object | 30 | 0.03 | 0.20 | -0.17 (−83 %) | -0.34 to 0.01 | within the noise |
| object 150 m ahead | Road misses; cars 90 % on average, shared misses, not shared | Road misses; each car 90 %, independently, not shared | Collisions per run | 30 | 1.40 | 1.53 | -0.13 (−9 %) | -0.39 to 0.12 | within the noise |
| object 150 m ahead | Road misses; cars 90 % on average, shared misses, not shared | Road misses; each car 90 %, independently, not shared | Vehicles that hit the object | 30 | 0.90 | 0.93 | -0.03 (−4 %) | -0.10 to 0.03 | within the noise |
| object 150 m ahead | Road 95 % in 1 s, cars 90 %, road and cars miss the same objects (V2V) | Road 95 % in 1 s, cars 90 %, all misses independent (V2V) | Collisions per run | 10 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| object 150 m ahead | Road 95 % in 1 s, cars 90 %, road and cars miss the same objects (V2V) | Road 95 % in 1 s, cars 90 %, all misses independent (V2V) | Vehicles that hit the object | 10 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| load falls off a truck | Road confirms in 1 s; car sensors off | Road confirms in 0.5 s; car sensors off | Collisions per run | 10 | 0.90 | 0.00 | 0.90 | 0.67 to 1.13 | outside the noise |
| load falls off a truck | Road confirms in 1 s; car sensors off | Road confirms in 0.5 s; car sensors off | Vehicles that hit the object | 10 | 0.90 | 0.00 | 0.90 | 0.67 to 1.13 | outside the noise |
| load falls off a truck | Road confirms in 2 s; car sensors off | Road confirms in 0.5 s; car sensors off | Collisions per run | 10 | 2.10 | 0.00 | 2.10 | 1.47 to 2.73 | outside the noise |
| load falls off a truck | Road confirms in 2 s; car sensors off | Road confirms in 0.5 s; car sensors off | Vehicles that hit the object | 10 | 1.10 | 0.00 | 1.10 | 0.87 to 1.33 | outside the noise |
| load falls off a truck | Road confirms in 1 s; every car sees it (V2V) | Road confirms in 1 s; car sensors off | Collisions per run | 10 | 0.00 | 0.90 | -0.90 (−100 %) | -1.13 to -0.67 | outside the noise |
| load falls off a truck | Road confirms in 1 s; every car sees it (V2V) | Road confirms in 1 s; car sensors off | Vehicles that hit the object | 10 | 0.00 | 0.90 | -0.90 (−100 %) | -1.13 to -0.67 | outside the noise |
| load falls off a truck | Road misses; cars 90 % on average, shared misses (V2V) | Road misses; each car 90 %, independently (V2V) | Collisions per run | 30 | 0.10 | 0.33 | -0.23 (−70 %) | -0.49 to 0.02 | within the noise |
| load falls off a truck | Road misses; cars 90 % on average, shared misses (V2V) | Road misses; each car 90 %, independently (V2V) | Vehicles that hit the object | 30 | 0.03 | 0.17 | -0.13 (−80 %) | -0.26 to -0.00 | outside the noise |
| load falls off a truck | Road misses; cars 90 % on average, shared misses, not shared | Road misses; each car 90 %, independently, not shared | Collisions per run | 30 | 0.90 | 1.03 | -0.13 (−13 %) | -0.30 to 0.03 | within the noise |
| load falls off a truck | Road misses; cars 90 % on average, shared misses, not shared | Road misses; each car 90 %, independently, not shared | Vehicles that hit the object | 30 | 0.83 | 0.87 | -0.03 (−4 %) | -0.10 to 0.03 | within the noise |
| load falls off a truck | Road 95 % in 1 s, cars 90 %, road and cars miss the same objects (V2V) | Road 95 % in 1 s, cars 90 %, all misses independent (V2V) | Collisions per run | 30 | 0.10 | 0.13 | -0.03 (−25 %) | -0.22 to 0.15 | within the noise |
| load falls off a truck | Road 95 % in 1 s, cars 90 %, road and cars miss the same objects (V2V) | Road 95 % in 1 s, cars 90 %, all misses independent (V2V) | Vehicles that hit the object | 30 | 0.03 | 0.13 | -0.10 (−75 %) | -0.21 to 0.01 | within the noise |

### Per hazard, counted the same way (section 20a)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| load falls off a truck, stops dead | SDR, no truck gap (relative behind trucks) | Today (human drivers) | Collisions caused per event | 30 | 2.40 | 5.00 | -2.60 (−52 %) | -4.30 to -0.90 | outside the noise |
| load falls off a truck, stops dead | SDR, no truck gap (relative behind trucks) | Today (human drivers) | Impacts above 30 km/h per event | 30 | 1.83 | 4.50 | -2.67 (−59 %) | -4.29 to -1.04 | outside the noise |
| load falls off a truck, stops dead | SDR, hybrid (truck gap as it is) | Today (human drivers) | Collisions caused per event | 30 | 0.00 | 5.00 | -5.00 (−100 %) | -6.62 to -3.38 | outside the noise |
| load falls off a truck, stops dead | SDR, hybrid (truck gap as it is) | Today (human drivers) | Impacts above 30 km/h per event | 30 | 0.00 | 4.50 | -4.50 (−100 %) | -6.08 to -2.92 | outside the noise |
| load falls off a truck, stops dead | SDR, hybrid (truck gap as it is) | SDR, no truck gap (relative behind trucks) | Collisions caused per event | 30 | 0.00 | 2.40 | -2.40 (−100 %) | -2.67 to -2.13 | outside the noise |
| load falls off a truck, stops dead | SDR, hybrid (truck gap as it is) | SDR, no truck gap (relative behind trucks) | Impacts above 30 km/h per event | 30 | 0.00 | 1.83 | -1.83 (−100 %) | -2.05 to -1.61 | outside the noise |
| load falls off a truck, stops dead | SDR, no truck gap, loss reported at once | Today (human drivers) | Collisions caused per event | 30 | 2.43 | 5.00 | -2.57 (−51 %) | -4.28 to -0.85 | outside the noise |
| load falls off a truck, stops dead | SDR, no truck gap, loss reported at once | Today (human drivers) | Impacts above 30 km/h per event | 30 | 1.87 | 4.50 | -2.63 (−59 %) | -4.26 to -1.01 | outside the noise |
| load falls off a truck, stops dead | SDR, no truck gap, loss reported at once | SDR, no truck gap (relative behind trucks) | Collisions caused per event | 30 | 2.43 | 2.40 | 0.03 (+1 %) | -0.09 to 0.15 | within the noise |
| load falls off a truck, stops dead | SDR, no truck gap, loss reported at once | SDR, no truck gap (relative behind trucks) | Impacts above 30 km/h per event | 30 | 1.87 | 1.83 | 0.03 (+2 %) | -0.09 to 0.15 | within the noise |
| load falls off a truck, slides at 6 m/s² | SDR, no truck gap (relative behind trucks) | Today (human drivers) | Collisions caused per event | 30 | 0.00 | 0.13 | -0.13 (−100 %) | -0.30 to 0.03 | within the noise |
| load falls off a truck, slides at 6 m/s² | SDR, no truck gap (relative behind trucks) | Today (human drivers) | Impacts above 30 km/h per event | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| load falls off a truck, slides at 6 m/s² | SDR, hybrid (truck gap as it is) | Today (human drivers) | Collisions caused per event | 30 | 0.00 | 0.13 | -0.13 (−100 %) | -0.30 to 0.03 | within the noise |
| load falls off a truck, slides at 6 m/s² | SDR, hybrid (truck gap as it is) | Today (human drivers) | Impacts above 30 km/h per event | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| load falls off a truck, slides at 6 m/s² | SDR, hybrid (truck gap as it is) | SDR, no truck gap (relative behind trucks) | Collisions caused per event | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| load falls off a truck, slides at 6 m/s² | SDR, hybrid (truck gap as it is) | SDR, no truck gap (relative behind trucks) | Impacts above 30 km/h per event | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| brick-wall stop | SDR, no truck gap (relative behind trucks) | Today (human drivers) | Collisions caused per event | 30 | 0.93 | 3.43 | -2.50 (−73 %) | -3.72 to -1.28 | outside the noise |
| brick-wall stop | SDR, no truck gap (relative behind trucks) | Today (human drivers) | Impacts above 30 km/h per event | 30 | 0.73 | 2.97 | -2.23 (−75 %) | -3.28 to -1.19 | outside the noise |
| brick-wall stop | SDR, hybrid (truck gap as it is) | Today (human drivers) | Collisions caused per event | 30 | 0.53 | 3.43 | -2.90 (−84 %) | -4.08 to -1.72 | outside the noise |
| brick-wall stop | SDR, hybrid (truck gap as it is) | Today (human drivers) | Impacts above 30 km/h per event | 30 | 0.53 | 2.97 | -2.43 (−82 %) | -3.47 to -1.39 | outside the noise |
| brick-wall stop | SDR, hybrid (truck gap as it is) | SDR, no truck gap (relative behind trucks) | Collisions caused per event | 30 | 0.53 | 0.93 | -0.40 (−43 %) | -0.75 to -0.05 | outside the noise |
| brick-wall stop | SDR, hybrid (truck gap as it is) | SDR, no truck gap (relative behind trucks) | Impacts above 30 km/h per event | 30 | 0.53 | 0.73 | -0.20 (−27 %) | -0.52 to 0.12 | within the noise |
| object 150 m ahead | SDR, no truck gap (relative behind trucks) | Today (human drivers) | Collisions caused per event | 30 | 0.00 | 0.17 | -0.17 (−100 %) | -0.39 to 0.05 | within the noise |
| object 150 m ahead | SDR, no truck gap (relative behind trucks) | Today (human drivers) | Impacts above 30 km/h per event | 30 | 0.00 | 0.10 | -0.10 (−100 %) | -0.25 to 0.05 | within the noise |
| object 150 m ahead | SDR, hybrid (truck gap as it is) | Today (human drivers) | Collisions caused per event | 30 | 0.00 | 0.17 | -0.17 (−100 %) | -0.39 to 0.05 | within the noise |
| object 150 m ahead | SDR, hybrid (truck gap as it is) | Today (human drivers) | Impacts above 30 km/h per event | 30 | 0.00 | 0.10 | -0.10 (−100 %) | -0.25 to 0.05 | within the noise |
| object 150 m ahead | SDR, hybrid (truck gap as it is) | SDR, no truck gap (relative behind trucks) | Collisions caused per event | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| object 150 m ahead | SDR, hybrid (truck gap as it is) | SDR, no truck gap (relative behind trucks) | Impacts above 30 km/h per event | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| breakdown | SDR, no truck gap (relative behind trucks) | Today (human drivers) | Collisions caused per event | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| breakdown | SDR, no truck gap (relative behind trucks) | Today (human drivers) | Impacts above 30 km/h per event | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| breakdown | SDR, hybrid (truck gap as it is) | Today (human drivers) | Collisions caused per event | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| breakdown | SDR, hybrid (truck gap as it is) | Today (human drivers) | Impacts above 30 km/h per event | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| breakdown | SDR, hybrid (truck gap as it is) | SDR, no truck gap (relative behind trucks) | Collisions caused per event | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| breakdown | SDR, hybrid (truck gap as it is) | SDR, no truck gap (relative behind trucks) | Impacts above 30 km/h per event | 30 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |

### Road-sensor outage (section 6)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 4200 + 600 veh/h | sensors down at the on-ramp merge (2–3 km) | all sensors up | Served (veh/h) | 5 | 3,974 | 4,803 | -829 (−17 %) | -971 to -687 | outside the noise |
| 4200 + 600 veh/h | sensors down on a plain stretch (4–5 km) | all sensors up | Served (veh/h) | 15 | 4,735 | 4,763 | -28.0 (−1 %) | -61.7 to 5.68 | within the noise |
| 7200 + 900 veh/h | sensors down at the on-ramp merge (2–3 km) | all sensors up | Served (veh/h) | 5 | 3,890 | 6,002 | -2,112 (−35 %) | -2,280 to -1,944 | outside the noise |
| 7200 + 900 veh/h | sensors down on a plain stretch (4–5 km) | all sensors up | Served (veh/h) | 5 | 5,542 | 6,002 | -461 (−8 %) | -572 to -349 | outside the noise |

### Weather (section 7)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| dry | SDR, absolute separation | Today (human drivers) | Served (veh/h) | 5 | 3,246 | 4,194 | -947 (−23 %) | -994 to -900 | outside the noise |
| dry | SDR, absolute separation | Today (human drivers) | Trip delay (s) | 5 | 158 | 13.6 | 144 (+1,061 %) | 134 to 155 | outside the noise |
| dry | SDR, absolute + adaptive speed | Today (human drivers) | Served (veh/h) | 5 | 3,902 | 4,194 | -291 (−7 %) | -479 to -104 | outside the noise |
| dry | SDR, absolute + adaptive speed | Today (human drivers) | Trip delay (s) | 5 | 141 | 13.6 | 128 (+941 %) | 108 to 147 | outside the noise |
| dry | SDR, relative separation | Today (human drivers) | Served (veh/h) | 15 | 4,173 | 4,149 | 24.8 (+1 %) | -1.05 to 50.7 | within the noise |
| dry | SDR, relative separation | Today (human drivers) | Trip delay (s) | 15 | 7.60 | 14.3 | -6.70 (−47 %) | -7.88 to -5.53 | outside the noise |
| dry | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 15 | 4,172 | 4,149 | 23.5 (+1 %) | 0.97 to 46.0 | outside the noise |
| dry | SDR, hybrid separation | Today (human drivers) | Trip delay (s) | 15 | 9.72 | 14.3 | -4.58 (−32 %) | -5.79 to -3.36 | outside the noise |
| wet | SDR, absolute separation | Today (human drivers) | Served (veh/h) | 5 | 2,830 | 4,244 | -1,414 (−33 %) | -1,536 to -1,293 | outside the noise |
| wet | SDR, absolute separation | Today (human drivers) | Trip delay (s) | 5 | 203 | 33.5 | 170 (+506 %) | 159 to 180 | outside the noise |
| wet | SDR, absolute + adaptive speed | Today (human drivers) | Served (veh/h) | 5 | 3,742 | 4,244 | -502 (−12 %) | -676 to -327 | outside the noise |
| wet | SDR, absolute + adaptive speed | Today (human drivers) | Trip delay (s) | 5 | 187 | 33.5 | 154 (+459 %) | 135 to 172 | outside the noise |
| wet | SDR, relative separation | Today (human drivers) | Served (veh/h) | 15 | 4,175 | 4,176 | -0.80 (−0 %) | -34.4 to 32.8 | within the noise |
| wet | SDR, relative separation | Today (human drivers) | Trip delay (s) | 15 | 7.72 | 32.8 | -25.1 (−76 %) | -26.2 to -24.0 | outside the noise |
| wet | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 15 | 4,173 | 4,176 | -3.20 (−0 %) | -35.8 to 29.4 | within the noise |
| wet | SDR, hybrid separation | Today (human drivers) | Trip delay (s) | 15 | 10.1 | 32.8 | -22.7 (−69 %) | -23.8 to -21.6 | outside the noise |
| ice | SDR, absolute separation | Today (human drivers) | Served (veh/h) | 5 | 1,286 | 4,041 | -2,755 (−68 %) | -2,991 to -2,519 | outside the noise |
| ice | SDR, absolute separation | Today (human drivers) | Trip delay (s) | 5 | 301 | 139 | 162 (+117 %) | 131 to 193 | outside the noise |
| ice | SDR, absolute + adaptive speed | Today (human drivers) | Served (veh/h) | 5 | 2,398 | 4,041 | -1,642 (−41 %) | -1,838 to -1,447 | outside the noise |
| ice | SDR, absolute + adaptive speed | Today (human drivers) | Trip delay (s) | 5 | 324 | 139 | 185 (+133 %) | 160 to 210 | outside the noise |
| ice | SDR, relative separation | Today (human drivers) | Served (veh/h) | 5 | 4,251 | 4,041 | 210 (+5 %) | 26.6 to 394 | outside the noise |
| ice | SDR, relative separation | Today (human drivers) | Trip delay (s) | 5 | 52.1 | 139 | -87.0 (−63 %) | -110 to -63.9 | outside the noise |
| ice | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 15 | 3,580 | 3,958 | -378 (−10 %) | -466 to -290 | outside the noise |
| ice | SDR, hybrid separation | Today (human drivers) | Trip delay (s) | 15 | 128 | 130 | -2.31 (−2 %) | -11.7 to 7.07 | within the noise |

### Radio packet loss (section 9)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| fixed gaps | 1 % loss | no loss | Served (veh/h) | 15 | 5,974 | 5,957 | 17.6 (+0 %) | -37.7 to 72.9 | within the noise |
| fixed gaps | 5 % loss | no loss | Served (veh/h) | 15 | 5,965 | 5,957 | 8.53 (+0 %) | -46.4 to 63.4 | within the noise |
| fixed gaps | 10 % loss | no loss | Served (veh/h) | 15 | 5,997 | 5,957 | 40.5 (+1 %) | -6.41 to 87.5 | within the noise |
| fixed gaps | 20 % loss | no loss | Served (veh/h) | 15 | 5,923 | 5,957 | -33.1 (−1 %) | -95.9 to 29.8 | within the noise |
| fixed gaps | 50 % loss | no loss | Served (veh/h) | 5 | 5,086 | 6,002 | -916 (−15 %) | -1,095 to -737 | outside the noise |
| widened gaps | 1 % loss | no loss | Served (veh/h) | 15 | 5,946 | 5,957 | -10.4 (−0 %) | -58.2 to 37.4 | within the noise |
| 1 % loss | widened gaps | fixed gaps | Supervision brakes per run | 15 | 0.20 | 0.13 | 0.07 (+50 %) | -0.26 to 0.40 | within the noise |
| widened gaps | 5 % loss | no loss | Served (veh/h) | 5 | 5,617 | 6,002 | -386 (−6 %) | -545 to -226 | outside the noise |
| 5 % loss | widened gaps | fixed gaps | Supervision brakes per run | 5 | 1.40 | 13.2 | -11.8 (−89 %) | -17.1 to -6.50 | outside the noise |
| widened gaps | 10 % loss | no loss | Served (veh/h) | 5 | 5,394 | 6,002 | -608 (−10 %) | -799 to -417 | outside the noise |
| 10 % loss | widened gaps | fixed gaps | Supervision brakes per run | 5 | 3.80 | 223 | -219 (−98 %) | -249 to -189 | outside the noise |
| widened gaps | 20 % loss | no loss | Served (veh/h) | 5 | 4,915 | 6,002 | -1,087 (−18 %) | -1,266 to -908 | outside the noise |
| 20 % loss | widened gaps | fixed gaps | Supervision brakes per run | 5 | 9.20 | 2,188 | -2,179 (−100 %) | -2,362 to -1,995 | outside the noise |
| widened gaps | 50 % loss | no loss | Served (veh/h) | 5 | 3,390 | 6,002 | -2,613 (−44 %) | -2,769 to -2,456 | outside the noise |
| 50 % loss | widened gaps | fixed gaps | Supervision brakes per run | 5 | 8.20 | 19,269 | -19,261 (−100 %) | -20,243 to -18,280 | outside the noise |

### Truck share (section 10)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 0 % trucks | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 5 | 7,991 | 6,180 | 1,811 (+29 %) | 1,598 to 2,025 | outside the noise |
| 0 % trucks | SDR, relative separation | Today (human drivers) | Served (veh/h) | 5 | 7,991 | 6,180 | 1,811 (+29 %) | 1,598 to 2,025 | outside the noise |
| 0 % trucks | SDR, hybrid separation | SDR, relative separation | Served (veh/h) | 5 | 7,991 | 7,991 | 0.00 (+0 %) | 0.00 to 0.00 | identical |
| 10 % trucks | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 5 | 6,002 | 5,395 | 607 (+11 %) | 333 to 881 | outside the noise |
| 10 % trucks | SDR, relative separation | Today (human drivers) | Served (veh/h) | 5 | 7,084 | 5,395 | 1,689 (+31 %) | 1,254 to 2,123 | outside the noise |
| 10 % trucks | SDR, hybrid separation | SDR, relative separation | Served (veh/h) | 5 | 6,002 | 7,084 | -1,082 (−15 %) | -1,443 to -721 | outside the noise |
| 20 % trucks | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 5 | 4,438 | 4,895 | -457 (−9 %) | -511 to -403 | outside the noise |
| 20 % trucks | SDR, relative separation | Today (human drivers) | Served (veh/h) | 5 | 5,684 | 4,895 | 789 (+16 %) | 688 to 890 | outside the noise |
| 20 % trucks | SDR, hybrid separation | SDR, relative separation | Served (veh/h) | 5 | 4,438 | 5,684 | -1,246 (−22 %) | -1,401 to -1,091 | outside the noise |
| 30 % trucks | SDR, hybrid separation | Today (human drivers) | Served (veh/h) | 5 | 3,630 | 4,564 | -934 (−20 %) | -1,028 to -841 | outside the noise |
| 30 % trucks | SDR, relative separation | Today (human drivers) | Served (veh/h) | 15 | 4,741 | 4,587 | 154 (+3 %) | 26.5 to 282 | outside the noise |
| 30 % trucks | SDR, hybrid separation | SDR, relative separation | Served (veh/h) | 5 | 3,630 | 4,618 | -988 (−21 %) | -1,266 to -710 | outside the noise |

### Realistic radio loss (section 9a)

| Conditions | A | B | Measure | Runs | A | B | Difference A − B | 95 % interval | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| A. against no loss | 5 %, independent | No loss | Served (veh/h) | 15 | 5,620 | 5,957 | -337 (−6 %) | -398 to -275 | outside the noise |
| B. road measures bursts, against road assumes independent loss | 5 %, independent, road measures bursts | 5 %, independent | Served (veh/h) | 15 | 5,627 | 5,620 | 6.67 (+0 %) | -48.6 to 62.0 | within the noise |
| B. road measures bursts, against road assumes independent loss | 5 %, independent, road measures bursts | 5 %, independent | Supervision brakes per run | 15 | 1.53 | 1.20 | 0.33 (+28 %) | -0.62 to 1.28 | within the noise |
| B. road measures bursts, against road assumes independent loss | 5 %, independent, road measures bursts | 5 %, independent | Safe stops per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| B. against no loss | 5 %, independent, road measures bursts | No loss | Served (veh/h) | 15 | 5,627 | 5,957 | -330 (−6 %) | -394 to -266 | outside the noise |
| A. against no loss | 5 %, bursts of 0.2 s | No loss | Served (veh/h) | 5 | 5,425 | 6,002 | -578 (−10 %) | -706 to -449 | outside the noise |
| A. bursts against independent loss | 5 %, bursts of 0.2 s | 5 %, independent | Served (veh/h) | 5 | 5,425 | 5,617 | -192 (−3 %) | -268 to -116 | outside the noise |
| A. bursts against independent loss | 5 %, bursts of 0.2 s | 5 %, independent | Supervision brakes per run | 5 | 3,677 | 1.40 | 3,675 (+262,514 %) | 3,193 to 4,157 | outside the noise |
| A. bursts against independent loss | 5 %, bursts of 0.2 s | 5 %, independent | Safe stops per run | 5 | 55.6 | 0.00 | 55.6 | 43.4 to 67.8 | outside the noise |
| B. road measures bursts, against road assumes independent loss | 5 %, bursts of 0.2 s, road measures bursts | 5 %, bursts of 0.2 s | Served (veh/h) | 5 | 3,395 | 5,425 | -2,030 (−37 %) | -2,239 to -1,821 | outside the noise |
| B. road measures bursts, against road assumes independent loss | 5 %, bursts of 0.2 s, road measures bursts | 5 %, bursts of 0.2 s | Supervision brakes per run | 5 | 5.20 | 3,677 | -3,671 (−100 %) | -4,149 to -3,194 | outside the noise |
| B. road measures bursts, against road assumes independent loss | 5 %, bursts of 0.2 s, road measures bursts | 5 %, bursts of 0.2 s | Safe stops per run | 5 | 32.2 | 55.6 | -23.4 (−42 %) | -42.2 to -4.62 | outside the noise |
| B. against no loss | 5 %, bursts of 0.2 s, road measures bursts | No loss | Served (veh/h) | 5 | 3,395 | 6,002 | -2,607 (−43 %) | -2,812 to -2,403 | outside the noise |
| A. against no loss | 5 %, bursts of 0.5 s | No loss | Served (veh/h) | 15 | 4,526 | 5,957 | -1,431 (−24 %) | -1,535 to -1,326 | outside the noise |
| A. bursts against independent loss | 5 %, bursts of 0.5 s | 5 %, independent | Served (veh/h) | 15 | 4,526 | 5,620 | -1,094 (−19 %) | -1,195 to -993 | outside the noise |
| A. bursts against independent loss | 5 %, bursts of 0.5 s | 5 %, independent | Supervision brakes per run | 15 | 5,067 | 1.20 | 5,066 (+422,167 %) | 4,972 to 5,160 | outside the noise |
| A. bursts against independent loss | 5 %, bursts of 0.5 s | 5 %, independent | Safe stops per run | 15 | 1,283 | 0.00 | 1,283 | 1,261 to 1,305 | outside the noise |
| B. road measures bursts, against road assumes independent loss | 5 %, bursts of 0.5 s, road measures bursts | 5 %, bursts of 0.5 s | Served (veh/h) | 5 | 1,826 | 4,566 | -2,740 (−60 %) | -2,844 to -2,636 | outside the noise |
| B. road measures bursts, against road assumes independent loss | 5 %, bursts of 0.5 s, road measures bursts | 5 %, bursts of 0.5 s | Supervision brakes per run | 5 | 0.00 | 5,047 | -5,047 (−100 %) | -5,174 to -4,920 | outside the noise |
| B. road measures bursts, against road assumes independent loss | 5 %, bursts of 0.5 s, road measures bursts | 5 %, bursts of 0.5 s | Safe stops per run | 5 | 470 | 1,306 | -835 (−64 %) | -902 to -768 | outside the noise |
| B. against no loss | 5 %, bursts of 0.5 s, road measures bursts | No loss | Served (veh/h) | 5 | 1,826 | 6,002 | -4,176 (−70 %) | -4,337 to -4,015 | outside the noise |
| A. against no loss | 5 %, bursts of 2 s | No loss | Served (veh/h) | 5 | 2,645 | 6,002 | -3,358 (−56 %) | -3,616 to -3,099 | outside the noise |
| A. bursts against independent loss | 5 %, bursts of 2 s | 5 %, independent | Served (veh/h) | 5 | 2,645 | 5,617 | -2,972 (−53 %) | -3,318 to -2,626 | outside the noise |
| A. bursts against independent loss | 5 %, bursts of 2 s | 5 %, independent | Supervision brakes per run | 5 | 2,175 | 1.40 | 2,174 (+155,257 %) | 1,982 to 2,365 | outside the noise |
| A. bursts against independent loss | 5 %, bursts of 2 s | 5 %, independent | Safe stops per run | 5 | 2,064 | 0.00 | 2,064 | 1,955 to 2,173 | outside the noise |
| B. road measures bursts, against road assumes independent loss | 5 %, bursts of 2 s, road measures bursts | 5 %, bursts of 2 s | Served (veh/h) | 5 | 1,639 | 2,645 | -1,006 (−38 %) | -1,134 to -878 | outside the noise |
| B. road measures bursts, against road assumes independent loss | 5 %, bursts of 2 s, road measures bursts | 5 %, bursts of 2 s | Supervision brakes per run | 5 | 0.00 | 2,175 | -2,175 (−100 %) | -2,367 to -1,983 | outside the noise |
| B. road measures bursts, against road assumes independent loss | 5 %, bursts of 2 s, road measures bursts | 5 %, bursts of 2 s | Safe stops per run | 5 | 957 | 2,064 | -1,107 (−54 %) | -1,204 to -1,010 | outside the noise |
| B. against no loss | 5 %, bursts of 2 s, road measures bursts | No loss | Served (veh/h) | 5 | 1,639 | 6,002 | -4,363 (−73 %) | -4,555 to -4,172 | outside the noise |
| C. 10 % independent | 10 %, independent, fixed gaps | 10 %, independent, tolerance 0.0001 | Served (veh/h) | 5 | 6,038 | 5,394 | 643 (+12 %) | 487 to 800 | outside the noise |
| C. 10 % independent | 10 %, independent, fixed gaps | 10 %, independent, tolerance 0.0001 | Supervision brakes per run | 5 | 223 | 3.80 | 219 (+5,774 %) | 189 to 249 | outside the noise |
| C. 10 % independent | 10 %, independent, tolerance 0.01 | 10 %, independent, tolerance 0.0001 | Served (veh/h) | 5 | 5,966 | 5,394 | 571 (+11 %) | 370 to 772 | outside the noise |
| C. 10 % independent | 10 %, independent, tolerance 0.01 | 10 %, independent, tolerance 0.0001 | Supervision brakes per run | 5 | 212 | 3.80 | 208 (+5,479 %) | 181 to 235 | outside the noise |
| C. 10 % independent | 10 %, independent, tolerance 0.001 | 10 %, independent, tolerance 0.0001 | Served (veh/h) | 5 | 5,637 | 5,394 | 242 (+4 %) | 157 to 328 | outside the noise |
| C. 10 % independent | 10 %, independent, tolerance 0.001 | 10 %, independent, tolerance 0.0001 | Supervision brakes per run | 5 | 21.8 | 3.80 | 18.0 (+474 %) | 10.2 to 25.8 | outside the noise |
| C. 10 % independent | 10 %, independent, tolerance 0.00001 | 10 %, independent, tolerance 0.0001 | Served (veh/h) | 5 | 5,101 | 5,394 | -294 (−5 %) | -382 to -205 | outside the noise |
| C. 10 % independent | 10 %, independent, tolerance 0.00001 | 10 %, independent, tolerance 0.0001 | Supervision brakes per run | 5 | 0.20 | 3.80 | -3.60 (−95 %) | -6.46 to -0.74 | outside the noise |
| C. 10 % independent | 10 %, independent, tolerance 0.000001 | 10 %, independent, tolerance 0.0001 | Served (veh/h) | 5 | 4,847 | 5,394 | -547 (−10 %) | -693 to -402 | outside the noise |
| C. 10 % independent | 10 %, independent, tolerance 0.000001 | 10 %, independent, tolerance 0.0001 | Supervision brakes per run | 5 | 0.20 | 3.80 | -3.60 (−95 %) | -7.07 to -0.13 | outside the noise |
| C. two paths, 10 % in bursts | two paths, 10 % each, tolerance 0.01 | two paths, 10 % each, tolerance 0.0001 | Served (veh/h) | 5 | 5,940 | 3,519 | 2,421 (+69 %) | 2,320 to 2,522 | outside the noise |
| C. two paths, 10 % in bursts | two paths, 10 % each, tolerance 0.01 | two paths, 10 % each, tolerance 0.0001 | Supervision brakes per run | 5 | 1,719 | 11.0 | 1,708 (+15,525 %) | 1,551 to 1,865 | outside the noise |
| C. two paths, 10 % in bursts | two paths, 10 % each, tolerance 0.001 | two paths, 10 % each, tolerance 0.0001 | Served (veh/h) | 5 | 4,661 | 3,519 | 1,142 (+32 %) | 1,052 to 1,231 | outside the noise |
| C. two paths, 10 % in bursts | two paths, 10 % each, tolerance 0.001 | two paths, 10 % each, tolerance 0.0001 | Supervision brakes per run | 5 | 218 | 11.0 | 207 (+1,882 %) | 177 to 237 | outside the noise |
| D. against no loss | one path, 1 % | No loss | Served (veh/h) | 5 | 2,270 | 6,002 | -3,732 (−62 %) | -3,895 to -3,569 | outside the noise |
| D. against no loss | two paths, 1 % each | No loss | Served (veh/h) | 15 | 5,914 | 5,957 | -42.9 (−1 %) | -109 to 23.1 | within the noise |
| D. two paths against one | two paths, 1 % each | one path, 1 % | Served (veh/h) | 5 | 5,950 | 2,270 | 3,679 (+162 %) | 3,509 to 3,849 | outside the noise |
| D. two paths against one | two paths, 1 % each | one path, 1 % | Supervision brakes per run | 5 | 17.6 | 0.00 | 17.6 | 14.6 to 20.6 | outside the noise |
| D. two paths against one | two paths, 1 % each | one path, 1 % | Safe stops per run | 5 | 0.00 | 107 | -107 (−100 %) | -122 to -91.6 | outside the noise |
| D. against no loss | one path, 2 % | No loss | Served (veh/h) | 5 | 2,068 | 6,002 | -3,934 (−66 %) | -4,090 to -3,779 | outside the noise |
| D. against no loss | two paths, 2 % each | No loss | Served (veh/h) | 5 | 5,146 | 6,002 | -857 (−14 %) | -1,066 to -648 | outside the noise |
| D. two paths against one | two paths, 2 % each | one path, 2 % | Served (veh/h) | 5 | 5,146 | 2,068 | 3,078 (+149 %) | 2,845 to 3,310 | outside the noise |
| D. two paths against one | two paths, 2 % each | one path, 2 % | Supervision brakes per run | 5 | 26.4 | 0.00 | 26.4 | 23.5 to 29.3 | outside the noise |
| D. two paths against one | two paths, 2 % each | one path, 2 % | Safe stops per run | 5 | 1.00 | 200 | -199 (−100 %) | -208 to -190 | outside the noise |
| D. against no loss | one path, 5 % | No loss | Served (veh/h) | 5 | 1,826 | 6,002 | -4,176 (−70 %) | -4,337 to -4,015 | outside the noise |
| D. against no loss | two paths, 5 % each | No loss | Served (veh/h) | 5 | 4,177 | 6,002 | -1,826 (−30 %) | -1,964 to -1,687 | outside the noise |
| D. two paths against one | two paths, 5 % each | one path, 5 % | Served (veh/h) | 5 | 4,177 | 1,826 | 2,350 (+129 %) | 2,168 to 2,533 | outside the noise |
| D. two paths against one | two paths, 5 % each | one path, 5 % | Supervision brakes per run | 5 | 19.0 | 0.00 | 19.0 | 14.2 to 23.8 | outside the noise |
| D. two paths against one | two paths, 5 % each | one path, 5 % | Safe stops per run | 5 | 4.60 | 470 | -466 (−99 %) | -485 to -446 | outside the noise |
| D. against no loss | one path, 10 % | No loss | Served (veh/h) | 15 | 1,785 | 5,957 | -4,171 (−70 %) | -4,266 to -4,076 | outside the noise |
| D. against no loss | two paths, 10 % each | No loss | Served (veh/h) | 15 | 3,477 | 5,957 | -2,480 (−42 %) | -2,552 to -2,408 | outside the noise |
| D. two paths against one | two paths, 10 % each | one path, 10 % | Served (veh/h) | 15 | 3,477 | 1,785 | 1,691 (+95 %) | 1,633 to 1,750 | outside the noise |
| D. two paths against one | two paths, 10 % each | one path, 10 % | Supervision brakes per run | 15 | 9.73 | 0.00 | 9.73 | 7.88 to 11.6 | outside the noise |
| D. two paths against one | two paths, 10 % each | one path, 10 % | Safe stops per run | 15 | 20.4 | 934 | -914 (−98 %) | -930 to -898 | outside the noise |
| D. against no loss | two paths, 20 % each | No loss | Served (veh/h) | 5 | 2,984 | 6,002 | -3,018 (−50 %) | -3,192 to -2,845 | outside the noise |
| D. common cause | two paths, 2 % each, half of it common to both | two paths, 2 % each | Served (veh/h) | 5 | 2,309 | 5,146 | -2,837 (−55 %) | -3,039 to -2,635 | outside the noise |
| D. common cause | two paths, 2 % each, half of it common to both | two paths, 2 % each | Supervision brakes per run | 5 | 0.00 | 26.4 | -26.4 (−100 %) | -29.3 to -23.5 | outside the noise |
| D. common cause | two paths, 2 % each, half of it common to both | two paths, 2 % each | Safe stops per run | 5 | 117 | 1.00 | 116 (+11,600 %) | 98.4 to 134 | outside the noise |
| D. common cause | two paths, 10 % each, half of it common to both | two paths, 10 % each | Served (veh/h) | 5 | 1,858 | 3,519 | -1,661 (−47 %) | -1,792 to -1,530 | outside the noise |
| D. common cause | two paths, 10 % each, half of it common to both | two paths, 10 % each | Supervision brakes per run | 5 | 0.00 | 11.0 | -11.0 (−100 %) | -15.2 to -6.79 | outside the noise |
| D. common cause | two paths, 10 % each, half of it common to both | two paths, 10 % each | Safe stops per run | 5 | 475 | 19.6 | 455 (+2,323 %) | 427 to 483 | outside the noise |
| D. common cause | two paths, 10 % each, all of it common to both | two paths, 10 % each | Served (veh/h) | 5 | 1,789 | 3,519 | -1,730 (−49 %) | -1,878 to -1,582 | outside the noise |
| D. common cause | two paths, 10 % each, all of it common to both | two paths, 10 % each | Supervision brakes per run | 5 | 0.00 | 11.0 | -11.0 (−100 %) | -15.2 to -6.79 | outside the noise |
| D. common cause | two paths, 10 % each, all of it common to both | two paths, 10 % each | Safe stops per run | 5 | 944 | 19.6 | 924 (+4,714 %) | 881 to 967 | outside the noise |
| D. sending twice | one path, 10 %, every authority sent twice | one path, 10 % | Served (veh/h) | 15 | 1,781 | 1,785 | -4.00 (−0 %) | -19.4 to 11.4 | within the noise |
| D. sending twice | one path, 10 %, every authority sent twice | one path, 10 % | Supervision brakes per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| D. sending twice | one path, 10 %, every authority sent twice | one path, 10 % | Safe stops per run | 15 | 889 | 934 | -45.6 (−5 %) | -70.7 to -20.5 | outside the noise |
| D. sending twice | one path, 10 % independent, every authority sent twice | one path, 10 % independent | Served (veh/h) | 5 | 5,991 | 5,419 | 572 (+11 %) | 348 to 796 | outside the noise |
| D. sending twice | one path, 10 % independent, every authority sent twice | one path, 10 % independent | Supervision brakes per run | 5 | 0.80 | 3.00 | -2.20 (−73 %) | -4.24 to -0.16 | outside the noise |
| D. sending twice | one path, 10 % independent, every authority sent twice | one path, 10 % independent | Safe stops per run | 5 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| D. sending twice | one path, 10 % independent, every authority sent twice | two paths, 10 % independent each | Served (veh/h) | 15 | 5,959 | 5,974 | -14.7 (−0 %) | -98.0 to 68.7 | within the noise |
| D. sending twice | one path, 10 % independent, every authority sent twice | two paths, 10 % independent each | Supervision brakes per run | 15 | 0.33 | 0.07 | 0.27 (+400 %) | -0.18 to 0.71 | within the noise |
| D. sending twice | one path, 10 % independent, every authority sent twice | two paths, 10 % independent each | Safe stops per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| E. against no loss | 200 m dead spot for 60 s | No loss | Served (veh/h) | 15 | 5,002 | 5,957 | -955 (−16 %) | -1,522 to -388 | outside the noise |
| E. against no loss | 200 m dead spot for 60 s | No loss | Supervision brakes per run | 15 | 15.7 | 0.00 | 15.7 | 13.5 to 17.9 | outside the noise |
| E. against no loss | 200 m dead spot for 60 s | No loss | Safe stops per run | 15 | 26.5 | 0.00 | 26.5 | 25.0 to 27.9 | outside the noise |
| E. second path | 200 m dead spot for 60 s, second path not affected | 200 m dead spot for 60 s | Served (veh/h) | 15 | 5,957 | 5,002 | 955 (+19 %) | 388 to 1,522 | outside the noise |
| E. second path | 200 m dead spot for 60 s, second path not affected | 200 m dead spot for 60 s | Supervision brakes per run | 15 | 0.00 | 15.7 | -15.7 (−100 %) | -17.9 to -13.5 | outside the noise |
| E. second path | 200 m dead spot for 60 s, second path not affected | 200 m dead spot for 60 s | Safe stops per run | 15 | 0.00 | 26.5 | -26.5 (−100 %) | -27.9 to -25.0 | outside the noise |
| E. against no loss | 20 m dead spot, permanent | No loss | Served (veh/h) | 5 | 0.00 | 6,002 | -6,002 (−100 %) | -6,225 to -5,780 | outside the noise |
| E. against no loss | 20 m dead spot, permanent | No loss | Supervision brakes per run | 5 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| E. against no loss | 20 m dead spot, permanent | No loss | Safe stops per run | 5 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| E. second path | 20 m dead spot, permanent, second path not affected | 20 m dead spot, permanent | Served (veh/h) | 5 | 6,002 | 0.00 | 6,002 | 5,780 to 6,225 | outside the noise |
| E. second path | 20 m dead spot, permanent, second path not affected | 20 m dead spot, permanent | Supervision brakes per run | 5 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| E. second path | 20 m dead spot, permanent, second path not affected | 20 m dead spot, permanent | Safe stops per run | 5 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| F. with acknowledgement (the default) against without | No loss | No loss, without acknowledgement | Lane-change vehicles left on an old authority per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| F. with acknowledgement (the default) against without | No loss | No loss, without acknowledgement | Served (veh/h) | 15 | 5,957 | 5,978 | -21.6 (−0 %) | -77.5 to 34.3 | within the noise |
| F. with acknowledgement (the default) against without | No loss | No loss, without acknowledgement | Supervision brakes per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| F. with acknowledgement (the default) against without | No loss | No loss, without acknowledgement | Safe stops per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| F. with acknowledgement (the default) against without | 10 %, independent, tolerance 0.0001 | 10 %, independent, tolerance 0.0001, without acknowledgement | Lane-change vehicles left on an old authority per run | 15 | 0.00 | 253 | -253 (−100 %) | -261 to -245 | outside the noise |
| F. with acknowledgement (the default) against without | 10 %, independent, tolerance 0.0001 | 10 %, independent, tolerance 0.0001, without acknowledgement | Served (veh/h) | 15 | 5,354 | 5,351 | 2.93 (+0 %) | -46.7 to 52.6 | within the noise |
| F. with acknowledgement (the default) against without | 10 %, independent, tolerance 0.0001 | 10 %, independent, tolerance 0.0001, without acknowledgement | Supervision brakes per run | 15 | 3.53 | 4.00 | -0.47 (−12 %) | -2.34 to 1.40 | within the noise |
| F. with acknowledgement (the default) against without | 10 %, independent, tolerance 0.0001 | 10 %, independent, tolerance 0.0001, without acknowledgement | Safe stops per run | 15 | 0.00 | 0.00 | 0.00 | 0.00 to 0.00 | identical |
| F. with acknowledgement (the default) against without | 5 %, bursts of 0.5 s | 5 %, bursts of 0.5 s, without acknowledgement | Lane-change vehicles left on an old authority per run | 15 | 0.00 | 153 | -153 (−100 %) | -163 to -143 | outside the noise |
| F. with acknowledgement (the default) against without | 5 %, bursts of 0.5 s | 5 %, bursts of 0.5 s, without acknowledgement | Served (veh/h) | 15 | 4,526 | 4,528 | -1.87 (−0 %) | -120 to 117 | within the noise |
| F. with acknowledgement (the default) against without | 5 %, bursts of 0.5 s | 5 %, bursts of 0.5 s, without acknowledgement | Supervision brakes per run | 15 | 5,067 | 5,049 | 18.3 (+0 %) | -126 to 162 | within the noise |
| F. with acknowledgement (the default) against without | 5 %, bursts of 0.5 s | 5 %, bursts of 0.5 s, without acknowledgement | Safe stops per run | 15 | 1,283 | 1,274 | 8.93 (+1 %) | -26.6 to 44.5 | within the noise |
| F. with acknowledgement (the default) against without | two paths, 10 % each | two paths, 10 % each, without acknowledgement | Lane-change vehicles left on an old authority per run | 15 | 0.00 | 14.1 | -14.1 (−100 %) | -16.0 to -12.2 | outside the noise |
| F. with acknowledgement (the default) against without | two paths, 10 % each | two paths, 10 % each, without acknowledgement | Served (veh/h) | 15 | 3,477 | 3,469 | 7.47 (+0 %) | -34.7 to 49.6 | within the noise |
| F. with acknowledgement (the default) against without | two paths, 10 % each | two paths, 10 % each, without acknowledgement | Supervision brakes per run | 15 | 9.73 | 7.53 | 2.20 (+29 %) | -0.44 to 4.84 | within the noise |
| F. with acknowledgement (the default) against without | two paths, 10 % each | two paths, 10 % each, without acknowledgement | Safe stops per run | 15 | 20.4 | 20.3 | 0.07 (+0 %) | -3.32 to 3.46 | within the noise |
| F. with acknowledgement (the default) against without | 200 m dead spot for 60 s | 200 m dead spot for 60 s, without acknowledgement | Lane-change vehicles left on an old authority per run | 15 | 0.00 | 19.9 | -19.9 (−100 %) | -24.3 to -15.4 | outside the noise |
| F. with acknowledgement (the default) against without | 200 m dead spot for 60 s | 200 m dead spot for 60 s, without acknowledgement | Served (veh/h) | 15 | 5,002 | 5,180 | -179 (−3 %) | -994 to 637 | within the noise |
| F. with acknowledgement (the default) against without | 200 m dead spot for 60 s | 200 m dead spot for 60 s, without acknowledgement | Supervision brakes per run | 15 | 15.7 | 17.7 | -2.07 (−12 %) | -5.37 to 1.24 | within the noise |
| F. with acknowledgement (the default) against without | 200 m dead spot for 60 s | 200 m dead spot for 60 s, without acknowledgement | Safe stops per run | 15 | 26.5 | 26.1 | 0.33 (+1 %) | -1.75 to 2.41 | within the noise |
