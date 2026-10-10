// KMT Logistics — lead forms (home contact form + freight quote form)
(function () {
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  // Navigation mega menu: hover & click operated with debounce, Escape, outside-click dismissal, and arrow alignment.
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
      if (event.key === "Escape") { close(); toggle.focus(); }
    });
  });

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
})();
