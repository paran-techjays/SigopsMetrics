import React from 'react';
import Plot from 'react-plotly.js';
import chartTitles from '../../constants/mapData';

interface LocationBarChartProps {
  data: any;
  selectedMetric: string;
  height?: number;
  width?: string | number;
  selectedLocation?: string | null;
  onLocationClick?: (location: string) => void;
}

const LocationBarChart: React.FC<LocationBarChartProps> = ({
  data,
  selectedMetric,
  height = 450,
  width = "100%",
  selectedLocation,
  onLocationClick
}) => {
  const getAxisTitle = () => {
    switch (selectedMetric) {
      case "throughput":
        return "Throughput (vph)";
      case "arrivalsOnGreen":
        return "Arrivals on Green";
      default:
        return "Value";
    }
  };

  const getDtick = () => {
    switch (selectedMetric) {
      case "throughput": return 500;
      case "arrivalsOnGreen": return 0.2;
      case "progressionRatio": return 0.5;
      case "spillbackRatio": return 0.2;
      case "peakPeriodSplitFailures": return 0.1;
      case "offPeakSplitFailures": return 0.05;
      case "travelTimeIndex": return 0.2;
      case "planningTimeIndex": return 0.5;
      default: return undefined;
    }
  };

  const getTickFormat = () => {
    if (["arrivalsOnGreen", "spillbackRatio", "peakPeriodSplitFailures", "offPeakSplitFailures"].includes(selectedMetric)) {
      return '.1%';
    }
    return undefined;
  };

  const getRange = () => {
    if (selectedMetric === "travelTimeIndex") {
      return [1, 2.2];
    } else if (selectedMetric === "planningTimeIndex") {
      return [1, 3];
    }
    return undefined;
  };

  const getAutorange = () => {
    return !["travelTimeIndex", "planningTimeIndex"].includes(selectedMetric);
  };

  // Modify the data to include different colors for selected location
  const plotData = {
    ...data,
    marker: {
      ...data.marker,
    },
    width: Array(data.y.length).fill(0.8)  // Set bar width to 0.8 for all bars
  };

  const handleClick = (event: any) => {
    if (event.points && event.points[0] && onLocationClick) {
      onLocationClick(event.points[0].y);
    }
  };

  return (
    <Plot
      data={[plotData]}
      layout={{
        autosize: true,
        height: Math.max(height, data.y.length * 10), // Adjust height based on number of locations
        margin: { l: 150, r: 10, t: 10, b: 50 },
        yaxis: {
          title: "",
          automargin: true,
          tickfont: { size: 10 },
          tickmode: "array",
          ticktext: data.y,
          tickvals: data.y,
          showticklabels: true,
          side: "left",
          fixedrange: true
        },
        xaxis: {
          title: {
            text: chartTitles[selectedMetric as keyof typeof chartTitles]["locationBarChartTitle"],
            standoff: 40,
          },
          dtick: getDtick(),
          tickformat: getTickFormat(),
          range: getRange(),
          autorange: getAutorange(),
          fixedrange: true
        },
        bargap: 0.15,
        showlegend: false,
        plot_bgcolor: "white",
        paper_bgcolor: "white"
      }}
      config={{
        displayModeBar: false,
        scrollZoom: false
      }}
      style={{ 
        width, 
        height: "100%",
        minHeight: "200px",
        overflowY: "auto",
        overflowX: "hidden"
      }}
      onClick={handleClick}
    />
  );
};

export default LocationBarChart; 