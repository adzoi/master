# Leaf 2 Leaf Landscapes — Full Webpage Overview for AI

This document describes the entire website in detail so another AI (or developer) can work on it without breaking behaviour or design.

---

## 1. What This Site Is

- **Client:** Leaf 2 Leaf Landscapes — a Dublin-based landscaping, paving, and garden design company (35+ years, Sandyford).
- **Tech:** Static HTML + CSS + vanilla JavaScript. No build step, no framework, no backend. No `<base href>`; all links are **document-relative** so the site works when opened via **file://** and when sehttp://localhost:3000/services/index.html#lawn-fencingxrved from a web root.
- **Purpose:** Marketing site + enquiry/quote forms. Forms are intended to submit to a **Google Sheet** for processing by an **AI booking agent** (integration not implemented; forms use `action="#"`).

---

## 2. Project Structure

```
web1/
├── index.html                    # Entry: meta refresh → home/index.html
├── contact.html                  # Contact page (full enquiry form, map placeholder)
├── 404.html                      # Custom 404 (same nav/footer, green error block)
├── home/
│   └── index.html                # Homepage (hero, services, about strip, gallery teaser, testimonials, contact strip with enquiry form)
├── about/
│   └── index.html                # About us (hero, story, values, team, location, CTA)
├── gallery/
│   └── index.html                # Project gallery (hero, filter bar, masonry grid, placeholders)
├── reviews/
│   └── index.html                # Client reviews (hero, review cards/list)
├── services/
│   └── index.html                # Services hub (hero + 3 sections: Paving & Driveways, Garden Design & Planting, Lawn & Fencing)
│   ├── paving-driveways/         # 7 service pages
│   │   ├── driveways.html, resin-bound.html, block-paving.html, flagging.html,
│   │   ├── patios.html, kerbs-walling.html, gravel-driveways.html
│   ├── garden-design/            # 6 service pages
│   │   ├── landscaping-design.html, flower-bed-design.html, natural-stone.html,
│   │   ├── planting-services.html, garden-features.html, porcelain-paving.html
│   └── lawn-fencing/             # 3 service pages
│       ├── new-lawn-turf.html, artificial-grass.html, garden-fencing.html
├── css/
│   ├── main.css                  # Global: tokens, reset, nav, footer, buttons, hero, sections, contact strip
│   ├── service-page.css         # All 16 service detail pages (hero, overview, facts, why, process, examples, pricing, FAQ, related, CTA)
│   ├── services.css             # Services hub
│   ├── contact.css              # Contact page (two-column layout, enquiry form, floating/static labels)
│   ├── about.css, gallery.css, reviews.css
│   └── quote-calculator.css     # (Legacy) Was used for a removed quote-estimate page
├── js/
│   ├── main.js                  # Nav scroll, mobile menu, active link, home date min, scroll reveal
│   ├── contact.js               # Contact page: FAQ accordion, Preferred Date min=today, form success message
│   ├── service-page.js          # Service pages: FAQ accordion, scroll reveal for steps/cards
│   ├── about.js, gallery.js, reviews.js
│   └── (scss/main.scss exists but is not compiled/used)
└── docs/
    ├── ENQUIRY-FORM-FIELDS.md   # Form field list + Google Sheet column mapping
    └── WEBPAGE-OVERVIEW-FOR-AI.md  # This file
```

**Total:** 45+ files. No images in repo — hero/gallery/service imagery use CSS placeholders (gradient divs).

---

## 3. URL / Path Conventions (Critical for Edits)

- **No `<base href>`.** Every link is relative to the current document.
- **From project root** (e.g. `contact.html`, `404.html`):
  - Assets: `css/main.css`, `js/main.js`.
  - Links: `home/index.html`, `about/index.html`, `services/index.html`, `gallery/index.html`, `reviews/index.html`, `contact.html`.
- **From `home/`** (`home/index.html`):
  - Assets: `../css/main.css`, `../js/main.js`.
  - Links: `index.html` (self), `../about/index.html`, `../services/index.html`, `../contact.html`, etc.
- **From `about/`, `gallery/`, `reviews/`:** Same idea — `../css/`, `../js/`, `../home/index.html`, `../contact.html`.
- **From `services/index.html`:** `../css/`, `../js/`; links to subpages: `paving-driveways/driveways.html`, `garden-design/landscaping-design.html`, `lawn-fencing/new-lawn-turf.html`; links to rest of site: `../home/index.html`, `../contact.html`.
- **From a service page** (e.g. `services/paving-driveways/resin-bound.html`):
  - Assets: `../../css/main.css`, `../../css/service-page.css`, `../../js/main.js`, `../../js/service-page.js`.
  - Home/contact/about/gallery/reviews: `../../home/index.html`, `../../contact.html`, etc.
  - Same category: `driveways.html`, `block-paving.html`.
  - Other category: `../garden-design/landscaping-design.html`, `../lawn-fencing/artificial-grass.html`.

---

## 4. Design System (main.css)

- **Colors:** `--color-green` #1A3328, `--color-stone` #C8B49A, `--color-cream` #F5F0E8, `--color-charcoal` #2A2A2A, `--color-gold` #B89A5A, `--color-footer-bg` #111111.
- **Fonts (Google Fonts on every page):**
  - Headings: `--font-display` = **Playfair Display**
  - Body / UI: `--font-body` = **DM Sans**
  - Labels / small caps: `--font-mono` = **DM Mono**
- **Layout:** `--container-max` 1200px, `--container-pad` 1.5rem, `--section-pad` 4rem, `--nav-height` 4.5rem, `--radius-card` 12px, `--radius-pill` 9999px, `--ease-out`, `--transition-fast`, `--transition-med`.

---

## 5. Global UI (Every Page)

- **Nav:** Fixed top; logo (leaf SVG + “Leaf 2 Leaf”), links: Home, Work (anchor), **Services** (hover dropdown with 3 columns: Paving & Driveways, Garden Design & Planting, Lawn & Fencing — each linking to the 16 service pages), About, Reviews, Gallery, Contact; CTA “Get a Free Quote”. On scroll, `.scrolled` adds frosted cream background.
- **Mobile:** Hamburger toggles overlay menu; overlay has same links + CTA; body scroll locked when open. `main.js` handles open/close and link click → close.
- **Footer:** Four columns: brand (logo, tagline, Facebook/Instagram), Paving & Driveways links, Garden & Lawn links, Company (About, Gallery, Reviews, Contact, Quote) + phone, email, address. Bottom bar: © 2026, “Serving all of County Dublin”, placeholder Privacy/Terms links.
- **Active nav:** `main.js` adds `.active` to the nav link whose `href` matches the current page path (normalised for index pages).

---

## 6. Page-by-Page Summary

### 6.1 index.html
- Meta refresh to `home/index.html`. No other content.

### 6.2 home/index.html (Homepage)
- **Hero:** “We Transform Dublin's Gardens.”, subline, “See Our Work” / “Get a Quote”, stats (35+ years, 2,000+ projects, 5★).
- **Services:** Three cards (Paving & Driveways, Garden Design & Planting, Lawn & Fencing) linking to `../services/index.html#paving-driveways` etc., with service tags.
- **About strip:** Quote from Mike, bullet list (experience, location, reviews, project management).
- **Gallery teaser:** Six placeholder items, “View Full Gallery” → `../gallery/index.html`.
- **Testimonials:** Three quote cards, “Read all our reviews” → `../reviews/index.html`.
- **Contact strip:** “Let's Build Something Beautiful”, phone/email/address, **enquiry form** (same 6 fields as contact page: Full Name, Email Address, Phone (no country code), Preferred Date, Preferred Time, Additional Comment). Form id `#quote-form-home`; Preferred Date id `#field-preferred-date-home` (min set in main.js). Classes: `.contact__form`, `.contact__label--static`, `.contact__field-label`, `.contact__field-hint`, `.contact__input`. Submit button: “Send My Enquiry →”.

### 6.3 contact.html (Contact Page)
- **Hero:** Short; breadcrumb “Home → Contact”, “Let's Build Something Beautiful”.
- **Two columns:** Left — Get In Touch blocks (phone, email, address, hours), social, trust bullets. Right — **Enquiry form** (see §7) with floating/static labels; success message `#form-success` (hidden until submit).
- **Map section:** Title + placeholder (no iframe yet).
- Form intended for Google Sheet; column mapping documented in `docs/ENQUIRY-FORM-FIELDS.md`.

### 6.4 services/index.html (Services Hub)
- Hero “Our Services”. Three sections: **Paving & Driveways** (7 cards), **Garden Design & Planting** (6 cards), **Lawn & Fencing** (3 cards). Each card links to the corresponding service page. Final CTA “Get a Free Quote”.

### 6.5 Service detail pages (16 total)
- **Template:** Same structure on each; content is per-service.
- **Sections in order:**  
  1. **Hero** — Breadcrumb (Home → Services → [Service]), category pill, H1, subtitle, “Get a Free Quote” / “See Examples”, placeholder image.  
  2. **Overview** — “What is…” copy + **Quick Facts** card (dark green, gold left border). First row on every page: **⏱ Installation Time** or **⏱ Timeline** (e.g. “1–2 days (typical residential)”); other rows use emoji-prefixed labels (📅 Lifespan, 🔧 Maintenance, 🌧 Drainage, etc.). Labels use `--font-mono`, values `--font-body`.  
  3. **Why choose us** — Four cards with heading + text; scroll reveal.  
  4. **Process** — “How it works” steps (numbered).  
  5. **Examples** — Project placeholders + link to gallery.  
  6. **Pricing** — Title, disclaimer, three pricing cards (e.g. Small/Medium/Large).  
  7. **FAQ** — Accordion (button with `data-faq-toggle`, expand/collapse in `service-page.js`).  
  8. **Related** — Three links to other services.  
  9. **CTA** — Title, phone, “Or fill in our online form” → contact.
- **Scripts:** `main.js`, `service-page.js`. **CSS:** `main.css`, `service-page.css`.

### 6.6 about/index.html
- Hero “35 Years of Craft & Care.”, company story, values, team/placeholders, location, CTA. Uses `about.css`, `about.js`.

### 6.7 gallery/index.html
- Hero “Our Work”, sticky filter bar (All, Driveways, Patios, Resin-Bound, Garden Design, Planting, Lawns, Fencing, Natural Stone), grid of items with `data-category`; filtering via `gallery.js`. Placeholder images. Uses `gallery.css`.

### 6.8 reviews/index.html
- Hero with rating badge, review cards/list. Uses `reviews.css`, `reviews.js`.

### 6.9 404.html
- Full nav + footer; main content: “404”, “Page Not Found”, short message, “Go Back Home” → `home/index.html`. Inline styles for error block. Paths from root (e.g. `css/main.css`, `home/index.html`).

---

## 7. Enquiry Form (Contact + Home)

- **Purpose:** Collect enquiries for an AI booking agent; data to be sent to a Google Sheet (backend not implemented).
- **Fields and Google Sheet mapping (exact `name` values):**
  - **Full Name** → `Full Name` — text, required, pattern letters/spaces (and accents, hyphen, apostrophe), 2–120 chars.
  - **Email Address** → `Gmail` — email, required.
  - **Phone Number (without country code)** → `Phone` — tel, required, digits only 7–15, no + or country code.
  - **Preferred Date** → `Preferred Date` — date, required, min = today (set in JS).
  - **Preferred Time** → `Preferred Time` — time, required, 24-hour.
  - **Additional Comment** → `Additional Comment` — textarea, optional, max 2000.
- **Contact page:** Form in `.contact-page__right` with floating labels (Full Name, Email) and static labels (Phone, Preferred Date, Preferred Time, Additional Comment) to avoid overlap. IDs: `#quote-form`, `#field-preferred-date`, etc. `contact.js` sets date min and shows `#form-success` on submit (preventDefault, no real submit).
- **Home page:** Same 6 fields in `.contact__form-wrap` with static labels (`.contact__field-label`, `.contact__field-hint`). Form id `#quote-form-home`, date id `#field-preferred-date-home`; date min set in `main.js`.
- **Reference:** `docs/ENQUIRY-FORM-FIELDS.md` has the full table and validation summary.

---

## 8. JavaScript Behaviour Summary

- **main.js:** Nav scroll (add/remove `.scrolled`), hamburger menu (open/close overlay, body overflow), active nav link by path, home form date min (`#field-preferred-date-home`), scroll reveal (IntersectionObserver for hero, services, gallery, testimonials, contact blocks).
- **contact.js:** FAQ accordion (`[data-faq-toggle]`), Preferred Date `#field-preferred-date` min = today, form submit → show `#form-success`, scroll reveal for contact blocks.
- **service-page.js:** FAQ accordion, reveal for process steps, pricing cards, why-choose cards, related cards.
- **gallery.js / reviews.js / about.js:** Page-specific (e.g. filter, layout).

---

## 9. What Is Not Implemented

- No backend: forms use `action="#"`; no API or server.
- No real images: heroes, gallery, service examples use CSS placeholders.
- Privacy Policy / Terms links in footer are `href="#"`.
- Map on contact page is a placeholder (no iframe).
- Google Sheet (or other) form submission not wired; document is prepared for it (field names, ENQUIRY-FORM-FIELDS.md).

---

## 10. How Another AI Should Work With This

- **Adding or editing a page:** Keep the same nav/footer and path rules; links are document-relative from that file’s location.
- **Changing nav or footer:** Update every HTML file that contains the nav/footer (many pages duplicate it).
- **Editing enquiry form:** Change `contact.html` and `home/index.html` in sync; keep `name` attributes exactly as in ENQUIRY-FORM-FIELDS.md if Sheet integration is used.
- **Editing service content:** Each service page is standalone HTML; Quick Facts live in `.service-facts`; first row is always ⏱ Installation Time or ⏱ Timeline.
- **Styling:** Use `main.css` tokens; page-specific CSS in the corresponding file (contact.css, service-page.css, etc.).

This gives a complete picture of the Leaf 2 Leaf site for consistent, safe edits by another AI or developer.
