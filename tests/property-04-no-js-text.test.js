// Feature: portfolio-website, Property 4: All section text is present without JavaScript
//
// Design property 4 (Validates: Requirements 2.4): For every section, its
// textual content is present in the served HTML with scripting disabled.
//
// loadDocument() parses index.html WITHOUT executing scripts (jsdom is created
// with the default runScripts, so main.js is never run). This models the
// JavaScript-disabled / content-first case: all section text must already be
// present in the authored HTML, not injected by JS at runtime.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { loadDocument, SECTION_IDS, MIN_PROPERTY_RUNS } from "./helpers/dom.js";

// A section with real, human-readable content has well more than a handful of
// trimmed characters. The threshold stays small so the invariant is "there is
// meaningful text", not "there is a specific amount of copy".
const MIN_TEXT_LENGTH = 20;

/** Collapse runs of whitespace and trim, as a browser would present text. */
function normalizedText(element) {
  return element.textContent.replace(/\s+/g, " ").trim();
}

describe("Property 4: all section text is present without JavaScript", () => {
  it("parses index.html with scripts NOT executed (JS-disabled DOM)", () => {
    const { document } = loadDocument();
    const sections = document.querySelectorAll("main > section");
    // Confirm we are looking at the as-served HTML and that main.js has not
    // populated anything: the six sections exist straight from the file.
    expect(Array.from(sections).map((s) => s.id)).toEqual(SECTION_IDS);
  });

  it("every one of the six sections has non-empty meaningful text content", () => {
    const { document } = loadDocument();

    for (const id of SECTION_IDS) {
      const section = document.getElementById(id);
      expect(section, `section #${id} should exist in served HTML`).not.toBeNull();

      const text = normalizedText(section);
      expect(
        text.length,
        `section #${id} should have meaningful text without JavaScript`,
      ).toBeGreaterThan(MIN_TEXT_LENGTH);
    }
  });

  it("holds for every generated sampling over the section set (>= 100 runs)", () => {
    const { document } = loadDocument();

    // Quantify the "for every section" claim by generating section ids and
    // asserting the invariant each run, satisfying the design's minimum
    // iteration count for generated property tests.
    fc.assert(
      fc.property(fc.constantFrom(...SECTION_IDS), (id) => {
        const section = document.getElementById(id);
        expect(section).not.toBeNull();
        const text = normalizedText(section);
        expect(text.length).toBeGreaterThan(MIN_TEXT_LENGTH);
      }),
      { numRuns: MIN_PROPERTY_RUNS },
    );
  });
});
