# Components

## MapBox

A reusable component for displaying interactive maps using Plotly's scattermapbox.

### Usage

```tsx
import MapBox from "../components/MapBox";

// Example 1: Basic usage with point data
const MyMap = () => {
  const mapData = [
    { lat: 33.749, lon: -84.388, value: 5000, name: "Point 1" },
    { lat: 33.779, lon: -84.408, value: 3000, name: "Point 2" },
  ];

  return (
    <MapBox 
      data={mapData}
      height={400}
      width="100%"
    />
  );
};

// Example 2: Using raw traces for more customization
const MyCustomMap = () => {
  const mapTraces = [
    {
      type: "scattermapbox",
      lat: [33.749, 33.779],
      lon: [-84.388, -84.408],
      mode: "markers",
      marker: {
        size: [10, 15],
        color: ["#ff0000", "#0000ff"],
        opacity: 0.8
      },
      text: ["Point 1", "Point 2"],
      hoverinfo: "text",
      name: "Custom Points"
    }
  ];

  return (
    <MapBox 
      data={mapTraces}
      isRawTraces={true}
      height={500}
      center={{ lat: 33.76, lon: -84.39 }}
      zoom={12}
    />
  );
};

// Example 3: With custom legend
const MapWithLegend = () => {
  const renderLegend = () => (
    <>
      <Typography variant="subtitle2" gutterBottom>
        Traffic Volume
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
        <Box sx={{ width: 16, height: 16, bgcolor: "#93c5fd", mr: 1 }} />
        <Typography variant="caption">0 - 5,000</Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
        <Box sx={{ width: 16, height: 16, bgcolor: "#60a5fa", mr: 1 }} />
        <Typography variant="caption">5,001 - 10,000</Typography>
      </Box>
    </>
  );

  return (
    <MapBox 
      data={mapData}
      renderLegend={renderLegend}
    />
  );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `MapPoint[] \| MapTrace[]` | Required | The data points or raw traces to display on the map |
| isRawTraces | boolean | false | Set to true if providing raw MapTrace objects instead of MapPoint objects |
| loading | boolean | false | Whether to show loading indicator |
| center | { lat: number, lon: number } | { lat: 33.789, lon: -84.388 } | Center coordinates of the map |
| zoom | number | 11 | Initial zoom level |
| height | string \| number | "100%" | Height of the map container |
| width | string \| number | "100%" | Width of the map container |
| mapStyle | string | "carto-positron" | Mapbox style to use |
| showLegend | boolean | true | Whether to show the Plotly legend |
| showControls | boolean | true | Whether to show map controls |
| emptyMessage | string | "No map data available for this selection" | Message to display when no data is available |
| renderLegend | () => React.ReactNode | undefined | Function to render a custom legend |
| mapOptions | any | {} | Additional options to pass to Plotly's config |

### Interfaces

```tsx
interface MapPoint {
  lat: number;
  lon: number;
  value: number;
  name?: string;
  signalID?: string;
  mainStreet?: string;
  sideStreet?: string;
  [key: string]: any;
}

interface MapTrace {
  type: "scattermapbox";
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
  [key: string]: any;
}
``` 