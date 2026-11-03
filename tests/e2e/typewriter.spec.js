// Feature: portfolio-website — Hero typewriter (e2e).
//
// Verifies the hero headline typewriter in a real browser: with JS active, the
// static headline is replaced by the animated span, which cycles through the
// expected phrases. jsdom cannot time the animation, so this runs under
// Playwright against the file:// URL.

import { test, expect } from "@playwright/test";

// The phrases the typewriter rotates through (must match typewriter.js).
const PHRASES = [
  "Amazon",
  "Amazon Web Services",
  "AWS Certified",
  "Ex-Startups",
  "International Relations",
  "UNIFESP",
  "FGV",
  "Sales",
  "AI",
  "Strategy",
  "Consulting",
  "Relationship building",
  "Program Management",
  "Project Management",
];

test("activates the typewriter and hides the static headline", async ({ page }) => {
  await page.goto("index.html");
  await page.setViewportSize({ width: 1024, height: 900 });

  // JS adds .has-typewriter and reveals the animated span.
  await expect(page.locator(".hero-headline")).toHaveClass(/has-typewriter/);
  await expect(page.locator(".hero-typewriter")).toBeVisible();
  // The static fallback is now hidden (display:none under .has-typewriter).
  await expect(page.locator(".hero-headline-static")).toBeHidden();
});

test("types out text that is a prefix of one of the known phrases", async ({ page }) => {
  await page.goto("index.html");

  const textLocator = page.locator(".hero-typewriter-text");

  // Wait until some text has been typed.
  await expect.poll(
    async () => (await textLocator.textContent())?.length ?? 0,
    { timeout: 5000 },
  ).toBeGreaterThan(0);

  // Whatever is shown must be a prefix of one of the known phrases (it is being
  // typed or deleted character by character).
  const shown = (await textLocator.textContent())?.trim() ?? "";
  const isPrefixOfAPhrase = PHRASES.some((p) => p.startsWith(shown) && shown.length > 0);
  expect(
    isPrefixOfAPhrase,
    `typed text "${shown}" must be a prefix of a known phrase`,
  ).toBe(true);
});

test("cycles to different phrases over time (randomized rotation)", async ({ page }) => {
  await page.goto("index.html");

  const textLocator = page.locator(".hero-typewriter-text");
  const seen = new Set();

  // Sample the fully-typed phrase a few times across the animation. We detect
  // "full phrase" moments by collecting any value that exactly matches a known
  // phrase as we poll.
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline && seen.size < 2) {
    const shown = (await textLocator.textContent())?.trim() ?? "";
    if (PHRASES.indexOf(shown) !== -1) {
      seen.add(shown);
    }
    await page.waitForTimeout(150);
  }

  // Over 20s the typewriter should have fully shown at least two distinct
  // phrases, proving it rotates rather than sticking on one.
  expect(seen.size, `expected to see >=2 distinct phrases, saw: ${[...seen].join(", ")}`).toBeGreaterThanOrEqual(2);
});
