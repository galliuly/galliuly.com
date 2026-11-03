// Feature: portfolio-website — Date ranges use " - " as the separator.
//
// Every role and education period with two endpoints reads like
// "Jul 2026 - Presente" (not "Jul 2026 a Presente").

import { describe, it, expect } from "vitest";
import { loadDocument } from "./helpers/dom.js";

function norm(el) {
  return (el.textContent ?? "").replace(/\s+/g, " ").trim();
}

describe("Date range format", () => {
  const { document } = loadDocument();
  const ranges = Array.from(document.querySelectorAll(".role-period, .edu-period")).filter(
    (el) => el.querySelectorAll("time").length === 2,
  );

  it("has date ranges to check (sanity)", () => {
    expect(ranges.length).toBeGreaterThan(0);
  });

  it("separates the two dates with ' - ' and never with ' a '", () => {
    for (const el of ranges) {
      const [start, end] = el.querySelectorAll("time");
      const text = norm(el);
      expect(text, `period "${text}"`).toContain(`${norm(start)} - ${norm(end)}`);
      expect(text).not.toMatch(/<\/?time>| a /);
    }
  });
});
