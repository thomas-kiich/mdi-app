---
name: automation-and-scheduling
description: MUST read before requests involving automated execution, recurring execution, background execution, event-triggered execution, bot/agent execution, or auto-updating systems. Use it to choose the right implementation approach before building.
---

# Automation and Scheduling

Read this before building any automation, scheduled task, recurring workflow, bot, monitoring, or "if X then Y" system. Do not start building until you complete the assessment below.

## Quick Check

If the task is simple and personal — a reminder, a greeting, a brief daily update — and runs a few times a day or less, use **schedule → Manus execution** directly. The credit cost is minimal and does not justify building a programmatic solution. Update your plan accordingly and skip to `manus-config` skill. Proceed to the full assessment below only for tasks with growing scope, high frequency, complex integrations, or a management interface.

## Step 1: Assess the Request

Answer these questions before choosing an architecture. You can often infer from context — ask the user only when you cannot infer and the answer would change the route.

### 1. Is the user asking to "build" something, or to "do" something?

"Build me a tracker / monitor / tool / system" implies a durable product with long-term ownership. The user likely expects a management interface, room to grow, and ongoing control. "Check X every day and tell me" is a task to run — simpler setup is fine.

### 2. Does the execution need AI judgment, or is it deterministic code?

"Summarize new documents" needs judgment. "Check if price > threshold and notify" is a programmatic step — an API call, a comparison, and a notification. Many requests sound intelligent but are actually deterministic. **Deterministic tasks should NOT use Manus execution** — Manus takes minutes to start, costs credits per run, and adds no value when the logic is a few lines of code. Note: `manus-config schedule` triggers a full Manus task on every run, consuming credits regardless of what steps/code/tools runs inside it. For truly free-per-run deterministic execution, use WebDev + cron (via `webdev_init_project`).

There is a middle ground: **built-in LLM**. It handles AI substeps (translation, entity extraction, classification, simple generation) without Manus execution, at a cost that depends on the model chosen. Before using it, tell the user which model will be used — different models vary significantly in capability and cost. See the "Built-in LLM" section in `references/implementation-patterns.md` for guidance.

### 3. Will the scope or frequency grow?

"Just one item for now" or "start with X only" implies more later. Growing scope × frequency means Manus credits (积分) scale linearly, while programmatic execution is essentially free per run.

### 4. Does the user need to manage parameters over time?

Add/remove items, adjust thresholds, change recipients — this needs a GUI, which points to WebDev. If it's truly set-and-forget, a schedule is fine.

### 5. Where does the data come from?

Public API → programmatic code can call it directly. Manus connector → needs Manus execution or Manus API. When both are possible, present the tradeoff.

### 6. What triggers it?

Fixed time → schedule or WebDev cron. External event (webhook, new message) → persistent trigger. Must stay online 24/7 → persistent computing.

## Step 2: Choose the Route

Map your assessment answers to a route. **If multiple routes are viable, present 2–3 options with concrete tradeoffs and let the user choose. Do not pick for them.**

| Assessment points to… | Route |
| --- | --- |
| Judgment-heavy execution, complex output (reports, summaries, analysis), quality matters most | **schedule → Manus execution** — Use `manus-config schedule`. Manus runs the task at fixed times. No code to write, uses Manus connectors. Costs credits per run. No management UI. (Read `manus-config` skill for detail)|
| Deterministic execution, simple output (notifications, data writes), scope may grow, user may need to manage parameters, cost or latency matters | **WebDev + cron** — Use `webdev_init_project`. A WebDev app with backend cron jobs running deterministic code. Free per run. Can include a GUI for managing parameters. Stateless, 15-min timeout, 1 vCPU / 512 MB. **WebDev cannot use Manus connectors directly** — external integrations (Slack, Telegram, email, etc.) require the user to set up their own API keys or webhook URLs. This one-time setup cost is far lower than per-run Manus credits (积分). Read `persistent-computing` for full WebDev capabilities. |
| Event-triggered or complex trigger logic (webhooks, polling with state, filtering, dedup) | **Persistent Trigger + Manus API** — A durable host detects events, then creates Manus tasks for execution. Read `persistent-computing` and `manus-api`. |
| Standard web app, dashboard, or CRUD tool | **WebDev** — Use `webdev_init_project`. Read `persistent-computing` for capabilities. |
| Always-on service, Docker, fixed IP, webhook endpoint | **Persistent computing** — Read `persistent-computing` before recommending. |
| One-off or current-session work | **default sandbox** — The sandbox hibernates when inactive. Do not use it for tasks that must stay online to receive callbacks, webhooks, or async API responses. |

## Step 3: Clarify if Needed

Ask only the 2–4 questions that would change the architecture. **Architecture questions come before implementation questions** — "which Slack channel?" or "alert above or below?" are implementation details that come after the route is decided.

| When you can't infer… | Ask |
| --- | --- |
| Execution nature | "Is this a rule-based check, or does it need analysis/writing/judgment?" |
| Scale trajectory | "Will the scope stay as-is, or might you add more items / increase frequency?" |
| Manageability | "Do you want to adjust parameters over time, or set it once and let it run?" |
| Data source | "Should this use a Manus connector, or is the data available via a public API?" |
| Cost vs. convenience | "Would you prefer a quick setup that costs credits per run, or invest setup time for a free-running solution?" |

## Related Skills

| When | Read |
| --- | --- |
| Route involves WebDev or persistent hosting | `persistent-computing` |
| Route involves Manus API | `manus-api` |

Read `references/implementation-patterns.md` after a route is selected for concrete playbooks.
