// Feature: portfolio-website, Property 6: Heading hierarchy does not skip levels
//
// Design: Correctness Properties > Property 6.
// "For all headings taken in document order, each heading's level is at most
// one greater than the maximum heading level seen before it, so no level is
// skipped."
//
// Validates: Requirements 6.2
//
// Headings form a finite authored sequence, so the core invariant is checked by
// walking every heading in document order. A fast-check pass additionally
// re-derives the no-skip invariant over the extracted level sequence across
// MIN_PROPERTY_RUNS runs to satisfy the design's generated-input convention.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { loadDocument, MIN_PROPERTY_RUNS } from "./helpers/dom.js";

const HEADING_SELECTOR = "h1, h2, h3, h4, h5, h6";

/** The numeric level of a heading element (h1 -> 1, h4 -> 4). */
function levelOf(heading) {
  return Number(heading.tagName.charAt(1));
}

/** Headings in document order, as their numeric levels. */
function headingLevels(document) {
  return Array.from(document.querySelectorAll(HEADING_SELECTOR)).map(levelOf);
}

/**
 * Pure form of the property: walking the levels in order, no level may exceed
 * (max level seen so far) + 1. The first heading establishes the baseline.
 */
function hierarchyHasNoSkips(levels) {
  let maxSeen = 0;
  for (const level of levels) {
    if (maxSeen > 0 && level > maxSeen + 1) {
      return false;
    }
    if (level > maxSeen) {
      maxSeen = level;
    }
  }
  return true;
}

describe("Property 6: Heading hierarchy does not skip levels", () => {
  const { document } = loadDocument();
  const levels = headingLevels(document);

  it("has headings to check and starts at a single h1 (sanity)", () => {
    expect(levels.length).toBeGreaterThan(0);
    // The hero name is the single document h1.
    expect(levels[0]).toBe(1);
    expect(levels.filter((l) => l === 1).length).toBe(1);
  });

  it("never skips a heading level in document order", () => {
    let maxSeen = 0;
    const seq = [];
    for (const level of levels) {
      seq.push(level);
      if (maxSeen > 0) {
        expect(
          level,
          `heading level ${level} skips a level after max ${maxSeen} (sequence so far: ${seq.join(",")})`,
        ).toBeLessThanOrEqual(maxSeen + 1);
      }
      if (level > maxSeen) {
        maxSeen = level;
      }
    }
  });

  it("holds the no-skip invariant across prefixes of the heading sequence", () => {
    // Any prefix of a valid no-skip sequence is itself no-skip; sampling
    // prefixes exercises the invariant at every growth point of the document.
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: levels.length }),
        (prefixLen) => hierarchyHasNoSkips(levels.slice(0, prefixLen)),
      ),
      { numRuns: MIN_PROPERTY_RUNS },
    );
  });
});
