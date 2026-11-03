// Feature: portfolio-website — Professional polish (design skill review).
//
// Locks in the improvements from the design review: link previews and
// structured data, skip link, footer, tagline, branded 404, and the CSS rules
// for the type scale and motion.

import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { loadDocument, readStylesCss, PROJECT_ROOT } from "./helpers/dom.js";

const SITE = "https://galliuly.com/";

function meta(document, attr, name) {
  return document.querySelector(`meta[${attr}="${name}"]`)?.getAttribute("content") ?? "";
}

describe("Link previews and search metadata", () => {
  const { document } = loadDocument();

  it("has a meta description and a canonical URL", () => {
    expect(meta(document, "name", "description").length).toBeGreaterThan(50);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(SITE);
  });

  it("has Open Graph tags with an absolute image URL that exists in assets", () => {
    for (const prop of ["og:title", "og:description", "og:url", "og:type", "og:image"]) {
      expect(meta(document, "property", prop).length, prop).toBeGreaterThan(0);
    }
    const image = meta(document, "property", "og:image");
    expect(image.startsWith(SITE)).toBe(true);
    expect(existsSync(resolve(PROJECT_ROOT, image.replace(SITE, "")))).toBe(true);
    expect(meta(document, "property", "og:image:width")).toBe("1200");
    expect(meta(document, "property", "og:image:height")).toBe("630");
  });

  it("has a large-image Twitter/X card", () => {
    expect(meta(document, "name", "twitter:card")).toBe("summary_large_image");
    expect(meta(document, "name", "twitter:image")).toBe(meta(document, "property", "og:image"));
  });

  it("has valid Person structured data with profile links", () => {
    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const data = JSON.parse(script.textContent);
    expect(data["@type"]).toBe("Person");
    expect(data.name).toBe("Ulysses Galli");
    expect(data.url).toBe(SITE);
    expect(data.sameAs).toEqual(
      expect.arrayContaining([
        "https://www.linkedin.com/in/ulyssesgalli",
        "https://www.credly.com/users/ulysses-galli",
      ]),
    );
  });
});

describe("Skip link", () => {
  const { document } = loadDocument();

  it("is the first focusable element and targets the main content", () => {
    const first = document.body.querySelector("a[href], button, select, input, [tabindex]");
    expect(first.classList.contains("skip-link")).toBe(true);
    expect(first.getAttribute("href")).toBe("#main");
    const main = document.getElementById("main");
    expect(main?.tagName).toBe("MAIN");
    expect(main.getAttribute("tabindex")).toBe("-1");
  });
});

describe("Footer", () => {
  const { document } = loadDocument();
  const footer = document.querySelector("body > footer.site-footer");

  it("follows main and carries the monogram, copyright and a way back up", () => {
    expect(footer).not.toBeNull();
    expect(document.querySelector("main").compareDocumentPosition(footer) & 4).toBe(4);
    expect(footer.textContent).toContain("Ulysses Galli");
    expect(footer.querySelector(".footer-top")?.getAttribute("href")).toBe("#main");
  });
});

describe("Tagline", () => {
  const { document } = loadDocument();
  const about = document.getElementById("about");
  const tagline = about.querySelector("[data-tagline]");

  it("sits in About, after the heading and before the summary", () => {
    expect(tagline).not.toBeNull();
    const heading = about.querySelector("h2");
    const summary = about.querySelector(".about-summary");
    expect(heading.compareDocumentPosition(tagline) & 4).toBe(4);
    expect(tagline.compareDocumentPosition(summary) & 4).toBe(4);
  });

  it("is plain, translatable text (words are split by JS only)", () => {
    expect(tagline.getAttribute("data-i18n")).toBe("about.tagline");
    expect(tagline.children.length).toBe(0);
    expect(tagline.textContent.trim().split(/\s+/).length).toBeGreaterThan(5);
  });
});

describe("Branded 404 page", () => {
  const path = resolve(PROJECT_ROOT, "404.html");

  it("exists, is noindex, uses absolute asset paths and links home", () => {
    expect(existsSync(path)).toBe(true);
    const { document } = new JSDOM(readFileSync(path, "utf8")).window;
    expect(meta(document, "name", "robots")).toBe("noindex");
    expect(document.querySelector('link[rel="stylesheet"][href="/styles.css"]')).not.toBeNull();
    expect(document.querySelector('a[href="/"]')).not.toBeNull();
    expect(document.querySelector("h1")?.textContent.trim().length).toBeGreaterThan(0);
  });

  it("is published by the build and served for missing URLs", () => {
    const build = readFileSync(resolve(PROJECT_ROOT, "scripts", "build.mjs"), "utf8");
    expect(build).toContain('"404.html"');
    const wrangler = readFileSync(resolve(PROJECT_ROOT, "wrangler.jsonc"), "utf8");
    expect(wrangler).toMatch(/"not_found_handling"\s*:\s*"404-page"/);
  });
});

describe("CSS: type scale and motion rules", () => {
  const css = readStylesCss().replace(/\/\*[\s\S]*?\*\//g, ""); // ignore comments

  // Tailwind's default scale, in rem.
  const SCALE = new Set(["0.75", "0.875", "1", "1.125", "1.25", "1.5", "1.875", "2.25", "3"]);

  it("snaps every literal rem font size to the type scale", () => {
    const literal = [...css.matchAll(/font-size:\s*([\d.]+)rem/g)].map((m) => m[1]);
    const offScale = literal.filter((value) => !SCALE.has(String(Number(value))));
    expect(offScale, `off-scale font sizes: ${offScale.join(", ")}`).toEqual([]);
  });

  it("never uses the browser's default easing curves in transitions", () => {
    const transitions = [...css.matchAll(/transition:\s*([^;]+);/g)].map((m) => m[1]);
    for (const value of transitions) {
      expect(value, `transition "${value}"`).not.toMatch(/\b(ease|linear|ease-in-out)\b(?!-)/);
    }
  });

  it("never animates layout properties like width or height", () => {
    const transitions = [...css.matchAll(/transition:\s*([^;]+);/g)].map((m) => m[1]);
    for (const value of transitions) {
      expect(value).not.toMatch(/\b(width|height|top|left)\b/);
    }
  });

  it("prevents lone words on the last line of headings and paragraphs", () => {
    expect(css).toMatch(/text-wrap:\s*balance/);
    expect(css).toMatch(/text-wrap:\s*pretty/);
  });

  it("gives buttons press feedback", () => {
    expect(css).toMatch(/\.cta:active[\s\S]*?transform:\s*scale\(0\.98\)/);
  });
});
