// Property test for the portfolio-website spec (task 10.1).
//
// Feature: portfolio-website, Property 1: Section identifiers are present and
// unique. For all required sections (Hero, About, Experience, Education,
// Projects, Contact), each section element has a non-empty id, and no two
// sections share the same id.
//
// Validates: Requirements 1.3

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { loadDocument, SECTION_IDS, MIN_PROPERTY_RUNS } from "./helpers/dom.js";

describe("Property 1: section identifiers are present and unique", () => {
  // The finite authored set: every <section> directly under <main>. The
  // "for all" is checked by iterating the full collection (per the Testing
  // Strategy, finite authored sets are verified by direct iteration).
  function getSections() {
    const { document } = loadDocument();
    const main = document.querySelector("main");
    expect(main).not.toBeNull();
    return Array.from(main.querySelectorAll(":scope > section"));
  }

  it("gives every <section> under <main> a non-empty id", () => {
    const sections = getSections();
    expect(sections.length).toBeGreaterThan(0);

    for (const section of sections) {
      const id = section.getAttribute("id");
      expect(id).not.toBeNull();
      expect(typeof id).toBe("string");
      expect(id.trim().length).toBeGreaterThan(0);
    }
  });

  it("gives no two sections the same id (ids are unique)", () => {
    const ids = getSections().map((section) => section.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("includes all six required section ids", () => {
    const ids = new Set(getSections().map((section) => section.id));
    for (const required of SECTION_IDS) {
      expect(ids.has(required)).toBe(true);
    }
  });

  // Generated-input coverage of the uniqueness/presence logic: for any
  // shuffled ordering (and non-empty subset) of the authored section ids, the
  // ids drawn from the rendered page remain present and collision-free. This
  // exercises the invariant independent of document order across at least
  // MIN_PROPERTY_RUNS samples.
  it("holds across shuffled subsets of the section id list", () => {
    const pageIds = getSections().map((section) => section.id);

    fc.assert(
      fc.property(
        fc
          .subarray(SECTION_IDS, { minLength: 1 })
          .chain((subset) => fc.shuffledSubarray(subset, { minLength: subset.length })),
        (orderedIds) => {
          // Each generated id must map to exactly one section on the page.
          for (const id of orderedIds) {
            const matches = pageIds.filter((pageId) => pageId === id);
            expect(matches.length).toBe(1);
          }
          // The generated ordering itself carries no duplicates, and neither
          // does the page's set for those ids.
          const unique = new Set(orderedIds);
          expect(unique.size).toBe(orderedIds.length);
        },
      ),
      { numRuns: MIN_PROPERTY_RUNS },
    );
  });
});
