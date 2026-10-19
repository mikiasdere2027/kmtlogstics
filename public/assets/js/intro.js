// KMT logo intro (home page, once per session).
// Flat top-view truck drives in → camera turns while every part morphs into its side-view logo piece →
// arrow, speed bar and wheel land → "KMT Logistics" reveals → the whole logo flies onto the header logo.
// Loaded by the inline script in <head> only when the intro should play; GSAP + MorphSVG load just before this.
(function () {
  var html = document.documentElement;

  function cleanup(root) {
    if (root && root.parentNode) root.parentNode.removeChild(root);
    html.classList.remove("intro-on", "intro-logo-hidden", "intro-forced");
  }

  // Scripts are injected from <head>, so wait for the markup (first element in <body>) and the engine.
  function boot(tries) {
    var root = document.getElementById("intro");
    if (root && window.gsap && window.MorphSVGPlugin) return start(root);
    if (tries > 150) return cleanup(root); // ~2.5 s: give up quietly, the site is untouched
    setTimeout(function () { boot(tries + 1); }, 16);
  }

  function start(root) {
    var gsap = window.gsap;
    gsap.registerPlugin(window.MorphSVGPlugin);
    root.style.animation = "none"; // we're in control now; cancel the CSS failsafe
    try { sessionStorage.setItem("kmt-intro", "1"); } catch (e) {}

    var q = function (s) { return root.querySelector(s); };
    var qa = function (s) { return root.querySelectorAll(s); };
    var stage = q(".intro__stage"), cam = q(".intro__cam"), svg = q(".intro__svg");
    var bg = q(".intro__bg"), glow = q(".intro__glow"), lines = q(".intro__lines");
    var blurEl = q("#intro-blur feGaussianBlur"), clipRect = q("#intro-clip rect");
    var vw = window.innerWidth;
    var handing = false, done = false;

    // ---- speed lines: two depths of streaks rushing past while the truck drives in
    var lineTweens = [];
    for (var i = 0; i < 22; i++) {
      var near = i % 3 === 0;
      var el = document.createElement("span");
      el.className = "intro__line";
      el.style.top = (6 + Math.random() * 88) + "%";
      el.style.width = (near ? 180 + Math.random() * 220 : 60 + Math.random() * 140) + "px";
      el.style.opacity = near ? 0.5 : 0.18;
      lines.appendChild(el);
      var tw = gsap.fromTo(el, { x: vw + 40 }, {
        x: -460, duration: near ? 0.34 + Math.random() * 0.14 : 0.7 + Math.random() * 0.35,
        ease: "none", repeat: -1
      });
      tw.progress(Math.random());
      lineTweens.push(tw);
    }

    // ---- horizontal motion blur (SVG filter), strongest at top speed
    var blur = { v: 0 };
    var setBlur = function () { blurEl.setAttribute("stdDeviation", blur.v.toFixed(2) + " 0"); };

    // ---- start state: the icon (and the top view drawn around it) sits at screen centre
    gsap.set(svg, { xPercent: -34.77 });               // (0.5 − icon centre 424.95 / 501.3) of the logo width
    gsap.set(cam, { transformPerspective: 900, transformOrigin: "50% 50%" });
    gsap.set(".intro__svg .i-arrow", { transformOrigin: "100% 100%" });
    gsap.set(".intro__svg .i-streak", { transformOrigin: "100% 50%" });
    gsap.set(".intro__svg .i-letter", { opacity: 0, y: 18 });

    var tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });
    root.__tl = tl; // handy for debugging / automated checks

    // 1) Drive in: fast entry, long soft brake into the centre
    tl.fromTo(cam, { x: -1.2 * vw }, { x: 0, duration: 0.95, ease: "power4.out" }, 0)
      .fromTo(blur, { v: 24 }, { v: 0, duration: 0.7, ease: "power3.out", onUpdate: setBlur }, 0)
      .to(lines, { opacity: 0, duration: 0.45, ease: "power1.out" }, 0.75)
      .add(function () { lineTweens.forEach(function (t) { t.kill(); }); }, 1.25)
      // tiny forward settle as it stops
      .fromTo(cam, { scaleX: 1.04 }, { scaleX: 1, duration: 0.45, ease: "elastic.out(1, 0.6)" }, 0.62);

    // 2) The turn: camera tilts (3D) while every top-view part morphs into its side-view piece
    tl.to(cam, { rotationX: 64, scale: 0.94, duration: 0.4, ease: "power2.in" }, 0.75)
      .to(cam, { rotationX: 0, scale: 1, duration: 0.6, ease: "power3.out" }, 1.15)
      .to(".intro__svg .i-mirror", { opacity: 0, duration: 0.25, ease: "power1.out" }, 0.8);
    qa(".i-morph").forEach(function (p, idx) {
      tl.to(p, { morphSVG: { shape: p.getAttribute("data-to"), type: "linear" }, duration: 0.85, ease: "power3.inOut" }, 0.78 + (idx % 4) * 0.025);
    });
    tl.to(".intro__svg .i-speed, .intro__svg .i-light", { fill: "#ffffff", duration: 0.6, ease: "power1.inOut" }, 0.95);

    // 3) Build: glow, arrow snaps on, speed bar kicks forward with streaks, wheel lands
    tl.fromTo(glow, { opacity: 0, scale: 0.5 }, { opacity: 0.95, scale: 1.15, duration: 0.5, ease: "power2.out" }, 1.25)
      .to(glow, { opacity: 0.35, scale: 1, duration: 0.7, ease: "power2.inOut" }, 1.75)
      .fromTo(".intro__svg .i-arrow", { opacity: 0, scale: 0, rotation: -40 },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2.4)" }, 1.48)
      .fromTo(".intro__svg .i-speed", { x: -16 }, { x: 0, duration: 0.5, ease: "back.out(3)" }, 1.56)
      .fromTo(".intro__svg .i-streak", { opacity: 0, scaleX: 0.2 },
        { opacity: 1, scaleX: 2.8, duration: 0.24, ease: "power2.out", stagger: 0.05 }, 1.54)
      .to(".intro__svg .i-streak", { opacity: 0, scaleX: 0.4, duration: 0.35, ease: "power2.in" }, 1.8)
      .fromTo(".intro__svg .i-wheel", { y: -6 }, { y: 0, duration: 0.55, ease: "bounce.out" }, 1.6);

    // 4) Lockup: icon glides right while the wordmark wipes in and letters rise, then a sheen sweeps across
    tl.to(svg, { xPercent: 0, duration: 0.9, ease: "expo.inOut" }, 2.1)
      .to(glow, { opacity: 0, duration: 0.5, ease: "power1.out" }, 2.15)
      .fromTo(clipRect, { attr: { width: 0 } }, { attr: { width: 380 }, duration: 0.85, ease: "power3.out" }, 2.25)
      .to(".intro__svg .i-letter", { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.045 }, 2.25)
      .fromTo(".intro__svg .i-sheen", { attr: { x: -160 } }, { attr: { x: 540 }, duration: 0.8, ease: "power2.inOut" }, 2.75);

    // 5) Hand-off to the header logo
    tl.call(function () { handoff(false); }, null, 3.15);

    function handoff(fast) {
      if (handing) return;
      handing = true;
      root.style.pointerEvents = "none";
      var dur = fast ? 0.45 : 0.75;
      var target = document.querySelector(".site-header .logo__img");
      gsap.to([glow, lines], { opacity: 0, duration: 0.2 });
      gsap.to(bg, { opacity: 0, duration: dur * 0.8, ease: "power2.inOut", delay: dur * 0.25 });
      if (target && target.getBoundingClientRect().width > 0) {
        var a = svg.getBoundingClientRect(), t = target.getBoundingClientRect();
        gsap.to(stage, {
          x: (t.left + t.width / 2) - (a.left + a.width / 2),
          y: (t.top + t.height / 2) - (a.top + a.height / 2),
          scale: t.width / a.width, duration: dur, ease: "expo.inOut", transformOrigin: "50% 50%"
        });
        // the moment it lands: header logo fades in underneath while the intro logo fades out (seamless swap)
        gsap.delayedCall(dur * 0.85, function () {
          html.classList.remove("intro-logo-hidden");
          gsap.to(stage, { opacity: 0, duration: 0.22, ease: "power1.out" });
        });
      } else {
        gsap.to(stage, { opacity: 0, scale: 0.96, duration: dur, ease: "power2.inOut" });
        gsap.delayedCall(dur * 0.6, function () { html.classList.remove("intro-logo-hidden"); });
      }
      gsap.delayedCall(dur + 0.3, finish);
    }

    function finish() {
      if (done) return;
      done = true;
      tl.kill();
      lineTweens.forEach(function (t) { t.kill(); });
      cleanup(root);
    }

    // Skip: jump to the finished logo (no callbacks) and fly it home quickly
    function skip() {
      if (handing) return;
      tl.pause();
      tl.progress(1, true);
      lineTweens.forEach(function (t) { t.kill(); });
      blur.v = 0; setBlur();
      handoff(true);
    }
    root.addEventListener("click", skip);
    document.addEventListener("keydown", skip, { once: true });
    gsap.delayedCall(8, finish); // last-resort safety net
  }

  boot(0);
})();
