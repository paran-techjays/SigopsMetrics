import { FC, useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Plot from "react-plotly.js";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllSignals } from "../store/slices/metricsSlice";
import { AppDispatch } from "../store/store";
import { format } from "date-fns";

export interface MapPoint {
  lat: number;
  lon: number;
  value: number;
  name?: string;
  signalID?: string;
  mainStreet?: string;
  sideStreet?: string;
  [key: string]: any;
}

export interface MapTrace {
  type: "scattermap" | "scattermapbox";
  lat: number[];
  lon: number[];
  mode: string;
  marker: {
    size: number | number[];
    color?: string | string[];
    opacity?: number;
    symbol?: string;
  };
  text?: string[];
  name?: string;
  showlegend?: boolean;
  hoverinfo?: string;
  hovertemplate?: string;
  [key: string]: any;
}

export interface MapBoxProps {
  mapSettings?: {
    metrics: {
      field: string;
      label: string;
      formatType?: string;
      formatDecimals?: number;
      source?: string;
      start?: string;
      end?: string;
    };
    ranges?: number[][];
    legendColors?: string[];
    legendLabels?: string[];
  };
  data?: MapPoint[] | MapTrace[];
  isRawTraces?: boolean;
  loading?: boolean;
  center?: { lat: number; lon: number };
  zoom?: number;
  height?: string | number;
  width?: string | number;
  mapStyle?: string;
  showLegend?: boolean;
  showControls?: boolean;
  emptyMessage?: string;
  renderLegend?: () => React.ReactNode;
  mapOptions?: any;
  filter?: any;
}

const defaultCenter = { lat: 33.789, lon: -84.388 }; // Atlanta
const defaultZoom = 11;

const MapBox: FC<MapBoxProps> = ({
  mapSettings = {
    metrics: {
      field: "",
      label: "",
      formatType: "number",
      formatDecimals: 0,
      source: "main",
      start: format(new Date(), "yyyy-MM-dd"),
      end: format(new Date(), "yyyy-MM-dd")
    },
    ranges: [[0, 25], [26, 50], [51, 75], [76, 100]],
    legendColors: ["#ff0000", "#ffa500", "#ffff00", "#008000"],
    legendLabels: ["0-25%", "26-50%", "51-75%", "76-100%"]
  },
  data = [],
  isRawTraces = false,
  loading = false,
  center = defaultCenter,
  zoom = defaultZoom,
  height = "100%",
  width = "100%",
  mapStyle = "carto-positron",
  showLegend = true,
  showControls = true,
  emptyMessage = "No map data available for this selection",
  renderLegend,
  mapOptions = {},
  filter = {}
}) => {
  const dispatch: AppDispatch = useDispatch();
  const signals = useSelector((state: any) => state.metrics.signals);
  const [mapData, setMapData] = useState<MapTrace[]>([]);
  const [mapLayout, setMapLayout] = useState<any>({
    dragmode: "zoom",
    mapbox: {
      style: mapStyle,
      center: center,
      zoom: zoom
    },
    margin: { r: 0, t: 0, b: 0, l: 0 },
    xaxis: {
      zeroline: false,
    },
    yaxis: {
      zeroline: false,
    }
  });

  // Add legend if needed
  useEffect(() => {
    if (showLegend) {
      setMapLayout((prev: any) => ({
        ...prev,
        legend: {
          x: 1,
          xanchor: 'right',
          y: 0.9,
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          bordercolor: 'rgba(0, 0, 0, 0.1)',
          borderwidth: 1
        }
      }));
    } else {
      setMapLayout((prev: any) => ({
        ...prev,
        legend: undefined
      }));
    }

    // Add controls if needed
    if (showControls) {
      setMapLayout((prev: any) => ({
        ...prev,
        updatemenus: [
          {
            buttons: [
              {
                args: [{ "mapbox.zoom": zoom, "mapbox.center.lat": center.lat, "mapbox.center.lon": center.lon }],
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
      }));
    } else {
      setMapLayout((prev: any) => ({
        ...prev,
        updatemenus: undefined
      }));
    }
  }, [showLegend, showControls, center, zoom]);

  // Update layout if props change
  useEffect(() => {
    setMapLayout((prevLayout: any) => ({
      ...prevLayout,
      mapbox: {
        ...prevLayout.mapbox,
        style: mapStyle,
        center: center,
        zoom: zoom
      },
    }));
  }, [center, zoom, mapStyle]);

  // Fetch signals data if needed
  useEffect(() => {
    if (!signals || signals.length === 0) {
      dispatch(fetchAllSignals());
    }
  }, [dispatch, signals]);

  // Process data for the map
  useEffect(() => {
    if (loading || !signals || signals.length === 0) return;

    if (isRawTraces && data.length > 0) {
      // Just use the provided traces directly
      setMapData((data as MapTrace[]).map(trace => ({ 
        ...trace, 
        type: "scattermapbox" 
      })));
      return;
    }

    // Filter signals to only include those with valid coordinates
    const validSignals = signals.filter(signal => 
      signal && 
      signal.latitude !== 0 && 
      signal.longitude !== 0
    );

    if (validSignals.length === 0) {
      setMapData([{
        type: "scattermapbox",
        lat: [defaultCenter.lat],
        lon: [defaultCenter.lon],
        mode: "markers",
        marker: {
          size: 1,
          opacity: 0
        },
        hoverinfo: "none"
      }]);
      return;
    }

    // Join signal data with metrics data
    const joinedData = validSignals.map(signal => {
      // Look for the signal's metrics in the provided data
      const metricData = Array.isArray(data) ? 
        data.find(d => d.signalID === signal.signalID) : 
        null;
      
      if (metricData) {
        return {
          ...signal,
          value: metricData.value || 0,
        };
      }
      
      return {
        ...signal,
        value: -1  // Unavailable data
      };
    }).filter(item => item); // Remove any undefined items
    
    // Create trace data based on value ranges
    const traces: MapTrace[] = [];
    
    for (let i = 0; i < mapSettings.ranges.length; i++) {
      const range = mapSettings.ranges[i];
      const rangeSignals = joinedData.filter(signal => 
        signal.value >= range[0] && signal.value <= range[1]
      );
      
      if (rangeSignals.length > 0) {
        traces.push({
          type: "scattermapbox",
          lat: rangeSignals.map(signal => signal.latitude),
          lon: rangeSignals.map(signal => signal.longitude),
          text: rangeSignals.map(signal => generateTooltipText(signal)),
          marker: {
            color: mapSettings.legendColors[i],
            size: 6
          },
          mode: "markers",
          name: mapSettings.legendLabels[i],
          showlegend: true,
          hovertemplate: '%{text}' + '<extra></extra>'
        });
      }
    }
    
    // If no traces were created (no data in ranges), add default trace
    if (traces.length === 0) {
      traces.push({
        type: "scattermapbox",
        lat: [defaultCenter.lat],
        lon: [defaultCenter.lon],
        mode: "markers",
        marker: {
          size: 1,
          opacity: 0
        },
        hoverinfo: "none"
      });
    }
    
    setMapData(traces);
    
    // Calculate zoom and center based on data points
    if (traces.length > 0 && traces[0].lat.length > 0 && traces[0].lat[0] !== defaultCenter.lat) {
      const allLats = traces.flatMap(trace => trace.lat);
      const allLons = traces.flatMap(trace => trace.lon);
      
      if (allLats.length > 0 && allLons.length > 0) {
        const centerLat = average(allLats);
        const centerLon = average(allLons);
        const calculatedZoom = calculateZoom(allLats, allLons);
        
        setMapLayout(prevLayout => ({
          ...prevLayout,
          mapbox: {
            ...prevLayout.mapbox,
            center: {
              lat: centerLat,
              lon: centerLon
            },
            zoom: calculatedZoom
          }
        }));
      }
    }
  }, [signals, data, isRawTraces, loading, mapSettings]);

  // Helper function to format number values
  const formatNumber = (val: number, decimals: number = 0): string => {
    if (isNaN(val) || val === null) {
      return 'N/A';
    }
    return Number(val.toFixed(decimals)).toLocaleString();
  };

  // Helper function to format percent values
  const formatPercent = (val: number, decimals: number = 0): string => {
    if (isNaN(val) || val === null) {
      return 'N/A';
    }
    return formatNumber(val * 100, decimals) + '%';
  };

  // Helper function to format values based on type
  const formatValue = (val: number, formatType: string, decimals: number = 0): string => {
    if (formatType === "percent") {
      return formatPercent(val, decimals);
    }
    return formatNumber(val, decimals);
  };

  // Generate tooltip text for map markers
  const generateTooltipText = (signal: any): string => {
    const sigText = `<b>Signal: ${signal.signalID}</b> | ${signal.mainStreetName} @ ${signal.sideStreetName}`;
    let value = "";

    if (signal.value === -1) {
      value = "Unavailable";
    } else {
      value = formatValue(
        signal.value, 
        mapSettings.metrics.formatType || "number",
        mapSettings.metrics.formatDecimals || 0
      );
    }

    const metricText = `<br><b>${mapSettings.metrics.label}: ${value}</b>`;
    return sigText + metricText;
  };

  // Helper function to calculate average
  const average = (arr: number[]): number => {
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length;
  };

  // Helper function to calculate appropriate zoom level
  const calculateZoom = (lats: number[], lons: number[]): number => {
    if (lats.length <= 1) return defaultZoom;
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    
    const widthY = maxLat - minLat;
    const widthX = maxLon - minLon;
    
    const zoomY = -1.446 * Math.log(widthY) + 8.2753;
    const zoomX = -1.415 * Math.log(widthX) + 9.7068;
    
    return Math.min(zoomY, zoomX);
  };

  return (
    <Box 
      sx={{ 
        height: height, 
        width: width, 
        position: "relative",
        minHeight: typeof height === 'number' ? height : 350
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Plot
            data={mapData as any}
            layout={mapLayout as any}
            style={{ width: "100%", height: "100%" }}
            config={{ 
              displayModeBar: true,
              modeBarButtonsToAdd: [
                'resetViewMapbox',
                'zoomInMapbox',
                'zoomOutMapbox',
              ],
              scrollZoom: true,
              responsive: true,
              doubleClick: 'reset+autosize',
              showTips: true,
              mapboxAccessToken: "pk.eyJ1IjoicGxvdGx5bWFwYm94IiwiYSI6ImNrOWJqb2F4djBnMjEzbG50amg0dnJieG4ifQ.Zme1-Uzoi75IaFbieBDl3A",
              toImageButtonOptions: {
                format: 'png',
                filename: 'traffic_map',
                height: 1200,
                width: 1800,
                scale: 2
              },
              ...mapOptions
            }}
            useResizeHandler={true}
          />
          {(!mapData || mapData.length === 0 || (mapData[0]?.lat?.length === 0) || (mapData[0]?.lat?.[0] === defaultCenter.lat && mapData[0]?.lon?.[0] === defaultCenter.lon)) && (
            <Box 
              sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                p: 2, 
                borderRadius: 1,
                textAlign: 'center'
              }}
            >
              <Typography variant="subtitle1">{emptyMessage}</Typography>
            </Box>
          )}
          
          {/* Custom legend if provided */}
          {renderLegend && (
            <Paper
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                p: 1,
                zIndex: 1000,
                width: 150,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              {renderLegend()}
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default MapBox; 