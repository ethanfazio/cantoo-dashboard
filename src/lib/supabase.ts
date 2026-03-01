import { createClient } from '@supabase/supabase-js'
import type { DbSong, SongWithAssignments, ParsedNotes, UploadScoreMetadata } from '../types/database'
import { UploadError } from './errors'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Constants ────────────────────────────────────────────────

export const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB

const VALID_EXTENSIONS = ['pdf', 'musicxml', 'mxl']

// ── Helper functions ──────────────────────────────────────────

/**
 * Upload a score file to Supabase Storage and create a songs record.
 * Throws UploadError on validation or infrastructure failures.
 */
export async function uploadScore(
  file: File,
  metadata: UploadScoreMetadata
): Promise<DbSong> {
  // 1. Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new UploadError('file_too_large')
  }

  // 2. Validate file type
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !VALID_EXTENSIONS.includes(ext)) {
    throw new UploadError('invalid_type')
  }

  const fileType = ext === 'pdf' ? 'pdf' : 'musicxml'
  const filePath = `${Date.now()}-${file.name}`

  // 3. Upload file to storage
  let fileUrl: string
  try {
    const { error } = await supabase.storage
      .from('scores')
      .upload(filePath, file)

    if (error) {
      throw new UploadError('storage', error.message)
    }

    const { data: urlData } = supabase.storage
      .from('scores')
      .getPublicUrl(filePath)
    fileUrl = urlData.publicUrl
  } catch (e) {
    if (e instanceof UploadError) throw e
    throw new UploadError('network')
  }

  // 4. Insert song record
  const songRow = {
    title: metadata.title,
    composer: metadata.composer || null,
    file_url: fileUrl,
    file_type: fileType,
    voice_parts: metadata.voiceParts,
    difficulty: metadata.difficulty,
    school_id: metadata.schoolId || null,
    status: 'processing' as const,
    error_message: null,
  }

  try {
    const { data, error } = await supabase
      .from('songs')
      .insert(songRow)
      .select()
      .single()

    if (error) {
      throw new UploadError('storage', error.message)
    }

    // 5. Create assignments if class IDs were provided
    if (metadata.assignedClassIds?.length && data) {
      const assignments = metadata.assignedClassIds.map((classId) => ({
        song_id: data.id,
        class_id: classId,
      }))
      await supabase.from('song_assignments').insert(assignments)
    }

    return data as DbSong
  } catch (e) {
    if (e instanceof UploadError) throw e
    throw new UploadError('network')
  }
}

/**
 * Fetch all songs assigned to a specific class.
 */
export async function getSongsForClass(classId: string): Promise<SongWithAssignments[]> {
  const { data, error } = await supabase
    .from('songs')
    .select('*, song_assignments!inner(*)')
    .eq('song_assignments.class_id', classId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch songs for class:', error.message)
    return []
  }

  return (data as SongWithAssignments[]) ?? []
}

/**
 * Fetch a single song with its parsed note data.
 */
export async function getSongWithNotes(songId: string): Promise<DbSong | null> {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('id', songId)
    .single()

  if (error) {
    console.error('Failed to fetch song:', error.message)
    return null
  }

  return data as DbSong
}

/**
 * Save extracted note data back to a song record.
 */
export async function saveParsedNotes(
  songId: string,
  notes: ParsedNotes
): Promise<boolean> {
  const { error } = await supabase
    .from('songs')
    .update({ parsed_notes: notes })
    .eq('id', songId)

  if (error) {
    console.error('Failed to save parsed notes:', error.message)
    return false
  }

  return true
}
