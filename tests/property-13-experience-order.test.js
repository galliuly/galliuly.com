// Feature: portfolio-website, Property 13: Experience groups are in reverse chronological order
//
// Design: Correctness Properties > Property 13.
// "For all consecutive pairs of Organization_Groups in document order, the most
// recent Role_Entry period of the earlier group is greater than or equal to
// that of the later group (groups are sorted descending by most recent role
// period)."
//
// Validates: Requirements 9.5
//
// Each org group's "most recent role period" is the latest point in time among
// its roles. Periods are authored in Portuguese, e.g. "Jul 2026 – Presente",
// "Set 2025 – Jul 2026", with month abbreviations. We parse each role's latest
// endpoint to a comparable number (year*12 + month), treating "Presente" as
// +infinity (an ongoing role is the most recent). The group's score is the max
// over its roles. The sequence of group scores in document order must be
// non-increasing. A fast-check pass re-checks every consecutive pair across
// MIN_PROPERTY_RUNS runs.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { loadDocument, MIN_PROPERTY_RUNS } from "./helpers/dom.js";

const MONTHS = {
  jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6,
  jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12,
};

const PRESENT = Number.POSITIVE_INFINITY;

/**
 * Convert a single date token like "Jul 2026", "2026", or "Presente" to a
 * comparable score (year*12 + month). "Presente"/"Present" -> +Infinity.
 * A bare year is treated as that year's December (latest point in the year),
 * which is the right choice when picking the "most recent" endpoint.
 */
function tokenScore(raw) {
  const token = raw.trim().toLowerCase();
  if (token.startsWith("presente") || token.startsWith("present")) {
    return PRESENT;
  }
  const monthYear = token.match(/^([a-zç]{3})\.?\s+(\d{4})$/i);
  if (monthYear) {
    const month = MONTHS[monthYear[1].slice(0, 3)] ?? 12;
    return Number(monthYear[2]) * 12 + month;
  }
  const yearOnly = token.match(/(\d{4})/);
  if (yearOnly) {
    return Number(yearOnly[1]) * 12 + 12;
  }
  return Number.NEGATIVE_INFINITY;
}

/**
 * The most recent endpoint of one role: the max score across the date tokens
 * found in its .role-period text (handles "start – end" ranges).
 */
function roleMostRecent(roleEntry) {
  const periodEl = roleEntry.querySelector(".role-period");
  const text = periodEl ? periodEl.textContent : "";
  // Split on en dash / hyphen separators between the two endpoints.
  const parts = text.split(/[–-]/);
  let best = Number.NEGATIVE_INFINITY;
  for (const part of parts) {
    // Strip parenthetical notes like "(part-time)".
    const clean = part.replace(/\(.*?\)/g, "");
    best = Math.max(best, tokenScore(clean));
  }
  return best;
}

/** A group's score: the most recent role endpoint among all its roles. */
function groupMostRecent(group) {
  const roles = Array.from(group.querySelectorAll(".role-entry"));
  return roles.reduce((acc, r) => Math.max(acc, roleMostRecent(r)), Number.NEGATIVE_INFINITY);
}

describe("Property 13: Experience groups are in reverse chronological order", () => {
  const { document } = loadDocument();
  const groups = Array.from(
    document.querySelectorAll("#experience .org-group"),
  );
  const scores = groups.map(groupMostRecent);

  it("has multiple experience groups with parseable periods (sanity)", () => {
    expect(groups.length).toBeGreaterThan(1);
    for (const score of scores) {
      expect(Number.isNaN(score)).toBe(false);
      expect(score).toBeGreaterThan(Number.NEGATIVE_INFINITY);
    }
  });

  it("groups appear in non-increasing order of most-recent role period", () => {
    for (let i = 0; i + 1 < scores.length; i++) {
      expect(
        scores[i] >= scores[i + 1],
        `group ${i} (score ${scores[i]}) should be >= group ${i + 1} (score ${scores[i + 1]})`,
      ).toBe(true);
    }
  });

  it("every consecutive pair is correctly ordered across many runs", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: Math.max(0, scores.length - 2) }),
        (i) => scores[i] >= scores[i + 1],
      ),
      { numRuns: MIN_PROPERTY_RUNS },
    );
  });
});
