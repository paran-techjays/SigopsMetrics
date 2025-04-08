"use client"

import { useState } from "react"
import Drawer from "@mui/material/Drawer"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Toolbar from "@mui/material/Toolbar"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormControl from "@mui/material/FormControl"
import FormLabel from "@mui/material/FormLabel"
import TextField from "@mui/material/TextField"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import InputLabel from "@mui/material/InputLabel"
import Divider from "@mui/material/Divider"
import IconButton from "@mui/material/IconButton"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"

interface FilterSidebarProps {
  open: boolean
  width: number
}

export default function FilterSidebar({ open, width }: FilterSidebarProps) {
  const [dateRange, setDateRange] = useState("priorMonth")
  const [dateAggregation, setDateAggregation] = useState("monthly")
  const [signalId, setSignalId] = useState("")
  const [region, setRegion] = useState("centralMetro")

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={open}
      sx={{
        // width: width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: width,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />
      <Box sx={{ p: 3, overflow: "auto" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">Filters</Typography>
          <IconButton>
            <ChevronRightIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {/* Date Range */}
        <FormControl component="fieldset" sx={{ mb: 3, width: "100%" }}>
          <FormLabel component="legend">Date Range</FormLabel>
          <RadioGroup value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <FormControlLabel value="priorDay" control={<Radio />} label="Prior Day" />
            <FormControlLabel value="priorWeek" control={<Radio />} label="Prior Week" />
            <FormControlLabel value="priorMonth" control={<Radio />} label="Prior Month" />
            <FormControlLabel value="priorQuarter" control={<Radio />} label="Prior Quarter" />
            <FormControlLabel value="custom" control={<Radio />} label="Custom" />
          </RadioGroup>
        </FormControl>

        {/* Date Aggregation */}
        <FormControl component="fieldset" sx={{ mb: 3, width: "100%" }}>
          <FormLabel component="legend">Date Aggregation</FormLabel>
          <RadioGroup value={dateAggregation} onChange={(e) => setDateAggregation(e.target.value)}>
            <FormControlLabel value="quarterly" control={<Radio />} label="Quarterly" />
            <FormControlLabel value="monthly" control={<Radio />} label="Monthly" />
            <FormControlLabel value="weekly" control={<Radio />} label="Weekly" />
            <FormControlLabel value="daily" control={<Radio />} label="Daily" />
            <FormControlLabel value="hourly" control={<Radio />} label="1-hour" />
          </RadioGroup>
        </FormControl>

        {/* Signal ID */}
        <FormControl sx={{ mb: 3, width: "100%" }}>
          <FormLabel component="legend" sx={{ mb: 1 }}>
            Signal ID
          </FormLabel>
          <TextField
            size="small"
            placeholder="Enter ID"
            value={signalId}
            onChange={(e) => setSignalId(e.target.value)}
            fullWidth
          />
        </FormControl>

        {/* Region/District */}
        <FormControl sx={{ mb: 3, width: "100%" }}>
          <FormLabel component="legend" sx={{ mb: 1 }}>
            Region/District
          </FormLabel>
          <Select value={region} onChange={(e) => setRegion(e.target.value as string)} size="small" fullWidth>
            <MenuItem value="centralMetro">Central Metro</MenuItem>
            <MenuItem value="northRegion">North Region</MenuItem>
            <MenuItem value="southRegion">South Region</MenuItem>
          </Select>
        </FormControl>

        {/* Additional Filters */}
        <FormControl sx={{ mb: 3, width: "100%" }}>
          <InputLabel id="district-label">Select District</InputLabel>
          <Select labelId="district-label" label="Select District" size="small" fullWidth defaultValue="">
            <MenuItem value="district1">District 1</MenuItem>
            <MenuItem value="district2">District 2</MenuItem>
            <MenuItem value="district3">District 3</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ mb: 3, width: "100%" }}>
          <InputLabel id="agency-label">Select Managing Agency</InputLabel>
          <Select labelId="agency-label" label="Select Managing Agency" size="small" fullWidth defaultValue="">
            <MenuItem value="agency1">Agency 1</MenuItem>
            <MenuItem value="agency2">Agency 2</MenuItem>
            <MenuItem value="agency3">Agency 3</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ mb: 3, width: "100%" }}>
          <InputLabel id="county-label">Select County</InputLabel>
          <Select labelId="county-label" label="Select County" size="small" fullWidth defaultValue="">
            <MenuItem value="county1">County 1</MenuItem>
            <MenuItem value="county2">County 2</MenuItem>
            <MenuItem value="county3">County 3</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ mb: 3, width: "100%" }}>
          <InputLabel id="city-label">Select City</InputLabel>
          <Select labelId="city-label" label="Select City" size="small" fullWidth defaultValue="">
            <MenuItem value="city1">City 1</MenuItem>
            <MenuItem value="city2">City 2</MenuItem>
            <MenuItem value="city3">City 3</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ mb: 3, width: "100%" }}>
          <InputLabel id="corridor-label">Select Corridor</InputLabel>
          <Select labelId="corridor-label" label="Select Corridor" size="small" fullWidth defaultValue="">
            <MenuItem value="corridor1">Corridor 1</MenuItem>
            <MenuItem value="corridor2">Corridor 2</MenuItem>
            <MenuItem value="corridor3">Corridor 3</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ mb: 3, width: "100%" }}>
          <InputLabel id="priority-label">Select Priority</InputLabel>
          <Select labelId="priority-label" label="Select Priority" size="small" fullWidth defaultValue="">
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Drawer>
  )
}

