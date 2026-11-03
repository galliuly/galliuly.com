// Feature: portfolio-website, Property 8: Body text meets the contrast threshold
//
// Design: Correctness Properties > Property 8.
// "For any defined body-text / background color pair in the palette tokens, the
// WCAG contrast ratio is at least 4.5:1."
//
// Validates: Requirements 6.4
//
// The palette lives as CSS custom properties in styles.css. This test parses
// those tokens from the stylesheet source (no browser needed) and computes the
// WCAG 2.1 contrast ratio. Body text is rendered with --color-ink on --color-bg
// (and headings/primary text use --color-primary on --color-bg); both
// text-on-background pairs must clear 4.5:1. A fast-check pass re-checks the
// pairs across MIN_PROPERTY_RUNS runs per the generated-input convention.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { readStylesCss, MIN_PROPERTY_RUNS } from "./helpers/dom.js";

/** Read a `--name: #hex;` custom property out of the :root block text. */
function readToken(css, name) {
  const re = new RegExp(`${name}\\s*:\\s*(#[0-9a-fA-F]{3,8})`);
  const match = css.match(re);
  return match ? match[1] : null;
}

/** Parse a #rgb / #rrggbb hex string to {r,g,b} in 0-255. */
function hexToRgb(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** Relative luminance per WCAG 2.1. */
function relativeLuminance({ r, g, b }) {
  const channel = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two hex colors (>= 1). */
function contrastRatio(hexA, hexB) {
  const lA = relativeLuminance(hexToRgb(hexA));
  const lB = relativeLuminance(hexToRgb(hexB));
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

const AA_BODY_THRESHOLD = 4.5;

describe("Property 8: Body text meets the contrast threshold", () => {
  const css = readStylesCss();

  const bg = readToken(css, "--color-bg");
  const ink = readToken(css, "--color-ink");
  const primary = readToken(css, "--color-primary");

  it("defines the palette tokens needed to evaluate contrast (sanity)", () => {
    expect(bg, "--color-bg must be defined").not.toBeNull();
    expect(ink, "--color-ink must be defined").not.toBeNull();
    expect(primary, "--color-primary must be defined").not.toBeNull();
  });

  // The text-on-background pairs actually used for reading copy.
  const bodyTextPairs = [
    { label: "ink on bg (body text)", fg: ink, bgc: bg },
    { label: "primary/navy on bg (headings, primary text)", fg: primary, bgc: bg },
  ];

  it("every body-text / background pair clears 4.5:1", () => {
    for (const { label, fg, bgc } of bodyTextPairs) {
      const ratio = contrastRatio(fg, bgc);
      expect(
        ratio,
        `${label}: contrast ${ratio.toFixed(2)}:1 must be >= ${AA_BODY_THRESHOLD}:1`,
      ).toBeGreaterThanOrEqual(AA_BODY_THRESHOLD);
    }
  });

  it("holds for any sampled body-text pair across many runs", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: bodyTextPairs.length - 1 }),
        (index) => {
          const { fg, bgc } = bodyTextPairs[index];
          return contrastRatio(fg, bgc) >= AA_BODY_THRESHOLD;
        },
      ),
      { numRuns: MIN_PROPERTY_RUNS },
    );
  });
});
