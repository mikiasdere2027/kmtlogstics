# Rem Assist Design System

The brand and product design system for **Rem Assistance Inc.** — a BPO / Remote Assistance company — and specifically for their internal **Risk Monitoring Dashboard** (an ISO/IEC 27001:2022-aligned risk register tool used by the Management Representative and leadership).

> **Rest Assured — Assist Guaranteed.**

---

## Index

- `README.md` — this file (brand context, content fundamentals, visual foundations, iconography)
- `colors_and_type.css` — CSS custom properties for color, type, spacing, radii, shadows, semantic typography
- `fonts/` — webfonts (Inter for UI/body, Source Serif 4 for the marketing voice — see Type § for substitution notes)
- `assets/` — logos, wordmark, iconography, brand illustrations
- `preview/` — small HTML cards rendered in the Design System tab (one per concept)
- `ui_kits/dashboard/` — the Risk Monitoring Dashboard UI kit (the primary surface)
- `ui_kits/marketing/` — a small marketing-site UI kit (header, hero, services grid)
- `SKILL.md` — Agent Skill manifest (compatible with Claude Code skills)

---

## Company & product context

**Rem Assistance Inc.** (remassistance.com) is a BPO that supplies remote teams to clients — virtual sales, live support + chatbots, IT staff & helpdesk, marketing support, AI implementation, and AI automations. Headquartered with significant Ethiopia operations (the team page lists Ethiopian leadership; payment vendors include Telebirr). Dual-certified to **ISO 9001 (Quality)** and **ISO 27001 (Information Security)** — these certifications are central to the brand's trust narrative.

The company's brand pillars are encoded in its name as an acronym:

- **R**esults-driven
- **E**fficient
- **M**atching your culture
- **O**n target
- **T**horoughly excellent
- **E**very time

### The product: Risk Monitoring Dashboard

Internal tool used by the **Management Representative (MR)**, **CEO**, **COO**, **CTO**, **CDO**, **HR Manager**, **Cybersecurity Specialist**, and **Finance** to maintain the ISO 27001 Risk Assessment Register (`RA-ISMS-06-REG-01`).

Each risk row tracks:

| Field | Example |
| --- | --- |
| Asset / Process | "Azure AD & M365", "Recruitment Data", "Remote Working (BYOD)" |
| Risk Description | "Unauthorized account access" |
| Threat / Vulnerability | "Credential theft" / "MFA not enforced" |
| Likelihood (L) × Impact (I) → Risk Score | 2 × 3 = 6 |
| Risk Level | Critical / High / Medium / Low |
| Existing Controls | "MFA, Conditional Access" |
| Annex A Mapping | "A.8.5, A.8.2" |
| Treatment Option | Mitigate / Transfer / Accept / Avoid |
| Planned Controls | "Enforce MFA on all users" |
| Owner | "Cybersecurity Specialist" |
| Target Date | "15-07-2025" |
| Residual Risk | Medium |

The asset inventory the dashboard tracks risks against includes: Azure AD & M365, HubSpot CRM, Slack, Hostinger, ConnectTeam (HRIS), Deel, Remote.com, Controlio, Telebirr, QuickBooks, NordVPN, Zoom, Monday.com, Zapier, Rempro SaaS Dev, plus process-level entries (Recruitment Data, Client Data Handling, Asset Inventory, Remote Working / BYOD, Email).

### Sources used

- **Marketing site:** https://remassistance.com/ (fetched as text — full visual context limited)
- **Risk Assessment Register:** `uploads/RISK ASSESSMENT REGISTER.xlsx` (the user-supplied source of product truth)
- **No codebase, Figma, or full brand guidelines were attached.** Visual decisions below are inferred from the marketing site's tone + the regulated/ISO context, then committed to a coherent system. **See "Caveats" at the bottom of this file.**

---

## CONTENT FUNDAMENTALS

Tone is **calm, professional, slightly warm.** Marketing voice on the website leans into reassurance ("Rest Assured", "Your peace of mind is our priority", "24/7 Expert Support: Because your business doesn't stop, neither do we!"), while the internal compliance documents are dry and procedural ("Enforce MFA on all users", "Quarterly access review"). The design system needs to support both registers without code-switching mid-page.

### Voice rules

- **Second-person ("you", "your") for marketing and onboarding.** "We help your team…", "Your peace of mind is our priority."
- **Imperative for internal tooling.** "Enforce MFA on all users." "Schedule restore testing." Match the cadence of the existing register entries — short, verb-first, no fluff.
- **Title Case for display headings** ("Risk Monitoring Dashboard", "Treatment Plan"). **Sentence case for body and form labels** ("Likelihood score", "Target date"). Never ALL CAPS except for tiny eyebrow labels and risk-level badges (CRITICAL, HIGH, MEDIUM, LOW).
- **No emoji in product UI.** Marketing pages occasionally use a 📌 pin glyph as a section marker ("📌 Risk Assessment Register…") — this is the only sanctioned emoji and only in marketing/document contexts, never in the dashboard chrome.
- **Numbers and dates use ISO-friendly formats** in the dashboard: `2025-07-15` or `15-07-2025`. Spell-out months allowed in marketing copy.
- **"Rem Assist"** is the short brand name; **"Rem Assistance Inc."** is the legal name. Never "REM" all-caps unless it's the R-E-M-O-T-E acronym treatment.
- **Acronyms are introduced once, then used freely:** ISMS, MR, BYOD, MFA, SLA, BPO, PII. The audience is technical/managerial and doesn't need them re-explained.

### Vibe examples

- ✅ "Unauthorized account access — credential theft via MFA not enforced." *(register entry)*
- ✅ "Your peace of mind is our priority." *(marketing)*
- ✅ "20 risks open. 3 critical. 4 due this week." *(dashboard summary line)*
- ❌ "Let's tackle those risks together! 🚀" *(too cheerful for a compliance tool)*
- ❌ "URGENT: ACTION REQUIRED!!" *(shouty, not the brand)*

---

## VISUAL FOUNDATIONS

### Color

Primary palette is **deep navy** (institutional trust) with a **mid-blue accent** (the only saturated brand color in the UI). Risk-level semantics are a **separate, deliberate four-stop scale** that takes priority over brand color in any context where a risk is being shown — these are the most important colors in the product.

- **Brand navy** `#0E2A4A` — primary surface for marketing dark sections, dashboard sidebar, logo background.
- **Brand blue** `#2C7BE5` — accent, primary buttons, active nav, links. Used sparingly.
- **Cream/paper** `#F7F4EC` — warm off-white for marketing backgrounds (the website's hero has a paper-cream feel against navy elements).
- **Surface** `#FFFFFF` and `#F6F8FB` — dashboard backgrounds.
- **Ink scale** — `--ink-900` for primary text down to `--ink-400` for tertiary; never pure black.

**Risk semantics (load-bearing):**

- **Critical** `#B42318` — deep red, white text. Reserved for L×I ≥ 9.
- **High** `#D97706` — amber-orange, white or near-black text.
- **Medium** `#CA8A04` — gold/mustard, near-black text.
- **Low** `#15803D` — green, white text.
- **Info / neutral** uses the brand blue.

Each risk level has a **soft surface** companion (`--critical-50` etc.) for backgrounds of risk cards and table-row tints. Never use red for "destructive button" — destructive shares the Critical hue but uses the `-700` shade to differentiate from a risk-level badge.

### Type

- **Display + UI: Inter** (sans-serif, variable). Used for everything in the dashboard and for marketing body copy. Inter is shipped as a self-hosted variable webfont.
- **Marketing display accent: Source Serif 4** — used sparingly for the marketing hero ("Reinforce your Remote Teams") and big quotes. Adds warmth and gravitas without going corporate-stuffy.
- **Mono: JetBrains Mono** — for asset IDs (`RA-ISMS-06-REG-01`), Annex A references (`A.8.5`), risk scores in tables.

> **Substitution note.** The marketing site does not declare a font face in any obvious way (the WP theme likely uses a generic sans). Inter + Source Serif 4 are the system's *prescribed* choices and substitute for whatever the WordPress theme is currently shipping. Both are loaded from Google Fonts via `colors_and_type.css`. If Rem Assist has a designated brand font, please attach the file and I'll swap it in.

Type scale follows a 1.25 minor-third on the display end and 1.125 on body; declared as semantic CSS vars (`--h1`, `--h2`, `--body`, `--mono-sm`, etc.). Line-height tightens as size grows: 1.5 for body, 1.2 for display.

### Spacing & layout

4px base unit. Tokens: `--s-1` (4px), `--s-2` (8px), `--s-3` (12px), `--s-4` (16px), `--s-5` (20px), `--s-6` (24px), `--s-8` (32px), `--s-10` (40px), `--s-12` (48px), `--s-16` (64px), `--s-20` (80px).

Dashboard layout is **fixed left sidebar (240px) + fluid main**. Marketing pages are 1200px max content width, centered, with generous (80–120px) section padding. Tables in the dashboard use 12px row padding (medium-density — not airy, not cramped).

### Backgrounds

- **Dashboard:** flat `#F6F8FB` page background; cards on white. No gradients in chrome.
- **Marketing:** alternating cream (`#F7F4EC`) and navy (`#0E2A4A`) sections. Hero sometimes uses a soft radial highlight from upper-left, very subtle — *not* a saturated gradient.
- **Hero illustrations:** photographic team portraits (the site has real headshots) and one Gemini-generated illustration for the "Rem(ote) Assistant" alphabet panel. Avoid glossy SaaS illustrations.
- **No textures, grain, or repeating patterns.** No glass-morphism. No mesh gradients.

### Animation

Restrained. **150ms** for state transitions (hover, press, focus). **200ms** for layer changes (modal in, panel slide). **400ms** for page-level transitions. Easing is `cubic-bezier(0.2, 0.8, 0.2, 1)` (smooth out-quart, our default) for almost everything; bounces and elastics are forbidden in the dashboard. Marketing can use a single 600ms fade-up on scroll for section reveals.

### Hover & press

- **Hover** — surfaces lift one shadow tier (`--shadow-sm` → `--shadow-md`). Buttons darken by 4% (use `color-mix`). Links underline on hover only.
- **Active / press** — buttons darken by 8%, scale 0.98 (only on primary CTAs and risk-action buttons; never on table rows).
- **Focus** — 2px focus ring in `--brand-blue-300` with 2px offset on `:focus-visible` only. Compliance-mandatory; never hide.

### Borders & dividers

`#E5E9F0` is the divider workhorse. Cards use `1px solid #E5E9F0` plus a single shadow tier. Inputs use the same border color, becoming `--brand-blue` on focus with the 2px ring on top.

### Shadows / elevation

Five tiers, all very subtle (institutional product, not Material Design):

- `--shadow-xs` — `0 1px 0 rgba(15, 28, 51, 0.04)` (resting table row, muted card)
- `--shadow-sm` — `0 1px 2px rgba(15, 28, 51, 0.06)` (default card)
- `--shadow-md` — `0 4px 8px -2px rgba(15, 28, 51, 0.08), 0 2px 4px -2px rgba(15, 28, 51, 0.04)` (hover card, dropdown)
- `--shadow-lg` — `0 12px 24px -8px rgba(15, 28, 51, 0.12)` (modal, command palette)
- `--shadow-xl` — `0 24px 48px -12px rgba(15, 28, 51, 0.18)` (full-screen overlays)

No inner shadows. No colored shadows.

### Corner radius

- **2px** — table cells, badges (chips that need to look "tight" against the data grid)
- **6px** — buttons, inputs, small cards
- **10px** — large cards, modals, tile artwork
- **9999px** — avatar, owner pills, status dot containers

Never mix radii on the same edge. Cards do not have asymmetric radii.

### Transparency & blur

- **Sticky headers** in the dashboard use `rgba(255,255,255,0.85)` with `backdrop-filter: blur(8px)` — only place blur is used.
- **Modal overlays** use `rgba(15, 28, 51, 0.45)` flat (no blur) so the backgrounded data is still legible.
- No frosted-glass cards, no translucent sidebars.

### Imagery vibe

Warm, real, **photographic**. The website features real Ethiopian team headshots in soft natural light — keep that energy. When generated illustrations are used (the alphabet panel image), they're warm-toned with photographic texture, not flat vector. Avoid: cool-blue corporate stock photos, isometric SVG illustrations, 3D blob renders. **Warm > cool** for any human imagery.

### Layout rules

- The dashboard sidebar is always 240px and never collapses by default (a future iteration could collapse it to 64px). Logo locks top-left.
- Page header is a 64px-tall sticky strip with breadcrumbs, page title, and primary CTA right-aligned.
- Table cells never wrap — they truncate with ellipsis and reveal full content on hover (tooltip) or in a side-drawer detail view.
- Risk-level badges always sit immediately to the right of the asset name, never elsewhere in the row.
- KPI tiles align in groups of 4 across desktop, 2 across tablet.

---

## ICONOGRAPHY

**System:** [**Lucide**](https://lucide.dev/) at 1.5px stroke weight, 20px default size, currentColor stroke. Lucide is loaded from CDN (`unpkg.com/lucide@latest`) until or unless self-hosting becomes a requirement. Lucide was chosen because:

1. The marketing site uses generic flat icon-style PNGs (shop arrow, customer support icon) which are **placeholder-quality and inconsistent in stroke weight** — Lucide gives a single coherent system.
2. Lucide's restrained outline style fits an ISO-aligned compliance tool better than Heroicons (chunkier) or Phosphor (rounded/playful).
3. It's the closest match in spirit to what the dashboard's audience expects from a serious internal tool.

**Substitution flag:** Rem Assist does not have its own icon set in the materials provided. Lucide is a **substitution**. If the company has a preferred set, swap the `icon-set` token in `colors_and_type.css` and the Lucide CDN script in each HTML file.

### Usage rules

- 16px in dense tables, 20px default, 24px in section headers, 32px+ in empty states or hero tiles.
- Stroke `currentColor` only — recolor by setting `color:` on the parent. Never two-tone an icon.
- Always pair icons with text for primary actions in the dashboard. Icon-only buttons require an accessible `aria-label` AND a tooltip; reserve them for compact toolbars.
- **Risk-level badges DO NOT use icons.** They are pure type + color — adding an icon would clutter the row.
- The **Annex A reference number** (e.g. "A.8.5") is itself the icon for ISO compliance contexts — it sits in a mono pill, no glyph needed.

### Brand mark / logo

The Rem Assist marketing site uses a horizontal wordmark (the file `wp-content/uploads/2023/03/logo.png`). Direct fetching was blocked by CORS, so this design system ships a **typographic wordmark substitute** in `assets/wordmark.svg` — set in Inter Bold with a deliberate accent on the leading "R". When the official PNG is added to `assets/`, both the Design System cards and the UI-kit headers automatically pick it up.

The dashboard uses a **compact monogram** ("R" inside a 32px squircle in brand navy with brand-blue accent dot) at the top-left of the sidebar — `assets/monogram.svg`.

The dual ISO certification mark (ISO 9001 + ISO 27001 — referenced on the marketing site as `2-certs.svg`) is reproduced as `assets/iso-certs.svg`. **This is also a redrawn substitute** — if the official mark is provided, replace the file.

### Emoji

**Not used in product UI.** A single 📌 pin emoji appears in the source spreadsheet header ("📌 Risk Assessment Register") and is acceptable in *document* contexts (exported PDFs, register headers in printable views), but never in dashboard chrome, navigation, or buttons. No other emoji are sanctioned.

---

## CAVEATS

1. **No codebase, Figma file, or brand guidelines were provided.** Materials available: the public marketing site (text only — CORS blocked image downloads from my side) and the Risk Assessment Register XLSX. Everything visual in this system is *inferred and committed*, not extracted. If Rem Assist has an existing internal style guide, attaching it would let me reconcile.
2. **Logo files are placeholders.** `wordmark.svg` and `monogram.svg` are typographic substitutes drawn against the brand color tokens. Please attach the canonical PNG/SVG when convenient — I'll swap them in and re-render the cards.
3. **Fonts (Inter, Source Serif 4, JetBrains Mono) are substitutions** — Google Fonts CDN is wired up. If you have a brand-mandated font (e.g. licensed for Rem Assist), drop the file in `fonts/` and I'll re-point `colors_and_type.css`.
4. **Iconography (Lucide) is a substitution.** No icon system was specified.
5. **The "marketing" UI kit is intentionally small** — one header, one hero, one services grid, one footer. The primary surface is the Risk Monitoring Dashboard; the marketing kit exists only so the brand has a public-facing companion piece.
6. **No slide template was provided**, so no `slides/` folder is created. Easy to add later.
