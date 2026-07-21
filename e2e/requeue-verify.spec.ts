import { test, expect, type Page } from "@playwright/test";

async function openVoiceMonitor(page: Page, agentTypeText?: "Human" | "Air") {
  await page.goto("/");
  await page.getByTestId("tab-supervisor-agents").click();
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

test("requeue button opens overlay; back resets; requeue completes and closes window", async ({ page }) => {
  await openVoiceMonitor(page);
  const win = page.getByTestId("monitoring-call-window");
  await expect(win).toBeVisible();

  // Requeue button visible next to Transfer
  const requeueBtn = page.getByTestId("button-monitor-requeue");
  await expect(requeueBtn).toBeVisible();
  await expect(page.getByTestId("button-monitor-transfer").first()).toBeVisible();

  // Open overlay
  await requeueBtn.click();
  const overlay = page.getByTestId("overlay-monitor-requeue");
  await expect(overlay).toBeVisible();
  await expect(page.getByTestId("input-requeue-search")).toBeVisible();
  await expect(page.getByTestId("list-queues")).toBeVisible();
  await expect(page.getByText("Language")).toBeVisible();
  await expect(page.getByText("Lead Generation")).toBeVisible();

  // Footer disabled until selection; Choose skill always disabled
  await expect(page.getByTestId("button-choose-skill")).toBeDisabled();
  await expect(page.getByTestId("button-requeue-ask-first")).toBeDisabled();
  await expect(page.getByTestId("button-requeue-confirm")).toBeDisabled();

  // Search filters
  await page.getByTestId("input-requeue-search").fill("madrid");
  await expect(page.getByTestId("row-queue-q2")).toBeVisible();
  await expect(page.getByTestId("row-queue-q1")).toHaveCount(0);
  await page.getByTestId("input-requeue-search").fill("");

  // Select queue enables Ask first / Requeue
  await page.getByTestId("row-queue-q1").click();
  await expect(page.getByTestId("button-requeue-ask-first")).toBeEnabled();
  await expect(page.getByTestId("button-requeue-confirm")).toBeEnabled();
  await page.screenshot({ path: "/tmp/requeue-selected.png" });

  // Back returns to monitoring, no side effects
  await page.getByTestId("button-requeue-back").click();
  await expect(overlay).toHaveCount(0);
  await expect(win).toBeVisible();

  // Reopen — search + selection reset
  await requeueBtn.click();
  await expect(page.getByTestId("input-requeue-search")).toHaveValue("");
  await expect(page.getByTestId("button-requeue-confirm")).toBeDisabled();

  // Complete requeue: toast + window closes
  await page.getByTestId("row-queue-q1").click();
  await page.getByTestId("button-requeue-confirm").click();
  await expect(page.getByText(/Call requeued/).first()).toBeVisible();
  await expect(win).toHaveCount(0);
});

test("human-agent voice monitor also shows Requeue", async ({ page }) => {
  await openVoiceMonitor(page, "Human");
  await expect(page.getByTestId("monitoring-call-window")).toBeVisible();
  await expect(page.getByTestId("button-monitor-requeue")).toBeVisible();
  await page.screenshot({ path: "/tmp/requeue-human-row.png" });
});
