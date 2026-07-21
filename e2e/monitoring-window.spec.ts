import { test, expect, type Page } from "@playwright/test";

/** Regression coverage for the voice MonitoringCallWindow (RingCX phone call window). */

async function openVoiceMonitor(page: Page, agentTypeText?: "Human" | "Air") {
  await page.goto("/");
  await page.getByTestId("tab-supervisor-agents").click();
  // Voice-only rows are the only ones with an enabled Monitor action.
  let rows = page.getByRole("row");
  if (agentTypeText) rows = rows.filter({ hasText: agentTypeText });
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const btn = row.getByRole("button", { name: "Monitor", exact: true });
    if ((await btn.count()) === 0) continue;
    if (!(await btn.first().isEnabled().catch(() => false))) continue;
    await row.scrollIntoViewIfNeeded();
    await row.hover();
    await btn.first().click();
    return;
  }
  throw new Error("No enabled Monitor button found on Agents tab");
}

test("voice monitor opens the new 800x534 call window with live transcript", async ({ page }) => {
  await openVoiceMonitor(page);

  const win = page.getByTestId("monitoring-call-window");
  await expect(win).toBeVisible();

  // Window shell + left panel
  await expect(page.getByText("RingCX phone call")).toBeVisible();
  await expect(page.getByTestId("text-monitoring-title")).toHaveText("Monitoring call");
  await expect(page.getByTestId("button-monitor-end-call")).toBeVisible();

  // Right panel: tabs + transcript
  await expect(page.getByTestId("tab-monitor-notes")).toBeVisible();
  await expect(page.getByText("AI is transcribing...")).toBeVisible();
  await expect(page.getByTestId("input-transcript-search")).toBeVisible();
  await expect(page.getByTestId("transcript-list")).toBeVisible();

  // Mute must be disabled while listen-only
  await expect(page.getByTestId("button-monitor-mute")).toBeDisabled();

  await page.screenshot({ path: "/tmp/monitor-window-listening.png" });

  // Transcript grows over time (live feed)
  const items = page.locator('[data-testid^="transcript-item-"]');
  const before = await items.count();
  await page.waitForTimeout(4500);
  expect(await items.count()).toBeGreaterThan(before);

  // Search filters the transcript
  await page.getByTestId("input-transcript-search").fill("zzz-no-match");
  await expect(page.getByText("No matching transcript lines")).toBeVisible();
  await page.getByTestId("input-transcript-search").fill("");

  // Tab switching
  await page.getByTestId("tab-monitor-contact").click();
  // Contact tab now mirrors the digital Interaction preview's Contact info
  // pane (shared ContactInfoSections): section rows + interaction history.
  await expect(page.getByTestId("monitoring-contact-info")).toBeVisible();
  await expect(page.getByTestId("section-interaction")).toBeVisible();
  await expect(page.getByTestId("section-contact")).toBeVisible();
  await expect(page.getByTestId("section-history")).toBeVisible();
  await expect(page.getByTestId("row-history-entry").first()).toBeVisible();
  await page.getByTestId("tab-monitor-notes").click();
  await expect(page.getByText("Notes and transcript", { exact: true })).toBeVisible();

  // Collapse toggle hides/shows the side panel
  await page.getByTestId("button-monitor-collapse").click();
  await expect(page.getByTestId("monitoring-notes-panel")).toHaveCount(0);
  await page.screenshot({ path: "/tmp/monitor-window-collapsed.png" });
  await page.getByTestId("button-monitor-collapse").click();
  await expect(page.getByTestId("monitoring-notes-panel")).toBeVisible();

  // Preview notes: loader then notes content
  await page.getByTestId("button-preview-notes").click();
  await expect(page.getByTestId("notes-preview-overlay")).toBeVisible();
  await expect(page.getByTestId("text-notes-preparing")).toBeVisible();
  await expect(page.getByTestId("notes-skeleton")).toBeVisible();
  await page.screenshot({ path: "/tmp/monitor-notes-loading.png" });
  await expect(page.getByTestId("notes-content")).toBeVisible({ timeout: 5000 });
  await expect(page.getByText("Recap")).toBeVisible();
  await expect(page.getByText("Tasks")).toBeVisible();
  await expect(page.getByTestId("button-notes-update")).toBeVisible();
  await page.screenshot({ path: "/tmp/monitor-notes-ready.png" });

  // Update regenerates (back to loader), close removes the overlay
  await page.getByTestId("button-notes-update").click();
  await expect(page.getByTestId("notes-skeleton")).toBeVisible();
  await expect(page.getByTestId("notes-content")).toBeVisible({ timeout: 5000 });
  await page.getByTestId("button-notes-close").click();
  await expect(page.getByTestId("notes-preview-overlay")).toHaveCount(0);
});

test("AI agent monitor: Coach and Barge disabled with AI tooltip; no AI/history/more tabs", async ({ page }) => {
  await openVoiceMonitor(page, "Air");
  await expect(page.getByTestId("monitoring-call-window")).toBeVisible();

  const coach = page.getByTestId("button-monitor-coach");
  const barge = page.getByTestId("button-monitor-barge");
  await expect(coach).toBeDisabled();
  await expect(barge).toBeDisabled();
  await barge.hover({ force: true });
  await expect(page.getByText("Not available for AI agents")).toBeVisible();
  await expect(page.getByTestId("button-monitor-take-over")).toBeEnabled();

  // Trimmed tab bar: only Contact info + Notes and transcripts remain.
  await expect(page.getByTestId("tab-monitor-contact")).toBeVisible();
  await expect(page.getByTestId("tab-monitor-notes")).toBeVisible();
  await expect(page.getByTestId("tab-monitor-ai")).toHaveCount(0);
  await expect(page.getByTestId("tab-monitor-history")).toHaveCount(0);
  await expect(page.getByTestId("tab-monitor-more")).toHaveCount(0);
});

test("barge enables mute, shows snackbar; take over swaps to the dialer", async ({ page }) => {
  await openVoiceMonitor(page, "Human");
  const win = page.getByTestId("monitoring-call-window");
  await expect(win).toBeVisible();

  const barge = page.getByTestId("button-monitor-barge");
  await expect(barge).toBeEnabled();
  await barge.click();
  await expect(page.getByTestId("snackbar-barge")).toBeVisible();
  await expect(page.getByTestId("button-monitor-mute")).toBeEnabled();
  await page.screenshot({ path: "/tmp/monitor-window-barged.png" });
  await page.getByTestId("button-monitor-mute").click();

  // Take over -> whole window swaps to the active-call Dialer
  await page.getByTestId("button-monitor-take-over").click();
  await expect(page.getByTestId("monitoring-dialpad-takeover")).toBeVisible();
  await expect(win).not.toBeVisible();
  await page.screenshot({ path: "/tmp/monitor-window-takenover.png" });
});

test("transfer opens the dialer transfer workflow overlay", async ({ page }) => {
  await openVoiceMonitor(page);
  await expect(page.getByTestId("monitoring-call-window")).toBeVisible();

  const transfer = page.getByTestId("button-monitor-transfer");
  await expect(transfer).toBeEnabled();
  await transfer.click();

  const overlay = page.getByTestId("overlay-monitor-transfer");
  await expect(overlay).toBeVisible();
  await page.screenshot({ path: "/tmp/monitor-transfer-open.png" });

  // Clicking the scrim closes the overlay; the monitoring window stays open.
  await overlay.click({ position: { x: 10, y: 10 } });
  await expect(overlay).toHaveCount(0);
  await expect(page.getByTestId("monitoring-call-window")).toBeVisible();
});

test("end call closes the window and clears monitoring", async ({ page }) => {
  await openVoiceMonitor(page);
  const win = page.getByTestId("monitoring-call-window");
  await expect(win).toBeVisible();

  await page.getByTestId("button-monitor-end-call").click();
  await expect(win).not.toBeVisible();
});
