# Roadmap 2: Then: make the model more trustworthy

Date: 2026-11-20

## The short answer

Section 2 asked how far the simulator's figures can be trusted. The safety findings hold up well. The capacity gain holds up much less.

- **Safety holds.** After a sudden stop, SDR had fewer collisions than today's road:
  - in every layout tested;
  - at every driver reaction time tested;
  - on ice.

  Sensor false alarms caused no collision at all, and neither did radio loss in any form tested.
- **The capacity gain is fragile.**
  - It depends on how fast the vehicles react: a slower actuator or a slower control cycle wipes it out.
  - Above all, it depends on how much a real road carries. Published figures for a real three-lane merge are higher than what the simulated today's road carries. Against them, the hybrid's gain of about 11 % shrinks to somewhere between +5 % and −7 %.
  - Relative separation keeps a gain of between an eighth and a quarter.
- **The gap behind trucks is tighter than it looked.** It allows for the half-second the road sensors need to confirm a fallen load, but only through slack. Make the system better elsewhere (harder brakes, faster control) and lost-load collisions come back. The confirmation time has to be built into the rule (roadmap 1.5).
- **What decides the radio's cost is how the losses come, not how many.** One message in twenty lost at random costs 6 % of capacity. The same share lost in half-second bursts costs 24 %, or 70 % if the road widens the gaps enough for bursts. Two radio paths that fail independently remove almost all of that cost; sending each message twice over one path does not.
- **New rules:**
  - on ice, a 60 km/h cap for the hybrid;
  - for sensors, a false-alarm budget of about 1 per km per hour, and no lane closure on a single car's report;
  - for the radio, two independent paths that each deliver 99 % of messages;
  - a lane change waits until both vehicles involved have acknowledged it.

## At a glance

| Sub-item | Status | Result in one line |
|---|---|---|
| 2.8 Risk-model inputs | done | Every input now has a range and a source. The best SDR setup rises from about 0.6 to about 3 collisions with objects per billion vehicle-km (range 1.5–11), still below today's debris crashes (about 10) |
| 2.2 Sensitivity of the SDR assumptions | done | Actuator delay, control cycle, radio latency, safety margin and harder braking each move capacity by more than 5 %. Tightening the gap brings lost-load collisions back |
| 2.6 A policy for ice | done | The hybrid with a 60 km/h cap carries 14 % more than today's road on ice; the worst impact is 45 km/h instead of 69 |
| 2.5 Pile-up on today's road | partly done | The average pile-up is within the real range, but five or more vehicles is too common (the model's drivers cannot swerve). SDR is safer at every reaction time tested |
| 2.1 Fit today's road to detector data | partly done | No real data was fitted. Published figures put the hybrid's gain against a real road at +5 % to −7 %. A fitting script is ready |
| 2.7 More road layouts | partly done | Six layouts. The hybrid's gain comes from the merge: +26 % on two lanes, +3 % on four. Layouts that need new geometry are still open |
| 2.4 Sensor false alarms and shared misses | done | A false-alarm budget for D9: about 1 per km per hour with a 10 s re-check. A car's report must not close a lane |
| 2.3 Realistic radio loss | done | Bursts, not the loss rate, set the cost. D6 now asks for two independent paths that each deliver 99 %, which costs no measurable capacity. Lane changes wait for an acknowledgement |

Terms used below:

- *Today's road* is a copy of the same road with only human drivers and the same traffic. It exists for comparison.
- *Hybrid* is the recommended SDR rule for the distance between vehicles: close following, except for a long gap behind trucks, behind faulty vehicles and where road sensors are down.
- *Relative* is close following everywhere.
- *Absolute* keeps a gap behind every vehicle long enough to stop for a brick wall.
- *Saturated* means more traffic arrives than either road can carry: 7,200 veh/h on the main road plus 900 on the on-ramp. The number served is then the road's capacity.
- A difference called *real* or *outside the noise* has a 95 % confidence interval that does not include zero. The interval is taken run by run, on the same traffic.

Every figure below comes from one full run of the whole experiment suite with the final code (2026-11-20). That second full run was needed because the first one exposed a fault; see 2.3.

## 2.8 Risk-model inputs from the lost-load research

**The question.** The risk model estimates how often SDR vehicles hit an object on the road. Two of its inputs had no source:

- 120 objects per billion vehicle-km;
- 70 % of falling loads coming off trucks.

Research during item 1.2 suggested other values.

**What was done.** Every input of the model got a low, central and high value, each with a source:

| Input | Low / central / high | Was |
|---|---|---|
| Objects per billion vehicle-km | 120 / 141 / 420 | 120 |
| Share heavy enough to stop a car | 5 / 10 / 20 % | |
| Share that lands right in front of a follower | 17 / 33 / 50 % | |
| Share of falling objects that come off a truck | 30 / 40 / 50 % | 70 % |
| Share that is cargo rather than tyres and parts | 40 / 50 / 70 % | everything |
| Share of tyre and part losses the vehicle itself reports | 0 / 0 / 50 % | |

The model runs all 64 combinations.

**What came out.** Object collisions per billion vehicle-km, central value. The range in brackets is what you get when only the researched inputs vary.

| Scenario | Now | Before |
|---|---|---|
| Relative separation, today's detection | 22 (19–65) | 19 |
| Hybrid, today's detection | 16 (13–50) | 13 |
| Hybrid, SDR-grade detection | 4.7 (3.4–16) | 2.2 |
| The same, plus vehicles report their own lost cargo | 2.8 (1.5–11) | 0.6 |
| Absolute separation, SDR-grade detection | 0.3 (0.26–0.9) | 0.3 |
| *For scale: debris crashes today (US, all roads)* | *about 10* | |

The best SDR setup is about five times worse than estimated before, for two reasons:

- fewer falling loads come off trucks, so fewer land in the long gap behind one;
- half of what falls is tyres and parts, which load monitoring does not see.

It stays below today's debris-crash rate unless nearly every input is at its worst at once (then up to 30). The order of the scenarios is the same in every combination. Apart from the overall level, the input that matters most is one that rests on an assumption: the share of objects that land right in front of a follower.

**Finish line.** "The risk table in SDR-03 gives a range per scenario, with the sources for each input": **met**. One source link (the UK obstruction figure) no longer works and is marked as such.

## 2.2 Sensitivity of the SDR assumptions

**The question.** The SDR figures rest on assumed values for braking, delays, margins and sensor range. Which of them do the conclusions depend on?

**What was done.** The hybrid was run with one assumption changed at a time:

| Assumption | Values tested | As assumed |
|---|---|---|
| Car braking | 6–10 m/s² | 8 |
| Actuator delay | 0.1–0.5 s | 0.2 |
| Control cycle | 0.05–0.5 s | 0.1 |
| Radio latency | 20–200 ms | 50 |
| Safety margin | 1–5 m | 2 |
| Guardian sensor range | 60–160 m | 120 |

Each variant was measured three ways:

- capacity (5–15 runs);
- after a brick-wall stop (30 runs);
- after a load falls off a truck, with only the road sensors watching and confirming it in 0.5 s (30 runs).

**What came out.** At its assumed values the hybrid carries 5,957 veh/h, against 5,364 on today's road (+11.1 %). Changes of more than 5 % in capacity:

| Assumption | Value | Capacity against as assumed | Against today's road |
|---|---|---|---|
| Actuator delay | 0.1 s | +7.1 % | +19.2 % |
| | 0.3 s | −5.9 % | +4.5 % |
| | 0.5 s | −19.0 % | **−9.9 %** |
| Control cycle | 0.2 s | −6.5 % | +3.8 % |
| | 0.5 s | −20.6 % | **−11.7 %** |
| Radio latency | 200 ms | −9.1 % | +0.9 % (within the noise) |
| Safety margin | 5 m | −7.8 % | +2.3 % (within the noise) |
| Car braking | 10 m/s² | +5.5 % | +17.3 % |

- With 6 m/s² braking, capacity fell by 4.3 %.
- The guardian range changed nothing that matters.
- All of these differences are real except where marked.

**Brick-wall stops.** Only one variant made them worse in a way that can be told from noise. With 6 m/s² braking, collisions rose from 25 to 41 in 30 runs, and the worst impact rose from 70 to 81 km/h. That is to be expected: weaker brakes stop later.

**Lost loads: the surprise.** With the assumed values a lost load caused no collision in 30 runs. But every change that shortens the gap behind a truck brought collisions back, at 6–12 km/h:

| Variant | Runs with a collision |
|---|---|
| 10 m/s² braking | 17 of 30 |
| 0.05 s control cycle | 16 of 30 |
| 20 ms radio latency | 17 of 30 |
| 1 m safety margin | 20 of 30 |

The reason: the long gap behind a truck is computed from braking, delays and margins, not from the time the road needs to confirm a lost load. At the assumed values the slack in those terms happens to cover the 0.5 s. Improve any of them, and it no longer does.

**Finish line.** "A table showing which assumptions move the result by more than 5 %": **met** (results section 15). The lost-load finding goes to roadmap item 1.5.

## 2.6 A policy for ice

**The question.** On ice, the hybrid carried less than today's road. Relative separation kept 85 km/h at close spacing, which SDR-04 called a warning sign. Is there a rule for ice that is both safe and worth having?

**What was done.** Ten policies were tested on ice (grip 0.3):

- today's road;
- absolute, relative and hybrid as they are;
- the hybrid with a 70 or 60 km/h cap;
- the hybrid planning with 80 % or 60 % of the measured grip;
- relative with a 60 km/h cap, or with 60 % of the grip.

Each was measured for capacity (5–15 runs) and after a brick-wall stop (30 runs). Every policy was also run on *black ice*: the tyres have 20 % less grip than the road measured, and nobody knows it.

**What came out.**

| Policy on ice | Served (veh/h) | Against today's road | Brick-wall stop: runs with a collision / collisions / worst impact |
|---|---|---|---|
| Today's road | 4,226 | | 28 of 30 / 101 / 68 km/h |
| Hybrid as it is | 3,650 | −14 % | 17 of 30 / 42 / 69 km/h |
| **Hybrid, 60 km/h cap** | **4,836** | **+14 %** | 22 of 30 / 31 / 45 km/h |
| Hybrid, 70 km/h cap | 4,725 | +12 % | 19 of 30 / 39 / 54 km/h |
| Hybrid, plans with 80 % of the grip | 2,175 | −49 % | 12 of 30 / 16 / 53 km/h |
| Relative, 60 km/h cap | 6,044 | +43 % | 21 of 30 / 29 / 45 km/h |
| Absolute | 1,326 | −69 % | 0 of 30 |

- **A speed cap is the rule that pays.** It shortens the gap behind trucks, so the hybrid carries a third more than without a cap. It also lowers the worst impact from 69 to 45 km/h. Collisions after a brick-wall stop fall from 42 to 31, a difference still within the noise.
- **Planning with less grip than measured is a bad trade.** It halves capacity and barely changes the worst impact.
- **Relative separation with a cap** carries the most, and its impacts are no worse than the capped hybrid's. But it has no long gap behind trucks, so lost loads are unprotected. It is not recommended for that reason.
- **Black ice caused no SDR collision in normal traffic** under any policy. The smallest spare distance stayed positive (3.0–4.4 m). After a brick-wall stop it looked like plain ice.

**Finish line.** "A recommended ice rule with its capacity cost and its effect on impact speeds": **met**. The recommended rule is the hybrid with a 60 km/h cap.

## 2.5 Check the pile-up on today's road

**The question.** After a brick-wall stop, today's road had far more collisions than SDR. That rests on one assumption: about 1.25 s of perception and reaction for an unexpected event. Does the model make today's pile-ups too large?

**What was done.**

- A brick-wall stop on today's road with the surprise delay set to 0.3, 0.5, 0.7 (as assumed) and 1.0 s.
- At moderate traffic (3,000 + 600 veh/h, 30 runs) and dense traffic (4,200 + 600, 10 runs).
- Against the SDR hybrid on the same traffic.
- Each event counts the vehicles involved.
- A literature search collected crash records for comparison.

**What came out.**

| Traffic | Surprise delay | Vehicles per event: mean | Events with 5 or more | Collisions, today's road | Collisions, SDR hybrid |
|---|---|---|---|---|---|
| 3,000 + 600 | 0.3 s | 1.9 | 2 of 30 | 41 | 15 |
| | 0.7 s (as assumed) | 2.4 | 5 of 30 | 52 | |
| | 1.0 s | 3.0 | 9 of 30 | 71 | |
| 4,200 + 600 | 0.3 s | 3.2 | 2 of 10 | 24 | 5 |
| | 0.7 s (as assumed) | 4.2 | 3 of 10 | 33 | |
| | 1.0 s | 6.5 | 7 of 10 | 55 | |

What the real records say:

- multi-vehicle rear-end crashes involve about 2.2–2.6 vehicles on average;
- chain collisions of three or more involve about 3.3–3.6 on average;
- five or more vehicles happen in only a few percent of crashes;
- measured reaction times to a surprise support a surprise delay of roughly 0.35–0.95 s.

Against that:

- **The average pile-up is within the real range, at its upper end.** At moderate traffic the model gives 2.4 vehicles per event.
- **Large pile-ups are too common:** five or more in 17 % of events at moderate traffic. The likely reason is that the model's drivers only brake. Real drivers also swerve: in one study, 11 of 51 shockwaves involved swerving.
- **SDR's advantage does not depend on the assumption.** At moderate traffic SDR had between a fifth and a third of today's collisions. It had fewer at every surprise delay, including the fastest human reactions tested, and every one of those differences is outside the noise.

**Finish line.** "The pile-up size is within the range the records show, or the model is corrected": **partly met**. The mean is within the range, but the share of large pile-ups is not. The model was not corrected; that is new roadmap item 2.9.

## 2.1 Fit today's road to detector data

**The question.** Today's road carries about 5,400 veh/h on the test corridor, at the low end of handbook values. If a real road carries 6,000, the hybrid's capacity gain is gone. This is the largest uncertainty in every comparison.

**What was done.** The slice agreed for this run, with no data download:

1. Desk research on measured capacities of three-lane motorway merges.
2. Today's road run with shorter headways (1.4 s as assumed, then 1.2, 1.1, 1.0 and 0.9 s), to see where the hybrid's gain disappears.
3. A script that fits a loop-detector file: capacity before breakdown, discharge flow after it, and the speed-flow curve. It can sample the simulated road the same way.

**What came out.**

- **A real three-lane merge with about 10 % trucks** carries roughly 6,400 veh/h before it breaks down (5,800–6,900 across sources), and about 5,700 after it (5,200–6,000). That is a drop of 7–15 %. A plain three-lane road carries about 6,600.
- **The simulated today's road carries 5,275 veh/h at the merge.** Fitted like a detector, it shows no capacity drop: it breaks down at 4,600–4,900 veh/h and then discharges 5,300. On a plain road without a merge it carries 5,695.
- **Shorter headways do not make it a real road:**

| Headway of today's drivers | Plain road (veh/h) | With the merge (veh/h) | Collisions in 5 runs | Hybrid against it | Relative against it |
|---|---|---|---|---|---|
| 1.4 s (as assumed) | 5,695 | 5,275 | 0 | +14 % | +36 % |
| 1.2 s | 6,423 | 5,506 | 1 | +9 % | +30 % |
| 1.1 s | 6,922 | 5,775 | 14 | +3 % | +28 % |
| 1.0 s | 7,490 | 5,879 | 71 | +2 % (within the noise) | +24 % |
| 0.9 s | 8,111 | 5,367 | 109 | +12 % | +34 % |

The plain road follows the headway, as theory says. The merge does not: the simulated drivers' merging limits it, and below 1.1 s they crash. So no single parameter can push the model to a real merge's capacity.

**What it means for the hybrid.** In these runs the hybrid carried 5,970 veh/h:

- against a real merge's discharge flow (about 5,700), it gains about 5 %;
- against a real merge's capacity before breakdown (about 6,400), it loses about 7 %.

Relative separation (7,166) gains 12–26 % either way.

**Finish line.** "The baseline reproduces that section's speed-flow curve, and the comparison is re-run": **not met**; it needs real detector data. The slice agreed for this run is done: the break-even is known, and `fit-detector.js` is ready for a data file. The human merge model needs a capacity drop first (new roadmap item 2.9).

## 2.7 More road layouts

**The question.** Every result came from one 5 km corridor with three lanes, one on-ramp and one exit. Do the headline figures hold elsewhere?

**What was done.** The slice agreed for this run: layouts the simulator can build by changing its parameters. Six layouts:

- the standard corridor;
- two lanes;
- four lanes;
- a short (150 m) acceleration lane;
- a long (600 m) acceleration lane;
- a 10 km corridor.

Demand scales with the number of lanes. For each layout:

- capacity of both roads;
- the hybrid with the road sensors down at the merge;
- trip delay in busy traffic;
- a brick-wall stop (10–30 runs).

**What came out.**

| Layout | Today's road (veh/h) | Hybrid (veh/h) | Hybrid against today | Sensors down at the merge | Brick-wall collisions: today / hybrid |
|---|---|---|---|---|---|
| Standard (3 lanes) | 5,395 | 6,002 | +11 % | −35 % | 81 / 25 |
| 2 lanes | 3,511 | 4,414 | +26 % | −34 % | 64 / 17 |
| 4 lanes | 7,122 | 7,321 | +3 % | −36 % | 115 / 27 |
| Short acceleration lane | 5,081 | 5,931 | +17 % | −34 % | 76 / 22 |
| Long acceleration lane | 5,539 | 6,098 | +10 % | −36 % | 35 / 9 (10 runs) |
| 10 km corridor | 5,172 | 5,865 | +13 % | −35 % | 100 / 25 |

All the differences between the two roads are outside the noise.

- **The hybrid's gain comes from the merge.** It is largest where the merge limits today's road most: two lanes, a short acceleration lane. It is small where today's road has room to absorb merging traffic: four lanes, a long acceleration lane.
- **A sensor outage at the merge costs about a third of capacity at saturation, in every layout.** The 17 % that SDR-04 quoted applies at moderate demand.
- **SDR had 69–77 % fewer collisions after a brick-wall stop, in every layout.** Its worst impact was 69–70 km/h, against 80–114 km/h on today's road.

**Finish line.** "Headline figures for at least three layouts": **met** (six layouts). Not done: a second on-ramp, a weaving section, a lane drop, and the safety lane at junctions. These need new road geometry (new roadmap item 2.10).

## 2.4 Sensor false alarms and shared misses

**The question.** Detection was modelled as one probability and one delay. That leaves out two things:

- A false alarm costs capacity through needless stops.
- If cars miss the same objects for the same reason (low, dark, at night), their sensors are worth less than modelled.

**What was done.** A sub-agent did this work in its own copy of the code; it was then checked and merged. Three cases were modelled:

- **Road false alarms.** The road believes an object lies in a lane. It closes the lane and slows traffic until a re-check clears it, after 10 or 60 s. Rates tested: 1, 3 and 10 per km per hour.
- **Car false targets.** A car's own sensor sees, for one second, something that is not there, and the car brakes. On SDR the car may report it to the road. Today's road gets the same rate, as driver-assistance braking.
- **Shared misses.** 10 % of objects are invisible to every car alike.

Runs: 5–15 per throughput row, 10–30 per incident row.

**What came out.**

- **Road false alarms caused no collision,** in over 200 runs.
  - At saturation, each false alarm costs about 4 vehicles not served with a 10 s re-check, or about 22 with a 60 s re-check.
  - So false alarms cost 1 % of capacity at about 2.9 per km per hour with a 10 s re-check, or about 0.55 if the re-check takes a minute.
- **The largest cost is a car's report treated as confirmed.**

  | Car false targets | Re-check after 10 s | Re-check after 60 s |
  |---|---|---|
  | One per 10 vehicle-hours | −3 % of capacity | −12 % |
  | One per vehicle-hour | −17 % | −47 % |

  If the same false targets are not reported, they cost nothing measurable, on both roads.
- **Shared misses did not make car sensors worse,** as long as what the cars see is shared. What counts is whether the first car to reach the object sees it, and that chance is the average, however the misses are correlated.
  - They do matter if the road misses the same objects. Then the layers of detection stop multiplying, and the share of objects that nobody sees can rise tenfold (from 0.5 % to 5 % in the example).
  - This rests on arithmetic. The runs were too few to show it directly.
- **For a lost load, the road alone is too slow.**
  - With road sensors only: confirming in 0.5 s gave no collision in 10 runs; confirming in 1 s gave collisions in 9 of 10.
  - When every car's sensor sees the load and shares it, there was no collision even with 2 s.
  - A detector model (an assumption, not a measured detector) suggests that no road-only sensor reaches 99 % detection within 0.5 s at a sensible false-alarm rate.
- **A fault was found and fixed.** The road let a vehicle change lanes just past a confirmed object, in front of a car that could no longer stop before the object. Through a false alarm, or over a real object, that car then hit it.

**Finish line.** "D9 has a false-alarm budget next to its 1 s confirmation time": **met**. SDR-01 and SDR-03 now state:

- at most about 1 false alarm per km per hour with a 10 s re-check, or 0.5 with a one-minute re-check;
- a car's report does not close a lane on its own.

The final figures (0.55 per km per hour with a one-minute re-check) still support that budget.

## 2.3 Realistic radio loss

**The question.** Radio loss was modelled as independent per message. Real links fail in bursts and in particular places. Widening the gaps cost 6 % of capacity at 5 % loss. Are there cheaper answers? And what delivery rate should D6 require of the radio?

**What was done.** New options for the radio link:

- loss in bursts, at the same long-run loss rate;
- one or two paths, where an authority is lost only if every path loses it, and some of the loss can have a common cause that hits both paths at once;
- sending every authority twice;
- a dead spot: a stretch of road with no radio for a while, or for good.

The road can also measure how often a lost message follows a lost one, and widen the gaps for bursts.

A **lane change now waits until both vehicles involved have acknowledged it**: the vehicle changing lanes, and its new follower. Before, the road started the change as soon as it was feasible.

Results section 9a has six tables, 15 runs per row where a comparison needed them. All rows are saturated.

**What came out.**

- **How the loss comes matters more than how much.** Capacity at 5 % loss on one path, against 5,957 veh/h with no loss:

  | 5 % loss | The road assumes independent loss | The road measures bursts |
  |---|---|---|
  | independent | −6 % | −6 % |
  | in bursts of 0.2 s | −10 % | −43 % |
  | in bursts of 0.5 s | −24 % | −70 % |
  | in bursts of 2 s | −56 % | −73 % |

  - If the road assumes independent loss, bursts outlast the allowance. In bursts of 0.5 s there are then about 5,000 full-force supervision brakes per run.
  - If the road measures bursts, it widens every gap enough to cover them, and pays for that in capacity.
  - Neither caused a collision.
- **Two independent paths are the cheap answer.** Bursts of 0.5 s on every path, with the road measuring bursts:

  | Loss per path | One path | Two independent paths |
  |---|---|---|
  | 1 % | −62 % | −1 % (within the noise) |
  | 2 % | −66 % | −14 % |
  | 5 % | −70 % | −30 % |
  | 10 % | −70 % | −42 % |

  With two paths at 1 % each, both lose the same authority about once in 10,000 messages.
- **A common cause undoes it.** If half of the loss hits both paths at once (a truck shadowing both antennas, say), two paths are no better than one: 2 % each, half of it common, costs 61 %.
- **Sending twice over one path helps only against independent loss.** At 10 % independent loss, sending twice removes the cost (+11 %, as good as two paths). Against bursts it changes nothing: a burst swallows both copies.
- **A dead spot.**
  - A 200 m stretch without radio for 60 s costs 16 % on average, with a wide spread between runs.
  - A permanent 20 m dead spot stops all traffic. Vehicles cannot receive authority through it, so they stop safely in front of it, and the road carries nothing.
  - A second path that does not share the dead spot removes both costs completely.
- **The tolerance trade.** At 10 % independent loss, the tolerance is the chance per control cycle that a run of lost messages outlasts the allowance:

  | Tolerance | Capacity against no loss | Supervision brakes per run |
  |---|---|---|
  | 0.01 | 0 % | 212 |
  | 0.001 | −5 % | 22 |
  | 0.0001 (the default) | −10 % | 4 |
  | 0.00001 | −14 % | 0 |
  | 0.000001 | −19 % | 0 |

  The default is a reasonable middle.
- **The acknowledgement closes a real gap.** Without it, a vehicle in a lane change sometimes drove on with an authority that had not been computed for the change. That happened:

  | Case | Times per run, without the acknowledgement |
  |---|---|
  | 10 % independent loss | 253 |
  | 5 % loss in bursts of 0.5 s | 153 |
  | Two paths | 14 |
  | The 200 m dead spot | 20 |

  In bursts, the worst of these vehicles could not have stopped in time: it would have needed 3 m more than it had. Nobody happened to brake hard in front of it, so there was no collision. With the acknowledgement this happened in no case. Its capacity cost is within the noise in every comparison.
- **A fault in the acknowledgement was found and fixed.** The first full run with the acknowledgement on jammed a merge for good:
  - in 1 of 15 runs of moderate traffic with relative separation;
  - in 2 of 5 runs with a slow (0.5 s) control cycle.

  The road renewed only whichever of the two confirmations was missing. The two then fell out of step: in one cycle the vehicle changing lanes held its instruction, in the next the follower held its yield, and so on for ever. The vehicle waited at the end of the acceleration lane, and the lane stopped behind it. The road now renews both confirmations every cycle. A test covers it, and the full suite was run again. The runs that had jammed now carry normal traffic, the same as without the acknowledgement.

**Finish line.** "D6 can state a required delivery rate with its capacity cost": **met**. D6 in SDR-01 now says:

- two radio paths whose losses are independent (no shared antenna site, no shared dead spot);
- each path delivers at least 99 % of authorities, in bursts of up to about half a second;
- then the cost is within the noise (−1 %). At 98 % per path it is 14 %; at 95 %, 30 %;
- a place where both paths are down together stops traffic, so coverage has to be planned for both.

## What it means together

- **The safety findings are robust; the capacity findings are not.** SDR had fewer collisions after a sudden stop than today's road across every assumption, layout and reaction time, and on ice. Radio loss and false alarms caused no collision at all.
  - The capacity gain, by contrast, moves with the actuator delay, the control cycle, the layout, the radio link, and above all with what a real road carries.
  - SDR-04 now says the hybrid's gain against a real merge could be between about +5 % and −7 %. The case for the hybrid therefore rests on flow quality and safety, not on capacity.
  - Relative separation keeps a clear capacity gain, but has no protection against lost loads.
- **The long gap behind trucks needs its confirmation time built in.** Items 2.2 and 2.4 point the same way as item 1.5:
  - at 0.5 s the gap works by chance; at 1 s it does not;
  - a road-only sensor is unlikely to reach 0.5 s.

  The cars' shared sensors or the truck's own load monitoring have to be the first witness (D9, D10).
- **New design rules:**
  - a 60 km/h cap for the hybrid on ice (D1);
  - a false-alarm budget, and no lane closure on a single car's report (D9);
  - two independent radio paths of at least 99 % each, and coverage planned so that no place loses both (D6);
  - a lane change waits for both vehicles' acknowledgement (the protocol, item 4.7).
- **The risk figures went up.** The best SDR setup is at about 3 object collisions per billion vehicle-km (1.5–11), not 0.6. That is still below today's debris crashes, but with less margin.
- **The order of work changed.** During this item it was agreed to settle the foundations first: today's road as a real merge (2.9, then 2.1), the truck rule (1.5) and the control law. The factors (incidents, weather, radio) stay in the model. Until the foundations are settled they are re-run at milestones only. The roadmap's "Suggested order" records this.
- **Documents changed:**
  - SDR-04: verdict, efficiency, weather, radio, safety, risks, confidence and appendix;
  - SDR-01 and SDR-03: D6, D9 and the risk table;
  - README ("Where things stand");
  - the simulator README and changelog;
  - the roadmap: status, new items 2.9 and 2.10, a note on 1.5, and the order of work.

## Limits and open questions

- **No real detector data was used.** The break-even rests on published capacities from several sources, not on one fitted road. Item 2.1 stays open.
- **Today's drivers have no capacity drop and never swerve.** Both make today's road look worse in some ways and better in others; new item 2.9.
- **Layouts that need new geometry are not done:** a second on-ramp, weaving, a lane drop, the safety lane at junctions. New item 2.10.
- **The detector model behind the false-alarm operating point is an assumption:** Gaussian noise, one look per 10 m of lane. The re-check times of 10 and 60 s are assumed, not researched.
- **Most risk-model inputs are still assumptions,** now with ranges. The heaviest one, how many objects stop a car dead, moves every scenario by a factor of 4.
- **The radio model is simple:**
  - loss on the way back (vehicle to road) is not modelled;
  - the acknowledgement is assumed to arrive one control cycle later;
  - burst lengths and loss rates of a real C-V2X or 5G link at motorway speed were not researched;
  - jamming is not modelled.

  The 99 % per path is a requirement derived from the model, not a measured property of any radio.
- **The full suite now takes about 5 hours** on a 14-core machine, against 70 minutes before section 2. That is one reason for running the factor tests at milestones only.

## How to repeat it

```powershell
node --test simulator/test
```

```powershell
node simulator/experiments.js
```

The full suite takes about 5 hours on a 14-core machine (about 9,000 runs). To re-run only this section's groups:

```powershell
node simulator/experiments.js --only=sensitivity,ice,pileup,calibration,layouts,false-alarms,radio
```

```powershell
node simulator/risk-model.js
```

```powershell
node simulator/fit-detector.js --sim
```

Where the output lands:

- `simulator/results/results.md`: sections 9a and 15–20, and the comparisons in the last section;
- `simulator/results/results.json`;
- `simulator/results/risk-model.md`, written by the risk model.

`fit-detector.js` reads a detector CSV (`node simulator/fit-detector.js data.csv --flow=... --speed=...`; the options are at the top of the file). With `--sim` it samples today's road instead.
