import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Music, Target, Bell } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/songs', label: 'Songs', icon: Music },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/alerts', label: 'Alerts', icon: Bell },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-charcoal flex flex-col">
      <div className="px-6 py-6">
        <h1 className="text-xl font-bold text-white tracking-tight font-heading">
          cantoo
        </h1>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-xs text-gray-500">Cantoo Director v0.1</p>
      </div>
    </aside>
  )
}
