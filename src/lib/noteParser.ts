import type { ParsedNotes, MeasureMetadata, TimeSignature, SongStatus } from '../types/database'

/** Check whether parsed notes contain any actual voice data. */
export function hasParsedNotes(notes: ParsedNotes | null | undefined): boolean {
  if (!notes?.voices) return false
  return Object.keys(notes.voices).length > 0
}

/** Find all unique time signatures present in a set of measures. */
export function detectTimeSignatures(measures: MeasureMetadata[]): TimeSignature[] {
  const seen = new Map<string, TimeSignature>()
  for (const m of measures) {
    const key = `${m.timeSignature.beats}/${m.timeSignature.beatType}`
    if (!seen.has(key)) {
      seen.set(key, m.timeSignature)
    }
  }
  return Array.from(seen.values())
}

export interface FilterResult {
  supported: MeasureMetadata[]
  skipped: MeasureMetadata[]
  summary: string
}

/**
 * Filter measures to only those matching a target time signature.
 * Returns the supported measures, skipped measures, and a human-readable summary.
 */
export function filterMeasuresByTimeSignature(
  measures: MeasureMetadata[],
  target: TimeSignature
): FilterResult {
  const supported: MeasureMetadata[] = []
  const skipped: MeasureMetadata[] = []

  for (const m of measures) {
    const matches =
      m.timeSignature.beats === target.beats &&
      m.timeSignature.beatType === target.beatType
    if (matches) {
      supported.push(m)
    } else {
      skipped.push(m)
    }
  }

  const summary =
    skipped.length === 0
      ? `All ${supported.length} measures are in ${target.beats}/${target.beatType}.`
      : `${supported.length} of ${measures.length} measures are in ${target.beats}/${target.beatType}; ${skipped.length} skipped.`

  return { supported, skipped, summary }
}

/**
 * Derive the appropriate SongStatus based on OMR results.
 *  - If OMR was not attempted → 'processing'
 *  - If OMR ran but produced no notes → 'pdf_only'
 *  - If OMR succeeded with notes → 'ready'
 */
export function deriveSongStatus(
  parsedNotes: ParsedNotes | null | undefined,
  omrAttempted: boolean
): SongStatus {
  if (!omrAttempted) return 'processing'
  if (!hasParsedNotes(parsedNotes)) return 'pdf_only'
  return 'ready'
}
