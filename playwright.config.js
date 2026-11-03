import { defineConfig } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

// Layout and computed-style properties that jsdom cannot evaluate (e.g.
// Property 18: no horizontal scrolling across 320-767px widths) run here in a
// real headless browser. The site needs no server or build step, so the page
// is loaded directly from the file:// URL of index.html.
const INDEX_FILE_URL = pathToFileURL(resolve("index.html")).href;

export default defineConfig({
  testDir: "./tests/e2e",
  // Property 18 samples a minimum of 100 widths; give layout checks room to run.
  timeout: 60_000,
  use: {
    baseURL: INDEX_FILE_URL,
  },
});
