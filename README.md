# TapCard — NFC + QR Digital Visiting Card SaaS Platform

> **One Card. Your Entire Professional Identity.**  
> *Tap. Connect. Grow.*

TapCard is a commercial-grade, full-stack platform combining physical **contactless NFC visiting cards**, **high-contrast QR codes**, dynamic **digital professional identities**, **instant vCard contact saving**, and an **inbound lead capture & visitor analytics engine**.

---

## 🌟 Key Features

### 🪪 Physical Card & Hardware Architecture
- **Zero App Required**: Visitors tap the card or scan the QR code to open the profile in their native mobile browser.
- **Dynamic Cloud Resolution**: Physical cards contain only a short HTTPS NDEF URL (`https://tapcard.in/c/[cardCode]?source=nfc`). If the owner updates their phone number, title, or links, the card **never needs reprogramming**.
- **Atomic Card Replacement**: If a card is lost or stolen, admins can decommission the old card (`status = REPLACED`) and issue a new card without touching the customer's digital profile or data.
- **Multiple Material Variants**: Matte Executive Black, Brushed Gold Metal, Classic Studio White, and Eco Bamboo Wood.

### 👤 Customer Experience & Public Profile (`/c/[cardCode]`)
- **Fast Touch-Friendly Profile**: Optimized for mobile screens with zero horizontal scrolling.
- **One-Tap vCard Download**: Generates and downloads standard compliant `.vcf` 3.0 contact cards for iOS Apple Contacts and Android.
- **Direct Communication CTAs**:
  - **WhatsApp**: Pre-encoded custom greeting ("Hi Aman, I saw your TapCard...").
  - **Phone Call**: Native `tel:` trigger.
  - **Email**: Native `mailto:` trigger.
- **Inbound Lead Generation**: Embedded inquiry form that persists leads directly into the owner's dashboard with real-time status management (`NEW`, `CONTACTED`, `CONVERTED`, `CLOSED`).
- **Granular Visitor Analytics**: Transparently tracks `profile_view`, `nfc_visit`, `qr_visit`, `whatsapp_click`, `call_click`, `contact_download`, and conversion rates.

### 🛠️ Admin Control Center (`/admin`)
- **Inventory Management**: Bulk manufacture 10 to 500 physical card codes (`TC-XXXXXX`).
- **Factory CSV Export**: Single-click export of card codes, profile URLs, and NFC payloads for physical printing shops.
- **NFC Hardware Test Suite (`/admin/cards/[id]/test`)**: Live inspection bench with software NFC tap simulator and NDEF payload verification.
- **Order Pipeline**: Track orders from payment to printing, NFC programming, and courier shipping.
- **Customer CRM**: Suspend, reactivate, or inspect user accounts and card links.

---

## 🏗️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS, CSS variables, Inter typography
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database & Auth**: PostgreSQL via [Supabase](https://supabase.com/) with Row Level Security (RLS) + resilient offline/local state fallback
- **QR Generation**: Open-source `qrcode` library with Level H Error Correction
- **Charts**: [Recharts](https://recharts.org/) responsive time-series area charts
- **vCard**: Standards-compliant vCard 3.0 engine (`lib/vcard.ts`)

---

## 📂 Project Structure

```text
├── docs/
│   └── NFC_SETUP.md              # Physical NFC chip programming workflow
├── src/
│   ├── app/
│   │   ├── (marketing)/page.tsx  # High-conversion landing page
│   │   ├── admin/                # Admin control portal
│   │   │   ├── cards/            # Card inventory & bulk generator
│   │   │   │   └── [id]/test/    # NFC hardware test bench
│   │   │   ├── orders/           # Hardware order fulfillment pipeline
│   │   │   ├── users/            # Customer profile management
│   │   │   └── page.tsx          # Admin overview metrics
│   │   ├── api/                  # REST API routes
│   │   │   ├── analytics/        # Telemetry ingestion & summaries
│   │   │   ├── cards/            # Hardware card CRUD, assignment & replacement
│   │   │   ├── leads/            # Lead capture & status updates
│   │   │   ├── orders/           # Physical card orders
│   │   │   ├── profile/          # Digital profile mutations
│   │   │   ├── settings/         # Dynamic pricing & plans
│   │   │   └── test-suite/       # Automated E2E verification runner
│   │   ├── c/[cardCode]/         # Blazing fast public digital profile
│   │   ├── dashboard/            # Customer SaaS dashboard
│   │   │   ├── analytics/        # Recharts visitor telemetry
│   │   │   ├── cards/            # Assigned NFC cards & hardware status
│   │   │   ├── leads/            # Inbound inquiry CRM & CSV export
│   │   │   ├── order/            # Physical card ordering flow
│   │   │   ├── profile/          # Profile editor & theme customizer
│   │   │   ├── qr/               # QR code generator (PNG / SVG / Print)
│   │   │   ├── settings/         # Privacy & plan management
│   │   │   └── page.tsx          # Dashboard home metrics
│   │   ├── login/                # Customer & Admin authentication
│   │   ├── signup/               # Registration
│   │   └── onboarding/           # 5-stage profile builder wizard
│   ├── components/
│   │   ├── profile/              # Public profile header, buttons, lead form
│   │   └── ui/                   # Button, Input, Modal, Badge, CardPreview
│   ├── lib/
│   │   ├── auth/                 # AuthProvider & session management
│   │   ├── db/                   # Unified repository & state engine
│   │   ├── qr.ts                 # QR code generation & downloaders
│   │   ├── supabase/             # Supabase clients (browser, server, admin)
│   │   ├── utils.ts              # Slugify, code generation, URL builders
│   │   └── vcard.ts              # vCard 3.0 contact generator
│   ├── test/
│   │   └── platform-e2e.test.ts  # 18-step end-to-end integration test suite
│   └── types/
│       └── database.ts           # Comprehensive TypeScript schemas
└── supabase/
    └── migrations/               # Complete PostgreSQL schema & RLS policies
```

---

## 🚀 Getting Started Locally

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd bussines.io
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
*(Note: If Supabase keys are not set, TapCard automatically runs with its built-in operational state engine seeded with realistic demo data for Aman Singh and test cards).*

### 3. Apply Supabase Database Migrations (When connecting Supabase)
Execute the migration file located at:
```text
supabase/migrations/20260214000000_tapcard_initial_schema.sql
```
in your Supabase SQL Editor. This sets up all 9 tables, indexes, automatic timestamp triggers, and Row Level Security (RLS) policies.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Acceptance Testing

The platform includes an automated end-to-end integration test suite covering all 18 core requirements.

Run typecheck and build:
```bash
npm run typecheck
npm run build
```

Execute the live test suite via the test endpoint:
```text
GET http://localhost:3000/api/test-suite
```

### Test Suite Validates:
1. User registration & profile creation
2. Profile updates (bio, theme, accent color)
3. Physical card generation with unique `TC-XXXXXX` code
4. Card assignment to customer profile
5. Card activation and timestamp recording
6. Public profile resolution via card code
7. High-resolution QR code generation
8. vCard 3.0 generation (.vcf)
9. WhatsApp international URL encoding
10. Inbound lead capture & database persistence
11. Multi-event telemetry (views, taps, scans, CTR)
12. Atomic card replacement (`old=REPLACED`, `new=ACTIVE`)
13. Decommissioned card protection (`CARD_REPLACED` guard)
14. Suspended card protection (`CARD_INACTIVE` guard)
15. Invalid card code handling (`CARD_NOT_FOUND` guard)
16. Hardware order pipeline with courier tracking
17. Factory bulk card generation & CSV inventory
18. Dynamic pricing without hardcoded values

---

## 🔐 Admin Access & Credentials

- To access the admin portal: Navigate to `/admin` or log in with an email containing `admin` (e.g. `admin@tapcard.in`).
- Pre-configured demo quick-switcher is available directly on the `/login` page for fast inspection.

---

## 📦 Production Deployment

### Deploying to Vercel:
1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Set Environment Variables in Project Settings (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`).
3. Deploy! Next.js App Router will generate all static pages and dynamic routes automatically.

---

## 📖 License & Roadmap
- Dedicated Android Admin NFC Writer App (using Kotlin and Android NDEF APIs).
- Native Razorpay & Stripe webhook automation for physical card orders.
- Enterprise SSO and White-label custom domains (`cards.yourcompany.com`).
