"use client"

import type React from "react"

import { useState } from "react"
import { styled } from "@mui/material/styles"
import Box from "@mui/material/Box"
import Header from "../Header";
import SideNav from "../SideNav"
import FilterSidebar from "../FilterSidebar"
import IconButton from "@mui/material/IconButton"
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useLocation } from 'react-router-dom';

const expandedDrawerWidth = 200
const collapsedDrawerWidth = 65
const filterWidth = 300

// List of routes where filter should be shown
const FILTER_ROUTES = [
  '/',
  '/operations',
  '/maintenance',
  '/summary-trend'
];

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "sideNavWidth" && prop !== "filterOpen" })<{
  sideNavWidth?: number
  filterOpen?: boolean
}>(({ theme, sideNavWidth, filterOpen }) => ({
  flexGrow: 1,
  // padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: 0,
  marginRight: 0,
  ...(sideNavWidth && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    // marginLeft: `${sideNavWidth}px`,
  }),
  // ...(filterOpen && {
  //   marginRight: `${filterWidth}px`,
  // }),
}))

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sideNavExpanded, setSideNavExpanded] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)
  const location = useLocation();

  // Check if current route should show filter
  const shouldShowFilter = FILTER_ROUTES.some(route => location.pathname.startsWith(route));

  const handleSideNavToggle = () => {
    setSideNavExpanded(!sideNavExpanded)
  }

  const handleFilterToggle = () => {
    setFilterOpen(!filterOpen)
  }

  const sideNavWidth = sideNavExpanded ? expandedDrawerWidth : collapsedDrawerWidth

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Header sideNavOpen={sideNavExpanded} onSideNavToggle={handleSideNavToggle} onFilterToggle={handleFilterToggle} />
      <SideNav open={true} expanded={sideNavExpanded} width={sideNavWidth} />
      <Main sideNavWidth={sideNavWidth} filterOpen={filterOpen}>
        <Box sx={{ pt: 8, height: "calc(100vh - 64px)", overflow: "auto" }}>
          {/* Filter Button - Only show for specific routes */}
          {shouldShowFilter && (
            <Box sx={{ 
              position: 'absolute', 
              top: '70px', 
              right: filterOpen ? `${filterWidth + 16}px` : '16px', 
              zIndex: 1100,
              transition: (theme) => theme.transitions.create(['right'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
              }),
            }}>
              <IconButton 
                color="primary" 
                onClick={handleFilterToggle}
                sx={{ 
                  bgcolor: 'white', 
                  boxShadow: 2,
                  '&:hover': {
                    bgcolor: 'white',
                    opacity: 0.9,
                  } 
                }}
                size="large"
                aria-label="open filters"
              >
                <FilterAltIcon />
              </IconButton>
            </Box>
          )}
          {children}
        </Box>
      </Main>
      {/* Only render FilterSidebar for specific routes */}
      {shouldShowFilter && (
        <FilterSidebar open={filterOpen} width={filterWidth} onClose={handleFilterToggle} />
      )}
    </Box>
  )
}

