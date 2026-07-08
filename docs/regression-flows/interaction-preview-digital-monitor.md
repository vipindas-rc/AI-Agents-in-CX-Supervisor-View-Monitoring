---
id: interaction-preview-digital-monitor
title: Digital AirPro interaction preview, take over, and hand back
feature: supervisor-interactions
status: verified
priority: critical
tags: [interactions, airpro, preview, takeover, deep-link]
last_verified: 2026-07-08
---

# Digital AirPro interaction preview, take over, and hand back

## Automation
This flow is automated as a Playwright suite: `e2e/interaction-preview.spec.ts`
(run with `pnpm run test:e2e` from the repo root; the app must be running and
reachable at `http://localhost:80/`). The manual steps below remain as the
human-readable runbook and as documentation of the covered assertions.

## Goal
Verify the digital AI-agent monitoring flow: monitor icon on a digital AirPro
row opens the Interaction preview popup, the popup enlarges to full page,
Take over switches to the embedded take-over view where the supervisor can
send a message, "← Supervisor" hands the conversation back, deep links
`/interactions/:engagementId/:mode` restore the preview on refresh, and
Take over is disabled for a Pending Inactive AirPro agent.

## Preconditions
- App is running and reachable at `/` (RCX Supervisor View).
- Mock data is the seeded default (in-memory; a page refresh resets any
  supervisor state changes).
- Seeded digital AirPro rows (engagement IDs are deterministic):
  - `eng-1011-1` / `eng-1011-2` — Mia Garcia (Retention Agent), state
    Pending Inactive at rest.
  - `eng-1023-1` / `eng-1023-2` — Nina Ivanov (Sales Agent), state
    Pending Inactive at rest.
- Take over availability tracks the handling agent's state: Pending
  Inactive → disabled; any other active state → enabled. To exercise the
  enabled path, first set Mia Garcia's state to Available from the Agents
  tab (Update agent state). This does not survive a refresh.

## Test data
- Supervisor message: `Regression check message`

## Steps
1. Open `/`.
2. Assert the disabled state first: click the `Interactions` tab, hover the
   row for `Nina Ivanov (Sales Agent)` (a digital, non-voice channel row) and
   click its `Monitor` hover icon.
3. In the Interaction preview popup, confirm the `Take over` button is
   disabled, then close the popup (X in the Contact info header).
4. Go to the `Agents` tab, open the row menu for `Mia Garcia (Retention
   Agent)`, choose `Update agent state`, pick `Available`, click `Update`.
5. Return to the `Interactions` tab, hover a `Mia Garcia (Retention Agent)`
   digital row and click its `Monitor` hover icon.
6. In the popup, click the enlarge (expand) icon in the "Interaction preview"
   header.
7. In the full-page view, click `Take over`.
8. In the embedded take-over view, type `Regression check message` in the
   composer and click `Send`.
9. Click `← Supervisor` in the back row to hand the conversation back.
10. Deep-link restore: navigate directly to `/interactions/eng-1023-1/preview`
    (fresh load, simulating a refresh).

## Assertions
- Step 2: popup `Interaction preview` opens; URL is
  `/interactions/eng-1023-1/preview` (or `-2` depending on the row clicked).
- Step 3: `Take over` button is disabled (grey, not clickable); hovering it
  shows the tooltip "You can't take over right now. This AirPro agent is
  pending inactive."
- Step 5: popup opens with URL `/interactions/eng-1011-<n>/preview`;
  `Take over` is enabled.
- Step 6: view becomes full page (no overlay scrim); URL mode segment is
  `expanded`; `Take over` still shown.
- Step 7: URL mode segment is `takeover`; embedded view shows the
  `← Supervisor` back row, the system line "You have taken over this
  conversation", and the message composer.
- Step 8: `Regression check message` appears in the transcript as a
  supervisor message ("You" with SUP badge).
- Step 9: toast "You've handed the conversation back to <agent first/last
  name>" appears; URL returns to `/`; the Interactions table is visible again.
- Step 10: the Interaction preview popup for `eng-1023-1` is restored from
  the URL alone; `Take over` is disabled again (agent state reset by the
  fresh load).

## Cleanup
- None required: all state is in-memory mock data; a page refresh resets
  Mia Garcia back to Pending Inactive and clears sent messages.

## Notes for reruns
- Useful stable test ids: `tab-supervisor-interactions`,
  `popup-interaction-preview`, `button-take-over`, `button-enlarge`,
  `button-close-preview`, `view-interaction-expanded`,
  `view-interaction-takeover`, `row-takeover-back`,
  `button-back-supervisor`, `input-composer`, `button-send`,
  `row-message-supervisor`, `text-transcript-system`.
- Monitor icons are hover actions on table rows; digital rows handled by a
  human agent deliberately have Monitor disabled ("You can only monitor
  voice calls").
