// KMT Logistics — lead forms (home contact form + freight quote form)
(function () {
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  // Navigation mega menu: hover & click operated with debounce, Escape, outside-click dismissal, and arrow alignment.
  var navMenus = []; // close() of every mega menu, so opening one closes the others
  document.querySelectorAll(".site-nav__menu").forEach(function (menu) {
    var toggle = menu.querySelector(".site-nav__menu-toggle");
    var panel = menu.querySelector(".shipper-menu");
    if (!toggle || !panel) return;
    var leaveTimer = null;

    function alignArrow() {
      if (window.innerWidth < 840) return;
      var toggleRect = toggle.getBoundingClientRect();
      var panelRect = panel.getBoundingClientRect();
      if (panelRect.width > 0) {
        var toggleCenter = toggleRect.left + (toggleRect.width / 2);
        var arrowLeft = toggleCenter - panelRect.left;
        panel.style.setProperty("--arrow-left", arrowLeft + "px");
      }
    }

    function open() {
      navMenus.forEach(function (closeOther) { if (closeOther !== close) closeOther(); });
      clearTimeout(leaveTimer);
      toggle.setAttribute("aria-expanded", "true");
      panel.hidden = false;
      alignArrow();
    }

    function close() {
      clearTimeout(leaveTimer);
      toggle.setAttribute("aria-expanded", "false");
      panel.hidden = true;
    }

    navMenus.push(close);

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      if (isOpen) { close(); } else { open(); }
    });

    // Desktop hover interaction
    menu.addEventListener("mouseenter", function () {
      if (window.innerWidth >= 840) open();
    });
    menu.addEventListener("mouseleave", function () {
      if (window.innerWidth >= 840) {
        leaveTimer = setTimeout(close, 200);
      }
    });

    window.addEventListener("resize", function () {
      if (toggle.getAttribute("aria-expanded") === "true") {
        alignArrow();
      }
    });

    // Keyboard accessibility & outside click
    document.addEventListener("click", function (event) {
      if (!menu.contains(event.target)) close();
    });
    document.addEventListener("keydown", function (event) {
      // Only the menu that was open takes focus back
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { close(); toggle.focus(); }
    });
  });

  // Home page: transparent header over the hero, solid navy once the hero has scrolled under it
  var overlayHeader = document.querySelector(".site-header--overlay");
  var heroEl = document.querySelector(".hero");
  if (overlayHeader && heroEl) {
    var ticking = false;
    var updateHeader = function () {
      ticking = false;
      var solid = heroEl.getBoundingClientRect().bottom <= overlayHeader.offsetHeight;
      overlayHeader.classList.toggle("is-solid", solid);
      // frosted glass as soon as the page moves, so hero text never shows through the menu
      overlayHeader.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    var onScroll = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateHeader); }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateHeader();
  }

  // Mobile menu (hamburger), shown below 840px
  var burger = document.querySelector(".nav-burger");
  var mobileNav = document.getElementById("mobile-nav");
  if (burger && mobileNav) {
    var setMobile = function (open) {
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      mobileNav.hidden = !open;
      document.body.classList.toggle("nav-open", open);
    };
    burger.addEventListener("click", function () {
      setMobile(burger.getAttribute("aria-expanded") !== "true");
    });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMobile(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !mobileNav.hidden) { setMobile(false); burger.focus(); }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 840 && !mobileNav.hidden) setMobile(false);
    });
  }

  var DONE = "Got it — we'll reach out within one business hour.";
  var QUOTE_FIELDS = ["originZip", "destZip", "equipment", "weight", "pickupDate", "commodity"];

  // YYYY-MM-DD for today in the visitor's timezone
  function today() {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  function initForm(form) {
    var kind = form.getAttribute("data-kind") || "contact";
    var statuses = form.querySelectorAll(".form__status");
    var submitBtn = form.querySelector('button[type="submit"]');
    var success = document.getElementById(form.getAttribute("data-success"));
    var pills = form.querySelectorAll(".pill");
    var interestInput = form.querySelector('input[name="interest"]');

    function setStatus(msg, isError) {
      statuses.forEach(function (status) {
        status.textContent = msg;
        status.classList.toggle("is-error", !!isError);
      });
    }

    function invalid(field, msg) {
      setStatus(msg, true);
      if (field) {
        field.setAttribute("aria-invalid", "true");
        field.focus();
      }
      return false;
    }

    form.addEventListener("input", function (e) { e.target.removeAttribute("aria-invalid"); });

    // Interest pills (home contact form only)
    function pickInterest(label) {
      if (!interestInput) return;
      pills.forEach(function (p) { p.setAttribute("aria-pressed", String(p.textContent.trim() === label)); });
      interestInput.value = label;
    }
    if (pills.length) {
      pills.forEach(function (p) {
        p.addEventListener("click", function () { pickInterest(p.textContent.trim()); });
      });
      // Links like "Apply for a truck" preselect an interest before scrolling to the form
      document.querySelectorAll("[data-interest]").forEach(function (a) {
        a.addEventListener("click", function () { pickInterest(a.getAttribute("data-interest")); });
      });
      // Service pages link here as /?interest=Dispatch#contact
      var fromUrl = new URLSearchParams(location.search).get("interest");
      if (fromUrl && [].some.call(pills, function (p) { return p.textContent.trim() === fromUrl; })) {
        pickInterest(fromUrl);
      }
    }

    var stepOne = form.querySelector('[data-form-step="1"]');
    var stepTwo = form.querySelector('[data-form-step="2"]');
    var nextStep = form.querySelector("[data-next-step]");
    var prevStep = form.querySelector("[data-prev-step]");
    function showStep(number) {
      if (!stepOne || !stepTwo) return;
      stepOne.hidden = number !== 1;
      stepTwo.hidden = number !== 2;
      if (number === 2) stepTwo.querySelector("input, textarea").focus();
    }
    if (nextStep) nextStep.addEventListener("click", function () {
      var e = form.elements;
      if (!interestInput || !interestInput.value) return invalid(null, "Choose the service you’re interested in.");
      if (interestInput.value !== "Ship freight" && !e.setup.value) return invalid(e.setup, "Tell us about your current setup.");
      if (interestInput.value !== "Ship freight" && !e.authority.value) return invalid(e.authority, "Choose your authority status.");
      setStatus("", false);
      showStep(2);
    });
    if (prevStep) prevStep.addEventListener("click", function () { showStep(1); });

    var dateInput = form.elements.pickupDate;
    if (dateInput) dateInput.min = today();

    function showSuccess() {
      if (!success) { setStatus(DONE); return; }
      form.hidden = true;
      success.hidden = false;
      success.focus();
    }
    document.querySelectorAll('[data-again="' + form.id + '"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        success.hidden = true;
        form.hidden = false;
        form.elements.name.focus();
      });
    });

    function validate(data) {
      var el = form.elements;
      if (kind === "quote") {
        if (!/^\d{5}$/.test(String(data.get("originZip") || "").trim())) return invalid(el.originZip, "Enter a 5-digit pickup ZIP.");
        if (!/^\d{5}$/.test(String(data.get("destZip") || "").trim())) return invalid(el.destZip, "Enter a 5-digit delivery ZIP.");
        var w = String(data.get("weight") || "").trim();
        if (w && !(Number(w) >= 1 && Number(w) <= 80000)) return invalid(el.weight, "Weight should be between 1 and 80,000 lbs.");
        var pd = String(data.get("pickupDate") || "");
        if (pd && pd < today()) return invalid(el.pickupDate, "Pick a pickup date from today on.");
      }
      if (!String(data.get("name") || "").trim()) return invalid(el.name, "Please add your name.");
      if (!String(data.get("phone") || "").trim() && !String(data.get("email") || "").trim()) {
        return invalid(el.phone, "Add a phone number or email so we can reach you.");
      }
      return true;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      if (data.get("_honey")) return; // bot filled the honeypot
      if (!validate(data)) return;

      var endpoint = form.getAttribute("data-endpoint");
      var label = kind === "quote" ? "Freight quote" : "Website inquiry — " + data.get("interest");

      // No server when the page is opened straight from disk, so fall back to the email app
      if (!endpoint || location.protocol === "file:") {
        var lines = [];
        data.forEach(function (v, k) { if (k !== "_honey" && v) lines.push(k + ": " + v); });
        window.location.href = "mailto:" + form.getAttribute("data-email") +
          "?subject=" + encodeURIComponent(label) + "&body=" + encodeURIComponent(lines.join("\n"));
        setStatus("Opening your email app to send this to KMT…");
        return;
      }

      var payload = {
        kind: kind,
        interest: kind === "quote" ? "Ship freight" : data.get("interest"),
        name: data.get("name"),
        company: data.get("company"),
        setup: data.get("setup"),
        authority: data.get("authority"),
        equipmentType: data.get("equipmentType"),
        phone: data.get("phone"),
        email: data.get("email"),
        notes: data.get("notes"),
        _honey: data.get("_honey")
      };
      if (kind === "quote") QUOTE_FIELDS.forEach(function (k) { payload[k] = data.get(k); });

      submitBtn.disabled = true;
      setStatus("Sending…");
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (json) { return { ok: res.ok, json: json }; });
        })
        .then(function (r) {
          if (!r.ok || !r.json.ok) {
            // Validation messages from the server are safe to show; anything else gets the generic one
            var msg = r.json.error && /^(Please|Add|That|Enter|Weight|Pick)/.test(r.json.error) ? r.json.error : null;
            var err = new Error(msg || "send failed");
            err.userMessage = msg;
            err.reason = r.json.reason;
            throw err;
          }
          form.reset();
          pickInterest("");
          setStatus("");
          showSuccess();
        })
        .catch(function (err) {
          if (err && err.reason) console.warn("Form not delivered:", err.reason, "— open /api/contact for setup status");
          setStatus((err && err.userMessage) || "Couldn't send — please call or email us instead.", true);
        })
        .finally(function () { submitBtn.disabled = false; });
    });
  }

  document.querySelectorAll("form[data-endpoint]").forEach(initForm);

  // Scroll reveal: cards and section content ease in as they enter the viewport.
  // Content is only hidden by JS (never by CSS alone), so nothing is lost if scripts fail.
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduceMotion) {
    var REVEAL = [
      // [selector, direction]
      [".services__head", "up"], [".card--freight", "left"], [".card--dispatch", "down"], [".card--eld", "left"], [".card--lease", "right"], [".card--mc", "up"],
      [".lease__inner > .photo", "left"], [".lease__copy", "right"],
      [".support__card", "zoom"],
      [".steps > .eyebrow, .steps > .section-title", "up"], [".step", "up"],
      [".contact__intro", "left"], [".contact__inner > .form, .contact__inner > .form-success", "right"],
      [".cover__mark", "zoom"],
      [".split__inner > .photo", "left"], [".split__copy", "right"],
      [".info > .eyebrow, .info > .section-title", "up"], [".info-card", "up"],
      [".quote__intro", "left"], [".quote__inner > .form, .quote__inner > .form-success", "right"],
      [".cta-band__inner", "up"],
      [".site-footer__col", "up"]
    ];
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var seen = new Map(); // parent -> how many siblings queued, for the stagger
    var queue = [];
    // Per-item directions for groups of small items: [direction for item 1, 2, 3, ...]
    var CHIP_DIRS = ["left", "upright", "left", "left"]; // MC Startup checklist: → ↗ → →
    REVEAL.forEach(function (pair) {
      document.querySelectorAll(pair[0]).forEach(function (el) {
        if (el.hidden || el.classList.contains("reveal") || el.closest(".hero, .site-header")) return;
        // Anything already on screen at load stays put (no flash of hidden content)
        if (el.getBoundingClientRect().top < vh * 0.92) return;
        var n = seen.get(el.parentNode) || 0;
        seen.set(el.parentNode, n + 1);
        el.style.setProperty("--reveal-delay", Math.min(n, 5) * 90 + "ms");
        el.dataset.revealDir = pair[1];
        el.classList.add("reveal", "reveal--" + pair[1]);
        queue.push(el);
      });
    });
    document.querySelectorAll(".checklist li").forEach(function (el, i) {
      if (el.closest(".hero, .site-header") || el.getBoundingClientRect().top < vh * 0.92) return;
      var dir = CHIP_DIRS[i % CHIP_DIRS.length];
      el.style.setProperty("--reveal-delay", 260 + i * 110 + "ms"); // after the yellow card has started to fade in
      el.dataset.revealDir = dir;
      el.classList.add("reveal", "reveal--" + dir);
      queue.push(el);
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        el.classList.add("is-in");
        // Hand the element back to its own hover/transition styles once it has settled
        var cleanup = function () {
          el.classList.remove("reveal", "reveal--" + el.dataset.revealDir, "is-in");
          el.style.removeProperty("--reveal-delay");
          delete el.dataset.revealDir;
        };
        el.addEventListener("transitionend", function onEnd(e) {
          if (e.target !== el || e.propertyName !== "opacity") return;
          el.removeEventListener("transitionend", onEnd);
          cleanup();
        });
        setTimeout(cleanup, 1800); // safety net if transitionend never fires
      });
    }, { threshold: 0, rootMargin: "0px 0px -10% 0px" });
    queue.forEach(function (el) { io.observe(el); });
  }
})();
