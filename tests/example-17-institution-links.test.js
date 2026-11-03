// Feature: portfolio-website — Institution/organization links and company tags.
//
// Each organization (experience) and each institution (education) name links to
// its official site, opening in a new tab with a safe rel. Smart V4 and Kruzer
// carry a "B2B SaaS Startup" tag beside the name. These assert the exact wiring.

import { describe, it, expect } from "vitest";
import { loadDocument } from "./helpers/dom.js";

/** Find a heading element whose text contains `label`. */
function headingContaining(nodes, label) {
  return nodes.find((n) => (n.textContent ?? "").includes(label));
}

describe("Institution and organization links", () => {
  const { document } = loadDocument();

  const expectedLinks = [
    { label: "Amazon Web Services", href: "https://aws.amazon.com/" },
    { label: "Smart V4", href: "https://smartv4.com/" },
    { label: "Núcleo São Paulo", href: "https://www.nucleosaopaulo.com.br/" },
    { label: "EPPEN JR", href: "https://eppenjr.com.br/" },
    { label: "Kruzer", href: "https://kruzer.ai/" },
    { label: "UNIFESP", href: "https://campus.unifesp.br/osa/" },
    { label: "FGV", href: "https://portal.fgv.br/" },
    { label: "LMU München", href: "https://www.lmu.de/en/" },
  ];

  const orgNames = Array.from(document.querySelectorAll(".org-name"));
  const eduNames = Array.from(document.querySelectorAll(".edu-institution"));
  const allNames = [...orgNames, ...eduNames];

  for (const { label, href } of expectedLinks) {
    it(`links "${label}" to ${href} with a safe rel`, () => {
      const heading = headingContaining(allNames, label);
      expect(heading, `heading for "${label}" must exist`).not.toBeUndefined();

      const anchor = heading.querySelector("a");
      expect(anchor, `"${label}" name must be a link`).not.toBeNull();
      expect(anchor.getAttribute("href")).toBe(href);
      expect(anchor.getAttribute("target")).toBe("_blank");

      const rel = (anchor.getAttribute("rel") ?? "").toLowerCase();
      expect(rel).toContain("noopener");
    });
  }
});

describe("Company tags", () => {
  const { document } = loadDocument();

  function orgByName(label) {
    return Array.from(document.querySelectorAll(".org-group")).find((g) =>
      (g.querySelector(".org-name")?.textContent ?? "").includes(label),
    );
  }

  const expectedTags = {
    "Smart V4": "B2B SaaS Startup",
    Kruzer: "B2B SaaS Startup",
    "EPPEN JR": "Junior Enterprise made by students",
    "Núcleo São Paulo": "Junior Enterprise Ecosystem",
    "Amazon Web Services": "Leading AI",
  };

  for (const [label, tagText] of Object.entries(expectedTags)) {
    it(`shows a "${tagText}" tag beside ${label}`, () => {
      const group = orgByName(label);
      expect(group, `${label} group must exist`).not.toBeUndefined();
      const tag = group.querySelector(".org-name .org-tag");
      expect(tag, `${label} must have an .org-tag`).not.toBeNull();
      expect((tag.textContent ?? "").trim()).toBe(tagText);
    });
  }
});
