import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Songs from './pages/Songs'
import Goals from './pages/Goals'
import Alerts from './pages/Alerts'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="songs" element={<Songs />} />
        <Route path="goals" element={<Goals />} />
        <Route path="alerts" element={<Alerts />} />
      </Route>
    </Routes>
  )
}
