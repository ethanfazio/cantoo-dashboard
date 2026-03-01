export type SongStatus = 'processing' | 'ready' | 'pdf_only' | 'error'

/** Matches the `songs` table in Supabase (snake_case, lowercase enums). */
export interface DbSong {
  id: string
  title: string
  composer: string | null
  file_url: string | null
  file_type: 'pdf' | 'musicxml' | null
  voice_parts: ('S' | 'A' | 'T' | 'B')[]
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null
  school_id: string | null
  created_by: string | null
  created_at: string
  parsed_notes: ParsedNotes | null
  status: SongStatus
  error_message: string | null
}

/** Matches the `song_assignments` table in Supabase. */
export interface SongAssignment {
  id: string
  song_id: string
  class_id: string
  assigned_by: string | null
  assigned_at: string
  due_date: string | null
}

export interface TimeSignature {
  beats: number
  beatType: number
}

export interface MeasureMetadata {
  measureNumber: number
  timeSignature: TimeSignature
  supported: boolean
}

/** Shape of the `parsed_notes` JSONB column. */
export interface ParsedNotes {
  voices: Record<string, {
    noteCount: number
    range: string
  }>
  measures?: MeasureMetadata[]
}

/** Song joined with its assignments (returned by getSongsForClass). */
export interface SongWithAssignments extends DbSong {
  song_assignments: SongAssignment[]
}

/** Payload for creating a new song via uploadScore(). */
export interface UploadScoreMetadata {
  title: string
  composer: string
  voiceParts: ('S' | 'A' | 'T' | 'B')[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  schoolId?: string
  assignedClassIds?: string[]
}
