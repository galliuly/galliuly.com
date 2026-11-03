// Feature: portfolio-website — Static-hosting and render smoke check (task 15.2)
//
// Design Testing Strategy / Req 2.2, 2.3, 7.1, 7.3: index.html opened directly
// (file:// URL, no server, no build) renders all sections, and section text
// appears without depending on non-essential media. Runs in a headless browser.

import { test, expect } from "@playwright/test";

const SECTION_IDS = ["hero", "about", "experience", "education", "skills", "contact"];

test("renders all sections from a direct file load, no server/build (Req 2.2, 2.3)", async ({ page }) => {
  const response = await page.goto("index.html");
  // Loaded straight from file://; a null response is expected for file URLs,
  // and the page must still have parsed and rendered.
  expect(response === null || response.ok()).toBeTruthy();

  for (const id of SECTION_IDS) {
    const section = page.locator(`#${id}`);
    await expect(section).toHaveCount(1);
  }
});

test("section text is present and visible without waiting on media (Req 7.1, 7.3)", async ({ page }) => {
  await page.goto("index.html");

  // The hero name paints as text (not dependent on the profile image loading).
  await expect(page.locator("#hero h1")).toHaveText(/Ulysses Galli/);

  // Each content section exposes its heading text.
  for (const id of ["about", "experience", "education", "skills", "contact"]) {
    await expect(page.locator(`#${id} h2`)).toBeVisible();
  }
});
