// POST /api/contact — emails a website inquiry to the KMT inbox through Resend,
// then sends the visitor a branded confirmation if they left an email address.
//
// Vercel environment variables:
//   RESEND_API_KEY  (required) API key from resend.com
//   CONTACT_TO      inbox that receives inquiries        (default: info@kmtlogisticsllc.com)
//   CONTACT_FROM    sender, must be a Resend-verified domain
//                   (default: "KMT Website <onboarding@resend.dev>", which Resend only lets
//                    you send to the email address your Resend account was created with)
//   SITE_URL        public site address for email images, e.g. https://kmtlogisticsllc.com
//                   (default: Vercel's production domain, then this request's host)

const { inquiryEmail, inquiryText, visitorEmail, visitorText } = require("./_email");

const INTERESTS = ["Ship freight", "Dispatch", "ELD", "Lease-to-own", "MC startup"];
const LIMITS = { name: 120, company: 160, phone: 40, email: 200, notes: 4000, commodity: 120 };
const EQUIPMENT = ["Dry van", "Reefer", "Flatbed", "Expedited", "Dedicated lanes"];

// Freight quote fields. Returns an error message, or null when valid; fills `d` in place.
function readQuote(body, d) {
  d.originZip = clean(body.originZip, 5);
  d.destZip = clean(body.destZip, 5);
  if (!/^\d{5}$/.test(d.originZip)) return "Enter a 5-digit pickup ZIP.";
  if (!/^\d{5}$/.test(d.destZip)) return "Enter a 5-digit delivery ZIP.";
  d.equipment = EQUIPMENT.includes(body.equipment) ? body.equipment : "Dry van";
  const w = clean(body.weight, 10);
  if (w) {
    const n = Number(w);
    if (!Number.isInteger(n) || n < 1 || n > 80000) return "Weight should be between 1 and 80,000 lbs.";
    d.weight = n;
  }
  const pd = clean(body.pickupDate, 10);
  if (pd) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(pd) || isNaN(Date.parse(pd))) return "Pick a valid pickup date.";
    // One day of slack for visitors west of UTC; nothing more than a year out
    const day = 86400000, t = Date.parse(pd), now = Date.now();
    if (t < now - 2 * day || t > now + 366 * day) return "Pick a pickup date from today on.";
    d.pickupDate = pd;
  }
  d.commodity = clean(body.commodity, LIMITS.commodity);
  return null;
}

function clean(value, max) {
  return String(value == null ? "" : value).replace(/\u0000/g, "").trim().slice(0, max);
}

const DEFAULT_FROM = "KMT Website <onboarding@resend.dev>";
const DEFAULT_TO = "info@kmtlogisticsllc.com";

// GET /api/contact — setup check you can open in a browser. Never reveals the key itself.
async function status(res) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM || DEFAULT_FROM;
  const out = {
    keySet: !!key,
    keyValid: null,
    to: process.env.CONTACT_TO || DEFAULT_TO,
    from: from,
    usingResendTestSender: /@resend\.dev>?$/.test(from),
    domains: null,
    hint: ""
  };
  if (key) {
    try {
      const r = await fetch("https://api.resend.com/domains", { headers: { Authorization: "Bearer " + key } });
      const j = await r.json().catch(function () { return {}; });
      if (r.ok) {
        out.keyValid = true;
        out.domains = (j.data || []).map(function (d) { return { name: d.name, status: d.status }; });
      } else if (j.name === "restricted_api_key") {
        out.keyValid = true; // "Sending access" keys can send but not list domains
        out.domains = "not visible with a sending-only key";
      } else {
        out.keyValid = false;
      }
    } catch (e) {
      out.keyValid = null;
    }
  }
  if (!out.keySet) out.hint = "Add RESEND_API_KEY in Vercel > Settings > Environment Variables, then redeploy.";
  else if (out.keyValid === false) out.hint = "The API key was rejected by Resend. Create a new key and update RESEND_API_KEY, then redeploy.";
  else if (out.usingResendTestSender) out.hint = "Using Resend's test sender: emails are only delivered to the address your Resend account was created with. Verify kmtlogisticsllc.com in Resend and set CONTACT_FROM to deliver to anyone.";
  else out.hint = "Looks configured.";
  return res.status(200).json(out);
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "GET") return status(res);
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};

  // Honeypot: real visitors never fill this hidden field. Pretend success for bots.
  if (body._honey) return res.status(200).json({ ok: true });

  const d = {
    interest: INTERESTS.includes(body.interest) ? body.interest : "General",
    name: clean(body.name, LIMITS.name),
    company: clean(body.company, LIMITS.company),
    phone: clean(body.phone, LIMITS.phone),
    email: clean(body.email, LIMITS.email),
    notes: clean(body.notes, LIMITS.notes)
  };

  const isQuote = body.kind === "quote";
  if (isQuote) {
    d.kind = "quote";
    d.interest = "Ship freight";
    const qErr = readQuote(body, d);
    if (qErr) return res.status(400).json({ ok: false, error: qErr });
  }

  if (!d.name) return res.status(400).json({ ok: false, error: "Please add your name." });
  if (!d.phone && !d.email) {
    return res.status(400).json({ ok: false, error: "Add a phone number or email so we can reach you." });
  }
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) {
    return res.status(400).json({ ok: false, error: "That email address doesn't look right." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("contact: RESEND_API_KEY is not set");
    return res.status(500).json({ ok: false, reason: "not_configured", error: "Email is not configured yet." });
  }

  // Images in the email must load from a public address. The request host can be a
  // deployment URL behind Vercel login, so prefer the production domain Vercel provides.
  const host = process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    "https://" + req.headers.host;
  const siteUrl = host.replace(/\/+$/, "");
  const message = {
    from: process.env.CONTACT_FROM || DEFAULT_FROM,
    to: [process.env.CONTACT_TO || DEFAULT_TO],
    subject: isQuote
      ? "Freight quote — " + d.equipment + ", " + d.originZip + " → " + d.destZip
      : "KMT website inquiry — " + d.interest,
    html: inquiryEmail(d, siteUrl),
    text: inquiryText(d)
  };
  if (d.email) message.reply_to = d.email;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(message)
    });
    if (!r.ok) {
      const detail = await r.text();
      console.error("contact: Resend error", r.status, detail);
      // Short reason code for troubleshooting; Resend's full message stays in the Vercel logs
      let reason = "resend_" + r.status;
      if (/only send testing emails/i.test(detail)) reason = "resend_test_sender_restricted";
      else if (/domain is not verified/i.test(detail)) reason = "resend_domain_not_verified";
      else if (/api key is invalid/i.test(detail)) reason = "resend_invalid_key";
      return res.status(502).json({ ok: false, reason: reason, error: "Couldn't send right now." });
    }

    // Confirmation to the visitor. Best effort: the inquiry already reached KMT, so a failure
    // here (e.g. Resend's test sender, which only delivers to the account owner) never fails the form.
    let confirmationSent = false;
    if (d.email) {
      try {
        const c = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: message.from,
            to: [d.email],
            reply_to: message.to[0],
            subject: isQuote ? "We received your quote request — KMT Logistics" : "We received your inquiry — KMT Logistics",
            html: visitorEmail(d, siteUrl),
            text: visitorText(d)
          })
        });
        confirmationSent = c.ok;
        if (!c.ok) console.warn("contact: confirmation not sent", c.status, await c.text());
      } catch (err) {
        console.warn("contact: confirmation failed", err);
      }
    }
    return res.status(200).json({ ok: true, confirmationSent: confirmationSent });
  } catch (err) {
    console.error("contact: send failed", err);
    return res.status(502).json({ ok: false, reason: "network", error: "Couldn't send right now." });
  }
};
