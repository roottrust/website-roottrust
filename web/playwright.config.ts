import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure" },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
    { name: "chromium-mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium", viewport: { width: 390, height: 844 } } },
    { name: "firefox-smoke", testMatch: /qa-smoke\.spec\.ts/, use: { ...devices["Desktop Firefox"], viewport: { width: 1280, height: 800 } } },
    { name: "webkit-smoke", testMatch: /qa-smoke\.spec\.ts/, use: { ...devices["Desktop Safari"], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: [{
    command: "npm run start -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    env: { FORM_MODE: "demo" },
    timeout: 60000,
  }, {
    command: "npm run start -- --hostname 127.0.0.1 --port 3101",
    url: "http://127.0.0.1:3101",
    reuseExistingServer: false,
    env: { FORM_MODE: "" },
    timeout: 60000,
  }],
});
