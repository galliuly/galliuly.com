// Feature: portfolio-website, Property 17: Every contact link has a visible label
//
// Design: Correctness Properties > Property 17.
// "For every link in the Contact_Section, a visible non-empty label
// identifying the destination is present."
//
// Validates: Requirements 8.4
//
// Contact links (links inside #contact) are a finite authored set. Each must
// expose a visible, non-empty label (its visible text content, e.g. the
// .contact-label span). Checked by iterating all contact links, then re-sampled
// with fast-check across MIN_PROPERTY_RUNS runs.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { loadDocument, MIN_PROPERTY_RUNS } from "./helpers/dom.js";

/** Visible label text of a contact link (trimmed text content). */
function visibleLabel(anchor) {
  return (anchor.textContent ?? "").replace(/\s+/g, " ").trim();
}

describe("Property 17: Every contact link has a visible label", () => {
  const { document } = loadDocument();
  const contact = document.getElementById("contact");
  const links = contact ? Array.from(contact.querySelectorAll("a")) : [];

  it("has a contact section with links to check (sanity)", () => {
    expect(contact, "#contact section must exist").not.toBeNull();
    expect(links.length).toBeGreaterThan(0);
  });

  it("every contact link exposes a visible non-empty label", () => {
    for (const link of links) {
      expect(
        visibleLabel(link).length,
        `contact link to "${link.getAttribute("href")}" must have a visible label`,
      ).toBeGreaterThan(0);
    }
  });

  it("holds for any sampled contact link across many runs", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: links.length - 1 }),
        (index) => visibleLabel(links[index]).length > 0,
      ),
      { numRuns: MIN_PROPERTY_RUNS },
    );
  });
});
