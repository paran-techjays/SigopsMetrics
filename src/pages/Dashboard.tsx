"use client"

import { useState } from "react"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableRow from "@mui/material/TableRow"
import FormControl from "@mui/material/FormControl"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import InputLabel from "@mui/material/InputLabel"
import Plot from "react-plotly.js"

interface MetricRow {
  label: string
  value: string | number
  unit: string
}

export default function Dashboard() {
  const [displayMetric, setDisplayMetric] = useState("dailyTrafficVolume")

  const performanceMetrics: MetricRow[] = [
    { label: "Throughput", value: "1,235", unit: "vph" },
    { label: "Arrivals on Green", value: "69.9", unit: "%" },
    { label: "Progression Ratio", value: "1.07", unit: "" },
    { label: "Queue Spillback Ratio", value: "17.5", unit: "%" },
    { label: "Peak Period Split Failures", value: "8.3", unit: "%" },
    { label: "Off Peak Split Failures", value: "4.7", unit: "%" },
    { label: "Travel Time Index", value: "1.31", unit: "" },
    { label: "Planning Time Index", value: "1.42", unit: "" },
  ]

  const volumeMetrics: MetricRow[] = [
    { label: "Traffic Volume", value: "16,863", unit: "vpd" },
    { label: "AM Peak Volume", value: "886", unit: "vph" },
    { label: "PM Peak Volume", value: "1,156", unit: "vph" },
    { label: "Pedestrian Activations", value: "225", unit: "" },
  ]

  // Create sample map data for Plotly
  const mapData = {
    type: "scattermapbox",
    lat: [
      33.749, 33.759, 33.769, 33.779, 33.789, 33.799, 33.809, 33.819, 33.829, 33.839, 33.754, 33.764, 33.774, 33.784,
      33.794, 33.804, 33.814, 33.824, 33.834, 33.844,
    ],
    lon: [
      -84.388, -84.398, -84.408, -84.418, -84.428, -84.378, -84.368, -84.358, -84.348, -84.338, -84.393, -84.403,
      -84.413, -84.423, -84.373, -84.363, -84.353, -84.343, -84.333, -84.323,
    ],
    mode: "markers",
    marker: {
      size: [10, 15, 8, 12, 20, 10, 15, 8, 12, 20, 10, 15, 8, 12, 20, 10, 15, 8, 12, 20],
      color: [
        "#93c5fd",
        "#60a5fa",
        "#3b82f6",
        "#2563eb",
        "#1d4ed8",
        "#93c5fd",
        "#60a5fa",
        "#3b82f6",
        "#2563eb",
        "#1d4ed8",
        "#93c5fd",
        "#60a5fa",
        "#3b82f6",
        "#2563eb",
        "#1d4ed8",
        "#93c5fd",
        "#60a5fa",
        "#3b82f6",
        "#2563eb",
        "#1d4ed8",
      ],
      opacity: 0.8,
    },
    text: [
      "10,000",
      "15,000",
      "8,000",
      "12,000",
      "25,000",
      "10,000",
      "15,000",
      "8,000",
      "12,000",
      "25,000",
      "10,000",
      "15,000",
      "8,000",
      "12,000",
      "25,000",
      "10,000",
      "15,000",
      "8,000",
      "12,000",
      "25,000",
    ],
    hoverinfo: "text",
  }

  const mapLayout = {
    autosize: true,
    hovermode: "closest",
    mapbox: {
      style: "carto-positron",
      center: { lat: 33.789, lon: -84.388 },
      zoom: 11,
    },
    margin: { r: 0, t: 0, b: 0, l: 0 },
  }

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* Filters Row */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="date-range-label">Date Range</InputLabel>
              <Select labelId="date-range-label" label="Date Range" defaultValue="priorYear">
                <MenuItem value="priorYear">Prior Year</MenuItem>
                <MenuItem value="currentYear">Current Year</MenuItem>
                <MenuItem value="priorMonth">Prior Month</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="date-aggregation-label">Date Aggregation</InputLabel>
              <Select labelId="date-aggregation-label" label="Date Aggregation" defaultValue="monthly">
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="region-label">Region</InputLabel>
              <Select labelId="region-label" label="Region" defaultValue="centralMetro">
                <MenuItem value="centralMetro">Central Metro</MenuItem>
                <MenuItem value="northRegion">North Region</MenuItem>
                <MenuItem value="southRegion">South Region</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        {/* Main Content - Responsive Layout */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={2}>
            {/* Performance Metrics */}
            <Grid item xs={12} md={6} lg={12}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  Performance
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {performanceMetrics.map((row) => (
                        <TableRow key={row.label}>
                          <TableCell>{row.label}</TableCell>
                          <TableCell align="right">{row.value}</TableCell>
                          <TableCell align="right" sx={{ width: 50 }}>
                            {row.unit}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Volume & Equipment */}
            <Grid item xs={12} md={6} lg={12}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  Volume & Equipment
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {volumeMetrics.map((row) => (
                        <TableRow key={row.label}>
                          <TableCell>{row.label}</TableCell>
                          <TableCell align="right">{row.value}</TableCell>
                          <TableCell align="right" sx={{ width: 50 }}>
                            {row.unit}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Map Area */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, height: "100%", minHeight: "500px" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="display-metric-label">Display</InputLabel>
                <Select
                  labelId="display-metric-label"
                  label="Display"
                  value={displayMetric}
                  onChange={(e) => setDisplayMetric(e.target.value as string)}
                >
                  <MenuItem value="dailyTrafficVolume">Daily Traffic Volume</MenuItem>
                  <MenuItem value="peakHourVolume">Peak Hour Volume</MenuItem>
                  <MenuItem value="congestion">Congestion</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Click on map to view details
              </Typography>
            </Box>

            <Box sx={{ height: "calc(100% - 60px)", width: "100%", position: "relative", minHeight: "400px" }}>
              <Plot
                data={[mapData as any]}
                layout={mapLayout as any}
                style={{ width: "100%", height: "100%" }}
                config={{ mapboxAccessToken: "your-mapbox-token-here" }}
              />

              {/* Legend */}
              <Paper
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  p: 1,
                  zIndex: 1000,
                  width: 150,
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Intersections
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: "#93c5fd", mr: 1 }} />
                  <Typography variant="caption">0 - 10,000</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: "#60a5fa", mr: 1 }} />
                  <Typography variant="caption">10,001 - 20,000</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: "#3b82f6", mr: 1 }} />
                  <Typography variant="caption">20,001 - 30,000</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: "#2563eb", mr: 1 }} />
                  <Typography variant="caption">30,001 - 40,000</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: "#1d4ed8", mr: 1 }} />
                  <Typography variant="caption">40,001+</Typography>
                </Box>
              </Paper>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

