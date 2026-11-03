// scripts/og-image.mjs — Render the social preview card (assets/og-image.jpg).
//
// LinkedIn, WhatsApp, X and Slack show this 1200x630 image when someone shares
// galliuly.com. It is a small HTML card in the site palette, screenshotted
// with the Playwright browser already used by the tests.
//
// Re-run after changing the photo, name, or role:
//   npm run og-image

import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "assets", "og-image.jpg");

// Inline the photo as a data URL, so the card does not depend on file paths.
const photo = readFileSync(resolve(ROOT, "assets", "profile.jpg")).toString("base64");

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
<style>
  * { box-sizing: border-box; margin: 0; }
  body {
    width: 1200px; height: 630px; overflow: hidden;
    background-color: #f5f1e8;
    background-image:
      radial-gradient(900px 420px at 30% -20%, rgba(184,155,94,0.16), rgba(184,155,94,0) 70%),
      repeating-linear-gradient(45deg, rgba(26,42,79,0.03) 0, rgba(26,42,79,0.03) 1px, transparent 1px, transparent 6px),
      repeating-linear-gradient(-45deg, rgba(26,42,79,0.03) 0, rgba(26,42,79,0.03) 1px, transparent 1px, transparent 6px);
    font-family: "Playfair Display", Georgia, serif;
    color: #1a2a4f;
    display: flex;
  }
  .text {
    flex: 1;
    padding: 80px 0 80px 96px;
    display: flex; flex-direction: column; justify-content: center; gap: 24px;
  }
  .mono { font-size: 30px; font-weight: 700; }
  .mono span { color: #b89b5e; }
  h1 { font-size: 96px; line-height: 1; font-weight: 700; letter-spacing: -0.01em; }
  .rule { width: 64px; height: 3px; background: #b89b5e; }
  .role { font-size: 36px; line-height: 1.2; font-weight: 600; }
  .meta { font-family: Georgia, serif; font-size: 24px; color: #22262b; }
  .url { font-size: 24px; font-weight: 600; letter-spacing: 0.04em; color: #b89b5e; }
  .photo {
    width: 420px; height: 630px; flex: 0 0 auto;
    background: url("data:image/jpeg;base64,${photo}") center 30% / cover no-repeat;
    border-left: 3px solid #b89b5e;
  }
</style>
</head>
<body>
  <div class="text">
    <div class="mono">UG<span>.</span></div>
    <h1>Ulysses<br />Galli</h1>
    <div class="rule"></div>
    <div class="role">Sales Executive at<br />Amazon Web Services</div>
    <div class="meta">3x AWS Certified · UNIFESP · FGV</div>
    <div class="url">galliuly.com</div>
  </div>
  <div class="photo"></div>
</body>
</html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: OUT, type: "jpeg", quality: 88 });
  console.log(`og-image: wrote ${OUT}`);
} finally {
  await browser.close();
}
