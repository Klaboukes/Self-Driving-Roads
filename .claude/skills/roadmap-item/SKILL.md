---
name: roadmap-item
description: Take one whole item (section) from ROADMAP.md, such as 1, 2, 3 or 4, and work through each of its sub-items (1.1, 1.2, 1.3 …) step by step, with parallel sub-agents where sub-items are independent. Then write one plain-language report of the work and the results, and ask whether to land it on GitHub (commit and push). Use when the user says "do roadmap item 1", "work through section 2 of the roadmap", "/roadmap-item 3" or similar.
argument-hint: "[item number: 1, 2, 3 or 4 — leave empty to choose]"
---

# Work through one roadmap item

Item requested: `$ARGUMENTS`

One run of this skill handles **one whole item** of [ROADMAP.md](../../../ROADMAP.md): a numbered section (1, 2, 3 or 4) with all its sub-items (1.1, 1.2, …). Four phases, in this order: plan, work through the sub-items, report, land. Never start on another section in the same run; anything new the work uncovers goes into the report as a proposed follow-up.

If the user names a single sub-item (`1.3`), run the same four phases for that sub-item alone.

## 1. Plan the item

1. Read `ROADMAP.md` in full. Each sub-item has **Why**, **Do** and **Done when**. Those three are the brief: "Do" is the scope, "Done when" is the finish line. Section 3 lists its sub-items as bullets (3.1–3.6), section 4 as a numbered list (4.1–4.8).
2. Resolve the item:
   - A number was given: use it. If it does not exist, say so and stop. Sub-items already marked done are skipped; if all are done, say so and stop.
   - Nothing was given: list the sections with their open sub-items, recommend one using the roadmap's "Suggested order", and ask the user which to take. Wait for the answer.
3. Check the starting state with `git status`. If there are uncommitted changes that are not yours, stop and ask; the landing step must contain this item's work only.
4. Sort the open sub-items into what a run can finish and what it cannot:
   - **S and M sub-items:** in scope.
   - **L sub-items and everything in section 4** need outside data, hardware or other people. Do not pretend to finish them. For each, name the slice that can be done now (a literature review, a first model, a data-fetching script, a structured analysis) and agree the slices with the user before starting. The rest stays open.
   - A sub-item that depends on something outside this section (the roadmap says so, e.g. 1.2 depends on point 4.4): mention it and ask.
5. Decide the order and what runs side by side (see "Sub-agents" below):
   - dependencies first;
   - a sub-item that changes how results are measured or reported (such as 1.4) before the ones that will report with it;
   - small before large, so early results can still steer the larger ones.
6. Tell the user the plan in a few lines: the sub-items in order, which run in parallel, and what "done" looks like for the whole item. Then start. No approval is needed when every sub-item is S or M.

## 2. Work through the sub-items

Take the sub-items one step at a time. A step is one sub-item, or a batch of independent sub-items handled by parallel sub-agents. For every sub-item:

1. **Read** what it touches before changing anything: the relevant parts of `simulator/engine.js`, `simulator/experiments.js`, [simulator/README.md](../../../simulator/README.md) and the document sections it quotes (mostly [SDR-04](../../../SDR-04-Viability-Assessment.md)).
2. **Do** the work under the rules below.
3. **Check the finish line.** Go through the "Done when" sentence by sentence against the actual output. Each part is met, not met, or met in part. If it is not met and more work within the sub-item's size could meet it, do that work. If it cannot be met, record why.
4. **Update the documents** for this sub-item (list below).
5. **Tell the user** in two or three lines what came out, then go on to the next sub-item. Do not stop to ask between sub-items unless something blocks the rest.

If a sub-item fails or is blocked, record it and carry on with the sub-items that do not depend on it. If an early result makes a later sub-item pointless or changes its question, say so and adjust; do not run it unchanged for the sake of the list.

### Ground rules of this project

They are not negotiable inside a roadmap item:

- **Priorities:** 1. safety, 2. efficiency, 3. speed. A change that gains capacity and costs safety is not a gain; report it as a trade.
- **SDR is 100 % road-guided.** Never model mixed traffic. "Today's road" is a separate all-human copy fed the same traffic, and exists only as the comparison.
- **Keep the comparison honest.** Do not weaken today's road or tune SDR to make a number look better. If a fix helps one road, check whether the same fix belongs on the other.
- **A negative result is a result.** "None of the variants works" or "the option adds nothing and can be dropped" completes a sub-item just as well as a gain does. The roadmap's "Done when" often says so itself.

### How to work

- **Engine changes** (`engine.js`): run `node --test simulator/test` after every change (about a minute). Add a regression test for new behaviour and for any bug you fix. New parameters go in `DEFAULTS` with a default that leaves existing results unchanged, and get a row in the parameter table of `simulator/README.md`.
- **Experiments** (`experiments.js`): add a new group or extend an existing one; do not write throwaway scripts whose numbers cannot be reproduced. Run only what you need with `--only=group1,group2`. The full suite takes about 70 minutes on 14 cores; run anything longer than two minutes in the background.
- **One experiment run at a time per checkout.** `experiments.js` reads `results/results.json` at the start and writes it at the end, and uses every core. Two runs in the same folder lose each other's results.
- **`--quick` overwrites `results/results.json` and `results.md`** with short, noisy runs. Use it to check that a group runs, never for numbers.
- **Statistics:** both roads get the same traffic per seed, so compare per seed and give the spread. Say for each difference whether it is outside the noise. Add seeds where it is not, as far as the run time allows.

### Sub-agents

Sub-agents are optional. Use them when sub-items are independent and working side by side saves real time; a sub-item of a few tool calls is quicker done directly. Launch a parallel batch in one message so the agents run at the same time.

What may run in parallel:

- **Sub-items that touch different files** can share this checkout: for example a browser smoke test (3.1), a GitHub workflow (3.2), a literature or data search, an analysis that only reads. Give each agent the list of files it owns; no two agents write the same file.
- **Sub-items that change the same files** (most often `engine.js` and `experiments.js`) run one after the other. Only when they are large and truly independent, give each agent its own git worktree (`isolation: "worktree"`). A worktree starts from the last commit, so it does not contain uncommitted work from earlier steps: schedule such a batch before any sequential work that it would need. The agent may commit on its worktree's branch; that branch is never pushed.
- **Experiments:** an agent sharing this checkout does not run `experiments.js`. An agent in its own worktree may, on its own copy of the results.

What each sub-agent's brief contains (it knows nothing of this conversation):

- the sub-item's full text from the roadmap (Why, Do, Done when) and the files to read first;
- the ground rules and the "How to work" rules above, in full;
- which files it owns, and that it must not commit in this checkout, push, or touch `ROADMAP.md`, the changelog or the SDR documents — the main session does that;
- what to send back: what it changed (files), the numbers with their spread, the finish-line check point by point, anything that failed or was left out, and the exact commands to repeat its runs.

When the agents come back:

- A sub-agent's summary is a claim, not proof. Read the diff, run `node --test simulator/test`, and check its key numbers against the output files before relying on them.
- Bring worktree work into this checkout one sub-item at a time with `git merge --squash <branch>` (this stages the changes without committing), resolve conflicts, and run the tests after each.
- Do the document updates and the finish-line check for each sub-item yourself.

### Final numbers

The numbers in the report must come from the code as it stands at the end, not from an earlier state or a worktree:

- If the engine's default behaviour changed anywhere in this run, re-run the full suite (`node simulator/experiments.js`) once at the end.
- Otherwise re-run, without `--quick`, every group that was added or changed.
- Confirm with `git diff --stat simulator/results` that only the groups you meant to change did change, and that no section of `results.md` is marked as a quick run.
- If the final run moves a number a sub-item's conclusion rests on, redo that finish-line check.

### Documents to bring in line

- `ROADMAP.md`: add a **Status** bullet to each sub-item worked on, with the date, the outcome in one sentence and a link to the report. Add a Status column to the overview table the first time (open / partly done / done / dropped) and fill in the rows. Add any follow-up the work uncovered as a new sub-item or a note; do not start it.
- `simulator/CHANGELOG.md`: one dated entry for the item in the existing style: what was built, what went wrong, and design lessons marked **Lesson**.
- `SDR-04`, `README.md` ("Where things stand") and `SDR-01`/`SDR-03`: only where a figure or a conclusion they state has changed. Search for the old numbers so no stale copy stays behind.
- `simulator/README.md`: new parameters, groups, limitations removed or added.

## 3. Write the report

One report for the whole item, written when all sub-items are finished or set aside: `reports/<item>-<short-slug>.md`, for example `reports/1-questions-from-latest-results.md`. It is committed with the work.

The reader is someone who knows what SDR is but has not followed this work and does not read code. Write for them:

- Plain language, short sentences, full sentences. No code identifiers in running text unless the reader needs one to repeat a run; then explain it once.
- Lead with the answer. Numbers carry their unit and their comparison ("5,880 veh/h, against 5,400 on today's road"), and their spread where it matters.
- Say what was not done and what is still uncertain as plainly as what worked. Do not round a partial result up to a success.
- About half a page per sub-item is the aim. Tables only for numbers that are compared.

Structure:

```markdown
# Roadmap <item>: <section title>

Date: <YYYY-MM-DD>

## The short answer
Three to five sentences: what the item set out to settle, what came out, what it means for SDR.

## At a glance
| Sub-item | Status | Result in one line |
|---|---|---|
| 1.1 Gate waits below capacity | done / partly done / dropped / not started | … |

## <sub-item number and title>        (one of these per sub-item, in the order worked)
**The question.** Why it was on the roadmap, in two or three sentences.
**What was done.** What was changed or built and which experiments ran (how many runs).
**What came out.** The key numbers, and whether each difference is real or within the noise.
**Finish line.** The roadmap's "Done when", point by point: met, partly met or not met, with one line of evidence each.

## What it means together
The effect on the conclusions in SDR-04 and on the design decisions (D1–D12). What changed in the documents. Where sub-items reinforce or contradict each other.

## Limits and open questions
What the results depend on, what was left out, sub-items still open, and proposed follow-ups.

## How to repeat it
The exact commands, and where the output lands.
```

After writing the file, show the user the report's "short answer" and "at a glance" sections in the conversation, with a link to the file.

## 4. Ask to land it

Landing means: one commit for the whole item on the current branch, pushed to `origin` (https://github.com/Klaboukes/Self-Driving-Roads). This repository commits straight to `main`; do not open a branch or a pull request unless the user asks. Nothing is committed in this checkout before this step.

1. Before asking, make sure it is ready:
   - `node --test simulator/test` passes. If it does not, say so with the output and do not offer to land.
   - `git status` shows only this item's files. Nothing from `node_modules/`, no logs, no scratch files, no quick-run results.
   - Worktrees and branches left by sub-agents are merged in or named to the user as not included.
2. **Ask the user, and wait.** Show:
   - the files that will be committed (`git status --short`), with one line per group of changes;
   - the proposed commit message;
   - the question: land it (commit and push to `origin`)?
   Do not commit and do not push before the user says yes in this conversation. An earlier "yes" for another item does not count. If the user wants changes first, make them and ask again.
3. On yes:
   - stage the files by name (not `git add -A`);
   - commit with a message in the style of `git log`: a subject of at most about 70 characters that says what the item settled, then a wrapped body with a short paragraph or list per sub-item (what was done, the main figures) and what changed in the documents. End with the session's attribution line if it has one;
   - `git push origin HEAD`.
4. If the push is rejected because the remote has moved, do not force-push. Tell the user what happened and ask how to proceed.
5. Confirm with the commit hash and the result of the push. If the user says no, leave the work uncommitted in the working tree and say that it is there.
