-- Chrona Storage Configuration
-- Version 1.0.0

-- Create private storage bucket for attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chrona-attachments',
  'chrona-attachments',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'text/csv', 'application/json', 'application/zip']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies

-- Users can upload to their own folder
CREATE POLICY "Users can upload attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chrona-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can read their own files
CREATE POLICY "Users can read own attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'chrona-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can read all files in org (via signed URLs from server)
-- Note: This is handled at the application level with signed URLs

-- Users can delete their own files
CREATE POLICY "Users can delete own attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'chrona-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
