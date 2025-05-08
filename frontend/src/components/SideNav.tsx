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
import Box from "@mui/material/Box"
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
import HealingIcon from '@mui/icons-material/Healing';

interface SideNavProps {
  open?: boolean
  expanded?: boolean
  width: number
}

interface NavItem {
  text: string
  icon: React.ReactNode
  path: string
}

export default function SideNav({ open = true, expanded = true, width }: SideNavProps) {
  const location = useLocation()
  const navigate = useNavigate()

  // Use either open or expanded prop for backward compatibility
  const isOpen = open
  const isExpanded = expanded

  const navItems: NavItem[] = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Operations", icon: <BarChartIcon />, path: "/operations" },
    { text: "Maintenance", icon: <BuildIcon />, path: "/maintenance" },
    { text: "Watchdog", icon: <VisibilityIcon />, path: "/watchdog" },
    { text: "TEAMS Tasks", icon: <TaskIcon />, path: "/teams-tasks" },
    { text: "Health Metrics", icon: <HealingIcon />, path: "/health-metrics" },
    { text: "Summary Trend", icon: <TrendingUpIcon />, path: "/summary-trend" },
    { text: "Signal Info", icon: <SettingsInputAntennaIcon />, path: "/signal-info" },
    { text: "Reports", icon: <AssessmentIcon />, path: "/reports" },
    { text: "Help", icon: <HelpIcon />, path: "/help" },
    { text: "About", icon: <InfoIcon />, path: "/about" },
  ]

  return (
    <Drawer
      variant="permanent"
      open={isOpen}
      sx={{
        width: width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: width,
          boxSizing: "border-box",
          overflowX: "hidden",
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'hidden' }}>
        <List>
          {navItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                selected={location.pathname === item.path} 
                onClick={() => navigate(item.path)}
                sx={{ 
                  justifyContent: isExpanded ? 'initial' : 'center',
                  minHeight: 48
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: isExpanded ? 56 : 'auto',
                  mr: isExpanded ? 3 : 'auto',
                  justifyContent: 'center'
                }}>
                  {item.icon}
                </ListItemIcon>
                {isExpanded && <ListItemText primary={item.text} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ 
        position: 'fixed', 
        bottom: 15, 
        display: 'flex',
        justifyContent: 'center',
        ml: isExpanded ? 2 : 0,
        width: isExpanded ? 'auto' : width
      }}>
        {isExpanded ? (
          <img src="/assets/images/PoweredByGDOT.png" width="150px" alt="Powered by GDOT" />
        ) : (
          <img src="/assets/images/PoweredByGDOT-mini.png" width="30px" alt="GDOT" />
        )}
      </Box>
    </Drawer>
  )
}

