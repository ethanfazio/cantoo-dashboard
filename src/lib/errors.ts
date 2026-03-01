/**
 * Base class for all pipeline errors.
 * Each subclass carries a machine-readable `code` for programmatic handling.
 */
export class PipelineError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'PipelineError'
    this.code = code
  }
}

// ── Upload errors ────────────────────────────────────────────

export type UploadErrorReason = 'file_too_large' | 'network' | 'invalid_type' | 'storage'

const UPLOAD_MESSAGES: Record<UploadErrorReason, string> = {
  file_too_large: 'File exceeds the 25 MB size limit.',
  network: 'Network error — please check your connection and try again.',
  invalid_type: 'Only PDF and MusicXML files are accepted.',
  storage: 'Failed to save the file. Please try again.',
}

export class UploadError extends PipelineError {
  readonly reason: UploadErrorReason

  constructor(reason: UploadErrorReason, message?: string) {
    super(`upload/${reason}`, message ?? UPLOAD_MESSAGES[reason])
    this.name = 'UploadError'
    this.reason = reason
  }
}

// ── OMR errors ───────────────────────────────────────────────

export class OmrError extends PipelineError {
  constructor(message = 'Note recognition failed. The PDF is still available, but note-by-note guidance will not be.') {
    super('omr/failed', message)
    this.name = 'OmrError'
  }
}

// ── Audio loading errors ─────────────────────────────────────

export class AudioLoadError extends PipelineError {
  readonly url: string

  constructor(url: string, message = 'Failed to load audio sample.') {
    super('audio/load_failed', message)
    this.name = 'AudioLoadError'
    this.url = url
  }
}

// ── Pitch detection errors ───────────────────────────────────

export type PitchDetectionReason = 'not_supported' | 'permission_denied' | 'permission_dismissed'

const PITCH_MESSAGES: Record<PitchDetectionReason, string> = {
  not_supported: 'Your browser does not support microphone access.',
  permission_denied: 'Microphone permission was denied. Please allow access in your browser settings.',
  permission_dismissed: 'Microphone permission was dismissed. Please try again.',
}

export class PitchDetectionError extends PipelineError {
  readonly reason: PitchDetectionReason

  constructor(reason: PitchDetectionReason, message?: string) {
    super(`pitch/${reason}`, message ?? PITCH_MESSAGES[reason])
    this.name = 'PitchDetectionError'
    this.reason = reason
  }
}
