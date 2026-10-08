// KMT Logistics — contact form interest pills + submission
(function () {
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  var form = document.getElementById("contact-form");
  if (!form) return;

  var pills = form.querySelectorAll(".pill");
  var interestInput = form.querySelector('input[name="interest"]');
  var status = form.querySelector(".form__status");
  var submitBtn = form.querySelector('button[type="submit"]');

  function pickInterest(label) {
    pills.forEach(function (p) {
      p.setAttribute("aria-pressed", String(p.textContent.trim() === label));
    });
    interestInput.value = label;
  }

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

  function setStatus(msg, isError) {
    status.textContent = msg;
    status.classList.toggle("is-error", !!isError);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = new FormData(form);

    if (data.get("_honey")) return; // bot filled the honeypot
    if (!String(data.get("name") || "").trim()) {
      setStatus("Please add your name.", true);
      form.elements.name.focus();
      return;
    }
    if (!String(data.get("phone") || "").trim() && !String(data.get("email") || "").trim()) {
      setStatus("Add a phone number or email so we can reach you.", true);
      form.elements.phone.focus();
      return;
    }

    var endpoint = form.getAttribute("data-endpoint");
    var done = "Got it — we'll reach out within one business hour.";

    if (!endpoint) {
      var body = ["Interest: " + data.get("interest"), "Name: " + data.get("name"),
        "Company / MC #: " + data.get("company"), "Phone: " + data.get("phone"),
        "Email: " + data.get("email"), "", data.get("notes")].join("\n");
      window.location.href = "mailto:" + form.getAttribute("data-email") +
        "?subject=" + encodeURIComponent("Website inquiry — " + data.get("interest")) +
        "&body=" + encodeURIComponent(body);
      setStatus("Opening your email app to send this to KMT…");
      return;
    }

    submitBtn.disabled = true;
    setStatus("Sending…");
    var payload = {
      _subject: "KMT website inquiry — " + data.get("interest"),
      _template: "table",
      _captcha: "false",
      Interest: data.get("interest"),
      Name: data.get("name"),
      "Company / MC #": data.get("company"),
      Phone: data.get("phone"),
      email: data.get("email"), // FormSubmit uses this as the reply-to address
      Details: data.get("notes")
    };
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) { return res.json().then(function (json) { return { ok: res.ok, json: json }; }); })
      .then(function (r) {
        if (!r.ok || String(r.json.success) !== "true") throw new Error(r.json.message || "send failed");
        form.reset();
        pickInterest("Ship freight");
        setStatus(done);
      })
      .catch(function () {
        setStatus("Couldn't send — please call or email us instead.", true);
      })
      .finally(function () { submitBtn.disabled = false; });
  });
})();
