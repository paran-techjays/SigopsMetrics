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
import MapBox from "../../components/MapBox"
import LocationBarChart from "../../components/charts/LocationBarChart"
import TimeSeriesChart from "../../components/charts/TimeSeriesChart"
import { metricApiKeys } from "../../services/api"
import mapSettings from "../../utils/mapSettings"
import AppConfig from '../../utils/appConfig'
import { useAppDispatch, useAppSelector } from '../../hooks/useTypedSelector'
import { 
  fetchStraightAverage,
  fetchAllSignals,
  fetchMetricsFilter,
  fetchMetricsAverage,
  fetchSignalsFilterAverage
} from '../../store/slices/metricsSlice'
import { MetricsFilterRequest } from '../../types/api.types'
import { useSelector } from "react-redux"
import { selectFilterParams } from "../../store/slices/filterSlice"
import { RootState } from "../../store"
import chartTitles from "../../constants/mapData"

// Define the available metrics
const metrics = [
  { id: "detectorUptime", label: "Detector Uptime", key: metricApiKeys.detectorUptime },
  { id: "pedestrianPushbuttonActivity", label: "Daily Pedestrian Pushbutton Activity", key: metricApiKeys.pedestrianPushbuttonActivity },
  { id: "pedestrianPushbuttonUptime", label: "Pedestrian Pushbutton Uptime", key: metricApiKeys.pedestrianPushbuttonUptime },
  { id: "cctvUptime", label: "CCTV Uptime", key: metricApiKeys.cctvUptime },
  { id: "communicationUptime", label: "Communication Uptime", key: metricApiKeys.communicationUptime },
]

// Base API URL
const API_BASE_URL = AppConfig.settings.API_PATH;

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

// Map metric IDs to mapSettings keys
const metricToSettingsMap: Record<string, string> = {
  detectorUptime: "detectorUptime",
  pedestrianPushbuttonActivity: "pedestrianPushbuttonActivity",
  pedestrianPushbuttonUptime: "pedestrianPushbuttonUptime",
  cctvUptime: "cctvUptime",
  communicationUptime: "communicationUptime",
};

export default function Maintenance() {
  // State for selected metric
  const [selectedMetric, setSelectedMetric] = useState("detectorUptime");
  const [selectedMetricKey, setSelectedMetricKey] = useState("du");
  
  // Local state for component-specific data
  const [locationMetrics, setLocationMetrics] = useState<LocationMetric[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [mapData, setMapData] = useState<MapPoint[]>([]);

  const commonFilterParams = useSelector(selectFilterParams);
  const filtersApplied = useSelector((state: RootState) => state.filter.filtersApplied);
  console.log("filtersApplied", filtersApplied);
  // Redux state
  const dispatch = useAppDispatch();
  const { 
    signals,
    straightAverage,
    metricsFilter,
    metricsAverage,
    signalsFilterAverage
  } = useAppSelector(state => state.metrics);
  
  const loading = straightAverage.loading || 
                  metricsFilter.loading || 
                  metricsAverage.loading || 
                  signalsFilterAverage.loading;
  
  const metricData = straightAverage.data;
  
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
      try {
        // Create common params object
        const params: MetricsFilterRequest = {
          source: "main",
          measure: selectedMetricKey
        };
        
        // Dispatch actions to fetch data
        dispatch(fetchStraightAverage({ params, filterParams: commonFilterParams }));
        dispatch(fetchAllSignals());
        dispatch(fetchSignalsFilterAverage({ params, filterParams: commonFilterParams }));
        dispatch(fetchMetricsAverage({ 
          params: { ...params, dashboard: false }, 
          filterParams: commonFilterParams 
        }));
        dispatch(fetchMetricsFilter({ params, filterParams: commonFilterParams }));
      } catch (error) {
        console.error("Error dispatching Redux actions:", error);
      }
    };

    fetchData();
  }, [selectedMetricKey, filtersApplied]);

  useEffect(() => {
    if (metricsAverage.data) {
      const sortedMetricsAvg = metricsAverage.data.map((item: any) => ({
        label: item.label,
        avg: item.avg || 0
      })).sort((a: LocationMetric, b: LocationMetric) => a.avg - b.avg);
      setLocationMetrics(sortedMetricsAvg as any);
    }
  }, [metricsAverage.data]);

  useEffect(() => {
    // Set time series data when available
    if (metricsFilter.data) {
      setTimeSeriesData(metricsFilter.data as any);
    }
  }, [metricsFilter.data])

  // Process data when Redux state changes
  useEffect(() => {
    // Process signal metrics when available
    if (signals.length > 0 && signalsFilterAverage.data) {
      // Create a map of signal IDs to metric values
      const metricsMap: { [key: string]: number } = {};
      signalsFilterAverage.data.forEach((item: any) => {
        metricsMap[item.label] = item.avg;
      });
      
      // Prepare map data
      const mapPointsData = signals
        .filter((signal) => signal.latitude && signal.longitude)
        .map((signal) => ({
          signalID: signal.signalID || '',
          lat: signal.latitude,
          lon: signal.longitude,
          name: `${signal.mainStreetName || ''} ${signal.sideStreetName ? '@ ' + signal.sideStreetName : ''}`,
          value: metricsMap[signal.signalID || ''] || 0
        }));
      setMapData(mapPointsData);
    }
  }, [signals, signalsFilterAverage.data, filtersApplied]);

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
        return `${(value * 100).toFixed(1)}%`
      } else if (selectedMetric === "pedestrianPushbuttonActivity") {
        return Math.round(value).toLocaleString()
      } else {
        return Math.round(value).toLocaleString()
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
      // color: "#6c757d",
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
      line: { width: 1 },
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

        // Make sure we don't scale unavailable data points
        if (value === -1) {
          return min;
        }

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
        // Color based on value using mapSettings
        const settingsKey = metricToSettingsMap[selectedMetric];
        const settings = settingsKey ? mapSettings[settingsKey] : null;
        
        if (settings) {
          const value = point.value;
          
          // Handle unavailable data
          if (value === -1) {
            return settings.legendColors[0]; // First color is for unavailable data
          }
          
          // Find which range the value falls into, starting from index 1 to skip the unavailable range
          for (let i = 1; i < settings.ranges.length; i++) {
            const [min, max] = settings.ranges[i];
            if (value >= min && value <= max) {
              return settings.legendColors[i];
            }
          }
          // Default to last color if outside all ranges
          return settings.legendColors[settings.legendColors.length - 1];
        }
        
        // Fallback to default colors if no settings found
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
      // Handle unavailable data
      if (point.value === -1) {
        return `${point.signalID}<br>${point.name}<br>No data available`;
      }
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
      zoom: 8,
    },
    margin: { r: 0, t: 0, b: 0, l: 0 },
  }

  // Get the appropriate legend for the map based on the selected metric
  const getMapLegend = () => {
    const settingsKey = metricToSettingsMap[selectedMetric];
    const settings = settingsKey ? mapSettings[settingsKey] : null;

    if (settings) {
      return (
        <>
          {settings.ranges.map((range, index) => (
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }} key={index}>
              <Box sx={{ width: 8, height: 8, bgcolor: settings.legendColors[index], mr: 1, borderRadius: 4 }} />
              <Typography variant="caption">{settings.legendLabels[index]}</Typography>
            </Box>
          ))}
        </>
      );
    } else {
      // Fallback to original legends if settings not found
      if (selectedMetric === "pedestrianPushbuttonActivity") {
        return (
          <>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: "#93c5fd", mr: 1, borderRadius: 4 }} />
              <Typography variant="caption">0 - 100</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: "#60a5fa", mr: 1, borderRadius: 4 }} />
              <Typography variant="caption">101 - 250</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: "#3b82f6", mr: 1, borderRadius: 4 }} />
              <Typography variant="caption">251 - 500</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: "#2563eb", mr: 1, borderRadius: 4 }} />
              <Typography variant="caption">501 - 750</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ width: 8, height: 8, bgcolor: "#1d4ed8", mr: 1, borderRadius: 4 }} />
              <Typography variant="caption">750+</Typography>
            </Box>
          </>
        )
      } else if (isPercentMetric) {
        return (
          <>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: "#fee2e2", mr: 1, borderRadius: 4 }} />
              <Typography variant="caption">0% - 50%</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: "#fecaca", mr: 1, borderRadius: 4 }} />
              <Typography variant="caption">51% - 70%</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: "#fca5a5", mr: 1, borderRadius: 4 }} />
              <Typography variant="caption">71% - 85%</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: "#f87171", mr: 1, borderRadius: 4 }} />
              <Typography variant="caption">86% - 95%</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ width: 8, height: 8, bgcolor: "#ef4444", mr: 1, borderRadius: 4 }} />
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
  }

  // Get the title for the time series chart
  const getTimeSeriesTitle = () => {
    return chartTitles[selectedMetric]["bottomChartTitle"]

    // switch (selectedMetric) {
    //   case "detectorUptime":
    //     return "Detector Uptime"
    //   case "pedestrianPushbuttonActivity":
    //     return "Daily Pedestrian Pushbutton Activity"
    //   case "pedestrianPushbuttonUptime":
    //     return "Pedestrian Pushbutton Uptime"
    //   case "cctvUptime":
    //     return "CCTV Uptime"
    //   case "communicationUptime":
    //     return "Communication Uptime"
    //   default:
    //     return "Metric Trend"
    // }
  }

  // Get the subtitle for the metric display
  const getMetricSubtitle = () => {
    return chartTitles[selectedMetric]["metricCardTitle"]
    // switch (selectedMetric) {
    //   case "detectorUptime":
    //     return "Vehicle detector uptime"
    //   case "pedestrianPushbuttonActivity":
    //     return "Average daily pedestrian calls"
    //   case "pedestrianPushbuttonUptime":
    //     return "Pedestrian pushbutton uptime"
    //   case "cctvUptime":
    //     return "Surveillance camera uptime"
    //   case "communicationUptime":
    //     return "Communications system uptime"
    //   default:
    //     return ""
    // }
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Metric Tabs */}
      <Tabs
        value={selectedMetric}
        onChange={handleMetricChange}
        variant="fullWidth"
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
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2, 
                height: '100%'
              }}>
                {/* Metric Card */}
                <Paper sx={{ 
                  p: 3, 
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "center", 
                  alignItems: "center",
                  flex: 1,
                  minHeight: "130px"
                }}>
                  <Typography variant="h3" component="div" gutterBottom>
                    {metricData && formatMetricValue(metricData.avg)}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {getMetricSubtitle()}
                  </Typography>
                </Paper>

                {/* Trend Indicator Card */}
                <Paper sx={{ 
                  p: 3, 
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "center", 
                  alignItems: "center",
                  flex: 1,
                  minHeight: "130px"
                }}>
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
                        {metricData.delta < 0 && "-"}
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
              <Paper sx={{ 
                p: 2, 
                height: "100%", 
                display: "flex", 
                flexDirection: "column"
              }}>
                <Box sx={{ 
                  flexGrow: 1, 
                  width: "100%", 
                  position: "relative", 
                  minHeight: { xs: "350px", md: "284px" } /* 2*130px (cards) + 2*12px (gap) */
                }}>
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
                        zoom={6}
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
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                  {getTimeSeriesTitle()}
                </Typography>
                <Grid container spacing={2}>
                  {/* Location Bar Chart */}
                  <Grid size={{xs: 12, md: 4}}>
                    <LocationBarChart
                      data={locationBarData as any}
                      selectedMetric={selectedMetric}
                      height={500}
                    />
                  </Grid>

                  {/* Time Series Chart */}
                  <Grid size={{xs: 12, md: 8}}>
                    <TimeSeriesChart
                      data={timeSeriesChartData() as any}
                      selectedMetric={selectedMetric}
                      height={500}
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

