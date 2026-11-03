// Feature: portfolio-website — Language switch behavior (e2e).
//
// Verifies the runtime behavior of the language switcher in a real browser:
// selecting a language swaps visible text, updates <html lang>, and persists
// across reloads via localStorage. jsdom cannot run this reliably because the
// switch is driven by a change event + script execution, so it runs under
// Playwright against the file:// URL (no server, no build).

import { test, expect } from "@playwright/test";

test("switching to English updates content and <html lang>", async ({ page }) => {
  await page.goto("index.html");
  await page.setViewportSize({ width: 1024, height: 900 });

  // Start from an explicit, deterministic base. (On first visit the site
  // auto-detects the browser language, which under a headless en-US browser
  // is English — so we set pt-BR here rather than assume the initial state.)
  await page.selectOption("#lang-select", "pt-BR");
  await expect(page.locator("#about h2")).toHaveText("Sobre");

  // Switch to English.
  await page.selectOption("#lang-select", "en");

  // Content swaps and the document language updates (Req 6.1 stays satisfied
  // with the active language).
  await expect(page.locator("#about h2")).toHaveText("About");
  await expect(page.locator("nav a[href='#experience']")).toHaveText("Experience");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  // The owner's name is NOT translated (proper noun stays stable).
  await expect(page.locator("#hero h1")).toHaveText("Ulysses Galli");
});

test("language choice persists across a reload", async ({ page }) => {
  await page.goto("index.html");
  await page.selectOption("#lang-select", "de");
  await expect(page.locator("#about h2")).toHaveText("Über mich");

  await page.reload();

  // After reload, the stored choice (German) is reapplied.
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.locator("#about h2")).toHaveText("Über mich");
  await expect(page.locator("#lang-select")).toHaveValue("de");
});

test("switching back to Portuguese restores the base copy", async ({ page }) => {
  await page.goto("index.html");
  await page.selectOption("#lang-select", "fr");
  await expect(page.locator("#contact h2")).toHaveText("Contact");

  await page.selectOption("#lang-select", "pt-BR");
  await expect(page.locator("#contact h2")).toHaveText("Contato");
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
});

test("lands in English by default on a fresh visit (no stored choice)", async ({ page }) => {
  // Ensure no previously stored language leaks in from another test.
  await page.goto("index.html");
  await page.evaluate(() => window.localStorage.removeItem("portfolio-lang"));
  await page.reload();

  // Default landing language is English, regardless of browser locale.
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#about h2")).toHaveText("About");
  await expect(page.locator("#lang-select")).toHaveValue("en");
});
