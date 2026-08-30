# UrbanServe — What Was Added (Monetization + SEO)

This patch does **not** touch your existing working pages/logic — it only adds
missing project files and new "earning" features on top. `pick-drop` was
intentionally left as-is ("Coming Soon").

## 1. Run the project (this was missing before)

```bash
npm install
cp .env.example .env.local   # then fill in NEXT_PUBLIC_POCKETBASE_URL etc.
npm run dev
```

Files added: `package.json`, `tsconfig.json`, `next.config.mjs`,
`tailwind.config.ts`, `postcss.config.mjs`, `.env.example`, `.gitignore`.
Verified with `npx tsc --noEmit` and `npx next build` — both pass clean.

## 2. New "Earning" (monetization) features

| Feature | Files | Revenue stream (from your README) |
|---|---|---|
| Professional Subscriptions — Free / Pro (₹199/mo) / Business (₹499/mo) | `app/premium/page.tsx`, `app/premium/layout.tsx`, `lib/data.ts` (`SUBSCRIPTION_PLANS`) | Professional Subscriptions |
| Featured Professional badge + priority sort | `components/WorkerCard.tsx`, `components/WorkersList.tsx` | Featured Professionals |
| Earnings Dashboard (credited / pending / withdrawn, monthly total, pipeline estimate) | `app/earnings/page.tsx`, `app/earnings/layout.tsx` | Lets professionals actually see their income → retention & upsell surface |
| Upsell touchpoints | `app/dashboard/page.tsx` (plan card), `components/Navbar.tsx` (💰 Earnings / 🚀 Premium links) | Drives traffic into the paid flows above |

### PocketBase changes you need to make (admin UI)

**New collection: `subscriptions`**
| field | type |
|---|---|
| user | relation → users |
| plan | select: pro, business |
| status | select: active, expired, cancelled, pending_payment |
| amount | number |
| billing_cycle | select: monthly, yearly |
| started_at | date |
| expires_at | date |
| payment_ref | text (optional) |

**New collection: `earnings`**
| field | type |
|---|---|
| user | relation → users |
| job | relation → jobs (optional) |
| application | relation → applications (optional) |
| amount | number |
| status | select: pending, credited, withdrawn |
| note | text (optional) |

**Add to existing `profiles` collection:**
| field | type |
|---|---|
| plan | select: free, pro, business (default `free`) |
| plan_expires | date (optional) |
| featured | bool (default `false`) |
| total_earnings | number (default `0`, optional — can be a derived/cron field) |

> ⚠️ **Payment gateway**: `app/premium/page.tsx` currently marks a profile as
> upgraded directly from the browser (clearly commented in the code). This is
> fine for testing, but before real money changes hands, wire it to Razorpay
> (recommended for India — supports UPI) and only flip `plan`/`featured` from
> a **server-verified webhook**, not the client. Env vars are already
> scaffolded in `.env.example`.

## 3. AI-Powered Service Discovery ("🤖 AI Service Finder")

The README's signature feature — describe a problem in plain English/Hindi/Hinglish
and get matched to the right service — is now live on the homepage.

| File | Role |
|---|---|
| `lib/serviceMatcher.ts` | Offline, bilingual keyword matcher over your real `CATEGORIES` data. Zero API cost, always works. |
| `app/api/discover/route.ts` | Server API. Uses the keyword matcher by default; **automatically upgrades to a real Claude call** if `ANTHROPIC_API_KEY` is set in `.env.local`, for much better accuracy on phrasing it hasn't seen before. |
| `components/AIServiceFinder.tsx` | The search widget — example chips, loading state, and a "View Professionals →" button that opens your existing `WorkersList` modal for the matched category. |
| `app/page.tsx` | Widget is embedded right below the hero section. |

Tested against the exact examples from the README:
- `"My bathroom tap is leaking"` → **Home Repair → Plumber** ✅
- `"AC cooling nahi kar raha aur unusual sound aa rahi hai"` → **Repair & Tech → AC Service** ✅

**To enable the smarter Claude-powered version:** add `ANTHROPIC_API_KEY=sk-...`
to `.env.local`. Without it, the free keyword matcher still works well for
common phrasing — you can keep extending `TRIGGERS` in `serviceMatcher.ts`
as you notice unmatched queries in real usage.

## 4. SEO

- `app/sitemap.ts` — auto-generates `/sitemap.xml`, includes every open job.
- `app/robots.ts` — auto-generates `/robots.txt`, blocks private pages
  (`/dashboard`, `/earnings`, `/onboarding`, `/notifications`) from being indexed.
- `app/gigs/layout.tsx` — adds page-specific meta tags **and** `JobPosting`
  JSON-LD structured data for every open job (helps eligibility for Google's
  job-search rich results — real organic traffic for a jobs marketplace).
- `app/premium/layout.tsx`, `app/earnings/layout.tsx` — metadata for the new
  pages (earnings is `noindex` since it's private user data).
- Your existing `app/layout.tsx` metadata (Organization JSON-LD, OG tags,
  manifest, icons) was already solid — left untouched.

**Still worth doing before launch:** add a real `og-image.png` (referenced in
`app/layout.tsx` but not present in `public/`), and set `NEXT_PUBLIC_APP_URL`
to your real production domain so canonical/OG URLs aren't wrong.

## 5. Not built (out of scope for this pass)

Business Marketplace, in-app messaging/chat, and Pick & Drop live tracking are
still not implemented — these were flagged separately as bigger, standalone
features.
