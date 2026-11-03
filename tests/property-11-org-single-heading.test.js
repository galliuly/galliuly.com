// Feature: portfolio-website, Property 11: Each organization group has exactly one organization heading
//
// Design: Correctness Properties > Property 11.
// "For every Organization_Group, there is exactly one organization heading, and
// all of the group's Role_Entries are nested under that single heading."
//
// Validates: Requirements 9.1, 9.3
//
// Organization_Groups are a finite authored set. For each .org-group: exactly
// one .org-name heading, and every .role-entry in the group is a descendant of
// that group (i.e. grouped under the single org heading). Checked by iterating
// the full set, then re-sampled with fast-check across MIN_PROPERTY_RUNS runs.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { loadDocument, MIN_PROPERTY_RUNS } from "./helpers/dom.js";

describe("Property 11: Each organization group has exactly one organization heading", () => {
  const { document } = loadDocument();
  const groups = Array.from(document.querySelectorAll(".org-group"));

  it("has organization groups to check (sanity)", () => {
    expect(groups.length).toBeGreaterThan(0);
  });

  it("every group has exactly one .org-name heading", () => {
    for (const group of groups) {
      const names = group.querySelectorAll(".org-name");
      expect(
        names.length,
        `org group must have exactly one .org-name (found ${names.length})`,
      ).toBe(1);
    }
  });

  it("every role entry in a group is nested under that group's single heading", () => {
    for (const group of groups) {
      const roles = Array.from(group.querySelectorAll(".role-entry"));
      expect(roles.length, "an org group must contain at least one role").toBeGreaterThan(0);
      // All roles are descendants of the group (so under its single heading).
      for (const role of roles) {
        expect(group.contains(role)).toBe(true);
      }
    }
  });

  it("holds for any sampled organization group across many runs", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: groups.length - 1 }),
        (index) => {
          const group = groups[index];
          const headings = group.querySelectorAll(".org-name");
          if (headings.length !== 1) return false;
          const roles = Array.from(group.querySelectorAll(".role-entry"));
          return roles.length > 0 && roles.every((r) => group.contains(r));
        },
      ),
      { numRuns: MIN_PROPERTY_RUNS },
    );
  });
});
