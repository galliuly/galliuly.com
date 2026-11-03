// Feature: portfolio-website, Property 16: Links opening a new context use a safe relationship
//
// Design: Correctness Properties > Property 16.
// "For every anchor with target="_blank", its rel attribute includes noopener."
//
// Validates: Requirements 8.5
//
// Anchors with target="_blank" are a finite authored set. Each must declare a
// rel attribute whose token list includes "noopener" (preventing the opened
// page from accessing window.opener). Checked by iterating all such anchors,
// then re-sampled with fast-check across MIN_PROPERTY_RUNS runs.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { loadDocument, MIN_PROPERTY_RUNS } from "./helpers/dom.js";

function relTokens(anchor) {
  return (anchor.getAttribute("rel") ?? "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function hasSafeRel(anchor) {
  return relTokens(anchor).includes("noopener");
}

describe("Property 16: Links opening a new context use a safe relationship", () => {
  const { document } = loadDocument();
  const blankAnchors = Array.from(
    document.querySelectorAll('a[target="_blank"]'),
  );

  it("has new-context links to check (sanity)", () => {
    expect(blankAnchors.length).toBeGreaterThan(0);
  });

  it('every target="_blank" anchor includes noopener in rel', () => {
    for (const anchor of blankAnchors) {
      expect(
        hasSafeRel(anchor),
        `anchor to "${anchor.getAttribute("href")}" with target=_blank must include rel="noopener"`,
      ).toBe(true);
    }
  });

  it("holds for any sampled new-context anchor across many runs", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: blankAnchors.length - 1 }),
        (index) => hasSafeRel(blankAnchors[index]),
      ),
      { numRuns: MIN_PROPERTY_RUNS },
    );
  });
});
