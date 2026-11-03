// Feature: portfolio-website, Property 7: Every non-decorative image has a text alternative
//
// Design: Correctness Properties > Property 7.
// "For every <img> element, an alt attribute is present, and it is non-empty
// unless the image is explicitly marked decorative (alt="" with a decorative
// role)."
//
// Validates: Requirements 6.3
//
// Images are a finite authored set, so the core "for every" is checked by
// iterating all <img> elements. A fast-check pass additionally samples that set
// across MIN_PROPERTY_RUNS runs to satisfy the design's generated-input
// convention.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { loadDocument, MIN_PROPERTY_RUNS } from "./helpers/dom.js";

/**
 * An image satisfies the property when:
 *  - it has an alt attribute, AND
 *  - alt is non-empty (informative image), OR alt="" and it is explicitly
 *    marked decorative (role="presentation"/"none" or aria-hidden="true").
 */
function imageHasValidTextAlternative(img) {
  if (!img.hasAttribute("alt")) {
    return false;
  }
  const alt = img.getAttribute("alt");
  if (alt.trim().length > 0) {
    return true; // informative image with a descriptive alternative
  }
  // Empty alt is only valid when the image is explicitly decorative.
  const role = (img.getAttribute("role") ?? "").trim().toLowerCase();
  const ariaHidden = (img.getAttribute("aria-hidden") ?? "").trim().toLowerCase();
  return role === "presentation" || role === "none" || ariaHidden === "true";
}

describe("Property 7: Every non-decorative image has a text alternative", () => {
  const { document } = loadDocument();
  const images = Array.from(document.querySelectorAll("img"));

  it("every <img> has an alt attribute present", () => {
    for (const img of images) {
      expect(
        img.hasAttribute("alt"),
        `img[src='${img.getAttribute("src")}'] must have an alt attribute`,
      ).toBe(true);
    }
  });

  it("every <img> is either informative (non-empty alt) or explicitly decorative", () => {
    for (const img of images) {
      expect(
        imageHasValidTextAlternative(img),
        `img[src='${img.getAttribute("src")}'] must have a non-empty alt or be marked decorative`,
      ).toBe(true);
    }
  });

  it("holds for any sampled image across many runs", () => {
    // The page may legitimately have zero images; guard the generator range.
    if (images.length === 0) {
      expect(true).toBe(true);
      return;
    }
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: images.length - 1 }),
        (index) => imageHasValidTextAlternative(images[index]),
      ),
      { numRuns: MIN_PROPERTY_RUNS },
    );
  });
});
