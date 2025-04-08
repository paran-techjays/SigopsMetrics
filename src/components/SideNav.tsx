"use client"

import type React from "react"

import { useLocation, useNavigate } from "react-router-dom"
import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Toolbar from "@mui/material/Toolbar"
import DashboardIcon from "@mui/icons-material/Dashboard"
import VisibilityIcon from "@mui/icons-material/Visibility"
import BuildIcon from "@mui/icons-material/Build"
import AssessmentIcon from "@mui/icons-material/Assessment"
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import TaskIcon from "@mui/icons-material/Task"
import InfoIcon from "@mui/icons-material/Info"
import HelpIcon from "@mui/icons-material/Help"
import SettingsInputAntennaIcon from "@mui/icons-material/SettingsInputAntenna"
import BarChartIcon from "@mui/icons-material/BarChart"

interface SideNavProps {
  open: boolean
  width: number
}

interface NavItem {
  text: string
  icon: React.ReactNode
  path: string
}

export default function SideNav({ open, width }: SideNavProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems: NavItem[] = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Operations", icon: <BarChartIcon />, path: "/operations" },
    { text: "Maintenance", icon: <BuildIcon />, path: "/maintenance" },
    { text: "Watchdog", icon: <VisibilityIcon />, path: "/watchdog" },
    { text: "TEAMS Tasks", icon: <TaskIcon />, path: "/teams-tasks" },
    { text: "Health Metrics", icon: <HealthAndSafetyIcon />, path: "/health-metrics" },
    { text: "Summary Trend", icon: <TrendingUpIcon />, path: "/summary-trend" },
    { text: "Signal Info", icon: <SettingsInputAntennaIcon />, path: "/signal-info" },
    { text: "Reports", icon: <AssessmentIcon />, path: "/reports" },
    { text: "Help", icon: <HelpIcon />, path: "/help" },
    { text: "About", icon: <InfoIcon />, path: "/about" },
  ]

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: width,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton selected={location.pathname === item.path} onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  )
}

