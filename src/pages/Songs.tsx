import { useState, useEffect, useRef } from 'react'
import { Plus, Eye, UserPlus, Pencil, Trash2, X, FileMusic, Play, Loader, AlertTriangle } from 'lucide-react'
import { songs as initialSongs, mockClasses, type Song } from '../lib/mockData'
import type { SongStatus } from '../types/database'
import UploadScoreModal from '../components/UploadScoreModal'

// ── Inline sub-components ──

function DifficultyBadge({ level }: { level: string }) {
  const color =
    level === 'Beginner' ? 'bg-primary/10 text-primary' :
    level === 'Intermediate' ? 'bg-amber/10 text-amber' :
    'bg-coral/10 text-coral'
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{level}</span>
}

function StatusBadge({ status }: { status: SongStatus }) {
  switch (status) {
    case 'processing':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber/10 text-amber">
          <Loader size={12} className="animate-spin" />
          Processing
        </span>
      )
    case 'ready':
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
          Ready
        </span>
      )
    case 'pdf_only':
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber/10 text-amber cursor-help"
          title="The PDF is available, but note recognition failed — note-by-note practice is not supported for this score."
        >
          <FileMusic size={12} />
          PDF Only
        </span>
      )
    case 'error':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-coral/10 text-coral">
          <AlertTriangle size={12} />
          Error
        </span>
      )
  }
}

function VoicePartBadges({ parts }: { parts: ('S' | 'A' | 'T' | 'B')[] }) {
  return (
    <div className="flex gap-1">
      {parts.map((part) => (
        <span key={part} className="text-xs text-muted bg-bg px-1.5 py-0.5 rounded">
          {part}
        </span>
      ))}
    </div>
  )
}

function classNamesForSong(classIds?: string[]): string {
  if (!classIds || classIds.length === 0) return '—'
  return classIds
    .map(id => mockClasses.find(c => c.id === id)?.name)
    .filter(Boolean)
    .join(', ')
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Modal wrapper ──

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="bg-card rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        {children}
      </div>
    </div>
  )
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between p-5 border-b border-border">
      <h2 className="text-lg font-bold text-charcoal font-heading">{title}</h2>
      <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-bg transition-colors text-muted">
        <X size={18} />
      </button>
    </div>
  )
}

// ── SongPreviewModal ──

function SongPreviewModal({ song, onClose }: { song: Song; onClose: () => void }) {
  const partLabels: Record<string, string> = { S: 'Soprano', A: 'Alto', T: 'Tenor', B: 'Bass' }

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title={song.title} onClose={onClose} />
      <div className="p-5 space-y-4">
        <p className="text-sm text-muted">{song.composer}</p>
        {/* Status banners */}
        {song.status === 'pdf_only' && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber/5 border border-amber/20">
            <FileMusic size={16} className="text-amber mt-0.5 shrink-0" />
            <p className="text-xs text-amber">
              Note recognition was not successful for this score. The PDF is still available for reference, but note-by-note practice guidance is not supported.
            </p>
          </div>
        )}
        {song.status === 'error' && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-coral/5 border border-coral/20">
            <AlertTriangle size={16} className="text-coral mt-0.5 shrink-0" />
            <p className="text-xs text-coral">
              {song.errorMessage || 'An error occurred while processing this score.'}
            </p>
          </div>
        )}
        {/* PDF placeholder */}
        <div className="bg-bg rounded-xl border border-border flex flex-col items-center justify-center py-16">
          <FileMusic size={48} className="text-muted mb-3" />
          <p className="text-sm text-muted">PDF Preview</p>
          {song.fileType && (
            <span className="mt-2 px-2 py-0.5 rounded text-xs font-medium bg-border text-muted uppercase">{song.fileType}</span>
          )}
        </div>
        {/* Voice parts with play buttons */}
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Voice Parts</p>
          <div className="space-y-2">
            {song.voiceParts.map((part) => (
              <div key={part} className="flex items-center justify-between bg-bg rounded-lg px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm font-medium text-charcoal">{partLabels[part]}</span>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-light transition-colors">
                  <Play size={14} />
                  Play
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModalOverlay>
  )
}

// ── AssignClassDialog ──

function AssignClassDialog({ songs, onSave, onClose }: {
  songs: Song[]
  onSave: (songIds: string[], classIds: string[]) => void
  onClose: () => void
}) {
  // Pre-check classes that are common to all selected songs
  const commonClasses = songs.length === 1
    ? new Set(songs[0].assignedClasses || [])
    : new Set<string>()
  const [checked, setChecked] = useState<Set<string>>(commonClasses)

  function toggle(id: string) {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="Assign to Classes" onClose={onClose} />
      <div className="p-5 space-y-4">
        {songs.length > 1 && (
          <p className="text-sm text-muted">{songs.length} songs selected</p>
        )}
        {songs.length === 1 && (
          <p className="text-sm text-muted">{songs[0].title}</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {mockClasses.map((cls) => (
            <button
              key={cls.id}
              onClick={() => toggle(cls.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border text-left ${
                checked.has(cls.id)
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-card text-muted border-border hover:border-muted'
              }`}
            >
              {cls.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => onSave(songs.map(s => s.id), Array.from(checked))}
          className="w-full py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-light transition-colors cursor-pointer"
        >
          Save
        </button>
      </div>
    </ModalOverlay>
  )
}

// ── EditSongDialog ──

function EditSongDialog({ song, onSave, onClose }: {
  song: Song
  onSave: (updated: Song) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(song.title)
  const [composer, setComposer] = useState(song.composer)
  const [difficulty, setDifficulty] = useState(song.difficulty)
  const [voiceParts, setVoiceParts] = useState<('S' | 'A' | 'T' | 'B')[]>([...song.voiceParts])

  function togglePart(part: 'S' | 'A' | 'T' | 'B') {
    setVoiceParts(prev =>
      prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]
    )
  }

  function handleSave() {
    onSave({ ...song, title: title.trim(), composer: composer.trim(), difficulty, voiceParts })
    onClose()
  }

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="Edit Song" onClose={onClose} />
      <div className="p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-card text-charcoal placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Composer</label>
          <input
            type="text"
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-card text-charcoal placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Difficulty</label>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  difficulty === level ? 'bg-primary text-white' : 'bg-card text-muted hover:bg-bg'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Voice Parts</label>
          <div className="flex gap-2">
            {(['S', 'A', 'T', 'B'] as const).map((part) => (
              <button
                key={part}
                onClick={() => togglePart(part)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  voiceParts.includes(part)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-card text-muted border-border hover:border-muted'
                }`}
              >
                {part}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            title.trim()
              ? 'bg-primary text-white hover:bg-primary-light cursor-pointer'
              : 'bg-border text-muted cursor-not-allowed'
          }`}
        >
          Save Changes
        </button>
      </div>
    </ModalOverlay>
  )
}

// ── DeleteConfirmDialog ──

function DeleteConfirmDialog({ songs, onConfirm, onClose }: {
  songs: Song[]
  onConfirm: (songIds: string[]) => void
  onClose: () => void
}) {
  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="Delete Song" onClose={onClose} />
      <div className="p-5 space-y-4">
        <p className="text-sm text-charcoal">
          {songs.length === 1
            ? <>Are you sure you want to delete <span className="font-semibold">{songs[0].title}</span>?</>
            : <>Are you sure you want to delete <span className="font-semibold">{songs.length} songs</span>?</>
          }
        </p>
        <p className="text-xs text-muted">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-border text-charcoal hover:bg-bg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(songs.map(s => s.id))}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-coral text-white hover:bg-coral/90 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}

// ── Main page ──

export default function Songs() {
  const [songList, setSongList] = useState<Song[]>(initialSongs)
  const [showUpload, setShowUpload] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Filters
  const [filterVoicePart, setFilterVoicePart] = useState<'S' | 'A' | 'T' | 'B' | null>(null)
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null)
  const [filterAssignment, setFilterAssignment] = useState<'all' | 'assigned' | 'unassigned'>('all')

  // Action modals
  const [previewSong, setPreviewSong] = useState<Song | null>(null)
  const [assignSong, setAssignSong] = useState<Song | null>(null)
  const [editSong, setEditSong] = useState<Song | null>(null)
  const [deleteSong, setDeleteSong] = useState<Song | null>(null)
  const [bulkAssign, setBulkAssign] = useState(false)
  const [bulkDelete, setBulkDelete] = useState(false)

  // Filtered songs
  const filteredSongs = songList.filter(s => {
    if (filterVoicePart && !s.voiceParts.includes(filterVoicePart)) return false
    if (filterDifficulty && s.difficulty !== filterDifficulty) return false
    if (filterAssignment === 'assigned' && (!s.assignedClasses || s.assignedClasses.length === 0)) return false
    if (filterAssignment === 'unassigned' && s.assignedClasses && s.assignedClasses.length > 0) return false
    return true
  })

  // Select helpers
  const allFilteredSelected = filteredSongs.length > 0 && filteredSongs.every(s => selected.has(s.id))

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelected(prev => {
        const next = new Set(prev)
        filteredSongs.forEach(s => next.delete(s.id))
        return next
      })
    } else {
      setSelected(prev => {
        const next = new Set(prev)
        filteredSongs.forEach(s => next.add(s.id))
        return next
      })
    }
  }

  function handleUploadComplete(newSong: Song) {
    setSongList(prev => [newSong, ...prev])
  }

  // Action handlers
  function handleAssignSave(songIds: string[], classIds: string[]) {
    setSongList(prev => prev.map(s =>
      songIds.includes(s.id) ? { ...s, assignedClasses: classIds } : s
    ))
    setAssignSong(null)
    setBulkAssign(false)
  }

  function handleEditSave(updated: Song) {
    setSongList(prev => prev.map(s => s.id === updated.id ? updated : s))
  }

  function handleDeleteConfirm(songIds: string[]) {
    setSongList(prev => prev.filter(s => !songIds.includes(s.id)))
    setSelected(prev => {
      const next = new Set(prev)
      songIds.forEach(id => next.delete(id))
      return next
    })
    setDeleteSong(null)
    setBulkDelete(false)
  }

  const selectedSongs = songList.filter(s => selected.has(s.id))

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-charcoal">Songs</h1>
          <span className="text-sm text-muted">{songList.length} pieces</span>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-light transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Upload New Score
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Voice Part filter */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setFilterVoicePart(null)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              filterVoicePart === null ? 'bg-primary text-white' : 'bg-card text-muted hover:bg-bg'
            }`}
          >
            All Parts
          </button>
          {(['S', 'A', 'T', 'B'] as const).map(part => (
            <button
              key={part}
              onClick={() => setFilterVoicePart(filterVoicePart === part ? null : part)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                filterVoicePart === part ? 'bg-primary text-white' : 'bg-card text-muted hover:bg-bg'
              }`}
            >
              {part}
            </button>
          ))}
        </div>

        {/* Difficulty filter */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setFilterDifficulty(null)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              filterDifficulty === null ? 'bg-primary text-white' : 'bg-card text-muted hover:bg-bg'
            }`}
          >
            All Levels
          </button>
          {(['Beginner', 'Intermediate', 'Advanced'] as const).map(level => (
            <button
              key={level}
              onClick={() => setFilterDifficulty(filterDifficulty === level ? null : level)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                filterDifficulty === level ? 'bg-primary text-white' : 'bg-card text-muted hover:bg-bg'
              }`}
            >
              {level.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Assignment filter */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(['all', 'assigned', 'unassigned'] as const).map(opt => (
            <button
              key={opt}
              onClick={() => setFilterAssignment(opt)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                filterAssignment === opt ? 'bg-primary text-white' : 'bg-card text-muted hover:bg-bg'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 px-4 py-2.5 bg-primary/5 border border-primary/20 rounded-lg">
          <span className="text-sm font-semibold text-primary">{selected.size} selected</span>
          <button
            onClick={() => setBulkAssign(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-light transition-colors cursor-pointer"
          >
            <UserPlus size={14} />
            Assign to Class
          </button>
          <button
            onClick={() => setBulkDelete(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-coral text-white hover:bg-coral/90 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-border accent-primary"
                />
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Title</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Composer</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Parts</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Classes</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Difficulty</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Added</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredSongs.map((song) => (
              <tr key={song.id} className="hover:bg-bg/50 transition-colors">
                <td className="w-10 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selected.has(song.id)}
                    onChange={() => toggleSelect(song.id)}
                    className="rounded border-border accent-primary"
                  />
                </td>
                <td className="px-4 py-4">
                  <div>
                    <div>
                      <span className="text-sm font-medium text-charcoal">{song.title}</span>
                      {song.fileType && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-border text-muted uppercase">
                          {song.fileType}
                        </span>
                      )}
                    </div>
                    {song.status === 'pdf_only' && (
                      <p className="text-xs text-amber mt-0.5">PDF available, but note-by-note guidance is not.</p>
                    )}
                    {song.status === 'error' && song.errorMessage && (
                      <p className="text-xs text-coral mt-0.5">{song.errorMessage}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-muted">{song.composer}</span>
                </td>
                <td className="px-4 py-4">
                  <VoicePartBadges parts={song.voiceParts} />
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-muted">{classNamesForSong(song.assignedClasses)}</span>
                </td>
                <td className="px-4 py-4">
                  <DifficultyBadge level={song.difficulty} />
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={song.status} />
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-muted">{formatDate(song.assignedDate)}</span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setPreviewSong(song)}
                      className="p-1.5 rounded-lg hover:bg-bg transition-colors text-muted hover:text-charcoal"
                      title="Preview"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => setAssignSong(song)}
                      className="p-1.5 rounded-lg hover:bg-bg transition-colors text-muted hover:text-charcoal"
                      title="Assign to class"
                    >
                      <UserPlus size={16} />
                    </button>
                    <button
                      onClick={() => setEditSong(song)}
                      className="p-1.5 rounded-lg hover:bg-bg transition-colors text-muted hover:text-charcoal"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteSong(song)}
                      className="p-1.5 rounded-lg hover:bg-bg transition-colors text-muted hover:text-coral"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredSongs.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-sm text-muted">
                  No songs match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modals ── */}

      {showUpload && (
        <UploadScoreModal
          onClose={() => setShowUpload(false)}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {previewSong && (
        <SongPreviewModal song={previewSong} onClose={() => setPreviewSong(null)} />
      )}

      {assignSong && (
        <AssignClassDialog
          songs={[assignSong]}
          onSave={handleAssignSave}
          onClose={() => setAssignSong(null)}
        />
      )}

      {bulkAssign && selectedSongs.length > 0 && (
        <AssignClassDialog
          songs={selectedSongs}
          onSave={handleAssignSave}
          onClose={() => setBulkAssign(false)}
        />
      )}

      {editSong && (
        <EditSongDialog
          song={editSong}
          onSave={handleEditSave}
          onClose={() => setEditSong(null)}
        />
      )}

      {deleteSong && (
        <DeleteConfirmDialog
          songs={[deleteSong]}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteSong(null)}
        />
      )}

      {bulkDelete && selectedSongs.length > 0 && (
        <DeleteConfirmDialog
          songs={selectedSongs}
          onConfirm={handleDeleteConfirm}
          onClose={() => setBulkDelete(false)}
        />
      )}
    </div>
  )
}
