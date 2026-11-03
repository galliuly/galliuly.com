// Feature: portfolio-website — Integration check (task 15.1): asset-size budget
//
// Design Testing Strategy / Req 7.2: combined transferred CSS + JS size must be
// <= 150 KB, excluding images and fonts. The site has one stylesheet and one
// script, both served as-is (no build/minification step), so the on-disk byte
// size is the transferred size. We measure the raw bytes of styles.css +
// main.js and assert the combined total is within budget.

import { describe, it, expect } from "vitest";
import { statSync } from "node:fs";
import {
  STYLES_CSS_PATH,
  MAIN_JS_PATH,
  I18N_JS_PATH,
  TYPEWRITER_JS_PATH,
  SKILLCLOUD_JS_PATH,
} from "./helpers/dom.js";

const BUDGET_BYTES = 150 * 1024; // 150 KB

describe("15.1 Combined CSS + JS asset size is within the 150 KB budget", () => {
  it("all CSS + JS <= 150 KB (Req 7.2)", () => {
    // Budget covers ALL served CSS + JS, so every script counts — styles plus
    // main.js, i18n.js (multilingual), typewriter.js (hero), and skillcloud.js
    // (skills sphere). Images and fonts are excluded per Req 7.2.
    const parts = {
      "styles.css": statSync(STYLES_CSS_PATH).size,
      "main.js": statSync(MAIN_JS_PATH).size,
      "i18n.js": statSync(I18N_JS_PATH).size,
      "typewriter.js": statSync(TYPEWRITER_JS_PATH).size,
      "skillcloud.js": statSync(SKILLCLOUD_JS_PATH).size,
    };
    const total = Object.values(parts).reduce((a, b) => a + b, 0);
    const breakdown = Object.entries(parts)
      .map(([k, v]) => `${k} ${v} B`)
      .join(" + ");

    expect(
      total,
      `${breakdown} = ${total} B must be <= ${BUDGET_BYTES} B`,
    ).toBeLessThanOrEqual(BUDGET_BYTES);
  });
});
