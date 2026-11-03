// main.js — Progressive enhancement for the portfolio website.
//
// Responsibility (task 8.1): anchor focus management. When a Navigation_Bar
// Anchor_Link (an in-page link whose href starts with "#") is activated, move
// keyboard focus to the target section after letting the browser update the
// hash. CSS handles the visual scroll (scroll-behavior: smooth); here we only
// add the focus move that anchors alone cannot guarantee across browsers.
//
// This script is non-essential. All section text and links are authored
// directly in HTML, and basic hash navigation plus smooth scrolling work with
// scripting disabled. Every DOM lookup is guarded so a missing element can
// never break the page. The <script> tag is loaded with `defer`.
//
// Active-link highlighting (IntersectionObserver) is added in task 8.2.

"use strict";

(function () {
  // Guard: in a non-browser or stripped-down environment, do nothing.
  if (typeof document === "undefined") {
    return;
  }

  /**
   * Resolve a hash fragment (e.g. "#experience") to its target element and
   * move keyboard focus to it. Returns true when focus was moved.
   *
   * @param {string} hash - The link's hash, including the leading "#".
   * @returns {boolean}
   */
  function focusTargetForHash(hash) {
    // A bare "#" or empty fragment has no target to focus.
    if (!hash || hash === "#") {
      return false;
    }

    var target;
    try {
      target = document.querySelector(hash);
    } catch (err) {
      // An invalid selector (malformed id) must not break navigation.
      return false;
    }

    if (!target) {
      return false;
    }

    // Make the section programmatically focusable without adding it to the
    // tab order. Only set tabindex if the author did not already provide one.
    if (!target.hasAttribute("tabindex")) {
      target.setAttribute("tabindex", "-1");
    }

    // Move focus without triggering a second, competing scroll jump — CSS
    // smooth-scroll animates the actual scroll from the hash change.
    try {
      target.focus({ preventScroll: true });
    } catch (err) {
      // Older browsers reject the options object; fall back to a plain focus.
      target.focus();
    }

    return true;
  }

  function init() {
    var nav = document.querySelector('header nav');
    if (!nav) {
      return;
    }

    var anchors = nav.querySelectorAll('a[href^="#"]');
    if (!anchors || anchors.length === 0) {
      return;
    }

    Array.prototype.forEach.call(anchors, function (anchor) {
      anchor.addEventListener("click", function () {
        // Read the resolved fragment from the anchor itself. We do not
        // preventDefault: the browser updates location.hash and CSS performs
        // the smooth scroll. We only add the focus move afterward.
        var hash = anchor.hash || "";

        // Defer the focus move so it runs after the browser has processed the
        // default hash navigation, avoiding a competing scroll.
        if (typeof window !== "undefined" &&
            typeof window.requestAnimationFrame === "function") {
          window.requestAnimationFrame(function () {
            focusTargetForHash(hash);
          });
        } else {
          focusTargetForHash(hash);
        }
      });
    });
  }

  // The script is deferred, so the DOM is typically parsed by the time it runs.
  // Guard against the rare case where it executes before DOMContentLoaded.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

// ---------------------------------------------------------------------------
// Task 8.2 — Active-link highlighting (cosmetic).
//
// As the visitor scrolls, mark the Navigation_Bar Anchor_Link whose target
// section is currently most prominent in the viewport with an "is-active"
// state (styles.css draws the gold underline). This is purely cosmetic.
//
// Progressive enhancement, independent of task 8.1's focus management:
//   - Feature-detect IntersectionObserver; if unavailable, do nothing.
//   - Guard every DOM lookup so a missing nav or section can never throw.
//   - We only add/remove a class on nav anchors; no scroll, focus, or hash
//     behavior is touched, so this never interferes with task 8.1.
// ---------------------------------------------------------------------------
(function () {
  // Guard: non-browser environment, or no IntersectionObserver support.
  if (typeof document === "undefined" ||
      typeof window === "undefined" ||
      typeof window.IntersectionObserver !== "function") {
    return;
  }

  var ACTIVE_CLASS = "is-active";

  function initActiveLinks() {
    var nav = document.querySelector("header nav");
    if (!nav) {
      return;
    }

    var anchors = nav.querySelectorAll('a[href^="#"]');
    if (!anchors || anchors.length === 0) {
      return;
    }

    // Build a map from a section element to its matching nav anchor, and
    // collect the sections we can actually observe. Only in-page anchors that
    // resolve to a real section are considered.
    var sectionToAnchor = [];
    var sections = [];

    Array.prototype.forEach.call(anchors, function (anchor) {
      var hash = anchor.hash || "";
      if (!hash || hash === "#") {
        return;
      }

      var section;
      try {
        section = document.querySelector(hash);
      } catch (err) {
        // Malformed selector — skip this anchor, never throw.
        return;
      }

      if (!section) {
        return;
      }

      sectionToAnchor.push({ section: section, anchor: anchor });
      sections.push(section);
    });

    if (sections.length === 0) {
      return;
    }

    /**
     * Look up the nav anchor paired with a given section element.
     * @param {Element} section
     * @returns {Element|null}
     */
    function anchorForSection(section) {
      for (var i = 0; i < sectionToAnchor.length; i++) {
        if (sectionToAnchor[i].section === section) {
          return sectionToAnchor[i].anchor;
        }
      }
      return null;
    }

    /** Clear the active state from every tracked nav anchor. */
    function clearActive() {
      Array.prototype.forEach.call(anchors, function (anchor) {
        anchor.classList.remove(ACTIVE_CLASS);
        anchor.removeAttribute("aria-current");
      });
    }

    /**
     * Mark exactly one nav anchor active, clearing the rest.
     * @param {Element} anchor
     */
    function setActive(anchor) {
      if (!anchor || anchor.classList.contains(ACTIVE_CLASS)) {
        // Already active (or nothing to do) — avoid redundant DOM writes.
        if (!anchor) {
          return;
        }
      }
      clearActive();
      anchor.classList.add(ACTIVE_CLASS);
      anchor.setAttribute("aria-current", "true");
    }

    // Track the current intersection ratio of each observed section so we can
    // pick the single most prominent one as entries fire over time.
    var ratios = new WeakMap();

    function updateActiveFromRatios() {
      var best = null;
      var bestRatio = 0;

      for (var i = 0; i < sections.length; i++) {
        var r = ratios.get(sections[i]) || 0;
        if (r > bestRatio) {
          bestRatio = r;
          best = sections[i];
        }
      }

      // Nothing meaningfully in view (e.g. scrolled above the first section):
      // leave the last active link as-is rather than flickering to none.
      if (!best) {
        return;
      }

      var anchor = anchorForSection(best);
      if (anchor) {
        setActive(anchor);
      }
    }

    var observer = new window.IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          ratios.set(
            entry.target,
            entry.isIntersecting ? entry.intersectionRatio : 0
          );
        }
        updateActiveFromRatios();
      },
      {
        // A band through the vertical middle of the viewport: a section is
        // "in view" when it crosses the center area, which tracks the reading
        // position better than top/bottom edges.
        rootMargin: "-45% 0px -45% 0px",
        threshold: [0, 0.01, 0.25, 0.5, 0.75, 1]
      }
    );

    for (var j = 0; j < sections.length; j++) {
      observer.observe(sections[j]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initActiveLinks);
  } else {
    initActiveLinks();
  }
})();

// ---------------------------------------------------------------------------
// Scroll-reveal motion (progressive enhancement).
//
// As the visitor scrolls, each content section eases into view (fade + slide
// up); its cards/entries cascade in via CSS. This is purely cosmetic and fully
// optional:
//   - All content is authored directly in HTML and is visible with scripting
//     disabled; the "hidden" state only exists once JS adds the .reveal class,
//     so this never hides content (Req 2.4).
//   - Feature-detect IntersectionObserver; if unavailable, add .reveal.is-visible
//     immediately so content is shown with no animation.
//   - Honor prefers-reduced-motion: skip the hidden state entirely.
//   - Every DOM lookup is guarded so it can never throw.
// ---------------------------------------------------------------------------
(function () {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  function initReveal() {
    var main = document.querySelector("main");
    if (!main) {
      return;
    }

    // Reveal the content sections (the hero is already in view on load, so it
    // is left untouched to avoid a flash on first paint).
    var targets = main.querySelectorAll(
      "section#about, section#experience, section#education, section#projects, section#contact"
    );
    if (!targets || targets.length === 0) {
      return;
    }

    var prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // No observer support, or the visitor prefers reduced motion: show
    // everything immediately with no animated hidden state.
    if (
      prefersReduced ||
      typeof window.IntersectionObserver !== "function"
    ) {
      Array.prototype.forEach.call(targets, function (el) {
        el.classList.add("reveal", "is-visible");
      });
      return;
    }

    // Mark targets as revealable (CSS puts them in the hidden start state),
    // then observe them and flip to visible as they enter the viewport.
    Array.prototype.forEach.call(targets, function (el) {
      el.classList.add("reveal");
    });

    var observer = new window.IntersectionObserver(
      function (entries, obs) {
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            // Once revealed, stop observing so it never re-hides.
            obs.unobserve(entry.target);
          }
        }
      },
      {
        // Trigger a little before the section fully enters, so the motion
        // feels anticipatory rather than late.
        root: null,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.12
      }
    );

    Array.prototype.forEach.call(targets, function (el) {
      observer.observe(el);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReveal);
  } else {
    initReveal();
  }
})();
