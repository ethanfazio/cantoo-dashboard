import { AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { alerts } from '../lib/mockData'

const iconMap = {
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
}

const colorMap = {
  warning: 'text-coral bg-coral/10',
  success: 'text-primary bg-primary/10',
  info: 'text-amber bg-amber/10',
}

export default function Alerts() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal">Alerts</h1>
        <span className="text-sm text-muted">{alerts.length} alerts</span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = iconMap[alert.type]
          const color = colorMap[alert.type]

          return (
            <div key={alert.id} className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-charcoal">
                  {alert.studentName && <span className="font-semibold">{alert.studentName} </span>}
                  {alert.message}
                </p>
                <p className="text-xs text-muted mt-1">{alert.timestamp}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
