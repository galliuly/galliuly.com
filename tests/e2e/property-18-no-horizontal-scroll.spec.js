// Feature: portfolio-website, Property 18: No horizontal scrolling on mobile widths
//
// Design: Correctness Properties > Property 18.
// "For any mobile viewport width in the range 320px to 767px, the document's
// scroll width does not exceed its client width."
//
// Validates: Requirements 5.3
//
// This property depends on real layout, which jsdom does not compute, so it
// runs in a headless browser via Playwright against the file:// URL of
// index.html (no server, no build). The design's Testing Strategy requires
// sampling a minimum of 100 widths across the 320-767px range; we sample 100
// evenly-spaced widths (including both endpoints) and assert
// document.scrollWidth <= clientWidth at each.

import { test, expect } from "@playwright/test";

const MIN_WIDTH = 320;
const MAX_WIDTH = 767;
const SAMPLES = 100;

/** 100 evenly spaced integer widths across [320, 767], endpoints included. */
function sampleWidths() {
  const widths = [];
  for (let i = 0; i < SAMPLES; i++) {
    const w = Math.round(MIN_WIDTH + ((MAX_WIDTH - MIN_WIDTH) * i) / (SAMPLES - 1));
    widths.push(w);
  }
  return widths;
}

test("no horizontal overflow across mobile widths 320-767px", async ({ page }) => {
  await page.goto("index.html");

  for (const width of sampleWidths()) {
    await page.setViewportSize({ width, height: 900 });

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(
      scrollWidth,
      `at ${width}px viewport, document scrollWidth (${scrollWidth}) must not exceed clientWidth (${clientWidth})`,
    ).toBeLessThanOrEqual(clientWidth);
  }
});
