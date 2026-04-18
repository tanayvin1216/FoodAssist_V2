# Research Briefs — FoodAssist V2 Backend Integration

Date: 2026-04-17
Author: researcher subagent

## TL;DR (one decision per brief)

- **Brief 1 (Parsing):** Use `exceljs` server-side in a Next.js API route. The npm `xlsx` package on the public registry is stuck at 0.18.5 with an unpatched prototype-pollution CVE (CVE-2023-30533). ExcelJS is the safer, maintained choice despite similar bundle weight.
- **Brief 2 (Hosting):** Start on Vercel Pro — Hobby prohibits commercial use, and a professionally-developed civic app qualifies. ISR with `revalidatePath` on org data sharply cuts function invocations vs SSR. Supabase free tier is fine at 12k users; 5 GB egress is the watch item.
- **Brief 3 (Google Sheets):** Phase 1 is CSV/XLSX file drop (no Google dependency). Phase 2 is a service account with the Sheets API v4, credentials stored in Vercel Production env vars only — never in source, never in Preview.

---

## Brief 1 — XLS/CSV Parsing Library

### Finding
- **`xlsx` (SheetJS CE)** is frozen at 0.18.5 on npm (last published 2+ years ago). CVE-2023-30533 (Prototype Pollution) affects all CE versions through 0.19.2. The fix landed in 0.19.3 but that version is NOT available on npm — only via SheetJS's own CDN. Confidence: HIGH.
- **`exceljs` (v4.4.0)** is actively maintained with bundled TypeScript definitions. Bundle ~1.1 MB minified (similar to SheetJS). NOT edge-runtime compatible — must run in a Node.js API route. No CVEs in 2024–2026. Confidence: HIGH.
- **`papaparse`** is tiny (~45 KB) and edge-compatible but CSV-only. Would still need a second library for .xls/.xlsx, defeating the bundle-size argument.
- **`hucre`** (zero-dep pure-TS) is too new / unverified for production admin ingestion.

### Decision
Use `exceljs` in `app/api/import/organizations/route.ts` with `export const runtime = 'nodejs'`. Accept `multipart/form-data`, stream file buffer into `exceljs.Workbook.xlsx.load()`, map rows to org schema, batch upsert to Supabase. The 50–500 row volume is negligible.

---

## Brief 2 — Vercel Hosting at 12k Public Users

### Plan tier
- Vercel Hobby explicitly restricts to "non-commercial, personal use only". A paid developer working on an app for a nonprofit still qualifies as commercial under Vercel's Fair Use Guidelines. Pro ($20/user/month) is required.
- Pro: 1 TB Fast Data Transfer, 10 M edge requests, 300 s max function duration, overage purchasing available.

### ISR vs SSR
- SSR fires a serverless function per request (wasteful for read-heavy public directory).
- ISR collapses concurrent requests into one background revalidation; CDN serves cached HTML for all other hits.
- Recommended pattern: `export const revalidate = 3600` on public org pages. Admin mutations call `revalidatePath('/directory')` after successful upsert. Admin + portal routes remain SSR (low traffic, real-time).

### Supabase free-tier risk matrix (12k MAU public users)
| Limit | Free tier cap | Our expected usage | Risk |
|-------|---------------|---------------------|------|
| DB storage | 500 MB | ~10 MB (50–500 orgs) | None |
| DB egress | 5 GB/mo | Low with ISR, HIGH without | Must ship ISR |
| Auth MAU | 50 k | 1–5 (admins only; public visitors are anon) | None |
| Direct connections | ~60 | 0 (using PostgREST via anon key) | None |
| Free project pause | after 1 wk inactivity | production app → upgrade to Pro ($25/mo) before launch | Medium |

### Connection pooling
Port 6543 is transaction mode only after Feb 28 2025 deprecation; session mode remains on 5432. For server actions / admin routes that use raw Postgres, use transaction mode (`?pgbouncer=true`). The `@supabase/ssr` client routes through PostgREST over HTTPS — no direct Postgres connection for standard reads/writes.

### Vercel env var placement
| Variable | Production | Preview | Development |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ❌ | dev project only |
| `DATABASE_URL` (pooler) | ✅ | ❌ | ❌ |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | ✅ | ❌ | ❌ |
| `GOOGLE_PRIVATE_KEY` | ✅ | ❌ | ❌ |

Preview environments MUST NOT get service-role or Google credentials — every PR deploy becomes a credential-exposure vector.

---

## Brief 3 — Google Sheets Integration Path

### Auth choice
- **Service account** (not OAuth). One bot identity, credentials stored once. Share the target Sheet with `foodassist-importer@<project>.iam.gserviceaccount.com` as Editor. No user consent flow, no refresh-token drift.
- OAuth adds per-user token storage + refresh plumbing for a single-sheet workflow — over-engineered.

### Published-to-web CSV vs full API
- Published-to-web CSV URL = public, no auth. Acceptable only for truly non-sensitive data. For org data that may include draft records or unpublished entries, inappropriate.
- Use the full Sheets API v4 with a service account.

### Rate limits
- 300 read requests/minute per project. No daily cap. A small admin team is nowhere near it. Cost: $0.

### Credential storage
- Store `client_email` + `private_key` as Vercel Production env vars (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`). Preserve newlines.
- Do NOT put the full JSON key file into Vault, source, or Preview env.

### Phasing
- Phase 1 (now): CSV/XLSX drag-and-drop via ExcelJS. Ships first.
- Phase 2: "Connect a Google Sheet" admin UI. Admin pastes sheet URL, server extracts ID, calls Sheets API with service account, maps to org schema, upserts.

---

## Risks

- **SheetJS CDN dependency.** If the implementer reaches for xlsx 0.19.3+ from the SheetJS CDN to dodge the CVE, they introduce an unversioned CDN dependency. Reject. Use `exceljs` from npm.
- **Vercel Hobby commercial restriction.** Deploying on Hobby violates ToS and risks deployment suspension without warning. Start on Pro from day one.
- **Supabase egress without ISR.** Full-SSR public directory at 12 k users could exhaust the 5 GB free-tier egress. ISR is a hard requirement for staying on the free Supabase tier.
- **Supabase free project pausing.** Free projects pause after 7 days of inactivity. For a production civic app, upgrade to Supabase Pro ($25/project/month) or accept the risk of a paused DB.
- **Service account key rotation.** Google service-account JSON keys do not auto-rotate. Calendar reminder every 90 days.
- **Preview env leakage.** If `SUPABASE_SERVICE_ROLE_KEY` or Google creds land in Preview scope, every PR exposes admin-level access. Enforce Production-only.

---

## Sources

- SheetJS CVE-2023-30533 — https://security.snyk.io/vuln/SNYK-JS-XLSX-5457926
- SheetJS npm fix-path discussion — https://git.sheetjs.com/sheetjs/sheetjs/issues/3098
- ExcelJS — https://www.npmjs.com/package/exceljs
- PapaParse — https://www.npmjs.com/package/papaparse
- Vercel Hobby docs — https://vercel.com/docs/plans/hobby
- Vercel Fair Use — https://vercel.com/docs/limits/fair-use-guidelines
- Vercel ISR — https://vercel.com/docs/incremental-static-regeneration
- Supabase pricing — https://supabase.com/pricing
- Supabase connection docs — https://supabase.com/docs/guides/database/connecting-to-postgres
- Supavisor session-mode deprecation — https://github.com/orgs/supabase/discussions/32755
- Google Sheets API limits — https://developers.google.com/workspace/sheets/api/limits
- Next.js + Google Sheets via service account — https://github.com/vercel/next.js/discussions/38430
