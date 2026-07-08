import { test, expect, type Page } from "@playwright/test";

/**
 * Regression coverage for the RCX Supervisor digital interaction preview flow:
 * monitor icon -> preview popup -> enlarge -> take over -> send message ->
 * hand back, plus the /interactions/:engagementId/:mode deep links.
 *
 * Mirrors the manual runbook in
 * docs/regression-flows/interaction-preview-digital-monitor.md.
 *
 * Seeded mock data facts this spec relies on (supervisorMock.ts):
 * - Digital AirPro engagements: eng-1011-1/2 (Mia Garcia (Retention Agent))
 *   and eng-1023-1/2 (Nina Ivanov (Sales Agent)).
 * - Both AirPro agents seed as "Engaged", so Take over is ENABLED by default.
 *   "Pending Inactive" (which disables Take over) is runtime-only: it appears
 *   for ~3s while an engaged AirPro agent drains after being switched off,
 *   which is too short a window to assert reliably end-to-end.
 */

const MIA = "Mia Garcia (Retention Agent)";
const NINA = "Nina Ivanov (Sales Agent)";
const NINA_ENGAGEMENT = "eng-1023-1";
const MIA_ENGAGEMENT = "eng-1011-1";
const TAKEOVER_SYSTEM_LINE = "You have taken over this conversation";
const STATE_SUCCESS_TOAST = "The agent's state has been updated successfully.";

async function openInteractionsTab(page: Page) {
  await page.getByTestId("tab-supervisor-interactions").click();
}

/**
 * Hover a digital interaction row (located by agent name) and click its
 * Monitor hover action. Rows re-render every ~2.5s from simulated drift, so
 * selectors rely on Playwright auto-retry.
 */
async function clickMonitorOnRow(page: Page, agentName: string) {
  const row = page.getByRole("row").filter({ hasText: agentName }).first();
  await row.scrollIntoViewIfNeeded();
  await row.hover();
  await row.getByRole("button", { name: "Monitor", exact: true }).click();
}

async function setAgentAvailable(page: Page, agentName: string) {
  await page.getByTestId("tab-supervisor-agents").click();
  const row = page.getByRole("row").filter({ hasText: agentName }).first();
  await row.scrollIntoViewIfNeeded();
  await row.hover();
  await row.getByRole("button", { name: "More", exact: true }).click();
  await page.getByRole("menuitem", { name: /update agent state/i }).click();
  const modal = page.getByTestId("modal-update-agent-state");
  await expect(modal).toBeVisible();
  const availableOption = page.getByTestId("option-AVAILABLE");
  if (!(await availableOption.isVisible().catch(() => false))) {
    await page.getByTestId("select-agent-state").click();
  }
  await availableOption.click();
  await page.getByTestId("button-update-state").click();
  await expect(page.getByText(STATE_SUCCESS_TOAST).first()).toBeVisible();
}

test.describe("digital interaction preview flow", () => {
  test("monitor icon opens preview popup; Take over is enabled for an Engaged AirPro agent", async ({
    page,
  }) => {
    await page.goto("/");
    await openInteractionsTab(page);

    // Nina Ivanov seeds as Engaged — never touched in this test.
    await clickMonitorOnRow(page, NINA);

    const popup = page.getByTestId("popup-interaction-preview");
    await expect(popup).toBeVisible();
    await expect(page).toHaveURL(/\/interactions\/eng-1023-\d+\/preview/);

    const takeOver = page.getByTestId("button-take-over");
    await expect(takeOver).toBeVisible();
    await expect(takeOver).toBeEnabled();

    // Close returns to the supervisor view.
    await page.getByTestId("button-close-preview").click();
    await expect(popup).not.toBeVisible();
    await expect(page).not.toHaveURL(/\/interactions\//);
  });

  test("full flow: enable agent, monitor, enlarge, take over, send message, hand back", async ({
    page,
  }) => {
    await page.goto("/");

    // Flip Mia Garcia to Available so Take over unlocks (in-memory only).
    await setAgentAvailable(page, MIA);

    await openInteractionsTab(page);
    await clickMonitorOnRow(page, MIA);

    const popup = page.getByTestId("popup-interaction-preview");
    await expect(popup).toBeVisible();
    await expect(page).toHaveURL(/\/interactions\/eng-1011-\d+\/preview/);

    const takeOver = page.getByTestId("button-take-over");
    await expect(takeOver).toBeEnabled();

    // Enlarge -> expanded full-page view, URL mode flips to /expanded.
    await page.getByTestId("button-enlarge").click();
    await expect(page.getByTestId("view-interaction-expanded")).toBeVisible();
    await expect(page).toHaveURL(/\/interactions\/eng-1011-\d+\/expanded/);

    // Take over -> takeover view with the system line and composer.
    await page.getByTestId("button-take-over").click();
    await expect(page.getByTestId("view-interaction-takeover")).toBeVisible();
    await expect(page).toHaveURL(/\/interactions\/eng-1011-\d+\/takeover/);
    await expect(page.getByText(TAKEOVER_SYSTEM_LINE).first()).toBeVisible();

    // Send a supervisor message; it must land in the transcript.
    const messageText = `Regression check ${Date.now()}`;
    await page.getByTestId("input-composer").fill(messageText);
    await page.getByTestId("button-send").click();
    await expect(
      page
        .getByTestId("row-message-supervisor")
        .filter({ hasText: messageText })
        .first(),
    ).toBeVisible();

    // Hand back via the "← Supervisor" back row.
    await page.getByTestId("button-back-supervisor").click();
    await expect(page).not.toHaveURL(/\/interactions\//);
    await expect(
      page.getByTestId("view-interaction-takeover"),
    ).not.toBeVisible();
  });

  test("deep link /interactions/:engagementId/preview restores the popup", async ({
    page,
  }) => {
    await page.goto(`/interactions/${NINA_ENGAGEMENT}/preview`);

    await expect(page.getByTestId("popup-interaction-preview")).toBeVisible();
    // Fresh page load resets in-memory agent state -> Engaged again.
    await expect(page.getByTestId("button-take-over")).toBeEnabled();
  });

  test("deep link /interactions/:engagementId/expanded restores the expanded view", async ({
    page,
  }) => {
    await page.goto(`/interactions/${MIA_ENGAGEMENT}/expanded`);

    await expect(page.getByTestId("view-interaction-expanded")).toBeVisible();
    await expect(page.getByTestId("button-take-over")).toBeVisible();
  });
});
