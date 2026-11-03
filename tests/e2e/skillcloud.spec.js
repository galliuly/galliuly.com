// Feature: portfolio-website — Skills 3D cloud (e2e).
//
// Verifies the sphere enhancement activates in a real browser and positions
// the skill labels, and that the readable list is the content either way.

import { test, expect } from "@playwright/test";

test("activates the 3D sphere and positions skills absolutely", async ({ page }) => {
  await page.goto("index.html");
  await page.setViewportSize({ width: 1024, height: 900 });

  const cloud = page.locator("[data-skillcloud]");
  await expect(cloud).toHaveClass(/is-active/);

  // Each skill label is positioned (JS sets a transform). Check the first one
  // has a non-trivial transform applied once the sphere renders.
  const firstSkill = page.locator("#skills .skill").first();
  await expect
    .poll(async () =>
      firstSkill.evaluate((el) => getComputedStyle(el).transform),
    )
    .not.toBe("none");
});

test("hovering a skill highlights it", async ({ page }) => {
  await page.goto("index.html");
  await page.setViewportSize({ width: 1024, height: 900 });

  const skill = page.locator("#skills .skill").first();
  await skill.hover({ force: true });
  await expect(skill).toHaveClass(/is-hot/);
});

test("all skill labels remain in the DOM as readable text", async ({ page }) => {
  await page.goto("index.html");
  const count = await page.locator("#skills .skill").count();
  expect(count).toBeGreaterThanOrEqual(20);
});

test("sticky header stays above the skill cloud when scrolled over it", async ({ page }) => {
  await page.goto("index.html");
  await page.setViewportSize({ width: 1024, height: 800 });

  // Scroll so the skills section sits under the sticky header.
  await page.locator("#skills").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -40));
  await page.waitForTimeout(200);

  // The topmost element at a point inside the header must belong to the header
  // (not a skill label painting over it).
  const topIsHeader = await page.evaluate(() => {
    const header = document.querySelector("header");
    const rect = header.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const el = document.elementFromPoint(x, y);
    return !!(el && header.contains(el));
  });

  expect(topIsHeader).toBe(true);
});
