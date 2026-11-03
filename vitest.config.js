import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Default to the Node environment; individual DOM tests build their own
    // jsdom Document via the shared helper (helpers/dom.js) so they stay in
    // full control of how index.html is parsed. Playwright-based layout tests
    // live under tests/e2e and run via `npm run test:e2e`, not Vitest.
    environment: "node",
    include: ["tests/**/*.test.js"],
    exclude: ["tests/e2e/**", "node_modules/**"],
  },
});
