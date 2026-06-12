# FidélityPro

Digital loyalty card SaaS platform — Apple Wallet & Google Wallet, no app required.

**Stack:** Vite + React 18 · Supabase (Auth, DB, Storage, Edge Functions) · Tailwind CSS + shadcn/ui · React Router v6 · i18next (French default)

---

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in your Supabase keys
npm run dev
```

---

## Roles

| Role | Access |
|------|--------|
| `merchant` | Own merchant data only — dashboard, customers, scanner, card design, offers, notifications |
| `admin` | Full platform — all merchants, subscriptions, PassKit admin, audit logs |

No superadmin role exists.

---

## Supabase setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) → New Project.

### 2. Run migrations

Using Supabase CLI:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Or paste each file in `supabase/migrations/` into the Supabase SQL editor **in order** (001 → 010).

### 3. Storage buckets

Migration `006_storage_buckets.sql` creates the buckets automatically. Verify in Dashboard → Storage that these exist:
- `merchant-logos` (public)
- `card-assets` (public)
- `offer-assets` (private)

### 4. RLS policies

Migration `007_rls_policies.sql` enables RLS on all tables. Verify in Dashboard → Database → Tables that RLS is enabled and policies exist.

### 5. Deploy Edge Functions

```bash
# Set secrets first
supabase secrets set PASSKIT_API_KEY=your-passkit-key
supabase secrets set PASSKIT_BASE_URL=https://api.passkit.net
supabase secrets set PASSKIT_WEBHOOK_SECRET=your-webhook-secret

# Deploy all functions
supabase functions deploy public-customer-signup
supabase functions deploy passkit-create-card
supabase functions deploy passkit-update-card
supabase functions deploy add-points-and-sync-card
supabase functions deploy passkit-push-card-design
supabase functions deploy passkit-send-notification
supabase functions deploy passkit-test-connection
supabase functions deploy passkit-webhook
```

### 6. Environment variables (frontend)

Copy `.env.example` to `.env.local` and fill in:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find these in Supabase Dashboard → Settings → API.

### 7. Create the first admin user

Admins are **never created via the public signup form**. Create manually:

**Step 1 — Create the auth user** (Dashboard → Authentication → Users → Add user):
- Email: `admin@yourcompany.com`
- Password: (strong password)
- Check "Auto Confirm User"

**Step 2 — Insert the profile** (SQL Editor):

```sql
INSERT INTO public.profiles (id, email, full_name, role, status)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@yourcompany.com'),
  'admin@yourcompany.com',
  'Admin FidélityPro',
  'admin',
  'active'
);
```

The admin can now log in at `/connexion` and will be redirected to `/admin/dashboard`.

---

## How merchant signup works

1. Merchant signs up at `/inscription`
2. Supabase Auth user is created + email verification sent
3. `merchant`, `profiles`, `merchant_settings`, `card_designs`, `subscriptions` records are created automatically
4. After email confirmation, merchant logs in at `/connexion` → redirected to `/merchant/dashboard`

---

## How public customer registration works

1. Customer visits `/rejoindre/:merchantSlug`
2. Page calls `get_public_merchant_by_slug` RPC (safe, no private data exposed)
3. Customer fills form (name, phone, optional email)
4. Form calls the `public-customer-signup` Edge Function
5. Edge Function: validates → creates customer → generates QR token → calls PassKit → returns wallet URLs
6. Customer is redirected to add-to-wallet URL or success page

---

## How PassKit integration works

All PassKit API calls happen **exclusively inside Supabase Edge Functions**. The API key is never exposed to the frontend.

| Edge Function | Purpose |
|---------------|---------|
| `public-customer-signup` | Creates customer + initial wallet card |
| `passkit-create-card` | Creates Apple/Google Wallet card |
| `passkit-update-card` | Updates card after points change |
| `add-points-and-sync-card` | Main QR-scan handler — adds points + syncs card |
| `passkit-push-card-design` | Pushes card design update to all cards |
| `passkit-send-notification` | Sends push notification via wallet |
| `passkit-test-connection` | Tests PassKit credentials (admin only) |
| `passkit-webhook` | Receives PassKit webhook events |

**Points flow:**
1. Merchant scans QR → calls `add-points-and-sync-card`
2. Points saved to DB atomically via `add_customer_points` RPC
3. PassKit card update triggered (if fails, points still saved, `wallet_sync_failed: true` returned)
4. UI shows warning if wallet sync failed

---

## PassKit TODOs (requires real credentials)

Endpoint URLs in `supabase/functions/_shared/passkit-client.ts` are marked with `// TODO: Verify exact PassKit API endpoint`. Replace with actual endpoints when credentials are confirmed:

- `createLoyaltyCard` — POST to PassKit loyalty card creation endpoint
- `updateCardPoints` — PATCH/PUT to card update endpoint
- `pushDesignUpdate` — PUT to template update endpoint
- `sendPushNotification` — POST to push notification endpoint
- `testConnection` — GET to health/status endpoint

---

## Dashboard stats

Views:
- `merchant_stats_view` — per-merchant aggregates (customers, points, visits, offers, notifications)
- `admin_stats_view` — platform-wide totals (merchants, customers, wallet cards, revenue)

---

## Project commands

```bash
npm run dev       # start dev server (http://localhost:5173)
npm run build     # production build
npm run preview   # preview production build
npm run lint      # lint
```

---

## Current integration status

| Feature | Status |
|---------|--------|
| Supabase Auth | ✅ Connected |
| Database + RLS | ✅ Migrations ready |
| Storage buckets | ✅ Created via migration |
| Edge Functions | ✅ Deployed structure ready |
| Auth pages (login/signup/reset) | ✅ Connected |
| Public customer registration | ✅ Calls Edge Function |
| QR scanner + add points | ✅ Calls Edge Function |
| Card design save | ✅ Supabase storage + DB |
| PassKit card creation | 🔧 Structure ready — needs real API credentials |
| PassKit push notifications | 🔧 Structure ready — needs real API credentials |
| Other merchant pages | 🔧 Use mock data — connect to services when ready |
