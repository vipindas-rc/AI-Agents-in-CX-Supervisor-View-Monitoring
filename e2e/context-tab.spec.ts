import { test, expect } from "@playwright/test";

/**
 * Coverage for the Contact info pane's CONTEXT tab (Figma node 88-63593):
 * four-card layout, Read more expand/collapse, truthful AI hop log with a
 * live running duration, and the "You" chip appended after take over.
 *
 * Seeded mock facts (supervisorMock.ts): eng-1023-1 is a digital AirPro
 * engagement handled by "Nina Ivanov (Sales Agent)", so its hop log seeds as
 * "AIR Pro - Welcome & Routing" (closed) + "AIR Pro - Sales Agent" (running).
 */

const ENGAGEMENT = "eng-1023-1";

test("context tab shows caller identity, summary, hop log, and data chips", async ({
  page,
}) => {
  await page.goto(`/interactions/${ENGAGEMENT}/preview`);
  await page.getByTestId("contact-pane-tab-context").click();

  await expect(page.getByTestId("context-card-caller")).toBeVisible();
  await expect(page.getByTestId("context-caller-name")).toHaveText(
    "Rafael Mobley",
  );
  await expect(page.getByTestId("context-card-summary")).toBeVisible();
  await expect(page.getByTestId("context-card-hops")).toBeVisible();
  await expect(page.getByTestId("context-card-data")).toBeVisible();

  // Truthful AI-only hop log: routing hop + current skill hop, no humans.
  await expect(page.getByTestId("context-hop-0")).toContainText(
    "AIR Pro - Welcome & Routing",
  );
  await expect(page.getByTestId("context-hop-1")).toContainText(
    "AIR Pro - Sales Agent",
  );
  await expect(page.getByTestId("context-hop-2")).toHaveCount(0);

  // Read more expands the summary inline, then collapses again.
  const toggle = page.getByTestId("context-summary-toggle-0");
  await expect(toggle).toHaveText("Read more");
  await toggle.click();
  await expect(toggle).toHaveText("Show less");
  await toggle.click();
  await expect(toggle).toHaveText("Read more");
});

test("running hop duration ticks live", async ({ page }) => {
  await page.goto(`/interactions/${ENGAGEMENT}/preview`);
  await page.getByTestId("contact-pane-tab-context").click();
  const running = page.getByTestId("context-hop-1");
  const before = await running.textContent();
  await page.waitForTimeout(2500);
  const after = await running.textContent();
  expect(after).not.toBe(before);
});

test("take over closes the running hop and appends a You chip", async ({
  page,
}) => {
  await page.goto(`/interactions/${ENGAGEMENT}/preview`);
  await page.getByTestId("button-take-over").click();
  await expect(page.getByTestId("view-interaction-takeover")).toBeVisible();

  await page.getByTestId("contact-pane-tab-context").click();
  await expect(page.getByTestId("context-hop-2")).toHaveText("You");

  // The previously running hop is closed: its duration no longer ticks.
  const closed = page.getByTestId("context-hop-1");
  const before = await closed.textContent();
  await page.waitForTimeout(2500);
  expect(await closed.textContent()).toBe(before);
});

/**
 * Voice monitoring window (MonitoringCallWindow) Context tab: human agents get
 * a truthful Queue -> Agent hop chain; take over appends a "You" chip.
 */
test("voice monitor context tab shows queue/agent hops and You after take over", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByTestId("tab-supervisor-agents").click();
  // Find a Human row with an enabled Monitor action.
  const rows = page.getByRole("row").filter({ hasText: "Human" });
  const count = await rows.count();
  let opened = false;
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const btn = row.getByRole("button", { name: "Monitor", exact: true });
    if ((await btn.count()) === 0) continue;
    if (!(await btn.first().isEnabled().catch(() => false))) continue;
    await row.scrollIntoViewIfNeeded();
    await row.hover();
    await btn.first().click();
    opened = true;
    break;
  }
  expect(opened).toBe(true);

  await expect(page.getByTestId("monitoring-call-window")).toBeVisible();
  await page.getByTestId("tab-monitor-context").click();

  await expect(page.getByTestId("context-card-caller")).toBeVisible();
  await expect(page.getByTestId("context-card-summary")).toBeVisible();
  await expect(page.getByTestId("context-card-data")).toBeVisible();
  await expect(page.getByTestId("context-hop-0")).toContainText(
    "Queue - Customer Support",
  );
  await expect(page.getByTestId("context-hop-1")).toContainText("Agent -");
  await expect(page.getByTestId("context-hop-2")).toHaveCount(0);

  // The running agent hop ticks live while monitoring.
  const running = page.getByTestId("context-hop-1");
  const before = await running.textContent();
  await page.waitForTimeout(2500);
  expect(await running.textContent()).not.toBe(before);

  // Take over swaps the window to the active-call dialpad (the "You" hop is
  // recorded at that moment; the dialpad view itself has no side panel).
  await page.getByTestId("button-monitor-take-over").click();
  await expect(page.getByTestId("monitoring-dialpad-takeover")).toBeVisible();
});
