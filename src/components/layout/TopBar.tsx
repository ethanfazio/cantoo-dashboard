import { Bell } from 'lucide-react'
import { alerts } from '../../lib/mockData'

export default function TopBar() {
  const unreadCount = alerts.filter((a) => a.type === 'warning').length

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8">
      <div>
        <h2 className="text-base font-semibold text-charcoal font-heading">
          Concert Choir — Period 3
        </h2>
        <p className="text-xs text-muted">Lincoln Middle School</p>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-bg transition-colors">
          <Bell size={18} className="text-muted" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-coral text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
            MR
          </div>
          <span className="text-sm font-medium text-charcoal">Ms. Rivera</span>
        </div>
      </div>
    </header>
  )
}
