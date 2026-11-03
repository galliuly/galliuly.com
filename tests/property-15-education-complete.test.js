// Feature: portfolio-website, Property 15: Every education entry is complete
//
// Design: Correctness Properties > Property 15.
// "For every Education_Entry, an institution name, a qualification, a time
// period, and a descriptive subtitle are all present."
//
// Validates: Requirements 10.1, 10.2
//
// Education entries (.edu-entry) are a finite authored set. Each must carry a
// non-empty .edu-institution, .edu-qualification, .edu-period, and
// .edu-subtitle. Checked by iterating all entries, then re-sampled with
// fast-check across MIN_PROPERTY_RUNS runs.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { loadDocument, MIN_PROPERTY_RUNS } from "./helpers/dom.js";

const REQUIRED_PARTS = [
  ".edu-institution",
  ".edu-qualification",
  ".edu-period",
  ".edu-subtitle",
];

function partText(entry, selector) {
  const el = entry.querySelector(selector);
  return el ? (el.textContent ?? "").trim() : "";
}

function educationIsComplete(entry) {
  return REQUIRED_PARTS.every((selector) => partText(entry, selector).length > 0);
}

describe("Property 15: Every education entry is complete", () => {
  const { document } = loadDocument();
  const entries = Array.from(document.querySelectorAll(".edu-entry"));

  it("has education entries to check (sanity)", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it("every education entry has institution, qualification, period, and subtitle", () => {
    for (const entry of entries) {
      const institution = partText(entry, ".edu-institution");
      expect(institution.length, "entry must have a non-empty .edu-institution").toBeGreaterThan(0);
      for (const selector of REQUIRED_PARTS) {
        expect(
          partText(entry, selector).length,
          `education entry "${institution}" must have a non-empty ${selector}`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("holds for any sampled education entry across many runs", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: entries.length - 1 }),
        (index) => educationIsComplete(entries[index]),
      ),
      { numRuns: MIN_PROPERTY_RUNS },
    );
  });
});
