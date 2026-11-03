// Feature: portfolio-website, Property 2: Every non-hero section has a visible heading
//
// Design: Correctness Properties > Property 2.
// "For any section other than the Hero_Section, that section contains at least
// one heading element with non-empty visible text."
//
// Validates: Requirements 1.4
//
// The property quantifies over the finite authored set of sections, so the core
// "for any" is checked by iterating the full non-hero section collection. A
// fast-check pass additionally samples that set across MIN_PROPERTY_RUNS runs to
// satisfy the design's generated-input convention.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { loadDocument, MIN_PROPERTY_RUNS } from "./helpers/dom.js";

// A section's heading set: any h2–h6 inside it. The single <h1> is reserved for
// the Hero name, so non-hero sections must carry their own h2+ heading.
const HEADING_SELECTOR = "h2, h3, h4, h5, h6";

/** Visible heading text: non-empty once trimmed of surrounding whitespace. */
function hasVisibleHeading(section) {
  const headings = section.querySelectorAll(HEADING_SELECTOR);
  return Array.from(headings).some(
    (heading) => (heading.textContent ?? "").trim().length > 0
  );
}

describe("Property 2: Every non-hero section has a visible heading", () => {
  const { document } = loadDocument();

  const allSections = Array.from(
    document.querySelectorAll("main > section")
  );
  const nonHeroSections = allSections.filter((section) => section.id !== "hero");

  it("has non-hero sections to check (sanity)", () => {
    expect(allSections.length).toBeGreaterThan(0);
    expect(nonHeroSections.length).toBe(allSections.length - 1);
    expect(nonHeroSections.length).toBeGreaterThan(0);
    // #hero is present and is the one excluded section.
    expect(allSections.some((s) => s.id === "hero")).toBe(true);
  });

  // Core assertion: iterate the full finite set of non-hero sections.
  it("every non-hero section contains a heading (h2–h6) with non-empty visible text", () => {
    for (const section of nonHeroSections) {
      expect(
        hasVisibleHeading(section),
        `section #${section.id || "(no id)"} must have a visible heading`
      ).toBe(true);
    }
  });

  // Generated-input pass over the finite non-hero section set.
  it("holds for any sampled non-hero section across many runs", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: nonHeroSections.length - 1 }),
        (index) => {
          const section = nonHeroSections[index];
          return hasVisibleHeading(section);
        }
      ),
      { numRuns: MIN_PROPERTY_RUNS }
    );
  });
});
