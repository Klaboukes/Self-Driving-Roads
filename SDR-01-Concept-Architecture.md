# Self Driving Road (SDR) — Concept Architecture v0.1

> **The road plans. The car executes. A small onboard guardian can always say "stop."**

Status: draft for discussion · 2026-11-18, updated 2026-11-19 with simulation results ([SDR-03](SDR-03-Hybrid-Detection-Safety-Lane.md)) and a viability assessment ([SDR-04](SDR-04-Viability-Assessment.md))
End state: **100 % of vehicles on an SDR road are guided by the road**; there is no mixed traffic on SDR lanes.

---

## 1. The core idea

A self-driving car tries to *understand* an unpredictable world using its own sensors. An SDR takes a different route: it *controls the world* the car moves through, the way a railway does.

| | Self-Driving Car (SDC) | Self-Driving Road (SDR) |
|---|---|---|
| Who perceives? | Every car, alone, from its own viewpoint | The road (fixed sensors, full overview) and every car's reported state |
| Who decides? | Every car, guessing what others will do | One coordinator that *knows* what every vehicle will do |
| Uncertainty about other vehicles | High: other drivers are unpredictable | Close to zero: every vehicle follows an issued plan |
| Hard problem | Perception and prediction | Reliability, latency and security of the central system |
| Cost per car | High (sensor suite and compute) | Low (drive-by-wire, positioning, radio, small guardian sensor) |
| Cost of infrastructure | Near zero | High |

**Main point:** most of what makes an SDC hard is *predicting other road users*. When every vehicle follows a known plan, that problem disappears **for vehicles**. It stays for anything the system does not control: pedestrians, animals, debris, cyclists, broken-down non-SDR cars. So **how well SDR works depends on how much of its environment it can control.** That fact decides the rollout (§9).

---

## 2. Design principles (in priority order: safety → efficiency → speed → environment → comfort)

### Safety
1. **Movement authority, not suggestions.** A vehicle may only occupy space-time the system has explicitly granted it. With no valid grant, it stops. (This comes from railway signalling: ETCS Level 3 and CBTC moving-block systems.)
2. **Every grant includes a way out.** The system never issues a plan unless that plan contains a pre-cleared **safe-stop trajectory**. If everything else fails, the vehicle can always stop safely using only what it already has.
3. **Grants expire.** Each authority has a time-to-live, typically 1–3 seconds of driving. If it is not renewed (comms loss, controller crash), the vehicle runs its safe stop. This works like a dead-man's switch.
4. **Two independent eyes.** The car reports where it is, and the road observes where it is. If the two disagree beyond tolerance, the system treats it as a fault.
5. **Failures stay local.** Control is split into road segments. A failed segment affects only the vehicles in that segment, never the whole network.
6. **The onboard guardian has veto power and no other power.** A simple sensor on the car can only brake. It can never steer the car or speed it up.

### Efficiency
7. **Admission control.** Vehicles enter the network only when capacity for their whole trip is available. Congestion is prevented at the door instead of being handled after it forms.
8. **System-optimal routing.** The system routes for the best outcome of the whole network, within fairness limits, not for the fastest trip of each car on its own.
9. **Smooth flow.** No stop-and-go, no phantom jams, and no braking that ripples back through traffic. This saves energy and is also safer.

### Speed
10. **Steady, predictable travel time comes before top speed.** The system lowers cruising speed when that raises throughput or margins. Higher speeds are allowed on segments that have proven themselves.

### Environment
11. **No braking the traffic does not need.** Every brake throws away energy that the next acceleration has to put back. Plans keep speed steady and avoid slowing down only to speed up again.
12. **Energy is a planning cost.** Where two plans are equally safe and carry as much traffic, the road picks the one that uses less energy: a slightly lower cruising speed, or vehicles lined up so that followers ride in the slipstream of the vehicle ahead. A gap is never shortened for the slipstream alone.
13. **Gains are claimed net.** Air drag grows with the square of speed. A road that keeps traffic moving at 100 km/h where today's road would crawl at 60 uses more energy per kilometre for that reason, even without stop-and-go. Environmental gains are stated after that cost.

### Comfort
14. **Nobody has to drive.** The road plans and the vehicle executes, so occupants can read, work or sleep. A driver is needed only at the exit (§8).
15. **Smooth plans.** Normal plans stay within comfort limits for acceleration, braking and jerk (how fast acceleration changes), well below what the vehicle can do. Hard braking is kept for safety: the guardian, a safe stop, an object on the road. Lane changes happen only when the trip or the traffic needs them.
16. **Comfort never buys back safety margin.** A safe stop brakes as hard as it must. Because any trip can include one, occupants stay belted and loose objects are stowed, as in any vehicle.

---

## 3. System architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│  L3  NETWORK LAYER        (regional data centre, seconds–hours)       │
│      Trip booking · route assignment · admission control ·            │
│      capacity planning · incident management · emergency priority     │
└───────────────▲──────────────────────────────────────┬───────────────┘
                │ demand, status                       │ routes, slots
┌───────────────┴──────────────────────────────────────▼───────────────┐
│  L2  SEGMENT LAYER        (roadside edge compute, ~1–2 km each,       │
│                            100 ms cycle, redundant 2-out-of-3)        │
│      Fuses road sensors and vehicle reports → world model             │
│      Plans conflict-free space-time trajectories for every vehicle    │
│      Issues movement authorities · hands vehicles to next segment     │
└───────────────▲──────────────────────────────────────┬───────────────┘
                │ state, health (10–20 Hz)             │ trajectory + authority
┌───────────────┴──────────────────────────────────────▼───────────────┐
│  L1  VEHICLE LAYER        (onboard, 100+ Hz)                          │
│      Follows the trajectory (steering/throttle/brake control)         │
│      Precise self-localisation · health monitoring                    │
│      GUARDIAN: independent short-range sensor → may only brake        │
│      Runs the safe-stop trajectory if the authority expires           │
└──────────────────────────────────────────────────────────────────────┘
        ▲
        │ independent observation
┌───────┴──────────────────────────────────────────────────────────────┐
│  L0  ROAD LAYER           (physical infrastructure)                   │
│      Pole-mounted radar/lidar/cameras · in-road position markers ·    │
│      friction/weather sensors · fences and intrusion detection ·      │
│      safety lane (hard shoulder) for sidetracking faulty vehicles ·   │
│      redundant comms (C-V2X/5G + dedicated short-range radio)         │
└──────────────────────────────────────────────────────────────────────┘
```

### Why not one big central computer driving every car directly?
Latency and fragility. At 120 km/h a car covers 3.3 m in 100 ms. So the centre should **not** run the steering loop. It issues **plans** (a trajectory for the next ~5–10 s) and **authorities** (how much of that plan the car may execute). The car tracks the plan locally at high frequency. A late message never makes the car drift, because the car always holds a valid plan that ends in a safe stop.

### The segment controller is the heart of the system
- Each segment has a **world model**: every vehicle's position, speed, intent and certified dynamics, plus every unknown object.
- Every cycle it solves a **space-time packing problem**: assign each vehicle a trajectory so that no two *safety envelopes* ever overlap, including both vehicles' worst-case braking.
- It runs as **2-out-of-3 redundant voting hardware**, the standard for SIL-4 railway interlocking, with formally verified safety logic.
- At the segment border it hands vehicles over to the next segment, with an overlap zone where both segments see the vehicle.

---

## 4. The safety envelope (the key concept)

Every vehicle owns an exclusive **space-time envelope**:

```
         ◄─── reaction + braking distance (own dynamics) ───►
  ┌────┐ ┌──────────────────────────────────────────────────┐
  │ CAR│ │ envelope: no other vehicle may be planned in here │
  └────┘ └──────────────────────────────────────────────────┘
          + lateral margin (lane position uncertainty)
          + positioning uncertainty (grows when degraded)
          + comms latency × speed
```

The envelope size depends on:
- **Certified braking performance** of the vehicle (tested at inspection and re-checked in operation).
- **Road friction**, measured by road sensors. Rain or ice → larger envelopes → lower speed and capacity. Safety stays fixed; throughput adjusts.
- **Health status.** A degraded vehicle gets a larger envelope or is sent off the network.
- **The separation policy (open design decision):**
  - *Absolute (brick-wall)*: assume the vehicle ahead could stop instantly, for example by hitting debris. Very safe, lower capacity.
  - *Relative*: assume the vehicle ahead brakes at its certified maximum, and that all vehicles brake together when commanded. Much higher capacity (platoons), but it depends on coordinated braking and needs proof that a "brick-wall" event is rare enough.
  - ~~**Proposal:** start absolute. Allow relative separation only on segments with proven intrusion detection, and only within tightly coupled platoons that have direct vehicle-to-vehicle brake signalling.~~
  - **Updated proposal (after simulation): hybrid.** Use relative separation by default, with an absolute gap:
    - behind load-carrying vehicles (trucks, trailers, roof loads);
    - behind any vehicle that reports a fault;
    - in and just before segments whose road sensing is degraded.

    In simulation, absolute separation alone carried about half of today's road at motorway speed, which fails priority 2. The hybrid carried about 11 % more than the simulated today's road at 10 % trucks and removed every lost-load collision ([SDR-03](SDR-03-Hybrid-Detection-Safety-Lane.md), [SDR-04](SDR-04-Viability-Assessment.md)). The absolute gap behind trucks is what the hybrid pays for that: at 20 % trucks it carries 9 % less than today's road. Leaving the gap out behind trucks with an enclosed, monitored load brings the gain back if at least half the trucks qualify, which makes load monitoring (D10) part of the capacity case too. Against published capacities of a real three-lane merge, the hybrid's gain lies between about +5 % and −7 %, so its case rests on flow quality and safety more than on capacity ([SDR-04](SDR-04-Viability-Assessment.md)).
  - **Rule found in simulation:** size the gaps to the radio link as measured. If authority messages are lost, the road widens every vehicle's allowance for stale authority, so that lost messages cost capacity, not full-force braking. That costs 6 % at 5 % loss when the losses are random. Losses in bursts cost far more: 24–70 % at the same 5 %. Two independent radio paths remove most of that cost (D6).
  - **Rule found in simulation:** a lane change starts only once the vehicle changing lanes and its new follower both hold an authority computed for it. Without that acknowledgement, a lost message can leave one of them on an old authority that does not keep it clear of the other.
  - **Rule found in simulation:** under relative separation a follower must never assume its leader stops more gently than the follower itself can. Otherwise a weak-braking leader licenses a tailgate.
  - **What no spacing rule can fix:** a vehicle that stops dead because it hit something nobody saw. At relative-level capacity, safety against that comes from **fast detection** (D9) and **load monitoring** (D10), which make such events rare.

---

## 5. Failure handling: what happens when…

| Event | Response |
|---|---|
| Vehicle loses comms | It keeps executing its plan until the authority expires, then runs its pre-cleared safe stop. Neighbours are re-planned around it, which is possible because the segment knows exactly where it will stop. |
| Segment controller fails | The redundant pair takes over (2oo3). If all three fail, every vehicle in the segment runs its safe stop at the same moment, and because all those stops were pre-cleared, they cannot conflict. The upstream segment stops admitting traffic. |
| Vehicle mechanical failure (blowout, motor) | The vehicle reports it and the road sees the deviation. The segment re-plans neighbours, because envelopes already cover worst-case behaviour. |
| Object on road (debris, animal, person) | Road sensors detect it → the zone is marked occupied → vehicles are re-planned around it or stopped. The onboard guardian is the last line of defence if the road missed it, and reports what it sees so the road can protect everyone behind it. A load that falls off a vehicle is reported by that vehicle as it happens. |
| Vehicle breaks down or reports a fault | The road works it right lane by lane with cooperative merges and sidetracks it onto the safety lane while it is still moving. A lane that is blocked anyway is closed 1 km upstream. |
| Car and road disagree on position | Treated as a fault: envelopes grow, speed drops, the vehicle is routed off. |
| Network/cyber attack | Plans are signed per segment, and vehicles reject unsigned or physically implausible commands. The guardian brakes regardless. Failures stay local by design. |
| Severe weather | Friction sensing lowers speed and capacity across the network. Admission control limits new trips. |

**Important property:** in human traffic, stopping in your lane is dangerous because the people behind you might not stop. In an SDR, **every vehicle upstream is also controlled**, so a coordinated stop in the lane is a *safe state*. This makes fail-safe design much simpler than it is for an SDC.

**But a safe state is not a free state.** A vehicle stopped in a live lane closes that lane until it is removed. A 15-minute breakdown cost about 6 vehicle-hours of delay in simulation. With a **safety lane** (the hard shoulder), the road moves the faulty vehicle off while it still rolls, and the cost dropped to zero ([SDR-03](SDR-03-Hybrid-Detection-Safety-Lane.md)).

---

## 6. Efficiency mechanisms

1. **Trip booking.** A trip is requested (origin, destination, desired arrival). The network layer reserves a time-slotted route, like a train path or an airport slot. If capacity is full, it offers a different departure time instead of letting a jam form.
2. **Ramp gates.** On-ramps are where admission control is enforced. A vehicle merges only into a slot that already exists for it, so merging becomes a zipper with no braking.
   - **Rule found in simulation:** the slot is made by the traffic in the lane, which opens a gap for the merging vehicle while it is still on the ramp. The merging vehicle's place in that order has to be kept in the same frame of reference as the gap. A gate that waits for a free slot to be predicted only delays everybody: below capacity the simulated gate is open, and nobody waits more than a few seconds ([SDR-04](SDR-04-Viability-Assessment.md)).
3. **Signal-free intersections.** Crossing flows are interleaved by reservation (as in the AIM research by Dresner & Stone). There are no traffic lights and no stopping when demand allows.
4. **Platooning.** Vehicles going the same way travel in tight, coordinated groups: less air drag, more vehicles per lane. *Simulation note:* close following *is* relative separation. Breaking platoons with a brick-wall gap every N vehicles cost capacity without measurably limiting pile-ups, so it is not recommended ([SDR-03](SDR-03-Hybrid-Detection-Safety-Lane.md)).
5. **Lane-capacity estimate.** A human-driven motorway lane carries about 1,800–2,200 veh/h, and flow can collapse by 10–20% once it breaks down. ~~Coordinated SDR lanes could plausibly reach 3,000–5,000+ veh/h~~. **Simulated** (theory, 120 km/h, per lane):
   - absolute separation ~1,190 veh/h;
   - hybrid ~2,700;
   - relative ~3,150.

   On the simulated 3-lane corridor with an on-ramp and 10 % trucks, the hybrid served 6,000 veh/h at 98 km/h, against today's best of 5,400 at about 60 km/h (+11 %); pure relative separation served 7,080 (+31 %). A real three-lane merge probably carries more than the simulated today's road; against it the hybrid's gain lies between about +5 % and −7 %. With no trucks the hybrid gains 29 %; at 20 % trucks it carries 9 % less than today's road. Slowing down to the speed at which a lane carries most in theory (about 80 km/h for the hybrid) added 3–4 % at best on the corridor and is not worth the longer trips. The larger gain is in flow quality: no breakdown, and less delay at every demand (20 s against 72 s where today's road is nearly full) ([SDR-04](SDR-04-Viability-Assessment.md)). An earlier figure of +36 % was measured against a human baseline that was too weak.
6. **Emergency vehicles.** A corridor is cleared ahead of them by re-planning, not by sirens.

---

## 7. Vehicle requirements ("SDR-Ready" standard)

What manufacturers must build. This is far less than a full SDC.

| Subsystem | Requirement |
|---|---|
| Drive-by-wire | Redundant steering, braking and propulsion actuators. Certified response latency. |
| Positioning | GNSS-RTK + wheel odometry + inertial sensors + reading in-road reference markers (e.g. magnetic markers, which work under snow). Reported uncertainty must be honest. |
| Comms | Two independent radio paths. Hardware security module for signed messages. |
| Guardian | One forward radar (+ optional camera). Logic: "obstacle in my path that I was not told about → brake." It **cannot steer or speed up.** Every detection is **reported to the road**: as a first witness it protects everyone behind it. Speed is capped so the guardian can always stop within its own range (≈85 km/h on ice). |
| Dynamics profile | Certified max acceleration and braking, and turning limits. Re-verified at periodic inspection and in operation, since the road can measure actual braking. |
| Health reporting | Brakes, tyres, battery/fuel, actuator status broadcast continuously. Brake faults reported within 0.5 s, including faults found when the vehicle brakes. |
| Load monitoring | Trucks, trailers and roof/rear carriers detect a load leaving (coupling, latches, weight, rear camera) and broadcast it at once, to the road and over V2V (D10). |
| Safe-stop executor | Can run the stored safe-stop trajectory with no comms at all. From the right-hand lane, the safe stop includes pulling into the safety lane when its own sensors see it clear. |
| Manual mode | Normal driving outside the SDR network. |

Rough guess: the extra cost of SDR-Ready over a modern car with adaptive cruise and lane-keep is small, because most of these parts already exist. The cost moves to the road.

---

## 8. Human interaction

- **Handover zones.** Entering and leaving the SDR network happens at fixed points: on-ramp gates and off-ramp exits. At the entry gate the vehicle's health and authority are checked before the system takes control.
- **Exit readiness.** Before handing control back, the system checks that the driver is ready (attention check). If the driver is not ready, the car is parked in an **exit buffer bay**, never released into traffic with an unready driver.
- **In-vehicle experience.** Occupants see the planned route, arrival time and the reason for any change. Predictability builds trust.

---

## 9. Rollout: control the environment first

SDR's advantage grows with how controlled the environment is, so it should start where control is easiest.

| Phase | Where | Why |
|---|---|---|
| **0. Pilot** | Closed test corridor and a fenced logistics route (trucks between distribution centres) | Fully controlled. Commercial value from day one. |
| **1. SDR lanes** | One dedicated, physically separated lane on major motorways | Fenced, no pedestrians, simple geometry. Mixed traffic stays in the other lanes. |
| **2. Full motorways** | Whole motorway network converts | Admission control and system routing start to pay off at network scale. |
| **3. Arterials** | Major city roads with physical separation and controlled crossings | Intersections become signal-free. Pedestrian crossings are protected by design (barriers, grade separation, or pedestrian demand handled as part of the reservation system). |
| **4. Everywhere else** | Residential streets, shared spaces | Hardest case (children, cyclists, parking). Possibly low-speed SDR with dense road sensing, or manual driving only. |

---

## 10. Hard problems and honest risks

These are the problems the design must solve, not reasons to stop.

1. **Uncontrolled participants.** Pedestrians, cyclists, animals and debris are the main residual safety risk. Fencing, road sensing and the guardian reduce it, but in mixed environments they cannot remove it. Simulation and research ([SDR-03](SDR-03-Hybrid-Detection-Safety-Lane.md)) sharpen this into three engineering problems:
   - **Detection speed.** Roadside sensing must confirm an object within about 1 s. Today's incident-detection systems take 10–60 s and miss 2–40 %.
   - **Lost loads.** Objects that fall off a vehicle land within the follower's stopping distance. Hence the absolute gap behind load carriers and load monitoring.
   - **Car sensors.** Debris detection by cars is untested by any crash-test programme, so car sensors are a first witness, not a shield.
2. **Correlated failure.** An SDC bug hurts one car. An SDR bug could hit thousands at once. This needs formal verification of safety logic, diverse redundancy (different software from different teams), and geographic containment.
3. **Cybersecurity.** The SDR becomes critical national infrastructure and must be designed to the standard of power grids and air traffic control.
4. **Privacy.** A central system that knows every trip is a surveillance risk. Proposal: pseudonymous trip tokens, data kept only in short-lived segment memory, and no central trip history beyond what billing and safety require.
5. **Positioning in bad conditions.** Snow, tunnels, urban canyons. In-road markers plus road-side observation are the fallback.
6. **Cost and maintenance of road sensors.** Every kilometre needs sensors, compute, power and comms, and all of it needs maintenance.
7. **Liability.** It moves from drivers to road operators and certified vehicle makers. This needs a new legal framework.
8. **Fairness.** Admission control and system routing will tell some people "not now" or "take the longer route." The rules for that must be transparent and fair.
9. **Transition period.** Mixed SDR and human traffic is the most dangerous phase. Physical separation is non-negotiable here.

---

## 11. Open design decisions

| # | Decision | Options | Initial lean |
|---|---|---|---|
| D1 | Separation policy | Absolute / relative / hybrid | ~~Absolute first~~ → **hybrid**: relative by default, absolute behind load-carrying vehicles, behind vehicles that report a fault, and where road sensing is degraded. No platoon breaks. On ice, a 60 km/h cap. About +11 % on the simulated today's road at 10 % trucks (between +5 % and −7 % against a real merge), no lost-load collisions; below today's road from somewhere between 10 and 20 % trucks unless trucks with an enclosed, monitored load are exempted (see [SDR-03](SDR-03-Hybrid-Detection-Safety-Lane.md), [SDR-04](SDR-04-Viability-Assessment.md)) |
| D2 | Positioning reference | GNSS-only / road markers / road observation | All three, with road observation authoritative |
| D3 | Segment length | 500 m / 1–2 km / 5 km | ~1–2 km (to validate by simulation) |
| D4 | Planning horizon | 3 s / 10 s / 30 s | ~10 s detailed plan + 1–3 s authority |
| D5 | Trip booking | Mandatory / optional / priced | Optional at first, mandatory at peak |
| D6 | Comms technology | C-V2X / 5G / dedicated / mixed | Two diverse paths, required. Their losses must be independent (no shared antenna site, no shared dead spot), and each path must deliver at least 99 % of authorities, in bursts of at most about half a second. Then radio loss costs no measurable capacity. At 98 % per path it costs 14 %, at 95 % 30 %. One path at 99 % costs 62 % if its losses come in bursts. Coverage must be planned so that no place loses both paths: there, traffic stops ([SDR-04](SDR-04-Viability-Assessment.md)) |
| D7 | Guardian sensor scope | Forward only / 360° | Forward only (keeps cost low, road covers the rest). Every guardian detection is reported to the road: one car's report protects everyone behind it ([SDR-03](SDR-03-Hybrid-Detection-Safety-Lane.md)) |
| D8 | Who operates it | State / regulated operator / concession | To discuss |
| D9 | Roadside object detection | Cameras / radar / lidar; spacing; confirmation time | Overlapping, at least two sensor types, **≤1 s confirmation**, ≥99 % detection, safety-critical rating. Today's incident detection (10–60 s) is far too slow ([SDR-03](SDR-03-Hybrid-Detection-Safety-Lane.md)). False alarms: at most about 1 per km per hour if a re-check clears one within 10 s, 0.5 if the re-check takes a minute; that keeps their cost below 1 % of capacity. A car's report of an object must be confirmed or cleared by the road within about 10 s and does not close a lane on its own. Open: for a load falling off a truck, 0.5 s was fast enough for the gap the hybrid keeps and 1 s was not, and no road-only sensor is likely to reach 99 % in 0.5 s, so the cars' shared sensors or the truck itself have to be the first witness ([SDR-04](SDR-04-Viability-Assessment.md)) |
| D10 | Load monitoring | None / trucks only / all external loads | Required for trucks, trailers and roof/rear carriers: detect a load leaving and broadcast it at once. A truck that can vouch for its load (enclosed body, monitored doors, tyres and wheels) could be followed at the normal gap; how far that can be trusted is unproven ([SDR-04](SDR-04-Viability-Assessment.md)) |
| D11 | Safety lane | None / refuge areas only / continuous lane | Continuous safety lane (the current hard shoulder) plus refuge areas at junctions; the road sidetracks faulty vehicles while they still move |
| D12 | Fencing and access control | Partial / full | Full fencing with wildlife crossings; pedestrian intrusion is treated as an object |

---

## 12. Suggested next steps

1. ~~**Simulation prototype.**~~ Done: [simulator/](simulator/README.md). Hybrid separation, detection layers and the safety lane are in [SDR-03](SDR-03-Hybrid-Detection-Safety-Lane.md); throughput, weather and the overall verdict in [SDR-04](SDR-04-Viability-Assessment.md).
2. **Formal safety case.** Write down the safety argument (hazards → mitigations → evidence) in the structure used for railway and aviation certification. The foreign-object risk model ([simulator/risk-model.js](simulator/risk-model.js)) is a first piece; system failures (software faults, cyberattack, common-cause failures) are the missing other half.
3. **Roadside sensing proof of concept.** Measure time-to-confirm and miss rate for pallet-, tyre- and deer-sized objects at 150 m, at night and in rain. This is the decisive engineering question ([SDR-04](SDR-04-Viability-Assessment.md)).
4. **Sensor false alarms in simulation.** A false alarm costs capacity, a miss costs safety; find the operating point.
5. **Protocol specification.** Define the vehicle ↔ segment messages: plan, authority, state, health, safe stop.
6. **Deep-dive: intersections and urban.** Phase 3 is where most of the value and most of the risk lie.
7. **Deep-dive: economics.** Cost per km of road (sensing, fencing, safety lane, comms) against the savings from fewer accidents, less congestion and cheaper cars.
