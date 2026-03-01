import { Users, Clock, Target, TrendingUp } from 'lucide-react'
import { dashboardStats, students, alerts } from '../lib/mockData'
import PitchHeatmap from '../components/PitchHeatmap'

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-2xl font-semibold font-heading text-charcoal">{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const topPracticers = [...students].sort((a, b) => b.practiceMinutesThisWeek - a.practiceMinutesThisWeek).slice(0, 5)
  const recentAlerts = alerts.slice(0, 4)

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal mb-6">Dashboard</h1>

      <div className="grid grid-cols-4 gap-5 mb-8">
        <StatCard
          label="Active This Week"
          value={`${dashboardStats.activePracticers} / ${dashboardStats.totalStudents}`}
          sub="students practicing"
          icon={Users}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          label="Avg Practice Time"
          value={`${dashboardStats.avgMinutesPerStudent} min`}
          sub="per student this week"
          icon={Clock}
          color="bg-amber/10 text-amber"
        />
        <StatCard
          label="Pitch Accuracy"
          value={`${dashboardStats.avgPitchAccuracy}%`}
          sub="class average"
          icon={Target}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          label="Total Practice"
          value={`${(dashboardStats.totalPracticeMinutes / 60).toFixed(0)} hrs`}
          sub={`${dashboardStats.totalPracticeMinutes} minutes this week`}
          icon={TrendingUp}
          color="bg-coral/10 text-coral"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold font-heading text-charcoal mb-4">Top Practicers</h2>
          <div className="space-y-3">
            {topPracticers.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-charcoal">{s.name}</p>
                    <p className="text-xs text-muted">{s.section}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-charcoal">{s.practiceMinutesThisWeek} min</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold font-heading text-charcoal mb-4">Recent Alerts</h2>
          <div className="space-y-3">
            {recentAlerts.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                  a.type === 'warning' ? 'bg-coral' : a.type === 'success' ? 'bg-primary' : 'bg-amber'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-charcoal">
                    {a.studentName && <span className="font-medium">{a.studentName} </span>}
                    {a.message}
                  </p>
                  <p className="text-xs text-muted">{a.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <PitchHeatmap />
      </div>
    </div>
  )
}
