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
 * Shared frame: navy cover with the KMT badge, a two-line headline and the half-truck art,
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
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="46" height="46" align="center" valign="middle" style="background:${BLUE};border-radius:10px;font-family:${FONT};font-size:14px;font-weight:800;color:#FFFFFF;line-height:1;">KMT<div style="width:22px;height:3px;background:${YELLOW};border-radius:2px;margin:5px auto 0;line-height:3px;font-size:0;">&nbsp;</div></td>
                      <td style="padding-left:12px;font-family:${FONT};font-size:19px;font-weight:800;letter-spacing:-0.5px;color:#FFFFFF;white-space:nowrap;">KMT LOGISTICS</td>
                    </tr>
                  </table>
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

/* ---------- Email to KMT: the full inquiry ---------- */

/** @param {object} d  { interest, name, company, phone, email, notes } */
function inquiryEmail(d, siteUrl) {
  const dash = `<span style="color:#97A0B5;">—</span>`;
  const phoneDigits = String(d.phone || "").replace(/[^0-9+]/g, "");
  const rows = [
    ["Interest", d.interest ? esc(d.interest) : dash],
    ["Name", d.name ? esc(d.name) : dash],
    ["Company / MC #", d.company ? esc(d.company) : dash],
    ["Phone", d.phone ? `<a href="tel:${esc(phoneDigits)}" style="color:${NAVY};text-decoration:none;">${esc(d.phone)}</a>` : dash],
    ["Email", d.email ? `<a href="mailto:${esc(d.email)}" style="color:${BLUE};text-decoration:none;">${esc(d.email)}</a>` : dash],
    ["Details", d.notes ? multiline(d.notes) : dash]
  ];
  const tableRows = rows.map((r, i) => row(r[0], r[1], i === rows.length - 1)).join("");

  return frame({
    title: "New website inquiry",
    preheader: `New ${d.interest || "website"} inquiry from ${d.name || "a visitor"}`,
    headline: "New website inquiry",
    highlight: d.interest || "General",
    siteUrl,
    body: `
        <!-- Intro -->
        <tr>
          <td style="padding:36px 32px 8px;">
            <h1 style="margin:0 0 12px;font-family:${FONT};font-size:28px;line-height:1.15;font-weight:800;letter-spacing:-0.5px;color:${NAVY};">New Website Inquiry</h1>
            <p style="margin:0;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK};">You have received a new inquiry from your website. Here are the details provided by the visitor:</p>
          </td>
        </tr>

        <!-- Details table -->
        <tr>
          <td style="padding:24px 32px 36px;">${detailsCard(esc((d.name || "?").trim().charAt(0).toUpperCase()), "Inquiry Details", tableRows)}
          </td>
        </tr>
`
  });
}

function inquiryText(d) {
  return [
    "New website inquiry — " + (d.interest || "General"),
    "",
    "Interest: " + (d.interest || "—"),
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
  const summary = [
    ["Request", esc(interest)],
    ["Response time", "Within one business hour"],
    ["Dispatch", "Open 24/7"]
  ].map((r, i, all) => row(r[0], r[1], i === all.length - 1)).join("");
  const check = `<span style="font-size:16px;line-height:1;">&#10003;</span>`;

  return frame({
    title: "We received your inquiry",
    preheader: "Thanks for contacting KMT Logistics — we'll reach out within one business hour.",
    headline: "Thanks for reaching out",
    highlight: "We received your inquiry",
    siteUrl,
    body: `
        <!-- Greeting -->
        <tr>
          <td style="padding:36px 32px 8px;">
            <h1 style="margin:0 0 12px;font-family:${FONT};font-size:28px;line-height:1.15;font-weight:800;letter-spacing:-0.5px;color:${NAVY};">${name ? "Hi " + esc(name) + "," : "Hi there,"}</h1>
            <p style="margin:0;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK};">Thanks for contacting KMT Logistics. We've received your inquiry about <strong style="color:${NAVY};">${esc(interest)}</strong>, and a member of our team will get back to you within one business hour.</p>
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
              ["02", "We reach out", "A real person calls or emails you back within one business hour."],
              ["03", "Get rolling", "We line up your quote, dispatcher or next steps — whatever you need."]
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
    "Thanks for contacting KMT Logistics. We've received your inquiry about " + (d.interest || "General") +
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

module.exports = { inquiryEmail, inquiryText, visitorEmail, visitorText };
