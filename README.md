# F-Manager

> Bangladesh's white-label, multi-tenant f-commerce SaaS platform.
> Shopify-like stores + bKash/Nagad payments + Steadfast courier + Agency white-labeling.

## Architecture

```
Super Admin (Team Sifr)
    └── Agency (White-label reseller)
            └── Shop Admin (F-commerce seller)
                    └── Customer (Buyer)
```

## Tech Stack

- **Framework**: Next.js 14 (App Router, RSC-first)
- **Database**: Supabase (PostgreSQL + Auth + RLS + Realtime + Storage)
- **Deployment**: Vercel
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Animations**: Framer Motion + 21st.dev
- **Forms**: React Hook Form + Zod
- **State**: Zustand
- **Charts**: Recharts (Stripe-style, dark themed)
- **Email**: Resend + React Email

## How Subdomain Routing Works

Every request hits Vercel edge middleware:

| Hostname | Destination |
|---|---|
| `admin.fmanager.com` | Super Admin panel |
| `fmanager.com` | Marketing landing page |
| `[slug].fmanager.com` | Agency panel + stores |
| `custom-domain.com` | Agency (looked up via `agencies.custom_domain`) |

Agency branding (logo, color) is injected into request headers by middleware and consumed by all downstream pages.

## Environment Variables

See `.env.local.example` — copy it to `.env.local` and fill in your values.

## Database Setup

1. Create a Supabase project
2. Run migrations in order in the SQL Editor:
   - `supabase/migrations/001_schema.sql`
   - `supabase/migrations/002_rls.sql`
   - `supabase/migrations/003_functions.sql`
   - `supabase/migrations/004_triggers.sql`
3. Enable `pg_cron` extension in Dashboard → Database → Extensions

## Local Development

```bash
npm install
npm run dev
```

### Subdomain Local Testing

Add to your hosts file (`C:\Windows\System32\drivers\etc\hosts` on Windows, `/etc/hosts` on Mac/Linux):

```
127.0.0.1 fmanager.localhost
127.0.0.1 admin.fmanager.localhost
127.0.0.1 test-agency.fmanager.localhost
```

Set in `.env.local`:
```
NEXT_PUBLIC_APP_DOMAIN=fmanager.localhost
```

Then access: `http://test-agency.fmanager.localhost:3000`

## Payment Verification Flow

```
RuxSpeed Android app reads incoming SMS
  → sends to /api/ruxspeed-webhook
  → HMAC verified
  → TrxID matched to pending order
  → Supabase Realtime notifies checkout page
  → success animation shown to customer
```

## Billing Logic

```
pg_cron runs on 1st of each month
  → counts active shops per agency
  → generates invoice records (100 BDT × active shops)
  → super admin sees unpaid invoices
  → manually confirms payment
  → marks invoice as paid
```

## Deployment (Vercel)

1. Add domain `fmanager.com` to Vercel project
2. Add wildcard domain `*.fmanager.com`
3. Set all environment variables from `.env.local.example`
4. Deploy

## Revenue Model

Agencies pay **100 BDT per active shop per month** to Team Sifr. Sellers pay agencies whatever the agency decides.

---

Built with ❤️ by Team Sifr
