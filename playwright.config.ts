import { execSync } from "node:child_process";
import { defineConfig } from "@playwright/test";

// Replit runs on NixOS, where Playwright's downloaded browser builds can't
// resolve their shared libraries. Use the Nix-provided system chromium
// instead (installed as a system dependency), overridable via env var.
function chromiumExecutablePath(): string | undefined {
  if (process.env.PLAYWRIGHT_CHROMIUM_PATH) {
    return process.env.PLAYWRIGHT_CHROMIUM_PATH;
  }
  try {
    const p = execSync("which chromium", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
    return p || undefined;
  } catch {
    return undefined;
  }
}

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [["list"]],
  use: {
    // All artifacts are reached through the shared reverse proxy on port 80.
    // The rcx-supervisor app is mounted at "/".
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:80",
    headless: true,
    viewport: { width: 1440, height: 900 },
    launchOptions: { executablePath: chromiumExecutablePath() },
  },
});
