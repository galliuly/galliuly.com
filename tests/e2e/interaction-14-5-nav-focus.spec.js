// Feature: portfolio-website — Responsive and interaction edge-case tests (task 14.5)
//
// These need real layout and real event/focus behavior, so they run in a
// headless browser via Playwright against the file:// URL of index.html.
//
// Covers:
//  - Mobile_Layout at 767px and Desktop_Layout at 768px (Req 5.1, 5.2),
//    distinguished by the hero's flex-direction (column on mobile, row on
//    desktop per the single 768px breakpoint).
//  - Computed body font-size >= 16px on mobile (Req 5.4).
//  - Anchor activation updates location.hash and moves focus to the target
//    section (Req 3.2, 3.3).

import { test, expect } from "@playwright/test";

test.describe("14.5 responsive layout at the 768px breakpoint", () => {
  test("hero stacks (column) at 767px — Mobile_Layout (Req 5.1)", async ({ page }) => {
    await page.goto("index.html");
    await page.setViewportSize({ width: 767, height: 900 });
    const direction = await page.evaluate(() =>
      getComputedStyle(document.getElementById("hero")).flexDirection,
    );
    expect(direction).toBe("column");
  });

  test("hero is side-by-side (row) at 768px — Desktop_Layout (Req 5.2)", async ({ page }) => {
    await page.goto("index.html");
    await page.setViewportSize({ width: 768, height: 900 });
    const direction = await page.evaluate(() =>
      getComputedStyle(document.getElementById("hero")).flexDirection,
    );
    expect(direction).toBe("row");
  });

  test("computed body font-size is at least 16px on mobile (Req 5.4)", async ({ page }) => {
    await page.goto("index.html");
    await page.setViewportSize({ width: 360, height: 900 });
    const fontSizePx = await page.evaluate(() =>
      parseFloat(getComputedStyle(document.body).fontSize),
    );
    expect(fontSizePx).toBeGreaterThanOrEqual(16);
  });
});

test.describe("14.5 anchor activation moves hash and focus", () => {
  test("clicking a nav anchor updates location.hash and focuses the section (Req 3.2, 3.3)", async ({ page }) => {
    await page.goto("index.html");
    await page.setViewportSize({ width: 1024, height: 900 });

    // Activate the Experience nav anchor.
    await page.click('header nav a[href="#experience"]');

    // Hash updates to the target section (Req 3.2).
    await expect.poll(() => page.evaluate(() => location.hash)).toBe("#experience");

    // Keyboard focus moves to the target section (Req 3.3). main.js sets
    // tabindex="-1" and focuses it (deferred via requestAnimationFrame).
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.id))
      .toBe("experience");
  });
});
