// Shared test harness helpers.
//
// These load the static site's source files from disk WITHOUT a build step,
// mirroring how the page is served (open index.html directly / static host).
//
// - loadDocument(): parses index.html into a jsdom Document. jsdom does NOT run
//   layout or resolve full CSS cascade/computed styles the way a real browser
//   does, so DOM-structure, attribute, and text properties are checked here,
//   while layout/computed-style properties (e.g. Property 18, no horizontal
//   scroll across widths) are covered by the Playwright harness in tests/e2e.
// - readStylesCss(): returns the raw styles.css text, so token-based style
//   checks (palette size, contrast tokens, focus-visible presence) can parse
//   the stylesheet source directly rather than relying on jsdom computed styles.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { JSDOM } from "jsdom";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Project root: tests/helpers/ -> tests/ -> project root.
export const PROJECT_ROOT = resolve(__dirname, "..", "..");

export const INDEX_HTML_PATH = resolve(PROJECT_ROOT, "index.html");
export const STYLES_CSS_PATH = resolve(PROJECT_ROOT, "styles.css");
export const MAIN_JS_PATH = resolve(PROJECT_ROOT, "main.js");
export const I18N_JS_PATH = resolve(PROJECT_ROOT, "i18n.js");
export const TYPEWRITER_JS_PATH = resolve(PROJECT_ROOT, "typewriter.js");
export const SKILLCLOUD_JS_PATH = resolve(PROJECT_ROOT, "skillcloud.js");

/**
 * Read index.html from disk and parse it into a jsdom Document.
 *
 * Scripts and external resources are intentionally NOT run or fetched: these
 * tests validate the content-first, JS-optional HTML as served. Pass
 * { runScripts: "dangerously", resources: "usable" } via `options` only if a
 * specific interaction test needs main.js executed.
 *
 * @param {object} [options] - Extra JSDOM constructor options to merge in.
 * @returns {{ dom: import("jsdom").JSDOM, document: Document, window: Window }}
 */
export function loadDocument(options = {}) {
  const html = readFileSync(INDEX_HTML_PATH, "utf8");
  const dom = new JSDOM(html, {
    url: "https://example.com/",
    contentType: "text/html",
    ...options,
  });
  return { dom, document: dom.window.document, window: dom.window };
}

/**
 * Return the raw text of styles.css for token-based style assertions.
 * @returns {string}
 */
export function readStylesCss() {
  return readFileSync(STYLES_CSS_PATH, "utf8");
}

/**
 * Return the raw text of main.js for progressive-enhancement checks.
 * @returns {string}
 */
export function readMainJs() {
  return readFileSync(MAIN_JS_PATH, "utf8");
}

// The six required section ids, in document order (Hero + the five nav targets).
export const SECTION_IDS = [
  "hero",
  "about",
  "experience",
  "education",
  "skills",
  "contact",
];

// Minimum generated samples/iterations for property tests (design Testing
// Strategy: a minimum of 100 iterations/samples where inputs are generated).
export const MIN_PROPERTY_RUNS = 100;
