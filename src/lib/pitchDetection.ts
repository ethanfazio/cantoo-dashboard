import { PitchDetectionError } from './errors'

export type MicPermissionStatus = 'granted' | 'denied' | 'prompt' | 'not_supported'

export interface MicCapability {
  available: boolean
  status: MicPermissionStatus
  error?: PitchDetectionError
}

/**
 * Non-prompting check of microphone permission via the Permissions API.
 * Returns the current status without triggering a browser prompt.
 */
export async function checkMicPermission(): Promise<MicCapability> {
  if (!navigator.permissions) {
    return {
      available: false,
      status: 'not_supported',
      error: new PitchDetectionError('not_supported'),
    }
  }

  try {
    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
    const status: MicPermissionStatus =
      result.state === 'granted' ? 'granted' :
      result.state === 'denied' ? 'denied' :
      'prompt'

    return {
      available: result.state === 'granted',
      status,
      error: result.state === 'denied' ? new PitchDetectionError('permission_denied') : undefined,
    }
  } catch {
    return {
      available: false,
      status: 'not_supported',
      error: new PitchDetectionError('not_supported'),
    }
  }
}

/**
 * Prompt the user for microphone access.
 * Returns the MediaStream on success, or throws PitchDetectionError on failure.
 */
export async function requestMicAccess(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new PitchDetectionError('not_supported')
  }

  try {
    return await navigator.mediaDevices.getUserMedia({ audio: true })
  } catch (e) {
    if (e instanceof DOMException) {
      if (e.name === 'NotAllowedError') {
        throw new PitchDetectionError('permission_denied')
      }
      if (e.name === 'NotFoundError') {
        throw new PitchDetectionError('not_supported')
      }
    }
    throw new PitchDetectionError('permission_dismissed')
  }
}

/** Stop all tracks on a MediaStream and release the microphone. */
export function releaseMic(stream: MediaStream): void {
  for (const track of stream.getTracks()) {
    track.stop()
  }
}
