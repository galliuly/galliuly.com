// Feature: portfolio-website, Property 9: Principal palette is limited to four colors
//
// Design: Correctness Properties > Property 9.
// "For all principal palette custom properties defined in :root, the count of
// distinct principal colors is at most four."
//
// Validates: Requirements 4.2
//
// The principal palette is the set of --color-* custom properties declared in
// :root. This parses those tokens from styles.css and asserts there are at most
// four distinct principal color values. A fast-check pass re-checks the count
// over shuffled orderings of the token set across MIN_PROPERTY_RUNS runs.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { readStylesCss, MIN_PROPERTY_RUNS } from "./helpers/dom.js";

const MAX_PRINCIPAL_COLORS = 4;

/**
 * Extract the principal palette: --color-<name>: <value>; declarations.
 * Only the principal palette uses the --color- prefix in :root; spacing,
 * typography, and layout tokens use different prefixes, so they are excluded.
 */
function principalColorTokens(css) {
  const tokens = new Map();
  const re = /--color-([a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let m;
  while ((m = re.exec(css)) !== null) {
    tokens.set(`--color-${m[1]}`, m[2].trim().toLowerCase());
  }
  return tokens;
}

describe("Property 9: Principal palette is limited to four colors", () => {
  const css = readStylesCss();
  const tokens = principalColorTokens(css);
  const distinctValues = new Set(tokens.values());

  it("declares a principal palette via --color-* tokens (sanity)", () => {
    expect(tokens.size).toBeGreaterThan(0);
  });

  it("defines at most four distinct principal colors", () => {
    expect(
      distinctValues.size,
      `principal palette has ${distinctValues.size} distinct colors: ${[...distinctValues].join(", ")}`,
    ).toBeLessThanOrEqual(MAX_PRINCIPAL_COLORS);
  });

  it("holds for any ordering of the declared color tokens", () => {
    const entries = [...tokens.values()];
    fc.assert(
      fc.property(
        fc.shuffledSubarray(entries, {
          minLength: entries.length,
          maxLength: entries.length,
        }),
        (shuffled) => new Set(shuffled).size <= MAX_PRINCIPAL_COLORS,
      ),
      { numRuns: MIN_PROPERTY_RUNS },
    );
  });
});
