// Harness smoke test (task 9.1).
//
// Proves the DOM-based test setup works end to end: index.html is read from
// disk, parsed into a jsdom Document with no build step, and exposes the
// expected top-level structure. This is NOT a property test for a design
// property (those are tasks 10-15); it only validates that the harness itself
// is wired up correctly.

import { describe, it, expect } from "vitest";
import { loadDocument, readStylesCss, SECTION_IDS } from "./helpers/dom.js";

describe("test harness smoke check", () => {
  it("parses index.html and finds a <main> with the six content sections", () => {
    const { document } = loadDocument();

    const main = document.querySelector("main");
    expect(main).not.toBeNull();

    const sections = main.querySelectorAll(":scope > section");
    expect(sections.length).toBe(6);

    const ids = Array.from(sections).map((section) => section.id);
    expect(ids).toEqual(SECTION_IDS);
  });

  it("can read styles.css as raw text for token-based checks", () => {
    const css = readStylesCss();
    expect(typeof css).toBe("string");
    expect(css.length).toBeGreaterThan(0);
  });
});
