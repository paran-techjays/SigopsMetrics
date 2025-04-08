"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import MenuIcon from "@mui/icons-material/Menu"
import FilterListIcon from "@mui/icons-material/FilterList"
import PrintIcon from "@mui/icons-material/Print"
import HelpIcon from "@mui/icons-material/Help"
import SettingsIcon from "@mui/icons-material/Settings"
import AppsIcon from "@mui/icons-material/Apps"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"

interface HeaderProps {
  sideNavOpen: boolean
  onSideNavToggle: () => void
  onFilterToggle: () => void
}

export default function Header({ sideNavOpen, onSideNavToggle, onFilterToggle }: HeaderProps) {
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleHelpClick = () => {
    navigate("/help")
    handleMenuClose()
  }

  const handleContactClick = () => {
    navigate("/contact")
    handleMenuClose()
  }

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton color="inherit" aria-label="open drawer" onClick={onSideNavToggle} edge="start" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          SigOps Metrics
        </Typography>
        <IconButton color="inherit" onClick={onFilterToggle}>
          <FilterListIcon />
        </IconButton>
        <IconButton color="inherit">
          <PrintIcon />
        </IconButton>
        <IconButton color="inherit" onClick={handleMenuOpen}>
          <HelpIcon />
        </IconButton>
        <IconButton color="inherit">
          <SettingsIcon />
        </IconButton>
        <IconButton color="inherit">
          <AppsIcon />
        </IconButton>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleHelpClick}>Help</MenuItem>
          <MenuItem onClick={handleContactClick}>Contact</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

