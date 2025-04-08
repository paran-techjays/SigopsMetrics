import { Routes, Route } from "react-router-dom"
import Dashboard from "../pages/Dashboard"
import Operations from "../pages/Operations"
import Maintenance from "../pages/Maintenance"
import Watchdog from "../pages/Watchdog"
import TeamsTask from "../pages/TeamsTask"
import HealthMetrics from "../pages/HealthMetrics"
import SummaryTrend from "../pages/SummaryTrend"
import SignalInfo from "../pages/SignalInfo"
import Reports from "../pages/Reports"
import Help from "../pages/Help"
import Contact from "../pages/Contact"
import About from "../pages/About"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/operations" element={<Operations />} />
      <Route path="/maintenance" element={<Maintenance />} />
      <Route path="/watchdog" element={<Watchdog />} />
      <Route path="/teams-tasks" element={<TeamsTask />} />
      <Route path="/health-metrics" element={<HealthMetrics />} />
      <Route path="/summary-trend" element={<SummaryTrend />} />
      <Route path="/signal-info" element={<SignalInfo />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/help" element={<Help />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}

