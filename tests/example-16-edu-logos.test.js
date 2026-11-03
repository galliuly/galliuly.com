// Feature: portfolio-website — Education logos (example tests).
//
// Each education entry shows the institution's logo beside its text. These
// assert the markup contract: every .edu-entry has an .edu-logo <img> with a
// non-empty alt (Req 6.3 keeps holding) and a src pointing into assets/.

import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadDocument, PROJECT_ROOT } from "./helpers/dom.js";

describe("Education entries carry an institution logo", () => {
  const { document } = loadDocument();
  const entries = Array.from(document.querySelectorAll(".edu-entry"));

  it("has education entries (sanity)", () => {
    expect(entries.length).toBe(3);
  });

  it("every education entry has a logo image with a non-empty alt and an assets/ src", () => {
    for (const entry of entries) {
      const logo = entry.querySelector(".edu-logo");
      const institution = (entry.querySelector(".edu-institution")?.textContent ?? "").trim();
      expect(logo, `entry "${institution}" must have an .edu-logo image`).not.toBeNull();

      const alt = (logo.getAttribute("alt") ?? "").trim();
      expect(alt.length, `logo for "${institution}" must have a non-empty alt`).toBeGreaterThan(0);

      const src = logo.getAttribute("src") ?? "";
      expect(src.startsWith("assets/"), `logo src "${src}" must live under assets/`).toBe(true);
    }
  });

  it("every referenced logo file exists on disk", () => {
    for (const entry of entries) {
      const src = entry.querySelector(".edu-logo").getAttribute("src");
      const path = resolve(PROJECT_ROOT, src);
      expect(existsSync(path), `logo file ${src} must exist`).toBe(true);
    }
  });
});
