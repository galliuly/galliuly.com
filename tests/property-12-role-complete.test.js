// Feature: portfolio-website, Property 12: Every role entry is complete
//
// Design: Correctness Properties > Property 12.
// "For every Role_Entry, a role title, a time period, and a description are all
// present."
//
// Validates: Requirements 9.2
//
// Role_Entries (.role-entry) are a finite authored set. Each must carry a
// non-empty .role-title, .role-period, and .role-description. Checked by
// iterating all role entries, then re-sampled with fast-check across
// MIN_PROPERTY_RUNS runs.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { loadDocument, MIN_PROPERTY_RUNS } from "./helpers/dom.js";

/** Non-empty trimmed text of the first matching descendant, or "". */
function partText(entry, selector) {
  const el = entry.querySelector(selector);
  return el ? (el.textContent ?? "").trim() : "";
}

function roleIsComplete(entry) {
  return (
    partText(entry, ".role-title").length > 0 &&
    partText(entry, ".role-period").length > 0 &&
    partText(entry, ".role-description").length > 0
  );
}

describe("Property 12: Every role entry is complete", () => {
  const { document } = loadDocument();
  const roles = Array.from(document.querySelectorAll(".role-entry"));

  it("has role entries to check (sanity)", () => {
    expect(roles.length).toBeGreaterThan(0);
  });

  it("every role entry has a title, a period, and a description", () => {
    for (const role of roles) {
      const title = partText(role, ".role-title");
      expect(title.length, "role must have a non-empty .role-title").toBeGreaterThan(0);
      expect(
        partText(role, ".role-period").length,
        `role "${title}" must have a non-empty .role-period`,
      ).toBeGreaterThan(0);
      expect(
        partText(role, ".role-description").length,
        `role "${title}" must have a non-empty .role-description`,
      ).toBeGreaterThan(0);
    }
  });

  it("holds for any sampled role entry across many runs", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: roles.length - 1 }),
        (index) => roleIsComplete(roles[index]),
      ),
      { numRuns: MIN_PROPERTY_RUNS },
    );
  });
});
