// typewriter.js — Hero headline typewriter effect (progressive enhancement).
//
// Rotates through a set of phrases in the hero headline, typing each one out,
// pausing, deleting it, and moving to the next — in a randomized order that is
// reshuffled each full cycle so the sequence does not repeat predictably.
//
// Progressive enhancement and accessibility:
//   - The static headline (.hero-headline-static) is the authored, accessible
//     text and is shown with JavaScript disabled (Req 2.4). This script only
//     activates the animation by adding .has-typewriter, which hides the static
//     text and reveals the animated span.
//   - The animated span is aria-hidden, so screen readers are not spammed with
//     constantly changing text; the real headline remains the accessible one
//     (it is hidden visually via CSS but the typewriter span is the decorative
//     layer).
//   - prefers-reduced-motion: skip the animation entirely and leave the static
//     headline in place.
//   - Every DOM lookup is guarded; any failure leaves the static headline.

"use strict";

(function () {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  // The rotating phrases (proper nouns / skills — intentionally not translated,
  // consistent with role titles elsewhere on the page).
  var PHRASES = [
    "Amazon",
    "Amazon Web Services",
    "AWS Certified",
    "Ex-Startups",
    "International Relations",
    "UNIFESP",
    "FGV",
    "Sales",
    "AI",
    "Strategy",
    "Consulting",
    "Relationship building",
    "Program Management",
    "Project Management"
  ];

  // Timing (ms).
  var TYPE_SPEED = 70; // per character while typing
  var DELETE_SPEED = 40; // per character while deleting
  var HOLD_FULL = 1300; // pause with the full phrase shown
  var HOLD_EMPTY = 300; // pause after clearing, before the next phrase

  /** Fisher–Yates shuffle, returning a new array (does not mutate input). */
  function shuffled(list) {
    var arr = list.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function init() {
    var headline = document.querySelector(".hero-headline");
    if (!headline) {
      return;
    }

    var typewriter = headline.querySelector(".hero-typewriter");
    var textEl = headline.querySelector(".hero-typewriter-text");
    if (!typewriter || !textEl) {
      return;
    }

    var prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reveal the typewriter span (remove the [hidden] fallback attribute) and
    // flag the headline so CSS hides the static text and shows the animation.
    function activate() {
      typewriter.removeAttribute("hidden");
      headline.classList.add("has-typewriter");
    }

    // Reduced motion: show a single steady phrase, no typing/deleting loop.
    if (prefersReduced) {
      activate();
      textEl.textContent = shuffled(PHRASES)[0];
      return;
    }

    activate();

    var order = shuffled(PHRASES);
    var phraseIndex = 0;
    var charCount = 0;
    var deleting = false;

    function tick() {
      var phrase = order[phraseIndex];

      if (!deleting) {
        // Typing forward.
        charCount++;
        textEl.textContent = phrase.slice(0, charCount);

        if (charCount >= phrase.length) {
          // Full phrase shown — hold, then start deleting.
          deleting = true;
          window.setTimeout(tick, HOLD_FULL);
          return;
        }
        window.setTimeout(tick, TYPE_SPEED);
        return;
      }

      // Deleting.
      charCount--;
      textEl.textContent = phrase.slice(0, Math.max(0, charCount));

      if (charCount <= 0) {
        // Cleared — advance to the next phrase, reshuffling at cycle end.
        deleting = false;
        charCount = 0;
        phraseIndex++;
        if (phraseIndex >= order.length) {
          order = shuffled(PHRASES);
          phraseIndex = 0;
        }
        window.setTimeout(tick, HOLD_EMPTY);
        return;
      }
      window.setTimeout(tick, DELETE_SPEED);
    }

    // Kick off the loop.
    window.setTimeout(tick, HOLD_EMPTY);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
