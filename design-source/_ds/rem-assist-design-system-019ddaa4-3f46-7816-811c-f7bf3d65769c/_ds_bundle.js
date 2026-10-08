/* @ds-bundle: {"format":4,"namespace":"RemAssistDesignSystem_019dda","components":[],"sourceHashes":{"ui_kits/dashboard/dashboard.js":"a892dadb6dce","ui_kits/dashboard/risks-data.js":"9dd903683ecd"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.RemAssistDesignSystem_019dda = window.RemAssistDesignSystem_019dda || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/dashboard/dashboard.js
try { (() => {
// Renders the dashboard. Data is in window.RISKS / window.OWNERS / window.LEVEL_COLORS.
// Plain JS — no React, intentionally simple, easy to lift into any framework later.

(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const fmt = d => {
    if (!d) return "—";
    const dt = new Date(d);
    if (Number.isNaN(+dt)) return d;
    return dt.toLocaleDateString("en-CA"); // YYYY-MM-DD
  };
  const TODAY = new Date("2025-07-10"); // pinned "now" so the demo dashboard always tells a coherent story
  const isOverdue = d => new Date(d) < TODAY;
  const dueWithinDays = (d, n) => {
    const dt = new Date(d);
    const diff = (dt - TODAY) / 86400000;
    return diff >= 0 && diff <= n;
  };

  // ---------- KPIs ----------
  function renderKpis() {
    const total = RISKS.length;
    const crit = RISKS.filter(r => r.level === "Critical").length;
    const high = RISKS.filter(r => r.level === "High").length;
    const overdue = RISKS.filter(r => isOverdue(r.target)).length;
    const dueWeek = RISKS.filter(r => dueWithinDays(r.target, 7)).length;
    const annexCovered = new Set(RISKS.flatMap(r => r.annex.split(",").map(s => s.trim()))).size;
    $("#kpis").innerHTML = `
      <div class="kpi crit">
        <div class="accent"></div>
        <div class="label">Critical risks</div>
        <div class="value">${crit}</div>
        <div class="delta up"><i data-lucide="trending-up"></i> +1 vs last week</div>
      </div>
      <div class="kpi high">
        <div class="accent"></div>
        <div class="label">High risks</div>
        <div class="value">${high}</div>
        <div class="delta down"><i data-lucide="trending-down"></i> −2 vs last week</div>
      </div>
      <div class="kpi info">
        <div class="accent"></div>
        <div class="label">Open total</div>
        <div class="value">${total}</div>
        <div class="delta">${RISKS.filter(r => r.treatment === "Mitigate").length} in mitigation</div>
      </div>
      <div class="kpi" style="--accent:var(--ink-700)">
        <div class="accent" style="background:var(--ink-700)"></div>
        <div class="label">Overdue · due ≤ 7 days</div>
        <div class="value">${overdue} <span style="font-size:18px;color:var(--fg-tertiary);font-weight:500"> · ${dueWeek}</span></div>
        <div class="delta">${annexCovered} Annex A controls in scope</div>
      </div>
    `;
  }

  // ---------- Heatmap (3×3 likelihood × impact) ----------
  function renderHeatmap() {
    const grid = {}; // key "L-I" -> count
    RISKS.forEach(r => {
      const k = `${r.L}-${r.I}`;
      grid[k] = (grid[k] || 0) + 1;
    });
    const colorFor = (L, I) => {
      const score = L * I;
      if (score >= 9) return {
        bg: "#FEE2DF",
        fg: "#8A1A12"
      };
      if (score >= 6) return {
        bg: "#FCE7CE",
        fg: "#A35307"
      };
      if (score >= 3) return {
        bg: "#FBEDC4",
        fg: "#92670A"
      };
      return {
        bg: "#D2F0DD",
        fg: "#0F5C2D"
      };
    };
    let html = `<div class="heatmap">`;
    html += `<div class="axis-label"></div>`;
    html += [1, 2, 3].map(I => `<div class="axis-label">I&nbsp;${I}</div>`).join("");
    [3, 2, 1].forEach(L => {
      html += `<div class="axis-label">L&nbsp;${L}</div>`;
      [1, 2, 3].forEach(I => {
        const n = grid[`${L}-${I}`] || 0;
        const c = colorFor(L, I);
        html += `<div class="cell" style="background:${c.bg};color:${c.fg}" title="L${L}·I${I} (score ${L * I}) — ${n} risk${n === 1 ? "" : "s"}">
          <span class="legend">${L * I}</span>
          <span class="n">${n}</span>
        </div>`;
      });
    });
    html += `</div>`;
    $("#heatmap").innerHTML = html;
  }

  // ---------- Donut ----------
  function renderDonut() {
    const counts = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0
    };
    RISKS.forEach(r => counts[r.level]++);
    const total = RISKS.length;
    const palette = {
      Critical: "#B42318",
      High: "#D97706",
      Medium: "#E5A82E",
      Low: "#15803D"
    };
    const cx = 65,
      cy = 65,
      r = 50,
      c = 2 * Math.PI * r;
    let acc = 0;
    const segs = Object.entries(counts).map(([level, n]) => {
      const frac = n / total;
      const seg = `<circle r="${r}" cx="${cx}" cy="${cy}" fill="transparent"
        stroke="${palette[level]}" stroke-width="18"
        stroke-dasharray="${(frac * c).toFixed(2)} ${c.toFixed(2)}"
        stroke-dashoffset="${(-acc * c).toFixed(2)}"
        transform="rotate(-90 ${cx} ${cy})" />`;
      acc += frac;
      return seg;
    }).join("");
    const svg = `<svg class="donut" viewBox="0 0 130 130">
      <circle r="${r}" cx="${cx}" cy="${cy}" fill="transparent" stroke="#F0F3F8" stroke-width="18"/>
      ${segs}
      <text x="${cx}" y="${cy - 3}" text-anchor="middle" font-family="Inter" font-weight="700" font-size="22" fill="#0F1C33">${total}</text>
      <text x="${cx}" y="${cy + 14}" text-anchor="middle" font-family="Inter" font-size="10" fill="#6B7691" letter-spacing="0.1em">RISKS</text>
    </svg>`;
    const legend = Object.entries(counts).map(([level, n]) => `
      <div class="row">
        <span class="sw" style="background:${palette[level]}"></span>
        <span class="nm">${level}</span>
        <span class="ct">${n}</span>
      </div>
    `).join("");
    $("#donut").innerHTML = `<div class="donut-wrap">${svg}<div class="donut-legend">${legend}</div></div>`;
  }

  // ---------- Annex A coverage bars ----------
  function renderAnnex() {
    // Group by Annex A.5 / A.7 / A.8 prefix
    const groups = {
      "A.5 Organizational": 0,
      "A.6 People": 0,
      "A.7 Physical": 0,
      "A.8 Technological": 0
    };
    RISKS.forEach(r => {
      r.annex.split(",").map(s => s.trim()).forEach(a => {
        if (a.startsWith("A.5")) groups["A.5 Organizational"]++;else if (a.startsWith("A.6")) groups["A.6 People"]++;else if (a.startsWith("A.7")) groups["A.7 Physical"]++;else if (a.startsWith("A.8")) groups["A.8 Technological"]++;
      });
    });
    const max = Math.max(...Object.values(groups), 1);
    const bars = Object.entries(groups).map(([k, v]) => `
      <div class="bar-row">
        <div class="label">${k}</div>
        <div class="bar"><span style="width:${(v / max * 100).toFixed(0)}%"></span></div>
        <div class="val">${v}</div>
      </div>
    `).join("");
    $("#annex").innerHTML = `<div class="bars">${bars}</div>`;
  }

  // ---------- Risk register table ----------
  let activeFilter = "all";
  function renderTable() {
    let rows = RISKS.slice();
    if (activeFilter !== "all") rows = rows.filter(r => r.level.toLowerCase() === activeFilter);

    // Tab counts
    $("#tab-all .count").textContent = RISKS.length;
    $("#tab-critical .count").textContent = RISKS.filter(r => r.level === "Critical").length;
    $("#tab-high .count").textContent = RISKS.filter(r => r.level === "High").length;
    $("#tab-medium .count").textContent = RISKS.filter(r => r.level === "Medium").length;
    $("#tab-low .count").textContent = RISKS.filter(r => r.level === "Low").length;
    const html = rows.map(r => {
      const o = ownerFor(r.owner);
      const overdue = isOverdue(r.target);
      const annexFirst = r.annex.split(",")[0].trim();
      const annexMore = r.annex.split(",").length - 1;
      return `
      <tr data-id="${r.id}">
        <td class="id-cell">#${String(r.id).padStart(2, "0")}</td>
        <td class="asset-cell">${r.asset}</td>
        <td>${r.desc}</td>
        <td><span class="risk-badge ${r.level.toLowerCase()}">${r.level}</span></td>
        <td class="score-cell">${r.L} × ${r.I} = ${r.L * r.I}</td>
        <td><span class="annex">${annexFirst}</span>${annexMore > 0 ? `<span style="color:var(--ink-500);font-size:11px;margin-left:4px">+${annexMore}</span>` : ""}</td>
        <td>${r.treatment}</td>
        <td>
          <span class="owner">
            <span class="av" style="background:${o.color}">${o.initials}</span>
            ${o.name}
          </span>
        </td>
        <td class="due-cell ${overdue ? "overdue" : ""}">${fmt(r.target)}</td>
        <td><span class="risk-badge soft ${r.residual.toLowerCase()}">${r.residual}</span></td>
      </tr>`;
    }).join("");
    $("#tbody").innerHTML = html;

    // Wire row clicks
    $$("tr[data-id]").forEach(tr => {
      tr.addEventListener("click", () => openDrawer(+tr.dataset.id));
    });
  }

  // ---------- Bar chart: risks by asset (severity ranked) ----------
  function renderByAsset() {
    const palette = {
      Critical: "#B42318",
      High: "#D97706",
      Medium: "#E5A82E",
      Low: "#15803D"
    };
    const sorted = [...RISKS].sort((a, b) => b.L * b.I - a.L * a.I || a.asset.localeCompare(b.asset));
    const max = 9;
    const html = sorted.map(r => {
      const score = r.L * r.I;
      const pct = score / max * 100;
      return `
        <div class="hbar-row" data-id="${r.id}">
          <div class="hbar-label" title="${r.asset}">${r.asset}</div>
          <div class="hbar-track">
            <div class="hbar-fill" style="width:${pct}%;background:${palette[r.level]}">
              <span class="hbar-score">${score}</span>
            </div>
          </div>
          <div class="hbar-meta"><span class="risk-badge soft ${r.level.toLowerCase()}" style="font-size:10px;padding:1px 6px">${r.level}</span></div>
        </div>`;
    }).join("");
    $("#bar-by-asset").innerHTML = `<div class="hbars">${html}</div>`;
    $$("#bar-by-asset .hbar-row").forEach(el => el.addEventListener("click", () => openDrawer(+el.dataset.id)));
  }

  // ---------- Stacked bar chart: risks by owner ----------
  function renderByOwner() {
    const palette = {
      Critical: "#B42318",
      High: "#D97706",
      Medium: "#E5A82E",
      Low: "#15803D"
    };
    const byOwner = {};
    RISKS.forEach(r => {
      byOwner[r.owner] = byOwner[r.owner] || {
        Critical: 0,
        High: 0,
        Medium: 0,
        Low: 0,
        total: 0
      };
      byOwner[r.owner][r.level]++;
      byOwner[r.owner].total++;
    });
    const owners = Object.entries(byOwner).sort((a, b) => b[1].total - a[1].total);
    const maxTotal = Math.max(...owners.map(([, v]) => v.total));
    const html = owners.map(([name, c]) => {
      const o = ownerFor(name);
      const pct = c.total / maxTotal * 100;
      const segs = ["Critical", "High", "Medium", "Low"].map(lvl => {
        if (!c[lvl]) return "";
        const w = c[lvl] / c.total * 100;
        return `<span class="seg" style="width:${w}%;background:${palette[lvl]}" title="${lvl}: ${c[lvl]}"></span>`;
      }).join("");
      return `
        <div class="hbar-row">
          <div class="hbar-label" style="display:flex;align-items:center;gap:6px">
            <span class="av" style="background:${o.color};width:18px;height:18px;border-radius:9999px;display:inline-flex;align-items:center;justify-content:center;color:#FFF;font-size:9px;font-weight:700;flex-shrink:0">${o.initials}</span>
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${name}</span>
          </div>
          <div class="hbar-track" style="background:transparent">
            <div class="hbar-stack" style="width:${pct}%">${segs}</div>
          </div>
          <div class="hbar-meta" style="font-family:var(--font-mono);font-size:12px;color:var(--ink-700);font-weight:600">${c.total}</div>
        </div>`;
    }).join("");
    $("#bar-by-owner").innerHTML = `<div class="hbars">${html}
      <div style="display:flex;gap:14px;font-size:11px;color:var(--ink-500);flex-wrap:wrap;margin-top:10px;padding-top:10px;border-top:1px solid var(--ink-100)">
        <span style="display:inline-flex;align-items:center;gap:6px"><span style="width:10px;height:10px;background:#B42318;border-radius:2px"></span> Critical</span>
        <span style="display:inline-flex;align-items:center;gap:6px"><span style="width:10px;height:10px;background:#D97706;border-radius:2px"></span> High</span>
        <span style="display:inline-flex;align-items:center;gap:6px"><span style="width:10px;height:10px;background:#E5A82E;border-radius:2px"></span> Medium</span>
        <span style="display:inline-flex;align-items:center;gap:6px"><span style="width:10px;height:10px;background:#15803D;border-radius:2px"></span> Low</span>
      </div>
    </div>`;
  }

  // ---------- Side views ----------
  function renderAssets() {
    const html = RISKS.map(r => `
      <div class="asset-row" data-id="${r.id}">
        <div class="asset-icon"><i data-lucide="layers"></i></div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;color:var(--ink-900);font-size:14px">${r.asset}</div>
          <div style="font-size:12px;color:var(--ink-500)">${r.desc}</div>
        </div>
        <span class="annex">${r.annex.split(",")[0].trim()}</span>
        <span class="risk-badge ${r.level.toLowerCase()}">${r.level}</span>
      </div>
    `).join("");
    $("#asset-list").innerHTML = `<div class="row-list">${html}</div>`;
    $$("#asset-list .asset-row").forEach(el => el.addEventListener("click", () => openDrawer(+el.dataset.id)));
  }
  function renderControls() {
    const items = RISKS.map(r => ({
      control: r.planned,
      owner: r.owner,
      annex: r.annex,
      asset: r.asset,
      level: r.level,
      id: r.id
    }));
    const html = items.map(c => {
      const o = ownerFor(c.owner);
      return `
        <div class="asset-row" data-id="${c.id}">
          <div class="asset-icon" style="background:var(--blue-50);color:var(--blue-600)"><i data-lucide="check-circle-2"></i></div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;color:var(--ink-900);font-size:14px">${c.control}</div>
            <div style="font-size:12px;color:var(--ink-500)">${c.asset} · <span class="annex">${c.annex.split(",")[0].trim()}</span></div>
          </div>
          <span class="owner"><span class="av" style="background:${o.color}">${o.initials}</span>${c.owner}</span>
        </div>`;
    }).join("");
    $("#controls-list").innerHTML = `<div class="row-list">${html}</div>`;
    $$("#controls-list .asset-row").forEach(el => el.addEventListener("click", () => openDrawer(+el.dataset.id)));
  }
  function renderOwners() {
    const byOwner = {};
    RISKS.forEach(r => {
      byOwner[r.owner] = (byOwner[r.owner] || 0) + 1;
    });
    const html = Object.entries(byOwner).sort((a, b) => b[1] - a[1]).map(([name, n]) => {
      const o = ownerFor(name);
      return `
        <div class="asset-row">
          <span class="av" style="background:${o.color};width:36px;height:36px;border-radius:9999px;display:inline-flex;align-items:center;justify-content:center;color:#FFF;font-weight:700;font-size:13px">${o.initials}</span>
          <div style="flex:1"><div style="font-weight:600">${name}</div><div style="font-size:12px;color:var(--ink-500)">${n} risk${n === 1 ? "" : "s"} owned</div></div>
        </div>`;
    }).join("");
    $("#owners-list").innerHTML = `<div class="row-list">${html}</div>`;
  }
  function renderAuditList() {
    const items = [{
      date: "2025-07-15",
      what: "Internal audit · A.8 Technological controls",
      who: "Cybersecurity Specialist"
    }, {
      date: "2025-07-31",
      what: "Quarterly access review · ConnectTeam HRIS",
      who: "HR Manager"
    }, {
      date: "2025-08-15",
      what: "Code review checklist rollout · Rempro",
      who: "CDO"
    }, {
      date: "2025-09-10",
      what: "Surveillance audit prep · ISO 27001:2022",
      who: "Management Representative"
    }, {
      date: "2025-10-01",
      what: "Phishing simulation cycle 2",
      who: "Cybersecurity Specialist"
    }];
    const html = items.map(i => `
      <div class="asset-row">
        <div class="asset-icon" style="background:var(--medium-50);color:var(--medium-700)"><i data-lucide="calendar-clock"></i></div>
        <div style="flex:1"><div style="font-weight:600">${i.what}</div><div style="font-size:12px;color:var(--ink-500)">${i.who}</div></div>
        <div style="font-family:var(--font-mono);font-size:12px;color:var(--ink-700)">${i.date}</div>
      </div>`).join("");
    $("#audit-list").innerHTML = `<div class="row-list">${html}</div>`;
  }
  function renderAnnexFull() {
    // Mirror of overview annex bars but bigger
    const groups = {
      "A.5 Organizational": [],
      "A.6 People": [],
      "A.7 Physical": [],
      "A.8 Technological": []
    };
    RISKS.forEach(r => {
      r.annex.split(",").map(s => s.trim()).forEach(a => {
        if (a.startsWith("A.5")) groups["A.5 Organizational"].push({
          a,
          r
        });else if (a.startsWith("A.6")) groups["A.6 People"].push({
          a,
          r
        });else if (a.startsWith("A.7")) groups["A.7 Physical"].push({
          a,
          r
        });else if (a.startsWith("A.8")) groups["A.8 Technological"].push({
          a,
          r
        });
      });
    });
    const html = Object.entries(groups).map(([k, list]) => `
      <div style="margin-bottom:18px">
        <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:8px">
          <h4 style="margin:0;font-size:14px">${k}</h4>
          <span style="font-family:var(--font-mono);font-size:11px;color:var(--ink-500)">${list.length} entries</span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${list.map(({
      a,
      r
    }) => `<span class="annex" data-id="${r.id}" style="cursor:pointer" title="${r.asset} — ${r.desc}">${a}</span>`).join("")}
        </div>
      </div>`).join("");
    $("#annex2").innerHTML = html;
    $$("#annex2 .annex[data-id]").forEach(el => el.addEventListener("click", () => openDrawer(+el.dataset.id)));
  }

  // ---------- View routing ----------
  function showView(name) {
    $$(".view").forEach(v => v.classList.toggle("active", v.dataset.view === name));
    $$(".nav-item").forEach(n => n.classList.toggle("active", n.dataset.view === name));
    // Update breadcrumb
    const labels = {
      overview: "Overview",
      register: "Risk Register",
      assets: "Asset Inventory",
      incidents: "Incidents",
      controls: "Controls",
      annex: "Annex A coverage",
      audit: "Audit calendar",
      evidence: "Evidence",
      owners: "Owners",
      settings: "Settings"
    };
    if ($(".crumbs .here")) $(".crumbs .here").textContent = labels[name] || name;
    window.scrollTo({
      top: 0,
      behavior: "instant"
    });
    if (window.lucide) lucide.createIcons();
  }
  function openDrawer(id) {
    const r = RISKS.find(x => x.id === id);
    if (!r) return;
    const o = ownerFor(r.owner);
    const annexes = r.annex.split(",").map(s => `<span class="annex">${s.trim()}</span>`).join(" ");
    $("#drawer-title").textContent = `Risk #${String(r.id).padStart(2, "0")} · ${r.asset}`;
    $("#drawer-body").innerHTML = `
      <div style="display:flex;gap:8px;align-items:center">
        <span class="risk-badge ${r.level.toLowerCase()}">${r.level}</span>
        <span style="font-family:var(--font-mono);font-size:12px;color:var(--ink-500)">L ${r.L} × I ${r.I} = ${r.L * r.I}</span>
        <span style="margin-left:auto;font-size:12px;color:var(--ink-500)">Residual <strong style="color:var(--ink-800)">${r.residual}</strong></span>
      </div>

      <div class="field">
        <div class="l">Risk description</div>
        <div class="v" style="font-size:16px;font-weight:600">${r.desc}</div>
      </div>

      <div class="field-grid">
        <div class="field"><div class="l">Threat</div><div class="v">${r.threat}</div></div>
        <div class="field"><div class="l">Vulnerability</div><div class="v">${r.vuln}</div></div>
      </div>

      <div class="field">
        <div class="l">Existing controls</div>
        <div class="v">${r.controls}</div>
      </div>

      <div class="field">
        <div class="l">Annex A mapping</div>
        <div class="v" style="display:flex;gap:6px;flex-wrap:wrap">${annexes}</div>
      </div>

      <hr style="border:0;border-top:1px solid var(--ink-100);margin:0">

      <div class="field-grid">
        <div class="field">
          <div class="l">Treatment</div>
          <div class="v"><strong>${r.treatment}</strong></div>
        </div>
        <div class="field">
          <div class="l">Owner</div>
          <div class="v">
            <span class="owner">
              <span class="av" style="background:${o.color}">${o.initials}</span>
              ${o.name}
            </span>
          </div>
        </div>
        <div class="field">
          <div class="l">Target date</div>
          <div class="v" style="${isOverdue(r.target) ? "color:var(--critical-600);font-weight:600" : ""}">${fmt(r.target)}${isOverdue(r.target) ? " · overdue" : ""}</div>
        </div>
        <div class="field">
          <div class="l">Residual risk</div>
          <div class="v"><span class="risk-badge soft ${r.residual.toLowerCase()}">${r.residual}</span></div>
        </div>
      </div>

      <div class="field">
        <div class="l">Planned controls / actions</div>
        <div class="v" style="background:var(--blue-50);border:1px solid var(--blue-100);border-radius:6px;padding:10px 12px;color:var(--ink-800)">${r.planned}</div>
      </div>

      <div class="field">
        <div class="l">Activity</div>
        <div class="timeline">
          <div class="item"><div class="dot"></div><div><div class="when">2025-07-08</div><div class="what">${o.name} updated planned controls.</div></div></div>
          <div class="item"><div class="dot" style="background:var(--medium-600);box-shadow:0 0 0 3px var(--medium-100)"></div><div><div class="when">2025-07-01</div><div class="what">Risk reassessed during quarterly review. Score unchanged.</div></div></div>
          <div class="item"><div class="dot" style="background:var(--ink-300);box-shadow:0 0 0 3px var(--ink-100)"></div><div><div class="when">2025-06-15</div><div class="what">Risk added to register by Management Representative.</div></div></div>
        </div>
      </div>
    `;
    $(".drawer-overlay").classList.add("open");
    $(".drawer").classList.add("open");
  }
  function closeDrawer() {
    $(".drawer-overlay").classList.remove("open");
    $(".drawer").classList.remove("open");
  }

  // ---------- Wiring ----------
  function init() {
    renderKpis();
    renderHeatmap();
    renderDonut();
    renderAnnex();
    renderByAsset();
    renderByOwner();
    renderTable();
    renderAssets();
    renderControls();
    renderOwners();
    renderAuditList();
    renderAnnexFull();
    $$(".tab").forEach(t => t.addEventListener("click", () => {
      $$(".tab").forEach(x => x.classList.remove("active"));
      t.classList.add("active");
      activeFilter = t.dataset.filter;
      renderTable();
      if (window.lucide) lucide.createIcons();
    }));
    $$(".nav-item").forEach(n => n.addEventListener("click", () => {
      const view = n.dataset.view;
      if (view) showView(view);
    }));
    $(".drawer-overlay").addEventListener("click", closeDrawer);
    $("#drawer-close").addEventListener("click", closeDrawer);
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") closeDrawer();
    });
    if (window.lucide) lucide.createIcons();
  }
  document.addEventListener("DOMContentLoaded", init);
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dashboard/dashboard.js", error: String((e && e.message) || e) }); }

// ui_kits/dashboard/risks-data.js
try { (() => {
// Risk register data — extracted from RISK ASSESSMENT REGISTER.xlsx
// Document: RA-ISMS-06-REG-01 · Rev 01 · 2025-07-01
// ISO/IEC 27001:2022 Clause 6.1.2, 6.1.3, 8.2, 8.3 · Annex A.5–A.8

window.RISKS = [{
  id: 1,
  asset: "Azure AD & M365",
  desc: "Unauthorized account access",
  threat: "Credential theft",
  vuln: "Weak / MFA not enforced",
  L: 2,
  I: 3,
  level: "High",
  controls: "MFA, Conditional Access",
  annex: "A.8.5, A.8.2",
  treatment: "Mitigate",
  planned: "Enforce MFA on all users",
  owner: "Cybersecurity Specialist",
  target: "2025-07-15",
  residual: "Medium"
}, {
  id: 2,
  asset: "HubSpot CRM",
  desc: "Loss of client data",
  threat: "Human error / SaaS breach",
  vuln: "No backup for SaaS",
  L: 2,
  I: 3,
  level: "High",
  controls: "Strong passwords",
  annex: "A.8.13, A.5.14",
  treatment: "Mitigate",
  planned: "Implement CRM export backups monthly",
  owner: "COO",
  target: "2025-07-30",
  residual: "Medium"
}, {
  id: 3,
  asset: "Slack",
  desc: "Unauthorized message access",
  threat: "Account compromise",
  vuln: "Weak password / token misuse",
  L: 2,
  I: 2,
  level: "Medium",
  controls: "MFA",
  annex: "A.8.5",
  treatment: "Mitigate",
  planned: "Enable SSO & session timeout",
  owner: "MR",
  target: "2025-10-25",
  residual: "Low"
}, {
  id: 4,
  asset: "Hostinger (Web Hosting)",
  desc: "Website defacement / downtime",
  threat: "Malware / Exploit",
  vuln: "Shared hosting risk",
  L: 2,
  I: 3,
  level: "High",
  controls: "Firewalls",
  annex: "A.8.7, A.8.9",
  treatment: "Mitigate",
  planned: "Weekly website integrity scans",
  owner: "CDO",
  target: "2025-07-20",
  residual: "Medium"
}, {
  id: 5,
  asset: "ConnectTeam (HRIS)",
  desc: "HR data exposure",
  threat: "SaaS misconfig",
  vuln: "Excess user privileges",
  L: 2,
  I: 3,
  level: "High",
  controls: "Role-based access",
  annex: "A.8.3",
  treatment: "Mitigate",
  planned: "Quarterly access review",
  owner: "HR Manager",
  target: "2025-07-31",
  residual: "Low"
}, {
  id: 6,
  asset: "QuickBooks",
  desc: "Financial data loss",
  threat: "Phishing attack",
  vuln: "User unawareness",
  L: 2,
  I: 3,
  level: "High",
  controls: "MFA",
  annex: "A.8.5, A.7.3",
  treatment: "Mitigate",
  planned: "Security awareness training",
  owner: "Finance",
  target: "2025-01-25",
  residual: "Medium"
}, {
  id: 7,
  asset: "NordVPN",
  desc: "Misuse of VPN credentials",
  threat: "Account sharing",
  vuln: "No device validation",
  L: 2,
  I: 2,
  level: "Medium",
  controls: "Password policy",
  annex: "A.5.17",
  treatment: "Mitigate",
  planned: "Enable MFA on VPN",
  owner: "Cybersecurity Specialist",
  target: "2025-05-25",
  residual: "Low"
}, {
  id: 8,
  asset: "Controlio",
  desc: "Misuse of monitoring tool",
  threat: "Privilege misuse",
  vuln: "Excess admin rights",
  L: 2,
  I: 2,
  level: "Medium",
  controls: "Access restriction",
  annex: "A.8.2, A.8.3",
  treatment: "Mitigate",
  planned: "Limit admin to CTO only",
  owner: "CTO",
  target: "2025-07-20",
  residual: "Low"
}, {
  id: 9,
  asset: "Remote Working (BYOD)",
  desc: "Data leakage",
  threat: "Lost / stolen device",
  vuln: "No encryption",
  L: 3,
  I: 3,
  level: "Critical",
  controls: "Password protection",
  annex: "A.7.7, A.8.12",
  treatment: "Mitigate",
  planned: "Enforce disk encryption on devices",
  owner: "MR",
  target: "2025-07-15",
  residual: "Medium"
}, {
  id: 10,
  asset: "Zapier",
  desc: "Workflow automation failure",
  threat: "Integration errors",
  vuln: "Misconfigurations",
  L: 2,
  I: 2,
  level: "Medium",
  controls: "API key protection",
  annex: "A.8.9",
  treatment: "Mitigate",
  planned: "Central config review",
  owner: "COO",
  target: "2025-07-25",
  residual: "Low"
}, {
  id: 11,
  asset: "Telebirr",
  desc: "Payment blocking",
  threat: "Cyberattack",
  vuln: "No redundancy",
  L: 1,
  I: 3,
  level: "Medium",
  controls: "Vendor SLA",
  annex: "A.5.22",
  treatment: "Transfer",
  planned: "Redundancy via alternative platform",
  owner: "COO",
  target: "2025-08-30",
  residual: "Low"
}, {
  id: 12,
  asset: "Zoom",
  desc: "Call hijacking",
  threat: "Weak meeting security",
  vuln: "Users sharing links",
  L: 2,
  I: 2,
  level: "Medium",
  controls: "Waiting rooms",
  annex: "A.8.5",
  treatment: "Mitigate",
  planned: "Mandatory password for all meetings",
  owner: "HR",
  target: "2025-05-25",
  residual: "Low"
}, {
  id: 13,
  asset: "Monday.com",
  desc: "Data loss due to SaaS outage",
  threat: "Cloud disruption",
  vuln: "No backup",
  L: 2,
  I: 3,
  level: "High",
  controls: "Vendor SLA",
  annex: "A.5.22",
  treatment: "Mitigate",
  planned: "Weekly export of Kanban boards",
  owner: "COO",
  target: "2025-01-25",
  residual: "Medium"
}, {
  id: 14,
  asset: "Rempro SaaS Dev",
  desc: "Vulnerable code",
  threat: "Lack of secure coding",
  vuln: "No code review",
  L: 2,
  I: 3,
  level: "High",
  controls: "Secure coding",
  annex: "A.8.28",
  treatment: "Mitigate",
  planned: "Implement code review checklist",
  owner: "CDO",
  target: "2025-08-15",
  residual: "Medium"
}, {
  id: 15,
  asset: "Recruitment Data",
  desc: "PII leakage",
  threat: "Email phishing",
  vuln: "User negligence",
  L: 3,
  I: 3,
  level: "Critical",
  controls: "Training",
  annex: "A.7.3, A.5.34",
  treatment: "Mitigate",
  planned: "Enforce encrypted channels",
  owner: "HR Manager",
  target: "2025-01-24",
  residual: "Medium"
}, {
  id: 16,
  asset: "Supplier: Hostinger",
  desc: "DNS hijacking",
  threat: "Vendor-side attack",
  vuln: "Weak DNS config",
  L: 1,
  I: 3,
  level: "Medium",
  controls: "Registrar lock",
  annex: "A.5.22",
  treatment: "Mitigate",
  planned: "Enable DNSSEC",
  owner: "CDO",
  target: "2025-07-15",
  residual: "Low"
}, {
  id: 17,
  asset: "Email (M365 Outlook)",
  desc: "Business Email Compromise",
  threat: "Phishing",
  vuln: "User error",
  L: 3,
  I: 3,
  level: "Critical",
  controls: "Anti-phishing",
  annex: "A.8.7",
  treatment: "Mitigate",
  planned: "Defender ATP + phishing simulation",
  owner: "Cybersecurity Specialist",
  target: "2025-10-26",
  residual: "Medium"
}, {
  id: 18,
  asset: "Azure Backup",
  desc: "Incomplete backup",
  threat: "Config mistake",
  vuln: "Human error",
  L: 1,
  I: 3,
  level: "Medium",
  controls: "Enabled backup",
  annex: "A.8.13",
  treatment: "Mitigate",
  planned: "Schedule restore testing",
  owner: "CTO",
  target: "2025-08-20",
  residual: "Low"
}, {
  id: 19,
  asset: "Client Data Handling",
  desc: "Incorrect handling",
  threat: "Process weakness",
  vuln: "Untrained staff",
  L: 2,
  I: 3,
  level: "High",
  controls: "SOPs",
  annex: "A.7.3, A.5.10",
  treatment: "Mitigate",
  planned: "Mandatory onboarding training",
  owner: "COO",
  target: "2025-01-25",
  residual: "Medium"
}, {
  id: 20,
  asset: "Asset Inventory",
  desc: "Inaccurate or outdated asset list",
  threat: "Manual updates",
  vuln: "Human error",
  L: 2,
  I: 2,
  level: "Medium",
  controls: "Annual reviews",
  annex: "A.5.9",
  treatment: "Mitigate",
  planned: "Quarterly asset audits",
  owner: "MR",
  target: "2025-09-15",
  residual: "Low"
}];
window.OWNERS = [{
  initials: "CS",
  name: "Cybersecurity Specialist",
  color: "#2C7BE5"
}, {
  initials: "CO",
  name: "COO",
  color: "#15803D"
}, {
  initials: "MR",
  name: "MR",
  color: "#0E2A4A"
}, {
  initials: "CD",
  name: "CDO",
  color: "#D97706"
}, {
  initials: "HR",
  name: "HR Manager",
  color: "#B42318"
}, {
  initials: "FN",
  name: "Finance",
  color: "#92670A"
}, {
  initials: "CT",
  name: "CTO",
  color: "#163A66"
}, {
  initials: "HR",
  name: "HR",
  color: "#B42318"
}];
window.ownerFor = function (name) {
  return window.OWNERS.find(o => o.name === name) || {
    initials: name.slice(0, 2).toUpperCase(),
    name,
    color: "#4A5773"
  };
};
window.LEVEL_COLORS = {
  Critical: {
    fg: "#FFFFFF",
    bg: "#B42318",
    soft: "#FEF3F2",
    soft_border: "#FCE4E1",
    soft_fg: "#8A1A12"
  },
  High: {
    fg: "#FFFFFF",
    bg: "#D97706",
    soft: "#FEF6E7",
    soft_border: "#FCE7CE",
    soft_fg: "#A35307"
  },
  Medium: {
    fg: "#1F1502",
    bg: "#E5A82E",
    soft: "#FEF9E7",
    soft_border: "#FBEDC4",
    soft_fg: "#92670A"
  },
  Low: {
    fg: "#FFFFFF",
    bg: "#15803D",
    soft: "#ECFAF1",
    soft_border: "#D2F0DD",
    soft_fg: "#0F5C2D"
  }
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dashboard/risks-data.js", error: String((e && e.message) || e) }); }

})();
