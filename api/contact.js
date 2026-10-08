// POST /api/contact — emails a website inquiry to the KMT inbox through Resend.
//
// Vercel environment variables:
//   RESEND_API_KEY  (required) API key from resend.com
//   CONTACT_TO      inbox that receives inquiries        (default: info@kmtlogisticsllc.com)
//   CONTACT_FROM    sender, must be a Resend-verified domain
//                   (default: "KMT Website <onboarding@resend.dev>", which Resend only lets
//                    you send to the email address your Resend account was created with)
//   SITE_URL        public site address for the banner image (default: this request's host)

const { inquiryEmail, inquiryText } = require("./_email");

const INTERESTS = ["Ship freight", "Dispatch", "ELD", "Lease-to-own", "MC startup"];
const LIMITS = { name: 120, company: 160, phone: 40, email: 200, notes: 4000 };

function clean(value, max) {
  return String(value == null ? "" : value).replace(/\u0000/g, "").trim().slice(0, max);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
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
    return res.status(500).json({ ok: false, error: "Email is not configured yet." });
  }

  const siteUrl = (process.env.SITE_URL || "https://" + req.headers.host).replace(/\/+$/, "");
  const message = {
    from: process.env.CONTACT_FROM || "KMT Website <onboarding@resend.dev>",
    to: [process.env.CONTACT_TO || "info@kmtlogisticsllc.com"],
    subject: "KMT website inquiry — " + d.interest,
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
      console.error("contact: Resend error", r.status, await r.text());
      return res.status(502).json({ ok: false, error: "Couldn't send right now." });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("contact: send failed", err);
    return res.status(502).json({ ok: false, error: "Couldn't send right now." });
  }
};
