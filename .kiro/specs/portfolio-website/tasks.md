# Implementation Plan: Portfolio Website

## Overview

This plan builds the static one-page portfolio for Ulysses Galli with plain HTML, CSS, and JavaScript and no build step. Work proceeds incrementally: first the file scaffold and semantic HTML skeleton with all sections and the sticky nav, then the real Portuguese content section by section, then the Ivy League CSS (palette tokens, serif typography, mobile-first layout, cards/chips/badges, focus styles), then the progressive-enhancement JavaScript, and finally the test suite that encodes the design's Correctness Properties plus example and integration checks. Each step builds on the previous one and wires into the single `index.html` so no code is left orphaned.

The design uses specific web technologies (HTML/CSS/JS), so no implementation-language selection is needed. Test sub-tasks are marked optional with `*`.

## Tasks

- [x] 1. Scaffold files and semantic HTML skeleton
  - Create `index.html`, `styles.css`, `main.js`, and an `assets/` directory at the project root (flat static structure).
  - In `index.html`, set `<html lang="pt-BR">`, add `<head>` with charset, responsive `viewport` meta, title, the Google Fonts `preconnect` + Playfair Display stylesheet link, a `<link rel="stylesheet" href="styles.css">`, and `<script src="main.js" defer></script>`.
  - Author the page shell: `<header>` containing `<nav aria-label="Primary">` with a `<ul>` of Anchor_Links (`#about`, `#experience`, `#education`, `#projects`, `#contact`), and a `<main>` containing six empty `<section>` elements with unique ids `hero`, `about`, `experience`, `education`, `projects`, `contact`.
  - Give each non-hero section a visible `<h2>` placeholder heading; reserve the single `<h1>` for the hero name.
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 3.1, 6.1, 6.6, 7.3_

- [x] 2. Author hero and about content
  - [x] 2.1 Fill the Hero_Section (`#hero`)
    - Add `<h1>` with "Ulysses Galli", the headline "Sales at Amazon Web Services | 3x AWS Certified | UNIFESP | FGV", and a Role_Chip list with "Sales", "Strategy", "AI".
    - Add a social-link group with inline SVG icons, including a LinkedIn link to `https://linkedin.com/in/ulyssesgalli`, each link with an accessible name and `rel="noopener noreferrer"` where it opens a new context.
    - Place text before any optional profile `<img>` (lazy-loaded, descriptive or empty `alt`) in source order.
    - _Requirements: 1.5, 1.6, 1.7, 7.3, 8.1, 8.3, 8.5_

  - [x] 2.2 Fill the About_Section (`#about`)
    - Add the visible `<h2>` heading and a personal summary paragraph describing the Owner (Portuguese content).
    - _Requirements: 1.8_

- [x] 3. Author experience content
  - [x] 3.1 Build Organization_Group / Role_Entry markup in `#experience`
    - For each organization, author one `<article class="card org-group">` with a single `.org-name` heading and an `<ol class="roles">` of `.role-entry` items; each role has a title, a `.role-period`, and a `.role-description`.
    - Add the AWS group with "Sales Executive" (with a `.highlight-badge` "150% quota") and "Program Manager"; add the EPPEN JR group with "Deliberative Counselor", "Project Management Director", and "Junior Consultant".
    - Order groups reverse-chronologically by most recent Role_Entry period.
    - _Requirements: 1.9, 4.7, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [x] 4. Author education, projects, and contact content
  - [x] 4.1 Build Education_Entry blocks in `#education`
    - Author repeatable `<article class="edu-entry">` blocks, each with institution, qualification, time period, and a descriptive subtitle.
    - Include UNIFESP (subtitle "Top 10 universidades brasileiras"), FGV, and LMU München.
    - _Requirements: 1.10, 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 4.2 Build project cards in `#projects`
    - Author repeatable `<article class="card project">` cards, each with a name, a description, and a link; new-context links use `rel="noopener noreferrer"`.
    - _Requirements: 1.11, 4.7, 8.5_

  - [x] 4.3 Build the Contact_Section (`#contact`)
    - Add a link-in-bio style list of labeled contact/social links, each with a visible destination label and `rel="noopener noreferrer"` where opening a new context.
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

- [x] 5. Checkpoint - verify static HTML renders with JS disabled
  - Open `index.html` directly with scripting disabled and confirm every section's text and links are present and the page renders with no build or server. Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 2.2, 2.3, 2.4_

- [x] 6. Implement core styling: palette, typography, base layout
  - [x] 6.1 Define palette tokens and typography in `styles.css`
    - Add `:root` custom properties for the four principal colors (navy primary, cream background, gold accent, dark ink body text), the spacing scale, serif font stacks (`--font-serif` Playfair Display, body serif stack), and a 16px base body size.
    - Apply the serif face to the hero name and all section headings; apply navy/cream/ink to text and background with AA-safe contrast.
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 5.4, 6.2, 6.4_

  - [x] 6.2 Implement mobile-first layout and sticky nav
    - Author base (Mobile_Layout) styles and a single `@media (min-width: 768px)` block for Desktop_Layout; make the header `position: sticky; top: 0`.
    - Use fluid widths, `max-width: 100%` media, and wrapping flex/grid so there is no horizontal overflow on mobile; set `scroll-behavior: smooth` and section `scroll-margin-top` for the sticky header offset.
    - _Requirements: 3.2, 3.4, 4.5, 5.1, 5.2, 5.3_

- [x] 7. Implement component styling: cards, chips, badges, focus
  - [x] 7.1 Style cards, Role_Chips, and Highlight_Badges
    - Style `.card` (org groups and project cards) as bounded cream surfaces with border, padding, and consistent spacing from the scale; style `.role-chip` as pills with a gold border and `.highlight-badge` as gold-filled labels; keep the layout minimalist.
    - _Requirements: 4.4, 4.5, 4.6, 4.7_

  - [x] 7.2 Add visible focus styles
    - Add a global `:focus-visible` outline (gold/navy) on all focusable elements and ensure navigation-target sections can receive focus.
    - _Requirements: 6.5_

- [x] 8. Implement progressive-enhancement JavaScript
  - [x] 8.1 Implement anchor focus management in `main.js`
    - On Anchor_Link activation, resolve the target section, apply `tabindex="-1"` if absent, and move keyboard focus to it; ensure the script is non-essential (text and scrolling work without it) and degrades gracefully.
    - _Requirements: 2.4, 3.2, 3.3_

  - [x] 8.2 Implement active-link highlighting
    - Use `IntersectionObserver` to mark the Navigation_Bar link for the section currently in view (cosmetic only).
    - _Requirements: 3.4_

- [x] 9. Set up the test harness
  - [x] 9.1 Add a DOM-based test setup
    - Add a test runner and a DOM parser/headless-browser setup that loads `index.html` and its computed styles without a build step; configure property tests to run a minimum of 100 iterations/samples where inputs are generated.
    - _Requirements: 2.2, 2.3_

- [x] 10. Write structural and navigation property tests
  - [x] 10.1 Property test: section ids present and unique
    - **Property 1: Section identifiers are present and unique**
    - **Validates: Requirements 1.3**

  - [x] 10.2 Property test: every non-hero section has a visible heading
    - **Property 2: Every non-hero section has a visible heading**
    - **Validates: Requirements 1.4**

  - [x] 10.3 Property test: nav links map one-to-one to content sections
    - **Property 3: Navigation links correspond one-to-one with content sections**
    - **Validates: Requirements 3.1**

  - [x] 10.4 Property test: all section text present without JavaScript
    - **Property 4: All section text is present without JavaScript**
    - **Validates: Requirements 2.4**

  - [x] 10.5 Property test: nav anchors have descriptive accessible names
    - **Property 5: Navigation anchors have descriptive accessible names**
    - **Validates: Requirements 6.6**

- [x] 11. Write accessibility property tests
  - [x] 11.1 Property test: heading hierarchy does not skip levels
    - **Property 6: Heading hierarchy does not skip levels**
    - **Validates: Requirements 6.2**

  - [x] 11.2 Property test: every non-decorative image has a text alternative
    - **Property 7: Every non-decorative image has a text alternative**
    - **Validates: Requirements 6.3**

  - [x] 11.3 Property test: body text meets the contrast threshold
    - **Property 8: Body text meets the contrast threshold**
    - **Validates: Requirements 6.4**

- [x] 12. Write styling and content-structure property tests
  - [x] 12.1 Property test: principal palette limited to four colors
    - **Property 9: Principal palette is limited to four colors**
    - **Validates: Requirements 4.2**

  - [x] 12.2 Property test: org groups and project entries are card-bounded
    - **Property 10: Organization groups and project entries are card-bounded**
    - **Validates: Requirements 4.7**

  - [x] 12.3 Property test: each org group has exactly one organization heading
    - **Property 11: Each organization group has exactly one organization heading**
    - **Validates: Requirements 9.1, 9.3**

  - [x] 12.4 Property test: every role entry is complete
    - **Property 12: Every role entry is complete**
    - **Validates: Requirements 9.2**

  - [x] 12.5 Property test: experience groups in reverse chronological order
    - **Property 13: Experience groups are in reverse chronological order**
    - **Validates: Requirements 9.5**

  - [x] 12.6 Property test: every project card is complete
    - **Property 14: Every project card is complete**
    - **Validates: Requirements 1.11**

  - [x] 12.7 Property test: every education entry is complete
    - **Property 15: Every education entry is complete**
    - **Validates: Requirements 10.1, 10.2**

- [x] 13. Write link-safety, contact, and responsiveness property tests
  - [x] 13.1 Property test: new-context links use a safe relationship
    - **Property 16: Links opening a new context use a safe relationship**
    - **Validates: Requirements 8.5**

  - [x] 13.2 Property test: every contact link has a visible label
    - **Property 17: Every contact link has a visible label**
    - **Validates: Requirements 8.4**

  - [x] 13.3 Property test: no horizontal scrolling on mobile widths
    - **Property 18: No horizontal scrolling on mobile widths**
    - Sample a minimum of 100 widths across the 320–767px range; assert `document.scrollWidth <= clientWidth`.
    - **Validates: Requirements 5.3**

- [x] 14. Write example and edge-case tests
  - [x] 14.1 Hero content example tests
    - Assert the exact name, headline, the Sales/Strategy/AI role chips, and the LinkedIn link to `linkedin.com/in/ulyssesgalli`.
    - _Requirements: 1.5, 1.6, 1.7, 8.1_

  - [x] 14.2 Experience content example tests
    - Assert the AWS group has "Sales Executive" (with "150% quota" badge) and "Program Manager", and the EPPEN JR group has the three specified roles.
    - _Requirements: 9.6, 9.7, 9.8_

  - [x] 14.3 Education content example tests
    - Assert UNIFESP (with its subtitle), FGV, and LMU München are present.
    - _Requirements: 10.3, 10.4, 10.5_

  - [x] 14.4 Palette and focus example tests
    - Assert `--color-primary` is navy and `--color-bg` is cream, chip border/badge use the gold accent, `html[lang]` is set, and `:focus-visible` styles are defined.
    - _Requirements: 4.3, 4.4, 6.1, 6.5_

  - [x] 14.5 Responsive and interaction edge-case tests
    - Assert Mobile_Layout at 767px and Desktop_Layout at 768px, computed body font-size ≥ 16px on mobile, and that anchor activation updates `location.hash` and moves focus to the target section.
    - _Requirements: 3.2, 3.3, 5.1, 5.2, 5.4_

- [x] 15. Write integration and measurement checks
  - [x] 15.1 Asset-size check
    - Assert combined transferred CSS + JS size ≤ 150 KB, excluding images and fonts.
    - _Requirements: 7.2_

  - [x] 15.2 Static-hosting and render smoke check
    - Assert `index.html` opened directly renders all sections with no server and no build, and that section text appears before non-essential media.
    - _Requirements: 2.2, 2.3, 7.1, 7.3_

- [x] 16. Final checkpoint - ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional (tests and verification) and can be skipped for a faster MVP.
- Each task references specific requirements for traceability; property-test tasks reference their design property number.
- The design has a Correctness Properties section, so Properties 1–18 are encoded as property tests; example and integration tests complement them per the Testing Strategy.
- Live-site content is in Portuguese; identifiers and structure follow the design's English conventions.
- Checkpoints provide incremental validation at natural breaks.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "2.2", "3.1", "4.1", "4.2", "4.3"] },
    { "id": 2, "tasks": ["6.1"] },
    { "id": 3, "tasks": ["6.2", "7.1", "7.2"] },
    { "id": 4, "tasks": ["8.1", "8.2"] },
    { "id": 5, "tasks": ["9.1"] },
    { "id": 6, "tasks": ["10.1", "10.2", "10.3", "10.4", "10.5", "11.1", "11.2", "11.3", "12.1", "12.2", "12.3", "12.4", "12.5", "12.6", "12.7", "13.1", "13.2", "13.3", "14.1", "14.2", "14.3", "14.4", "14.5", "15.1", "15.2"] }
  ]
}
```
