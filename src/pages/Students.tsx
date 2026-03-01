import { students } from '../lib/mockData'

function AccuracyBadge({ value }: { value: number }) {
  const color = value >= 90 ? 'bg-primary/10 text-primary' : value >= 80 ? 'bg-amber/10 text-amber' : 'bg-coral/10 text-coral'
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{value}%</span>
}

export default function Students() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal">Students</h1>
        <span className="text-sm text-muted">{students.length} students</span>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Name</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Section</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Pitch Accuracy</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Practice (week)</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Streak</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Last Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-bg/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-charcoal">{s.name}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-muted">{s.section}</span>
                </td>
                <td className="px-6 py-4">
                  <AccuracyBadge value={s.avgPitchAccuracy} />
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-charcoal">{s.practiceMinutesThisWeek} min</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-charcoal">
                    {s.streak > 0 ? `${s.streak} days` : '—'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-muted">{s.lastActive}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
