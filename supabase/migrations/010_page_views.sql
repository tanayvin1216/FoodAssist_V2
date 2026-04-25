-- Page view analytics: a lightweight, first-party tracker for the public site.
-- Inserted by an anonymous client beacon on each route change in (public)/*.
-- Read by admins via the /admin/analytics dashboard.
--
-- Intentionally NOT tracked: authenticated areas (/admin/*, /portal/*),
-- API routes, static assets. Filtering is enforced client-side in the
-- PageViewTracker component plus a path allowlist on the API route.

CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path TEXT NOT NULL,
  session_id TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_page_views_created ON page_views(created_at DESC);
CREATE INDEX idx_page_views_path ON page_views(path);
CREATE INDEX idx_page_views_session ON page_views(session_id);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Public INSERT: anyone (including anon) may record a page view.
-- No SELECT policy for anon — visitors cannot read the analytics back.
CREATE POLICY "Public can record page views"
  ON page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins (advisor): full SELECT for the analytics dashboard.
CREATE POLICY "Admins read page views"
  ON page_views FOR SELECT
  TO authenticated
  USING (public.is_admin());
