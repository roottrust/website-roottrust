import { defineConfig, devices } from "@playwright/test";

// Standalone fake-only run: npx playwright test --config tests/turnstile.config.ts
process.env.TURNSTILE_FAKE_TEST = "1";
export default defineConfig({
  testDir: "./e2e",
  testMatch: /turnstile-resize\.spec\.ts/,
  reporter: "list",
  use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:3187", viewport: { width: 1440, height: 900 } },
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3187",
    url: "http://127.0.0.1:3187",
    reuseExistingServer: false,
    timeout: 60000,
    env: {
      BACKEND_MODE: "public", FORM_MODE: "off", TURNSTILE_SITE_KEY: "fake-site-key", TURNSTILE_SECRET_KEY: "fake-test-key",
      // Invalid explicit credentials fail synchronously before ADC/Firestore, including inherited local credentials.
      FIREBASE_SERVICE_ACCOUNT_JSON: "{}", DISCORD_DIAGNOSTIC_WEBHOOK_URL: "disabled-for-fake-test",
      TURNSTILE_HOSTNAMES: "localhost", TRUSTED_ORIGINS: "http://localhost:3187", TRUSTED_IP_HEADER: "x-real-ip",
      DATA_ID_SECRET: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", INTERNAL_KEY_JOBS: "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
      RESEND_API_KEY: "fake", NEWSLETTER_EMAIL_FROM: "news@example.com", NEWSLETTER_EMAIL_REPLY_TO: "reply@example.com",
      REPORT_EMAIL_FROM: "reports@example.com", REPORT_EMAIL_REPLY_TO: "reply@example.com",
      NEWSLETTER_SITE_ORIGIN: "https://example.com", RESEND_DOMAIN_CONFIRMED: "true", JOBS_TRIGGER_CONFIRMED: "true",
      RESEND_NEWSLETTER_SEGMENT_ID: "segment_test", NEWSLETTER_PILOT_SEGMENT_CONFIRMED: "true", RESEND_WEBHOOK_SECRET: "fake",
    },
  },
});
