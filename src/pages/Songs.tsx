import { songs } from '../lib/mockData'

function DifficultyBadge({ level }: { level: string }) {
  const color =
    level === 'Easy' ? 'bg-primary/10 text-primary' :
    level === 'Medium' ? 'bg-amber/10 text-amber' :
    'bg-coral/10 text-coral'
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{level}</span>
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-charcoal w-8 text-right">{value}%</span>
    </div>
  )
}

export default function Songs() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal">Songs</h1>
        <span className="text-sm text-muted">{songs.length} assigned pieces</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {songs.map((song) => (
          <div key={song.id} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-base font-semibold text-charcoal font-heading">{song.title}</h3>
                <p className="text-sm text-muted">{song.composer}</p>
              </div>
              <DifficultyBadge level={song.difficulty} />
            </div>
            <div className="mb-2">
              <p className="text-xs text-muted mb-1">Class completion</p>
              <ProgressBar value={song.avgCompletion} />
            </div>
            <p className="text-xs text-muted">Assigned {new Date(song.assignedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
