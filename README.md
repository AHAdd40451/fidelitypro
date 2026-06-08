# FidélityPro

Frontend-only loyalty card platform built with Vite + React.

## Stack

- **Vite** + **React 18**
- **Tailwind CSS** + **shadcn/ui** (Radix UI)
- **React Router v6**
- **i18next** (French default, English secondary)
- **Recharts** for charts
- **Mock data only** — no backend connected yet

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Other commands

```bash
npm run build     # production build
npm run preview   # preview production build
npm run lint      # lint
```

## Demo login

On the `/connexion` page, select a role from the dropdown:

| Role | Redirects to |
|------|-------------|
| Merchant | `/merchant/dashboard` |
| Admin | `/admin/dashboard` |
| Superadmin | `/superadmin/dashboard` |

No real credentials required — fully mocked.

## Status

| Integration | Status |
|-------------|--------|
| Backend / API | Not connected — mock data only |
| Supabase | Not connected — placeholder env vars only |
| PassKit API | Not connected — mock responses only |
| Authentication | Mock localStorage session |

## Future integrations

When you're ready to connect a real backend, set these env vars in `.env.local`:

```
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Then replace the mock functions in `src/services/mockServices.js` with real API calls.
