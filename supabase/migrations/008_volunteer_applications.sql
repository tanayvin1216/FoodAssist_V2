-- Volunteer applications: members of the public apply to volunteer,
-- either for a specific posted need or as a general application.
-- Orgs see applications for needs they posted. Admins (the Carteret
-- County advisor) see every application across the system.
--
-- No email system is wired up here — reviewers read the applicant's
-- contact info and follow up outside the app. The `status` +
-- `review_notes` columns are the audit trail.

CREATE TABLE volunteer_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  volunteer_need_id UUID REFERENCES volunteer_needs(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  willing_to_do TEXT NOT NULL,
  hours_per_week TEXT,
  availability TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'contacted')),
  review_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vol_app_org ON volunteer_applications(organization_id);
CREATE INDEX idx_vol_app_need ON volunteer_applications(volunteer_need_id);
CREATE INDEX idx_vol_app_status ON volunteer_applications(status);
CREATE INDEX idx_vol_app_created ON volunteer_applications(created_at DESC);

ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;

-- Public INSERT: anyone (including anon) may submit an application.
-- No SELECT policy for anon — applicants cannot read back the table.
CREATE POLICY "Public can submit applications"
  ON volunteer_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Orgs: SELECT + UPDATE applications targeted at their org, either via
-- direct organization_id match or via a volunteer_need they posted.
CREATE POLICY "Orgs view own applications"
  ON volunteer_applications FOR SELECT
  TO authenticated
  USING (
    organization_id = public.current_organization_id()
    OR volunteer_need_id IN (
      SELECT id FROM public.volunteer_needs
      WHERE organization_id = public.current_organization_id()
    )
  );

CREATE POLICY "Orgs update own applications"
  ON volunteer_applications FOR UPDATE
  TO authenticated
  USING (
    organization_id = public.current_organization_id()
    OR volunteer_need_id IN (
      SELECT id FROM public.volunteer_needs
      WHERE organization_id = public.current_organization_id()
    )
  );

-- Admins (advisor): full access to every application.
CREATE POLICY "Admins full access volunteer applications"
  ON volunteer_applications FOR ALL
  TO authenticated
  USING (public.is_admin());
