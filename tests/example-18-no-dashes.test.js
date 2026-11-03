// Feature: portfolio-website — No em/en dashes in visible text.
//
// The owner asked that no em-dash (—, U+2014) or en-dash (–, U+2013) appear in
// any visible text. This checks the rendered HTML text content and every
// translation string in the i18n dictionary, so switching language never
// surfaces a dash either. (JS comments in i18n.js are ignored — they are not
// visible text; we only read the extracted STRINGS/TITLES data.)

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";
import { loadDocument, PROJECT_ROOT } from "./helpers/dom.js";

const DASH_RE = /[\u2014\u2013]/; // em-dash or en-dash

/** Reuse the same object-extraction approach as the i18n test. */
function loadI18nData() {
  const src = readFileSync(resolve(PROJECT_ROOT, "i18n.js"), "utf8");
  function sliceObject(varName) {
    const start = src.indexOf(`var ${varName} = {`);
    const braceStart = src.indexOf("{", start);
    let depth = 0;
    let end = -1;
    let inStr = null;
    for (let i = braceStart; i < src.length; i++) {
      const ch = src[i];
      const prev = src[i - 1];
      if (inStr) {
        if (ch === inStr && prev !== "\\") inStr = null;
      } else if (ch === '"' || ch === "'") {
        inStr = ch;
      } else if (ch === "{") {
        depth++;
      } else if (ch === "}") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    return vm.runInNewContext("(" + src.slice(braceStart, end + 1) + ")");
  }
  return { STRINGS: sliceObject("STRINGS"), TITLES: sliceObject("TITLES") };
}

describe("No em/en dashes in visible content", () => {
  it("the rendered HTML body text contains no — or –", () => {
    const { document } = loadDocument();
    const bodyText = document.body.textContent ?? "";
    expect(DASH_RE.test(bodyText), "HTML body text must not contain an em/en dash").toBe(false);
  });

  it("the document <title> contains no — or –", () => {
    const { document } = loadDocument();
    expect(DASH_RE.test(document.title)).toBe(false);
  });

  it("no translation string in any language contains — or –", () => {
    const { STRINGS, TITLES } = loadI18nData();
    const offenders = [];

    for (const [lang, dict] of Object.entries(STRINGS)) {
      for (const [key, value] of Object.entries(dict)) {
        if (typeof value === "string" && DASH_RE.test(value)) {
          offenders.push(`STRINGS.${lang}.${key}`);
        }
      }
    }
    for (const [lang, value] of Object.entries(TITLES)) {
      if (typeof value === "string" && DASH_RE.test(value)) {
        offenders.push(`TITLES.${lang}`);
      }
    }

    expect(offenders, `these strings still contain a dash: ${offenders.join(", ")}`).toEqual([]);
  });
});
