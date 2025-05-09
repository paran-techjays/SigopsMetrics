"use client"

import { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchAllSignals } from "../../store/slices/metricsSlice";
import { AppDispatch } from "../../store/store";
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
import CircularProgress from "@mui/material/CircularProgress"
import MapBox, { MapTrace } from "../../components/MapBox"
import { metricsApi } from "../../services/api/metricsApi";
import { FilterParams, MetricsFilterRequest } from "../../types/api.types";
import mapSettings from "../../utils/mapSettings";

interface MetricRow {
  label: string
  value: string | number
  unit: string
  measure: string
}

// Map of measure codes to display labels
const metricLabels: Record<string, string> = {
  prd: "Progression Ratio",
  sfd: "Peak Period Split Failures",
  aogd: "Arrivals on Green",
  tp: "Throughput",
  qsd: "Queue Spillback Ratio",
  sfo: "Off Peak Split Failures",
  tti: "Travel Time Index",
  pti: "Planning Time Index",
  vpd: "Traffic Volume",
  vphpp: "PM Peak Volume",
  vphpa: "AM Peak Volume",
  papd: "Pedestrian Activations",
  du: "Vehicle Detector Uptime",
  pau: "Pedestrian Detector Uptime",
  cctv: "CCTV Uptime",
  cu: "Communications Uptime",
};

// Function to get the unit for a metric
const getMetricUnit = (measure: string): string => {
  switch (measure) {
    case "tp":
    case "vphpp":
    case "vphpa":
      return "vph";
    case "vpd":
      return "vpd";
    case "aogd":
    case "qsd":
    case "sfd":
    case "sfo":
      return "%";
    case "du":
    case "pau":
    case "cctv":
    case "cu":
      return "%";
    default:
      return "";
  }
};

// Function to format a metric value based on its type
const formatMetricValue = (value: any, measure: string): string => {
  // If the value is null, undefined, or NaN, return "N/A"
  if (value === null || value === undefined || isNaN(value)) {
    return "N/A";
  }
  
  // Format percentage values
  if (["aogd", "qsd", "sfd", "sfo", "du", "pau", "cctv", "cu"].includes(measure)) {
    return (value * 100).toFixed(1);
  }
  
  // Format volume values (round to nearest whole number and add comma separators)
  if (["tp", "vpd", "vphpp", "vphpa", "papd"].includes(measure)) {
    return Math.round(value).toLocaleString();
  }
  
  // Format index values (ratio with 2 decimals)
  return Number(value).toFixed(2);
};

// Lists of metrics for each category
const performanceMetricCodes = ["tp", "aogd", "prd", "qsd", "sfd", "sfo", "tti", "pti"];
const volumeMetricCodes = ["vpd", "vphpa", "vphpp", "papd", "du", "pau", "cctv", "cu"];

// Map metric dropdown values to API measure codes and display options
const displayMetricToMeasureMap: Record<string, string> = {
  dailyTrafficVolume: "vpd",
  throughput: "tp",
  arrivalsOnGreen: "aogd",
  progressionRate: "prd",
  spillbackRate: "qsd",
  peakPeriodSplitFailures: "sfd",
  offPeakSplitFailures: "sfo",
};

// Map Dashboard metric IDs to mapSettings keys
const metricToSettingsMap: Record<string, string> = {
  dailyTrafficVolume: "dailyTrafficVolume",
  throughput: "throughput",
  arrivalsOnGreen: "arrivalsOnGreen",
  progressionRate: "progressionRate",
  spillbackRate: "spillbackRate", 
  peakPeriodSplitFailures: "peakPeriodSplitFailures",
  offPeakSplitFailures: "offPeakSplitFailures",
};

// Add signal interface
interface Signal {
  signalID: string;
  latitude: number;
  longitude: number;
  mainStreetName: string;
  sideStreetName: string;
  [key: string]: any;
}

// Add metric data interface
interface MetricDataItem {
  label: string;
  avg: number;
  delta: number;
  zoneGroup: string | null;
  weight: number;
}

export default function Dashboard() {
  const [displayMetric, setDisplayMetric] = useState("dailyTrafficVolume");
  const [perfMetrics, setPerfMetrics] = useState<MetricRow[]>([]);
  const [volMetrics, setVolMetrics] = useState<MetricRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mapData, setMapData] = useState<any>(null);
  const [mapLoading, setMapLoading] = useState<boolean>(true);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [metricData, setMetricData] = useState<MetricDataItem[]>([]);
  
  const dispatch = useDispatch<AppDispatch>();

  // Common filter parameters for all requests
  const commonFilterParams: FilterParams = {
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
    classification: "",
  };

  // Calculate average of a field in an array of objects
  const calculateAverage = useCallback((data: any[], field: string): number => {
    if (!data || data.length === 0) return 0;
    
    const values = data.map(item => item[field]);
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  }, []);

  // Calculate zoom level based on data points
  const calculateZoom = useCallback((data: any[]): number => {
    if (!data || data.length <= 1) return 12;
    
    const latitudes = data.map(item => item.latitude);
    const longitudes = data.map(item => item.longitude);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
    const widthY = maxLat - minLat;
    const widthX = maxLng - minLng;
    
    const zoomY = -1.446 * Math.log(widthY) + 8.2753;
    const zoomX = -1.415 * Math.log(widthX) + 9.7068;
    
    return Math.min(zoomY, zoomX);
  }, []);

  // Format value for display
  const formatValue = useCallback((value: number, formatType: string, decimals: number): string => {
    if (value === -1 || isNaN(value)) return "Unavailable";
    
    if (formatType === "percent") {
      return `${(value * 100).toFixed(decimals)}%`;
    } else {
      return Math.round(value).toLocaleString();
    }
  }, []);

  // Generate tooltip text
  const generateTooltipText = useCallback((signal: any, field: string, label: string, formatType: string, decimals: number): string => {
    const signalInfo = `ID: ${signal.signalID}<br>${signal.mainStreetName} @ ${signal.sideStreetName}`;
    let value;
    
    if (signal[field] === -1 || signal[field] === undefined) {
      value = "Unavailable";
    } else {
      value = formatValue(signal[field], formatType, decimals);
    }
    
    return `${signalInfo}<br>${label}: ${value}`;
  }, [formatValue]);

  // Fetch signal data
  const fetchSignals = useCallback(async () => {
    try {
      // Fetch signal data with location info
      const response = await fetch('https://sigopsmetrics-api.dot.ga.gov/signals/all');
      if (!response.ok) throw new Error('Failed to fetch signals');
      
      const data = await response.json();
      
      // Filter out signals with missing coordinates
      const validSignals = data.filter((signal: any) => 
        signal.latitude !== 0 && signal.longitude !== 0 && 
        signal.latitude !== null && signal.longitude !== null);
      
      setSignals(validSignals);
    } catch (error) {
      console.error('Error fetching signal data:', error);
      setSignals([]);
    }
  }, []);

  // Fetch map data for the selected metric
  const fetchMapData = useCallback(async (metricName: string) => {
    setMapLoading(true);
    try {
      // Fetch signals if not already loaded
      if (signals.length === 0) {
        await fetchSignals();
      }
      
      const measure = displayMetricToMeasureMap[metricName];
      const params: MetricsFilterRequest = {
        source: "main",
        measure,
      };
      
      console.log(`Fetching map data for ${metricName} (${measure})`);
      
      // Fetch data from the API
      const responseData = await metricsApi.getSignalsFilterAverage(params, commonFilterParams);
      console.log("Map data response:", responseData);
      
      if (Array.isArray(responseData) && responseData.length > 0) {
        setMetricData(responseData);
        
        // Get settings from mapSettings using the mapping
        const settingsKey = metricToSettingsMap[metricName];
        const settings = settingsKey ? mapSettings[settingsKey] : null;
        
        if (!settings) {
          console.error(`No settings found for metric: ${metricName}`);
          setMapData(generateFallbackMapData());
          setMapLoading(false);
          return;
        }
        
        // Join signal data with metric data
        const joinedData = signals
          .map(signal => {
            const metricItem = responseData.find(md => md.label === signal.signalID);
            if (metricItem) {
              return {
                ...signal,
                [settings.field]: metricItem.avg
              };
            }
            return null;
          })
          .filter(Boolean);
        
        // Create different traces for each range
        const mapTraces = [];
        
        // First add the unavailable data trace so it appears at the top of the legend
        const unavailableSignals = joinedData.filter((signal: any) => 
          signal[settings.field] === undefined || signal[settings.field] === null || signal[settings.field] === -1
        );
        
        if (unavailableSignals.length > 0) {
          mapTraces.push({
            type: "scattermapbox",
            lat: unavailableSignals.map((signal: any) => signal.latitude),
            lon: unavailableSignals.map((signal: any) => signal.longitude),
            mode: "markers",
            marker: {
              color: settings.legendColors[0], // First color is for unavailable
              size: 10,
              opacity: 0.8,
              symbol: "circle"
            },
            text: unavailableSignals.map((signal: any) => 
              `${signal.signalID}<br>${signal.mainStreetName} @ ${signal.sideStreetName}<br>No data available`
            ),
            name: settings.legendLabels[0], // "Unavailable"
            showlegend: true,
            hoverinfo: "text"
          });
        }
        
        // Then add traces for each range of data
        // Skip the first range which is for unavailable data [-1, -1]
        for (let i = 1; i < settings.ranges.length; i++) {
          const range = settings.ranges[i];
          
          // Filter signals in this range
          const rangeSignals = joinedData.filter((signal: any) => 
            signal[settings.field] >= range[0] && signal[settings.field] <= range[1]
          );
          
          if (rangeSignals.length > 0) {
            // Create a single trace for this range of signals
            mapTraces.push({
              type: "scattermapbox",
              lat: rangeSignals.map((signal: any) => signal.latitude),
              lon: rangeSignals.map((signal: any) => signal.longitude),
              mode: "markers",
              marker: {
                color: settings.legendColors[i], // Use i to match the range index
                size: 10,
                opacity: 0.8,
                symbol: "circle"
              },
              text: rangeSignals.map((signal: any) => 
                generateTooltipText(
                  signal, 
                  settings.field, 
                  settings.label, 
                  settings.formatType, 
                  settings.formatDecimals
                )
              ),
              name: settings.legendLabels[i], // Use i to match the range index
              showlegend: true,
              hoverinfo: "text"
            });
          }
        }
        
        // Calculate map center and zoom
        const centerLat = calculateAverage(joinedData, 'latitude');
        const centerLon = calculateAverage(joinedData, 'longitude');
        const zoom = calculateZoom(joinedData);
        
        // Create layout with proper center and zoom
        const mapLayout = {
          autosize: true,
          hovermode: "closest",
          mapbox: {
            style: "carto-positron",
            center: { lat: centerLat, lon: centerLon },
            zoom: zoom,
            pitch: 45, // Tilt view for 3D effect
            bearing: 0,
            dragmode: "zoom",
            accesstoken: "pk.eyJ1IjoicGxvdGx5bWFwYm94IiwiYSI6ImNrOWJqb2F4djBnMjEzbG50amg0dnJieG4ifQ.Zme1-Uzoi75IaFbieBDl3A"
          },
          margin: { r: 0, t: 0, b: 0, l: 0 },
          legend: {
            x: 1,
            xanchor: 'right',
            y: 0.9,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            bordercolor: 'rgba(0, 0, 0, 0.1)',
            borderwidth: 1
          },
          dragmode: "pan",
          updatemenus: [
            {
              buttons: [
                {
                  args: [{ "mapbox.zoom": 11, "mapbox.center.lat": centerLat, "mapbox.center.lon": centerLon }],
                  label: "Reset View",
                  method: "relayout"
                },
                {
                  args: [{ "mapbox.pitch": 0, "mapbox.bearing": 0 }],
                  label: "2D View",
                  method: "relayout"
                },
                {
                  args: [{ "mapbox.pitch": 45, "mapbox.bearing": 0 }],
                  label: "3D View",
                  method: "relayout"
                },
                {
                  args: [{ "mapbox.bearing": 45 }],
                  label: "Rotate Right",
                  method: "relayout"
                },
                {
                  args: [{ "mapbox.bearing": -45 }],
                  label: "Rotate Left",
                  method: "relayout"
                }
              ],
              direction: "left",
              pad: { r: 10, t: 10 },
              showactive: false,
              type: "buttons",
              x: 0.05,
              y: 0.05,
              xanchor: "left",
              yanchor: "bottom"
            }
          ]
        };
        console.log("Map traces:", mapTraces);
        setMapData(mapTraces);
        setMapLayout(mapLayout);
      } else {
        console.error("Invalid map data response:", responseData);
        setMapData(generateFallbackMapData());
      }
    } catch (error) {
      console.error("Error fetching map data:", error);
      setMapData(generateFallbackMapData());
    } finally {
      setMapLoading(false);
    }
  }, [signals, calculateAverage, calculateZoom, generateTooltipText, commonFilterParams, fetchSignals, displayMetricToMeasureMap]);

  // Generate fallback map data if API fails
  const generateFallbackMapData = () => {
    return [{
      type: "scattermapbox",
      lat: [
        33.749, 33.759, 33.769, 33.779, 33.789, 33.799, 33.809, 33.819, 33.829, 33.839,
      ],
      lon: [
        -84.388, -84.398, -84.408, -84.418, -84.428, -84.378, -84.368, -84.358, -84.348, -84.338,
      ],
      mode: "markers",
      marker: {
        size: 8,
        color: "#3b82f6",
        opacity: 0.8,
      },
      text: Array(10).fill("No data available"),
      name: "No data",
      showlegend: true,
      hoverinfo: "text",
    }];
  };

  // Handle metric selection change
  const handleDisplayMetricChange = (newMetric: string) => {
    setDisplayMetric(newMetric);
    fetchMapData(newMetric);
  };

  // Fetch data when component mounts
  useEffect(() => {
    dispatch(fetchAllSignals());
    
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // First fetch signal data needed for map
        await fetchSignals();
        
        // Fetch performance metrics
        const perfMetricsData = await Promise.all(
          performanceMetricCodes.map(async (measure) => {
            const params: MetricsFilterRequest = {
              source: "main",
              measure,
            };
            
            try {
              // The API response might be a number directly or have an avg property
              const response = await metricsApi.getStraightAverage(params, commonFilterParams);
              
              // Debug: Log the response to understand its structure
              console.log(`Response for ${measure}:`, response);
              
              let value: number;
              
              // Check the response structure
              if (typeof response === 'number') {
                value = response;
              } else if (response && typeof response === 'object') {
                if ('avg' in response) {
                  value = (response as any).avg;
                } else {
                  console.error(`Unexpected response structure for ${measure}:`, response);
                  value = NaN;
                }
              } else {
                console.error(`Invalid response for ${measure}:`, response);
                value = NaN;
              }
                
              return {
                label: metricLabels[measure],
                value: formatMetricValue(value, measure),
                unit: getMetricUnit(measure),
                measure,
              };
            } catch (error) {
              console.error(`Error fetching ${measure}:`, error);
              // Return a default value in case of error
              return {
                label: metricLabels[measure],
                value: "N/A",
                unit: getMetricUnit(measure),
                measure,
              };
            }
          })
        );
        
        // Fetch volume metrics
        const volMetricsData = await Promise.all(
          volumeMetricCodes.map(async (measure) => {
            const params: MetricsFilterRequest = {
              source: "main",
              measure,
            };
            
            try {
              // The API response might be a number directly or have an avg property
              const response = await metricsApi.getStraightAverage(params, commonFilterParams);
              
              // Debug: Log the response to understand its structure
              console.log(`Response for ${measure}:`, response);
              
              let value: number;
              
              // Check the response structure
              if (typeof response === 'number') {
                value = response;
              } else if (response && typeof response === 'object') {
                if ('avg' in response) {
                  value = (response as any).avg;
                } else {
                  console.error(`Unexpected response structure for ${measure}:`, response);
                  value = NaN;
                }
              } else {
                console.error(`Invalid response for ${measure}:`, response);
                value = NaN;
              }
                
              return {
                label: metricLabels[measure],
                value: formatMetricValue(value, measure),
                unit: getMetricUnit(measure),
                measure,
              };
            } catch (error) {
              console.error(`Error fetching ${measure}:`, error);
              // Return a default value in case of error
              return {
                label: metricLabels[measure],
                value: "N/A",
                unit: getMetricUnit(measure),
                measure,
              };
            }
          })
        );
        
        setPerfMetrics(perfMetricsData);
        setVolMetrics(volMetricsData);
        
        // Also fetch initial map data
        await fetchMapData(displayMetric);
      } catch (error) {
        console.error("Error fetching metrics data:", error);
        // Fall back to dummy data if API calls fail
        setPerfMetrics([
          { label: "Throughput", value: "1,235", unit: "vph", measure: "tp" },
          { label: "Arrivals on Green", value: "69.9", unit: "%", measure: "aogd" },
          { label: "Progression Ratio", value: "1.07", unit: "", measure: "prd" },
          { label: "Queue Spillback Ratio", value: "17.5", unit: "%", measure: "qsd" },
          { label: "Peak Period Split Failures", value: "8.3", unit: "%", measure: "sfd" },
          { label: "Off Peak Split Failures", value: "4.7", unit: "%", measure: "sfo" },
          { label: "Travel Time Index", value: "1.31", unit: "", measure: "tti" },
          { label: "Planning Time Index", value: "1.42", unit: "", measure: "pti" },
        ]);
        
        setVolMetrics([
          { label: "Traffic Volume", value: "16,863", unit: "vpd", measure: "vpd" },
          { label: "AM Peak Volume", value: "886", unit: "vph", measure: "vphpa" },
          { label: "PM Peak Volume", value: "1,156", unit: "vph", measure: "vphpp" },
          { label: "Pedestrian Activations", value: "225", unit: "", measure: "papd" },
          { label: "Vehicle Detector Uptime", value: "99.9%", unit: "%", measure: "du" },
          { label: "Pedestrian Detector Uptime", value: "99.9%", unit: "%", measure: "pau" },
          { label: "CCTV Uptime", value: "99.9%", unit: "%", measure: "cctv" },
          { label: "Communications Uptime", value: "99.9%", unit: "%", measure: "cu" },
        ]);
        
        // Set fallback map data
        setMapData(generateFallbackMapData());
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch, fetchSignals]);

  const [mapLayout, setMapLayout] = useState<any>({
    autosize: true,
    hovermode: "closest",
    mapbox: {
      style: "carto-positron",
      center: { lat: 33.789, lon: -84.388 },
      zoom: 11,
      pitch: 0,
      bearing: 0,
      dragmode: "zoom",
      accesstoken: "pk.eyJ1IjoicGxvdGx5bWFwYm94IiwiYSI6ImNrOWJqb2F4djBnMjEzbG50amg0dnJieG4ifQ.Zme1-Uzoi75IaFbieBDl3A"
    },
    margin: { r: 0, t: 0, b: 0, l: 0 },
    legend: {
      x: 1,
      xanchor: 'right',
      y: 0.9,
      bgcolor: 'rgba(255, 255, 255, 0.8)',
      bordercolor: 'rgba(0, 0, 0, 0.1)',
      borderwidth: 1
    },
    dragmode: "pan",
    updatemenus: [
      {
        buttons: [
          {
            args: [{ "mapbox.zoom": 11, "mapbox.center.lat": 33.789, "mapbox.center.lon": -84.388 }],
            label: "Reset View",
            method: "relayout"
          },
          {
            args: [{ "mapbox.pitch": 0, "mapbox.bearing": 0 }],
            label: "2D View",
            method: "relayout"
          },
          {
            args: [{ "mapbox.pitch": 45, "mapbox.bearing": 0 }],
            label: "3D View",
            method: "relayout"
          },
          {
            args: [{ "mapbox.bearing": 45 }],
            label: "Rotate Right",
            method: "relayout"
          },
          {
            args: [{ "mapbox.bearing": -45 }],
            label: "Rotate Left",
            method: "relayout"
          }
        ],
        direction: "left",
        pad: { r: 10, t: 10 },
        showactive: false,
        type: "buttons",
        x: 0.05,
        y: 0.05,
        xanchor: "left",
        yanchor: "bottom"
      }
    ]
  });

  // // Fetch initial data
  // useEffect(() => {
  //   // Fetch signals data
  //   fetchSignals();
    
  //   dispatch(fetchAllSignals());
    
  //   // ... existing effect code ...
    
  //   // Also fetch initial map data
  //   fetchMapData(displayMetric);
    
  //   // ... rest of the existing effect code ...
  // }, [dispatch, fetchSignals]);

  // Return JSX
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Main Content - Responsive Layout */}
        <Box sx={{ flex: 1 }}>
          <Grid container spacing={2}>
            {/* Performance Metrics */}
            <Grid item xs={12} md={6} lg={12}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  Performance
                </Typography>
                <TableContainer>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <Table size="small">
                      <TableBody>
                        {perfMetrics.map((row) => (
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
                  )}
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
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <Table size="small">
                      <TableBody>
                        {volMetrics.map((row) => (
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
                  )}
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
          <Paper sx={{ p: 2, height: "100%" }}>
            <TableContainer>
              <Table size="small">
                <TableBody>
                    <TableRow>
                      <TableCell>TEAMS Tasks</TableCell>
                      <TableCell align="right">Total Outstanding: 0</TableCell>
                    </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        {/* Map Area */}
        <Box sx={{ flex: 2 }}>
          <Paper sx={{ p: 2, height: "100%", minHeight: "500px" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="display-metric-label">Performance Metric</InputLabel>
                <Select
                  labelId="display-metric-label"
                  label="Performance Metric"
                  value={displayMetric}
                  onChange={(e) => handleDisplayMetricChange(e.target.value as string)}
                >
                  <MenuItem value="dailyTrafficVolume">Daily Traffic Volume</MenuItem>
                  <MenuItem value="throughput">Throughput</MenuItem>
                  <MenuItem value="arrivalsOnGreen">Arrivals on Green</MenuItem>
                  <MenuItem value="progressionRate">Progression Rate</MenuItem>
                  <MenuItem value="spillbackRate">Spillback Rate</MenuItem>
                  <MenuItem value="peakPeriodSplitFailures">Peak Period Split Failures</MenuItem>
                  <MenuItem value="offPeakSplitFailures">Off-Peak Split Failures</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ height: "calc(100% - 60px)", width: "100%", position: "relative", minHeight: "400px" }}>
              {mapLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : (
                <MapBox
                  data={mapData}
                  isRawTraces={true}
                  loading={false}
                  height="100%"
                  showLegend={true}
                  showControls={true}
                />
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

