"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Grid from "@mui/material/Grid"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import FormControl from "@mui/material/FormControl"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import InputLabel from "@mui/material/InputLabel"
import CircularProgress from "@mui/material/CircularProgress"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import RemoveIcon from "@mui/icons-material/Remove"
import Plot from "react-plotly.js"
import {
  fetchMetricData,
  fetchLocationMetrics,
  fetchTimeSeriesData,
  fetchMapData,
  type MetricData,
  type LocationMetric,
  type TimeSeriesData,
  type MapPoint,
} from "../services/api"

// Define the available metrics
const metrics = [
  { id: "throughput", label: "Throughput" },
  { id: "dailyTrafficVolumes", label: "Daily Traffic Volumes" },
  { id: "arrivalsOnGreen", label: "Arrivals on Green" },
  { id: "progressionRatio", label: "Progression Ratio" },
  { id: "spillbackRatio", label: "Spillback Ratio" },
  { id: "peakPeriodSplitFailures", label: "Peak Period Split Failures" },
  { id: "offPeakSplitFailures", label: "Off-Peak Split Failures" },
  { id: "travelTimeIndex", label: "Travel Time Index" },
  { id: "planningTimeIndex", label: "Planning Time Index" },
]

export default function Operations() {
  // State for filters
  const [dateRange, setDateRange] = useState("priorYear")
  const [dateAggregation, setDateAggregation] = useState("monthly")
  const [region, setRegion] = useState("centralMetro")

  // State for selected metric
  const [selectedMetric, setSelectedMetric] = useState("throughput")

  // State for data
  const [loading, setLoading] = useState(true)
  const [metricData, setMetricData] = useState<MetricData | null>(null)
  const [locationMetrics, setLocationMetrics] = useState<LocationMetric[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [mapData, setMapData] = useState<MapPoint[]>([])

  // Fetch data when filters or selected metric changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch all data in parallel
        const [metricResult, locationsResult, timeSeriesResult, mapResult] = await Promise.all([
          fetchMetricData(selectedMetric, region, dateRange, dateAggregation),
          fetchLocationMetrics(selectedMetric, region),
          fetchTimeSeriesData(selectedMetric, region, dateRange, dateAggregation),
          fetchMapData(selectedMetric, region),
        ])

        setMetricData(metricResult)
        setLocationMetrics(locationsResult)
        setTimeSeriesData(timeSeriesResult)
        setMapData(mapResult)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedMetric, region, dateRange, dateAggregation])

  // Handle metric tab change
  const handleMetricChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedMetric(newValue)
  }

  // Format the metric value for display
  const formatMetricValue = (value: number | string, unit?: string) => {
    if (typeof value === "number") {
      // Format based on the metric type
      if (
        selectedMetric === "arrivalsOnGreen" ||
        selectedMetric === "spillbackRatio" ||
        selectedMetric === "peakPeriodSplitFailures" ||
        selectedMetric === "offPeakSplitFailures"
      ) {
        return `${value}%`
      } else if (
        selectedMetric === "progressionRatio" ||
        selectedMetric === "travelTimeIndex" ||
        selectedMetric === "planningTimeIndex"
      ) {
        return value.toFixed(2)
      } else {
        return value.toLocaleString()
      }
    }
    return value
  }

  // Prepare data for the location bar chart
  const locationBarData = {
    y: locationMetrics.map((item) => item.location),
    x: locationMetrics.map((item) => item.value),
    type: "bar",
    orientation: "h",
    marker: {
      color: "#1976d2",
    },
  }

  // Prepare data for the time series chart
  const timeSeriesChartData = () => {
    // Group by location
    const locationGroups: { [key: string]: { x: string[]; y: number[] } } = {}

    timeSeriesData.forEach((item) => {
      if (!locationGroups[item.location]) {
        locationGroups[item.location] = { x: [], y: [] }
      }
      locationGroups[item.location].x.push(item.date)
      locationGroups[item.location].y.push(item.value)
    })

    // Convert to Plotly format
    return Object.keys(locationGroups).map((location) => ({
      x: locationGroups[location].x,
      y: locationGroups[location].y,
      type: "scatter",
      mode: "lines",
      name: location,
      line: { width: 1 },
    }))
  }

  // Prepare map data
  const mapPlotData = {
    type: "scattermapbox",
    lat: mapData.map((point) => point.lat),
    lon: mapData.map((point) => point.lon),
    mode: "markers",
    marker: {
      size: mapData.map((point) => {
        // Scale marker size based on value
        const min = 5
        const max = 15
        const value = point.value

        if (selectedMetric === "throughput") {
          // Scale for throughput (1000-8000)
          return min + ((value - 1000) / 7000) * (max - min)
        } else if (selectedMetric === "arrivalsOnGreen") {
          // Scale for percentage (0-100)
          return min + (value / 100) * (max - min)
        } else {
          return 8 // Default size
        }
      }),
      color: mapData.map((point) => {
        // Color based on value
        if (selectedMetric === "throughput") {
          if (point.value < 2000) return "#93c5fd"
          if (point.value < 4000) return "#60a5fa"
          if (point.value < 6000) return "#3b82f6"
          if (point.value < 8000) return "#2563eb"
          return "#1d4ed8"
        } else if (selectedMetric === "arrivalsOnGreen") {
          if (point.value < 20) return "#fee2e2"
          if (point.value < 40) return "#fecaca"
          if (point.value < 60) return "#fca5a5"
          if (point.value < 80) return "#f87171"
          return "#ef4444"
        } else {
          return "#3b82f6"
        }
      }),
      opacity: 0.8,
    },
    text: mapData.map((point) => `${point.name}: ${formatMetricValue(point.value)}`),
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

  // Get the appropriate legend for the map based on the selected metric
  const getMapLegend = () => {
    if (selectedMetric === "throughput") {
      return (
        <>
          <Typography variant="subtitle2" gutterBottom>
            Intersections
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: "#93c5fd", mr: 1 }} />
            <Typography variant="caption">0 - 2,000</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: "#60a5fa", mr: 1 }} />
            <Typography variant="caption">2,001 - 4,000</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: "#3b82f6", mr: 1 }} />
            <Typography variant="caption">4,001 - 6,000</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: "#2563eb", mr: 1 }} />
            <Typography variant="caption">6,001 - 8,000</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ width: 16, height: 16, bgcolor: "#1d4ed8", mr: 1 }} />
            <Typography variant="caption">8,001+</Typography>
          </Box>
        </>
      )
    } else if (selectedMetric === "arrivalsOnGreen") {
      return (
        <>
          <Typography variant="subtitle2" gutterBottom>
            Intersections
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: "#fee2e2", mr: 1 }} />
            <Typography variant="caption">0% - 20%</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: "#fecaca", mr: 1 }} />
            <Typography variant="caption">21% - 40%</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: "#fca5a5", mr: 1 }} />
            <Typography variant="caption">41% - 60%</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: "#f87171", mr: 1 }} />
            <Typography variant="caption">61% - 80%</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ width: 16, height: 16, bgcolor: "#ef4444", mr: 1 }} />
            <Typography variant="caption">81% - 100%</Typography>
          </Box>
        </>
      )
    } else {
      return (
        <Typography variant="subtitle2" gutterBottom>
          No legend available
        </Typography>
      )
    }
  }

  // Get the title for the time series chart
  const getTimeSeriesTitle = () => {
    switch (selectedMetric) {
      case "throughput":
        return "Throughput (peak veh/hr)"
      case "arrivalsOnGreen":
        return "Arrivals on Green (%)"
      case "progressionRatio":
        return "Progression Ratio"
      case "spillbackRatio":
        return "Spillback Ratio"
      case "peakPeriodSplitFailures":
        return "Peak Period Split Failures"
      case "offPeakSplitFailures":
        return "Off-Peak Split Failures"
      case "travelTimeIndex":
        return "Travel Time Index"
      case "planningTimeIndex":
        return "Planning Time Index"
      case "dailyTrafficVolumes":
        return "Daily Traffic Volumes"
      default:
        return "Metric Trend"
    }
  }

  // Get the subtitle for the metric display
  const getMetricSubtitle = () => {
    switch (selectedMetric) {
      case "throughput":
        return "Average vehicles per hour"
      case "arrivalsOnGreen":
        return "Arrivals on Green"
      case "progressionRatio":
        return "Progression Ratio"
      case "spillbackRatio":
        return "Spillback Ratio"
      case "peakPeriodSplitFailures":
        return "Peak Period Split Failures"
      case "offPeakSplitFailures":
        return "Off-Peak Split Failures"
      case "travelTimeIndex":
        return "Travel Time Index"
      case "planningTimeIndex":
        return "Planning Time Index"
      case "dailyTrafficVolumes":
        return "Average daily traffic"
      default:
        return ""
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Filters Row */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="date-range-label">Date Range</InputLabel>
              <Select
                labelId="date-range-label"
                label="Date Range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as string)}
              >
                <MenuItem value="priorYear">Prior Year</MenuItem>
                <MenuItem value="currentYear">Current Year</MenuItem>
                <MenuItem value="priorMonth">Prior Month</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="date-aggregation-label">Date Aggregation</InputLabel>
              <Select
                labelId="date-aggregation-label"
                label="Date Aggregation"
                value={dateAggregation}
                onChange={(e) => setDateAggregation(e.target.value as string)}
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="region-label">Region</InputLabel>
              <Select
                labelId="region-label"
                label="Region"
                value={region}
                onChange={(e) => setRegion(e.target.value as string)}
              >
                <MenuItem value="centralMetro">Central Metro</MenuItem>
                <MenuItem value="northRegion">North Region</MenuItem>
                <MenuItem value="southRegion">South Region</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>
      </Grid>

      {/* Metric Tabs */}
      <Tabs
        value={selectedMetric}
        onChange={handleMetricChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": {
            textTransform: "none",
            minWidth: "auto",
            px: 2,
          },
        }}
      >
        {metrics.map((metric) => (
          <Tab key={metric.id} label={metric.label} value={metric.id} />
        ))}
      </Tabs>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Main Content */}
          <Grid container spacing={2}>
            {/* Metric Display */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="h3" component="div" align="center" gutterBottom>
                  {metricData && formatMetricValue(metricData.value, metricData.unit)}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" align="center" gutterBottom>
                  {getMetricSubtitle()}
                </Typography>

                {/* Trend Indicator */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mt: 2 }}>
                  {metricData && metricData.change !== undefined && (
                    <>
                      <Typography
                        variant="h5"
                        component="div"
                        sx={{
                          color:
                            metricData.change > 0
                              ? "success.main"
                              : metricData.change < 0
                                ? "error.main"
                                : "text.secondary",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {Math.abs(metricData.change).toFixed(1)}%
                        {metricData.change > 0 ? (
                          <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                        ) : metricData.change < 0 ? (
                          <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                        ) : (
                          <RemoveIcon fontSize="small" sx={{ ml: 0.5 }} />
                        )}
                      </Typography>
                    </>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" align="center">
                  {metricData?.changeLabel}
                </Typography>

                {/* Simple Trend Line */}
                <Box sx={{ mt: 4, height: 50 }}>
                  <Plot
                    data={[
                      {
                        x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                        y: [5, 5.2, 5.5, 5.3, 5.8, 6, 6.2, 6.4, 6.8, 7.1],
                        type: "scatter",
                        mode: "lines",
                        line: { color: "#1976d2", width: 2 },
                        showlegend: false,
                      },
                    ]}
                    layout={{
                      autosize: true,
                      height: 50,
                      margin: { l: 0, r: 0, t: 0, b: 0 },
                      xaxis: { visible: false, fixedrange: true },
                      yaxis: { visible: false, fixedrange: true },
                      hovermode: false,
                      plot_bgcolor: "transparent",
                      paper_bgcolor: "transparent",
                    }}
                    config={{ displayModeBar: false }}
                    style={{ width: "100%", height: "100%" }}
                  />
                </Box>
              </Paper>
            </Grid>

            {/* Map */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, height: "100%", minHeight: 350 }}>
                <Box sx={{ height: "100%", width: "100%", position: "relative" }}>
                  <Plot
                    data={[mapPlotData as any]}
                    layout={mapLayout as any}
                    style={{ width: "100%", height: "100%" }}
                    config={{ mapboxAccessToken: "your-mapbox-token-here" }}
                  />

                  {/* Map Legend */}
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
                    {getMapLegend()}
                  </Paper>
                </Box>
              </Paper>
            </Grid>

            {/* Bottom Charts */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {getTimeSeriesTitle()}
                </Typography>
                <Grid container spacing={2}>
                  {/* Location Bar Chart */}
                  <Grid item xs={12} md={3}>
                    <Plot
                      data={[locationBarData as any]}
                      layout={{
                        autosize: true,
                        height: 500,
                        margin: { l: 150, r: 10, t: 10, b: 50 },
                        yaxis: {
                          title: "",
                          automargin: true,
                          tickfont: { size: 10 },
                        },
                        xaxis: {
                          title:
                            selectedMetric === "throughput"
                              ? "Throughput (vph)"
                              : selectedMetric === "arrivalsOnGreen"
                                ? "Arrivals on Green"
                                : "Value",
                        },
                      }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </Grid>

                  {/* Time Series Chart */}
                  <Grid item xs={12} md={9}>
                    <Plot
                      data={timeSeriesChartData() as any}
                      layout={{
                        autosize: true,
                        height: 500,
                        margin: { l: 50, r: 10, t: 10, b: 50 },
                        xaxis: { title: "Time Period" },
                        yaxis: {
                          title:
                            selectedMetric === "throughput"
                              ? "Vehicles per Hour Trend"
                              : selectedMetric === "arrivalsOnGreen"
                                ? "Weekly Trend"
                                : "Trend",
                        },
                        showlegend: false,
                      }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  )
}

