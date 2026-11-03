// Feature: portfolio-website, Property 10: Organization groups are card-bounded
//
// Design: Correctness Properties > Property 10.
// "For every Organization_Group, the element is wrapped in the bounded card
// component."
//
// Validates: Requirements 4.7
//
// Note: the former Projects section (also card-bounded) was replaced by the
// Skills word cloud, so this property now covers only the Experience
// Organization_Groups. They keep the .card class in the markup even though the
// Experience timeline styling removes the visible card surface, so the bounded
// "card component" invariant still holds.
//
// Checked by iterating the full collection, then re-sampled with fast-check
// across MIN_PROPERTY_RUNS runs.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { loadDocument, MIN_PROPERTY_RUNS } from "./helpers/dom.js";

describe("Property 10: Organization groups are card-bounded", () => {
  const { document } = loadDocument();

  // Every org group, regardless of whether it currently has .card — so a
  // missing .card is a real failure.
  const orgGroups = Array.from(document.querySelectorAll(".org-group"));

  it("has organization groups to check (sanity)", () => {
    expect(orgGroups.length).toBeGreaterThan(0);
  });

  it("every organization group is wrapped in the bounded card component", () => {
    for (const el of orgGroups) {
      expect(
        el.classList.contains("card"),
        `org group "${el.querySelector(".org-name")?.textContent?.trim() ?? "(unnamed)"}" must have the .card class`,
      ).toBe(true);
    }
  });

  it("holds for any sampled org-group across many runs", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: orgGroups.length - 1 }),
        (index) => orgGroups[index].classList.contains("card"),
      ),
      { numRuns: MIN_PROPERTY_RUNS },
    );
  });
});
