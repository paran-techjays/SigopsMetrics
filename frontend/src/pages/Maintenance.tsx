"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Grid from "@mui/material/Grid"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import CircularProgress from "@mui/material/CircularProgress"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import RemoveIcon from "@mui/icons-material/Remove"
import Plot from "react-plotly.js"
import MapBox from "../components/MapBox"
import { metricApiKeys } from "../services/api"

// Define the available metrics
const metrics = [
  { id: "detectorUptime", label: "Detector Uptime", key: metricApiKeys.detectorUptime },
  { id: "pedestrianPushbuttonActivity", label: "Daily Pedestrian Pushbutton Activity", key: metricApiKeys.pedestrianPushbuttonActivity },
  { id: "pedestrianPushbuttonUptime", label: "Pedestrian Pushbutton Uptime", key: metricApiKeys.pedestrianPushbuttonUptime },
  { id: "cctvUptime", label: "CCTV Uptime", key: metricApiKeys.cctvUptime },
  { id: "communicationUptime", label: "Communication Uptime", key: metricApiKeys.communicationUptime },
]

// Base API URL
const API_BASE_URL = "https://sigopsmetrics-api.dot.ga.gov";

// Default filter payload
const defaultPayload = {
  dateRange: 4,
  timePeriod: 4,
  customStart: null,
  customEnd: null,
  daysOfWeek: null,
  startTime: null,
  endTime: null,
  zone_Group: "Central Metro",
  zone: null,
  agency: null,
  county: null,
  city: null,
  corridor: null,
  signalId: "",
  priority: "",
  classification: ""
};

// Types
interface MetricData {
  label: string | null;
  avg: number;
  delta: number;
  zoneGroup: string | null;
  weight: number;
}

interface Signal {
  signalID: string;
  mainStreetName: string;
  sideStreetName: string;
  latitude: number;
  longitude: number;
  [key: string]: any;
}

interface LocationMetric {
  label: string;
  avg: number;
  delta: number;
  zoneGroup: string | null;
  weight: number;
}

interface TimeSeriesData {
  corridor: string;
  zone_Group: string | null;
  month: string;
  uptime?: string;
  delta?: string;
  [metricApiKeys.detectorUptime]: string;
  [metricApiKeys.pedestrianPushbuttonActivity]: string;
  [metricApiKeys.pedestrianPushbuttonUptime]: string;
  [metricApiKeys.cctvUptime]: string;
  [metricApiKeys.communicationUptime]: string;
  [key: string]: string | number | null;
}

interface MapPoint {
  signalID: string;
  lat: number;
  lon: number;
  name: string;
  value: number;
}

export default function Maintenance() {
  // State for selected metric
  const [selectedMetric, setSelectedMetric] = useState("detectorUptime");
  const [selectedMetricKey, setSelectedMetricKey] = useState("du");

  // State for data
  const [loading, setLoading] = useState(true);
  const [metricData, setMetricData] = useState<MetricData | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [signalMetrics, setSignalMetrics] = useState<{ [key: string]: number }>({});
  const [locationMetrics, setLocationMetrics] = useState<LocationMetric[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [mapData, setMapData] = useState<MapPoint[]>([]);
  
  // Find the metric key for the selected metric
  useEffect(() => {
    const metric = metrics.find(m => m.id === selectedMetric);
    if (metric) {
      setSelectedMetricKey(metric.key);
    }
  }, [selectedMetric]);

  // Fetch data when selected metric changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch metric straight average
        const straightAverageUrl = `${API_BASE_URL}/metrics/straightaverage?source=main&measure=${selectedMetricKey}`;
        const straightAverageResponse = await axios.post(straightAverageUrl, defaultPayload);
        setMetricData(straightAverageResponse.data);
        
        // Fetch all signals
        const signalsUrl = `${API_BASE_URL}/signals/all`;
        const signalsResponse = await axios.get(signalsUrl);
        setSignals(signalsResponse.data);
        
        // Fetch signal metrics
        const signalMetricsUrl = `${API_BASE_URL}/metrics/signals/filter/average?source=main&measure=${selectedMetricKey}`;
        const signalMetricsResponse = await axios.post(signalMetricsUrl, defaultPayload);
        
        // Create a map of signal IDs to metric values
        const metricsMap: { [key: string]: number } = {};
        signalMetricsResponse.data.forEach((item: any) => {
          metricsMap[item.label] = item.avg;
        });
        setSignalMetrics(metricsMap);
        
        // Prepare map data
        const mapPointsData = signalsResponse.data
          .filter((signal: Signal) => signal.latitude && signal.longitude)
          .map((signal: Signal) => ({
            signalID: signal.signalID,
            lat: signal.latitude,
            lon: signal.longitude,
            name: `${signal.mainStreetName || ''} ${signal.sideStreetName ? '@ ' + signal.sideStreetName : ''}`,
            value: metricsMap[signal.signalID] || 0
          }));
        setMapData(mapPointsData);
        
        // Fetch location metrics
        const locationMetricsUrl = `${API_BASE_URL}/metrics/average?source=main&measure=${selectedMetricKey}&dashboard=false`;
        const locationMetricsResponse = await axios.post(locationMetricsUrl, defaultPayload);
        setLocationMetrics(locationMetricsResponse.data);
        
        // Fetch time series data
        const timeSeriesUrl = `${API_BASE_URL}/metrics/filter?source=main&measure=${selectedMetricKey}`;
        const timeSeriesResponse = await axios.post(timeSeriesUrl, defaultPayload);
        setTimeSeriesData(timeSeriesResponse.data);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        // Set empty data on error
        setMetricData(null);
        setLocationMetrics([]);
        setTimeSeriesData([]);
        setMapData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMetricKey]);

  // Handle metric tab change
  const handleMetricChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedMetric(newValue);
  }

  // Format the metric value for display
  const formatMetricValue = (value: number | string, unit?: string) => {
    if (typeof value === "number") {
      // Format based on the metric type
      if (selectedMetric === "detectorUptime" || 
          selectedMetric === "pedestrianPushbuttonUptime" || 
          selectedMetric === "cctvUptime" || 
          selectedMetric === "communicationUptime") {
        return `${value.toFixed(1)}%`
      } else if (selectedMetric === "pedestrianPushbuttonActivity") {
        return value.toLocaleString()
      } else {
        return value.toLocaleString()
      }
    }
    return value
  }

  // Check if this is a percentage-based metric
  const isPercentMetric = ["detectorUptime", "pedestrianPushbuttonUptime", "cctvUptime", "communicationUptime"].includes(selectedMetric);
  
  // Prepare data for the location bar chart
  const locationBarData = {
    y: locationMetrics.map((item) => item.label),
    x: locationMetrics.map((item) => {
      // For percentage metrics, ensure values are in decimal format for proper display
      return isPercentMetric && item.avg > 1 ? item.avg / 100 : item.avg;
    }),
    type: "bar",
    orientation: "h",
    marker: {
      color: "#6c757d",
    },
    hovertemplate: isPercentMetric
      ? '<b>%{y}</b><br>Value: %{x:.1%}<extra></extra>'
      : '<b>%{y}</b><br>Value: %{x}<extra></extra>',
  }

  // Prepare data for the time series chart
  const timeSeriesChartData = () => {
    // Group by location
    const locationGroups: { [key: string]: { x: string[]; y: number[] } } = {}
    
    timeSeriesData.forEach((item) => {
      if (!locationGroups[item.corridor]) {
        locationGroups[item.corridor] = { x: [], y: [] }
      }
      
      // Parse date from the month field and format it
      const dateObj = new Date(item.month);
      const formattedDate = `${dateObj.toLocaleString('default', { month: 'short' })} ${dateObj.getFullYear()}`;
      locationGroups[item.corridor].x.push(formattedDate);
      
      // Extract value using the appropriate key for this metric
      let rawValue: number;
      
      if (item[selectedMetricKey] !== undefined) {
        rawValue = parseFloat(item[selectedMetricKey]);
      } else if (item.uptime !== undefined) {
        rawValue = parseFloat(item.uptime);
      } else {
        rawValue = 0;
      }
      
      // For percentage metrics, ensure values are in decimal format for proper display
      const value = isPercentMetric && rawValue > 1 ? rawValue / 100 : rawValue;
      locationGroups[item.corridor].y.push(value);
    });

    // Convert to Plotly format
    return Object.keys(locationGroups).map((location) => ({
      x: locationGroups[location].x,
      y: locationGroups[location].y,
      type: "scatter",
      mode: "lines",
      name: location,
      line: { width: 1, color: "#6c757d" },
      hovertemplate: isPercentMetric
        ? '<b>%{text}</b><br>Date: %{x}<br>Value: %{y:.1%}<extra></extra>'
        : '<b>%{text}</b><br>Date: %{x}<br>Value: %{y}<extra></extra>',
      text: Array(locationGroups[location].x.length).fill(location),
    }))
  }

  // Prepare map data
  const mapPlotData = mapData.length === 0 ? 
  {
    type: "scattermapbox",
    lat: [33.789], // Default center point for Atlanta
    lon: [-84.388],
    mode: "markers",
    marker: {
      size: 0, // Invisible marker
      opacity: 0
    },
    text: ["No data available"],
    hoverinfo: "none",
  } : 
  {
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

        if (selectedMetric === "pedestrianPushbuttonActivity") {
          // Scale for pushbutton activity (10-1000)
          return min + Math.min(((value - 10) / 990) * (max - min), max)
        } else if (isPercentMetric) {
          // Scale for percentage (0-100)
          return min + Math.min((value / 100) * (max - min), max)
        } else {
          return 8 // Default size
        }
      }),
      color: mapData.map((point) => {
        // Color based on value
        if (isPercentMetric) {
          // High values are good for uptime metrics
          if (point.value < 50) return "#fee2e2"
          if (point.value < 70) return "#fecaca"
          if (point.value < 85) return "#fca5a5"
          if (point.value < 95) return "#f87171"
          return "#ef4444"
        } else if (selectedMetric === "pedestrianPushbuttonActivity") {
          if (point.value < 100) return "#93c5fd"
          if (point.value < 250) return "#60a5fa"
          if (point.value < 500) return "#3b82f6"
          if (point.value < 750) return "#2563eb"
          return "#1d4ed8"
        } else {
          return "#3b82f6"
        }
      }),
      opacity: 0.8,
    },
    text: mapData.map((point) => {
      const metric = metrics.find(m => m.id === selectedMetric);
      const metricName = metric ? metric.label : selectedMetric;
      const valueText = point.value ? formatMetricValue(point.value) : "Unavailable";
      return `${point.signalID}<br>${point.name}<br>${metricName}: ${valueText}`;
    }),
    hoverinfo: "text",
  };

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
    if (selectedMetric === "pedestrianPushbuttonActivity") {
      return (
        <>
          <Typography variant="subtitle2" gutterBottom>
            Push Button Activity
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: "#93c5fd", mr: 1 }} />
            <Typography variant="caption">0 - 100</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: "#60a5fa", mr: 1 }} />
            <Typography variant="caption">101 - 250</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: "#3b82f6", mr: 1 }} />
            <Typography variant="caption">251 - 500</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: "#2563eb", mr: 1 }} />
            <Typography variant="caption">501 - 750</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ width: 16, height: 16, bgcolor: "#1d4ed8", mr: 1 }} />
            <Typography variant="caption">750+</Typography>
          </Box>
        </>
      )
    } else if (isPercentMetric) {
      return (
        <>
          <Typography variant="subtitle2" gutterBottom>
            Uptime
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: "#fee2e2", mr: 1 }} />
            <Typography variant="caption">0% - 50%</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: "#fecaca", mr: 1 }} />
            <Typography variant="caption">51% - 70%</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: "#fca5a5", mr: 1 }} />
            <Typography variant="caption">71% - 85%</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: "#f87171", mr: 1 }} />
            <Typography variant="caption">86% - 95%</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ width: 16, height: 16, bgcolor: "#ef4444", mr: 1 }} />
            <Typography variant="caption">96% - 100%</Typography>
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
      case "detectorUptime":
        return "Detector Uptime"
      case "pedestrianPushbuttonActivity":
        return "Daily Pedestrian Pushbutton Activity"
      case "pedestrianPushbuttonUptime":
        return "Pedestrian Pushbutton Uptime"
      case "cctvUptime":
        return "CCTV Uptime"
      case "communicationUptime":
        return "Communication Uptime"
      default:
        return "Metric Trend"
    }
  }

  // Get the subtitle for the metric display
  const getMetricSubtitle = () => {
    switch (selectedMetric) {
      case "detectorUptime":
        return "Vehicle detector uptime"
      case "pedestrianPushbuttonActivity":
        return "Average daily pedestrian calls"
      case "pedestrianPushbuttonUptime":
        return "Pedestrian pushbutton uptime"
      case "cctvUptime":
        return "Surveillance camera uptime"
      case "communicationUptime":
        return "Communications system uptime"
      default:
        return ""
    }
  }

  return (
    <Box sx={{ p: 2 }}>
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
            <Grid size={{xs: 12, md: 4}}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Metric Card */}
                <Paper sx={{ p: 3, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                  <Typography variant="h3" component="div" gutterBottom>
                    {metricData && formatMetricValue(metricData.avg)}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {getMetricSubtitle()}
                  </Typography>
                </Paper>

                {/* Trend Indicator Card */}
                <Paper sx={{ p: 3, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                  {metricData && metricData.delta !== undefined && (
                    <>
                      <Typography
                        variant="h5"
                        component="div"
                        sx={{
                          color:
                            metricData.delta > 0
                              ? "success.main"
                              : metricData.delta < 0
                                ? "error.main"
                                : "text.secondary",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {Math.abs(metricData.delta * 100).toFixed(1)}%
                        {metricData.delta > 0 ? (
                          <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                        ) : metricData.delta < 0 ? (
                          <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                        ) : (
                          <RemoveIcon fontSize="small" sx={{ ml: 0.5 }} />
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Change from prior period
                      </Typography>
                    </>
                  )}
                </Paper>
              </Box>
            </Grid>

            {/* Map */}
            <Grid size={{xs: 12, md: 8}}>
              <Paper sx={{ p: 2, height: "100%", minHeight: 350 }}>
                <Box sx={{ height: "100%", width: "100%", position: "relative" }}>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      <MapBox 
                        data={mapData.length > 0 ? [mapPlotData as any] : []}
                        isRawTraces={true}
                        loading={false}
                        height="100%"
                        center={{ lat: 33.789, lon: -84.388 }}
                        zoom={11}
                        renderLegend={getMapLegend}
                      />
                    </>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Bottom Charts */}
            <Grid size={{xs: 12}}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {getTimeSeriesTitle()}
                </Typography>
                <Grid container spacing={2}>
                  {/* Location Bar Chart */}
                  <Grid size={{xs: 12, md: 6}}>
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
                            isPercentMetric
                              ? "Uptime (%)"
                              : selectedMetric === "pedestrianPushbuttonActivity"
                                ? "Pushbutton Activity"
                                : "Value",
                          dtick: isPercentMetric ? 0.1 
                                : selectedMetric === "pedestrianPushbuttonActivity" ? 200 
                                : undefined,
                          tickformat: isPercentMetric ? '.1%' : undefined,
                          range: isPercentMetric ? [0, 1] : undefined,
                          autorange: !isPercentMetric,
                        },
                      }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </Grid>

                  {/* Time Series Chart */}
                  <Grid size={{xs: 12, md: 6}}>
                    <Plot
                      data={timeSeriesChartData() as any}
                      layout={{
                        autosize: true,
                        height: 500,
                        margin: { l: 50, r: 10, t: 10, b: 50 },
                        xaxis: { title: "Time Period" },
                        yaxis: {
                          title:
                            isPercentMetric
                              ? "Uptime Trend"
                              : selectedMetric === "pedestrianPushbuttonActivity"
                                ? "Activity Trend"
                                : "Trend",
                          dtick: isPercentMetric ? 0.1 
                                : selectedMetric === "pedestrianPushbuttonActivity" ? 200 
                                : undefined,
                          tickformat: isPercentMetric ? '.1%' : undefined,
                          range: isPercentMetric ? [0, 1] : undefined,
                          autorange: !isPercentMetric,
                        },
                        showlegend: false,
                        legend: { x: 0, y: 1 },
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

