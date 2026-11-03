// Feature: portfolio-website, Property 3: Navigation links correspond one-to-one with content sections
//
// Property 3 (design.md > Correctness Properties): For every Anchor_Link in the
// Navigation_Bar, its href fragment resolves to an existing section id; and for
// each of the About, Experience, Education, Projects, and Contact sections,
// exactly one Anchor_Link targets it.
//
// Validates: Requirements 3.1
//
// The nav is a finite authored set, so the structural facts (href resolves to an
// id; each content section is targeted by exactly one anchor) are checked by
// iterating the real collection. The one-to-one matching LOGIC is additionally
// exercised with fast-check: for >= MIN_PROPERTY_RUNS permutations of the nav
// link set, the matching result must be order-independent and still prove the
// bijection between nav hrefs and the five content-section ids.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { loadDocument, MIN_PROPERTY_RUNS } from "./helpers/dom.js";

// The five content sections the Navigation_Bar must link to (Req 3.1). The Hero
// section is intentionally excluded from the nav (design: Navigation_Bar holds
// one Anchor_Link per content section, About through Contact).
const CONTENT_SECTION_IDS = [
  "about",
  "experience",
  "education",
  "skills",
  "contact",
];

/** Collect the Anchor_Links of the primary Navigation_Bar (header nav). */
function getNavAnchors(document) {
  const nav = document.querySelector("header nav");
  expect(nav, "primary <header> <nav> must exist").not.toBeNull();
  return Array.from(nav.querySelectorAll('a[href^="#"]'));
}

/** The fragment of a `#id` href (without the leading '#'). */
function fragmentOf(anchor) {
  return anchor.getAttribute("href").slice(1);
}

describe("Feature: portfolio-website, Property 3: Navigation links correspond one-to-one with content sections", () => {
  it("every nav Anchor_Link href fragment resolves to an existing element id", () => {
    const { document } = loadDocument();
    const anchors = getNavAnchors(document);

    expect(anchors.length).toBeGreaterThan(0);

    for (const anchor of anchors) {
      const fragment = fragmentOf(anchor);
      expect(fragment, `nav anchor href "${anchor.getAttribute("href")}" must have a non-empty fragment`).not.toBe("");
      const target = document.getElementById(fragment);
      expect(target, `nav anchor "#${fragment}" must resolve to an existing element id`).not.toBeNull();
    }
  });

  it("each of the five content sections is targeted by exactly one nav Anchor_Link", () => {
    const { document } = loadDocument();
    const anchors = getNavAnchors(document);
    const fragments = anchors.map(fragmentOf);

    for (const sectionId of CONTENT_SECTION_IDS) {
      // The section itself must exist.
      expect(document.getElementById(sectionId), `section #${sectionId} must exist`).not.toBeNull();
      const targeting = fragments.filter((f) => f === sectionId);
      expect(targeting.length, `exactly one nav Anchor_Link must target #${sectionId}`).toBe(1);
    }
  });

  it("the nav links map one-to-one onto the content sections (no extras, no duplicates)", () => {
    const { document } = loadDocument();
    const fragments = getNavAnchors(document).map(fragmentOf);

    // No duplicate targets.
    expect(new Set(fragments).size).toBe(fragments.length);
    // Exactly the five content-section ids, as a set.
    expect(new Set(fragments)).toEqual(new Set(CONTENT_SECTION_IDS));
    // One anchor per content section, nothing more.
    expect(fragments.length).toBe(CONTENT_SECTION_IDS.length);
  });

  it("one-to-one matching logic holds for any ordering of the authored nav link set", () => {
    const { document } = loadDocument();
    const fragments = getNavAnchors(document).map(fragmentOf);
    const existingIds = new Set(
      Array.from(document.querySelectorAll("[id]")).map((el) => el.id),
    );

    fc.assert(
      fc.property(
        // Permute the real nav link set: the bijection must be order-independent.
        fc.shuffledSubarray(fragments, {
          minLength: fragments.length,
          maxLength: fragments.length,
        }),
        (permutedFragments) => {
          // Build the matching: content section id -> anchors targeting it.
          const matches = new Map(
            CONTENT_SECTION_IDS.map((id) => [id, 0]),
          );
          for (const fragment of permutedFragments) {
            // Every anchor must resolve to an existing id.
            expect(existingIds.has(fragment)).toBe(true);
            if (matches.has(fragment)) {
              matches.set(fragment, matches.get(fragment) + 1);
            }
          }
          // Exactly one anchor per content section, regardless of order.
          for (const id of CONTENT_SECTION_IDS) {
            expect(matches.get(id)).toBe(1);
          }
          // And no nav anchor points outside the content-section set.
          expect(permutedFragments.every((f) => matches.has(f))).toBe(true);
        },
      ),
      { numRuns: MIN_PROPERTY_RUNS },
    );
  });
});
