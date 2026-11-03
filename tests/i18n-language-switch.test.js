// Feature: portfolio-website — Multilingual support (language switcher).
//
// These tests validate the i18n layer added after the base build:
//  - the header exposes a language selector with the six supported languages;
//  - every data-i18n key used in index.html has a translation in every
//    supported language (no key silently missing, which would leave stale
//    text when switching);
//  - the pt-BR dictionary matches the text authored directly in the HTML, so a
//    reset to the base language restores the original copy and the no-JS view
//    (Req 2.4) stays consistent with the dictionary.
//
// The dictionary lives in i18n.js as an IIFE (no exports), so we parse its
// STRINGS object out of the source with a tiny sandbox rather than importing.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";
import { loadDocument, PROJECT_ROOT } from "./helpers/dom.js";

const SUPPORTED = ["pt-BR", "en", "es", "zh", "de", "fr"];

/**
 * Extract the STRINGS and TITLES objects from i18n.js by evaluating just those
 * object literals in a sandbox. We slice from "var STRINGS = {" to the matching
 * "};" — the file is authored so this is unambiguous.
 */
function loadI18nData() {
  const src = readFileSync(resolve(PROJECT_ROOT, "i18n.js"), "utf8");

  function sliceObject(varName) {
    const start = src.indexOf(`var ${varName} = {`);
    if (start === -1) throw new Error(`${varName} not found in i18n.js`);
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
    if (end === -1) throw new Error(`Unbalanced braces for ${varName}`);
    const literal = src.slice(braceStart, end + 1);
    return vm.runInNewContext("(" + literal + ")");
  }

  return { STRINGS: sliceObject("STRINGS"), TITLES: sliceObject("TITLES") };
}

describe("Language switcher — markup", () => {
  const { document } = loadDocument();
  const select = document.getElementById("lang-select");

  it("renders a language <select> in the header", () => {
    expect(select, "#lang-select must exist").not.toBeNull();
    expect(select.closest("header"), "selector must live in the header").not.toBeNull();
    // Accessible name present (aria-label), since the visible label is hidden on small screens.
    expect((select.getAttribute("aria-label") ?? "").trim().length).toBeGreaterThan(0);
  });

  it("offers exactly the six supported languages as options", () => {
    const values = Array.from(select.querySelectorAll("option")).map((o) => o.value);
    expect(values).toEqual(SUPPORTED);
  });
});

describe("Language switcher — dictionary completeness", () => {
  const { STRINGS, TITLES } = loadI18nData();
  const { document } = loadDocument();

  it("defines a dictionary for every supported language", () => {
    for (const lang of SUPPORTED) {
      expect(STRINGS[lang], `STRINGS["${lang}"] must exist`).toBeTruthy();
      expect(TITLES[lang], `TITLES["${lang}"] must exist`).toBeTruthy();
    }
  });

  it("translates every data-i18n key used in the HTML, in every language", () => {
    const keysInHtml = Array.from(document.querySelectorAll("[data-i18n]")).map((el) =>
      el.getAttribute("data-i18n"),
    );
    const uniqueKeys = [...new Set(keysInHtml)];
    expect(uniqueKeys.length).toBeGreaterThan(0);

    for (const lang of SUPPORTED) {
      for (const key of uniqueKeys) {
        const value = STRINGS[lang][key];
        expect(
          typeof value === "string" && value.trim().length > 0,
          `missing/empty translation for key "${key}" in language "${lang}"`,
        ).toBe(true);
      }
    }
  });

  it("has no dictionary key without a corresponding element (no dead keys)", () => {
    const keysInHtml = new Set(
      Array.from(document.querySelectorAll("[data-i18n]")).map((el) =>
        el.getAttribute("data-i18n"),
      ),
    );
    // Every pt-BR key should be used somewhere in the HTML.
    for (const key of Object.keys(STRINGS["pt-BR"])) {
      expect(keysInHtml.has(key), `dictionary key "${key}" is not used in index.html`).toBe(true);
    }
  });
});

describe("Language switcher — pt-BR base matches authored HTML", () => {
  const { STRINGS } = loadI18nData();
  const { document } = loadDocument();

  it("every element's authored text equals its pt-BR dictionary string", () => {
    const nodes = Array.from(document.querySelectorAll("[data-i18n]"));
    for (const node of nodes) {
      const key = node.getAttribute("data-i18n");
      const authored = (node.textContent ?? "").replace(/\s+/g, " ").trim();
      const dict = (STRINGS["pt-BR"][key] ?? "").replace(/\s+/g, " ").trim();
      expect(authored, `authored text for "${key}" must match pt-BR dictionary`).toBe(dict);
    }
  });
});
