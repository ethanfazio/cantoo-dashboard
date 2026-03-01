import { goals } from '../lib/mockData'

function GoalCard({ goal }: { goal: typeof goals[0] }) {
  const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100)
  const isOnTrack = pct >= 70
  const barColor = isOnTrack ? 'bg-primary' : 'bg-coral'

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-semibold text-charcoal">{goal.title}</h3>
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          isOnTrack ? 'bg-primary/10 text-primary' : 'bg-coral/10 text-coral'
        }`}>
          {isOnTrack ? 'On Track' : 'Behind'}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-muted mb-1">
          <span>{goal.current} {goal.unit}</span>
          <span>{goal.target} {goal.unit}</span>
        </div>
        <div className="h-2.5 bg-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-muted">
        Due {new Date(goal.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </p>
    </div>
  )
}

export default function Goals() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal">Goals</h1>
        <span className="text-sm text-muted">{goals.length} active goals</span>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>
    </div>
  )
}
