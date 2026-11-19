# SDR simulator — experiment results

Generated 2026-11-19 07:46 · full run · 340 s compute

Corridor: 5 km, 3 lanes, on-ramp merging at 2.0–2.3 km, off-ramp at 3.5 km (20 % of vehicles exit), 10 % trucks.
"Today" is the same corridor with 100 % human drivers; every SDR row is 100 % SDR-guided vehicles.
Hybrid separation (recommended, the default) = relative, plus an absolute gap behind trucks, behind any vehicle that reports a fault, and in/just before a segment whose road sensors are down. Platoon breaks are off (section 3 shows why).

## 1. Throughput and delay vs demand

Ramp demand 900 veh/h in all runs. Warm-up 5 min, measured over 15 min.

| System | Main demand (veh/h) | Served (veh/h) | Served % | Mean speed (km/h) | Trip delay (s) | Queue at gates (end) | Max gate wait (s) | Collisions | Hard brakes / 1000 veh-km | Braking loss (Wh/veh-km) |
|---|---|---|---|---|---|---|---|---|---|---|
| Today (human drivers) | 2,400 | 3,292 | 96 | 85 | 53 | 0 | 0 | 0.5 | 699 | 74.1 |
| Today (human drivers) | 3,600 | 4,146 | 91 | 64 | 108 | 1 | 5 | 0.5 | 1,559 | 81.1 |
| Today (human drivers) | 4,800 | 4,364 | 76 | 45 | 182 | 160 | 109 | 0.5 | 2,496 | 71.4 |
| Today (human drivers) | 6,000 | 4,204 | 62 | 43 | 255 | 582 | 356 | 1.0 | 3,222 | 79.9 |
| SDR, absolute separation | 2,400 | 2,668 | 78 | 106 | 135 | 234 | 507 | 0.0 | 1 | 31.4 |
| SDR, absolute separation | 3,600 | 2,722 | 60 | 105 | 271 | 617 | 523 | 0.0 | 0 | 31.3 |
| SDR, absolute separation | 4,800 | 2,750 | 48 | 104 | 327 | 1,002 | 698 | 0.0 | 1 | 32.7 |
| SDR, absolute separation | 6,000 | 2,710 | 40 | 104 | 370 | 1,385 | 799 | 0.0 | 1 | 32.6 |
| SDR, absolute + adaptive speed | 2,400 | 3,240 | 95 | 59 | 154 | 39 | 154 | 0.0 | 2 | 6.8 |
| SDR, absolute + adaptive speed | 3,600 | 4,002 | 88 | 57 | 174 | 157 | 600 | 0.0 | 1 | 11.8 |
| SDR, absolute + adaptive speed | 4,800 | 4,052 | 71 | 56 | 268 | 513 | 669 | 0.0 | 6 | 13.1 |
| SDR, absolute + adaptive speed | 6,000 | 4,096 | 60 | 56 | 333 | 882 | 653 | 0.0 | 4 | 13.0 |
| SDR, relative separation | 2,400 | 3,382 | 99 | 112 | 14 | 3 | 6 | 0.0 | 0 | 23.0 |
| SDR, relative separation | 3,600 | 4,570 | 100 | 110 | 16 | 9 | 28 | 0.0 | 0 | 29.8 |
| SDR, relative separation | 4,800 | 5,542 | 97 | 107 | 29 | 65 | 270 | 0.0 | 0 | 36.3 |
| SDR, relative separation | 6,000 | 6,358 | 93 | 104 | 26 | 159 | 626 | 0.0 | 0 | 44.1 |
| SDR, hybrid separation | 2,400 | 3,408 | 100 | 111 | 19 | 10 | 35 | 0.0 | 0 | 24.7 |
| SDR, hybrid separation | 3,600 | 4,388 | 96 | 108 | 33 | 52 | 215 | 0.0 | 1 | 35.0 |
| SDR, hybrid separation | 4,800 | 5,204 | 91 | 105 | 39 | 165 | 632 | 0.0 | 1 | 40.3 |
| SDR, hybrid separation | 6,000 | 5,920 | 87 | 102 | 81 | 298 | 759 | 0.0 | 0 | 43.6 |

Trip delay = time from arriving at the entry (including waiting at a gate) to leaving the corridor, minus free-flow time.

## 2. Incidents

Main demand 4,200 veh/h + ramp 600 veh/h. Incident at t = 10 min around x = 3 km, observed for 5 min. "Brick-wall stop": a vehicle hits something no sensor saw and stops within about a second. "Sudden 50 % brake loss": the brakes of one vehicle halve; SDR health monitoring reports it after 0.5 s (sooner once it brakes); a human driver is not told.

| Incident | System | Runs | Runs with a collision | Collisions | Worst impact (km/h) | Guardian activations | Safe stops | Supervision brakes | Hard brakes per run |
|---|---|---|---|---|---|---|---|---|---|
| debris | Today (human drivers) | 6 | 1 | 1 | 10 | 0 | 0 | 0 | 4,359 |
| debris | SDR, absolute separation | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 40 |
| debris | SDR, relative separation | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 9 |
| debris | SDR, hybrid separation | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 6 |
| brick-wall stop | Today (human drivers) | 6 | 4 | 4 | 80 | 0 | 0 | 0 | 4,682 |
| brick-wall stop | SDR, absolute separation | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 14 |
| brick-wall stop | SDR, relative separation | 6 | 3 | 5 | 69 | 7 | 0 | 7 | 16 |
| brick-wall stop | SDR, hybrid separation | 6 | 2 | 4 | 66 | 7 | 0 | 7 | 15 |
| vehicle comms loss | Today (human drivers) | n/a | | | | | | | |
| vehicle comms loss | SDR, absolute separation | 6 | 0 | 0 | 0 | 0 | 6 | 4 | 6 |
| vehicle comms loss | SDR, relative separation | 6 | 0 | 0 | 0 | 0 | 6 | 2 | 7 |
| vehicle comms loss | SDR, hybrid separation | 6 | 0 | 0 | 0 | 0 | 6 | 3 | 8 |
| segment controller failure (60 s) | Today (human drivers) | n/a | | | | | | | |
| segment controller failure (60 s) | SDR, absolute separation | 6 | 0 | 0 | 0 | 0 | 196 | 150 | 42 |
| segment controller failure (60 s) | SDR, relative separation | 6 | 0 | 0 | 0 | 0 | 296 | 202 | 60 |
| segment controller failure (60 s) | SDR, hybrid separation | 6 | 0 | 0 | 0 | 0 | 291 | 207 | 61 |
| sudden 50 % brake loss | Today (human drivers) | 6 | 2 | 2 | 9 | 0 | 0 | 0 | 3,131 |
| sudden 50 % brake loss | SDR, absolute separation | 6 | 0 | 0 | 0 | 0 | 0 | 4 | 2 |
| sudden 50 % brake loss | SDR, relative separation | 6 | 0 | 0 | 0 | 4 | 0 | 4 | 1 |
| sudden 50 % brake loss | SDR, hybrid separation | 6 | 0 | 0 | 0 | 4 | 0 | 8 | 3 |

## 3. Hybrid separation variants

Capacity: main 6,000 + ramp 900 veh/h (more than any variant can carry), 2 runs. Safety: 6 runs each at 4,200 + 600 veh/h; "load falls off a truck" drops an object just behind a truck that has a vehicle within 150 m behind it.

| Variant | Served (veh/h) | Mean speed (km/h) | Trip delay (s) | Brick-wall stop: runs with collision / collisions / worst (km/h) | Lost load: runs with collision / collisions / worst (km/h) | Lost load: mean gap of the follower (m) |
|---|---|---|---|---|---|---|
| Relative (no hybrid rules) | 6,358 | 104 | 26 | 5 of 6 / 8 / 69 | 6 of 6 / 15 / 78 | 15 |
| Relative + absolute behind faulty vehicles only | 6,358 | 104 | 26 | 5 of 6 / 8 / 69 | 6 of 6 / 15 / 78 | 15 |
| + platoon break every 20 | 6,338 | 104 | 35 | 5 of 6 / 7 / 70 | 6 of 6 / 10 / 78 | 27 |
| + platoon break every 10 | 5,906 | 103 | 70 | 5 of 6 / 8 / 69 | 6 of 6 / 16 / 78 | 20 |
| + platoon break every 5 | 5,250 | 103 | 147 | 5 of 6 / 8 / 68 | 5 of 6 / 13 / 79 | 27 |
| + platoon break every 3 | 4,546 | 104 | 218 | 3 of 6 / 4 / 69 | 5 of 6 / 12 / 78 | 23 |
| + absolute behind trucks (recommended hybrid) | 5,920 | 102 | 81 | 6 of 6 / 8 / 70 | 0 of 6 / 0 / 0 | 57 |
| + absolute behind trucks + platoon break every 10 | 5,192 | 102 | 146 | 3 of 6 / 4 / 70 | 0 of 6 / 0 / 0 | 67 |
| Absolute | 2,710 | 104 | 370 | 0 of 6 / 0 / 0 | 0 of 6 / 0 / 0 | 54 |

## 4. Detection layers vs foreign objects

An object that stops a vehicle dead (worst case) appears in lane 2 at 4,200 + 600 veh/h; 6 runs per row, observed for 4 minutes. Road cameras confirm an object after 0.5 s; each vehicle's own sensor sees it within 120 m with the stated probability (rolled per vehicle); "shared" means the detecting vehicle reports it to the road (confirmed one control cycle later) and with V2V also directly to nearby vehicles.

| Scenario | Detection layers | Policy | Runs with a collision | Collisions | Vehicles that hit the object | Worst impact (km/h) | Mean distance of first vehicle (m) |
|---|---|---|---|---|---|---|---|
| object 150 m ahead | Human drivers (see it within 150 m) | Today | 0 of 6 | 0 | 0 | 0 | 135 |
| object 150 m ahead | Nobody detects it | SDR absolute | 6 of 6 | 7 | 7 | 120 | 151 |
| object 150 m ahead | Nobody detects it | SDR relative | 6 of 6 | 16 | 10 | 120 | 152 |
| object 150 m ahead | Nobody detects it | SDR hybrid | 6 of 6 | 12 | 8 | 120 | 151 |
| object 150 m ahead | Road cameras only (95 %, 0.5 s) | SDR absolute | 0 of 6 | 0 | 0 | 0 | 151 |
| object 150 m ahead | Road cameras only (95 %, 0.5 s) | SDR relative | 0 of 6 | 0 | 0 | 0 | 152 |
| object 150 m ahead | Road cameras only (95 %, 0.5 s) | SDR hybrid | 0 of 6 | 0 | 0 | 0 | 151 |
| object 150 m ahead | Car sensors only (90 %), not shared | SDR absolute | 6 of 6 | 8 | 8 | 120 | 151 |
| object 150 m ahead | Car sensors only (90 %), not shared | SDR relative | 6 of 6 | 20 | 8 | 120 | 152 |
| object 150 m ahead | Car sensors only (90 %), not shared | SDR hybrid | 6 of 6 | 10 | 9 | 120 | 151 |
| object 150 m ahead | Car sensors (90 %) + V2V | SDR absolute | 2 of 6 | 2 | 2 | 120 | 151 |
| object 150 m ahead | Car sensors (90 %) + V2V | SDR relative | 2 of 6 | 5 | 3 | 120 | 152 |
| object 150 m ahead | Car sensors (90 %) + V2V | SDR hybrid | 2 of 6 | 3 | 3 | 120 | 151 |
| object 150 m ahead | Road cameras + car sensors + V2V | SDR absolute | 0 of 6 | 0 | 0 | 0 | 151 |
| object 150 m ahead | Road cameras + car sensors + V2V | SDR relative | 0 of 6 | 0 | 0 | 0 | 152 |
| object 150 m ahead | Road cameras + car sensors + V2V | SDR hybrid | 0 of 6 | 0 | 0 | 0 | 151 |
| object 300 m ahead | Human drivers (see it within 150 m) | Today | 0 of 6 | 0 | 0 | 0 | 156 |
| object 300 m ahead | Nobody detects it | SDR absolute | 6 of 6 | 8 | 8 | 120 | 273 |
| object 300 m ahead | Nobody detects it | SDR relative | 6 of 6 | 16 | 8 | 120 | 226 |
| object 300 m ahead | Nobody detects it | SDR hybrid | 6 of 6 | 13 | 9 | 120 | 214 |
| object 300 m ahead | Road cameras only (95 %, 0.5 s) | SDR absolute | 0 of 6 | 0 | 0 | 0 | 273 |
| object 300 m ahead | Road cameras only (95 %, 0.5 s) | SDR relative | 0 of 6 | 0 | 0 | 0 | 226 |
| object 300 m ahead | Road cameras only (95 %, 0.5 s) | SDR hybrid | 0 of 6 | 0 | 0 | 0 | 214 |
| object 300 m ahead | Car sensors only (90 %), not shared | SDR absolute | 5 of 6 | 8 | 8 | 120 | 273 |
| object 300 m ahead | Car sensors only (90 %), not shared | SDR relative | 6 of 6 | 18 | 10 | 120 | 226 |
| object 300 m ahead | Car sensors only (90 %), not shared | SDR hybrid | 6 of 6 | 12 | 9 | 120 | 214 |
| object 300 m ahead | Car sensors (90 %) + V2V | SDR absolute | 2 of 6 | 2 | 2 | 120 | 273 |
| object 300 m ahead | Car sensors (90 %) + V2V | SDR relative | 2 of 6 | 2 | 2 | 120 | 226 |
| object 300 m ahead | Car sensors (90 %) + V2V | SDR hybrid | 2 of 6 | 5 | 5 | 120 | 214 |
| object 300 m ahead | Road cameras + car sensors + V2V | SDR absolute | 0 of 6 | 0 | 0 | 0 | 273 |
| object 300 m ahead | Road cameras + car sensors + V2V | SDR relative | 0 of 6 | 0 | 0 | 0 | 226 |
| object 300 m ahead | Road cameras + car sensors + V2V | SDR hybrid | 0 of 6 | 0 | 0 | 0 | 214 |
| load falls off a truck | Human drivers (see it within 150 m) | Today | 6 of 6 | 13 | 7 | 75 | 53 |
| load falls off a truck | Nobody detects it | SDR absolute | 6 of 6 | 11 | 11 | 90 | 54 |
| load falls off a truck | Nobody detects it | SDR relative | 6 of 6 | 22 | 11 | 94 | 15 |
| load falls off a truck | Nobody detects it | SDR hybrid | 6 of 6 | 19 | 7 | 91 | 57 |
| load falls off a truck | Road cameras only (95 %, 0.5 s) | SDR absolute | 0 of 6 | 0 | 0 | 0 | 54 |
| load falls off a truck | Road cameras only (95 %, 0.5 s) | SDR relative | 6 of 6 | 16 | 7 | 91 | 15 |
| load falls off a truck | Road cameras only (95 %, 0.5 s) | SDR hybrid | 0 of 6 | 0 | 0 | 0 | 57 |
| load falls off a truck | Car sensors only (90 %), not shared | SDR absolute | 5 of 6 | 9 | 9 | 82 | 54 |
| load falls off a truck | Car sensors only (90 %), not shared | SDR relative | 6 of 6 | 22 | 11 | 90 | 15 |
| load falls off a truck | Car sensors only (90 %), not shared | SDR hybrid | 6 of 6 | 14 | 10 | 91 | 57 |
| load falls off a truck | Car sensors (90 %) + V2V | SDR absolute | 2 of 6 | 4 | 4 | 82 | 54 |
| load falls off a truck | Car sensors (90 %) + V2V | SDR relative | 6 of 6 | 17 | 7 | 90 | 15 |
| load falls off a truck | Car sensors (90 %) + V2V | SDR hybrid | 2 of 6 | 7 | 3 | 91 | 57 |
| load falls off a truck | Road cameras + car sensors + V2V | SDR absolute | 0 of 6 | 0 | 0 | 0 | 54 |
| load falls off a truck | Road cameras + car sensors + V2V | SDR relative | 6 of 6 | 15 | 6 | 90 | 15 |
| load falls off a truck | Road cameras + car sensors + V2V | SDR hybrid | 0 of 6 | 0 | 0 | 0 | 57 |

## 5. Safety lane (hard shoulder)

4,200 + 600 veh/h, 6 runs per row, observed for 20 minutes. A broken-down vehicle loses propulsion and is towed 15 minutes after it stops. Extra delay = vehicle-hours spent in the system in those 20 minutes minus the same traffic without the incident.

| Incident | System | Runs | Collisions | Worst impact (km/h) | Sent to safety lane (per run) | Vehicle stopped in a live lane (s per run) | Extra delay (vehicle-hours) |
|---|---|---|---|---|---|---|---|
| breakdown | Today, no hard shoulder | 6 | 8 | 21 | 0.0 | 900 | 28.2 |
| breakdown | Today, with hard shoulder | 6 | 12 | 16 | 1.0 | 0 | 1.2 |
| breakdown | SDR hybrid, no safety lane | 6 | 0 | 0 | 0.0 | 600 | 6.9 |
| breakdown | SDR hybrid, with safety lane | 6 | 0 | 0 | 1.0 | 0 | -0.0 |
| sudden 50 % brake loss | SDR hybrid, no safety lane | 6 | 0 | 0 | 0.0 | 0 | 0.0 |
| sudden 50 % brake loss | SDR hybrid, with safety lane | 6 | 0 | 0 | 1.0 | 0 | 0.0 |
| vehicle comms loss | SDR hybrid, no safety lane | 6 | 0 | 0 | 0.0 | 14 | -0.2 |
| vehicle comms loss | SDR hybrid, with safety lane | 6 | 0 | 0 | 1.0 | 9 | 0.1 |

## 6. Road-sensor outage (hybrid falls back to absolute locally)

| Demand (veh/h) | Road sensors | Served (veh/h) | Trip delay (s) | Queue at gates (end) | Collisions |
|---|---|---|---|---|---|
| 4200 + 600 | all sensors up | 4,716 | 22 | 28 | 0.0 |
| 4200 + 600 | down at the on-ramp merge (2–3 km) | 3,942 | 147 | 287 | 0.0 |
| 4200 + 600 | down on a plain stretch (4–5 km) | 4,776 | 41 | 28 | 0.0 |
| 6000 + 900 | all sensors up | 5,920 | 81 | 298 | 0.0 |
| 6000 + 900 | down at the on-ramp merge (2–3 km) | 3,988 | 287 | 976 | 0.0 |
| 6000 + 900 | down on a plain stretch (4–5 km) | 5,424 | 139 | 326 | 0.0 |

## 7. Weather

Main demand 3,600 veh/h + ramp 600 veh/h.

| Weather | System | Served (veh/h) | Mean speed (km/h) | Trip delay (s) | Queue at gates (end) | Collisions | Hard brakes / 1000 veh-km |
|---|---|---|---|---|---|---|---|
| dry | Today (human drivers) | 3,768 | 64 | 104 | 0 | 1.5 | 1,544 |
| dry | SDR, absolute separation | 2,710 | 104 | 217 | 509 | 0.0 | 6 |
| dry | SDR, absolute + adaptive speed | 3,986 | 57 | 160 | 70 | 0.0 | 3 |
| dry | SDR, relative separation | 4,262 | 110 | 13 | 3 | 0.0 | 0 |
| dry | SDR, hybrid separation | 4,260 | 109 | 16 | 5 | 0.0 | 0 |
| wet | Today (human drivers) | 3,854 | 58 | 132 | 2 | 0.0 | 1,092 |
| wet | SDR, absolute separation | 2,530 | 105 | 248 | 592 | 0.0 | 2 |
| wet | SDR, absolute + adaptive speed | 3,702 | 56 | 198 | 153 | 0.0 | 2 |
| wet | SDR, relative separation | 4,268 | 110 | 12 | 4 | 0.0 | 0 |
| wet | SDR, hybrid separation | 4,282 | 108 | 17 | 6 | 0.0 | 0 |
| ice | Today (human drivers) | 3,102 | 35 | 233 | 24 | 2.0 | 0 |
| ice | SDR, absolute separation | 1,186 | 81 | 300 | 1,038 | 0.0 | 0 |
| ice | SDR, absolute + adaptive speed | 2,264 | 55 | 348 | 662 | 0.0 | 0 |
| ice | SDR, relative separation | 4,290 | 85 | 58 | 5 | 0.0 | 0 |
| ice | SDR, hybrid separation | 3,542 | 84 | 155 | 255 | 0.0 | 0 |

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
