// Feature: portfolio-website — Certifications carousel under the hero photo.
//
// Asserts the authored markup contract: the carousel sits in the hero column
// right after the photo, links once to the Credly profile with a safe rel, has
// a translated accessible label, and lists all 20 badges whose files exist.

import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadDocument, PROJECT_ROOT } from "./helpers/dom.js";

const CREDLY_URL = "https://www.credly.com/users/ulysses-galli";

describe("Certifications carousel", () => {
  const { document } = loadDocument();
  const media = document.querySelector("#hero .hero-media");
  const carousel = media?.querySelector(".cert-carousel");

  it("sits in the hero column directly below the photo", () => {
    expect(media, "#hero .hero-media must exist").not.toBeNull();
    const photo = media.querySelector(".hero-photo");
    expect(photo).not.toBeNull();
    expect(carousel).not.toBeNull();
    // The photo comes before the carousel in source order.
    expect(photo.compareDocumentPosition(carousel) & 4).toBe(4); // FOLLOWING
  });

  it("links to the Credly profile once, in a new tab with a safe rel", () => {
    const links = carousel.querySelectorAll("a");
    expect(links.length).toBe(1);
    const link = links[0];
    expect(link.getAttribute("href")).toBe(CREDLY_URL);
    expect(link.getAttribute("target")).toBe("_blank");
    expect((link.getAttribute("rel") ?? "").split(/\s+/)).toContain("noopener");
  });

  it("gives the link an accessible name via the visually hidden label", () => {
    const label = carousel.querySelector("a .visually-hidden");
    expect(label).not.toBeNull();
    expect((label.textContent ?? "").trim().length).toBeGreaterThan(0);
  });

  it("lists all 20 badges, decorative inside the link, each with a hover name", () => {
    const badges = Array.from(carousel.querySelectorAll(".cert-badge"));
    expect(badges.length).toBe(20);
    for (const img of badges) {
      expect(img.getAttribute("alt")).toBe("");
      expect(img.getAttribute("aria-hidden")).toBe("true");
      expect((img.getAttribute("title") ?? "").trim().length).toBeGreaterThan(0);
    }
  });

  it("references badge files that exist on disk", () => {
    for (const img of carousel.querySelectorAll(".cert-badge")) {
      const src = img.getAttribute("src");
      expect(existsSync(resolve(PROJECT_ROOT, src)), `${src} must exist`).toBe(true);
    }
  });

  it("authors a single list (the duplicate is added by JS only)", () => {
    expect(carousel.querySelectorAll(".cert-list").length).toBe(1);
  });

  it("opens with Solutions Architect, McKinsey, Duolingo, then AI L200", () => {
    const firstFour = Array.from(carousel.querySelectorAll(".cert-badge"))
      .slice(0, 4)
      .map((img) => img.getAttribute("src"));
    expect(firstFour).toEqual([
      "assets/certs/07-aws-solutions-architect-associate.png",
      "assets/certs/19-mckinsey-forward.png",
      "assets/certs/20-duolingo-english-test.png",
      "assets/certs/02-aws-ai-sales-intermediate.png",
    ]);
  });

  it("lists each badge exactly once", () => {
    const srcs = Array.from(carousel.querySelectorAll(".cert-badge")).map((img) =>
      img.getAttribute("src"),
    );
    expect(new Set(srcs).size).toBe(srcs.length);
  });

  it("has no arrow buttons (browsing is by drag/swipe)", () => {
    expect(carousel.querySelectorAll("button").length).toBe(0);
  });
});
