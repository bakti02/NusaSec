# nusasec-website

Public website, customer dashboard, internal admin dashboard, login page, and
the next-generation CMS/content platform for NusaSec — split out from the
`nusasec-core` backend so the two can be developed, deployed, and released
independently. The Python/FastAPI backend (`nusasec-core`) remains the system
of record; this package only talks to it over HTTP (`/api/...`).

## What moved here

| Folder        | What it is                                   | Was mounted at (old monolith) |
|---------------|-----------------------------------------------|--------------------------------|
| `site/`       | Public marketing site                         | `/site` (and `/` → `site/index.html`) |
| `web/`        | Customer console ("Control Tower")            | `/app` |
| `internal/`   | Internal company/admin console                | `/internal` |
| `login/`      | Shared login page (customer + internal)       | `/login` |
| `design/`     | Design-system live preview page               | *(was never actually reachable — see Bug fixes)* |
| `shared/design-system/tokens.css` | Shared design tokens        | *(was unused — see Bug fixes)* |
| `cms-next/`   | Next.js 16 + React 19 content/experience platform (structured CMS, replaces ad-hoc page editing over time) | not deployed yet, standalone |
| `cms-preview/`| Static HTML preview of the CMS workspace UI    | not deployed |

## Running it

**Local/dev, single command, same-origin (recommended):**

```bash
cd server
npm install
CORE_API_BASE_URL=http://localhost:8000 npm start
# open http://localhost:3000
```

This serves `site/`, `web/`, `internal/`, `login/`, `design/`, `shared/` at
the same paths the old backend used to mount them at, and reverse-proxies
`/api/*`, `/health`, `/docs`, `/redoc`, `/openapi.json` to `nusasec-core`. All
existing hrefs and `fetch('/api/...')` calls keep working unmodified.

**Production:** use `nginx.conf.sample` as a starting point (or the
equivalent on your CDN/host of choice) with the same routing.

**`cms-next/`** is a standalone Next.js app — deploy it separately (`npm
install && npm run build && npm start`, or on a platform like Vercel). It has
its own `README.md` and stack-decision doc under `docs/`.

## Why same-origin (proxy) instead of pure cross-origin?

The dashboard/login JS uses a session cookie for auth. Same-origin keeps that
cookie `SameSite=Lax`, which is simplest and safest. If you deploy the
website on a genuinely different origin than the API instead, you must
configure **both** sides:

- On `nusasec-core`: set `CORS_ALLOWED_ORIGINS_CSV` to your website's origin(s)
  and `SESSION_COOKIE_SAMESITE=none` (this also forces `Secure` on the cookie).
- Here: nothing else to do — all fetch calls already use
  `credentials:'include'` (fixed during the split, see below) rather than
  `credentials:'same-origin'`, so they work either way.

## Bug fixes made during the split

- **Broken design-system preview:** `design/index.html` linked to
  `/app/static/design-system/tokens.css`, but the old backend only ever
  mounted `/app` → the customer console folder (`app/web`), so that path
  404'd — the page's styling never actually loaded. `app/static/` itself was
  never mounted at all, i.e. dead code. Fixed: the stylesheet now lives at
  `shared/design-system/tokens.css` and the page links to `/shared/...`,
  which the reference server and sample Nginx config both serve correctly.
- **Hard-coded same-origin credentials:** `web/app.js`, `web/i18n.js`,
  `internal/app.js`, and `login/index.html` all called `fetch(..., {
  credentials: 'same-origin' })`. That only works when the frontend and API
  share an origin. Changed to `credentials: 'include'`, which works both
  same-origin (via the proxy, recommended) and cross-origin (via CORS on the
  API side), so this package isn't locked into one deployment topology.

## Corresponding changes made on the `nusasec-core` side

So this package can be deployed independently, `nusasec-core`'s
`app/main.py` no longer mounts these folders as local `StaticFiles` (it can't
— they're not in that repo anymore) and no longer serves `site/index.html`
for `/`; the API root now just returns a small JSON status payload. It also
gained optional CORS support (`CORS_ALLOWED_ORIGINS_CSV`) and a configurable
session-cookie `SameSite` policy (`SESSION_COOKIE_SAMESITE`) for the
cross-origin deployment case described above.

## Content lifecycle (cms-next)

`DRAFT → REVIEW → APPROVED → SCHEDULED → PUBLISHED → ARCHIVED`. English is
the source locale; security/legal/finance/regulatory content requires human
review before publish. See `cms-next/docs/CMS_STACK_DECISION_2026-08-17.md`.
