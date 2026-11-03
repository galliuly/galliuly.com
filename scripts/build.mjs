// scripts/build.mjs — Copy only the public site files into dist/.
//
// The site needs no compilation; "building" just means collecting the files a
// visitor's browser actually loads, leaving out tests, configs, node_modules,
// and the .kiro spec folder. Cloudflare Pages runs this on every push and
// publishes the dist/ folder.
//
// Uses only Node built-ins, so it works without installing any dependency.

import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = resolve(ROOT, "dist");

// Everything the published site needs. Add new public files here.
const SITE_FILES = [
  "index.html",
  "styles.css",
  "main.js",
  "i18n.js",
  "typewriter.js",
  "skillcloud.js",
  "assets",
];

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

for (const entry of SITE_FILES) {
  const src = resolve(ROOT, entry);
  if (!existsSync(src)) {
    // Fail loudly: a missing public file would ship a broken site.
    console.error(`build: missing required file "${entry}"`);
    process.exit(1);
  }
  cpSync(src, resolve(DIST, entry), { recursive: true });
}

console.log(`build: copied ${SITE_FILES.length} entries to dist/`);
