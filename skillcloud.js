// skillcloud.js — Rotating 3D skill sphere (progressive enhancement).
//
// Lays the .skill labels out on a sphere and spins it continuously. The sphere
// responds to the pointer (moving the mouse over the cloud steers the rotation
// axis and speed) and to the mouse wheel (scrolling gives the spin a push).
// Labels nearer the viewer are larger and more opaque; the one under the
// pointer highlights in gold.
//
// Accessibility / progressive enhancement:
//   - The authored .skill-list is a plain, readable list and is what shows with
//     JavaScript disabled (Req 2.4). This script only enhances it into the
//     animated sphere by adding .is-active.
//   - prefers-reduced-motion: do nothing — the static list remains.
//   - IntersectionObserver pauses the animation when the section is offscreen
//     (saves CPU) and resumes it when visible; if unavailable, it just runs.
//   - Every DOM/measure step is guarded; any failure leaves the readable list.
//   - Wheel handling never calls preventDefault, so page scrolling is unaffected.

"use strict";

(function () {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  var prefersReduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function init() {
    var cloud = document.querySelector("[data-skillcloud]");
    if (!cloud) {
      return;
    }
    if (prefersReduced) {
      return; // keep the readable list, no sphere
    }

    var items = Array.prototype.slice.call(cloud.querySelectorAll(".skill"));
    if (items.length === 0) {
      return;
    }

    var n = items.length;

    // Distribute n points evenly on a unit sphere (Fibonacci sphere), giving
    // each label a stable direction vector (x, y, z) in [-1, 1].
    var points = [];
    var offset = 2 / n;
    var increment = Math.PI * (3 - Math.sqrt(5)); // golden angle
    for (var i = 0; i < n; i++) {
      var y = i * offset - 1 + offset / 2;
      var r = Math.sqrt(Math.max(0, 1 - y * y));
      var phi = i * increment;
      points.push({
        x: Math.cos(phi) * r,
        y: y,
        z: Math.sin(phi) * r
      });
    }

    // Stage sizing: a square-ish area that scales with viewport width but is
    // capped so it stays tasteful on desktop.
    var radius = 0;
    function sizeStage() {
      var width = cloud.clientWidth || 320;
      radius = Math.max(90, Math.min(width, 640) * 0.38);
      // Height = diameter plus padding for the largest labels.
      cloud.style.height = Math.round(radius * 2 + 72) + "px";
    }

    cloud.classList.add("is-active");
    sizeStage();

    // Rotation state. Angular velocity around X and Y axes (radians/frame-ish).
    var angleX = 0;
    var angleY = 0;
    var velX = 0.002; // gentle default drift
    var velY = 0.004;

    // Pointer steering: when the mouse is over the cloud, bias the velocity
    // toward the pointer's offset from center.
    var pointerActive = false;

    function onPointerMove(e) {
      var rect = cloud.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      // Normalized offset in [-1, 1].
      var dx = (e.clientX - cx) / (rect.width / 2);
      var dy = (e.clientY - cy) / (rect.height / 2);
      // Horizontal mouse movement spins around Y; vertical around X.
      velY = dx * 0.03;
      velX = -dy * 0.03;
      pointerActive = true;
    }

    function onPointerLeave() {
      pointerActive = false;
      // Ease back toward the gentle default drift (handled in the loop).
    }

    // Wheel over the cloud gives the spin a push, scaled by scroll delta.
    // We do NOT preventDefault, so the page still scrolls normally.
    function onWheel(e) {
      var delta = e.deltaY || 0;
      velY += delta * 0.00008;
      velX += delta * 0.00003;
    }

    cloud.addEventListener("mousemove", onPointerMove);
    cloud.addEventListener("mouseleave", onPointerLeave);
    cloud.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("resize", sizeStage);

    // Highlight the label under the pointer.
    items.forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        el.classList.add("is-hot");
      });
      el.addEventListener("mouseleave", function () {
        el.classList.remove("is-hot");
      });
    });

    function render() {
      // Ease non-pointer drift back to a slow idle spin so it never fully stops.
      if (!pointerActive) {
        velX += (0.0015 - velX) * 0.02;
        velY += (0.003 - velY) * 0.02;
      }

      angleX += velX;
      angleY += velY;

      var sinX = Math.sin(angleX);
      var cosX = Math.cos(angleX);
      var sinY = Math.sin(angleY);
      var cosY = Math.cos(angleY);

      var cx = cloud.clientWidth / 2;
      var cy = cloud.clientHeight / 2;

      for (var i = 0; i < n; i++) {
        var p = points[i];

        // Rotate around Y axis.
        var x1 = p.x * cosY - p.z * sinY;
        var z1 = p.x * sinY + p.z * cosY;
        // Rotate around X axis.
        var y2 = p.y * cosX - z1 * sinX;
        var z2 = p.y * sinX + z1 * cosX;

        // Project: z2 in [-1, 1]; nearer (z2 ~ 1) = larger and more opaque.
        var depth = (z2 + 1) / 2; // 0 (far) .. 1 (near)
        var scale = 0.65 + depth * 0.75; // 0.65 .. 1.4
        var opacity = 0.25 + depth * 0.75; // 0.25 .. 1

        var screenX = cx + x1 * radius;
        var screenY = cy + y2 * radius;

        var el = items[i];
        el.style.transform =
          "translate(-50%, -50%) translate(" +
          screenX.toFixed(1) +
          "px, " +
          screenY.toFixed(1) +
          "px) scale(" +
          scale.toFixed(3) +
          ")";
        el.style.opacity = opacity.toFixed(3);
        // Labels in the back sit behind those in front.
        el.style.zIndex = String(Math.round(depth * 100));
      }
    }

    // Animation loop with visibility-based pause.
    var running = true;
    var rafId = null;

    function loop() {
      if (running) {
        render();
      }
      rafId = window.requestAnimationFrame(loop);
    }

    if (typeof window.IntersectionObserver === "function") {
      var io = new window.IntersectionObserver(
        function (entries) {
          for (var i = 0; i < entries.length; i++) {
            running = entries[i].isIntersecting;
          }
        },
        { threshold: 0.05 }
      );
      io.observe(cloud);
    }

    // Render one frame immediately so labels are positioned before the first
    // rAF tick (avoids a flash of stacked labels at the origin).
    render();
    loop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
