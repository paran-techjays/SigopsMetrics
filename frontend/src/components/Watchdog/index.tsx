"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from 'react-redux'
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import FormControl from "@mui/material/FormControl"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import InputLabel from "@mui/material/InputLabel"
import TextField from "@mui/material/TextField"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import FilterListIcon from "@mui/icons-material/FilterList"
import FirstPageIcon from "@mui/icons-material/FirstPage"
import LastPageIcon from "@mui/icons-material/LastPage"
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft"
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight"
import CircularProgress from "@mui/material/CircularProgress"
import TableSortLabel from "@mui/material/TableSortLabel"
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import Plotly from 'plotly.js-dist'
import { RootState } from "../../store/store"
import { fetchWatchdogData } from "../../store/slices/watchdogSlice"
import { WatchdogParams } from "../../types/api.types"

// Available options
const zoneGroups = ["Central Metro", "Eastern Metro", "Western Metro", "North", "Southeast", "Southwest", "Ramp Meters"]
const alerts = ["No Camera Image", "Bad Vehicle Detection", "Bad Ped Pushbuttons", "Pedestrian Activations", "Force Offs", "Max Outs", "Count", "Missing Records"]
const phases = ["All", "1", "2", "3", "4", "5", "6", "7", "8"]
const streaks = ["All", "Active", "Active 3-days"]

export default function Watchdog() {
  const dispatch = useDispatch()
  const { data, loading, error } = useSelector((state: RootState) => state.watchdog)
  
  const [filter, setFilter] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date(),
    alert: "No Camera Image",
    phase: "All",
    intersectionFilter: "",
    streak: "All",
    zoneGroup: "Central Metro"
  })
  
  const [view, setView] = useState("table")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [orderBy, setOrderBy] = useState("streak")
  const [order, setOrder] = useState<"asc" | "desc">("desc")
  const plotContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadFilteredData()
  }, [])

  // Effect for rendering the plot when data changes
  useEffect(() => {
    if (view === "plot" && data && data.length > 0 && plotContainerRef.current) {
      renderPlot()
    }
  }, [view, data])

  const loadFilteredData = () => {
    const params: WatchdogParams = {
      startDate: filter.startDate.toISOString(),
      endDate: filter.endDate.toISOString(),
      alert: filter.alert,
      phase: filter.phase,
      intersectionFilter: filter.intersectionFilter,
      streak: filter.streak,
      zoneGroup: filter.zoneGroup
    }
    
    dispatch(fetchWatchdogData(params) as any)
  }

  const renderPlot = () => {
    if (!data || data.length === 0 || !plotContainerRef.current) return
    
    const plotData = data[0]
    const { x, y, z } = plotData
    
    const plotConfig = {
      x,
      y,
      z,
      type: "heatmap",
      hoverongaps: false,
      xgap: 1,
      ygap: 1,
      colorscale: [
        ["0", "rgb(237,237,237)"],
        [".01111111111", "rgb(245,158,103)"],
        ["1", "rgb(153,62,5)"],
      ],
      colorbar: {
        len: getLegendLen(y.length),
        title: "streak",
        y: 1,
        yanchor: 'top'
      },
      hovertemplate:
        "<b>Name:</b> %{y}<br><b>Date:</b> %{x}<br><b>Streak:</b> %{z}" +
        "<extra></extra>",
    }

    const layout = getPlotLayout(y.length)

    Plotly.newPlot(plotContainerRef.current, [plotConfig], layout, {
      responsive: true,
    })
  }

  const getPlotLayout = (yLength: number) => {
    if (yLength > 0) {
      return {
        font: {
          size: 10,
        },
        height: yLength * 18 + 200,
        yaxis: {
          automargin: true,
          tickmode: "auto",
          nticks: yLength,
        },
        xaxis: {
          side: "top",
          tickformat: "%B %d",
          tickmode: "linear",
        },
      }
    } else {
      return {
        height: 30,
        xaxis: {
          visible: false,
        },
        yaxis: {
          visible: false,
        },
        annotations: [
          {
            text: "No data",
            xref: "paper",
            yref: "paper",
            showarrow: false,
            font: {
              size: 28,
            },
          },
        ],
      }
    }
  }

  const getLegendLen = (length: number): number => {
    if (length >= 1 && length <= 3) {
      return 2
    } else if (length > 3 && length <= 7) {
      return 1
    } else if (length > 7 && length <= 20) {
      return 0.5
    } else {
      return 0.25
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }))
    // Debounce the filter change
    setTimeout(() => loadFilteredData(), 1000)
  }

  const handleViewChange = (event: React.SyntheticEvent, newValue: string) => {
    setView(newValue)
  }

  const handleChangePage = (newPage: number) => {
    setPage(newPage)
  }

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc"
    setOrder(isAsc ? "desc" : "asc")
    setOrderBy(property)
  }
  
  const exportToExcel = () => {
    if (!data || data.length === 0) return
    
    const tableData = data[0].tableData
    
    // Create a new workbook
    const wb = XLSX.utils.book_new()
    
    // Convert the data to the format expected by xlsx
    const excelData = tableData.map(row => ({
      Zone: row.zone,
      Corridor: row.corridor,
      SignalID: row.signalID,
      Name: row.name,
      Alert: row.alert,
      Occurrences: row.occurrences,
      Streak: row.streak,
      Date: row.date
    }))
    
    // Create a worksheet
    const ws = XLSX.utils.json_to_sheet(excelData)
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Watchdog Data")
    
    // Generate an XLSX file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    
    // Create a Blob from the buffer
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    // Save the file
    saveAs(blob, `Watchdog_Data_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }
  
  // Get the table data
  const getTableData = () => {
    if (!data || data.length === 0) return []
    return data[0].tableData
  }
  
  // Sort table data
  const getSortedData = (data: any[]) => {
    return [...data].sort((a, b) => {
      const valueA = a[orderBy]
      const valueB = b[orderBy]
      
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return order === 'asc' ? valueA - valueB : valueB - valueA
      } else {
        const strA = String(valueA).toLowerCase()
        const strB = String(valueB).toLowerCase()
        return order === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA)
      }
    })
  }
  
  const tableData = getTableData()
  const sortedData = getSortedData(tableData)
  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "auto" }}>
      {/* Filter Controls */}
      <Box sx={{ p: 1, display: "flex", flexWrap: "wrap", gap: 1, bgcolor: "#f5f5f5" }}>
        {/* Region */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="region-label">Region</InputLabel>
          <Select
            labelId="region-label"
            label="Region"
            value={filter.zoneGroup}
            onChange={(e) => handleFilterChange('zoneGroup', e.target.value)}
          >
            {zoneGroups.map(group => (
              <MenuItem key={group} value={group}>{group}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Date Range */}
        {/* <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="date-range-label">Enter a date range</InputLabel>
          <Select
            labelId="date-range-label"
            label="Enter a date range"
            value={`${filter.startDate.toLocaleDateString()} - ${filter.endDate.toLocaleDateString()}`}
            onChange={(e) => {
              const [start, end] = e.target.value.split(' - ')
              handleFilterChange('startDate', new Date(start))
              handleFilterChange('endDate', new Date(end))
            }}
            endAdornment={
              <IconButton size="small" sx={{ mr: 2 }}>
                <CalendarTodayIcon fontSize="small" />
              </IconButton>
            }
          >
            <MenuItem value={`${new Date(new Date().setDate(new Date().getDate() - 7)).toLocaleDateString()} - ${new Date().toLocaleDateString()}`}>Last 7 days</MenuItem>
            <MenuItem value={`${new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleDateString()} - ${new Date().toLocaleDateString()}`}>Prior Month</MenuItem>
            <MenuItem value={`${new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toLocaleDateString()} - ${new Date().toLocaleDateString()}`}>Prior Year</MenuItem>
          </Select>
        </FormControl> */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateRangePicker
            startText="Start"
            endText="End"
            value={[filter.startDate, filter.endDate]}
            onChange={(newValue) => {
              handleFilterChange('startDate', newValue[0])
              handleFilterChange('endDate', newValue[1])
            }}
            renderInput={(startProps, endProps) => (
              <>
                <TextField size="small" {...startProps} sx={{ minWidth: 110, mr: 1 }} />
                <Box sx={{ mx: 1 }}> to </Box>
                <TextField size="small" {...endProps} sx={{ minWidth: 110 }} />
              </>
            )}
          />
        </LocalizationProvider>

        {/* Alert */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="alert-label">Alert</InputLabel>
          <Select
            labelId="alert-label"
            label="Alert"
            value={filter.alert}
            onChange={(e) => handleFilterChange('alert', e.target.value)}
          >
            {alerts.map(alert => (
              <MenuItem key={alert} value={alert}>{alert}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Phase */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="phase-label">Phase</InputLabel>
          <Select
            labelId="phase-label"
            label="Phase"
            value={filter.phase}
            onChange={(e) => handleFilterChange('phase', e.target.value)}
          >
            {phases.map(phase => (
              <MenuItem key={phase} value={phase}>{phase}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Intersection Filter */}
        <TextField
          size="small"
          label="Intersection Filter"
          value={filter.intersectionFilter}
          onChange={(e) => handleFilterChange('intersectionFilter', e.target.value)}
          sx={{ minWidth: 200 }}
        />

        {/* Streak */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="streak-label">Streak</InputLabel>
          <Select
            labelId="streak-label"
            label="Streak"
            value={filter.streak}
            onChange={(e) => handleFilterChange('streak', e.target.value)}
          >
            {streaks.map(streak => (
              <MenuItem key={streak} value={streak}>{streak}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* View Tabs */}
      <Tabs value={view} onChange={handleViewChange} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tab label="Plot" value="plot" />
        <Tab label="Table" value="table" />
      </Tabs>

      {/* Table View */}
      {view === "table" && (
        <TableContainer sx={{ flex: 1, overflow: "auto" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ backgroundColor: "#2196f3", color: "white", fontWeight: "normal", padding: "12px 16px", borderRight: "1px solid rgba(255, 255, 255, 0.2)" }}
                  sortDirection={orderBy === "zone" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "zone"}
                    direction={orderBy === "zone" ? order : "asc"}
                    onClick={() => handleRequestSort("zone")}
                    sx={{ color: "white", "&.MuiTableSortLabel-active": { color: "white" }, "& .MuiTableSortLabel-icon": { color: "white !important" } }}
                  >
                    Zone
                  </TableSortLabel>
                </TableCell>
                <TableCell 
                  sx={{ backgroundColor: "#2196f3", color: "white", fontWeight: "normal", padding: "12px 16px", borderRight: "1px solid rgba(255, 255, 255, 0.2)" }}
                  sortDirection={orderBy === "corridor" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "corridor"}
                    direction={orderBy === "corridor" ? order : "asc"}
                    onClick={() => handleRequestSort("corridor")}
                    sx={{ color: "white", "&.MuiTableSortLabel-active": { color: "white" }, "& .MuiTableSortLabel-icon": { color: "white !important" } }}
                  >
                    Corridor
                  </TableSortLabel>
                </TableCell>
                <TableCell 
                  sx={{ backgroundColor: "#2196f3", color: "white", fontWeight: "normal", padding: "12px 16px", borderRight: "1px solid rgba(255, 255, 255, 0.2)" }}
                  sortDirection={orderBy === "signalID" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "signalID"}
                    direction={orderBy === "signalID" ? order : "asc"}
                    onClick={() => handleRequestSort("signalID")}
                    sx={{ color: "white", "&.MuiTableSortLabel-active": { color: "white" }, "& .MuiTableSortLabel-icon": { color: "white !important" } }}
                  >
                    SignalID
                  </TableSortLabel>
                </TableCell>
                <TableCell 
                  sx={{ backgroundColor: "#2196f3", color: "white", fontWeight: "normal", padding: "12px 16px", borderRight: "1px solid rgba(255, 255, 255, 0.2)" }}
                  sortDirection={orderBy === "name" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={() => handleRequestSort("name")}
                    sx={{ color: "white", "&.MuiTableSortLabel-active": { color: "white" }, "& .MuiTableSortLabel-icon": { color: "white !important" } }}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell 
                  sx={{ backgroundColor: "#2196f3", color: "white", fontWeight: "normal", padding: "12px 16px", borderRight: "1px solid rgba(255, 255, 255, 0.2)" }}
                  sortDirection={orderBy === "alert" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "alert"}
                    direction={orderBy === "alert" ? order : "asc"}
                    onClick={() => handleRequestSort("alert")}
                    sx={{ color: "white", "&.MuiTableSortLabel-active": { color: "white" }, "& .MuiTableSortLabel-icon": { color: "white !important" } }}
                  >
                    Alert
                  </TableSortLabel>
                </TableCell>
                <TableCell 
                  sx={{ backgroundColor: "#2196f3", color: "white", fontWeight: "normal", padding: "12px 16px", borderRight: "1px solid rgba(255, 255, 255, 0.2)" }}
                  sortDirection={orderBy === "occurrences" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "occurrences"}
                    direction={orderBy === "occurrences" ? order : "asc"}
                    onClick={() => handleRequestSort("occurrences")}
                    sx={{ color: "white", "&.MuiTableSortLabel-active": { color: "white" }, "& .MuiTableSortLabel-icon": { color: "white !important" } }}
                  >
                    Occurrences
                  </TableSortLabel>
                </TableCell>
                <TableCell 
                  sx={{ backgroundColor: "#2196f3", color: "white", fontWeight: "normal", padding: "12px 16px" }}
                  sortDirection={orderBy === "streak" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "streak"}
                    direction={orderBy === "streak" ? order : "asc"}
                    onClick={() => handleRequestSort("streak")}
                    sx={{ color: "white", "&.MuiTableSortLabel-active": { color: "white" }, "& .MuiTableSortLabel-icon": { color: "white !important" } }}
                  >
                    Streak
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row) => (
                <TableRow
                  key={row.signalID}
                  sx={{
                    "&:nth-of-type(odd)": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                    "&:hover": { bgcolor: "rgba(0, 0, 0, 0.08)" },
                  }}
                >
                  <TableCell>{row.zone}</TableCell>
                  <TableCell>{row.corridor}</TableCell>
                  <TableCell>{row.signalID}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.alert}</TableCell>
                  <TableCell align="center">{row.occurrences}</TableCell>
                  <TableCell align="center">{row.streak}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Plot View */}
      {view === "plot" && (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2 }}>
          <Typography variant="body2" color="error" sx={{ mb: 1 }}>
            Darker colors mean more consecutive days in which the alert condition is active.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Use the 'Intersection Filter' box to reduce the size of the list. Filter on the intersection name or ID number.
          </Typography>
          <Box 
            id="plot" 
            ref={plotContainerRef} 
            sx={{ flex: 1 }} 
          />
        </Box>
      )}

      {/* Bottom Controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1,
          borderTop: "1px solid rgba(224, 224, 224, 1)",
        }}
      >
        {/* Export Button */}
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#2196f3",
            textTransform: "none",
            borderRadius: 1,
            boxShadow: 1,
          }}
          onClick={exportToExcel}
        >
          Export To Excel
        </Button>

        {/* Pagination Controls */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            Items per page:
          </Typography>
          <Select
            value={rowsPerPage}
            size="small"
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            sx={{
              minWidth: 70,
              height: 32,
              mr: 2,
              "& .MuiSelect-select": {
                py: 0.5,
              },
            }}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>

          <Typography variant="body2" sx={{ mr: 2 }}>
            {tableData.length > 0 ? `${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, tableData.length)} of ${tableData.length}` : "0-0 of 0"}
          </Typography>

          <Box sx={{ display: "flex" }}>
            <IconButton size="small" disabled={page === 0} onClick={() => handleChangePage(0)}>
              <FirstPageIcon />
            </IconButton>
            <IconButton size="small" disabled={page === 0} onClick={() => handleChangePage(page - 1)}>
              <KeyboardArrowLeft />
            </IconButton>
            <IconButton
              size="small"
              disabled={page >= Math.ceil(tableData.length / rowsPerPage) - 1}
              onClick={() => handleChangePage(page + 1)}
            >
              <KeyboardArrowRight />
            </IconButton>
            <IconButton
              size="small"
              disabled={page >= Math.ceil(tableData.length / rowsPerPage) - 1}
              onClick={() => handleChangePage(Math.ceil(tableData.length / rowsPerPage) - 1)}
            >
              <LastPageIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Loading Spinner */}
      {loading && (
        <CircularProgress
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 2,
          }}
        />
      )}
    </Box>
  )
}
