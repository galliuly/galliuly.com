// Feature: portfolio-website, Property 5: Navigation anchors have descriptive accessible names
//
// Design: Correctness Properties > Property 5.
// "For every Anchor_Link in the Navigation_Bar, its accessible name (visible
// text or aria-label) is non-empty."
//
// Validates: Requirements 6.6
//
// The property quantifies over the finite authored set of navigation anchors,
// so the core "for every" is checked by iterating the full collection of
// header nav links. A fast-check pass additionally samples that set across
// MIN_PROPERTY_RUNS runs to satisfy the design's generated-input convention.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { loadDocument, MIN_PROPERTY_RUNS } from "./helpers/dom.js";

// Navigation Anchor_Links: in-page anchors inside the header's nav.
const NAV_ANCHOR_SELECTOR = "header nav a[href^='#']";

/**
 * An anchor's accessible name, for the purposes of this property: its visible
 * text content, falling back to an explicit aria-label. Both are trimmed; the
 * name is "descriptive" when the result is non-empty.
 */
function accessibleName(anchor) {
  const visibleText = (anchor.textContent ?? "").trim();
  if (visibleText.length > 0) {
    return visibleText;
  }
  return (anchor.getAttribute("aria-label") ?? "").trim();
}

describe("Property 5: Navigation anchors have descriptive accessible names", () => {
  const { document } = loadDocument();

  const navAnchors = Array.from(
    document.querySelectorAll(NAV_ANCHOR_SELECTOR)
  );

  it("has navigation anchors to check (sanity)", () => {
    expect(navAnchors.length).toBeGreaterThan(0);
  });

  // Core assertion: iterate the full finite set of navigation anchors.
  it("every navigation anchor has a non-empty accessible name", () => {
    for (const anchor of navAnchors) {
      const name = accessibleName(anchor);
      expect(
        name.length,
        `nav anchor [href='${anchor.getAttribute("href")}'] must have a non-empty accessible name`
      ).toBeGreaterThan(0);
    }
  });

  // Generated-input pass over the finite navigation-anchor set.
  it("holds for any sampled navigation anchor across many runs", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: navAnchors.length - 1 }),
        (index) => {
          const anchor = navAnchors[index];
          return accessibleName(anchor).length > 0;
        }
      ),
      { numRuns: MIN_PROPERTY_RUNS }
    );
  });
});
