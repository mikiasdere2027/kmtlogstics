# KMT Logistics website

Static marketing site built from the Claude Design file `KMT Logistics Site v3`.
No build step: everything that gets deployed lives in `public/`.

```
public/                 ← deploy this folder
  index.html            ← home page (with the contact form)
  freight.html  dispatch.html  eld.html  lease-to-own.html  mc-startup.html  ← service pages
  robots.txt
  assets/css/styles.css
  assets/js/main.js     ← contact form (interest pills, validation, submit)
  assets/img/favicon.svg
api/contact.js          ← Vercel function: emails contact-form inquiries via Resend
api/_email.js           ← branded HTML email layout (preview: design-source/email-preview.png)
design-source/          ← original Claude Design export (not deployed)
netlify.toml            ← Netlify: publish = public
vercel.json             ← Vercel: outputDirectory = public
```

All links are relative, so the site works opened straight from disk (double-click
`public/index.html`) and on any host. On Vercel, `cleanUrls` also serves `/freight` for
`freight.html`. The header and footer are repeated in every page — edit all six when they change.
Service pages link to the home form as `index.html?interest=Dispatch#contact` to preselect the interest.

## Preview locally

```bash
npx serve public
```

## Deploy

- **Vercel:** import the repo; `vercel.json` already points at `public/`.
- **Netlify:** import the repo, or drag the `public/` folder onto app.netlify.com/drop.
- **GitHub Pages / any static host:** upload the contents of `public/`.

## Before going live

1. **Contact details:** replace the placeholder phone `(555) 014-2200` / `tel:5550142200`,
   `info@kmtlogisticsllc.com` in `public/index.html`.
2. **Contact form:** the form posts to `/api/contact`, which sends a branded email through
   Resend (free: 3,000 emails/month). Hosting must be Vercel (the function doesn't run on Netlify
   or GitHub Pages). In Vercel → Project → Settings → Environment Variables, add:
   - `RESEND_API_KEY` — from resend.com → API Keys
   - `CONTACT_TO` — inbox for inquiries (defaults to info@kmtlogisticsllc.com)
   - `CONTACT_FROM` — e.g. `KMT Website <website@kmtlogisticsllc.com>` once the domain is verified
     in Resend. Until then leave it unset: Resend's test sender `onboarding@resend.dev` only
     delivers to the email address the Resend account was created with.
3. **Photos:** AI-generated images live in `public/assets/img/` (hero-highway, freight-truck,
   dispatch-desk, lease-tractor, support-dispatcher). Swap in real KMT photos by replacing
   those files with the same names.
