# Backend Integration — Architectural Decision Records

Append-only. Newest at bottom. One block per decision.

---

## ADR-001 — Server Actions, not API routes, for admin CRUD
- Date: 2026-04-17
- Phase: 2
- Context: Admin pages need to create/update/delete organizations, donations, profiles, volunteer needs. Options considered: (a) Next.js API routes under `/app/api/admin/*`, (b) Server Actions co-located with pages, (c) direct client-side Supabase calls from `use client` components.
- Decision: **Server Actions** (option b), one `actions.ts` per admin page.
- Why:
  - Admin mutations are always coupled to a specific admin page — co-location reduces indirection.
  - Server Actions integrate natively with `revalidatePath` — no manual cache busting.
  - Same cookie-based Supabase auth flow as the rest of the app; no bearer-token plumbing.
  - Every action re-invokes `requireAdmin()` — defense in depth on top of middleware and RLS.
  - Phase 4 (file import) will still use an API route because `FormData`/multipart is friendlier there. We accept mixed patterns across phases.
- Rejected:
  - API routes: more boilerplate, no revalidation benefit, extra network hop vs action.
  - Direct client calls: impossible to re-verify role server-side without a trip anyway; also leaks logic into client bundle.
- Consequence: All admin mutations must return `{ ok: true; ... } | { ok: false; error: string }` and be called via `useTransition` for pending UX. Builder must keep this shape consistent.

---

## ADR-002 — Revalidation via `revalidatePath` (no tags) at the action level
- Date: 2026-04-17
- Phase: 2
- Context: When admin edits an organization, the public homepage and `/organization/[id]` must reflect the change. Options: (a) `revalidatePath` per mutation, (b) `revalidateTag` with granular tags, (c) no server cache (force-dynamic everywhere).
- Decision: **Per-path `revalidatePath` calls inside each Server Action.**
- Why:
  - Small surface (4 public routes total after Phase 5): `/`, `/organization/[id]`, `/volunteers`, org detail. Listing paths is clearer than tagging.
  - Tags add an indirection layer (tag names must be kept in sync between fetchers and mutators) with no benefit at this scale.
  - `force-dynamic` everywhere wastes the free perf Next provides and complicates the move to ISR later.
- Path map (authoritative):
  - Organization create/update/delete/toggle → `/admin/organizations`, `/`, and `/organization/${id}` (update/delete/toggle only).
  - Donation create/delete → `/admin/donations`, `/admin`.
  - User invite/role-change/delete → `/admin/users`.
  - Volunteer need create/update/delete → `/admin/volunteers`, `/volunteers`.
  - Dashboard stats auto-refresh on revisit because `/admin` is re-fetched; optionally revalidate `/admin` on donation create (listed above).
- Consequence: If a new public route starts showing org data, the actions must be updated. Searchable trail: `grep -r revalidatePath app/admin`.

---

## ADR-003 — Users page: role changes go through a server action with a DB-trigger backstop
- Date: 2026-04-17
- Phase: 2
- Context: The users admin page exposes role changes between `public`, `organization`, `admin`. The existing RLS has a gap: policy "Users update own profile" (`WITH CHECK (auth.uid() = id)`) would let any authenticated user `UPDATE profiles SET role='admin' WHERE id = auth.uid()`. Middleware + route guards don't cover direct DB hits via Supabase client. Three layers of defense required.
- Decision: Three concurrent defenses.
  1. **Server Action with re-verified admin role.** `updateUserRoleAction` calls `await requireAdmin()` as its first line. All UI role-change writes route through this action.
  2. **Supabase service-role client only used inside the action** (`lib/supabase/admin.ts`) for `auth.admin.inviteUserByEmail` / `deleteUser`. Never exposed to the browser.
  3. **Postgres trigger** `profiles_prevent_self_escalation` (migration 004) raises an exception if a non-admin attempts to change their own `role` or `organization_id`. This closes the gap even if all app code is compromised.
- `organization_id` handling: required when `nextRole === 'organization'`; action sets it to `null` otherwise. Prevents stale org-to-user links after role downgrade.
- Why not only RLS column-restriction: Postgres RLS doesn't support column-level policies directly. A trigger is the idiomatic fix.
- Why not only the server action: defense in depth. If someone bypasses the app (e.g., uses their own access token against the Supabase REST endpoint), the trigger still blocks self-escalation.
- Consequence: Migration 004 must be applied before users page ships. Verification query (included in migration): attempt a self-role update as a non-admin test user and assert the UPDATE raises.

---
