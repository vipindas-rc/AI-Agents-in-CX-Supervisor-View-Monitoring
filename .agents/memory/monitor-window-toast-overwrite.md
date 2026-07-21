---
name: Monitor window toast overwrite
description: Completion toasts from MonitoringCallWindow flows get overwritten by the host's "Stopped monitoring" flash.
---

Rule: any flow inside MonitoringCallWindow that emits a confirmation toast and then calls `onClose()` will have its toast overwritten — the host (AgentTablePanel) flashes "Stopped monitoring …" inside the `setMonitoredId` updater, which runs on the *next React render*, after your synchronous `onToast` call.

**Why:** discovered while wiring the Requeue completion toast; synchronous re-emit after `onClose()` still lost to the host flash. E2e showed only "Stopped monitoring" in the single-slot toast div.

**How to apply:** re-emit the confirmation toast in a `window.setTimeout(..., ~80ms)` after `onClose()`, or make the host close path silent for handoffs. The transfer completion path has the same latent issue.
