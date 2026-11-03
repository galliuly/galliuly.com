// Feature: portfolio-website — Polish features in a real browser: tagline
// word-by-word reveal, skip link, and footer.

import { test, expect } from "@playwright/test";

async function litCounts(page) {
  return page.evaluate(() => {
    const words = document.querySelectorAll("[data-tagline] .tagline-word");
    return {
      total: words.length,
      lit: document.querySelectorAll("[data-tagline] .tagline-word.is-lit").length,
    };
  });
}

test("tagline words light up one by one as the page scrolls, and stay lit", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("index.html");

  const start = await litCounts(page);
  expect(start.total).toBeGreaterThan(5);
  expect(start.lit).toBeLessThan(start.total); // not everything lit before scrolling

  // Scroll in small steps and record how many words are lit at each step.
  const seen = [];
  for (let y = 0; y <= 1400; y += 40) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
    await page.waitForTimeout(40);
    seen.push((await litCounts(page)).lit);
  }

  // Monotonic: words never dim again.
  for (let i = 1; i < seen.length; i++) {
    expect(seen[i]).toBeGreaterThanOrEqual(seen[i - 1]);
  }
  // Gradual: at some step only part of the tagline was lit.
  expect(seen.some((n) => n > 0 && n < start.total)).toBe(true);
  // Complete: by the end, every word is lit.
  expect(seen[seen.length - 1]).toBe(start.total);

  // Scrolling back up keeps them lit.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(100);
  expect((await litCounts(page)).lit).toBe(start.total);
});

test("tagline is re-split and translated after a language switch", async ({ page }) => {
  await page.goto("index.html");
  await page.selectOption("#lang-select", "pt-BR");
  await expect(page.locator("[data-tagline]")).toContainText("Acredito");
  await expect(page.locator("[data-tagline] .tagline-word").first()).toHaveText("Acredito");

  await page.selectOption("#lang-select", "en");
  await expect(page.locator("[data-tagline] .tagline-word").first()).toHaveText("I");
});

test("skip link appears on the first Tab and moves focus to the main content", async ({ page }) => {
  await page.goto("index.html");
  const skip = page.locator(".skip-link");

  await page.keyboard.press("Tab");
  await expect(skip).toBeFocused();
  // Slid into view (transform reset to none).
  await expect
    .poll(() => skip.evaluate((el) => getComputedStyle(el).transform))
    .toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);

  await page.keyboard.press("Enter");
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe("main");
});

test("footer back-to-top link returns to the top of the page", async ({ page }) => {
  await page.goto("index.html");
  await page.locator(".footer-top").scrollIntoViewIfNeeded();
  await page.locator(".footer-top").click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(200);
});
