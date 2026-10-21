// Truck cost-per-mile calculator (cost-per-mile.html).
// The math mirrors api/_cpm.js (the server recomputes everything for the emails) — keep FIELDS and compute() in sync.
(function () {
  var form = document.getElementById("cpm-form");
  if (!form) return;

  // name: [default, min, max]
  var FIELDS = {
    miles: [10000, 500, 60000], deadhead: [15, 0, 80], profit: [0.35, 0, 5], buffer: [5, 0, 50],
    diesel: [3.75, 1, 10], mpg: [6.5, 2, 15],
    payment: [2200, 0, 20000], depreciation: [1500, 0, 20000],
    insurance: [1200, 0, 20000],
    maintenance: [800, 0, 20000], tires: [400, 0, 10000],
    tolls: [350, 0, 10000], permits: [200, 0, 10000], software: [180, 0, 10000], parking: [250, 0, 10000], other: [0, 0, 20000]
  };
  var LABELS = [["fuel", "Fuel"], ["truck", "Truck payment + depreciation"], ["insurance", "Insurance"],
    ["maintenance", "Maintenance + tires"], ["hidden", "Tolls, permits, software & other"], ["buffer", "Downtime buffer"]];
  var TIPS = {
    fuel: "Fuel is your biggest cost. Better MPG (speed, idling, tire pressure) and fuel-discount programs move your number the most.",
    truck: "Your truck payment is your biggest cost. More miles per month spreads it thinner — a dispatcher who keeps you loaded helps directly.",
    insurance: "Insurance is your biggest cost. Shop your renewal and keep a clean safety record — it pays back every month.",
    maintenance: "Maintenance is your biggest cost. Preventive service is cheaper than roadside repairs and lost days.",
    hidden: "The small bills add up to your biggest cost. Review subscriptions, permits and tolls each quarter."
  };

  var el = form.elements;
  var steps = [].slice.call(form.querySelectorAll(".cpm-step"));
  var back = document.getElementById("cpm-back"), next = document.getElementById("cpm-next"), submit = document.getElementById("cpm-submit");
  var bar = document.getElementById("cpm-bar"), status = document.getElementById("cpm-status");
  var results = document.getElementById("cpm-results");
  var current = 1;

  Object.keys(FIELDS).forEach(function (k) { if (el[k] && el[k].value === "") el[k].value = FIELDS[k][0]; });

  function num(k) {
    var spec = FIELDS[k], n = parseFloat(String(el[k].value).replace(/[^0-9.\-]/g, ""));
    if (!isFinite(n)) return spec[0];
    return Math.min(spec[2], Math.max(spec[1], n));
  }
  function inputs() { var o = {}; Object.keys(FIELDS).forEach(function (k) { o[k] = num(k); }); return o; }

  function compute(i) {
    var per = function (m) { return m / i.miles; };
    var parts = {
      fuel: i.diesel / i.mpg,
      truck: per(i.payment + i.depreciation),
      insurance: per(i.insurance),
      maintenance: per(i.maintenance + i.tires),
      hidden: per(i.tolls + i.permits + i.software + i.parking + i.other)
    };
    var base = parts.fuel + parts.truck + parts.insurance + parts.maintenance + parts.hidden;
    parts.buffer = base * i.buffer / 100;
    var total = base + parts.buffer, loadedShare = 1 - i.deadhead / 100, loadedMiles = i.miles * loadedShare;
    var minRate = total / loadedShare + i.profit;
    return { parts: parts, total: total, minRate: minRate, monthlyCost: total * i.miles, loadedMiles: loadedMiles,
      revenueNeeded: minRate * loadedMiles, monthlyProfit: i.profit * loadedMiles };
  }

  var money = function (n, d) {
    d = d == null ? 2 : d;
    return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  };

  // live per-step cost-per-mile readouts
  function updateLive() {
    var r = compute(inputs());
    form.querySelectorAll("[data-live]").forEach(function (o) { o.textContent = money(r.parts[o.getAttribute("data-live")]); });
    var warn = form.querySelector("[data-cov-warn]");
    if (warn) warn.hidden = el.cov_cargo.checked && el.cov_physical.checked && el.cov_liability.checked;
  }
  form.addEventListener("input", function (e) { e.target.removeAttribute("aria-invalid"); updateLive(); });
  form.addEventListener("change", updateLive);

  function show(n) {
    current = n;
    steps.forEach(function (s) { s.hidden = +s.getAttribute("data-step") !== n; });
    back.hidden = n === 1;
    next.hidden = n === 7;
    submit.hidden = n !== 7;
    bar.style.width = (n / 7 * 100) + "%";
    status.textContent = "";
    var first = steps[n - 1].querySelector("input, select");
    if (first && n > 1) first.focus({ preventScroll: true });
    var card = form.getBoundingClientRect();
    if (card.top < 70) window.scrollTo({ top: window.scrollY + card.top - 90, behavior: "smooth" });
  }

  function stepValid(n) {
    var bad = null;
    steps[n - 1].querySelectorAll('input[type="number"]').forEach(function (f) {
      var v = parseFloat(f.value);
      if (bad) return;
      if (!isFinite(v) || v < +f.min) bad = f;
    });
    if (bad) {
      bad.setAttribute("aria-invalid", "true"); bad.focus();
      status.textContent = "Please enter a number for “" + bad.closest(".cpm-field").querySelector(".cpm-field__label").textContent + "”.";
      return false;
    }
    return true;
  }

  next.addEventListener("click", function () { if (stepValid(current)) show(current + 1); });
  back.addEventListener("click", function () { show(current - 1); });
  form.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName === "INPUT" && current < 7) { e.preventDefault(); next.click(); }
  });

  function renderResults(r) {
    results.querySelectorAll("[data-out]").forEach(function (o) {
      var k = o.getAttribute("data-out");
      o.textContent = k === "minRate" ? money(r[k]) + "/mi" : k === "total" ? money(r[k]) : money(r[k], 0);
    });
    var bars = document.getElementById("cpm-bars");
    bars.innerHTML = "";
    var top = null;
    LABELS.forEach(function (pair) {
      var v = r.parts[pair[0]], pct = r.total > 0 ? Math.round(v / r.total * 100) : 0;
      if (pair[0] !== "buffer" && (!top || v > r.parts[top])) top = pair[0];
      var li = document.createElement("li");
      li.innerHTML = '<span class="cpm-bars__label"></span><span class="cpm-bars__val"></span>' +
        '<span class="cpm-bars__track"><span class="cpm-bars__fill"></span></span>';
      li.querySelector(".cpm-bars__label").textContent = pair[1];
      li.querySelector(".cpm-bars__val").textContent = money(v) + "/mi · " + pct + "%";
      li.querySelector(".cpm-bars__fill").style.setProperty("--w", Math.max(2, pct) + "%");
      bars.appendChild(li);
    });
    document.getElementById("cpm-tip").textContent = TIPS[top] || "";
    form.hidden = true;
    results.hidden = false;
    results.focus({ preventScroll: true });
    window.scrollTo({ top: window.scrollY + results.getBoundingClientRect().top - 90, behavior: "smooth" });
    requestAnimationFrame(function () { results.classList.add("is-in"); });
  }

  document.getElementById("cpm-edit").addEventListener("click", function () {
    results.hidden = true; results.classList.remove("is-in");
    form.hidden = false; show(1);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (el._honey.value) return;
    var name = el.name.value.trim(), email = el.email.value.trim(), phone = el.phone.value.trim();
    var fail = function (f, msg) { f.setAttribute("aria-invalid", "true"); f.focus(); status.textContent = msg; };
    if (!name) return fail(el.name, "Please add your first name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(el.email, "Please add a valid email address.");
    if (phone.replace(/\D/g, "").length < 7) return fail(el.phone, "Please add a phone number.");

    var i = inputs(), r = compute(i);
    submit.disabled = true;
    status.textContent = "Unlocking…";
    var sent = document.getElementById("cpm-sent");
    var done = function (ok) {
      submit.disabled = false;
      sent.textContent = ok ? "A copy of your breakdown is on its way to " + email + "." : "";
      renderResults(r);
    };
    if (location.protocol === "file:") return done(false);
    fetch("api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ kind: "cpm", name: name, email: email, phone: phone, state: el.state.value.trim(),
        ownAuthority: el.ownAuthority.value, cpm: i, _honey: el._honey.value })
    })
      .then(function (res) { return res.json().catch(function () { return {}; }).then(function (j) { return { ok: res.ok, j: j }; }); })
      .then(function (x) {
        if (!x.ok && x.j.error && /^Please/.test(x.j.error)) { status.textContent = x.j.error; submit.disabled = false; return; }
        if (!x.ok) console.warn("Cost-per-mile lead not delivered:", x.j.reason || x.j.error);
        done(x.ok && x.j.ok);
      })
      .catch(function () { done(false); }); // never hold the results hostage to a network error
  });

  show(1);
  updateLive();
})();
