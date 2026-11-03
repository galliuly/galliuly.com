// Feature: portfolio-website — Certifications carousel (e2e).
//
// In a real browser: the strip loops with a hidden duplicate list, stays inside
// the photo column on phones, auto-advances (also while hovered), can be
// dragged with the mouse in both directions, resumes the auto-advance as soon
// as the drag ends, and only a plain click (not a drag) opens Credly.

import { test, expect } from "@playwright/test";

const CREDLY_URL = "https://www.credly.com/users/ulysses-galli";

/** Current scroll position and the width of one copy of the list. */
async function carouselState(page) {
  return page.evaluate(() => {
    const viewport = document.querySelector(".cert-viewport");
    const list = document.querySelector(".cert-list");
    return { scrollLeft: viewport.scrollLeft, period: list.offsetWidth };
  });
}

/** Forward distance from `before` to `after`, accounting for the loop. */
function movedBy(before, after, period) {
  return (((after - before) % period) + period) % period;
}

/** Center of the scrolling strip, for mouse actions. */
async function stripCenter(page) {
  const box = await page.locator(".cert-viewport").boundingBox();
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Answer Credly requests locally so tests never hit the real network. */
async function stubCredly(context) {
  await context.route("https://www.credly.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "<title>Credly</title>" }),
  );
}

test("loops with an aria-hidden duplicate list", async ({ page }) => {
  await page.goto("index.html");
  const track = page.locator("[data-cert-track]");
  await expect(track).toHaveClass(/is-animated/);
  await expect(track.locator(".cert-list")).toHaveCount(2);
  await expect(track.locator(".cert-list").nth(1)).toHaveAttribute("aria-hidden", "true");
});

test("stays within the photo column on a narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("index.html");

  const sizes = await page.evaluate(() => {
    const media = document.querySelector(".hero-media").getBoundingClientRect();
    const carousel = document.querySelector(".cert-carousel").getBoundingClientRect();
    return {
      mediaRight: media.right,
      carouselRight: carousel.right,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });

  expect(sizes.carouselRight).toBeLessThanOrEqual(sizes.mediaRight + 1);
  expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.clientWidth);
});

test("auto-advances, and keeps going while the mouse is over it", async ({ page }) => {
  await page.goto("index.html");
  const a = await carouselState(page);
  await page.waitForTimeout(700);
  const b = await carouselState(page);
  expect(movedBy(a.scrollLeft, b.scrollLeft, b.period)).toBeGreaterThan(5);

  await page.locator(".cert-carousel-link").hover();
  const c = await carouselState(page);
  await page.waitForTimeout(700);
  const d = await carouselState(page);
  expect(movedBy(c.scrollLeft, d.scrollLeft, d.period)).toBeGreaterThan(5);
});

test("dragging left moves the strip forward by the dragged distance", async ({ page }) => {
  await page.goto("index.html");
  const { x, y } = await stripCenter(page);
  await page.mouse.move(x, y);
  await page.mouse.down(); // the auto-advance pauses while pressed
  const before = await carouselState(page);
  await page.mouse.move(x - 60, y, { steps: 6 });
  await page.mouse.move(x - 120, y, { steps: 6 });
  const during = await carouselState(page);
  expect(Math.abs(movedBy(before.scrollLeft, during.scrollLeft, during.period) - 120)).toBeLessThan(3);
  await page.mouse.up();
});

test("dragging right from the start wraps around instead of stopping", async ({ page }) => {
  await page.goto("index.html");
  const { x, y } = await stripCenter(page);
  await page.mouse.move(x, y);
  await page.mouse.down();
  const before = await carouselState(page);
  await page.mouse.move(x + 100, y, { steps: 10 });
  const during = await carouselState(page);
  // Moved backward by 100px, wrapping past the beginning when needed.
  expect(Math.abs(movedBy(during.scrollLeft, before.scrollLeft, during.period) - 100)).toBeLessThan(3);
  await page.mouse.up();
});

test("resumes the auto-advance as soon as the drag ends", async ({ page }) => {
  await page.goto("index.html");
  const { x, y } = await stripCenter(page);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 80, y, { steps: 8 });
  await page.mouse.up(); // the pointer stays over the strip

  const a = await carouselState(page);
  await page.waitForTimeout(700);
  const b = await carouselState(page);
  expect(movedBy(a.scrollLeft, b.scrollLeft, b.period)).toBeGreaterThan(5);
});

test("a drag does not open Credly", async ({ page, context }) => {
  await stubCredly(context);
  await page.goto("index.html");
  let opened = false;
  context.on("page", () => {
    opened = true;
  });

  const { x, y } = await stripCenter(page);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 90, y, { steps: 9 });
  await page.mouse.up();
  await page.waitForTimeout(500);

  expect(opened).toBe(false);
  expect(page.url()).not.toContain("credly.com");
});

test("a plain click opens the Credly profile in a new tab", async ({ page, context }) => {
  await stubCredly(context);
  await page.goto("index.html");

  const [popup] = await Promise.all([
    context.waitForEvent("page"),
    page.locator(".cert-carousel-link").click(),
  ]);
  await popup.waitForLoadState();
  expect(popup.url()).toBe(CREDLY_URL);
});
