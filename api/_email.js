// Branded HTML emails for website inquiries (table layout + inline styles for email clients).
// Files starting with "_" in /api are not deployed as functions on Vercel.

const NAVY = "#0A1630";
const BLUE = "#1747E6";
const YELLOW = "#FFD60A";
const INK = "#4B5873";
const LINE = "#E2E8F3";
const FONT = "'Plus Jakarta Sans', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

// Contact details shown in the visitor's confirmation email
const DISPATCH_PHONE = "(555) 014-2200"; // placeholder: replace with KMT's real 24/7 number
const DISPATCH_EMAIL = "dispatch@kmtlogisticsllc.com";

function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// Escape, then keep the visitor's line breaks
function multiline(value) {
  return esc(value).replace(/\r?\n/g, "<br>");
}

// First name only, letters/apostrophes/hyphens, so the greeting can't carry arbitrary text
function firstName(name) {
  const m = String(name || "").trim().match(/^[\p{L}'-]+/u);
  return m ? m[0].slice(0, 30) : "";
}

function row(label, valueHtml, last) {
  const border = last ? "" : `border-bottom:1px solid ${LINE};`;
  return `
          <tr>
            <td width="34%" valign="top" style="padding:16px 20px;${border}border-right:1px solid ${LINE};font-family:${FONT};font-size:14px;font-weight:700;color:#13224A;">${esc(label)}</td>
            <td valign="top" style="padding:16px 20px;${border}font-family:${FONT};font-size:14px;line-height:1.55;color:${NAVY};">${valueHtml}</td>
          </tr>`;
}

// Card with a small round badge + title, wrapping a two-column table
function detailsCard(badge, title, tableRows) {
  return `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${LINE};border-radius:10px;border-collapse:separate;overflow:hidden;">
              <tr>
                <td colspan="2" style="background:#F2F6FF;padding:16px 20px;border-bottom:1px solid ${LINE};">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="34" height="34" align="center" valign="middle" style="background:${YELLOW};border-radius:17px;font-family:${FONT};font-size:15px;font-weight:800;color:${NAVY};">${badge}</td>
                      <td style="padding-left:12px;font-family:${FONT};font-size:18px;font-weight:800;color:${NAVY};">${esc(title)}</td>
                    </tr>
                  </table>
                </td>
              </tr>${tableRows}
            </table>`;
}

/**
 * Shared frame: navy cover with the KMT logo, a two-line headline and the half-truck art,
 * then the body rows.
 * @param {string} siteUrl  public address the truck image loads from, e.g. "https://kmtlogisticsllc.com"
 */
function frame({ title, preheader, headline, highlight, siteUrl, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:#F2F6FF;">
<div style="display:none;max-height:0;overflow:hidden;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F2F6FF;">
  <tr>
    <td align="center" style="padding:24px 10px;">
      <table role="presentation" width="800" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:800px;background:#FFFFFF;border:1px solid ${LINE};border-radius:14px;overflow:hidden;">

        <!-- Cover: logo + headline on navy, front half of the KMT truck on the right -->
        <tr>
          <td style="background:${NAVY};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td valign="middle" style="padding:28px 0 26px 30px;">
                  <img src="${esc(siteUrl)}/assets/img/email-logo.png" width="176" height="71" alt="KMT Logistics" style="display:block;width:176px;max-width:176px;height:auto;border:0;background:${NAVY};">
                  <div style="margin-top:20px;font-family:${FONT};font-size:20px;line-height:1.25;font-weight:700;color:#FFFFFF;">${esc(headline)}</div>
                  <div style="font-family:${FONT};font-size:22px;line-height:1.25;font-weight:800;color:${YELLOW};">${esc(highlight)}</div>
                </td>
                <td width="340" valign="middle" align="right" bgcolor="${NAVY}" style="width:340px;line-height:0;font-size:0;background:${NAVY};">
                  <img src="${esc(siteUrl)}/assets/img/email-truck.png" width="340" height="150" alt="" style="display:block;width:100%;max-width:340px;height:auto;border:0;background:${NAVY};">
                </td>
              </tr>
            </table>
            <div style="height:5px;line-height:5px;font-size:0;background:${YELLOW};">&nbsp;</div>
          </td>
        </tr>
${body}
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// "2026-10-14" -> "Wed, Oct 14, 2026" (no timezone shifts)
function prettyDate(iso) {
  if (!iso) return "";
  const [y, m, day] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, day));
  return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function lane(d) {
  return `${esc(d.originZip)} <span style="color:${BLUE};font-weight:800;">&rarr;</span> ${esc(d.destZip)}`;
}

/* ---------- Email to KMT: the full inquiry ---------- */

/** @param {object} d  { interest, name, company, phone, email, notes } */
function inquiryEmail(d, siteUrl) {
  const dash = `<span style="color:#97A0B5;">—</span>`;
  const phoneDigits = String(d.phone || "").replace(/[^0-9+]/g, "");
  const rows = [
    ["Interest", d.interest ? esc(d.interest) : dash],
    ["Current setup", d.setup ? esc(d.setup) : dash],
    ["Authority status", d.authority ? esc(d.authority) : dash],
    ["Truck / trailer", d.equipmentType ? esc(d.equipmentType) : dash],
    ["Name", d.name ? esc(d.name) : dash],
    ["Company / MC #", d.company ? esc(d.company) : dash],
    ["Phone", d.phone ? `<a href="tel:${esc(phoneDigits)}" style="color:${NAVY};text-decoration:none;">${esc(d.phone)}</a>` : dash],
    ["Email", d.email ? `<a href="mailto:${esc(d.email)}" style="color:${BLUE};text-decoration:none;">${esc(d.email)}</a>` : dash],
    ["Details", d.notes ? multiline(d.notes) : dash]
  ];
  const tableRows = rows.map((r, i) => row(r[0], r[1], i === rows.length - 1)).join("");
  const isQuote = d.kind === "quote";
  let laneCard = "";
  if (isQuote) {
    const q = [
      ["Lane", lane(d)],
      ["Equipment", esc(d.equipment)],
      ["Weight", d.weight ? esc(d.weight.toLocaleString("en-US")) + " lbs" : dash],
      ["Pickup date", d.pickupDate ? esc(prettyDate(d.pickupDate)) : dash],
      ["Commodity", d.commodity ? esc(d.commodity) : dash]
    ];
    const truck = `<span style="font-size:15px;line-height:1;">&#9654;</span>`;
    laneCard = `
        <tr>
          <td style="padding:24px 32px 0;">${detailsCard(truck, "Shipment", q.map((r, i) => row(r[0], r[1], i === q.length - 1)).join(""))}
          </td>
        </tr>`;
  }

  return frame({
    title: isQuote ? "New freight quote request" : "New website inquiry",
    preheader: isQuote
      ? `Quote request: ${d.equipment}, ${d.originZip} to ${d.destZip}, from ${d.name || "a visitor"}`
      : `New ${d.interest || "website"} inquiry from ${d.name || "a visitor"}`,
    headline: isQuote ? "New freight quote request" : "New website inquiry",
    highlight: isQuote ? `${d.equipment} · ${d.originZip} → ${d.destZip}` : (d.interest || "General"),
    siteUrl,
    body: `
        <!-- Intro -->
        <tr>
          <td style="padding:36px 32px 8px;">
            <h1 style="margin:0 0 12px;font-family:${FONT};font-size:28px;line-height:1.15;font-weight:800;letter-spacing:-0.5px;color:${NAVY};">${isQuote ? "New Quote Request" : "New Website Inquiry"}</h1>
            <p style="margin:0;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK};">${isQuote ? "A shipper requested a rate from the freight page. Here's the lane and their contact details:" : "You have received a new inquiry from your website. Here are the details provided by the visitor:"}</p>
          </td>
        </tr>
${laneCard}
        <!-- Details table -->
        <tr>
          <td style="padding:24px 32px 36px;">${detailsCard(esc((d.name || "?").trim().charAt(0).toUpperCase()), isQuote ? "Contact" : "Inquiry Details", tableRows)}
          </td>
        </tr>
`
  });
}

function inquiryText(d) {
  const quote = d.kind === "quote" ? [
    "Lane: " + d.originZip + " -> " + d.destZip,
    "Equipment: " + d.equipment,
    "Weight: " + (d.weight ? d.weight + " lbs" : "—"),
    "Pickup date: " + (d.pickupDate ? prettyDate(d.pickupDate) : "—"),
    "Commodity: " + (d.commodity || "—"),
    ""
  ] : [];
  return [
    d.kind === "quote" ? "New freight quote request" : "New website inquiry — " + (d.interest || "General"),
    "",
    ...quote,
    "Interest: " + (d.interest || "—"),
    "Current setup: " + (d.setup || "—"),
    "Authority status: " + (d.authority || "—"),
    "Truck / trailer: " + (d.equipmentType || "—"),
    "Name: " + (d.name || "—"),
    "Company / MC #: " + (d.company || "—"),
    "Phone: " + (d.phone || "—"),
    "Email: " + (d.email || "—"),
    "",
    "Details:",
    d.notes || "—"
  ].join("\n");
}

/* ---------- Email to the visitor: confirmation ----------
   Deliberately does not echo the visitor's free-text fields (message, company, phone):
   anyone can type any address into the form, so this email must not carry text they chose. */

// Horizontal milestone track: numbered circles joined by a line, text under each.
// Built from table cells (no flexbox/positioning) so it holds up in Gmail and Outlook.
function milestones(steps) {
  const TRACK = "#C7D5F7";
  const col = (100 / steps.length).toFixed(2) + "%";
  const line = (show) => `<div style="height:3px;line-height:3px;font-size:0;background:${show ? TRACK : "transparent"};">&nbsp;</div>`;
  const markers = steps.map((st, i) => `
                <td width="${col}" valign="middle" style="padding:0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="50%" valign="middle">${line(i > 0)}</td>
                      <td width="40" valign="middle" style="width:40px;">
                        <div style="width:40px;height:40px;line-height:40px;border-radius:20px;background:${BLUE};color:#FFFFFF;text-align:center;font-family:${FONT};font-size:14px;font-weight:800;box-shadow:0 0 0 5px #E1EAFF;">${st[0]}</div>
                      </td>
                      <td width="50%" valign="middle">${line(i < steps.length - 1)}</td>
                    </tr>
                  </table>
                </td>`).join("");
  const labels = steps.map((st) => `
                <td width="${col}" valign="top" align="center" style="padding:16px 8px 0;font-family:${FONT};text-align:center;">
                  <div style="font-size:15px;font-weight:800;line-height:1.3;color:${NAVY};">${esc(st[1])}</div>
                  <div style="margin-top:5px;font-size:13px;line-height:1.5;color:${INK};">${esc(st[2])}</div>
                </td>`).join("");
  return `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;">
              <tr>${markers}
              </tr>
              <tr>${labels}
              </tr>
            </table>`;
}

function visitorEmail(d, siteUrl) {
  const name = firstName(d.name);
  const interest = d.interest || "General";
  const phoneDigits = DISPATCH_PHONE.replace(/[^0-9+]/g, "");
  const isQuote = d.kind === "quote";
  // Quote summary uses only server-validated fields (ZIPs, equipment list, date), never free text
  const summaryRows = isQuote ? [
    ["Request", "Freight quote"],
    ["Lane", lane(d)],
    ["Equipment", esc(d.equipment)],
    ["Pickup date", d.pickupDate ? esc(prettyDate(d.pickupDate)) : "Flexible"],
    ["Response time", "Within one business hour"]
  ] : [
    ["Request", esc(interest)],
    ["Response time", "Within one business hour"],
    ["Dispatch", "Open 24/7"]
  ];
  const summary = summaryRows.map((r, i, all) => row(r[0], r[1], i === all.length - 1)).join("");
  const check = `<span style="font-size:16px;line-height:1;">&#10003;</span>`;
  const about = isQuote
    ? `a <strong style="color:${NAVY};">${esc(d.equipment)}</strong> rate from <strong style="color:${NAVY};">${esc(d.originZip)}</strong> to <strong style="color:${NAVY};">${esc(d.destZip)}</strong>`
    : `<strong style="color:${NAVY};">${esc(interest)}</strong>`;

  return frame({
    title: isQuote ? "We received your quote request" : "We received your inquiry",
    preheader: "Thanks for contacting KMT Logistics — we'll reach out within one business hour.",
    headline: "Thanks for reaching out",
    highlight: isQuote ? "We received your quote request" : "We received your inquiry",
    siteUrl,
    body: `
        <!-- Greeting -->
        <tr>
          <td style="padding:36px 32px 8px;">
            <h1 style="margin:0 0 12px;font-family:${FONT};font-size:28px;line-height:1.15;font-weight:800;letter-spacing:-0.5px;color:${NAVY};">${name ? "Hi " + esc(name) + "," : "Hi there,"}</h1>
            <p style="margin:0;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK};">Thanks for contacting KMT Logistics. We've received your ${isQuote ? "request for" : "inquiry about"} ${about}, and ${isQuote ? "a dispatcher will get back to you with a rate" : "a member of our team will get back to you"} within one business hour.</p>
          </td>
        </tr>

        <!-- Confirmation banner -->
        <tr>
          <td style="padding:22px 32px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ECFAF1;border:1px solid #CDEFD9;border-radius:12px;">
              <tr>
                <td width="58" valign="middle" style="padding:16px 0 16px 18px;">
                  <div style="width:34px;height:34px;line-height:34px;border-radius:17px;background:#22C55E;color:#FFFFFF;text-align:center;font-family:${FONT};font-weight:800;">${check}</div>
                </td>
                <td valign="middle" style="padding:16px 18px 16px 4px;font-family:${FONT};font-size:15px;font-weight:700;line-height:1.4;color:#15803D;">Got it — we'll reach out within one business hour.</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Summary -->
        <tr>
          <td style="padding:24px 32px 0;">${detailsCard(check, "Your request", summary)}
          </td>
        </tr>

        <!-- What happens next -->
        <tr>
          <td style="padding:30px 32px 0;">
            <div style="font-family:${FONT};font-size:18px;font-weight:800;color:${NAVY};margin-bottom:22px;">What happens next</div>${milestones([
              ["01", "We review your request", "Your inquiry goes straight to the KMT team."],
              isQuote
                ? ["02", "You get a rate", "A dispatcher prices your lane and replies within one business hour."]
                : ["02", "We reach out", "A real person calls or emails you back within one business hour."],
              isQuote
                ? ["03", "Book the load", "Happy with the rate? We confirm pickup and send the rate con."]
                : ["03", "Get rolling", "We line up your quote, dispatcher or next steps — whatever you need."]
            ])}
          </td>
        </tr>

        <!-- Need us sooner -->
        <tr>
          <td style="padding:30px 32px 36px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${NAVY};border-radius:12px;">
              <tr>
                <td style="padding:22px 24px;font-family:${FONT};">
                  <div style="font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:${YELLOW};">Need us sooner?</div>
                  <div style="margin-top:8px;font-size:15px;line-height:1.6;color:#C9D4EE;">Dispatch is open 24/7. Call <a href="tel:${esc(phoneDigits)}" style="color:#FFFFFF;font-weight:800;text-decoration:none;">${esc(DISPATCH_PHONE)}</a> or email <a href="mailto:${DISPATCH_EMAIL}" style="color:#FFFFFF;font-weight:800;text-decoration:none;">${DISPATCH_EMAIL}</a>.</div>
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
                    <tr>
                      <td style="background:${YELLOW};border-radius:9px;">
                        <a href="${esc(siteUrl)}" style="display:inline-block;padding:12px 22px;font-family:${FONT};font-size:14px;font-weight:800;color:${NAVY};text-decoration:none;">Visit our website</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:0 32px 30px;font-family:${FONT};font-size:12px;line-height:1.6;color:#97A0B5;border-top:1px solid ${LINE};">
            <div style="padding-top:18px;">KMT Logistics LLC · Nationwide freight, dispatch, ELD, lease-to-own and MC startup.</div>
            <div>You're receiving this because this address was entered in the contact form on our website. If that wasn't you, you can ignore this email.</div>
          </td>
        </tr>
`
  });
}

function visitorText(d) {
  const name = firstName(d.name);
  return [
    (name ? "Hi " + name : "Hi there") + ",",
    "",
    "Thanks for contacting KMT Logistics. We've received your " +
      (d.kind === "quote" ? "quote request for " + d.equipment + " from " + d.originZip + " to " + d.destZip : "inquiry about " + (d.interest || "General")) +
      " and a member of our team will get back to you within one business hour.",
    "",
    "What happens next:",
    "01  We review your request",
    "02  We reach out — a real person calls or emails you back",
    "03  Get rolling",
    "",
    "Need us sooner? Dispatch is open 24/7: " + DISPATCH_PHONE + " · " + DISPATCH_EMAIL,
    "",
    "You're receiving this because this address was entered in the contact form on our website.",
    "If that wasn't you, you can ignore this email."
  ].join("\n");
}

/* ---------- Cost-per-mile calculator ----------
   Everything shown from the calculator is a number computed server-side (api/_cpm.js), never visitor text. */

const money = (n, digits) => "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: digits == null ? 2 : digits, maximumFractionDigits: digits == null ? 2 : digits });
const CPM_LABELS = [["fuel", "Fuel"], ["truck", "Truck payment + depreciation"], ["insurance", "Insurance"], ["maintenance", "Maintenance + tires"], ["hidden", "Tolls, permits, software &amp; other"], ["buffer", "Downtime buffer"]];

// Big result tiles + a bar per cost category
function cpmSummary(r) {
  const tile = (label, value, sub, dark) => `
                <td width="50%" valign="top" style="padding:0 6px;">
                  <div style="background:${dark ? NAVY : "#F2F6FF"};border-radius:12px;padding:18px 20px;font-family:${FONT};">
                    <div style="font-size:12px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:${dark ? YELLOW : BLUE};">${label}</div>
                    <div style="margin-top:6px;font-size:30px;font-weight:800;line-height:1.1;color:${dark ? "#FFFFFF" : NAVY};">${value}</div>
                    <div style="margin-top:4px;font-size:13px;color:${dark ? "#C9D4EE" : INK};">${sub}</div>
                  </div>
                </td>`;
  const bars = CPM_LABELS.map(([k, label]) => {
    const v = r.parts[k], pct = r.total > 0 ? Math.round(v / r.total * 100) : 0;
    return `
              <tr>
                <td style="padding:8px 0;font-family:${FONT};font-size:14px;color:${NAVY};">${label}</td>
                <td width="90" align="right" style="padding:8px 0;font-family:${FONT};font-size:14px;font-weight:800;color:${NAVY};">${money(v)}/mi</td>
                <td width="48" align="right" style="padding:8px 0;font-family:${FONT};font-size:13px;color:${INK};">${pct}%</td>
              </tr>
              <tr><td colspan="3" style="padding:0 0 4px;"><div style="height:6px;border-radius:3px;background:#E1EAFF;"><div style="width:${Math.max(2, pct)}%;height:6px;border-radius:3px;background:${BLUE};"></div></div></td></tr>`;
  }).join("");
  return `
        <tr>
          <td style="padding:28px 26px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${tile("True cost per mile", money(r.total), "every mile driven, incl. deadhead", true)}${tile("Minimum rate", money(r.minRate) + "/mi", "per loaded mile, incl. profit target", false)}</tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 26px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${tile("Monthly operating cost", money(r.monthlyCost, 0), "at your monthly miles", false)}${tile("Revenue needed / month", money(r.revenueNeeded, 0), money(r.monthlyProfit, 0) + " of it is your profit target", false)}</tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:26px 32px 0;">
            <div style="font-family:${FONT};font-size:18px;font-weight:800;color:${NAVY};margin-bottom:8px;">Cost breakdown</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${bars}
            </table>
          </td>
        </tr>`;
}

function cpmInputsRows(i) {
  const rows = [
    ["Monthly miles", Number(i.miles).toLocaleString("en-US") + " mi"], ["Deadhead", i.deadhead + "%"],
    ["Profit target", money(i.profit) + "/mi"], ["Downtime buffer", i.buffer + "%"],
    ["Diesel / MPG", money(i.diesel) + "/gal · " + i.mpg + " mpg"],
    ["Truck payment / depreciation", money(i.payment, 0) + " / " + money(i.depreciation, 0)],
    ["Insurance", money(i.insurance, 0)], ["Maintenance / tires", money(i.maintenance, 0) + " / " + money(i.tires, 0)],
    ["Tolls · permits · software · parking · other", [i.tolls, i.permits, i.software, i.parking, i.other].map(n => money(n, 0)).join(" · ")]
  ];
  return rows.map((r, k) => row(r[0], r[1], k === rows.length - 1)).join("");
}

function cpmEmail(d, siteUrl) {
  const r = d.cpmResult, dash = `<span style="color:#97A0B5;">—</span>`;
  const phoneDigits = String(d.phone || "").replace(/[^0-9+]/g, "");
  const contact = [
    ["Name", esc(d.name)],
    ["Phone", `<a href="tel:${esc(phoneDigits)}" style="color:${NAVY};text-decoration:none;">${esc(d.phone)}</a>`],
    ["Email", `<a href="mailto:${esc(d.email)}" style="color:${BLUE};text-decoration:none;">${esc(d.email)}</a>`],
    ["State", d.state ? esc(d.state) : dash],
    ["Own authority", d.ownAuthority ? esc(d.ownAuthority) : dash]
  ].map((x, k, a) => row(x[0], x[1], k === a.length - 1)).join("");
  return frame({
    title: "New cost-per-mile lead", preheader: `${d.name} ran the cost-per-mile calculator: ${money(r.total)}/mi`,
    headline: "Cost-per-mile calculator lead", highlight: money(r.total) + " per mile · min " + money(r.minRate) + "/mi", siteUrl,
    body: `
        <tr>
          <td style="padding:32px 32px 0;">
            <h1 style="margin:0 0 10px;font-family:${FONT};font-size:26px;line-height:1.15;font-weight:800;color:${NAVY};">An owner-operator ran the numbers</h1>
            <p style="margin:0;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK};">Here are their results and the figures they entered — a good opening for a dispatch or lease-to-own conversation.</p>
          </td>
        </tr>
        <tr><td style="padding:22px 32px 0;">${detailsCard(esc((d.name || "?").trim().charAt(0).toUpperCase()), "Contact", contact)}
        </td></tr>
${cpmSummary(r)}
        <tr><td style="padding:26px 32px 36px;">${detailsCard("$", "What they entered (monthly)", cpmInputsRows(d.cpmInputs))}
        </td></tr>
`
  });
}

function cpmText(d) {
  const r = d.cpmResult;
  return ["Cost-per-mile calculator lead", "", "Name: " + d.name, "Phone: " + d.phone, "Email: " + d.email,
    "State: " + (d.state || "—"), "Own authority: " + (d.ownAuthority || "—"), "",
    "True cost per mile: " + money(r.total), "Minimum rate: " + money(r.minRate) + "/loaded mi",
    "Monthly operating cost: " + money(r.monthlyCost, 0), "Revenue needed / month: " + money(r.revenueNeeded, 0), "",
    ...CPM_LABELS.map(([k, l]) => l.replace("&amp;", "&") + ": " + money(r.parts[k]) + "/mi")].join("\n");
}

function cpmVisitorEmail(d, siteUrl) {
  const r = d.cpmResult, name = firstName(d.name);
  const big = Object.keys(r.parts).filter(k => k !== "buffer").sort((a, b) => r.parts[b] - r.parts[a])[0];
  const bigLabel = (CPM_LABELS.find(x => x[0] === big) || ["", "Fuel"])[1];
  return frame({
    title: "Your truck cost per mile", preheader: `Your true cost per mile is ${money(r.total)} — minimum rate ${money(r.minRate)}/mi.`,
    headline: "Your cost-per-mile results", highlight: money(r.total) + " per mile", siteUrl,
    body: `
        <tr>
          <td style="padding:32px 32px 0;">
            <h1 style="margin:0 0 10px;font-family:${FONT};font-size:26px;line-height:1.15;font-weight:800;color:${NAVY};">${name ? "Hi " + esc(name) + "," : "Hi there,"}</h1>
            <p style="margin:0;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK};">Here's your truck cost per mile from the KMT Logistics calculator. Your biggest cost is <strong style="color:${NAVY};">${bigLabel}</strong>. Don't take a load below your minimum rate.</p>
          </td>
        </tr>
${cpmSummary(r)}
        <tr>
          <td style="padding:30px 32px 36px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${NAVY};border-radius:12px;">
              <tr><td style="padding:22px 24px;font-family:${FONT};">
                <div style="font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:${YELLOW};">Want loads above your rate?</div>
                <div style="margin-top:8px;font-size:15px;line-height:1.6;color:#C9D4EE;">KMT dispatchers negotiate rates and plan your lanes so every load clears your cost per mile. Call ${esc(DISPATCH_PHONE)} or reply to this email.</div>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;"><tr><td style="background:${YELLOW};border-radius:9px;">
                  <a href="${esc(siteUrl)}/dispatch" style="display:inline-block;padding:12px 22px;font-family:${FONT};font-size:14px;font-weight:800;color:${NAVY};text-decoration:none;">Get a dispatcher</a>
                </td></tr></table>
              </td></tr>
            </table>
            <p style="margin:18px 0 0;font-family:${FONT};font-size:12px;line-height:1.6;color:#97A0B5;">Estimates for planning only, based on the numbers you entered. Actual costs vary. This isn't financial, tax or insurance advice.</p>
          </td>
        </tr>
`
  });
}

function cpmVisitorText(d) {
  const r = d.cpmResult;
  return [(firstName(d.name) ? "Hi " + firstName(d.name) : "Hi there") + ",", "",
    "Your truck cost per mile from the KMT Logistics calculator:", "",
    "True cost per mile: " + money(r.total), "Minimum rate: " + money(r.minRate) + " per loaded mile",
    "Monthly operating cost: " + money(r.monthlyCost, 0), "Revenue needed per month: " + money(r.revenueNeeded, 0), "",
    "Want loads above your rate? KMT dispatch: " + DISPATCH_PHONE, "",
    "Estimates for planning only. Not financial, tax or insurance advice."].join("\n");
}

module.exports = { inquiryEmail, inquiryText, visitorEmail, visitorText, cpmEmail, cpmText, cpmVisitorEmail, cpmVisitorText };

