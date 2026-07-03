# FreightFlow — Marketing Website Master Prompt
### Production-Grade, Agency-Level Design & Content Specification

**Purpose of this document:** This is a single implementation-ready brief for designing and building the full FreightFlow marketing website (not the app itself). Hand this to a designer, a frontend dev, or use it directly as a build prompt. Everything — visual system, page-by-page structure, copy direction, and SEO/AEO/GEO strategy — is specified so the output requires no guessing and no placeholder content.

**Non-negotiable ground rules:**
- No AI-tool references anywhere in the visible product, code comments, footer, or copy. This must read as work from an experienced in-house design/dev team.
- No filler "lorem ipsum" — every section below includes real, usable copy direction specific to FreightFlow's actual feature set.
- Fully responsive: mobile-first, tested at 375px / 768px / 1024px / 1440px / 1920px breakpoints.
- Production-optimized: image optimization, lazy loading, code-splitting, Core Web Vitals targets (LCP < 2.5s, CLS < 0.1, INP < 200ms).
- Recommended stack (consistent with your existing pattern): **Next.js 14 App Router, TypeScript, Tailwind CSS**, static generation for marketing pages, MDX or a headless CMS for the blog.

---

## 1. Brand & Visual Identity

### 1.1 Positioning
FreightFlow is an **enterprise-grade, India-first logistics operating system** — not a generic SaaS template. The visual language should communicate: control, precision, financial trust, and scale (5 trucks to 500+). Think "cockpit for a transport business owner," not "cute startup app."

Reference tone: Linear's precision, Stripe's financial trust, and Vercel's dark enterprise polish — adapted to an Indian logistics/freight audience.

### 1.2 Color System

I could not extract computed hex values from the live login page (a page fetch only returns markup, not rendered CSS), but the login page confirms a clean white-background, dark-text enterprise aesthetic with an "Enterprise Logistics Edition" premium framing. Use the palette below as the production system — it's built to match that direction. Treat these as the source of truth; swap in your exact brand hexes if you have them in a design file.

**Primary — Deep Freight Navy** (trust, enterprise, night-highway feel)
- `--ff-navy-950: #0B1220` (hero backgrounds, footer)
- `--ff-navy-900: #0F1B2E`
- `--ff-navy-700: #1C3252`
- `--ff-navy-500: #2E4E7C` (primary buttons, links)

**Accent — Signal Amber** (the "in-motion / alert" color — echoes hazard/indicator lighting on trucks, used sparingly for CTAs and live-status indicators)
- `--ff-amber-500: #F59E0B`
- `--ff-amber-600: #D97706` (hover state)

**Secondary — Ledger Teal** (financial control, GST/compliance sections)
- `--ff-teal-500: #0EA5A0`
- `--ff-teal-600: #0B8481`

**Neutrals**
- `--ff-white: #FFFFFF`
- `--ff-fog-50: #F7F9FC` (section backgrounds)
- `--ff-fog-200: #E4E9F0` (borders/dividers)
- `--ff-slate-600: #4B5768` (body text)
- `--ff-slate-900: #111827` (headings)

**Semantic**
- Success (compliance OK / on-time): `#16A34A`
- Warning (expiring doc): `#F59E0B`
- Danger (overdue / expired): `#DC2626`

Usage rule: navy + white dominate 80% of the page (enterprise trust); amber is reserved exclusively for primary CTAs and live-status chips so it never loses impact; teal is used only in GST/Compliance and Accounting sections to visually tag "financial" content.

### 1.3 Typography
- **Display / Headings:** `Geist` or `Inter Tight` (fallback: `Inter`) — tight tracking, 600–700 weight. Enterprise SaaS, not playful.
- **Body:** `Inter`, 400/500 weight, 16px base, 1.6 line-height.
- **Numerals/Data (dashboards, stats, pricing):** `Inter` with `tabular-nums` — critical since this product is number-heavy (GST %, fleet counts, ₹ amounts).
- Type scale (desktop): H1 56–64px / H2 40px / H3 28px / H4 20px / Body 16–18px / Caption 14px.

### 1.4 Visual motifs
- Subtle route-line / map-path SVG strokes as background decoration (echoes "every trip, every mile").
- Card elevation via soft navy-tinted shadows, not generic gray — `box-shadow: 0 20px 40px -12px rgba(15,27,46,0.15)`.
- Live-data feel: small pulsing dot + "Live Status" chips (already present in their login page copy — carry this motif through the marketing site for consistency).
- Iconography: outline-style, 1.5px stroke, geometric (Lucide or Phosphor icon set), never emoji in production UI.

---

## 2. Sitemap

```
/                          Landing page (this document's main focus)
/features                  Deep-dive feature index (optional hub linking to anchors)
/pricing                   Plans by fleet size
/solutions/[industry]      Optional: solutions for FTL, LTL, bulk transporters
/about                     Company story, team, mission
/blog                      SEO/AEO content hub
/blog/[slug]               Individual articles
/contact                   Contact + demo request
/careers                   Optional but recommended for trust/EEAT signal
/security                  Dedicated security & compliance page (derived from your doc)
/terms                     Terms of Service
/privacy                   Privacy Policy
/refund-policy             Refund / Cancellation Policy (SaaS subscription context)
/login, /register          Existing app (unchanged)
/sitemap.xml, /robots.txt  Technical SEO
```

---

## 3. Landing Page (`/`) — Full Section-by-Section Spec

### 3.1 Navigation (sticky, glass-blur on scroll)
- Logo left. Center/right: Features · Pricing · Security · Blog · About.
- Right-aligned: "Login" (ghost button) + "Book a Demo" (amber, primary).
- Mobile: hamburger → full-screen nav with large tap targets, matching the app's mobile-first driver app ethos.

### 3.2 Hero Section
**Layout:** Split hero — left copy block, right animated product visual (dashboard mockup with subtle parallax/float animation, live KPI numbers ticking).

**Headline direction:** "Every Trip. Every Rupee. Every Mile — In Control." (carry the exact tagline from the login page for brand consistency)

**Subhead:** One sentence stating the core value prop — a single platform replacing spreadsheets, paper LRs, and disconnected Tally accounts for Indian road transport businesses, from LR creation to GST filing.

**Primary CTA:** "Book a Free Demo" (amber button)
**Secondary CTA:** "See How It Works" (ghost, scrolls to product tour or opens short video)

**Trust bar directly below hero:** "Trusted by transport businesses running 5 to 500+ trucks" + a row of stat chips: e.g., "18 Modules" / "Multi-Company Ready" / "GST-Native" / "e-Way Bill Integrated." (Use real product facts, not invented client logos — do not fabricate customer names/logos.)

### 3.3 Problem → Solution Section
Recreate the Challenges & Solutions table as an interactive/visual component rather than a plain table:
- 5 cards in a horizontal scroll (mobile) / grid (desktop): each card = Industry Challenge (icon, red/neutral tone) morphing into FreightFlow Solution (icon, navy/teal tone) on hover or scroll-trigger.
- Content source: Manual Paperwork, Financial Leakage, Complex GST/Compliance, Vehicle Document Expiry, Lack of Profitability Visibility — exactly as documented, rewritten in confident marketing voice.

### 3.4 Key Advantages (Why FreightFlow)
6-item icon grid (3x2 desktop, 1-col mobile): 100% Digital Operations, Enhanced Financial Control, Automated Compliance, Real-Time Visibility, Scalability (5→500+ trucks), Driver Empowerment. Each: icon + 3-word title + 1-sentence benefit line (not feature description — outcome-focused, e.g. "Stop financial leakage before it happens").

### 3.5 Product Tour / Module Showcase (the core of the page)
This is the highest-effort section — an interactive tabbed or scroll-linked showcase of all major modules, each with a short mockup screenshot/illustration:

1. **Lorry Receipt & Order Management** — digital LR creation, e-Way Bill integration, 3 print formats.
2. **Trip Management** — full lifecycle, per-trip P&L.
3. **Core Accounting** — double-entry ledger, AR/AP, bank reconciliation.
4. **GST & Compliance** — CGST/SGST/IGST, RCM for GTA, e-Invoice IRN, GSTR-1/3B prep.
5. **HR & Payroll** — driver/employee master, PF/ESI/PT, Form 16.
6. **Fleet & Maintenance** — document expiry alerts, job cards, fuel/KMPL tracking.
7. **AI & Automation** — OCR invoice extraction, anomaly detection, natural-language report queries.
8. **Driver Mobile App** — React Native companion app.
9. **Customer Portal** — shipment tracking, Razorpay payments, statements.

**Pattern:** Sticky left-side tab list, right-side visual panel that swaps on tab click/scroll (similar to Stripe/Linear feature tours). On mobile, collapse to stacked accordion cards.

### 3.6 Platform Architecture Section
Visualize the multi-tenant/multi-company diagram from the source doc as a clean SVG diagram (Super Admin → Tenants → Companies → Branches), not an ASCII block. Pair with 3 short trust points: Row-Level Security isolation, module-based licensing, time-based license management.

### 3.7 Security & Compliance Section
Two-column layout: **Security** (JWT/Supabase Auth, RLS, MFA, AES-256, TLS 1.3, license tamper detection, audit log) and **Compliance** (GST, e-Invoice, e-Way Bill, TDS 194C/194I/194J, PF/ESI, Motor Vehicle Act, MSME 45-day alerts) — each as a checklist with a small badge/shield icon. This section is a major trust-conversion point for finance-conscious buyers — give it real visual weight, not an afterthought. Link out to the full `/security` page.

### 3.8 Social Proof / Results (structure only — do not fabricate names)
Leave clearly marked placeholder slots for: client logos, a metrics strip (e.g., "X% reduction in billing disputes," "X hours saved per week on reconciliation" — to be filled with real client data once available), and 2–3 testimonial cards. Ship with a soft-launch version that shows product-truth stats (module count, compliance coverage) if customer data isn't available yet — never invent quotes or logos.

### 3.9 Pricing Section
Tiered by fleet size (matches "5 to 500+ trucks" positioning): **Starter** (up to 15 trucks), **Growth** (up to 75 trucks), **Enterprise** (75+, custom). Include: monthly/annual toggle, feature checklist per tier, "Most Popular" highlight on Growth, and a note that Enterprise includes custom module configuration and dedicated onboarding. CTA per card: "Start Free Trial" / "Talk to Sales" for Enterprise.

### 3.10 FAQ Section (also feeds AEO — see Section 6)
8–12 real questions, written to directly answer what a transport business owner searches, e.g.:
- "Does FreightFlow handle e-Way Bill generation automatically?"
- "Can one license manage multiple companies with different GST numbers?"
- "Is there a mobile app for drivers?"
- "How does FreightFlow calculate RCM for GTA payments?"
- "What happens to my data if I cancel my subscription?"
Use an accordion component; mark up with FAQPage schema (see Section 6).

### 3.11 Final CTA Band
Full-width navy band, amber CTA button, one-line urgency-free close: "See your fleet's numbers in one place — book a walkthrough." Include a secondary link to the pricing page.

### 3.12 Footer
4–5 columns: Product (Features, Pricing, Security), Company (About, Careers, Blog, Contact), Legal (Terms, Privacy, Refund Policy), Resources (Blog, Compliance Guide, GST Calendar), and a contact/social column. Bottom bar: copyright, "Made for Indian Transport & Logistics" tagline, GSTIN/CIN if applicable for legal trust.

---

## 4. Required Standalone Pages

### 4.1 `/about`
Company story (why FreightFlow exists — the paperwork/leakage/compliance problem, told narratively), mission statement, team section (real names/roles or role-based if pre-hire), and a "why India-first" section explaining why generic global logistics SaaS doesn't fit Indian GST/e-Way Bill/TDS requirements.

### 4.2 `/contact`
Split layout: form (Name, Company, Fleet Size, Phone, Email, Message) on one side, direct contact details + office location (Surat-based, per your other projects — confirm actual address) + a "Prefer WhatsApp?" click-to-chat option on the other, consistent with your established WhatsApp-first pattern for Indian SMB-facing products.

### 4.3 `/blog`
Grid/list hybrid, categorized by: GST & Compliance, Fleet Management, Industry Insights, Product Updates. Each post: cover image, category tag, read time, publish date. Include category filter and search.

**Suggested launch articles (real, useful, SEO-targeted):**
- "e-Way Bill Rules for Transporters in 2026: A Complete Guide"
- "RCM on GTA Services: How to Calculate It Correctly"
- "5 Signs Your Transport Business Is Losing Money to Paperwork"
- "TDS Under Section 194C for Transporters, Explained"
- "How to Track Vehicle Document Expiry Without Missing a Renewal"

### 4.4 `/terms`, `/privacy`, `/refund-policy`
Standard SaaS legal pages, drafted for a subscription/licensing model (tenant-based, time-limited licenses per the architecture doc). Must cover: data ownership (tenant data stays tenant's), data retention/export on cancellation, license expiry/grace period terms (matches your licensing engine), payment terms, and refund window for annual plans. **Have these reviewed by an actual Indian counsel before publishing** — this document gives structure, not legal sign-off.

### 4.5 `/security` (expanded)
Full write-up of the Security & Compliance content already provided, formatted as a trust-center page: architecture diagram, certifications (if any), data residency statement, incident response summary, and a downloadable one-pager for enterprise buyers doing vendor due diligence.

---

## 5. Interaction & Motion Design
- Scroll-triggered fade/slide-up on section entry (Intersection Observer, not on every element — reserve for section headers and hero to avoid gimmicky feel).
- Module tour: scroll-linked or click-linked panel swap (Section 3.5) — this is the signature interaction of the page.
- Hover states: subtle lift (`translateY(-4px)`) + shadow deepen on cards, 200ms ease.
- Number counters animate once on scroll-into-view for the trust-bar stats.
- Respect `prefers-reduced-motion` — disable non-essential animation for accessibility.
- No animation should block perceived load — hero content must be visible and interactive before any JS-driven animation library finishes hydrating.

---

## 6. SEO, AEO & GEO Strategy

### 6.1 Technical SEO
- Semantic HTML5 landmarks, single H1 per page, logical heading hierarchy.
- `next/image` with explicit width/height, WebP/AVIF, priority-loaded hero image only.
- Auto-generated `sitemap.xml` and `robots.txt`.
- Canonical tags on every page; self-referencing on the landing page.
- Per-page unique `<title>` and `<meta description>` — do not reuse the login page's generic description across marketing pages.
- Structured data (JSON-LD):
  - `SoftwareApplication` schema on the landing page (category: "BusinessApplication", pricing from the pricing tiers).
  - `Organization` schema with logo, contact point, and sameAs social links.
  - `FAQPage` schema on the FAQ section.
  - `BreadcrumbList` on blog and inner pages.
  - `Article` schema on each blog post (author, datePublished, dateModified).

### 6.2 AEO (Answer Engine Optimization — for ChatGPT/Perplexity/AI Overviews)
- Write FAQ answers as **complete, self-contained answers** in the first sentence (answer-first, then elaborate) — this is what gets lifted into AI answer boxes.
- Use clear question-form H2/H3s throughout blog content ("How does RCM work for GTA payments?") rather than clever/vague headers.
- Maintain a `/llms.txt` file at the domain root summarizing what FreightFlow is, its core modules, and links to key pages — an emerging convention that helps AI crawlers understand site structure and intent.
- Keep factual claims (module counts, compliance coverage, feature lists) consistent word-for-word across the landing page, blog, and schema markup — inconsistency between page copy and structured data reduces AI citation confidence.

### 6.3 GEO (Generative Engine Optimization)
- Structure key pages so a generative engine can extract a clean, quotable summary in the first 2–3 sentences of each major section (what AEO/GEO research calls "chunk-friendly" content).
- Include original data points where possible once available (e.g., real customer results) — generative engines favor citable statistics over generic marketing claims.
- Ensure the `/security` and `/blog` compliance articles are genuinely authoritative and specific (real section numbers: 194C, 194I; real portal names: IRP, NIC) — specificity is what earns citation in AI-generated answers to "best transport ERP software India" style queries.

### 6.4 Target keyword clusters (for content planning, not stuffing)
- Primary: "transport management software India," "logistics ERP for trucking companies," "lorry receipt software," "GST software for transporters"
- Long-tail/blog: "e-Way Bill integration software," "RCM GTA GST calculation," "TDS 194C transporters," "fleet document expiry tracker"

---

## 7. Accessibility & Production Checklist
- WCAG 2.1 AA: color contrast ≥ 4.5:1 for body text (verify navy-on-white and white-on-amber combinations specifically — amber-on-white CTA text may need a darker amber or dark text on amber, not white).
- All interactive elements keyboard-navigable, visible focus states.
- `alt` text on every image, meaningful (not "image1.png").
- Forms: proper `<label>` association, inline validation messages, no reliance on color alone for error states.
- Lighthouse targets before launch: Performance ≥ 90, Accessibility ≥ 95, SEO = 100.
- No AI/tool attribution in code comments, meta tags, footer credits, or copy — final output should read as an in-house-built product.

---

## 8. Content Voice Guidelines
Write as a confident, India-based enterprise software company speaking to transport business owners — not a global generic SaaS. Practically:
- Use ₹ and Indian numbering (lakh/crore where natural) in examples, not $ or thousand/million.
- Reference real Indian compliance terms correctly and consistently: GSTR-1, GSTR-3B, e-Way Bill, e-Invoice/IRN, RCM, TDS sections — precision here builds credibility with the target buyer.
- Avoid generic SaaS clichés ("revolutionize," "game-changer," "seamless synergy"). Speak in outcomes an owner cares about: fewer disputes, faster settlements, no missed renewals, clean books at filing time.
- Keep sentences short in hero/CTA copy; allow more explanatory length in feature and blog copy.

---

**Next step suggestion:** Once you confirm exact brand hex values (from a Figma file or the live site's computed CSS), swap them into Section 1.2 and this becomes fully implementation-ready for handoff to development.