import { test, expect, type Page } from "@playwright/test";

/**
 * Voice take-over -> Active calls view (Figma 88-71398): taking over a
 * monitored voice call switches the top tab from Supervisor to Active calls,
 * shows the Details/Interaction card + Contact info panel, and keeps the
 * floating take-over dialer alive.
 */

async function openVoiceMonitor(page: Page) {
  await page.goto("/");
  await page.getByTestId("tab-supervisor-agents").click();
  const rows = page.getByRole("row");
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

async function takeOver(page: Page) {
  await openVoiceMonitor(page);
  await expect(page.getByTestId("monitoring-call-window")).toBeVisible();
  await page.getByTestId("button-monitor-take-over").first().click();
}

test("take over switches to Active calls with details + contact info", async ({ page }) => {
  await takeOver(page);

  // URL-driven Active calls context
  await expect(page).toHaveURL(/\/active-call\//);
  await expect(
    page.getByRole("tab", { name: "Active calls" }),
  ).toHaveAttribute("data-state", "active");
  await expect(
    page.getByRole("tab", { name: "Supervisor" }),
  ).toHaveAttribute("data-state", "inactive");

  // Left details card
  const view = page.getByTestId("view-active-call");
  await expect(view).toBeVisible();
  await expect(view.getByText("Details")).toBeVisible();
  await expect(view.getByText("Queue: Technical Support")).toBeVisible();
  await expect(view.getByText("(720) 715-9212")).toBeVisible();
  await expect(view.getByText("May 13, 2024 03:15PM")).toBeVisible();

  // Right panel: CONTEXT + CONTACT INFO tabs (no Agent Assist). Context is
  // the default and shows the shared four-card content with the take-over
  // "You" hop appended to the hop log.
  await expect(view.getByTestId("tab-activecall-context")).toBeVisible();
  await expect(view.getByTestId("tab-activecall-contact-info")).toBeVisible();
  await expect(view.getByText("Agent Assist")).toHaveCount(0);
  await expect(view.getByTestId("context-card-caller")).toBeVisible();
  await expect(view.getByTestId("context-card-summary")).toBeVisible();
  await expect(view.getByTestId("context-card-hops")).toBeVisible();
  await expect(view.getByTestId("context-card-data")).toBeVisible();
  await expect(view.getByTestId("context-card-hops")).toContainText("You");

  // Contact info tab still shows the profile + interaction history.
  // dispatchEvent: the floating (draggable) take-over dialer window can
  // overlap the panel header at its default position and intercept real
  // pointer events; in the product the supervisor just drags it aside.
  await view
    .getByTestId("tab-activecall-contact-info")
    .dispatchEvent("click");
  await expect(view.getByTestId("section-activecall-history")).toContainText(
    "Interaction history",
  );
  await expect(view.getByText("Rafael Mobley")).toBeVisible();

  // Collapse and reopen the panel: the last-selected tab is restored.
  await view
    .getByTestId("button-activecall-collapse-panel")
    .dispatchEvent("click");
  await expect(view.getByTestId("tab-activecall-contact-info")).toHaveCount(0);
  await view
    .getByTestId("button-activecall-open-panel")
    .dispatchEvent("click");
  await expect(view.getByTestId("section-activecall-history")).toBeVisible();

  // The floating take-over dialer stays open above the new view
  await expect(page.getByTestId("monitoring-dialpad-takeover")).toBeVisible();

  await page.screenshot({ path: "/tmp/active-call-takeover.png" });
});

test("Supervisor tab returns to the table; deep link is refresh-safe", async ({ page }) => {
  await takeOver(page);
  await expect(page).toHaveURL(/\/active-call\//);

  // Refresh-safe deep link
  await page.reload();
  await expect(page.getByTestId("view-active-call")).toBeVisible();

  // Back to Supervisor via the top tab
  await page.getByRole("tab", { name: "Supervisor" }).click();
  await expect(page).toHaveURL(/\/(\?.*)?$/);
  await expect(page.getByTestId("tab-supervisor-agents")).toBeVisible();
  await expect(page.getByTestId("view-active-call")).toHaveCount(0);
});

test("ending the taken-over call returns to the Supervisor tab", async ({ page }) => {
  await takeOver(page);
  await expect(page).toHaveURL(/\/active-call\//);
  const dialer = page.getByTestId("monitoring-dialpad-takeover");
  await expect(dialer).toBeVisible();

  // End the call from the popout dialer (confirm if the end-call sheet opens)
  await dialer.getByTestId("button-end-call").first().click();
  const confirm = page.getByTestId("button-end-call-confirm");
  if (await confirm.count()) await confirm.click();

  // Popout is gone and the page is back on the Supervisor tab
  await expect(page.getByTestId("monitoring-dialpad-takeover")).toHaveCount(0);
  await expect(page).toHaveURL(/\/(\?.*)?$/);
  await expect(
    page.getByRole("tab", { name: "Supervisor" }),
  ).toHaveAttribute("data-state", "active");
  await expect(page.getByTestId("view-active-call")).toHaveCount(0);
});

test("completing a transfer from the take-over dialer stays in Active calls", async ({ page }) => {
  await takeOver(page);
  const dialer = page.getByTestId("monitoring-dialpad-takeover");
  await expect(dialer).toBeVisible();

  // Open the transfer workflow, dial a number, blind transfer
  await dialer.locator('[data-testid$="transfer"]').first().click();
  await dialer.getByTestId("input-transfer-search").fill("17205551234");
  await dialer.getByTestId("button-dial-suggestion").click();
  await dialer.getByTestId("button-transfer-confirm").click();

  // Supervisor remains in the Active calls context
  await expect(page).toHaveURL(/\/active-call\//);
  await expect(
    page.getByRole("tab", { name: "Active calls" }),
  ).toHaveAttribute("data-state", "active");
  await expect(page.getByTestId("view-active-call")).toBeVisible();
});
