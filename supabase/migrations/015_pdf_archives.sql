-- PDF archive: stores every admin-generated directory PDF in Supabase Storage.
-- The pdf_archives table tracks metadata; the actual file lives in the
-- pdf-archives storage bucket at storage_path.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdf-archives',
  'pdf-archives',
  false,
  10485760,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE pdf_archives (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version       INTEGER NOT NULL,
  storage_path  TEXT NOT NULL UNIQUE,
  org_count     INTEGER NOT NULL,
  generated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pdf_archives_version ON pdf_archives(version DESC);
CREATE INDEX idx_pdf_archives_generated_at ON pdf_archives(generated_at DESC);

ALTER TABLE pdf_archives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read pdf archives"
  ON pdf_archives FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins insert pdf archives"
  ON pdf_archives FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins delete pdf archives"
  ON pdf_archives FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Storage object policies for the pdf-archives bucket

CREATE POLICY "Admins upload to pdf-archives"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'pdf-archives'
    AND public.is_admin()
  );

CREATE POLICY "Admins read from pdf-archives"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'pdf-archives'
    AND public.is_admin()
  );

CREATE POLICY "Admins delete from pdf-archives"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'pdf-archives'
    AND public.is_admin()
  );
