-- ============================================================
-- Add status + error_message columns to songs table
-- and update the scores bucket file size limit to 25 MB.
-- ============================================================

ALTER TABLE public.songs
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'processing'
    CHECK (status IN ('processing', 'ready', 'pdf_only', 'error')),
  ADD COLUMN IF NOT EXISTS error_message text;

UPDATE storage.buckets
SET file_size_limit = 26214400
WHERE id = 'scores';
