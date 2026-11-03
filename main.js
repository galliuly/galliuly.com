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

// ---------------------------------------------------------------------------
// Certifications carousel (progressive enhancement).
//
// The HTML holds one list of badges in a sideways-scrollable strip. Here we:
//   - append an aria-hidden duplicate of the list, so the strip loops forever
//     (positions are kept inside the first copy, and the second copy makes the
//     jump back invisible);
//   - auto-advance the strip slowly, pausing only while offscreen, during
//     keyboard focus, and while the visitor drags or swipes it;
//   - let the visitor drag the strip with the mouse to browse faster (touch
//     screens use their native swipe). When the drag ends, the auto-advance
//     resumes right away from where they let go.
// A drag never opens the Credly link; only a plain click does.
// prefers-reduced-motion: no auto-advance; dragging still works.
// Every lookup is guarded; any failure leaves the static, scrollable strip.
// ---------------------------------------------------------------------------
(function () {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  var SPEED = 0.03; // auto-advance, in pixels per millisecond (~30px/s)
  var DRAG_THRESHOLD = 5; // px a press must move before it counts as a drag
  var SETTLE_TIME = 200; // ms of quiet after a swipe/trackpad scroll before resuming

  function now() {
    return window.performance && typeof window.performance.now === "function"
      ? window.performance.now()
      : Date.now();
  }

  function initCertCarousel() {
    var root = document.querySelector("[data-cert-carousel]");
    if (!root) {
      return;
    }

    var viewport = root.querySelector(".cert-viewport");
    var track = root.querySelector("[data-cert-track]");
    var list = track ? track.querySelector(".cert-list") : null;
    if (!viewport || !list || track.querySelectorAll(".cert-list").length > 1) {
      return; // missing markup, or already initialized
    }

    var prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var copy = list.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    track.appendChild(copy);
    root.classList.add("is-enhanced");
    if (!prefersReduced) {
      track.classList.add("is-animated");
    }

    // Width of one copy of the list (it carries trailing padding equal to the
    // gap, so two copies side by side repeat exactly).
    function period() {
      return list.offsetWidth;
    }

    // Bring a scroll position back inside the first copy.
    function wrap(value) {
      var p = period();
      if (p <= 0) {
        return value;
      }
      while (value >= p) {
        value -= p;
      }
      while (value < 0) {
        value += p;
      }
      return value;
    }

    var pos = 0; // float position, so slow speeds are not lost to rounding
    var resumeAt = 0;
    var focused = false;
    var visible = true;
    var touching = false;
    var dragging = false;
    var dragMoved = false;
    var dragStartX = 0;
    var dragStartLeft = 0;

    // The browser's own image/link dragging would fight the custom drag.
    Array.prototype.forEach.call(track.querySelectorAll("img"), function (img) {
      img.setAttribute("draggable", "false");
    });
    var link = root.querySelector(".cert-carousel-link");
    if (link) {
      link.addEventListener("dragstart", function (event) {
        event.preventDefault();
      });
      // A press that turned into a drag must not open Credly.
      link.addEventListener("click", function (event) {
        if (dragMoved) {
          event.preventDefault();
          event.stopPropagation();
          dragMoved = false;
        }
      }, true);
    }

    // Mouse drag. Touch and pen keep the native swipe (handled below).
    viewport.addEventListener("pointerdown", function (event) {
      if (event.pointerType !== "mouse" || event.button !== 0) {
        return;
      }
      dragging = true;
      dragMoved = false;
      dragStartX = event.clientX;
      dragStartLeft = viewport.scrollLeft;
    });

    viewport.addEventListener("pointermove", function (event) {
      if (!dragging) {
        return;
      }
      var dx = event.clientX - dragStartX;
      if (!dragMoved) {
        if (Math.abs(dx) < DRAG_THRESHOLD) {
          return; // still just a click
        }
        dragMoved = true;
        root.classList.add("is-dragging");
        try {
          viewport.setPointerCapture(event.pointerId);
        } catch (err) {
          // Capture is a nicety; the drag still works without it.
        }
      }
      // Wrapping keeps the drag endless in both directions.
      pos = wrap(dragStartLeft - dx);
      viewport.scrollLeft = pos;
    });

    function endDrag() {
      if (!dragging) {
        return;
      }
      dragging = false;
      root.classList.remove("is-dragging");
      resumeAt = 0; // continue the auto-advance right away
      if (dragMoved) {
        // The click that follows the release (same task) is still blocked;
        // after that, the link works normally again (e.g. keyboard Enter).
        window.setTimeout(function () {
          dragMoved = false;
        }, 0);
      }
    }
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("lostpointercapture", endDrag);
    window.addEventListener("pointerup", endDrag); // released outside the strip

    // Touch swipe: pause while the finger is down, resume once it settles.
    viewport.addEventListener("touchstart", function () {
      touching = true;
    }, { passive: true });
    function endTouch() {
      touching = false;
      resumeAt = now() + SETTLE_TIME;
    }
    viewport.addEventListener("touchend", endTouch, { passive: true });
    viewport.addEventListener("touchcancel", endTouch, { passive: true });

    // Pause for keyboard focus only (a mouse click on the link focuses it in
    // some browsers, and that should not freeze the strip).
    root.addEventListener("focusin", function (event) {
      var target = event.target;
      try {
        focused = !!(target && target.matches && target.matches(":focus-visible"));
      } catch (err) {
        focused = true; // old browser without :focus-visible
      }
    });
    root.addEventListener("focusout", function () {
      focused = false;
    });

    viewport.addEventListener("scroll", function () {
      var left = viewport.scrollLeft;
      // A scroll we did not cause (swipe momentum, trackpad): let it settle
      // before the auto-advance takes over again.
      if (!dragging && Math.abs(left - pos) > 2) {
        resumeAt = now() + SETTLE_TIME;
      }
      // Keep the loop seamless when a swipe runs past the first copy.
      if (left >= period()) {
        viewport.scrollLeft = left - period();
      }
    }, { passive: true });

    if (typeof window.IntersectionObserver === "function") {
      new window.IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          visible = entries[i].isIntersecting;
        }
      }).observe(root);
    }

    if (prefersReduced || typeof window.requestAnimationFrame !== "function") {
      return; // dragging only, no auto-advance
    }

    var last = null;
    function frame(time) {
      var dt = last === null ? 0 : Math.min(time - last, 64);
      last = time;

      var running = visible && !focused && !dragging && !touching && time >= resumeAt;
      if (running) {
        pos = wrap(pos + dt * SPEED);
        viewport.scrollLeft = pos;
      } else {
        pos = viewport.scrollLeft; // pick up wherever the visitor left it
      }
      window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCertCarousel);
  } else {
    initCertCarousel();
  }
})();

// ---------------------------------------------------------------------------
// Tagline word-by-word reveal (progressive enhancement).
//
// The authored tagline is plain text at full color (also the no-JS view). Here
// each word is wrapped in .tagline-word, which CSS mutes. As the visitor
// scrolls the tagline up past a trigger line, words light up one at a time in
// reading order. Progress only moves forward, so words never dim again.
//   - Scroll work is throttled through requestAnimationFrame.
//   - After a language switch (the "i18n:applied" event), the new text is
//     re-split and keeps the progress already reached.
//   - prefers-reduced-motion: the text is left as is, at full color.
// ---------------------------------------------------------------------------
(function () {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  var prefersReduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    return;
  }

  var TRIGGER = 0.8; // trigger line, as a fraction of the viewport height
  var STRETCH = 0.35; // extra scroll (in viewport heights) the reveal spreads over

  var el = null;
  var words = [];
  var progress = 0; // 0..1, highest point reached
  var ticking = false;

  function build() {
    el = document.querySelector("[data-tagline]");
    if (!el) {
      return;
    }
    var text = (el.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) {
      return;
    }

    el.textContent = "";
    words = [];
    var parts = text.split(" ");
    for (var i = 0; i < parts.length; i++) {
      var span = document.createElement("span");
      span.className = "tagline-word";
      span.textContent = parts[i];
      el.appendChild(span);
      words.push(span);
      if (i < parts.length - 1) {
        el.appendChild(document.createTextNode(" "));
      }
    }
    paint();
    update();
  }

  function paint() {
    var lit = Math.floor(progress * words.length);
    for (var i = 0; i < words.length; i++) {
      if (i < lit) {
        words[i].classList.add("is-lit");
      }
    }
  }

  function update() {
    if (!el || words.length === 0 || progress >= 1) {
      return;
    }
    var rect = el.getBoundingClientRect();
    var viewport = window.innerHeight || document.documentElement.clientHeight;
    var trigger = viewport * TRIGGER;
    var span = rect.height + viewport * STRETCH;
    var current = (trigger - rect.top) / span;
    if (current > progress) {
      progress = Math.min(1, current);
      paint();
    }
  }

  function onScroll() {
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      update();
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  document.addEventListener("i18n:applied", build);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
