-- ============================================================
-- Songs & Song Assignments schema
-- Run this in the Supabase SQL Editor or via `supabase db push`
-- ============================================================

-- 1. Songs table
create table if not exists public.songs (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  composer    text,
  file_url    text,
  file_type   text check (file_type in ('pdf', 'musicxml')),
  voice_parts text[] default '{}',
  difficulty  text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  school_id   uuid,
  created_by  uuid references auth.users on delete set null,
  created_at  timestamptz default now(),
  parsed_notes jsonb
);

-- 2. Song assignments table
create table if not exists public.song_assignments (
  id          uuid primary key default gen_random_uuid(),
  song_id     uuid not null references public.songs on delete cascade,
  class_id    uuid not null,
  assigned_by uuid references auth.users on delete set null,
  assigned_at timestamptz default now(),
  due_date    date
);

-- 3. Indexes
create index if not exists idx_songs_school on public.songs (school_id);
create index if not exists idx_songs_created_by on public.songs (created_by);
create index if not exists idx_song_assignments_song on public.song_assignments (song_id);
create index if not exists idx_song_assignments_class on public.song_assignments (class_id);

-- 4. Enable Row Level Security
alter table public.songs enable row level security;
alter table public.song_assignments enable row level security;

-- 5. RLS policies — songs
create policy "Authenticated users can read songs"
  on public.songs for select
  to authenticated
  using (true);

create policy "Authenticated users can insert songs"
  on public.songs for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Song creators can update their songs"
  on public.songs for update
  to authenticated
  using (auth.uid() = created_by);

-- 6. RLS policies — song_assignments
create policy "Authenticated users can read song assignments"
  on public.song_assignments for select
  to authenticated
  using (true);

create policy "Authenticated users can create assignments"
  on public.song_assignments for insert
  to authenticated
  with check (auth.uid() = assigned_by);

create policy "Assignment creators can delete their assignments"
  on public.song_assignments for delete
  to authenticated
  using (auth.uid() = assigned_by);

-- 7. Storage bucket for score files
-- Note: If running via SQL editor, you may need to create the bucket
-- through the Supabase dashboard Storage UI instead.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'scores',
  'scores',
  false,
  20971520, -- 20 MB
  array['application/pdf', 'application/vnd.recordare.musicxml+xml', 'application/vnd.recordare.musicxml']
)
on conflict (id) do nothing;

-- 8. Storage policies — scores bucket
create policy "Authenticated users can upload scores"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'scores');

create policy "Authenticated users can read scores"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'scores');
