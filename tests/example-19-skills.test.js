// Feature: portfolio-website — Skills section (replaces Projects).
//
// The Skills section renders a word cloud. Its accessible, no-JS fallback is a
// plain list of skills inside #skills. These assert the fallback content: the
// section exists, has a heading, and the expected skills are present as text.

import { describe, it, expect } from "vitest";
import { loadDocument } from "./helpers/dom.js";

const EXPECTED_SKILLS = [
  "Sales",
  "Strategy",
  "AI",
  "Consulting",
  "Marketing",
  "Customer Experience",
  "Project Management",
  "Program Management",
  "International Relations",
  "International Business Management",
  "Relationship Building",
  "Business Development",
  "Go-to-Market",
  "Partnerships",
  "B2B SaaS",
  "Cloud",
  "AWS",
  "Growth",
  "Operations",
  "Branding",
  "Customer Success",
  "Intrapreneurship",
  "Stakeholder Management",
  "Negotiation",
  "Leadership",
  "Public Speaking",
  "Certifications",
];

describe("Skills section", () => {
  const { document } = loadDocument();
  const section = document.getElementById("skills");

  it("replaces Projects: #skills exists and #projects does not", () => {
    expect(section, "#skills must exist").not.toBeNull();
    expect(document.getElementById("projects"), "#projects must be gone").toBeNull();
  });

  it("has a visible heading", () => {
    const h2 = section.querySelector("h2");
    expect(h2).not.toBeNull();
    expect((h2.textContent ?? "").trim().length).toBeGreaterThan(0);
  });

  it("provides a no-JS accessible list of skills", () => {
    const list = section.querySelector(".skill-list");
    expect(list, "a .skill-list fallback must exist").not.toBeNull();
    const skills = Array.from(list.querySelectorAll(".skill")).map((el) =>
      (el.textContent ?? "").trim(),
    );
    // Every expected skill is present (the list is the readable fallback).
    for (const skill of EXPECTED_SKILLS) {
      expect(skills, `skill "${skill}" must be listed`).toContain(skill);
    }
  });

  it("marks the cloud container for the sphere enhancement", () => {
    const cloud = section.querySelector("[data-skillcloud]");
    expect(cloud, "the skill cloud container must carry data-skillcloud").not.toBeNull();
  });
});
