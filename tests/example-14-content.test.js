// Feature: portfolio-website — Example and edge-case tests (tasks 14.1-14.4)
//
// Concrete, content-specific assertions complementing the property tests.
// These check the exact authored content and style tokens required by the
// requirements, where the property tests only check structural invariants.

import { describe, it, expect } from "vitest";
import { loadDocument, readStylesCss } from "./helpers/dom.js";

/** Collapse whitespace for robust text matching. */
function norm(el) {
  return (el?.textContent ?? "").replace(/\s+/g, " ").trim();
}

describe("14.1 Hero content", () => {
  const { document } = loadDocument();
  const hero = document.getElementById("hero");

  it("shows the exact name in the single h1 (Req 1.5)", () => {
    const h1 = hero.querySelector("h1");
    expect(h1).not.toBeNull();
    expect(norm(h1)).toBe("Ulysses Galli");
  });

  it("shows the exact headline (Req 1.6)", () => {
    expect(norm(hero)).toContain(
      "Sales at Amazon Web Services | 3x AWS Certified | UNIFESP | FGV",
    );
  });

  it("shows the Sales/Strategy/AI role chips (Req 1.7)", () => {
    const chips = Array.from(hero.querySelectorAll(".role-chip")).map(norm);
    expect(chips).toEqual(expect.arrayContaining(["Sales", "Strategy", "AI"]));
  });

  it("links to the LinkedIn profile from the hero (Req 8.1)", () => {
    const links = Array.from(hero.querySelectorAll("a")).map((a) =>
      a.getAttribute("href"),
    );
    expect(
      links.some((href) => href && href.includes("linkedin.com/in/ulyssesgalli")),
    ).toBe(true);
  });

  it("has both a LinkedIn and an email icon in the hero social links", () => {
    const socialLinks = Array.from(
      hero.querySelectorAll(".social-links .social-link"),
    );
    const hrefs = socialLinks.map((a) => a.getAttribute("href") ?? "");
    // Two icon links side by side: LinkedIn + mailto email.
    expect(hrefs.some((h) => h.includes("linkedin.com/in/ulyssesgalli"))).toBe(true);
    expect(hrefs.some((h) => h.startsWith("mailto:"))).toBe(true);
    // Each has an accessible name (aria-label), since they are icon-only.
    for (const a of socialLinks) {
      expect((a.getAttribute("aria-label") ?? "").trim().length).toBeGreaterThan(0);
    }
  });
});

describe("14.2 Experience content", () => {
  const { document } = loadDocument();

  /** Find an org group by its organization name substring. */
  function groupByName(name) {
    return Array.from(document.querySelectorAll(".org-group")).find((g) =>
      norm(g.querySelector(".org-name")).includes(name),
    );
  }

  it("AWS group has Sales Executive and Program Manager (Req 9.6)", () => {
    const aws = groupByName("Amazon Web Services");
    expect(aws, "AWS org group must exist").not.toBeUndefined();
    const titles = Array.from(aws.querySelectorAll(".role-title")).map(norm);
    expect(titles).toEqual(
      expect.arrayContaining(["Sales Executive", "Program Manager"]),
    );
  });

  it("AWS Sales Executive carries the '150% quota' highlight badge (Req 9.7)", () => {
    const aws = groupByName("Amazon Web Services");
    const salesRole = Array.from(aws.querySelectorAll(".role-entry")).find((r) =>
      norm(r.querySelector(".role-title")) === "Sales Executive",
    );
    expect(salesRole, "Sales Executive role must exist").not.toBeUndefined();
    const badge = salesRole.querySelector(".highlight-badge");
    expect(badge, "Sales Executive must have a highlight badge").not.toBeNull();
    expect(norm(badge)).toContain("150%");
  });

  it("EPPEN JR group has the three specified roles (Req 9.8)", () => {
    const eppen = groupByName("EPPEN JR");
    expect(eppen, "EPPEN JR org group must exist").not.toBeUndefined();
    const titles = Array.from(eppen.querySelectorAll(".role-title")).map(norm);
    expect(titles).toEqual(
      expect.arrayContaining([
        "Deliberative Counselor",
        "Project Management Director",
        "Junior Consultant",
      ]),
    );
  });
});

describe("14.3 Education content", () => {
  const { document } = loadDocument();
  const eduText = norm(document.getElementById("education"));

  it("includes UNIFESP with its subtitle (Req 10.3)", () => {
    expect(eduText).toContain("UNIFESP");
    const unifesp = Array.from(document.querySelectorAll(".edu-entry")).find((e) =>
      norm(e.querySelector(".edu-institution")).includes("UNIFESP"),
    );
    expect(unifesp).not.toBeUndefined();
    expect(norm(unifesp.querySelector(".edu-subtitle"))).toContain(
      "Top 10 universidades brasileiras",
    );
  });

  it("includes FGV (Req 10.4)", () => {
    expect(eduText).toContain("FGV");
  });

  it("includes LMU München (Req 10.5)", () => {
    expect(eduText).toContain("LMU München");
  });
});

describe("14.4 Palette and focus style tokens", () => {
  const css = readStylesCss();

  function token(name) {
    const m = css.match(new RegExp(`${name}\\s*:\\s*(#[0-9a-fA-F]{3,8})`));
    return m ? m[1].toLowerCase() : null;
  }

  it("--color-primary is navy and --color-bg is cream (Req 4.3)", () => {
    expect(token("--color-primary")).toBe("#1a2a4f");
    expect(token("--color-bg")).toBe("#f5f1e8");
  });

  it("defines the gold accent used for chip border and badge (Req 4.4)", () => {
    expect(token("--color-accent")).toBe("#b89b5e");
    // Role chip borders and highlight badges reference the gold accent.
    expect(css).toMatch(/\.role-chip[\s\S]*?border[\s\S]*?var\(--color-accent\)/);
    expect(css).toMatch(/\.highlight-badge[\s\S]*?background-color:\s*var\(--color-accent\)/);
  });

  it("sets a document language on <html> (Req 6.1)", () => {
    const { document } = loadDocument();
    const lang = document.documentElement.getAttribute("lang");
    expect(lang && lang.trim().length).toBeGreaterThan(0);
  });

  it("defines :focus-visible styles (Req 6.5)", () => {
    expect(css).toMatch(/:focus-visible\s*\{/);
    expect(css).toMatch(/:focus-visible[\s\S]*?outline:/);
  });
});
