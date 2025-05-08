import { Routes, Route } from "react-router-dom"
import Dashboard from "../components/Dashboard"
import Operations from "../components/Operations"
import Maintenance from "../components/Maintenance"
import Watchdog from "../components/Watchdog"
// import TeamsTask from "../components/TeamsTasks"
import HealthMetrics from "../components/HealthMetrics"
import SummaryTrend from "../components/SummaryTrend"
import SignalInfo from "../components/SignalInfo"
import Reports from "../components/Reports"
import Help from "../components/Help"
import Contact from "../components/ContactForm"
import About from "../components/About"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/operations" element={<Operations />} />
      <Route path="/maintenance" element={<Maintenance />} />
      <Route path="/watchdog" element={<Watchdog />} />
      {/* <Route path="/teams-tasks" element={<TeamsTask />} /> */}
      <Route path="/reports" element={<Reports />} />
      <Route path="/health-metrics" element={<HealthMetrics />} />
      <Route path="/summary-trend" element={<SummaryTrend />} />
      <Route path="/signal-info" element={<SignalInfo />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}
