// Branded HTML email for website inquiries (table layout + inline styles for email clients).
// Files starting with "_" in /api are not deployed as functions on Vercel.

const NAVY = "#0A1630";
const BLUE = "#1747E6";
const YELLOW = "#FFD60A";
const INK = "#4B5873";
const LINE = "#E2E8F3";
const FONT = "'Plus Jakarta Sans', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// Escape, then keep the visitor's line breaks
function multiline(value) {
  return esc(value).replace(/\r?\n/g, "<br>");
}

function row(label, valueHtml, last) {
  const border = last ? "" : `border-bottom:1px solid ${LINE};`;
  return `
          <tr>
            <td width="34%" valign="top" style="padding:16px 20px;${border}border-right:1px solid ${LINE};font-family:${FONT};font-size:14px;font-weight:700;color:#13224A;">${esc(label)}</td>
            <td valign="top" style="padding:16px 20px;${border}font-family:${FONT};font-size:14px;line-height:1.55;color:${NAVY};">${valueHtml}</td>
          </tr>`;
}

/**
 * @param {object} d  { interest, name, company, phone, email, notes }
 * @param {string} siteUrl  e.g. "https://kmtlogisticsllc.com" — used for the banner image
 */
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>New website inquiry</title>
</head>
<body style="margin:0;padding:0;background:#F2F6FF;">
<div style="display:none;max-height:0;overflow:hidden;">New ${esc(d.interest || "website")} inquiry from ${esc(d.name || "a visitor")}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F2F6FF;">
  <tr>
    <td align="center" style="padding:28px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#FFFFFF;border:1px solid ${LINE};border-radius:14px;overflow:hidden;">

        <!-- Cover -->
        <tr>
          <td style="background:${NAVY};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td valign="middle" style="padding:30px 0 30px 30px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="46" height="46" align="center" valign="middle" style="background:${BLUE};border-radius:10px;font-family:${FONT};font-size:14px;font-weight:800;color:#FFFFFF;line-height:1;">KMT<div style="width:22px;height:3px;background:${YELLOW};border-radius:2px;margin:5px auto 0;line-height:3px;font-size:0;">&nbsp;</div></td>
                      <td style="padding-left:12px;font-family:${FONT};font-size:19px;font-weight:800;letter-spacing:-0.5px;color:#FFFFFF;white-space:nowrap;">KMT LOGISTICS</td>
                    </tr>
                  </table>
                  <div style="margin-top:22px;font-family:${FONT};font-size:20px;line-height:1.25;font-weight:700;color:#FFFFFF;">New website inquiry</div>
                  <div style="font-family:${FONT};font-size:22px;line-height:1.25;font-weight:800;color:${YELLOW};">${esc(d.interest || "General")}</div>
                </td>
                <td width="240" valign="bottom" align="right" style="width:240px;line-height:0;font-size:0;">
                  <img src="${esc(siteUrl)}/assets/img/email-banner.jpg" width="240" height="180" alt="" style="display:block;width:240px;height:180px;border:0;">
                </td>
              </tr>
            </table>
            <div style="height:5px;line-height:5px;font-size:0;background:${YELLOW};">&nbsp;</div>
          </td>
        </tr>

        <!-- Intro -->
        <tr>
          <td style="padding:36px 32px 8px;">
            <h1 style="margin:0 0 12px;font-family:${FONT};font-size:28px;line-height:1.15;font-weight:800;letter-spacing:-0.5px;color:${NAVY};">New Website Inquiry</h1>
            <p style="margin:0;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK};">You have received a new inquiry from your website. Here are the details provided by the visitor:</p>
          </td>
        </tr>

        <!-- Details table -->
        <tr>
          <td style="padding:24px 32px 36px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${LINE};border-radius:10px;border-collapse:separate;overflow:hidden;">
              <tr>
                <td colspan="2" style="background:#F2F6FF;padding:16px 20px;border-bottom:1px solid ${LINE};">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="34" height="34" align="center" valign="middle" style="background:${YELLOW};border-radius:17px;font-family:${FONT};font-size:15px;font-weight:800;color:${NAVY};">${esc((d.name || "?").trim().charAt(0).toUpperCase())}</td>
                      <td style="padding-left:12px;font-family:${FONT};font-size:18px;font-weight:800;color:${NAVY};">Inquiry Details</td>
                    </tr>
                  </table>
                </td>
              </tr>${tableRows}
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
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

module.exports = { inquiryEmail, inquiryText };
