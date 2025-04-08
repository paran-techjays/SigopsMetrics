"use client"

import type React from "react"

import { useState } from "react"
import { styled } from "@mui/material/styles"
import Box from "@mui/material/Box"
import Header from "./Header"
import SideNav from "./SideNav"
import FilterSidebar from "./FilterSidebar"

const drawerWidth = 240
const filterWidth = 300

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" && prop !== "filterOpen" })<{
  open?: boolean
  filterOpen?: boolean
}>(({ theme, open, filterOpen }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  marginRight: 0,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
  // ...(filterOpen && {
  //   marginRight: `${filterWidth}px`,
  // }),
}))

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sideNavOpen, setSideNavOpen] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)

  const handleSideNavToggle = () => {
    setSideNavOpen(!sideNavOpen)
  }

  const handleFilterToggle = () => {
    setFilterOpen(!filterOpen)
  }

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Header sideNavOpen={sideNavOpen} onSideNavToggle={handleSideNavToggle} onFilterToggle={handleFilterToggle} />
      <SideNav open={sideNavOpen} width={drawerWidth} />
      <Main open={sideNavOpen} filterOpen={filterOpen}>
        <Box sx={{ pt: 8, height: "calc(100vh - 64px)", overflow: "auto" }}>{children}</Box>
      </Main>
      <FilterSidebar open={filterOpen} width={filterWidth} />
    </Box>
  )
}

