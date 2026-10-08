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
   `dispatch@kmtlogistics.com`, and `MC 000000 · USDOT 0000000` in `public/index.html`.
2. **Contact form:** submissions are emailed to admin@kmtlogistics.com through FormSubmit
   (formsubmit.co, free, no account). After deploying, send one test from the live site —
   FormSubmit emails an activation link to admin@kmtlogistics.com; click it once and every
   later submission is delivered. To change the inbox, edit `data-endpoint` on
   `<form id="contact-form">` in `public/index.html`.
3. **Photos:** AI-generated images live in `public/assets/img/` (hero-highway, freight-truck,
   dispatch-desk, lease-tractor, support-dispatcher). Swap in real KMT photos by replacing
   those files with the same names.
