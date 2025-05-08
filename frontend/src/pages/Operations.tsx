import { FC, useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import RemoveIcon from "@mui/icons-material/Remove";
import Plot from "react-plotly.js";
import MapBox, { MapTrace } from "../components/MapBox"; // Added MapTrace import
import {
  fetchMetricData,
  fetchLocationMetrics,
  fetchTimeSeriesData,
  fetchMapData,
  type MetricData,
  type LocationMetric,
  type TimeSeriesData,
  type MapPoint,
} from "../services/api"; // Assuming api service exists

// Define the available metrics based on Angular component tabs
// Using IDs that likely map to the API service
const metrics = [
  { id: "throughput", label: "Throughput" }, // tp
  { id: "dailyTrafficVolumes", label: "Daily Traffic Volumes" }, // dtv -> vpd
  { id: "arrivalsOnGreen", label: "Arrivals on Green" }, // aogd
  { id: "progressionRatio", label: "Progression Ratio" }, // prd
  { id: "spillbackRatio", label: "Spillback Ratio" }, // qsd - Assuming this maps
  { id: "peakPeriodSplitFailures", label: "Peak Period Split Failures" }, // sfd
  { id: "offPeakSplitFailures", label: "Off-Peak Split Failures" }, // sfo
  { id: "travelTimeIndex", label: "Travel Time Index" }, // tti
  { id: "planningTimeIndex", label: "Planning Time Index" }, // pti
];

// Map Settings Configuration (similar to Angular mapSettings/Dashboard config)
// Define ranges, colors, labels based on metric ID
const mapSettingsConfig: Record<string, any> = {
  throughput: {
    label: "Throughput",
    field: "value", // Assuming 'value' is the field in MapPoint
    formatType: "number",
    formatDecimals: 0,
    ranges: [ [0, 300], [300, 600], [600, 900], [900, 1200], [1200, 999999] ],
    legendLabels: [ "0 - 300 vph", "300 - 600 vph", "600 - 900 vph", "900 - 1,200 vph", "1,200+ vph" ],
    legendColors: ["#fee2e2", "#fecaca", "#fca5a5", "#f87171", "#ef4444"], // Example colors - adjust as needed
  },
  dailyTrafficVolumes: {
    label: "Traffic Volume",
    field: "value",
    formatType: "number",
    formatDecimals: 0,
    ranges: [ [0, 5000], [5000, 10000], [10000, 20000], [20000, 30000], [30000, 999999] ],
    legendLabels: [ "0 - 5,000 vpd", "5,000 - 10,000 vpd", "10,000 - 20,000 vpd", "20,000 - 30,000 vpd", "30,000+ vpd" ],
    legendColors: ["#cffafe", "#a5f3fc", "#67e8f9", "#22d3ee", "#06b6d4"], // Example colors
  },
  arrivalsOnGreen: {
    label: "Arrivals on Green",
    field: "value",
    formatType: "percent", // Input value assumed 0-1 for percent
    formatDecimals: 1,
    ranges: [ [0, 0.3], [0.3, 0.5], [0.5, 0.7], [0.7, 0.9], [0.9, 1.01] ], // Use 1.01 to include 1.0
    legendLabels: ["0-30%", "30-50%", "50-70%", "70-90%", "90-100%"],
    legendColors: ["#ef4444", "#f87171", "#fca5a5", "#fecaca", "#bbf7d0"], // Red to Green example
 },
 progressionRatio: {
    label: "Progression Ratio",
    field: "value",
    formatType: "number",
    formatDecimals: 2,
    ranges: [ [0, 0.8], [0.8, 0.9], [0.9, 1.0], [1.0, 1.1], [1.1, 99.0] ],
    legendLabels: ["< 0.8", "0.8 - 0.9", "0.9 - 1.0", "1.0 - 1.1", "> 1.1"],
    legendColors: ["#fecaca", "#fca5a5", "#bbf7d0", "#86efac", "#4ade80"], // Example colors
  },
  spillbackRatio: {
    label: "Spillback Rate",
    field: "value", // Input value assumed 0-1 for percent
    formatType: "percent",
    formatDecimals: 1,
    ranges: [ [0, 0.05], [0.05, 0.1], [0.1, 0.15], [0.15, 0.2], [0.2, 1.01] ],
    legendLabels: ["0-5%", "5-10%", "10-15%", "15-20%", ">20%"],
    legendColors: ["#bbf7d0", "#fef08a", "#fed7aa", "#fecaca", "#ef4444"], // Green to Red example
  },
  peakPeriodSplitFailures: {
    label: "Peak Split Failures",
    field: "value", // Input value assumed 0-1 for percent
    formatType: "percent",
    formatDecimals: 1,
    ranges: [ [0, 0.05], [0.05, 0.1], [0.1, 0.15], [0.15, 0.2], [0.2, 1.01] ],
    legendLabels: ["0-5%", "5-10%", "10-15%", "15-20%", ">20%"],
    legendColors: ["#bbf7d0", "#fef08a", "#fed7aa", "#fecaca", "#ef4444"], // Green to Red example
  },
  offPeakSplitFailures: {
    label: "Off-Peak Split Failures",
    field: "value", // Input value assumed 0-1 for percent
    formatType: "percent",
    formatDecimals: 1,
    ranges: [ [0, 0.05], [0.05, 0.1], [0.1, 0.15], [0.15, 0.2], [0.2, 1.01] ],
    legendLabels: ["0-5%", "5-10%", "10-15%", "15-20%", ">20%"],
    legendColors: ["#bbf7d0", "#fef08a", "#fed7aa", "#fecaca", "#ef4444"], // Green to Red example
  },
  travelTimeIndex: {
    label: "Travel Time Index",
    field: "value",
    formatType: "number",
    formatDecimals: 2,
    // Define ranges appropriate for TTI
    ranges: [ [1, 1.1], [1.1, 1.3], [1.3, 1.5], [1.5, 2.0], [2.0, 99] ],
    legendLabels: ["1.0-1.1", "1.1-1.3", "1.3-1.5", "1.5-2.0", ">2.0"],
    legendColors: ["#bbf7d0", "#fef08a", "#fed7aa", "#fecaca", "#ef4444"], // Green to Red example
  },
  planningTimeIndex: {
    label: "Planning Time Index",
    field: "value",
    formatType: "number",
    formatDecimals: 2,
    // Define ranges appropriate for PTI
    ranges: [ [1, 1.2], [1.2, 1.5], [1.5, 2.0], [2.0, 2.5], [2.5, 99] ],
    legendLabels: ["1.0-1.2", "1.2-1.5", "1.5-2.0", "2.0-2.5", ">2.5"],
    legendColors: ["#bbf7d0", "#fef08a", "#fed7aa", "#fecaca", "#ef4444"], // Green to Red example
  },
  // Add other metrics as needed
};

// Helper function to calculate average (like in Angular _average)
const calculateAverage = (data: MapPoint[], field: 'lat' | 'lon'): number => {
    if (!data || data.length === 0) return field === 'lat' ? defaultCenter.lat : defaultCenter.lon; // Default center
    const values = data.map(item => item[field]).filter(v => typeof v === 'number' && !isNaN(v));
    if (values.length === 0) return field === 'lat' ? defaultCenter.lat : defaultCenter.lon;
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
};

// Helper function to calculate zoom (like in Angular _zoom)
const calculateZoom = (data: MapPoint[]): number => {
    if (!data || data.length <= 1) return defaultZoom;

    const latitudes = data.map(item => item.lat).filter(v => typeof v === 'number' && !isNaN(v));
    const longitudes = data.map(item => item.lon).filter(v => typeof v === 'number' && !isNaN(v));

    if (latitudes.length <= 1 || longitudes.length <= 1) return defaultZoom;

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const widthY = maxLat - minLat;
    const widthX = maxLng - minLng;

    // Handle cases where width is zero or very small to avoid log(0) or large zooms
    if (widthY <= 1e-6 && widthX <= 1e-6) return 15; // High zoom for single point cluster
    if (widthY <= 1e-6) return Math.max(1, Math.min(18, -1.415 * Math.log(widthX) + 9.7068));
    if (widthX <= 1e-6) return Math.max(1, Math.min(18, -1.446 * Math.log(widthY) + 8.2753));


    const zoomY = -1.446 * Math.log(widthY) + 8.2753;
    const zoomX = -1.415 * Math.log(widthX) + 9.7068;

    return Math.max(1, Math.min(18, zoomY, zoomX)); // Clamp zoom level between 1 and 18
};

const defaultCenter = { lat: 33.789, lon: -84.388 }; // Atlanta
const defaultZoom = 11;

const Operations: FC = () => {
  // State for filters (similar to previous React version)
  // Default values can be adjusted as needed
  const [dateRange, setDateRange] = useState("priorYear");
  const [dateAggregation, setDateAggregation] = useState("monthly");
  const [region, setRegion] = useState("Central Metro"); // Default or from context/props

  // State for selected metric
  const [selectedMetric, setSelectedMetric] = useState("throughput"); // Default to first metric

  // State for data
  const [loading, setLoading] = useState(true);
  const [metricData, setMetricData] = useState<MetricData | null>(null);
  const [locationMetrics, setLocationMetrics] = useState<LocationMetric[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [mapData, setMapData] = useState<MapPoint[]>([]);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Use the existing API service functions
        const [metricResult, locationsResult, timeSeriesResult, mapResult] =
          await Promise.all([
            fetchMetricData(selectedMetric, region, dateRange, dateAggregation),
            fetchLocationMetrics(selectedMetric, region), // Assuming this fetches data for the bar chart
            fetchTimeSeriesData(
              selectedMetric,
              region,
              dateRange,
              dateAggregation
            ), // Assuming this fetches data for the line chart
            fetchMapData(selectedMetric, region), // Assuming this fetches data for the map
          ]);

        setMetricData(metricResult);
        setLocationMetrics(locationsResult || []);
        setTimeSeriesData(timeSeriesResult || []);
        setMapData(mapResult || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMetricData(null);
        setLocationMetrics([]);
        setTimeSeriesData([]);
        setMapData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMetric, region, dateRange, dateAggregation]);

  // --- Document Title Update ---
  useEffect(() => {
    const currentMetric = metrics.find(m => m.id === selectedMetric);
    document.title = `SigOpsMetrics - Operations - ${currentMetric?.label || 'Operations'}`;
  }, [selectedMetric]);

  // --- Event Handlers ---
  const handleMetricChange = (
    event: React.SyntheticEvent,
    newValue: string
  ) => {
    setSelectedMetric(newValue);
  };

  // --- Metric Formatting and Configuration ---

  // Based on Angular component's formatMetricValue logic and Graph objects
  const formatMetricValue = (value: number | string | undefined | null, metricId: string): string => {
    const settings = mapSettingsConfig[metricId];
    const formatType = settings?.formatType;
    const decimals = settings?.formatDecimals ?? 0;

    if (value === null || value === undefined || value === "" || Number.isNaN(value)) {
        return "N/A";
    }

    const numValue = Number(value);
    if (Number.isNaN(numValue)) return "N/A"; // Check after conversion

    if (formatType === "percent") {
       // Adjust based on whether input is 0-100 or 0-1
       const displayValue = numValue > 1 && numValue <= 100 ? numValue : numValue * 100;
       return `${displayValue.toFixed(decimals)}%`;
    } else if (formatType === "number") {
        return numValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    } else {
        // Default formatting if type not specified or unknown
        return numValue.toLocaleString();
    }
};


  // Determine if the metric is percentage-based for chart axis formatting
  const isPercentMetric = mapSettingsConfig[selectedMetric]?.formatType === "percent";

  // --- Chart/Map Data Preparation ---

  // Location Bar Chart Data (Corridor/Location vs. Value)
  const locationBarData = useMemo(() => ({
    y: locationMetrics.map((item) => item.location),
    x: locationMetrics.map((item) => {
        // Adjust value if it's a percentage that needs conversion (e.g., API returns 0-100 but chart expects 0-1)
        const displayValue = isPercentMetric && item.value > 1 ? item.value / 100 : item.value;
        return displayValue;
    }),
    type: "bar",
    orientation: "h",
    marker: { color: "#0070ed" },
    hovertemplate: mapSettingsConfig[selectedMetric]
        ? `<b>%{y}</b><br>${mapSettingsConfig[selectedMetric].label}: %{x${isPercentMetric ? ':.1%' : ':,.0f'}}<extra></extra>`
        : "<b>%{y}</b><br>Value: %{x}<extra></extra>",
  }), [locationMetrics, selectedMetric, isPercentMetric]);

  // Time Series Chart Data (Trend)
  const timeSeriesChartData = useMemo(() => {
    const locationGroups: { [key: string]: { x: string[]; y: (number | null)[] } } = {};
    timeSeriesData.forEach((item) => {
      if (!locationGroups[item.location]) {
        locationGroups[item.location] = { x: [], y: [] };
      }
      locationGroups[item.location].x.push(item.date);
       // Adjust value if needed (e.g., percentage conversion)
      const displayValue = isPercentMetric && item.value !== null && item.value > 1 ? item.value / 100 : item.value;
      locationGroups[item.location].y.push(displayValue);
    });

    const hovertemplate = mapSettingsConfig[selectedMetric]
        ? `<b>%{text}</b><br><b>%{x}</b><br>${mapSettingsConfig[selectedMetric].label}: %{y${isPercentMetric ? ':.1%' : ':,.0f'}}<extra></extra>`
        : "<b>%{text}</b><br>Date: %{x}<br>Value: %{y}<extra></extra>";

    return Object.keys(locationGroups).map((location) => ({
      x: locationGroups[location].x,
      y: locationGroups[location].y,
      type: "scatter",
      mode: "lines",
      name: location,
      line: { width: 1 },
      text: Array(locationGroups[location].x.length).fill(location), // For hover text
      hovertemplate: hovertemplate,
    }));
  }, [timeSeriesData, selectedMetric, isPercentMetric]);

  // Map Data Preparation
  const mapTraces = useMemo((): MapTrace[] => {
    const settings = mapSettingsConfig[selectedMetric];
    if (!settings || !mapData || mapData.length === 0) {
        // Return a single trace indicating no data or fallback
        return [{
            type: "scattermapbox",
            lat: [defaultCenter.lat],
            lon: [defaultCenter.lon],
            mode: "markers",
            marker: { size: 0, opacity: 0 },
            hoverinfo: "none",
            name: "No Data"
        }];
    }

    const traces: MapTrace[] = [];
    const field: keyof MapPoint = settings.field || 'value'; // Explicitly type field as keyof MapPoint

    for (let i = 0; i < settings.ranges.length; i++) {
        const range = settings.ranges[i];
        const rangeMin = range[0];
        const rangeMax = range[1];

        // Filter points within the current range
        const rangePoints = mapData.filter(point => {
            const pointValue = point[field];
            const numValue = Number(pointValue);
            // For the last range, include values up to and including rangeMax
            if (i === settings.ranges.length - 1) {
                return typeof numValue === 'number' && !isNaN(numValue) && numValue >= rangeMin && numValue <= rangeMax;
            } else {
                return typeof numValue === 'number' && !isNaN(numValue) && numValue >= rangeMin && numValue < rangeMax;
            }
        });

        if (rangePoints.length > 0) {
            traces.push({
                type: "scattermapbox",
                lat: rangePoints.map(p => p.lat),
                lon: rangePoints.map(p => p.lon),
                mode: "markers",
                marker: {
                    color: settings.legendColors[i],
                    size: 8, // Consistent size, or make dynamic?
                    opacity: 0.8,
                },
                text: rangePoints.map(p => {
                    // Generate text like Angular _generateText
                    const sigText = `<b>${p.signalID || ''}</b><br>${p.name || p.mainStreet || ''} @ ${p.sideStreet || ''}`;
                    // Use the field key safely now
                    const valueText = formatMetricValue(p[field], selectedMetric);
                    return `${sigText}<br>${settings.label}: ${valueText}`;
                }),
                name: settings.legendLabels[i], // Name for the legend
                showlegend: true,
                hoverinfo: "text",
            });
        }
    }
    // If no points matched any range, return the "No Data" trace
    if (traces.length === 0) {
        return [{
            type: "scattermapbox",
            lat: [defaultCenter.lat],
            lon: [defaultCenter.lon],
            mode: "markers",
            marker: { size: 0, opacity: 0 },
            hoverinfo: "none",
            name: "No Data"
        }];
    }

    return traces;
  }, [mapData, selectedMetric]);

  // Calculate map center and zoom based on the *fetched* mapData
  const mapCenter = useMemo(() => ({
      lat: calculateAverage(mapData, 'lat'),
      lon: calculateAverage(mapData, 'lon'),
  }), [mapData]);

  const mapZoom = useMemo(() => calculateZoom(mapData), [mapData]);

  // Titles based on Angular component
  const getMainTitle = () => {
     switch (selectedMetric) {
        case "throughput": return "Throughput (peak veh/hr)";
        case "dailyTrafficVolumes": return "Traffic Volume [veh/day]";
        case "arrivalsOnGreen": return "Arrivals on Green [%]";
        case "progressionRatio": return "Progression Ratio";
        case "spillbackRatio": return "Queue Spillback Rate";
        case "peakPeriodSplitFailures": return "Split Failures Rate [%]"; // Combined title for sfd/sfo
        case "offPeakSplitFailures": return "Split Failures Rate [%]"; // Combined title for sfd/sfo
        case "travelTimeIndex": return "Travel Time Index (TTI)";
        case "planningTimeIndex": return "Planning Time Index (PTI)";
        default: return "Metric Value";
     }
  }

  const getBarChartTitle = () => {
     switch (selectedMetric) {
        case "throughput": return "Throughput (vph)";
        case "dailyTrafficVolumes": return "Selected Month"; // As per Angular dtvBar
        case "arrivalsOnGreen": return "Arrivals on Green";
        case "progressionRatio": return "Selected Month"; // As per Angular prdBar
        case "spillbackRatio": return "Queue Spillback Rate";
        case "peakPeriodSplitFailures": return "Selected Month"; // As per Angular sfBar
        case "offPeakSplitFailures": return "Selected Month"; // As per Angular sfBar
        case "travelTimeIndex": return "Selected Month TTI";
        case "planningTimeIndex": return "Selected Month PTI";
        default: return "Locations";
     }
  }

  const getTimeSeriesTitle = () => {
    switch (selectedMetric) {
        case "throughput": return "Vehicles per Hour Trend";
        case "dailyTrafficVolumes": return "Weekly Trend";
        case "arrivalsOnGreen": return "Weekly Trend"; // aogdLine title
        case "progressionRatio": return "Weekly Trend";
        case "spillbackRatio": return "Queue Spillback Trend";
        case "peakPeriodSplitFailures": return "Weekly Trend"; // sfLine title
        case "offPeakSplitFailures": return "Weekly Trend"; // sfLine title
        case "travelTimeIndex": return "Monthly Trend"; // ttiLine title
        case "planningTimeIndex": return "Monthly Trend"; // ptiLine title
        default: return "Trend";
     }
  }

  // --- Render ---
  return (
    <Box sx={{ 
      p: 2, 
      height: '100%', 
      overflow: 'auto',
      maxHeight: '100vh' 
    }}>
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
          "& .MuiTab-root": { textTransform: "none", minWidth: "auto", px: 2 },
        }}
      >
        {metrics.map((metric) => (
          <Tab key={metric.id} label={metric.label} value={metric.id} />
        ))}
      </Tabs>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress 
            sx={{ 
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%': {
                  opacity: 0.5,
                  transform: 'scale(0.8)'
                },
                '50%': {
                  opacity: 1,
                  transform: 'scale(1)'
                },
                '100%': {
                  opacity: 0.5,
                  transform: 'scale(0.8)'
                }
              }
            }} 
          />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {/* Metric Display */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Metric Card */}
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" component="div" gutterBottom>
                  {formatMetricValue(metricData?.value, selectedMetric)}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {getMainTitle()}
                </Typography>
              </Paper>

              {/* Trend Indicator Card */}
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                {metricData?.change !== undefined && metricData?.change !== null ? (
                  <>
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{
                        color: metricData.change > 0 ? "success.main" : metricData.change < 0 ? "error.main" : "text.secondary",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: 'center'
                      }}
                    >
                      {Math.abs(metricData.change).toFixed(1)}%
                      {metricData.change > 0 ? <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> :
                       metricData.change < 0 ? <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} /> :
                       <RemoveIcon fontSize="small" sx={{ ml: 0.5 }} />}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {metricData?.changeLabel || "Change vs Prior Period"}
                    </Typography>
                  </>
                ) : (
                     <Typography variant="body2" color="text.secondary">Trend data unavailable</Typography>
                )}
              </Paper>
            </Box>
          </Grid>

          {/* Map */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 2, height: "100%", minHeight: 450 }}> {/* Ensure sufficient height */}
                 <MapBox
                    data={mapTraces} // Pass the array of traces
                    isRawTraces={true}
                    loading={false}
                    height="100%"
                    center={mapCenter} // Pass calculated center
                    zoom={mapZoom}     // Pass calculated zoom
                    showLegend={true} // Let MapBox/Plotly handle legend from traces
                    // renderLegend={undefined} // Remove custom renderLegend if MapBox uses it conditionally
                 />
            </Paper>
          </Grid>

          {/* Bottom Charts */}
          <Grid size={{ xs: 12 }}>
             <Paper sx={{ p: 2 }}>
                <Grid container spacing={2}>
                   {/* Location Bar Chart */}
                   <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="h6" gutterBottom textAlign="center">{getBarChartTitle()}</Typography>
                      <Plot
                        data={[locationBarData as any]}
                        layout={{
                          autosize: true,
                          height: 500,
                          margin: { l: 150, r: 20, t: 30, b: 50 },
                          yaxis: { automargin: true },
                          xaxis: {
                            title: "",
                            tickformat: isPercentMetric ? ".1%" : undefined,
                          },
                        }}
                        style={{ width: "100%", height: "100%" }}
                        config={{ responsive: true, displayModeBar: false }}
                      />
                   </Grid>
                   {/* Time Series Chart */}
                   <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="h6" gutterBottom textAlign="center">{getTimeSeriesTitle()}</Typography>
                      <Plot
                        data={timeSeriesChartData as any}
                        layout={{
                          autosize: true,
                          height: 500,
                          margin: { l: 60, r: 20, t: 30, b: 50 },
                          xaxis: { title: "Time Period" },
                          yaxis: {
                            title: "",
                            tickformat: isPercentMetric ? ".1%" : undefined,
                          },
                          showlegend: false,
                          // legend: { x: 0.5, y: -0.2, xanchor: 'center', orientation: 'v' },
                        }}
                        style={{ width: "100%", height: "100%" }}
                        config={{ responsive: true, displayModeBar: false }}
                      />
                   </Grid>
                </Grid>
             </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Operations;
