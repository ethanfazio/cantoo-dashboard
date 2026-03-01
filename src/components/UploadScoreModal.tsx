import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Upload, FileMusic, CheckCircle, Music, AlertTriangle, RotateCcw } from 'lucide-react'
import { uploadScore, MAX_FILE_SIZE } from '../lib/supabase'
import { UploadError } from '../lib/errors'
import { mockClasses, type Song } from '../lib/mockData'

type VoicePart = 'S' | 'A' | 'T' | 'B'
type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'
type ModalState = 'idle' | 'uploading' | 'success' | 'error'

const VOICE_PART_LABELS: Record<VoicePart, string> = {
  S: 'Soprano',
  A: 'Alto',
  T: 'Tenor',
  B: 'Bass',
}

const MOCK_NOTES: Record<VoicePart, number> = {
  S: 47,
  A: 52,
  T: 38,
  B: 41,
}

const ACCEPTED_EXTENSIONS = ['.pdf', '.musicxml', '.mxl']
const ACCEPTED_MIME_TYPES = ['application/pdf', 'application/vnd.recordare.musicxml+xml', 'application/vnd.recordare.musicxml']

function isAcceptedFile(file: File): boolean {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  return ACCEPTED_EXTENSIONS.includes(ext)
}

interface UploadScoreModalProps {
  onClose: () => void
  onUploadComplete: (song: Song) => void
}

export default function UploadScoreModal({ onClose, onUploadComplete }: UploadScoreModalProps) {
  const [modalState, setModalState] = useState<ModalState>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [composer, setComposer] = useState('')
  const [voiceParts, setVoiceParts] = useState<VoicePart[]>([])
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate')
  const [assignedClasses, setAssignedClasses] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const canSubmit = file && title.trim().length > 0

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleFileSelect = useCallback((selected: File) => {
    setErrorMessage(null)

    if (selected.size > MAX_FILE_SIZE) {
      setErrorMessage(`File exceeds the 25 MB size limit (${(selected.size / 1024 / 1024).toFixed(1)} MB).`)
      setFile(null)
      return
    }

    if (isAcceptedFile(selected)) {
      setFile(selected)
      // Auto-fill title from filename if empty
      if (!title) {
        const name = selected.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
        setTitle(name)
      }
    }
  }, [title])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFileSelect(dropped)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
  }

  function toggleVoicePart(part: VoicePart) {
    setVoiceParts(prev =>
      prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]
    )
  }

  function toggleClass(classId: string) {
    setAssignedClasses(prev =>
      prev.includes(classId) ? prev.filter(c => c !== classId) : [...prev, classId]
    )
  }

  async function handleProcessScore() {
    if (!canSubmit || !file) return

    setModalState('uploading')
    setErrorMessage(null)
    setProgress(0)

    // Simulate progress while uploading
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 200)

    const parts = voiceParts.length > 0 ? voiceParts : (['S', 'A', 'T', 'B'] as VoicePart[])

    try {
      const dbSong = await uploadScore(file, {
        title: title.trim(),
        composer: composer.trim() || 'Unknown',
        voiceParts: parts,
        difficulty: difficulty.toLowerCase() as 'beginner' | 'intermediate' | 'advanced',
        assignedClassIds: assignedClasses,
      })

      clearInterval(progressInterval)
      setProgress(100)

      // Brief pause to show 100% then switch to success
      await new Promise(resolve => setTimeout(resolve, 400))

      // Map DB record back to the UI Song shape
      const newSong: Song = {
        id: dbSong.id,
        title: dbSong.title,
        composer: dbSong.composer || 'Unknown',
        difficulty,
        voiceParts: parts,
        fileUrl: dbSong.file_url || undefined,
        createdBy: dbSong.created_by || undefined,
        assignedClasses,
        assignedDate: new Date().toISOString().split('T')[0],
        avgCompletion: 0,
        status: 'processing',
      }

      onUploadComplete(newSong)
      setModalState('success')
    } catch (e) {
      clearInterval(progressInterval)
      const message = e instanceof UploadError ? e.message : 'An unexpected error occurred. Please try again.'
      setErrorMessage(message)
      setModalState('error')
    }
  }

  function handleRetry() {
    setErrorMessage(null)
    setModalState('idle')
  }

  const selectedParts = voiceParts.length > 0 ? voiceParts : (['S', 'A', 'T', 'B'] as VoicePart[])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="bg-card rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-bold text-charcoal font-heading">
            {modalState === 'success' ? 'Upload Complete' : modalState === 'error' ? 'Upload Failed' : 'Upload Score'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-bg transition-colors text-muted"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {/* ─── IDLE: Form ─── */}
          {modalState === 'idle' && (
            <div className="space-y-5">
              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                  ${dragOver
                    ? 'border-primary bg-primary/5'
                    : file
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border hover:border-muted'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.musicxml,.mxl"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleFileSelect(f)
                  }}
                />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileMusic size={24} className="text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-charcoal">{file.name}</p>
                      <p className="text-xs text-muted">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload size={32} className="mx-auto mb-3 text-muted" />
                    <p className="text-sm font-medium text-charcoal mb-1">
                      Drop your score here, or click to browse
                    </p>
                    <p className="text-xs text-muted">PDF and MusicXML files accepted</p>
                  </>
                )}
              </div>

              {/* Inline validation error */}
              {errorMessage && modalState === 'idle' && (
                <p className="text-xs text-coral font-medium -mt-3">{errorMessage}</p>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Song Title <span className="text-coral">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Ave Verum Corpus"
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-card text-charcoal placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              {/* Composer */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Composer
                </label>
                <input
                  type="text"
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  placeholder="e.g. Mozart"
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-card text-charcoal placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              {/* Voice Parts */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Voice Parts Included
                </label>
                <div className="flex gap-2">
                  {(['S', 'A', 'T', 'B'] as VoicePart[]).map((part) => (
                    <button
                      key={part}
                      onClick={() => toggleVoicePart(part)}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-colors border
                        ${voiceParts.includes(part)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-card text-muted border-border hover:border-muted'
                        }
                      `}
                    >
                      {part}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Difficulty
                </label>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  {(['Beginner', 'Intermediate', 'Advanced'] as Difficulty[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`
                        flex-1 px-3 py-2 text-sm font-medium transition-colors
                        ${difficulty === level
                          ? 'bg-primary text-white'
                          : 'bg-card text-muted hover:bg-bg'
                        }
                      `}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assigned Classes */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Assign to Classes
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {mockClasses.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => toggleClass(cls.id)}
                      className={`
                        px-3 py-2 rounded-lg text-sm font-medium transition-colors border text-left
                        ${assignedClasses.includes(cls.id)
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'bg-card text-muted border-border hover:border-muted'
                        }
                      `}
                    >
                      {cls.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleProcessScore}
                disabled={!canSubmit}
                className={`
                  w-full py-2.5 rounded-lg text-sm font-semibold transition-colors
                  ${canSubmit
                    ? 'bg-primary text-white hover:bg-primary-light cursor-pointer'
                    : 'bg-border text-muted cursor-not-allowed'
                  }
                `}
              >
                Process Score
              </button>
            </div>
          )}

          {/* ─── UPLOADING ─── */}
          {modalState === 'uploading' && (
            <div className="py-8 text-center space-y-5">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
                <Music size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-charcoal mb-1">Uploading and processing…</p>
                <p className="text-xs text-muted">Analyzing voice parts and extracting notes</p>
              </div>
              <div className="max-w-xs mx-auto">
                <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted mt-2">{Math.round(Math.min(progress, 100))}%</p>
              </div>
            </div>
          )}

          {/* ─── ERROR ─── */}
          {modalState === 'error' && (
            <div className="py-8 text-center space-y-5">
              <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} className="text-coral" />
              </div>
              <div>
                <p className="text-sm font-semibold text-charcoal mb-1">Upload failed</p>
                <p className="text-xs text-muted">{errorMessage}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-border text-charcoal hover:bg-bg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRetry}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-light transition-colors cursor-pointer"
                >
                  <RotateCcw size={14} />
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* ─── SUCCESS ─── */}
          {modalState === 'success' && (
            <div className="py-4 space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={24} className="text-primary" />
                </div>
                <p className="text-base font-bold text-charcoal font-heading">Score uploaded successfully!</p>
                <p className="text-sm text-muted mt-1">{title}</p>
              </div>

              {/* Mock voice-part analysis */}
              <div className="bg-bg rounded-xl p-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                  Detected Voice Parts
                </p>
                <div className="space-y-2">
                  {selectedParts.map((part) => (
                    <div key={part} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm font-medium text-charcoal">
                          {VOICE_PART_LABELS[part]}
                        </span>
                      </div>
                      <span className="text-sm text-muted">
                        {MOCK_NOTES[part]} notes detected
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-light transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
