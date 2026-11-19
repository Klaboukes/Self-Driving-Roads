# SDR simulator: experiment results

Corridor: 5 km, 3 lanes, on-ramp merging at 2.0–2.3 km, off-ramp at 3.5 km (20 % of vehicles exit), 10 % trucks.
"Today" is the same corridor with 100 % human drivers; every SDR row is 100 % SDR-guided vehicles.
Hybrid separation (recommended, and the simulator default) = relative, plus an absolute gap behind trucks, behind any vehicle that reports a fault, and in/just before a segment whose road sensors are down. Platoon breaks are off (section 3 shows why).
"±" is the standard deviation between runs with different traffic (seeds). Differences smaller than that are noise.

## 1. Throughput and delay vs demand

*Full run of 2026-11-19 09:29: 5 runs per throughput row, 10 per incident row.*

Ramp demand 900 veh/h in all runs. Warm-up 5 min, then measured (15 min in a full run, 5 min in a quick run).

| System | Main demand (veh/h) | Served (veh/h) | Served % | Mean speed (km/h) | Trip delay (s) | Queue at gates (end) | Max gate wait (s) | Collisions (all runs) | Hard brakes / 1000 veh-km | Braking loss (Wh/veh-km) |
|---|---|---|---|---|---|---|---|---|---|---|
| Today (human drivers) | 2,400 | 3,364 ± 118 | 101 | 110 | 10 ± 2 | 0 | 1 | 0 | 20 | 47.1 |
| Today (human drivers) | 3,600 | 4,477 ± 106 | 100 | 98 | 30 ± 9 | 1 | 1 | 0 | 45 | 68.5 |
| Today (human drivers) | 4,800 | 5,261 ± 72 | 93 | 75 | 72 ± 11 | 5 | 8 | 0 | 86 | 89.8 |
| Today (human drivers) | 6,000 | 5,249 ± 55 | 77 | 58 | 155 ± 17 | 288 | 173 | 0 | 75 | 77.5 |
| Today (human drivers) | 7,200 | 5,395 ± 121 | 67 | 61 | 212 ± 10 | 660 | 324 | 0 | 72 | 80.2 |
| SDR, absolute separation | 2,400 | 2,685 ± 97 | 80 | 105 | 130 ± 9 | 212 | 368 | 0 | 1 | 31.9 |
| SDR, absolute separation | 3,600 | 2,691 ± 84 | 60 | 105 | 266 ± 8 | 596 | 513 | 0 | 0 | 31.6 |
| SDR, absolute separation | 4,800 | 2,721 ± 127 | 48 | 105 | 329 ± 17 | 985 | 681 | 0 | 0 | 30.7 |
| SDR, absolute separation | 6,000 | 2,738 ± 131 | 40 | 105 | 365 ± 16 | 1,375 | 784 | 0 | 1 | 32.5 |
| SDR, absolute separation | 7,200 | 2,696 ± 105 | 33 | 105 | 400 ± 14 | 1,803 | 852 | 0 | 1 | 31.6 |
| SDR, absolute + adaptive speed | 2,400 | 3,235 ± 76 | 97 | 60 | 144 ± 12 | 24 | 97 | 0 | 1 | 7.5 |
| SDR, absolute + adaptive speed | 3,600 | 3,984 ± 109 | 89 | 58 | 172 ± 4 | 150 | 593 | 0 | 1 | 11.3 |
| SDR, absolute + adaptive speed | 4,800 | 4,103 ± 67 | 73 | 56 | 260 ± 4 | 484 | 651 | 0 | 2 | 13.0 |
| SDR, absolute + adaptive speed | 6,000 | 4,093 ± 75 | 60 | 57 | 326 ± 4 | 880 | 668 | 0 | 1 | 12.7 |
| SDR, absolute + adaptive speed | 7,200 | 4,117 ± 102 | 51 | 57 | 369 ± 3 | 1,286 | 662 | 0 | 1 | 12.8 |
| SDR, relative separation | 2,400 | 3,338 ± 86 | 100 | 111 | 13 ± 1 | 3 | 10 | 0 | 0 | 22.9 |
| SDR, relative separation | 3,600 | 4,507 ± 96 | 101 | 110 | 15 ± 1 | 8 | 34 | 0 | 0 | 27.5 |
| SDR, relative separation | 4,800 | 5,510 ± 167 | 98 | 107 | 29 ± 11 | 61 | 233 | 0 | 0 | 35.1 |
| SDR, relative separation | 6,000 | 6,313 ± 127 | 93 | 105 | 27 ± 6 | 172 | 702 | 0 | 0 | 41.5 |
| SDR, relative separation | 7,200 | 6,807 ± 137 | 84 | 102 | 68 ± 12 | 407 | 941 | 0 | 1 | 43.6 |
| SDR, hybrid separation | 2,400 | 3,356 ± 92 | 100 | 111 | 17 ± 1 | 8 | 33 | 0 | 0 | 23.8 |
| SDR, hybrid separation | 3,600 | 4,319 ± 163 | 96 | 109 | 29 ± 11 | 50 | 197 | 0 | 1 | 33.1 |
| SDR, hybrid separation | 4,800 | 5,131 ± 106 | 91 | 106 | 37 ± 6 | 161 | 646 | 0 | 1 | 39.3 |
| SDR, hybrid separation | 6,000 | 5,842 ± 173 | 86 | 102 | 69 ± 21 | 318 | 876 | 0 | 1 | 42.4 |
| SDR, hybrid separation | 7,200 | 5,882 ± 76 | 73 | 102 | 160 ± 11 | 725 | 846 | 0 | 0 | 42.4 |

Trip delay = time from arriving at the entry (including waiting at a gate) to leaving the corridor, minus free-flow time.

## 2. Incidents

*Full run of 2026-11-19 09:29: 5 runs per throughput row, 10 per incident row.*

Main demand 4,200 veh/h + ramp 600 veh/h. Incident at t = 10 min around x = 3 km, observed for 5 min. "Brick-wall stop": a vehicle hits something no sensor saw and stops within about a second. "Sudden 50 % brake loss": the brakes of one vehicle halve; SDR health monitoring reports it after 0.5 s (sooner once it brakes); a human driver is not told. Numbers in brackets: the same traffic over the same 5 minutes without the incident.

| Incident | System | Runs | Runs with a collision | Collisions (without incident) | Worst impact (km/h) | Guardian activations | Safe stops | Supervision brakes | Hard brakes per run (without incident) |
|---|---|---|---|---|---|---|---|---|---|
| debris | Today (human drivers) | 10 | 1 | 1 (0) | 37 | 0 | 0 | 0 | 237 (69) |
| debris | SDR, absolute separation | 10 | 0 | 0 (0) | 0 | 0 | 0 | 0 | 32 (2) |
| debris | SDR, relative separation | 10 | 0 | 0 (0) | 0 | 0 | 0 | 0 | 9 (0) |
| debris | SDR, hybrid separation | 10 | 0 | 0 (0) | 0 | 0 | 0 | 0 | 8 (2) |
| brick-wall stop | Today (human drivers) | 10 | 9 | 33 (0) | 102 | 0 | 0 | 0 | 238 (69) |
| brick-wall stop | SDR, absolute separation | 10 | 0 | 0 (0) | 0 | 0 | 0 | 0 | 26 (2) |
| brick-wall stop | SDR, relative separation | 10 | 6 | 9 (0) | 69 | 11 | 0 | 11 | 16 (0) |
| brick-wall stop | SDR, hybrid separation | 10 | 5 | 8 (0) | 70 | 9 | 0 | 9 | 15 (2) |
| vehicle comms loss | Today (human drivers) | n/a | | | | | | | |
| vehicle comms loss | SDR, absolute separation | 10 | 0 | 0 (0) | 0 | 0 | 10 | 9 | 7 (2) |
| vehicle comms loss | SDR, relative separation | 10 | 0 | 0 (0) | 0 | 0 | 10 | 4 | 5 (0) |
| vehicle comms loss | SDR, hybrid separation | 10 | 0 | 0 (0) | 0 | 0 | 10 | 7 | 8 (2) |
| segment controller failure (60 s) | Today (human drivers) | n/a | | | | | | | |
| segment controller failure (60 s) | SDR, absolute separation | 10 | 0 | 0 (0) | 0 | 0 | 332 | 271 | 45 (2) |
| segment controller failure (60 s) | SDR, relative separation | 10 | 0 | 0 (0) | 0 | 0 | 493 | 368 | 63 (0) |
| segment controller failure (60 s) | SDR, hybrid separation | 10 | 0 | 0 (0) | 0 | 0 | 476 | 381 | 64 (2) |
| sudden 50 % brake loss | Today (human drivers) | 10 | 0 | 0 (0) | 0 | 0 | 0 | 0 | 69 (69) |
| sudden 50 % brake loss | SDR, absolute separation | 10 | 0 | 0 (0) | 0 | 0 | 0 | 9 | 2 (2) |
| sudden 50 % brake loss | SDR, relative separation | 10 | 0 | 0 (0) | 0 | 6 | 0 | 6 | 1 (0) |
| sudden 50 % brake loss | SDR, hybrid separation | 10 | 0 | 0 (0) | 0 | 7 | 0 | 18 | 2 (2) |

## 3. Hybrid separation variants

*Full run of 2026-11-19 09:29: 5 runs per throughput row, 10 per incident row.*

Capacity: main 7,200 + ramp 900 veh/h (more than any variant can carry). Safety: runs at 4,200 + 600 veh/h; "load falls off a truck" drops an object just behind a truck that has a vehicle within 150 m behind it.

| Variant | Served (veh/h) | Mean speed (km/h) | Trip delay (s) | Brick-wall stop: runs with collision / collisions / worst (km/h) | Lost load: runs with collision / collisions / worst (km/h) | Lost load: mean gap of the follower (m) |
|---|---|---|---|---|---|---|
| Relative (no hybrid rules) | 6,807 ± 137 | 102 | 68 | 6 of 10 / 7 / 69 | 10 of 10 / 25 / 78 | 14 |
| Relative + absolute behind faulty vehicles only | 6,807 ± 137 | 102 | 68 | 6 of 10 / 7 / 69 | 10 of 10 / 25 / 78 | 14 |
| + platoon break every 20 | 6,448 ± 120 | 103 | 115 | 7 of 10 / 9 / 69 | 10 of 10 / 21 / 78 | 19 |
| + platoon break every 10 | 5,986 ± 103 | 103 | 153 | 8 of 10 / 15 / 70 | 9 of 10 / 21 / 78 | 21 |
| + platoon break every 5 | 5,311 ± 72 | 104 | 213 | 7 of 10 / 11 / 70 | 9 of 10 / 20 / 78 | 26 |
| + platoon break every 3 | 4,717 ± 96 | 104 | 257 | 9 of 10 / 11 / 69 | 8 of 10 / 15 / 78 | 29 |
| + absolute behind trucks (recommended hybrid) | 5,882 ± 76 | 102 | 160 | 7 of 10 / 9 / 70 | 0 of 10 / 0 / 0 | 64 |
| + absolute behind trucks + platoon break every 10 | 5,227 ± 72 | 103 | 218 | 6 of 10 / 7 / 70 | 0 of 10 / 0 / 0 | 61 |
| Absolute | 2,696 ± 105 | 105 | 400 | 0 of 10 / 0 / 0 | 0 of 10 / 0 / 0 | 57 |

## 4. Detection layers vs foreign objects

*Full run of 2026-11-19 09:29: 5 runs per throughput row, 10 per incident row.*

An object that stops a vehicle dead (worst case) appears in lane 2 at 4,200 + 600 veh/h, observed for 4 minutes. Road cameras confirm an object after 0.5 s; each vehicle's own sensor sees it within 120 m with the stated probability (rolled per vehicle); "shared" means the detecting vehicle reports it to the road (confirmed one control cycle later) and with V2V also directly to nearby vehicles.

| Scenario | Detection layers | Policy | Runs with a collision | Collisions | Vehicles that hit the object | Worst impact (km/h) | Mean distance of first vehicle (m) |
|---|---|---|---|---|---|---|---|
| object 150 m ahead | Human drivers (see it within 150 m) | Today | 1 of 10 | 3 (1) | 1 | 63 | 135 |
| object 150 m ahead | Nobody detects it | SDR absolute | 10 of 10 | 13 | 13 | 120 | 152 |
| object 150 m ahead | Nobody detects it | SDR relative | 10 of 10 | 22 | 13 | 120 | 151 |
| object 150 m ahead | Nobody detects it | SDR hybrid | 10 of 10 | 23 | 13 | 120 | 152 |
| object 150 m ahead | Road cameras only (95 %, 0.5 s) | SDR absolute | 0 of 10 | 0 | 0 | 0 | 152 |
| object 150 m ahead | Road cameras only (95 %, 0.5 s) | SDR relative | 0 of 10 | 0 | 0 | 0 | 151 |
| object 150 m ahead | Road cameras only (95 %, 0.5 s) | SDR hybrid | 0 of 10 | 0 | 0 | 0 | 152 |
| object 150 m ahead | Car sensors only (90 %), not shared | SDR absolute | 10 of 10 | 14 | 14 | 120 | 152 |
| object 150 m ahead | Car sensors only (90 %), not shared | SDR relative | 10 of 10 | 23 | 15 | 120 | 151 |
| object 150 m ahead | Car sensors only (90 %), not shared | SDR hybrid | 10 of 10 | 24 | 15 | 120 | 152 |
| object 150 m ahead | Car sensors (90 %) + V2V | SDR absolute | 3 of 10 | 3 | 3 | 120 | 152 |
| object 150 m ahead | Car sensors (90 %) + V2V | SDR relative | 3 of 10 | 6 | 4 | 120 | 151 |
| object 150 m ahead | Car sensors (90 %) + V2V | SDR hybrid | 3 of 10 | 7 | 5 | 120 | 152 |
| object 150 m ahead | Road cameras + car sensors + V2V | SDR absolute | 0 of 10 | 0 | 0 | 0 | 152 |
| object 150 m ahead | Road cameras + car sensors + V2V | SDR relative | 0 of 10 | 0 | 0 | 0 | 151 |
| object 150 m ahead | Road cameras + car sensors + V2V | SDR hybrid | 0 of 10 | 0 | 0 | 0 | 152 |
| object 300 m ahead | Human drivers (see it within 150 m) | Today | 1 of 10 | 3 (1) | 1 | 63 | 163 |
| object 300 m ahead | Nobody detects it | SDR absolute | 10 of 10 | 12 | 12 | 120 | 259 |
| object 300 m ahead | Nobody detects it | SDR relative | 10 of 10 | 21 | 14 | 120 | 225 |
| object 300 m ahead | Nobody detects it | SDR hybrid | 10 of 10 | 25 | 16 | 120 | 237 |
| object 300 m ahead | Road cameras only (95 %, 0.5 s) | SDR absolute | 0 of 10 | 0 | 0 | 0 | 259 |
| object 300 m ahead | Road cameras only (95 %, 0.5 s) | SDR relative | 0 of 10 | 0 | 0 | 0 | 225 |
| object 300 m ahead | Road cameras only (95 %, 0.5 s) | SDR hybrid | 0 of 10 | 0 | 0 | 0 | 237 |
| object 300 m ahead | Car sensors only (90 %), not shared | SDR absolute | 8 of 10 | 12 | 12 | 120 | 259 |
| object 300 m ahead | Car sensors only (90 %), not shared | SDR relative | 10 of 10 | 21 | 13 | 120 | 225 |
| object 300 m ahead | Car sensors only (90 %), not shared | SDR hybrid | 10 of 10 | 28 | 15 | 120 | 237 |
| object 300 m ahead | Car sensors (90 %) + V2V | SDR absolute | 3 of 10 | 3 | 3 | 120 | 259 |
| object 300 m ahead | Car sensors (90 %) + V2V | SDR relative | 3 of 10 | 4 | 3 | 120 | 225 |
| object 300 m ahead | Car sensors (90 %) + V2V | SDR hybrid | 3 of 10 | 7 | 5 | 120 | 237 |
| object 300 m ahead | Road cameras + car sensors + V2V | SDR absolute | 0 of 10 | 0 | 0 | 0 | 259 |
| object 300 m ahead | Road cameras + car sensors + V2V | SDR relative | 0 of 10 | 0 | 0 | 0 | 225 |
| object 300 m ahead | Road cameras + car sensors + V2V | SDR hybrid | 0 of 10 | 0 | 0 | 0 | 237 |
| load falls off a truck | Human drivers (see it within 150 m) | Today | 9 of 10 | 26 (1) | 9 | 80 | 37 |
| load falls off a truck | Nobody detects it | SDR absolute | 10 of 10 | 20 | 20 | 111 | 57 |
| load falls off a truck | Nobody detects it | SDR relative | 10 of 10 | 31 | 15 | 94 | 14 |
| load falls off a truck | Nobody detects it | SDR hybrid | 10 of 10 | 29 | 14 | 92 | 64 |
| load falls off a truck | Road cameras only (95 %, 0.5 s) | SDR absolute | 0 of 10 | 0 | 0 | 0 | 57 |
| load falls off a truck | Road cameras only (95 %, 0.5 s) | SDR relative | 10 of 10 | 28 | 12 | 91 | 14 |
| load falls off a truck | Road cameras only (95 %, 0.5 s) | SDR hybrid | 0 of 10 | 0 | 0 | 0 | 64 |
| load falls off a truck | Car sensors only (90 %), not shared | SDR absolute | 7 of 10 | 14 | 14 | 90 | 57 |
| load falls off a truck | Car sensors only (90 %), not shared | SDR relative | 10 of 10 | 35 | 17 | 90 | 14 |
| load falls off a truck | Car sensors only (90 %), not shared | SDR hybrid | 9 of 10 | 22 | 16 | 92 | 64 |
| load falls off a truck | Car sensors (90 %) + V2V | SDR absolute | 3 of 10 | 6 | 6 | 90 | 57 |
| load falls off a truck | Car sensors (90 %) + V2V | SDR relative | 10 of 10 | 27 | 12 | 90 | 14 |
| load falls off a truck | Car sensors (90 %) + V2V | SDR hybrid | 3 of 10 | 11 | 6 | 92 | 64 |
| load falls off a truck | Road cameras + car sensors + V2V | SDR absolute | 0 of 10 | 0 | 0 | 0 | 57 |
| load falls off a truck | Road cameras + car sensors + V2V | SDR relative | 10 of 10 | 25 | 10 | 90 | 14 |
| load falls off a truck | Road cameras + car sensors + V2V | SDR hybrid | 0 of 10 | 0 | 0 | 0 | 64 |

Numbers in brackets (human rows): collisions in the same traffic without the object.

## 5. Safety lane (hard shoulder)

*Full run of 2026-11-19 09:29: 5 runs per throughput row, 10 per incident row.*

4,200 + 600 veh/h, observed for 20 minutes (10 in a quick run). A broken-down vehicle loses propulsion and is towed 15 minutes after it stops. Extra delay = vehicle-hours spent in the system in that time minus the same traffic without the incident. Collisions in brackets: the same traffic without the incident.

| Incident | System | Runs | Collisions (without incident) | Worst impact (km/h) | Sent to safety lane (per run) | Vehicle stopped in a live lane (s per run) | Extra delay (vehicle-hours) |
|---|---|---|---|---|---|---|---|
| breakdown | Today, no hard shoulder | 10 | 1 (1) | 1 | 0.0 | 540 | 15.4 ± 14.6 |
| breakdown | Today, with hard shoulder | 10 | 3 (1) | 17 | 1.0 | 0 | -1.2 ± 5.1 |
| breakdown | SDR hybrid, no safety lane | 10 | 0 (0) | 0 | 0.0 | 630 | 6.0 ± 11.3 |
| breakdown | SDR hybrid, with safety lane | 10 | 0 (0) | 0 | 1.0 | 0 | -0.0 ± 0.0 |
| sudden 50 % brake loss | SDR hybrid, no safety lane | 10 | 0 (0) | 0 | 0.0 | 0 | 0.0 ± 0.0 |
| sudden 50 % brake loss | SDR hybrid, with safety lane | 10 | 0 (0) | 0 | 1.0 | 0 | 0.0 ± 0.0 |
| vehicle comms loss | SDR hybrid, no safety lane | 10 | 0 (0) | 0 | 0.0 | 13 | 0.1 ± 0.0 |
| vehicle comms loss | SDR hybrid, with safety lane | 10 | 0 (0) | 0 | 1.0 | 8 | 0.1 ± 0.1 |

## 6. Road-sensor outage (hybrid falls back to absolute locally)

*Full run of 2026-11-19 09:29: 5 runs per throughput row, 10 per incident row.*

| Demand (veh/h) | Road sensors | Served (veh/h) | Trip delay (s) | Queue at gates (end) | Collisions (all runs) |
|---|---|---|---|---|---|
| 4200 + 600 | all sensors up | 4,736 ± 69 | 21 | 14 | 0 |
| 4200 + 600 | down at the on-ramp merge (2–3 km) | 3,987 ± 56 | 134 | 260 | 0 |
| 4200 + 600 | down on a plain stretch (4–5 km) | 4,750 ± 100 | 43 | 14 | 0 |
| 7200 + 900 | all sensors up | 5,882 ± 76 | 160 | 725 | 0 |
| 7200 + 900 | down at the on-ramp merge (2–3 km) | 3,951 ± 77 | 330 | 1,363 | 0 |
| 7200 + 900 | down on a plain stretch (4–5 km) | 5,354 ± 95 | 220 | 740 | 0 |

## 7. Weather

*Full run of 2026-11-19 09:31: 5 runs per throughput row, 10 per incident row.*

Main demand 3,600 veh/h + ramp 600 veh/h.

| Weather | System | Served (veh/h) | Mean speed (km/h) | Trip delay (s) | Queue at gates (end) | Collisions (all runs) | Hard brakes / 1000 veh-km |
|---|---|---|---|---|---|---|---|
| dry | Today (human drivers) | 4,194 ± 67 | 106 | 14 | 1 | 0 | 25 |
| dry | SDR, absolute separation | 2,773 ± 72 | 105 | 217 | 469 | 0 | 5 |
| dry | SDR, absolute + adaptive speed | 3,968 ± 119 | 58 | 158 | 51 | 0 | 1 |
| dry | SDR, relative separation | 4,195 ± 82 | 110 | 12 | 2 | 0 | 0 |
| dry | SDR, hybrid separation | 4,194 ± 76 | 109 | 15 | 4 | 0 | 0 |
| wet | Today (human drivers) | 4,244 ± 110 | 94 | 34 | 1 | 0 | 15 |
| wet | SDR, absolute separation | 2,500 ± 202 | 104 | 249 | 569 | 0 | 2 |
| wet | SDR, absolute + adaptive speed | 3,737 ± 120 | 57 | 189 | 110 | 0 | 2 |
| wet | SDR, relative separation | 4,205 ± 81 | 110 | 12 | 2 | 0 | 0 |
| wet | SDR, hybrid separation | 4,198 ± 98 | 108 | 17 | 4 | 0 | 0 |
| ice | Today (human drivers) | 4,041 ± 196 | 59 | 139 | 2 | 0 | 0 |
| ice | SDR, absolute separation | 1,182 ± 12 | 81 | 311 | 1,010 | 0 | 0 |
| ice | SDR, absolute + adaptive speed | 2,274 ± 61 | 55 | 348 | 630 | 0 | 0 |
| ice | SDR, relative separation | 4,262 ± 64 | 85 | 57 | 3 | 0 | 0 |
| ice | SDR, hybrid separation | 3,499 ± 32 | 83 | 153 | 240 | 0 | 0 |

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

*Full run of 2026-11-19 09:29: 5 runs per throughput row, 10 per incident row.*

SDR hybrid at 7,200 + 900 veh/h (saturated). "Fixed gaps": every vehicle keeps the standard allowance for stale authority (about two control cycles). "Widened gaps": the road measures the loss rate and adds the allowance shown, so a run of lost messages rarely outlasts it. A supervision brake is full-force braking because the last authority received is about to run out. Smallest spare = the least distance, over all vehicles and runs, between where a vehicle could still stop and the end of its authority (negative would mean an overrun).

| Packet loss | Gaps | Extra allowance (s) | Served (veh/h) | Supervision brakes per run | Safe stops per run | Hard brakes / 1000 veh-km | Collisions (all runs) | Smallest spare (m) |
|---|---|---|---|---|---|---|---|---|
| 0 % | fixed | 0.00 | 5,882 ± 76 | 0 | 0 | 0 | 0 | 1.86 |
| 1 % | fixed | 0.00 | 5,887 ± 97 | 0 | 0 | 0 | 0 | 1.62 |
| 5 % | fixed | 0.00 | 5,920 ± 89 | 19 | 0 | 4 | 0 | 0.01 |
| 10 % | fixed | 0.00 | 5,871 ± 119 | 202 | 0 | 45 | 0 | 0.00 |
| 20 % | fixed | 0.00 | 5,865 ± 89 | 2,293 | 0 | 561 | 0 | 0.00 |
| 50 % | fixed | 0.00 | 5,442 ± 221 | 23,918 | 48 | 5,586 | 0 | 0.00 |
| 0 % | widened | 0.00 | 5,882 ± 76 | 0 | 0 | 0 | 0 | 1.86 |
| 1 % | widened | 0.00 | 5,930 ± 108 | 0 | 0 | 0 | 0 | 0.55 |
| 5 % | widened | 0.11 | 5,482 ± 121 | 0 | 0 | 0 | 0 | 0.38 |
| 10 % | widened | 0.20 | 5,123 ± 93 | 2 | 0 | 2 | 0 | 0.45 |
| 20 % | widened | 0.37 | 4,650 ± 82 | 6 | 0 | 2 | 0 | 0.04 |
| 50 % | widened | 1.13 | 3,274 ± 92 | 9 | 29 | 39 | 0 | 0.00 |

## 10. Truck share

*Full run of 2026-11-19 09:29: 5 runs per throughput row, 10 per incident row.*

Main 7,200 + ramp 900 veh/h (saturated). The hybrid keeps an absolute gap behind every truck, so its cost grows with the truck share.

| Trucks | System | Served (veh/h) | Mean speed (km/h) | Trip delay (s) | Collisions (all runs) |
|---|---|---|---|---|---|
| 0 % | Today (human drivers) | 6,180 ± 102 | 70 | 158 | 0 |
| 0 % | SDR, relative separation | 7,926 ± 154 | 113 | 20 | 0 |
| 0 % | SDR, hybrid separation | 7,926 ± 154 | 113 | 20 | 0 |
| 10 % | Today (human drivers) | 5,395 ± 121 | 61 | 212 | 0 |
| 10 % | SDR, relative separation | 6,807 ± 137 | 102 | 68 | 0 |
| 10 % | SDR, hybrid separation | 5,882 ± 76 | 102 | 160 | 0 |
| 20 % | Today (human drivers) | 4,895 ± 77 | 61 | 237 | 0 |
| 20 % | SDR, relative separation | 6,038 ± 678 | 96 | 106 | 0 |
| 20 % | SDR, hybrid separation | 4,810 ± 73 | 100 | 230 | 0 |
| 30 % | Today (human drivers) | 4,564 ± 72 | 62 | 266 | 1 |
| 30 % | SDR, relative separation | 4,978 ± 628 | 86 | 170 | 0 |
| 30 % | SDR, hybrid separation | 4,082 ± 68 | 98 | 278 | 0 |

## 11. Today's road on its own (calibration check)

*Full run of 2026-11-19 09:29: 5 runs per throughput row, 10 per incident row.*

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
